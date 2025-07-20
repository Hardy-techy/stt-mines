import React from 'react';
import { Play, DollarSign, Bomb, RotateCcw } from 'lucide-react';

interface GameControlsProps {
  wagerAmount: string;
  mineCount: number;
  isPlaying: boolean;
  isLoading: boolean;
  onWagerChange: (amount: string) => void;
  onMineCountChange: (count: number) => void;
  onStartGame: () => void;
  onNewGame: () => void; // new prop
  isGameOver: boolean;   // new prop
}

export function GameControls({
  wagerAmount,
  mineCount,
  isPlaying,
  isLoading,
  onWagerChange,
  onMineCountChange,
  onStartGame,
  onNewGame,
  isGameOver,
}: GameControlsProps) {
  const mineOptions = [3, 4, 5, 6, 7, 8, 9, 10];
  const wagerOptions = ['0.25', '0.5', '1', '5', '10', '15'];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 space-y-6">
      <h3 className="text-xl font-bold text-white flex items-center space-x-2">
        <Play className="w-5 h-5" />
        <span>Game Settings</span>
      </h3>

      {/* Wager Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          <DollarSign className="w-4 h-4 inline mr-1" />
          Wager Amount (STT)
        </label>
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          {wagerOptions.map((amount) => (
            <button
              key={amount}
              onClick={() => onWagerChange(amount)}
              disabled={isPlaying}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                wagerAmount === amount
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {amount}
            </button>
          ))}
        </div>

        <input
          type="number"
          value={wagerAmount}
          onChange={(e) => onWagerChange(e.target.value)}
          disabled={isPlaying}
          min="0.25"
          max="15"
          step="0.25"
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
          placeholder="Custom amount..."
        />
      </div>

      {/* Mine Count */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          <Bomb className="w-4 h-4 inline mr-1" />
          Number of Mines
        </label>
        
        <div className="grid grid-cols-4 gap-2">
          {mineOptions.map((count) => (
            <button
              key={count}
              onClick={() => onMineCountChange(count)}
              disabled={isPlaying}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                mineCount === count
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Start Game Button */}
      <button
        onClick={onStartGame}
        disabled={isPlaying || isLoading}
        className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <Play className="w-5 h-5" />
        <span>
          {isLoading ? 'Starting Game...' : isPlaying ? 'Game in Progress' : 'Start Game'}
        </span>
      </button>

      {/* New Game Button below Start Game */}
      {isGameOver && (
        <button
          onClick={onNewGame}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 mt-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>New Game</span>
        </button>
      )}

      {/* Game Info */}
      <div className="text-xs text-gray-400 space-y-1">
        <p>• Min wager: 0.25 STT • Max wager: 15 STT</p>
        <p>• Higher mines = higher multipliers</p>
        
      </div>
    </div>
  );
}