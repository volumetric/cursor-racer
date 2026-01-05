import * as Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '20px',
      color: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontSize: '18px',
      color: '#ffffff'
    });
    percentText.setOrigin(0.5, 0.5);

    // Update progress bar
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      percentText.setText(Math.floor(value * 100) + '%');
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // Load assets
    this.load.image('left-grass', 'assets/left_grass.png');
    this.load.image('right-grass', 'assets/right_grass.png');
    this.load.image('player-car', 'assets/player_car.png');
    
    // Load enemies and fuel
    this.load.image('enemy-car-blue', 'assets/enemy_car_blue.png');
    this.load.image('enemy-car-red', 'assets/enemy_car_red.png');
    this.load.image('enemy-car-yellow', 'assets/enemy_car_yellow.png');
    this.load.image('fuel-pickup', 'assets/fuel_pickup.png');

    // Load audio (placeholder - we'll create simple beeps in code)
    // For MVP, we won't load external audio files
  }

  create(): void {
    // Create simple audio using Web Audio API
    this.createSimpleAudio();

    // Move to menu scene
    this.scene.start('MenuScene');
  }

  private createSimpleAudio(): void {
    // We'll create placeholder sounds using Phaser's audio capabilities
    // These will be simple tones for MVP

    // Note: For a real implementation, you would load actual audio files here
    // For MVP, we'll skip audio or use very basic beeps
  }
}
