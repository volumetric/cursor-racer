import * as Phaser from 'phaser';
import { PreloadScene } from './scenes/PreloadScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { GAME_CONFIG } from './constants/GameConfig';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: GAME_CONFIG.COLORS.GRASS,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
    min: {
      width: 320,
      height: 480
    },
    max: {
      width: 1920,
      height: 2880
    }
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [PreloadScene, MenuScene, GameScene, GameOverScene],
  audio: {
    disableWebAudio: false
  }
};
