import React from 'react';
import { TrendingUp, Target, Shield, DollarSign } from 'lucide-react';
import { GameState } from '../types/game';
import { calculatePayout } from '../utils/gameLogic';

interface GameStatsProps {
  gameState: GameState;
  onCashOut: () => void;
  isLoading: boolean;
}

export function GameStats({ gameState, onCashOut, isLoading }: GameStatsProps) {
  const { currentMultiplier, wagerAmount, safeClickCount, isPlaying, isGameOver } = gameState;
  const wager = parseFloat(wagerAmount);
  const potentialPayout = calculatePayout(wager, currentMultiplier);
  const profit = potentialPayout - wager;

  const canCashOut = isPlaying && !isGameOver && safeClickCount > 0;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 space-y-4">
      <h3 className="text-xl font-bold text-white flex items-center space-x-2">
        <TrendingUp className="w-5 h-5" />
        <span>Game Stats</span>
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-300 text-sm">Current Bet</span>
          </div>
          <p className="text-2xl font-bold text-white">{wager.toFixed(3)} STT</p>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300 text-sm">Multiplier</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">{currentMultiplier.toFixed(2)}x</p>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-gray-300 text-sm">Safe Clicks</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{safeClickCount}</p>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300 text-sm">Potential Win</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{potentialPayout.toFixed(3)} STT</p>
        </div>
      </div>

      {isPlaying && !isGameOver && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-4 border border-green-500/30">
            <p className="text-green-400 font-semibold text-center">
              Profit: +{profit.toFixed(3)} STT
            </p>
          </div>

          <button
            onClick={onCashOut}
            disabled={!canCashOut || isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105 disabled:transform-none"
          >
            <DollarSign className="w-5 h-5" />
            <span>
              {isLoading ? 'Cashing Out...' : !canCashOut ? 'Make a Move First' : 'Cash Out'}
            </span>
          </button>
        </div>
      )}

      <div className="text-xs text-gray-400 space-y-1 mt-4 pt-4 border-t border-gray-600">
        <p>• The longer you play, the higher the multiplier</p>
        <p>• Cash out before hitting a mine to secure winnings</p>
        <p>• All games are provably fair with cryptographic verification</p>
      </div>
    </div>
  );
}