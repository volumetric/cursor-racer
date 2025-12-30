import * as Phaser from 'phaser';
import { PlayerCar } from '../objects/PlayerCar';
import { EnemyCar } from '../objects/EnemyCar';
import { FuelPickup } from '../objects/FuelPickup';
import { TrafficManager } from '../managers/TrafficManager';
import { GAME_CONFIG } from '../constants/GameConfig';

export class GameScene extends Phaser.Scene {
  // Game objects
  private road!: Phaser.GameObjects.TileSprite;
  private player!: PlayerCar;
  private trafficManager!: TrafficManager;
  private fuelPickups!: Phaser.Physics.Arcade.Group;

  // Game state
  private speed: number = 0;
  private fuel: number = GAME_CONFIG.INITIAL_FUEL;
  private lives: number = GAME_CONFIG.INITIAL_LIVES;
  private score: number = 0;
  private distance: number = 0;
  private fuelPickupsPlaced: number = 0;

  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private isMobile: boolean = false;

  // Mobile controls
  private moveLeft: boolean = false;
  private moveRight: boolean = false;
  private accelerate: boolean = false;
  private brake: boolean = false;

  // HUD
  private scoreText!: Phaser.GameObjects.Text;
  private speedText!: Phaser.GameObjects.Text;
  private fuelText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;

  // Timers
  private fuelPickupTimer!: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Detect mobile
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Create game world
    this.createRoad();
    this.createPlayer();
    this.createFuelPickups();

    // Create traffic manager
    this.trafficManager = new TrafficManager(this);

    // Setup collisions
    this.setupCollisions();

    // Create HUD
    this.createHUD();

    // Setup input
    this.setupInput();

    // Start traffic spawning
    this.trafficManager.startSpawning();

