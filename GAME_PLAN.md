# Phaser.js Road Racer - Implementation Plan

## 🎮 Project Overview

Create a classic arcade-style top-down racing game similar to Road Fighter/Road Runner using Phaser.js 3.90 (latest stable) with TypeScript and Next.js.

---

## 📊 Current State Analysis

### Existing Code
- **Framework**: Next.js 14.2.9 + React 18 + TypeScript
- **Current Implementation**: Basic custom game loop (no Phaser)
  - Simple player car movement (left/right arrows)
  - Basic obstacle spawning
  - Rudimentary score counter
  - No collision detection, physics, or complete game mechanics

### Files to Keep
- ✅ `/app/layout.tsx` - Root layout with Press Start 2P font
- ✅ `/app/globals.css` - Global styles (will need modifications)
- ✅ `/package.json` - Dependency management
- ✅ Build configuration files (tsconfig, next.config, etc.)

### Files to Remove/Replace
- ❌ `/app/components/GameScreen.tsx` - Replace with Phaser game
- ❌ `/app/components/StartScreen.tsx` - Replace with Phaser scenes
- ❌ `/app/fonts/` - Unused Geist fonts
- ❌ `/public/readme` and `/app/public/readme` - Empty placeholders

---

## 🎯 Game Design Specification

### Core Gameplay (Based on Screenshot & Requirements)

#### 1. **Visual Style** ✅ CONFIRMED
- Top-down vertical scrolling perspective
- **MVP: Simple colored rectangles** (player = red, enemies = blue/yellow/green)
- Road = gray rectangle with white dashed center line
- Grass/roadside = green areas on sides
- **Future**: Replace with pixel art sprites

#### 2. **Player Controls** ✅ CONFIRMED

**Desktop (Arrow Keys):**
- **Left/Right**: Steer left/right
- **Up Arrow**: Accelerate (increase speed)
- **Down Arrow**: Brake (decrease speed faster)
- **No input on Up/Down**: Auto-deceleration (car slows down gradually)

**Mobile (Touch Controls):**
- **Left/Right buttons**: On-screen buttons for steering
- **Up/Down buttons**: Virtual buttons for acceleration/braking
- Responsive layout for portrait and landscape modes

#### 3. **Game Mechanics** ✅ CONFIRMED

##### **Scrolling Road**
- Infinite vertical scrolling using TileSprite
- Scroll speed tied to player car speed (0-250 km/h)
- 2-3 lane road with lane markers

##### **Player Car**
- Positioned at bottom-center of screen
- Moves laterally within road boundaries
- **Speed System**:
  - Max speed: **250 km/h**
  - Acceleration: **+2 km/h per frame** when Up arrow held
  - Braking: **-4 km/h per frame** when Down arrow held
  - Auto-deceleration: **-1 km/h per frame** when no input
  - Minimum speed: **0 km/h** (can stop completely)

##### **Lives System** ✅ NEW
- **3 Lives** at start
- Lose 1 life on:
  - Direct collision with enemy car
  - Hitting roadside/grass boundaries
- **Game Over when lives = 0**
- Respawn at same position when life lost (road keeps scrolling, fuel keeps depleting)

##### **Collision Mechanics** ✅ DETAILED

**Enemy Car Collision:**
1. Player loses 1 life
2. Player speed reduced by 50%
3. Player car is **thrown sideways** toward nearest roadside
4. **Velocity applied**: Push player left or right based on collision side
5. **Recovery mechanic**:
   - Press arrow key in **opposite direction** to counteract push
   - If pushed left, press Right arrow to recover
   - If pushed right, press Left arrow to recover
   - If not recovered in time, car hits roadside = another life lost
6. Camera shake + crash sound effect
7. 1-second invincibility (blinking sprite)

**Roadside Collision:**
1. Player loses 1 life
2. Speed reduced to 0
3. Car respawns at center of road
4. Brief invincibility period

**Fuel Pickup Collection:**
- Overlap detection (no physics collision)
- Add fuel to tank
- Destroy pickup sprite
- Play pickup sound

##### **Fuel System** ✅ CONFIRMED
- **Fuel range**: 0-100
- **Depletion rate**: **1 fuel per second** (constant, regardless of speed)
- **Total fuel pickups in race**: **6-8 pickups** placed strategically on road
- **Fuel pickup value**: ~15-20 fuel each
- **Balance**: If driving at max speed (250 km/h) with no crashes and no extra fuel pickups, car should barely complete race
- **Game Over condition**: Fuel reaches 0

#### 4. **Scoring System**
- **Base score**: Distance traveled (1 point per meter)
- **Speed bonus**: Multiplier based on current speed
  - 0-100 km/h: 1x
  - 101-200 km/h: 1.5x
  - 201-250 km/h: 2x
