import React from "react";

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl mb-8 pixel-text">Cursor Race</h1>
      <button
        onClick={onStart}
        className="bg-white text-black px-4 py-2 rounded pixel-button"
      >
        Start Game
      </button>
    </div>
  );
};

export default StartScreen;