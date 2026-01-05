import * as Phaser from 'phaser';
import { GAME_CONFIG } from '../constants/GameConfig';

export class FuelPickup extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'fuel-pickup');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setSize(GAME_CONFIG.FUEL_PICKUP_WIDTH, GAME_CONFIG.FUEL_PICKUP_HEIGHT);
    this.setDisplaySize(GAME_CONFIG.FUEL_PICKUP_WIDTH, GAME_CONFIG.FUEL_PICKUP_HEIGHT);

    // Add pulsing animation
    // Use scaleX/scaleY to preserve the aspect ratio set by setDisplaySize
    // const startScale = this.scaleX;
    
    // this.scene.tweens.add({
    //   targets: this,
    //   // scale: { from: 1, to: 1.2 },
    //   scaleX: startScale * 1.5,
    //   scaleY: startScale * 1.5,
    //   duration: 500,
    //   yoyo: true,
    //   repeat: -1
    // });
  }

  updateMovement(scrollSpeed: number, delta: number): void {
    // Fuel cans are stationary (0 km/h)
    // So they should move down at the speed of the player
    // If player is moving (speed > 0), scrollSpeed is positive, y increases (moves down).
    this.y += scrollSpeed * (delta / 1000);
  }

  isOffScreen(): boolean {
    return this.y > GAME_CONFIG.HEIGHT + 50;
  }
}