- **Overtake bonus**: +50 points per enemy car passed
- Display: 6-digit score (e.g., 001900)

#### 5. **HUD Display** ✅ CONFIRMED
- **Top-Right Corner**:
  - Player indicator: **"1P"**
  - Score: **6 digits** (e.g., 001900)
  - Speed: **XXX km/h** (e.g., 174 km/h)
  - Fuel gauge: **FUEL XXX** (0-100, e.g., FUEL 073)
  - Lives: **❤️❤️❤️** (3 hearts or "LIVES: 3")

#### 6. **Difficulty Progression** (MVP: Static)
- **MVP**: Fixed difficulty
  - Constant enemy spawn rate
  - Enemy speed range: 80-180 km/h
  - 6-8 fuel pickups total
- **Future**: Progressive difficulty
  - Increase traffic density over time
  - Faster enemy cars
  - Fewer fuel pickups

#### 7. **Race Structure** ✅ NEW
- **Total race distance**: Calculated based on fuel economy
  - At max speed (250 km/h) for 100 seconds (100 fuel) = ~7000 meters
  - With pickups: ~120-140 seconds of driving
- **Win condition**: Survive until fuel depletes naturally or reach finish line
- **Lose condition**: 3 lives lost OR fuel = 0 before finish

---

## 🏗️ Technical Architecture

### Technology Stack

```
Phaser.js 3.90.0          # Latest stable game framework (May 2025)
Next.js 14.2.9            # React framework (for deployment/routing)
TypeScript 5.x            # Type safety
Tailwind CSS 3.4.1        # Styling (minimal, mostly for UI overlays)
```

### Phaser Integration Approach

**Client-Side Only Component** (Required for Next.js compatibility)

```typescript
// app/page.tsx
import dynamic from 'next/dynamic';

const GameComponent = dynamic(() => import('./game/PhaserGame'), {
  ssr: false,
  loading: () => <p>Loading game...</p>
});

export default function Home() {
  return <GameComponent />;
}
```

**Rationale**:
- Phaser requires browser APIs (Canvas, WebGL, Web Audio)
- Next.js SSR runs on server (no DOM/window)
- Dynamic import with `ssr: false` prevents SSR issues
- Game only loads on client-side

---

## 🎮 Phaser.js Implementation Details

### Game Configuration

```typescript
// app/game/config.ts
import Phaser from 'phaser';
import { PreloadScene } from './scenes/PreloadScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO, // WebGL with Canvas fallback
  parent: 'game-container',
  backgroundColor: '#228B22', // Green grass color

  scale: {
    mode: Phaser.Scale.FIT, // Maintain aspect ratio
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,  // Base resolution
    height: 1200, // Portrait orientation for mobile
    min: {
      width: 320,
      height: 480
    },
    max: {
      width: 1920,
      height: 2880
    }
  },

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }, // Top-down, no gravity
      debug: false // Set to true to see collision boxes
    }
  },

  scene: [PreloadScene, MenuScene, GameScene, GameOverScene],

  audio: {
    disableWebAudio: false // Use Web Audio API
  }
};
```

**Key Configuration Choices:**

1. **Portrait Orientation (800x1200)**
   - Mobile-first design
   - Vertical scrolling feels natural
   - More visible road ahead

2. **Arcade Physics**
   - Lightweight (no complex physics needed)
   - AABB collision detection (axis-aligned bounding boxes)
   - Perfect for top-down racing
   - No gravity needed

3. **Scale Mode: FIT**
   - Maintains aspect ratio
   - Scales to fit any screen
   - No distortion
   - Works on mobile + desktop

---

### Scene Architecture

**Phaser Scene Lifecycle:**
```
PreloadScene → MenuScene → GameScene → GameOverScene
     ↓              ↓            ↓            ↓
   Assets       Title Menu   Gameplay    Results
   Loading       + Start      Loop       + Retry
```

#### Scene 1: PreloadScene
**Purpose**: Load all game assets

```typescript
class PreloadScene extends Phaser.Scene {
  preload() {
    // MVP: No external assets (using Graphics API)
    // Future: Load sprites, audio, fonts

    // Loading bar
    const progressBar = this.add.graphics();
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(250, 580, 300 * value, 30);
    });
  }

  create() {
    this.scene.start('MenuScene');
  }
}
```

#### Scene 2: MenuScene
**Purpose**: Start screen with title and instructions

```typescript
class MenuScene extends Phaser.Scene {
  create() {
    // Title
    this.add.text(400, 300, 'ROAD RACER', {
      fontSize: '64px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Instructions
    this.add.text(400, 600, 'Press SPACE to Start', {
      fontSize: '32px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // Scrolling road background (preview)
    this.createScrollingRoad();

    // Input
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });
  }
}
```

