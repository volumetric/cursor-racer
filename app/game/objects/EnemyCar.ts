import * as Phaser from 'phaser';
import { GAME_CONFIG } from '../constants/GameConfig';

export class EnemyCar extends Phaser.Physics.Arcade.Sprite {
  private enemySpeed: number;
  private hasBeenPassed: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Start with a valid default texture
    super(scene, x, y, 'enemy-car-yellow');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setSize(GAME_CONFIG.ENEMY_CAR_WIDTH, GAME_CONFIG.ENEMY_CAR_HEIGHT);
    this.setDisplaySize(GAME_CONFIG.ENEMY_CAR_WIDTH, GAME_CONFIG.ENEMY_CAR_HEIGHT);

    // Random speed for this car
    this.enemySpeed = Phaser.Math.Between(GAME_CONFIG.ENEMY_SPEED_MIN, GAME_CONFIG.ENEMY_SPEED_MAX);

    // Assign random car texture
    this.assignRandomTexture();
  }

  private assignRandomTexture(): void {
    const types = ['enemy-car-blue', 'enemy-car-red', 'enemy-car-yellow'];
    const randomType = Phaser.Utils.Array.GetRandom(types);
    this.setTexture(randomType);
    
    // Reset size to config dimensions after changing texture
    this.setDisplaySize(GAME_CONFIG.ENEMY_CAR_WIDTH, GAME_CONFIG.ENEMY_CAR_HEIGHT);
  }

  updateMovement(playerSpeed: number, delta: number): void {
    // Calculate relative speed (how much faster player is than enemy)
    // If player is faster (200) vs enemy (100): Result +100. Movement positive (Down). WE OVERTAKE.
    // If player is slower (0) vs enemy (100): Result -100. Movement negative (Up). ENEMY DRIVES AWAY.
    const relativeSpeed = (playerSpeed - this.enemySpeed);

    // Convert km/h to pixels per second using shared factor
    const pixelsPerSecond = relativeSpeed * GAME_CONFIG.SCROLL_SPEED_FACTOR;
    const movement = pixelsPerSecond * (delta / 1000);

    this.y += movement;
  }

  getEnemySpeed(): number {
    return this.enemySpeed;
  }

  setBeenPassed(passed: boolean): void {
    this.hasBeenPassed = passed;
  }

  getBeenPassed(): boolean {
    return this.hasBeenPassed;
  }

  isOffScreen(): boolean {
    return this.y > GAME_CONFIG.HEIGHT + 100 || this.y < -100;
  }
}
