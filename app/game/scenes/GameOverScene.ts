import Phaser from 'phaser';
import { GAME_CONFIG } from '../constants/GameConfig';

interface GameOverData {
  score: number;
  distance: number;
}

export class GameOverScene extends Phaser.Scene {
  private finalScore: number = 0;
  private finalDistance: number = 0;
  private highScore: number = 0;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: GameOverData): void {
    this.finalScore = data.score || 0;
    this.finalDistance = data.distance || 0;

    // Get high score from localStorage
    if (typeof window !== 'undefined') {
      this.highScore = parseInt(localStorage.getItem('roadRacerHighScore') || '0');

      // Save new high score
      if (this.finalScore > this.highScore) {
        this.highScore = this.finalScore;
        localStorage.setItem('roadRacerHighScore', String(this.highScore));
      }
    }
  }

  create(): void {
    const width = GAME_CONFIG.WIDTH;
    const height = GAME_CONFIG.HEIGHT;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

    // Game Over title
    const title = this.add.text(width / 2, height / 4, 'GAME OVER', {
      fontSize: '72px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8
    });
    title.setOrigin(0.5);

    // Stats
    const statsY = height / 2 - 50;

    // Final Score
    this.add.text(width / 2, statsY, `SCORE: ${String(this.finalScore).padStart(6, '0')}`, {
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Distance
    this.add.text(width / 2, statsY + 50, `DISTANCE: ${this.finalDistance}m`, {
      fontSize: '24px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // High Score
    const isNewHighScore = this.finalScore === this.highScore && this.finalScore > 0;
    const highScoreText = this.add.text(
      width / 2,
      statsY + 100,
      isNewHighScore ? '★ NEW HIGH SCORE! ★' : `HIGH SCORE: ${String(this.highScore).padStart(6, '0')}`,
      {
        fontSize: '24px',
        color: isNewHighScore ? '#00ff00' : '#aaaaaa',
        stroke: '#000000',
        strokeThickness: 3
      }
    );
    highScoreText.setOrigin(0.5);

    if (isNewHighScore) {
      // Pulse animation for new high score
      this.tweens.add({
        targets: highScoreText,
        scale: { from: 1, to: 1.2 },
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }

    // Buttons
    const buttonY = height - 250;

    // Play Again button
    const playAgainBtn = this.add.text(width / 2, buttonY, 'PLAY AGAIN', {
      fontSize: '36px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 4,
      backgroundColor: '#003300',
      padding: { x: 20, y: 10 }
    });
    playAgainBtn.setOrigin(0.5);
    playAgainBtn.setInteractive({ useHandCursor: true });
    playAgainBtn.on('pointerover', () => playAgainBtn.setScale(1.1));
    playAgainBtn.on('pointerout', () => playAgainBtn.setScale(1));
    playAgainBtn.on('pointerdown', () => this.restartGame());

    // Menu button
    const menuBtn = this.add.text(width / 2, buttonY + 80, 'MAIN MENU', {
      fontSize: '28px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3,
      backgroundColor: '#333300',
      padding: { x: 20, y: 10 }
    });
    menuBtn.setOrigin(0.5);
    menuBtn.setInteractive({ useHandCursor: true });
    menuBtn.on('pointerover', () => menuBtn.setScale(1.1));
    menuBtn.on('pointerout', () => menuBtn.setScale(1));
    menuBtn.on('pointerdown', () => this.goToMenu());

    // Keyboard shortcuts
    this.add.text(width / 2, height - 80, 'SPACE: Play Again  |  ESC: Menu', {
      fontSize: '18px',
      color: '#888888',
      align: 'center'
    }).setOrigin(0.5);

    // Input
    this.input.keyboard!.on('keydown-SPACE', () => this.restartGame());
    this.input.keyboard!.on('keydown-ESC', () => this.goToMenu());
  }

  private restartGame(): void {
    this.scene.start('GameScene');
  }

  private goToMenu(): void {
    this.scene.start('MenuScene');
  }
}