#### Scene 3: GameScene (Main Gameplay)
**Purpose**: Core game loop

**Key Components:**
1. **Scrolling Road System** (TileSprite)
2. **Player Car** (Physics Sprite)
3. **Enemy Car Group** (Arcade Group with pooling)
4. **Fuel Pickup Group** (Arcade Group)
5. **Collision Manager** (Arcade Physics overlap/collider)
6. **HUD** (Text + Graphics, setScrollFactor(0) to stay on screen)
7. **Traffic Manager** (Spawn logic with timers)

```typescript
class GameScene extends Phaser.Scene {
  // Game objects
  private road!: Phaser.GameObjects.TileSprite;
  private player!: PlayerCar;
  private enemies!: Phaser.Physics.Arcade.Group;
  private fuelPickups!: Phaser.Physics.Arcade.Group;

  // Game state
  private speed: number = 0; // km/h
  private fuel: number = 100;
  private lives: number = 3;
  private score: number = 0;
  private distance: number = 0; // meters

  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private isMobile: boolean = false;

  create() {
    this.isMobile = this.sys.game.device.os.android ||
                     this.sys.game.device.os.iOS;

    this.createRoad();
    this.createPlayer();
    this.createEnemies();
    this.createFuelPickups();
    this.setupCollisions();
    this.createHUD();
    this.setupInput();
    this.startTrafficSpawner();
    this.placeFuelPickups(); // Place 6-8 pickups strategically
  }

  update(time: number, delta: number) {
    this.handleInput(delta);
    this.updateScrolling(delta);
    this.updateFuel(delta);
    this.updateDistance(delta);
    this.updateScore(delta);
    this.updateHUD();
    this.checkGameOver();
  }
}
```

#### Scene 4: GameOverScene
**Purpose**: Display results and restart option

```typescript
class GameOverScene extends Phaser.Scene {
  init(data: { score: number, distance: number }) {
    this.finalScore = data.score;
    this.finalDistance = data.distance;
  }

  create() {
    // Display results
    // High score comparison
    // Restart button
    // Return to menu button
  }
}
```

---

### Object-Oriented Architecture

#### PlayerCar Class

```typescript
// app/game/objects/PlayerCar.ts
export class PlayerCar extends Phaser.Physics.Arcade.Sprite {
  private invincible: boolean = false;
  private pushVelocity: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player-car');

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics setup
    this.setCollideWorldBounds(true);
    this.setOrigin(0.5, 0.5);
    this.setSize(40, 80); // Collision box

    // MVP: Draw colored rectangle
    this.drawRectangle(0xff0000); // Red
  }

  drawRectangle(color: number): void {
    // Use Phaser Graphics to draw rectangle
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(color, 1);
    graphics.fillRect(-20, -40, 40, 80);
    graphics.generateTexture('player-car', 40, 80);
    graphics.destroy();
    this.setTexture('player-car');
  }

  applyPush(direction: number): void {
    // Apply sideways velocity after collision
    this.pushVelocity = direction * 300;
    this.setVelocityX(this.pushVelocity);
  }

  makeInvincible(duration: number): void {
    this.invincible = true;
    this.setAlpha(0.5);

    // Blinking effect
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.3, to: 0.7 },
      duration: 200,
      repeat: duration / 200,
      onComplete: () => {
        this.invincible = false;
        this.setAlpha(1);
      }
    });
  }

  isInvincible(): boolean {
    return this.invincible;
  }

  update(): void {
    // Gradually reduce sideways push
    if (Math.abs(this.pushVelocity) > 0) {
      this.pushVelocity *= 0.95;
      this.setVelocityX(this.pushVelocity);
    }
  }
}
```

#### EnemyCar Class

```typescript
// app/game/objects/EnemyCar.ts
export class EnemyCar extends Phaser.Physics.Arcade.Sprite {
  private enemySpeed: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy-car');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setSize(40, 80);

    // Random color
    const colors = [0x0000ff, 0xffff00, 0x00ff00]; // Blue, Yellow, Green
    this.drawRectangle(Phaser.Utils.Array.GetRandom(colors));

    // Random speed (80-180 km/h)
    this.enemySpeed = Phaser.Math.Between(80, 180);
  }

  drawRectangle(color: number): void {
    const key = `enemy-car-${color}`;
    if (!this.scene.textures.exists(key)) {
      const graphics = this.scene.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(color, 1);
      graphics.fillRect(-20, -40, 40, 80);
      graphics.generateTexture(key, 40, 80);
      graphics.destroy();
    }
    this.setTexture(key);
  }

  reset(x: number, y: number): void {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.enemySpeed = Phaser.Math.Between(80, 180);
  }

  update(playerSpeed: number, delta: number): void {
    // Move relative to player speed
    const relativeSpeed = (this.enemySpeed - playerSpeed) * (delta / 1000);
    this.y += relativeSpeed * 0.28; // Convert km/h to pixels

    // Destroy if off-screen
    if (this.y > 1300) {
      this.destroy();
    }
  }
}
```

