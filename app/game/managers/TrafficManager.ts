import * as Phaser from 'phaser';
import { EnemyCar } from '../objects/EnemyCar';
import { GAME_CONFIG } from '../constants/GameConfig';

export class TrafficManager {
  private scene: Phaser.Scene;
  private enemies: Phaser.Physics.Arcade.Group;
  private spawnTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Create enemy group
    this.enemies = this.scene.physics.add.group({
      classType: EnemyCar,
      runChildUpdate: false
    });
  }

  startSpawning(): void {
    // Spawn enemy every 2-3.5 seconds
    this.spawnTimer = this.scene.time.addEvent({
      delay: Phaser.Math.Between(GAME_CONFIG.ENEMY_SPAWN_DELAY_MIN, GAME_CONFIG.ENEMY_SPAWN_DELAY_MAX),
      callback: () => {
        this.spawnEnemy();
        // Reset timer with new random delay
        if (this.spawnTimer) {
          this.spawnTimer.reset({
            delay: Phaser.Math.Between(GAME_CONFIG.ENEMY_SPAWN_DELAY_MIN, GAME_CONFIG.ENEMY_SPAWN_DELAY_MAX),
            callback: () => this.spawnEnemy(),
            loop: false
          });
        }
      },
      callbackScope: this,
      loop: false
    });
  }

  private spawnEnemy(): void {
    // Random lane
    const lane = Phaser.Utils.Array.GetRandom(GAME_CONFIG.LANE_POSITIONS);

    // Spawn above screen (ahead of player)
    const enemy = new EnemyCar(this.scene, lane, -100);
    // We want them to drive "towards" us if we are faster, so spawn at top
    // const enemy = new EnemyCar(this.scene, lane, -150);
    this.enemies.add(enemy);

    // Restart spawn timer
    if (this.spawnTimer) {
      this.spawnTimer.reset({
        delay: Phaser.Math.Between(GAME_CONFIG.ENEMY_SPAWN_DELAY_MIN, GAME_CONFIG.ENEMY_SPAWN_DELAY_MAX),
        callback: () => this.spawnEnemy(),
        loop: false
      });
    }
  }

  stopSpawning(): void {
    if (this.spawnTimer) {
      this.spawnTimer.remove();
      this.spawnTimer = null;
    }
  }

  update(playerSpeed: number, delta: number): void {
    // Update all enemies
    const children = this.enemies.getChildren() as EnemyCar[];

    children.forEach((enemy: EnemyCar) => {
      enemy.updateMovement(playerSpeed, delta);

      // Remove if off-screen
      if (enemy.isOffScreen()) {
        enemy.destroy();
      }
    });
  }

  getEnemies(): Phaser.Physics.Arcade.Group {
    return this.enemies;
  }

  destroyAll(): void {
    this.stopSpawning();
    this.enemies.clear(true, true);
  }
}
