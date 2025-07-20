import React, { useState } from 'react';
import { X, Shield, CheckCircle, XCircle, Copy } from 'lucide-react';
import { verifyFairness } from '../utils/gameLogic';
import { GameState } from '../types/game';

interface FairnessModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
}

export function FairnessModal({ isOpen, onClose, gameState }: FairnessModalProps) {
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    mines: number[];
  } | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  React.useEffect(() => {
    if (gameState.seed && gameState.seedHash && gameState.mineCount) {
      const result = verifyFairness(gameState.seed, gameState.seedHash, gameState.mineCount);
      setVerificationResult(result);
    } else {
      setVerificationResult(null);
    }
  }, [gameState.seed, gameState.seedHash, gameState.mineCount]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Shield className="w-6 h-6 text-green-400" />
            <span>Provably Fair Verification</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">How It Works</h3>
            <div className="text-gray-300 text-sm space-y-2">
              <p>1. Before each game, a random seed is generated</p>
              <p>2. The seed is hashed and shown to you before the game starts</p>
              <p>3. Mine positions are determined using the seed</p>
              <p>4. After the game, the seed is revealed for verification</p>
              <p>5. You can verify that the hash matches and mines were placed fairly</p>
            </div>
          </div>

          {gameState.seedHash && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Seed Hash (shown before game)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={gameState.seedHash}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(gameState.seedHash)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {gameState.seed && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Revealed Seed
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={gameState.seed}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(gameState.seed)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {verificationResult && (
                <div className="mt-4 p-4 rounded-lg border" style={{
                  backgroundColor: verificationResult.isValid ? 'rgb(34, 197, 94, 0.1)' : 'rgb(239, 68, 68, 0.1)',
                  borderColor: verificationResult.isValid ? 'rgb(34, 197, 94, 0.3)' : 'rgb(239, 68, 68, 0.3)'
                }}>
                  <div className="flex items-center space-x-2 mb-2">
                    {verificationResult.isValid ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className={verificationResult.isValid ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                      {verificationResult.isValid ? 'Fairness Verified! Mines match the seed.' : 'Verification Failed! Mines do not match the seed.'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-300">
                    <span className="font-semibold">Mine Positions:</span> {verificationResult.mines.join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}