    // Start placing fuel pickups
    this.startFuelPickupPlacement();
  }

  update(time: number, delta: number): void {
    // Handle input
    this.handleInput(delta);

    // Update player
    this.player.update();

    // Update scrolling
    this.updateScrolling(delta);

    // Update traffic
    this.trafficManager.update(this.speed, delta);

    // Update fuel pickups
    this.updateFuelPickups(delta);

    // Update fuel
    this.updateFuel(delta);

    // Update distance and score
    this.updateDistance(delta);
    this.updateScore();

    // Update HUD
    this.updateHUD();

    // Check roadside collision
    this.checkRoadsideCollision();

    // Check game over
    this.checkGameOver();

    // Check for overtakes
    this.checkOvertakes();
  }

  private createRoad(): void {
    const width = GAME_CONFIG.WIDTH;
    const height = GAME_CONFIG.HEIGHT;

    // Create road texture if not exists
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

    // Create TileSprite for road
    this.road = this.add.tileSprite(
      width / 2,
      height / 2,
      GAME_CONFIG.ROAD_WIDTH,
      height,
      'road-tile'
    );
  }

  private createPlayer(): void {
    this.player = new PlayerCar(
      this,
      GAME_CONFIG.PLAYER_START_X,
      GAME_CONFIG.PLAYER_START_Y
    );
  }

  private createFuelPickups(): void {
    this.fuelPickups = this.physics.add.group({
      classType: FuelPickup
    });
  }

  private startFuelPickupPlacement(): void {
    // Place fuel pickups at intervals
    const totalRaceTime = 100; // 100 seconds (100 fuel)
    const interval = (totalRaceTime / GAME_CONFIG.TOTAL_FUEL_PICKUPS) * 1000;

    this.fuelPickupTimer = this.time.addEvent({
      delay: interval / 2, // Start after half interval
      callback: () => {
        if (this.fuelPickupsPlaced < GAME_CONFIG.TOTAL_FUEL_PICKUPS) {
          this.placeFuelPickup();
          this.fuelPickupsPlaced++;
        }
      },
      callbackScope: this,
      repeat: GAME_CONFIG.TOTAL_FUEL_PICKUPS - 1
    });
  }

  private placeFuelPickup(): void {
    const lane = Phaser.Utils.Array.GetRandom(GAME_CONFIG.LANE_POSITIONS);
    const pickup = new FuelPickup(this, lane, -50);
    this.fuelPickups.add(pickup);
  }

  private setupCollisions(): void {
    // Player vs Enemies
    this.physics.add.overlap(
      this.player,
      this.trafficManager.getEnemies(),
      this.handleCarCollision,
      (player, enemy) => {
        return !(this.player.isInvincible());
      },
      this
    );

    // Player vs Fuel Pickups
    this.physics.add.overlap(
      this.player,
      this.fuelPickups,
      this.collectFuel,
      undefined,
      this
    );
  }

  private handleCarCollision(playerObj: any, enemyObj: any): void {
    const enemy = enemyObj as EnemyCar;

    // Lose life
    this.lives -= 1;

    // Reduce speed
    this.speed *= GAME_CONFIG.SPEED_REDUCTION_ON_HIT;

    // Determine push direction
    const pushDirection = this.player.x < enemy.x ? -1 : 1;
    this.player.applyPush(pushDirection);

    // Make invincible
    this.player.makeInvincible();

    // Visual feedback
    this.cameras.main.shake(200, 0.015);

    // Audio feedback (placeholder)
    // this.sound.play('crash');

    // Remove enemy
    enemy.destroy();

    // Check game over
    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  private checkRoadsideCollision(): void {
    if (this.player.isInvincible()) return;

    const leftBound = GAME_CONFIG.ROAD_LEFT_BOUND;
    const rightBound = GAME_CONFIG.ROAD_RIGHT_BOUND;

    // Check if completely off road (not just touching edge)
    if (this.player.x < leftBound - 10 || this.player.x > rightBound + 10) {
      // Lose life
      this.lives -= 1;

      // Speed to 0
      this.speed = 0;

      // Reset position
      this.player.resetPosition();
      this.player.makeInvincible();

      // Visual feedback
      this.cameras.main.shake(300, 0.02);

      // Check game over
      if (this.lives <= 0) {
        this.gameOver();
      }
    }
  }

  private collectFuel(playerObj: any, fuelObj: any): void {
    const fuel = fuelObj as FuelPickup;
    fuel.destroy();

    this.fuel = Math.min(this.fuel + GAME_CONFIG.FUEL_PICKUP_VALUE, 100);

    // Visual feedback
    this.tweens.add({
      targets: this.fuelText,
      scale: { from: 1, to: 1.3 },
      duration: 150,
      yoyo: true
    });

    // Audio feedback (placeholder)
    // this.sound.play('pickup');
  }

  private setupInput(): void {
    // Keyboard
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Mobile touch controls
    if (this.isMobile) {
      this.createTouchControls();
    }
  }

  private createTouchControls(): void {
    const height = GAME_CONFIG.HEIGHT;

    // Left button
    const leftBtn = this.add.circle(80, height - 100, 45, 0xff0000, 0.6);
    leftBtn.setInteractive();
    leftBtn.setScrollFactor(0);
    leftBtn.on('pointerdown', () => (this.moveLeft = true));
    leftBtn.on('pointerup', () => (this.moveLeft = false));
    leftBtn.on('pointerout', () => (this.moveLeft = false));

    this.add.text(80, height - 100, '◄', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0);

    // Right button
    const rightBtn = this.add.circle(200, height - 100, 45, 0x00ff00, 0.6);
    rightBtn.setInteractive();
    rightBtn.setScrollFactor(0);
    rightBtn.on('pointerdown', () => (this.moveRight = true));
    rightBtn.on('pointerup', () => (this.moveRight = false));
    rightBtn.on('pointerout', () => (this.moveRight = false));

    this.add.text(200, height - 100, '►', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0);

    // Up button (accelerate)
    const upBtn = this.add.circle(GAME_CONFIG.WIDTH - 200, height - 150, 45, 0x0000ff, 0.6);
    upBtn.setInteractive();
    upBtn.setScrollFactor(0);
    upBtn.on('pointerdown', () => (this.accelerate = true));
    upBtn.on('pointerup', () => (this.accelerate = false));
    upBtn.on('pointerout', () => (this.accelerate = false));

    this.add.text(GAME_CONFIG.WIDTH - 200, height - 150, '▲', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0);

    // Down button (brake)
    const downBtn = this.add.circle(GAME_CONFIG.WIDTH - 200, height - 50, 45, 0xffff00, 0.6);
    downBtn.setInteractive();
    downBtn.setScrollFactor(0);
    downBtn.on('pointerdown', () => (this.brake = true));
    downBtn.on('pointerup', () => (this.brake = false));
    downBtn.on('pointerout', () => (this.brake = false));

    this.add.text(GAME_CONFIG.WIDTH - 200, height - 50, '▼', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0);
  }

  private createHUD(): void {
    const width = GAME_CONFIG.WIDTH;

    // 1P indicator
    this.add.text(width - 20, 20, '1P', {
      fontSize: '24px',
      color: GAME_CONFIG.COLORS.HUD_TEXT,
      fontStyle: 'bold',
      stroke: GAME_CONFIG.COLORS.HUD_SHADOW,
      strokeThickness: 4
    }).setOrigin(1, 0).setScrollFactor(0);

    // Score
    this.scoreText = this.add.text(width - 20, 50, 'SCORE: 000000', {
      fontSize: '20px',
      color: GAME_CONFIG.COLORS.HUD_TEXT,
      stroke: GAME_CONFIG.COLORS.HUD_SHADOW,
      strokeThickness: 3
    }).setOrigin(1, 0).setScrollFactor(0);

    // Speed
    this.speedText = this.add.text(width - 20, 80, '0 km/h', {
      fontSize: '20px',
      color: GAME_CONFIG.COLORS.HUD_TEXT,
      stroke: GAME_CONFIG.COLORS.HUD_SHADOW,
      strokeThickness: 3
    }).setOrigin(1, 0).setScrollFactor(0);

    // Fuel
    this.fuelText = this.add.text(width - 20, 110, 'FUEL: 100', {
      fontSize: '20px',
      color: GAME_CONFIG.COLORS.HUD_TEXT,
      stroke: GAME_CONFIG.COLORS.HUD_SHADOW,
      strokeThickness: 3
    }).setOrigin(1, 0).setScrollFactor(0);

    // Lives
    this.livesText = this.add.text(width - 20, 140, 'LIVES: ❤❤❤', {
      fontSize: '20px',
      color: GAME_CONFIG.COLORS.HUD_TEXT,
      stroke: GAME_CONFIG.COLORS.HUD_SHADOW,
      strokeThickness: 3
    }).setOrigin(1, 0).setScrollFactor(0);
  }

  private handleInput(delta: number): void {
    // Speed control
    const upPressed = this.cursors.up.isDown || this.accelerate;
    const downPressed = this.cursors.down.isDown || this.brake;
    const leftPressed = this.cursors.left.isDown || this.moveLeft;
    const rightPressed = this.cursors.right.isDown || this.moveRight;

    // Acceleration
    if (upPressed) {
      this.speed = Math.min(this.speed + GAME_CONFIG.ACCELERATION, GAME_CONFIG.MAX_SPEED);
    } else if (downPressed) {
      this.speed = Math.max(this.speed - GAME_CONFIG.BRAKING, 0);
    } else {
      // Auto-deceleration
      this.speed = Math.max(this.speed - GAME_CONFIG.AUTO_DECELERATION, 0);
    }

    // Steering (with counter-steer for recovery)
    const pushVel = this.player.getPushVelocity();

    if (leftPressed) {
      this.player.x -= 5;
      // Counter-steer if being pushed right
      if (pushVel > 0) {
        this.player.counterSteer(30);
      }
    }

    if (rightPressed) {
      this.player.x += 5;
      // Counter-steer if being pushed left
      if (pushVel < 0) {
        this.player.counterSteer(-30);
      }
    }
  }

  private updateScrolling(delta: number): void {
    // Scroll speed based on player speed (km/h to pixels/s)
    const scrollSpeed = this.speed * 0.28;
    this.road.tilePositionY += scrollSpeed * (delta / 1000);
  }

  private updateFuelPickups(delta: number): void {
    const scrollSpeed = this.speed * 0.28;
    const children = this.fuelPickups.getChildren() as FuelPickup[];

    children.forEach((pickup: FuelPickup) => {
      pickup.updateMovement(scrollSpeed, delta);

      if (pickup.isOffScreen()) {
        pickup.destroy();
      }
    });
  }

  private updateFuel(delta: number): void {
    this.fuel -= GAME_CONFIG.FUEL_DEPLETION_RATE * (delta / 1000);
    this.fuel = Math.max(this.fuel, 0);
  }

  private updateDistance(delta: number): void {
    // Distance in meters based on speed
    const metersPerSecond = (this.speed / 3.6);
    this.distance += metersPerSecond * (delta / 1000);
  }

  private updateScore(): void {
    // Base score from distance
    let newScore = Math.floor(this.distance * GAME_CONFIG.SCORE_DISTANCE_MULTIPLIER);

    // Speed multiplier
    const multiplier = GAME_CONFIG.SPEED_BONUS_THRESHOLDS.find(
      (threshold) => this.speed >= threshold.min && this.speed <= threshold.max
    )?.multiplier || 1;

    newScore *= multiplier;

    this.score = Math.floor(newScore);
  }

  private checkOvertakes(): void {
    const enemies = this.trafficManager.getEnemies().getChildren() as EnemyCar[];

    enemies.forEach((enemy) => {
      // Check if enemy is behind player and hasn't been counted
      if (enemy.y > this.player.y && !enemy.getBeenPassed()) {
        enemy.setBeenPassed(true);
        this.score += GAME_CONFIG.SCORE_OVERTAKE_BONUS;
      }
    });
  }

  private updateHUD(): void {
    // Score with padding
    const scoreStr = String(Math.floor(this.score)).padStart(6, '0');
    this.scoreText.setText(`SCORE: ${scoreStr}`);

    // Speed
    const speedStr = Math.floor(this.speed);
    this.speedText.setText(`${speedStr} km/h`);

    // Fuel
    const fuelStr = Math.floor(this.fuel);
    this.fuelText.setText(`FUEL: ${fuelStr}`);

    // Change fuel color when low
    if (this.fuel < 20) {
      this.fuelText.setColor('#ff0000');
    } else {
      this.fuelText.setColor(GAME_CONFIG.COLORS.HUD_TEXT);
    }

    // Lives
    const hearts = '❤'.repeat(Math.max(0, this.lives));
    this.livesText.setText(`LIVES: ${hearts}`);
  }

  private checkGameOver(): void {
    if (this.fuel <= 0 || this.lives <= 0) {
      this.gameOver();
    }
  }

  private gameOver(): void {
    // Stop spawning
    this.trafficManager.stopSpawning();

    // Transition to game over scene
    this.scene.start('GameOverScene', {
      score: Math.floor(this.score),
      distance: Math.floor(this.distance)
    });
  }
}