#### TrafficManager Class

```typescript
// app/game/managers/TrafficManager.ts
export class TrafficManager {
  private scene: Phaser.Scene;
  private enemies: Phaser.Physics.Arcade.Group;
  private spawnTimer!: Phaser.Time.TimerEvent;
  private lanes: number[] = [300, 400, 500]; // X positions

  constructor(scene: Phaser.Scene, enemyGroup: Phaser.Physics.Arcade.Group) {
    this.scene = scene;
    this.enemies = enemyGroup;
  }

  startSpawning(): void {
    // Spawn enemy every 2-3 seconds
    this.spawnTimer = this.scene.time.addEvent({
      delay: Phaser.Math.Between(2000, 3000),
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });
  }

  spawnEnemy(): void {
    const lane = Phaser.Utils.Array.GetRandom(this.lanes);
    const enemy = new EnemyCar(this.scene, lane, -100);
    this.enemies.add(enemy);
  }

  stopSpawning(): void {
    this.spawnTimer?.remove();
  }

  update(playerSpeed: number, delta: number): void {
    // Update all enemies
    this.enemies.children.entries.forEach((enemy: any) => {
      enemy.update(playerSpeed, delta);
    });
  }
}
```

---

### Collision System Implementation

**Using Arcade Physics Colliders:**

```typescript
// In GameScene.create()
setupCollisions(): void {
  // Player vs Enemies (overlap, not collide - we handle physics manually)
  this.physics.add.overlap(
    this.player,
    this.enemies,
    this.handleCarCollision,
    (player, enemy) => {
      // Process callback - return false to skip if invincible
      return !this.player.isInvincible();
    },
    this
  );

  // Player vs Fuel Pickups
  this.physics.add.overlap(
    this.player,
    this.fuelPickups,
    this.collectFuel,
    null,
    this
  );

  // Player vs Road Boundaries (manual check in update)
}

handleCarCollision(
  player: PlayerCar,
  enemy: EnemyCar
): void {
  // Lose life
  this.lives -= 1;

  // Reduce speed
  this.speed *= 0.5;

  // Determine push direction
  const pushDirection = player.x < enemy.x ? -1 : 1;
  player.applyPush(pushDirection);

  // Make invincible
  player.makeInvincible(1000);

  // Visual feedback
  this.cameras.main.shake(200, 0.01);

  // Audio
  this.sound.play('crash');

  // Check if game over
  if (this.lives === 0) {
    this.gameOver();
  }
}

collectFuel(player: PlayerCar, fuelPickup: Phaser.Physics.Arcade.Sprite): void {
  fuelPickup.destroy();
  this.fuel = Math.min(this.fuel + 15, 100);
  this.sound.play('pickup');
}
```

---

### Mobile Touch Controls

```typescript
// In GameScene.create()
createTouchControls(): void {
  // Left button
  const leftBtn = this.add.circle(100, 1100, 50, 0xff0000, 0.5);
  leftBtn.setInteractive();
  leftBtn.setScrollFactor(0);
  leftBtn.on('pointerdown', () => this.moveLeft = true);
  leftBtn.on('pointerup', () => this.moveLeft = false);

  // Right button
  const rightBtn = this.add.circle(220, 1100, 50, 0x00ff00, 0.5);
  rightBtn.setInteractive();
  rightBtn.setScrollFactor(0);
  rightBtn.on('pointerdown', () => this.moveRight = true);
  rightBtn.on('pointerup', () => this.moveRight = false);

  // Up button (accelerate)
  const upBtn = this.add.circle(700, 1000, 50, 0x0000ff, 0.5);
  upBtn.setInteractive();
  upBtn.setScrollFactor(0);
  upBtn.on('pointerdown', () => this.accelerate = true);
  upBtn.on('pointerup', () => this.accelerate = false);

  // Down button (brake)
  const downBtn = this.add.circle(700, 1100, 50, 0xffff00, 0.5);
  downBtn.setInteractive();
  downBtn.setScrollFactor(0);
  downBtn.on('pointerdown', () => this.brake = true);
  downBtn.on('pointerup', () => this.brake = false);
}
```

### Project Structure

