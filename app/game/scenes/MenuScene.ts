import * as Phaser from 'phaser';
import { GAME_CONFIG } from '../constants/GameConfig';

export class MenuScene extends Phaser.Scene {
  private road!: Phaser.GameObjects.TileSprite;
  private spaceKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const width = GAME_CONFIG.WIDTH;
    const height = GAME_CONFIG.HEIGHT;

    // Create scrolling road background
    this.createRoadBackground();

    // Title
    const title = this.add.text(width / 2, height / 3, 'ROAD RACER', {
      fontSize: '72px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    title.setOrigin(0.5);

    // Instructions
    const instructions = this.add.text(width / 2, height / 2,
      'Arrow Keys: Move & Speed\n\nPress SPACE to Start', {
      fontSize: '24px',
      color: '#ffff00',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3
    });
    instructions.setOrigin(0.5);

    // Controls info
    const controls = this.add.text(width / 2, height / 2 + 120,
      '↑↓ Accelerate/Brake\n←→ Steer\n\nCollect Fuel • Avoid Crashes\n3 Lives', {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2
    });
    controls.setOrigin(0.5);

    // Flashing "Press SPACE" text
    this.tweens.add({
      targets: instructions,
      alpha: { from: 1, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // Input
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Touch/Click support
    this.input.on('pointerdown', () => {
      this.startGame();
    });
  }

  update(): void {
    // Scroll road
    this.road.tilePositionY -= 2;

    // Check for space key
    if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.startGame();
    }
  }

  private createRoadBackground(): void {
    const width = GAME_CONFIG.WIDTH;
    const height = GAME_CONFIG.HEIGHT;

    // Create road texture
    if (!this.textures.exists('road-tile')) {
      const graphics = this.make.graphics({ x: 0, y: 0 });

      // Road
      graphics.fillStyle(GAME_CONFIG.COLORS.ROAD, 1);
      graphics.fillRect(0, 0, GAME_CONFIG.ROAD_WIDTH, 100);

      // Lane markers
      graphics.fillStyle(GAME_CONFIG.COLORS.LANE_MARK, 1);
      for (let i = 0; i < 100; i += 40) {
        graphics.fillRect(GAME_CONFIG.ROAD_WIDTH / 2 - 3, i, 6, 20);
      }

      graphics.generateTexture('road-tile', GAME_CONFIG.ROAD_WIDTH, 100);
      graphics.destroy();
    }

    // Create TileSprite
    this.road = this.add.tileSprite(
      width / 2,
      height / 2,
      GAME_CONFIG.ROAD_WIDTH,
      height,
      'road-tile'
    );
  }

  private startGame(): void {
    this.scene.start('GameScene');
  }
}
