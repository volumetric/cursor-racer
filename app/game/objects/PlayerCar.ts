import Phaser from 'phaser';
import { GAME_CONFIG } from '../constants/GameConfig';

export class PlayerCar extends Phaser.Physics.Arcade.Sprite {
  private invincible: boolean = false;
  private pushVelocity: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player-car');

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics setup
    this.setOrigin(0.5, 0.5);
    this.setSize(GAME_CONFIG.PLAYER_CAR_WIDTH, GAME_CONFIG.PLAYER_CAR_HEIGHT);
    this.setDisplaySize(GAME_CONFIG.PLAYER_CAR_WIDTH, GAME_CONFIG.PLAYER_CAR_HEIGHT);

    // Create texture if it doesn't exist
    this.createTexture();
  }

  private createTexture(): void {
    if (!this.scene.textures.exists('player-car')) {
      const graphics = this.scene.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(GAME_CONFIG.COLORS.PLAYER_CAR, 1);
      graphics.fillRect(0, 0, GAME_CONFIG.PLAYER_CAR_WIDTH, GAME_CONFIG.PLAYER_CAR_HEIGHT);
      graphics.generateTexture('player-car', GAME_CONFIG.PLAYER_CAR_WIDTH, GAME_CONFIG.PLAYER_CAR_HEIGHT);
      graphics.destroy();
    }
    this.setTexture('player-car');
  }

  applyPush(direction: number): void {
    // Apply sideways velocity after collision
    this.pushVelocity = direction * GAME_CONFIG.COLLISION_PUSH_FORCE;
    this.setVelocityX(this.pushVelocity);
  }

  makeInvincible(duration: number = GAME_CONFIG.INVINCIBILITY_DURATION): void {
    this.invincible = true;

    // Blinking effect
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.3, to: 0.7 },
      duration: 150,
      repeat: Math.floor(duration / 300),
      yoyo: true,
      onComplete: () => {
        this.invincible = false;
        this.setAlpha(1);
      }
    });
  }

  isInvincible(): boolean {
    return this.invincible;
  }

  resetPosition(): void {
    this.x = GAME_CONFIG.PLAYER_START_X;
    this.setVelocity(0, 0);
    this.pushVelocity = 0;
  }

  update(): void {
    // Gradually reduce sideways push velocity
    if (Math.abs(this.pushVelocity) > 0) {
      this.pushVelocity *= 0.92;
      this.setVelocityX(this.pushVelocity);

      // Stop completely if very small
      if (Math.abs(this.pushVelocity) < 1) {
        this.pushVelocity = 0;
        this.setVelocityX(0);
      }
    }

    // Keep within road bounds
    const leftBound = GAME_CONFIG.ROAD_LEFT_BOUND + (GAME_CONFIG.PLAYER_CAR_WIDTH / 2);
    const rightBound = GAME_CONFIG.ROAD_RIGHT_BOUND - (GAME_CONFIG.PLAYER_CAR_WIDTH / 2);

    if (this.x < leftBound) {
      this.x = leftBound;
      this.setVelocityX(0);
      this.pushVelocity = 0;
    } else if (this.x > rightBound) {
      this.x = rightBound;
      this.setVelocityX(0);
      this.pushVelocity = 0;
    }
  }

  getPushVelocity(): number {
    return this.pushVelocity;
  }

  counterSteer(amount: number): void {
    // Reduce push velocity when player counter-steers
    this.pushVelocity -= amount;
  }
}
