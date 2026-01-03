'use client';

import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { gameConfig } from './config';

export default function PhaserGame() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Create game instance
    if (parentRef.current && !gameRef.current) {
      gameRef.current = new Phaser.Game({
        ...gameConfig,
        parent: parentRef.current
      });
    }

    // Cleanup on unmount
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-900 overflow-hidden">
      <div ref={parentRef} id="game-container" className="w-full h-full relative" />
    </div>
  );
}