```
cursor-racer/
├── app/
│   ├── page.tsx                    # Main entry with game wrapper
│   ├── layout.tsx                  # Root layout (keep existing)
│   ├── globals.css                 # Global styles (modify)
│   └── game/
│       ├── PhaserGame.tsx          # React wrapper for Phaser
│       ├── config.ts               # Phaser game configuration
│       ├── scenes/
│       │   ├── PreloadScene.ts     # Asset loading
│       │   ├── MenuScene.ts        # Start menu
│       │   ├── GameScene.ts        # Main gameplay
│       │   └── GameOverScene.ts    # Game over screen
│       ├── objects/
│       │   ├── PlayerCar.ts        # Player car class
│       │   ├── EnemyCar.ts         # Enemy car class
│       │   ├── Road.ts             # Scrolling road
│       │   └── FuelPickup.ts       # Fuel collectible
│       ├── managers/
│       │   ├── TrafficManager.ts   # Enemy spawning logic
│       │   ├── ScoreManager.ts     # Score tracking
│       │   └── CollisionManager.ts # Collision detection
│       └── constants/
│           ├── GameConfig.ts       # Game constants
│           └── AssetKeys.ts        # Asset reference keys
├── public/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── player-car.png
│   │   │   ├── enemy-car-*.png
│   │   │   ├── road-tile.png
│   │   │   ├── grass-tile.png
│   │   │   ├── lane-line.png
│   │   │   └── fuel-icon.png
│   │   ├── audio/
│   │   │   ├── engine.mp3
│   │   │   ├── crash.mp3
│   │   │   ├── overtake.mp3
│   │   │   └── fuel-pickup.mp3
│   │   └── fonts/
│   │       └── press-start-2p.xml  # Bitmap font (if needed)
├── package.json
└── tsconfig.json
```

---

## 🎨 Asset Requirements

### MVP: Graphics API (No External Assets) ✅ CONFIRMED

**All visuals created programmatically using Phaser's Graphics API:**

#### Visual Elements
1. **Player Car**: 40x80px red rectangle (`0xff0000`)
2. **Enemy Cars**: 40x80px colored rectangles
   - Blue: `0x0000ff`
   - Yellow: `0xffff00`
   - Green: `0x00ff00`
3. **Road**: Gray TileSprite (`0x808080`)
4. **Lane Markings**: White dashed lines (`0xffffff`)
5. **Grass/Roadside**: Green rectangles (`0x228B22`)
6. **Fuel Pickup**: 30x30px yellow rectangle or circle (`0xffff00`)

#### HUD Elements
- **Text rendering**: Phaser's built-in text (monospace font or system font)
- **Fuel gauge**: Rectangle graphics (border + fill)
- **Lives display**: Circle or heart-shaped graphics

**Code Example:**
```typescript
// Creating rectangle sprites programmatically
const graphics = this.make.graphics({ x: 0, y: 0 });
graphics.fillStyle(0xff0000, 1);
graphics.fillRect(0, 0, 40, 80);
graphics.generateTexture('player-car', 40, 80);
graphics.destroy();
```

### Audio Assets ✅ CONFIRMED

**Basic audio required for MVP:**

1. **Engine Loop**: Low hum that changes pitch with speed
2. **Crash SFX**: Short impact sound
3. **Fuel Pickup SFX**: Positive "bleep" sound
4. **Background Music** (Optional): Simple 8-bit loop

