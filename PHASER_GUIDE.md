# Phaser.js 3 Framework Guide for Racing Game

A comprehensive guide to understanding Phaser.js concepts with specific examples for our racing game implementation.

---

## Table of Contents

1. [What is Phaser.js?](#what-is-phaserjs)
2. [Core Concepts](#core-concepts)
3. [Game Configuration](#game-configuration)
4. [Scene Lifecycle](#scene-lifecycle)
5. [Game Objects & Sprites](#game-objects--sprites)
6. [Physics System](#physics-system)
7. [Input Handling](#input-handling)
8. [Collision Detection](#collision-detection)
9. [TileSprites for Scrolling](#tilesprites-for-scrolling)
10. [Audio System](#audio-system)
11. [Mobile Support](#mobile-support)
12. [Code Examples for Our Game](#code-examples-for-our-game)

---

## What is Phaser.js?

Phaser is a **fast, free, and fun** open-source HTML5 game framework that offers WebGL and Canvas rendering across desktop and mobile browsers. It's specifically designed for 2D games and provides:

- **Scene Management** - Organize game states (menu, gameplay, game over)
- **Physics Engines** - Arcade, Matter.js, and Impact physics
- **Asset Loading** - Images, audio, spritesheets, tilemaps
- **Input Handling** - Keyboard, mouse, touch, gamepad
- **Animation System** - Tweens, sprite animations, timelines
- **Sound Management** - Web Audio with fallbacks

**Why Phaser for our racing game?**
- Perfect for 2D top-down games
- Built-in Arcade Physics (lightweight, fast)
- Excellent TypeScript support
- Large community and resources
- Mobile-ready out of the box

---

## Core Concepts

### 1. Game Instance

The main Phaser game object that controls everything:

```typescript
import Phaser from 'phaser';

const game = new Phaser.Game(config);
```

### 2. Scenes

Scenes are like different "screens" or states in your game:
- **MenuScene** - Start menu
- **GameScene** - Main gameplay
- **GameOverScene** - Results screen

Each scene has its own lifecycle and can be started, stopped, paused, and resumed.

### 3. Game Objects

Everything visible in the game:
- Sprites (images with physics)
- Graphics (shapes drawn with code)
- TileSprites (repeating textures)
- Text
- Containers (group multiple objects)

### 4. Groups

Collections of game objects for efficient management:
- **Static Groups** - Non-moving objects (trees, barriers)
- **Dynamic Groups** - Moving objects (enemy cars, fuel pickups)
- Automatically handles creation, recycling, and collision

---

## Game Configuration

### Basic Configuration

```typescript
// app/game/config.ts
import Phaser from 'phaser';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO, // Use WebGL if available, fallback to Canvas
  width: 800,
  height: 600,
  parent: 'game-container', // DOM element ID
  backgroundColor: '#000000',

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // Top-down game, no gravity
      debug: false // Set to true for collision boxes
    }
  },

  scene: [PreloadScene, MenuScene, GameScene, GameOverScene],

  scale: {
    mode: Phaser.Scale.FIT, // Scale to fit screen
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};
```

### Mobile-Responsive Configuration

```typescript
export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE, // Resize dynamically
    parent: 'game-container',
    width: '100%',
    height: '100%',
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};
```

**For our racing game:**
- Fixed aspect ratio (9:16 portrait for mobile)
- Fit mode to maintain proportions
- Touch input enabled by default

---

## Scene Lifecycle

Every Phaser scene has these lifecycle methods:

### Complete Scene Structure

```typescript
export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  /**
   * 1. init() - First method called
   * Use: Initialize variables, receive data from previous scene
   */
  init(data: any): void {
    console.log('Scene initialized with data:', data);
    this.score = data.score || 0;
  }

  /**
   * 2. preload() - Load assets
   * Use: Load images, audio, spritesheets
   */
  preload(): void {
    this.load.image('player', '/assets/images/player-car.png');
    this.load.image('enemy', '/assets/images/enemy-car.png');
    this.load.audio('engine', '/assets/audio/engine.mp3');
  }

  /**
   * 3. create() - Build the scene
   * Use: Create game objects, setup physics, add listeners
   */
  create(): void {
    // Create sprites
    this.player = this.physics.add.sprite(400, 500, 'player');

    // Setup input
    this.cursors = this.input.keyboard.createCursorKeys();

    // Add collisions
    this.physics.add.collider(this.player, this.enemies);
  }

  /**
   * 4. update() - Game loop (called every frame ~60fps)
   * Use: Handle movement, check conditions, update UI
   */
  update(time: number, delta: number): void {
    // time: total time since game start (ms)
    // delta: time since last frame (ms)

    if (this.cursors.left.isDown) {
      this.player.x -= 5;
    }
  }
}
```

### Scene Flow Diagram

```
┌─────────────┐
│   init()    │ ← Scene starts, variables initialized
└──────┬──────┘
       │
┌──────▼──────┐
│  preload()  │ ← Assets loaded (shows loading bar)
└──────┬──────┘
       │
┌──────▼──────┐
│   create()  │ ← Game objects created, setup complete
└──────┬──────┘
       │
┌──────▼──────┐
│   update()  │ ← Called every frame (game loop)
│      ↑      │
└──────┘──────┘
```

### Switching Scenes

```typescript
// Start a new scene (stops current scene)
this.scene.start('GameScene', { level: 1 });

// Launch scene parallel (both run simultaneously)
this.scene.launch('HUDScene');

// Pause current scene
this.scene.pause();

// Resume paused scene
this.scene.resume();

// Stop and remove scene
this.scene.stop('GameScene');
```

---

## Game Objects & Sprites

### Creating Sprites

```typescript
// Basic sprite (no physics)
const car = this.add.sprite(x, y, 'car-key');

// Physics sprite (Arcade Physics enabled)
const player = this.physics.add.sprite(x, y, 'player');
```

### Sprite Properties

```typescript
// Position
player.x = 400;
player.y = 300;
player.setPosition(400, 300);

// Size
player.displayWidth = 50;
player.displayHeight = 100;
player.setScale(0.5); // 50% scale

// Rotation
player.angle = 45; // degrees
player.rotation = Math.PI / 4; // radians

// Visibility
player.visible = true;
player.alpha = 0.5; // 50% opacity

// Origin (anchor point)
player.setOrigin(0.5, 0.5); // center (default)
player.setOrigin(0, 0); // top-left corner
```

### Creating Custom Sprite Classes

```typescript
// app/game/objects/PlayerCar.ts
export class PlayerCar extends Phaser.Physics.Arcade.Sprite {
  private speed: number = 0;
  private maxSpeed: number = 250;
  private acceleration: number = 2;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player-car');

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Setup physics
    this.setCollideWorldBounds(true);
    this.setOrigin(0.5, 0.5);
  }

  accelerate(): void {
    this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
  }

  brake(): void {
    this.speed = Math.max(this.speed - this.acceleration * 2, 0);
  }

  update(): void {
    // Auto-deceleration when no input
    if (this.speed > 0) {
      this.speed -= 0.5;
    }
  }
}
```

**Using the custom class:**

```typescript
// In GameScene.create()
this.player = new PlayerCar(this, 400, 500);

// In GameScene.update()
this.player.update();
```

---

## Physics System

Phaser includes three physics engines:
1. **Arcade Physics** ← We'll use this (simple, fast)
2. Matter.js (realistic physics)
3. Impact (for slopes/tiles)

### Arcade Physics Basics

```typescript
// Enable physics on sprite
const sprite = this.physics.add.sprite(x, y, 'key');

// Physics properties
sprite.setVelocity(100, 200); // x, y velocity (pixels/second)
sprite.setVelocityX(100);
sprite.setVelocityY(200);
sprite.setAcceleration(50, 0);
sprite.setDrag(100); // Friction/deceleration
sprite.setMaxVelocity(300); // Speed limit

// Collision settings
sprite.setCollideWorldBounds(true); // Can't leave game area
sprite.setBounce(0.5); // Bounciness (0-1)
sprite.setImmovable(true); // Won't be pushed by collisions

// Body properties
sprite.body.velocity.x = 100;
sprite.body.acceleration.y = 50;
sprite.body.angularVelocity = 45; // Rotation speed
```

### Movement Patterns

**Constant velocity (enemy cars):**
```typescript
enemyCar.setVelocityY(200); // Move down at constant speed
```

**Acceleration-based (player car):**
```typescript
if (cursors.up.isDown) {
  player.setAccelerationY(-200);
} else {
  player.setAccelerationY(0);
  player.setDrag(100); // Slow down gradually
}
```

**Manual position update:**
```typescript
// In update() method
player.y += this.playerSpeed * (delta / 1000);
```

---

## Input Handling

### Keyboard Input

```typescript
// Method 1: Cursor keys
this.cursors = this.input.keyboard.createCursorKeys();

if (this.cursors.left.isDown) {
  // Left arrow pressed
}

if (this.cursors.up.isDown) {
  // Up arrow pressed
}

// Method 2: Custom keys
this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

if (this.keyW.isDown) {
  // W key pressed
}

// Method 3: Key events
this.input.keyboard.on('keydown-SPACE', () => {
  console.log('Spacebar pressed!');
});
```

### Touch Input (Mobile)

```typescript
// Virtual buttons for mobile
this.leftButton = this.add.rectangle(100, 500, 80, 80, 0xff0000, 0.5)
  .setInteractive()
  .on('pointerdown', () => {
    this.moveLeft = true;
  })
  .on('pointerup', () => {
    this.moveLeft = false;
  });

// Swipe detection
this.input.on('pointerdown', (pointer) => {
  this.startX = pointer.x;
});

this.input.on('pointerup', (pointer) => {
  const distance = pointer.x - this.startX;
  if (distance > 50) {
    // Swiped right
  } else if (distance < -50) {
    // Swiped left
  }
});
```

### Gamepad Support

```typescript
// Check for gamepad
if (this.input.gamepad.total) {
  const pad = this.input.gamepad.getPad(0);

  if (pad.left) {
    // D-pad left
  }

  // Analog stick
  const axisX = pad.leftStick.x;
  if (Math.abs(axisX) > 0.1) {
    player.x += axisX * 5;
  }
}
```

---

## Collision Detection

### Basic Collision Setup

```typescript
// Create groups
this.player = this.physics.add.sprite(400, 500, 'player');
this.enemies = this.physics.add.group();

// Add collision
this.physics.add.collider(
  this.player,
  this.enemies,
  this.handleCollision, // Callback function
  null,
  this
);
```

### Collision Callback

```typescript
handleCollision(
  player: Phaser.Physics.Arcade.Sprite,
  enemy: Phaser.Physics.Arcade.Sprite
): void {
  console.log('Player hit enemy!');

  // Reduce speed
  this.playerSpeed *= 0.5;

  // Play sound
  this.sound.play('crash');

  // Visual feedback
  this.cameras.main.shake(200, 0.01);

  // Destroy enemy
  enemy.destroy();
}
```

### Overlap Detection (No Physics Separation)

```typescript
// Use overlap for collectibles (don't want physical collision)
this.physics.add.overlap(
  this.player,
  this.fuelPickups,
  this.collectFuel,
  null,
  this
);

collectFuel(player, fuel): void {
  fuel.destroy();
  this.fuel += 20;
  this.sound.play('pickup');
}
```

### Custom Collision Conditions

```typescript
// Only collide if condition is met
this.physics.add.collider(
  this.player,
  this.enemies,
  this.handleCollision,
  (player, enemy) => {
    // Return true to allow collision, false to ignore
    return !this.invincible;
  },
  this
);
```

### Collision Between Groups

```typescript
// All enemies collide with each other (traffic doesn't overlap)
this.physics.add.collider(this.enemies, this.enemies);
```

---

## TileSprites for Scrolling

**TileSprites** are perfect for infinite scrolling backgrounds in racing games!

### Creating a TileSprite

```typescript
// Create repeating road texture
this.road = this.add.tileSprite(
  0,        // x position
  0,        // y position
  800,      // width
  600,      // height
  'road'    // texture key
);

this.road.setOrigin(0, 0);
```

### Scrolling the TileSprite

**Method 1: Manual tilePosition update**
```typescript
// In update() method
this.road.tilePositionY -= this.scrollSpeed;

// Adjust scroll speed based on player speed
const scrollSpeed = this.playerSpeed * (delta / 1000);
this.road.tilePositionY += scrollSpeed;
```

**Method 2: Auto-scroll**
```typescript
// Set automatic scrolling
this.road.tilePositionY = 0;

// In create()
this.road.setTileScale(1, 1);

// In update()
this.road.tilePositionY += 2; // Scroll down at 2 pixels/frame
```

### Multiple Layers (Parallax Effect)

```typescript
// Background (slow)
this.grassLayer = this.add.tileSprite(0, 0, 800, 600, 'grass');
this.grassLayer.setOrigin(0, 0);
this.grassLayer.setDepth(0);

// Road (medium)
this.roadLayer = this.add.tileSprite(0, 0, 800, 600, 'road');
this.roadLayer.setOrigin(0, 0);
this.roadLayer.setDepth(1);

// In update()
const baseSpeed = this.playerSpeed * (delta / 1000);
this.grassLayer.tilePositionY += baseSpeed * 0.5; // Half speed
this.roadLayer.tilePositionY += baseSpeed; // Full speed
```

### Example: Road with Lane Markers

```typescript
create() {
  // Main road
  this.road = this.add.tileSprite(400, 300, 400, 600, 'road-texture');
  this.road.setDepth(0);

  // Lane markers
  this.laneMarkers = this.add.tileSprite(400, 300, 10, 600, 'lane-line');
  this.laneMarkers.setDepth(1);
}

update(time, delta) {
  const scrollSpeed = this.playerSpeed * (delta / 1000);

  // Scroll both layers at same speed
  this.road.tilePositionY += scrollSpeed;
  this.laneMarkers.tilePositionY += scrollSpeed;
}
```

---

## Audio System

### Loading Audio

```typescript
preload() {
  this.load.audio('engine', '/assets/audio/engine.mp3');
  this.load.audio('crash', '/assets/audio/crash.mp3');
  this.load.audio('music', '/assets/audio/background-music.mp3');
}
```

### Playing Sounds

```typescript
create() {
  // Simple sound effect
  this.sound.play('crash');

  // With options
  this.sound.play('crash', {
    volume: 0.5,
    rate: 1.0, // Playback speed
    detune: 0,
    loop: false
  });
}
```

### Looping Sounds (Engine, Music)

```typescript
create() {
  // Create sound object
  this.engineSound = this.sound.add('engine', {
    loop: true,
    volume: 0.3
  });

  // Start playing
  this.engineSound.play();

  // Background music
  this.music = this.sound.add('music', {
    loop: true,
    volume: 0.2
  });
  this.music.play();
}
```

### Dynamic Sound (Engine Pitch Based on Speed)

```typescript
update() {
  // Adjust engine pitch based on speed
  const pitchRate = 0.5 + (this.playerSpeed / this.maxSpeed) * 1.5;
  this.engineSound.setRate(pitchRate);

  // Adjust volume based on speed
  const volume = 0.2 + (this.playerSpeed / this.maxSpeed) * 0.5;
  this.engineSound.setVolume(volume);
}
```

### Stopping Sounds

```typescript
// Stop specific sound
this.engineSound.stop();

// Pause (can resume)
this.engineSound.pause();
this.engineSound.resume();

// Stop all sounds
this.sound.stopAll();
```

---

## Mobile Support

### Responsive Scaling

```typescript
const config: Phaser.Types.Core.GameConfig = {
  scale: {
    mode: Phaser.Scale.FIT, // or RESIZE
    parent: 'game-container',
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
    min: {
      width: 320,
      height: 480
    },
    max: {
      width: 1920,
      height: 1080
    }
  }
};
```

### Touch Controls

```typescript
// Virtual joystick (basic)
create() {
  // Left button
  this.leftBtn = this.add.circle(100, 500, 40, 0xff0000, 0.5)
    .setInteractive()
    .setScrollFactor(0) // Fixed on screen
    .on('pointerdown', () => this.moveLeft = true)
    .on('pointerup', () => this.moveLeft = false);

  // Right button
  this.rightBtn = this.add.circle(200, 500, 40, 0x00ff00, 0.5)
    .setInteractive()
    .setScrollFactor(0)
    .on('pointerdown', () => this.moveRight = true)
    .on('pointerup', () => this.moveRight = false);
}

update() {
  if (this.moveLeft) {
    this.player.x -= 5;
  }
  if (this.moveRight) {
    this.player.x += 5;
  }
}
```

### Detecting Mobile Device

```typescript
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

if (isMobile) {
  // Show touch controls
  this.createTouchControls();
} else {
  // Use keyboard
  this.cursors = this.input.keyboard.createCursorKeys();
}
```

---

## Code Examples for Our Game

### Example 1: Game Scene Setup

```typescript
// app/game/scenes/GameScene.ts
export class GameScene extends Phaser.Scene {
  private player!: PlayerCar;
  private enemies!: Phaser.Physics.Arcade.Group;
  private fuelPickups!: Phaser.Physics.Arcade.Group;
  private road!: Phaser.GameObjects.TileSprite;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private playerSpeed: number = 0;
  private maxSpeed: number = 250;
  private fuel: number = 100;
  private score: number = 0;
  private lives: number = 3;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Scrolling road
    this.road = this.add.tileSprite(400, 300, 800, 600, 'road');

    // Player car
    this.player = new PlayerCar(this, 400, 500);

    // Enemy group
    this.enemies = this.physics.add.group({
      classType: EnemyCar,
      maxSize: 10,
      runChildUpdate: true
    });

    // Fuel pickups
    this.fuelPickups = this.physics.add.group();

    // Collisions
    this.setupCollisions();

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();

    // HUD
    this.createHUD();

    // Start spawning enemies
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });
  }

  update(time: number, delta: number): void {
    this.handleInput();
    this.updateScrolling(delta);
    this.updateFuel(delta);
    this.updateScore();
    this.checkGameOver();
  }

  private handleInput(): void {
    if (this.cursors.up.isDown) {
      this.playerSpeed = Math.min(this.playerSpeed + 2, this.maxSpeed);
    } else if (this.cursors.down.isDown) {
      this.playerSpeed = Math.max(this.playerSpeed - 3, 0);
    } else {
      // Auto-deceleration
      this.playerSpeed = Math.max(this.playerSpeed - 1, 0);
    }

    if (this.cursors.left.isDown) {
      this.player.x -= 5;
    } else if (this.cursors.right.isDown) {
      this.player.x += 5;
    }
  }

  private updateScrolling(delta: number): void {
    const scrollSpeed = this.playerSpeed * (delta / 1000);
    this.road.tilePositionY += scrollSpeed;
  }

  private updateFuel(delta: number): void {
    // Deplete 1 fuel per second
    this.fuel -= delta / 1000;
    this.fuel = Math.max(this.fuel, 0);
  }

  private setupCollisions(): void {
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCarCollision,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.fuelPickups,
      this.collectFuel,
      null,
      this
    );
  }

  private spawnEnemy(): void {
    const lane = Phaser.Math.Between(0, 2);
    const x = 300 + (lane * 100);
    const enemy = this.enemies.get(x, -50, 'enemy-car');
    enemy.setActive(true);
    enemy.setVisible(true);
    enemy.setVelocityY(150);
  }
}
```

### Example 2: PlayerCar Class

```typescript
// app/game/objects/PlayerCar.ts
export class PlayerCar extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player-car');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setScale(1);
  }
}
```

### Example 3: Collision with Side Push

```typescript
handleCarCollision(player: PlayerCar, enemy: EnemyCar): void {
  // Reduce life
  this.lives -= 1;

  // Determine push direction
  const pushDirection = player.x < enemy.x ? -1 : 1;

  // Apply sideways push
  player.setVelocityX(pushDirection * 300);

  // Reduce speed
  this.playerSpeed *= 0.5;

  // Visual feedback
  this.cameras.main.shake(200, 0.01);
  this.sound.play('crash');

  // Temporary invincibility
  player.setAlpha(0.5);
  this.time.delayedCall(1000, () => {
    player.setAlpha(1);
  });
}
```

---

## Resources & References

### Official Documentation
- [Phaser 3 Documentation](https://docs.phaser.io/phaser/concepts)
- [Phaser 3 API Docs](https://newdocs.phaser.io/docs/3.70.0)
- [Using Phaser with TypeScript](https://phaser.io/tutorials/how-to-use-phaser-with-typescript)

### Tutorials
- [Making Your First Phaser 3 Game](https://phaser.io/tutorials/making-your-first-phaser-3-game/part6)
- [TileSprites Scrolling Tutorial](https://phaser.io/news/2021/05/tilesprites-continuous-scrolling-tutorial)
- [Phaser 3 TypeScript Tutorial - FreeCodeCamp](https://www.freecodecamp.org/news/how-to-build-a-simple-game-in-the-browser-with-phaser-3-and-typescript-bdc94719135/)
- [Infinitely Scrolling Game - GameDev Academy](https://gamedevacademy.org/how-to-make-an-infinitely-scrolling-game-with-phaser/)

### Physics & Collision
- [Arcade Physics Concepts](https://docs.phaser.io/phaser/concepts/physics/arcade)
- [Collision Detection Tutorial](https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_breakout_game_Phaser/Collision_detection)
- [Handle Collisions with Arcade Physics](https://www.thepolyglotdeveloper.com/2020/08/handle-collisions-between-sprites-phaser-arcade-physics/)

### TypeScript Examples
- [Phaser 3 TypeScript GitHub Repo](https://github.com/digitsensitive/phaser3-typescript)
- [Ourcade Phaser + TypeScript Guide](https://blog.ourcade.co/posts/2020/phaser-3-typescript/)

---

## Quick Reference Cheat Sheet

```typescript
// Scene Management
this.scene.start('SceneKey', { data });
this.scene.pause();
this.scene.resume();

// Sprites
this.add.sprite(x, y, 'key');
this.physics.add.sprite(x, y, 'key');

// Movement
sprite.setVelocity(x, y);
sprite.setAcceleration(x, y);
sprite.x += speed;

// Input
this.cursors = this.input.keyboard.createCursorKeys();
this.cursors.left.isDown

// Collision
this.physics.add.collider(obj1, obj2, callback);
this.physics.add.overlap(obj1, obj2, callback);

// Audio
this.sound.play('key');
this.sound.add('key', { loop: true }).play();

// TileSprite
this.add.tileSprite(x, y, width, height, 'key');
tileSprite.tilePositionY += speed;

// Timers
this.time.delayedCall(1000, callback);
this.time.addEvent({ delay: 1000, callback, loop: true });
```

---

This guide covers all the Phaser.js concepts you'll need for the racing game. Refer back to specific sections as you implement each feature! 🎮
