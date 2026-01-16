# Cursor Racer Codebase Guide

Welcome! This document gives a newcomer-friendly tour of the Cursor Racer codebase, covering the overall structure, key concepts, and suggested next steps for learning.

## High-level overview

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript.
- **Game engine**: Phaser 3 (client-only).
- **Styling**: Tailwind CSS + custom global utilities.
- **Architecture**: Next.js renders a client-only React component that mounts a Phaser game into the DOM.

## General structure (what lives where)

### 1) App Router entry points

- **`app/layout.tsx`**
  - Defines the HTML shell and global font (Press Start 2P).
  - Sets up Next.js metadata like title and description.
- **`app/page.tsx`**
  - Dynamically imports the Phaser game component with `ssr: false` to avoid server-side rendering issues.
  - Displays a loading screen while Phaser boots.

### 2) Game integration (Phaser + React)

- **`app/game/PhaserGame.tsx`**
  - React wrapper that creates and destroys the Phaser `Game` instance.
  - Mounts Phaser into a container div.
- **`app/game/config.ts`**
  - Central Phaser config (scale, physics, scene list, background, etc.).
- **`app/game/constants/GameConfig.ts`**
  - The single source of truth for tunable values (dimensions, speed, fuel, spawn timing, scoring, colors).

### 3) Scenes (game flow)

Scenes are the game “screens”:

- **`app/game/scenes/PreloadScene.ts`**
  - Loads assets and shows a loading bar.
  - Transitions into the main menu scene.
- **`app/game/scenes/MenuScene.ts`**
  - Title screen with scrolling road background.
  - Starts the game on spacebar or tap.
- **`app/game/scenes/GameScene.ts`**
  - Main gameplay loop: input, player update, scrolling, traffic spawning, HUD, fuel, scoring, collisions, and game-over checks.
- **`app/game/scenes/GameOverScene.ts`**
  - Shows final stats and handles restart/menu actions.
  - Stores high score in localStorage.

### 4) Objects & managers

- **Objects (`app/game/objects/`)**
  - `PlayerCar.ts`: player sprite, invincibility, collision push, road bounds.
  - `EnemyCar.ts`, `FuelPickup.ts`: enemy/pickup behavior.
- **Managers (`app/game/managers/`)**
  - `TrafficManager.ts`: enemy spawn timing and lifecycle.

### 5) Styling

- **`app/globals.css`**
  - Tailwind setup and custom pixel/retro utility classes.
- **`tailwind.config.ts`**
  - Tailwind content globs and theme extensions.

### 6) Assets

- **`public/assets/`** contains sprites used by Phaser (cars, grass, fuel).

## Important things to know

### How the game boots

1. Next.js renders `app/page.tsx`.
2. `PhaserGame` mounts on the client and instantiates Phaser.
3. Phaser starts at `PreloadScene`, then `MenuScene`.
4. `GameScene` runs the core loop.
5. `GameOverScene` displays results and allows restart/menu.

### Key configuration touchpoints

- **Gameplay tuning**: `app/game/constants/GameConfig.ts`.
- **Phaser setup**: `app/game/config.ts`.
- **React/Phaser integration**: `app/game/PhaserGame.tsx`.

### System interactions

- `GameScene` owns the game loop and orchestrates updates for the player, traffic, pickups, HUD, and scoring.
- `TrafficManager` encapsulates enemy spawning and updates, keeping `GameScene` focused on coordination.

## Suggested learning path (what to explore next)

1. **Phaser basics**
   - Read `PHASER_GUIDE.md` to understand Scenes, lifecycle, physics, and input.
2. **Gameplay loop**
   - Step through `GameScene.ts` to see how input, collisions, fuel, HUD, and scoring work together.
3. **Gameplay tuning**
   - Adjust values in `GameConfig.ts` to learn how the game feels at different settings.
4. **Asset pipeline**
   - Add new sprites and preload them in `PreloadScene.ts`.
5. **UI & styling**
   - Use `globals.css` and Tailwind utilities to style menus and overlays.

## Quick start

```bash
npm run dev
```

Then open http://localhost:3000 in a browser.
