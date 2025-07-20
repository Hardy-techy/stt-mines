import React from 'react';
import { Bomb, Gem, DollarSign } from 'lucide-react';
import { GameState } from '../types/game';

interface GameGridProps {
  gameState: GameState;
  onTileClick: (index: number) => void;
}

export function GameGrid({ gameState, onTileClick }: GameGridProps) {
  const { revealedTiles, mines, isGameOver, isPlaying } = gameState;

  // Sound effect handlers
  const playDiamondSound = () => {
    const audio = new Audio('/sounds/diamond.mp3');
    audio.currentTime = 0;
    audio.play();
  };
  const playBombSound = () => {
    const audio = new Audio('/sounds/bomb.mp3');
    audio.currentTime = 0;
    audio.play();
  };

  const handleTileClick = (index: number) => {
    if (!isPlaying || isGameOver || revealedTiles[index]) return;
    const isMine = mines.includes(index);
    onTileClick(index);
    setTimeout(() => {
      if (isMine) {
        playBombSound();
      } else {
        playDiamondSound();
      }
    }, 0);
  };

  const renderTile = (index: number) => {
    const isRevealed = revealedTiles[index];
    const isMine = mines.includes(index);
    const canClick = isPlaying && !isGameOver && !isRevealed;

    let tileContent = null;
    let tileClass = "w-full h-16 rounded-lg border-2 transition-all duration-300 flex items-center justify-center font-bold text-lg relative overflow-hidden";

    if (!isRevealed) {
      // Hidden tile
      tileClass += canClick 
        ? " bg-gray-700 border-gray-600 hover:border-purple-400 hover:bg-gray-600 cursor-pointer transform hover:scale-105"
        : " bg-gray-700 border-gray-600";
      
      if (canClick) {
        tileContent = (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        );
      }
    } else if (isMine) {
      // Mine revealed
      tileClass += " bg-red-500 border-red-400 animate-pulse";
      tileContent = <Bomb className="w-8 h-8 text-white drop-shadow-lg" />;
    } else {
      // Safe tile revealed
      tileClass += " bg-green-500 border-green-400";
      tileContent = <Gem className="w-6 h-6 text-white drop-shadow-lg animate-bounce" />;
    }

    // Show all mines when game is over
    if (isGameOver && isMine && !isRevealed) {
      tileClass = "w-full h-16 rounded-lg border-2 bg-red-400 border-red-300 flex items-center justify-center font-bold text-lg opacity-75";
      tileContent = <Bomb className="w-6 h-6 text-white" />;
    }

    return (
      <button
        key={index}
        onClick={() => handleTileClick(index)}
        disabled={!canClick}
        className={tileClass}
      >
        {tileContent}
      </button>
    );
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Game Grid</h3>
        {isPlaying && !isGameOver && (
          <div className="text-sm text-gray-300 flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Gem className="w-4 h-4 text-green-400" />
              <span>Safe: {gameState.safeClickCount}</span>
            </span>
            <span className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4 text-yellow-400" />
              <span>{gameState.currentMultiplier.toFixed(2)}x</span>
            </span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: 25 }, (_, index) => renderTile(index))}
      </div>

      {isGameOver && (
        <div className="mt-6 p-4 rounded-lg bg-gray-700/50 border border-gray-600">
          <p className="text-center text-lg font-semibold">
            {gameState.hasWon ? (
              <span className="text-green-400">🎉 Congratulations! You cashed out successfully!</span>
            ) : (
              <span className="text-red-400">💥 Game Over! You hit a mine!</span>
            )}
          </p>
          {gameState.hasWon && (
            <p className="text-center text-gray-300 mt-2">
              Multiplier: {gameState.currentMultiplier.toFixed(2)}x | 
              Safe Clicks: {gameState.safeClickCount}
            </p>
          )}
        </div>
      )}
    </div>
  );
}