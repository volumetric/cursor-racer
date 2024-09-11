"use client";
import { useState } from "react";
import StartScreen from "./components/StartScreen";
import GameScreen from "./components/GameScreen";

export default function Home() {
  const [gameState, setGameState] = useState("start");

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-geist-mono)] pixel-art">
      {gameState === "start" && <StartScreen onStart={() => setGameState("game")} />}
      {gameState === "game" && <GameScreen onGameOver={() => setGameState("start")} />}
    </div>
  );
}
