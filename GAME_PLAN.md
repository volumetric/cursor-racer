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

### Core Gameplay (Based on Screenshot)

#### 1. **Visual Style**
- Top-down vertical scrolling perspective
- Retro pixel art aesthetic
- Two-lane road with center line markings
- Grass/vegetation on road sides
- Simple geometric car sprites

#### 2. **Player Controls**
- **Arrow Keys**: Left/Right to change lanes/steer
- **Up Arrow**: Accelerate
- **Down Arrow**: Brake/Slow down
- **Spacebar**: (Optional) Nitro boost

#### 3. **Game Mechanics**
- **Scrolling Road**: Infinite vertical scrolling background
- **Player Car**: Bottom-center of screen, moves laterally
- **Enemy Cars**: Spawn from top, move downward at varying speeds
- **Speed System**: Dynamic speed affecting scroll rate
- **Fuel System**: Depletes over time, collect fuel pickups
- **Collision Detection**:
  - Hit enemy car = Slow down + damage
  - Hit roadside = Crash/game over
  - Collect fuel = Refill tank

#### 4. **Scoring System**
- Points for distance traveled
- Bonus points for high speed
- Bonus for overtaking cars
- Multiplier for consecutive overtakes

#### 5. **HUD Display**
- **Top-Right Corner**:
  - Player indicator (1P)
  - Score (6 digits)
  - Speed (km/h)
  - Fuel gauge (0-100)
  - Lives/Health (optional)

#### 6. **Difficulty Progression**
- Gradually increase traffic density
- Faster enemy cars over time
- More fuel consumption at higher levels

---

## 🏗️ Technical Architecture

### Technology Stack

```
Phaser.js 3.90.0          # Latest stable game framework
Next.js 14.2.9            # React framework (for deployment/routing)
TypeScript 5.x            # Type safety
Tailwind CSS 3.4.1        # Styling (minimal, mostly for UI overlays)
```

### Phaser Integration Approach

**Option A: Client-Side Only Component** (Recommended)
```typescript
// Use dynamic import to load Phaser only on client
const GameComponent = dynamic(() => import('./PhaserGame'), { ssr: false })
```

**Rationale**:
- Phaser requires browser APIs (Canvas, WebGL)
- Next.js SSR can't render Phaser
- Dynamic import prevents SSR issues

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

### Visual Assets (Pixel Art Style)

#### Essential Assets
1. **Player Car**: 32x64px red/player color car sprite
2. **Enemy Cars**: 3-4 variants (32x64px each)
   - Different colors: yellow, blue, green
   - Optional: Different car types
3. **Road Texture**: 256x256px tileable asphalt
4. **Grass/Roadside**: 128x128px tileable grass
5. **Lane Markings**: 8x32px white dashed lines
6. **Fuel Pickup**: 24x24px fuel can icon
7. **Trees/Obstacles**: 48x64px (for roadside decoration)

#### HUD Elements
- Number font sprite sheet (0-9)
- Fuel gauge graphics
- Speed indicator graphics

### Audio Assets (Optional)
1. Engine loop sound
2. Crash/collision SFX
3. Fuel pickup SFX
4. Overtake/pass SFX
5. Background music (8-bit style)

### Asset Creation Strategy
- **Option 1**: Use free pixel art assets (OpenGameArt, Kenney.nl)
- **Option 2**: Create simple colored rectangles as placeholders
- **Option 3**: Use Phaser's built-in graphics API for prototyping

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

### Minimum Viable Product (MVP)
- [x] Player can control car with arrow keys
- [x] Enemy cars spawn and move down the screen
- [x] Collision detection works
- [x] Score increases during gameplay
- [x] Fuel system functional
- [x] Game over when fuel runs out or crash
- [x] Restart functionality

### Nice-to-Have Features
- [ ] Sound effects and music
- [ ] Multiple difficulty levels
- [ ] Power-ups (nitro boost, shield)
- [ ] Multiple car skins
- [ ] Leaderboard (online)
- [ ] Mobile touch controls
- [ ] Gamepad support

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

## 🤔 Questions for Discussion

1. **Asset Style**: Should we start with simple colored rectangles (faster prototype) or create/find pixel art assets first?

2. **Difficulty Curve**: Do you prefer gradual difficulty increase or level-based progression?

3. **Game Over Conditions**:
   - Just fuel depletion?
   - Crash = instant game over?
   - Lives/health system (3 hits then game over)?

4. **Fuel Mechanics**:
   - Current screenshot shows "FUEL 073" - is this out of 100?
   - How fast should fuel deplete?
   - How often should fuel pickups appear?

5. **Speed Mechanics**:
   - Should speed be fully manual (player controlled)?
   - Or auto-accelerate with player controlling left/right only?

6. **Scope**:
   - MVP only or include nice-to-have features?
   - Audio required or visual-only for now?

7. **Mobile Support**: Is mobile/touch control needed or desktop-only?

8. **Multiplayer**: Future consideration or single-player only?

---

## 📚 References

- [Phaser 3.90 Documentation](https://phaser.io/download/stable)
- [Phaser + TypeScript Tutorial](https://phaser.io/tutorials/how-to-use-phaser-with-typescript)
- [Phaser Examples](https://phaser.io/examples)
- Classic Road Fighter NES gameplay for reference

---

## Next Steps

1. **Review this plan** and discuss any questions/concerns
2. **Make decisions** on open questions above
3. **Approve approach** or suggest modifications
4. **Begin Phase 1** implementation

Ready to discuss and refine this plan! 🎮