**Audio Sources:**
- [Freesound.org](https://freesound.org) - Free sound effects
- [OpenGameArt.org](https://opengameart.org) - CC0 game audio
- Placeholder: Can start without audio and add later

### Future: Pixel Art Sprites

**Post-MVP visual upgrade:**
- Replace rectangles with pixel art sprites
- Add animations (wheels rotating, exhaust smoke)
- Sprite sheets for explosions and effects
- Custom retro font

---

## 📝 Implementation Phases

### Phase 1: Project Setup & Dependencies (1-2 hours)
- [ ] Install Phaser.js 3.90.0
- [ ] Set up TypeScript types for Phaser
- [ ] Configure Next.js for client-side Phaser rendering
- [ ] Create basic project structure
- [ ] Remove old game components

**Deliverable**: Empty Phaser game boots in Next.js

---

### Phase 2: Core Game Scenes (2-3 hours)

#### 2.1 PreloadScene
- [ ] Load all game assets
- [ ] Display loading progress bar
- [ ] Transition to MenuScene when complete

#### 2.2 MenuScene
- [ ] Display game title
- [ ] "Press SPACE to Start" text
- [ ] Background animation (scrolling road preview)
- [ ] Keyboard input to start game

#### 2.3 GameScene - Basic Setup
- [ ] Initialize game world
- [ ] Set up camera bounds
- [ ] Create HUD container

**Deliverable**: Scene navigation works

---

### Phase 3: Road & Scrolling (2-3 hours)
- [ ] Create infinite scrolling road system
  - Tiled sprite or repeating tiles
  - Lane markers (center white dashed lines)
  - Grass/vegetation on sides
- [ ] Implement parallax scrolling for depth
- [ ] Speed-based scroll rate
- [ ] Road boundary collision zones

**Deliverable**: Scrolling road that responds to speed

---

### Phase 4: Player Car (2-3 hours)
- [ ] Create PlayerCar class extending Phaser.Sprite
- [ ] Implement physics body
- [ ] Keyboard controls:
  - [ ] Left/Right arrow keys for steering
  - [ ] Up/Down for acceleration/braking
- [ ] Speed management (0-250 km/h range)
- [ ] Constraint to road boundaries
- [ ] Visual feedback (tilt sprite when turning)
- [ ] Engine sound effect

**Deliverable**: Controllable player car with physics

---

### Phase 5: Enemy Traffic System (3-4 hours)
- [ ] Create EnemyCar class
- [ ] TrafficManager for spawning logic:
  - [ ] Random lane selection
  - [ ] Random speed variation (80-180 km/h)
  - [ ] Spawn rate based on difficulty
  - [ ] Despawn when off-screen
- [ ] Multiple car types/colors
- [ ] Realistic traffic patterns:
  - [ ] Lane-keeping behavior
  - [ ] Speed consistency
  - [ ] No overlap spawning

**Deliverable**: Dynamic traffic spawning and movement

---

### Phase 6: Collision System (2-3 hours)
- [ ] CollisionManager setup
- [ ] Player vs Enemy collision:
  - [ ] Reduce speed on impact
  - [ ] Visual/audio feedback
  - [ ] Temporary invincibility after crash
- [ ] Player vs Road boundary:
  - [ ] Crash effect
  - [ ] Game over trigger
- [ ] Collision physics (realistic bounce)
- [ ] Crash sound effects

**Deliverable**: Full collision detection and response

---

### Phase 7: Fuel System (1-2 hours)
- [ ] Fuel gauge in HUD (0-100)
- [ ] Fuel depletion over time
  - Faster at higher speeds
- [ ] FuelPickup sprite class
- [ ] Random fuel spawning on road
- [ ] Collection detection
- [ ] Game over when fuel = 0

**Deliverable**: Working fuel mechanic

---

### Phase 8: Scoring & HUD (2 hours)
- [ ] ScoreManager implementation
- [ ] Score calculations:
  - [ ] Distance points
  - [ ] Overtake bonuses
  - [ ] Speed multipliers
- [ ] HUD display:
  - [ ] Score counter (top-right)
  - [ ] Speed indicator (km/h)
  - [ ] Fuel gauge
  - [ ] Player label (1P)
- [ ] High score persistence (localStorage)

**Deliverable**: Complete HUD with all game stats

---

### Phase 9: Game Over & Restart (1-2 hours)
- [ ] GameOverScene implementation
- [ ] Display final score
- [ ] High score comparison
- [ ] "Play Again" option
- [ ] Return to menu option
- [ ] Game over triggers:
  - [ ] Fuel depleted
  - [ ] Off-road crash
  - [ ] (Optional) Health/lives system

**Deliverable**: Complete game loop

---

### Phase 10: Polish & Difficulty Progression (2-3 hours)
- [ ] Difficulty scaling:
  - [ ] Increase traffic density over time
  - [ ] Faster enemy cars
  - [ ] More fuel consumption
- [ ] Visual polish:
  - [ ] Particle effects (dust, smoke)
  - [ ] Screen shake on collision
  - [ ] Speed lines/motion blur
- [ ] Audio mixing
- [ ] Performance optimization
- [ ] Mobile responsiveness (if needed)

**Deliverable**: Polished, balanced game

---

### Phase 11: Testing & Deployment (1-2 hours)
- [ ] Cross-browser testing
- [ ] Performance profiling
- [ ] Bug fixes
- [ ] Build optimization
- [ ] Vercel deployment
- [ ] Update README

**Deliverable**: Production-ready game

---

## 🔧 Key Technical Decisions

### 1. Physics Engine
**Choice**: Phaser Arcade Physics
- Lightweight
- Perfect for 2D top-down games
- Simple AABB collision detection
- Good performance

### 2. Asset Loading Strategy
**Phase 1**: Use Phaser Graphics API (colored rectangles)
- Rapid prototyping
- No external asset dependencies
- Easy to replace later

**Phase 2**: Add pixel art assets
- Better visual appeal
- Maintain retro aesthetic

### 3. State Management
**Use Phaser's Scene Data**:
```typescript
this.scene.start('GameScene', { score: 1000, level: 2 })
```
- No need for external state libraries
- Phaser handles scene transitions
- Pass data between scenes easily

### 4. Responsive Design
**Fixed Game Dimensions with Scaling**:
```typescript
scale: {
  mode: Phaser.Scale.FIT,
  autoCenter: Phaser.Scale.CENTER_BOTH,
  width: 800,
  height: 600
}
```
- Maintains aspect ratio
- Works on different screen sizes
- Prevents layout issues

---

## 🚀 Alternative Approaches Considered

### Approach A: Pure Phaser (No Next.js)
**Pros**: Simpler setup, no SSR issues
**Cons**: Lose Next.js routing, harder deployment, no React ecosystem

### Approach B: Phaser + Vite
**Pros**: Faster builds, simpler config
**Cons**: Need to migrate entire project, lose existing Next.js setup

### Approach C: Keep Custom Canvas Game
**Pros**: No new dependencies
**Cons**: Reinventing the wheel, missing Phaser's features (physics, scenes, asset loader, tweens, particles)

**✅ RECOMMENDED: Phaser + Next.js (Current Plan)**
- Best of both worlds
- Leverages existing infrastructure
- Industry-standard game framework
- Excellent TypeScript support

---

## 📦 Dependencies to Add

```json
{
  "dependencies": {
    "phaser": "^3.90.0"
  },
  "devDependencies": {
    "@types/phaser": "^3.90.0"
  }
}
```

---

## 🎯 Success Criteria

### Minimum Viable Product (MVP) ✅ SCOPE CONFIRMED

**Core Gameplay:**
- [ ] Player can control car with arrow keys (up/down for speed, left/right for steering)
- [ ] Auto-deceleration when no input
- [ ] Mobile touch controls work (4 virtual buttons)
- [ ] Enemy cars spawn at random intervals and lanes
- [ ] Enemy cars move relative to player speed
- [ ] 3 lives system implemented
- [ ] Collision detection between player and enemies
- [ ] Sideways push mechanic on collision
- [ ] Recovery mechanic (counter-steer to avoid roadside)
- [ ] Roadside collision detection (lose life, respawn)
- [ ] Invincibility frames after collision (1 second, blinking sprite)

**Fuel System:**
- [ ] Fuel depletes at 1 per second
- [ ] Fuel display on HUD (0-100)
- [ ] 6-8 fuel pickups placed on road
- [ ] Fuel collection adds 15-20 fuel
- [ ] Game over when fuel = 0

**Scoring & HUD:**
- [ ] Distance-based score calculation
- [ ] Speed multiplier bonus
- [ ] Overtake bonus (+50 per car)
- [ ] HUD displays: 1P, Score (6 digits), Speed (km/h), Fuel, Lives
- [ ] High score persistence (localStorage)

**Scenes:**
- [ ] PreloadScene (loading screen)
- [ ] MenuScene (title + start)
- [ ] GameScene (main gameplay)
- [ ] GameOverScene (results + restart)

**Audio:**
- [ ] Engine sound loop (pitch changes with speed)
- [ ] Crash sound effect
- [ ] Fuel pickup sound effect

**Polish:**
- [ ] Camera shake on collision
- [ ] Scrolling road (TileSprite)
- [ ] Responsive scaling (works on mobile + desktop)

### Future Enhancements (Post-MVP)
- [ ] Pixel art sprites (replace rectangles)
- [ ] Progressive difficulty system
- [ ] Power-ups (nitro boost, shield, extra life)
- [ ] Multiple car skins
- [ ] Online leaderboard
- [ ] Gamepad support
- [ ] Background music
- [ ] Particle effects (smoke, sparks)
- [ ] Animated sprites (wheel rotation)
- [ ] More detailed HUD
- [ ] Multiple race tracks
- [ ] Time trial mode

---

## ⚠️ Potential Challenges & Solutions

### Challenge 1: Phaser + Next.js SSR Conflict
**Solution**: Use dynamic imports with `ssr: false`
```typescript
const Game = dynamic(() => import('./game/PhaserGame'), { ssr: false })
```

### Challenge 2: Asset Loading in Next.js Public Folder
**Solution**: Reference assets with absolute paths
```typescript
this.load.image('player', '/assets/images/player-car.png')
```

### Challenge 3: TypeScript Phaser Type Definitions
**Solution**: Install `@types/phaser` and extend Phaser classes properly
```typescript
export class PlayerCar extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player')
  }
}
```

### Challenge 4: Performance with Many Enemy Cars
**Solution**:
- Object pooling for enemy cars
- Limit max active enemies on screen
- Use Phaser's built-in pooling with Groups

---

## 📊 Estimated Timeline

**Total Estimated Time**: 18-25 hours

| Phase | Time | Priority |
|-------|------|----------|
| Setup | 1-2h | Critical |
| Scenes | 2-3h | Critical |
| Road | 2-3h | Critical |
| Player | 2-3h | Critical |
| Traffic | 3-4h | Critical |
| Collision | 2-3h | Critical |
| Fuel | 1-2h | High |
| HUD | 2h | High |
| Game Over | 1-2h | High |
| Polish | 2-3h | Medium |
| Testing | 1-2h | High |

---

## ✅ Design Decisions (CONFIRMED)

All questions have been answered! Here's what we're building:

1. **Asset Style**: ✅ Simple colored rectangles (MVP), pixel art later
2. **Difficulty Curve**: ✅ Static difficulty for MVP (no progression)
3. **Game Over Conditions**: ✅ 3 lives system + fuel depletion
   - Lose life on: car collision OR roadside hit
   - Game over when: lives = 0 OR fuel = 0
4. **Fuel Mechanics**: ✅ Fully specified
   - Scale: 0-100
   - Depletion: 1 per second (constant rate)
   - Pickups: 6-8 total in race (~15-20 fuel each)
   - Balance: Perfect run at max speed barely completes race
5. **Speed Mechanics**: ✅ Manual control with auto-deceleration
   - Up arrow: Accelerate
   - Down arrow: Brake (faster deceleration)
   - No input: Gradual slowdown
6. **Scope**: ✅ MVP first
   - Core gameplay only
   - Audio included (basic SFX)
   - Polish features deferred
7. **Mobile Support**: ✅ Required
   - Touch controls (virtual buttons)
   - Responsive layout
8. **Collision Recovery**: ✅ Advanced mechanic
   - Car pushed sideways on collision
   - Player must press opposite arrow to recover
   - If not recovered → roadside crash → lose another life

**No open questions remaining - ready for implementation!** 🚀

---

## 📚 References

- [Phaser 3.90 Documentation](https://phaser.io/download/stable)
- [Phaser + TypeScript Tutorial](https://phaser.io/tutorials/how-to-use-phaser-with-typescript)
- [Phaser Examples](https://phaser.io/examples)
- Classic Road Fighter NES gameplay for reference

---

## 📋 Implementation Summary

### What We're Building

A **classic top-down racing game** inspired by Road Fighter/Road Runner, built with:
- **Phaser.js 3.90.0** for game engine
- **Next.js 14** for deployment framework
- **TypeScript** for type safety
- **Mobile-first** responsive design

### Key Features

1. **Lives System**: 3 lives, lose on collision or roadside crash
2. **Fuel Economy**: 100 fuel, depletes 1/second, collect pickups
3. **Speed Control**: Manual acceleration/braking with auto-slowdown
4. **Collision Physics**: Sideways push with recovery mechanic
5. **Mobile Support**: Touch controls with virtual buttons
6. **Scoring**: Distance + speed bonuses + overtake rewards

### Technical Highlights

- **Scene-based architecture** (Preload → Menu → Game → GameOver)
- **Arcade Physics** for lightweight collision detection
- **Object pooling** for efficient enemy management
- **TileSprite scrolling** for infinite road
- **Graphics API** for MVP (no external assets needed)
- **Responsive scaling** (portrait-first: 800x1200)

### Development Approach

**MVP-First Strategy:**
1. Build core gameplay with simple rectangles
2. Implement all mechanics (lives, fuel, collisions, scoring)
3. Add basic audio (engine, crash, pickup)
4. Ensure mobile compatibility
5. Polish → Future: Add pixel art, animations, advanced features

### Estimated Timeline

- **Setup & Configuration**: 1-2 hours
- **Core Gameplay**: 10-12 hours
- **Audio & Polish**: 2-3 hours
- **Testing & Deployment**: 2-3 hours
- **Total**: ~15-20 hours for MVP

---

## Next Steps

### ✅ Completed
- [x] Gather requirements
- [x] Research Phaser.js latest version
- [x] Answer all design questions
- [x] Create comprehensive implementation plan
- [x] Document Phaser.js architecture
- [x] Create learning guide (PHASER_GUIDE.md)

### 🚀 Ready to Implement!

**When approved, we'll proceed with:**
1. **Phase 1**: Install Phaser, configure Next.js integration
2. **Phase 2**: Build scene structure (Preload, Menu, Game, GameOver)
3. **Phase 3**: Implement scrolling road system
4. **Phase 4**: Create player car with controls
5. **Phase 5**: Add enemy traffic spawning
6. **Phase 6**: Implement collision system (with push mechanic)
7. **Phase 7**: Build fuel system (depletion + pickups)
8. **Phase 8**: Create HUD and scoring
9. **Phase 9**: Add game over and restart flow
10. **Phase 10**: Integrate audio
11. **Phase 11**: Test on mobile, optimize, deploy

**All design decisions are finalized - ready to start coding!** 🎮🏁

---

## Additional Resources

- **PHASER_GUIDE.md**: Complete Phaser.js learning guide with examples
- **GAME_PLAN.md** (this file): Full implementation plan
- [Phaser 3 Official Docs](https://docs.phaser.io)
- [Phaser 3 Examples](https://phaser.io/examples)

Ready when you are! 🚗💨
