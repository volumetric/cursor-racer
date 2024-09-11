import React, { useEffect, useState, useRef } from "react";

interface GameScreenProps {
  onGameOver: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ onGameOver }) => {
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 80 });
  const [otherCars, setOtherCars] = useState<{ x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const gameLoopRef = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          setPlayerPosition(prev => ({ ...prev, x: Math.max(10, prev.x - 5) }));
          break;
        case "ArrowRight":
          setPlayerPosition(prev => ({ ...prev, x: Math.min(90, prev.x + 5) }));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    const gameLoop = () => {
      setOtherCars(prev => {
        const newCars = prev.map(car => ({ ...car, y: car.y + 1 })).filter(car => car.y < 100);
        if (Math.random() < 0.05) {
          newCars.push({ x: Math.random() * 80 + 10, y: -10 });
        }
        return newCars;
      });
      setScore(prev => prev + 1);
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-gray-800 overflow-hidden">
      <div className="absolute inset-0 bg-repeat bg-[length:100px_100px] animate-road-move"
           style={{backgroundImage: "url('/road.png')"}}></div>
      {otherCars.map((car, index) => (
        <div key={index} className="absolute w-8 h-12 bg-blue-500"
             style={{ left: `${car.x}%`, top: `${car.y}%` }}></div>
      ))}
      <div className="absolute w-10 h-16 bg-red-500"
           style={{ left: `${playerPosition.x}%`, bottom: "10%" }}></div>
      <div className="absolute top-4 left-4 text-white pixel-text">Score: {score}</div>
      <button
        onClick={onGameOver}
        className="absolute top-4 right-4 bg-white text-black px-2 py-1 rounded pixel-button"
      >
        End Game
      </button>
    </div>
  );
};

export default GameScreen;