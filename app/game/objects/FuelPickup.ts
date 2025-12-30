import * as Phaser from 'phaser';
import { GAME_CONFIG } from '../constants/GameConfig';

export class FuelPickup extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'fuel-pickup');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setSize(30, 30);
    this.setDisplaySize(30, 30);

    // Create texture if it doesn't exist
    this.createTexture();

    // Add pulsing animation
    this.scene.tweens.add({
      targets: this,
      scale: { from: 1, to: 1.2 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  private createTexture(): void {
    if (!this.scene.textures.exists('fuel-pickup')) {
      const graphics = this.scene.make.graphics({ x: 0, y: 0 });

      // Draw fuel can shape
      graphics.fillStyle(GAME_CONFIG.COLORS.FUEL_PICKUP, 1);
      graphics.fillRect(5, 0, 20, 25);
      graphics.fillRect(10, 25, 10, 5);

      // Highlight
      graphics.fillStyle(0xffdd66, 1);
      graphics.fillRect(8, 3, 6, 6);

      graphics.generateTexture('fuel-pickup', 30, 30);
      graphics.destroy();
    }

    this.setTexture('fuel-pickup');
  }

  updateMovement(scrollSpeed: number, delta: number): void {
    this.y += scrollSpeed * (delta / 1000);
  }

  isOffScreen(): boolean {
    return this.y > GAME_CONFIG.HEIGHT + 50;
  }
}
