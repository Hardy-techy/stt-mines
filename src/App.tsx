import React, { useState } from 'react';
import Confetti from 'react-confetti';
import { Shield, RotateCcw, Info, ExternalLink } from 'lucide-react';
import { useWallet } from './hooks/useWallet';
import { useGame } from './hooks/useGame';
import { WalletConnector } from './components/WalletConnector';
import { GameControls } from './components/GameControls';
import { GameGrid } from './components/GameGrid';
import { GameStats } from './components/GameStats';
import { FairnessModal } from './components/FairnessModal';

function App() {
  const { wallet, connectWallet, disconnectWallet } = useWallet();
  const { 
    gameState, 
    isLoading, 
    startGame, 
    clickTile, 
    cashOut, 
    resetGame, 
    setWagerAmount, 
    setMineCount,
   
  } = useGame(wallet.provider, wallet.signer);
  
  const [showFairnessModal, setShowFairnessModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Show confetti when player wins
  React.useEffect(() => {
    if (gameState.hasWon && gameState.isGameOver) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [gameState.hasWon, gameState.isGameOver]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            STT Mines 
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Provably fair Mines game on Somnia Network. Uncover safe tiles to increase your multiplier, 
            but avoid the mines! Cash out anytime to secure your winnings.
          </p>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Provably Fair</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="text-sm text-gray-400">Somnia Testnet</div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="text-sm text-gray-400">Verified Contract</div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            {/* Dev X (Twitter) link moved here */}
            <a
              href="https://x.com/0xhardyy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
            >
              
              <span>@0xhardyy</span>
            </a>
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="max-w-md mx-auto mb-8">
          <WalletConnector
            address={wallet.address}
            balance={wallet.balance}
            isConnected={wallet.isConnected}
            isConnecting={wallet.isConnecting}
            onConnect={connectWallet}
            onDisconnect={disconnectWallet}
          />
        </div>

        {wallet.isConnected && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Game Controls */}
              <div className="space-y-6">
                <GameControls
                  wagerAmount={gameState.wagerAmount}
                  mineCount={gameState.mineCount}
                  isPlaying={gameState.isPlaying}
                  isLoading={isLoading}
                  onWagerChange={setWagerAmount}
                  onMineCountChange={setMineCount}
                  onStartGame={startGame}
                  onNewGame={resetGame}
                  isGameOver={gameState.isGameOver}
                />

                {/* New Game button below Start Game button */}
                {/* Removed from here, now inside GameControls */}

                {/* Swap: How to Play goes here instead of GameStats */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
                    <Info className="w-5 h-5" />
                    <span>How to Play</span>
                  </h3>
                  <div className="text-gray-300 text-sm space-y-2">
                    <p>1. Choose your wager amount and number of mines</p>
                    <p>2. Click "Start Game" to begin</p>
                    <p>3. Click tiles to reveal them - avoid mines!</p>
                    <p>4. Each safe tile increases your multiplier</p>
                    <p>5. Cash out anytime to secure your winnings</p>
                    <p>6. Hit a mine and lose your entire bet</p>
                  </div>
                </div>

                {/* End Swap */}
                {/* <GameStats ... /> moved below */}
              </div>

              {/* Center Column - Game Grid */}
              <div>
                <GameGrid
                  gameState={gameState}
                  onTileClick={clickTile}
                />
              </div>

              {/* Right Column - Game Info & Actions */}
              <div className="space-y-6">
                {/* Swap: GameStats goes here instead of Game Actions */}
                <GameStats
                  gameState={gameState}
                  onCashOut={cashOut}
                  isLoading={isLoading}
                />

                {/* Game Actions with Provably Fair description (now below GameStats) */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Game Actions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-semibold">Provably Fair</span>
                    </div>
                    <div className="text-gray-300 text-sm">
                      Each game uses a secret seed. Its hash is shown below before you play. After the game, the seed is revealed so you can verify fairness.
                    </div>
                    {gameState.seedHash && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-400">Seed Hash (before game):</span>
                        <div className="font-mono text-xs bg-gray-700 text-gray-200 rounded p-2 break-all border border-gray-600 mt-1">
                          {gameState.seedHash}
                        </div>
                      </div>
                    )}
                    {/* Show the actual seed after the game ends */}
                    {gameState.isGameOver && gameState.seed && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-400">Seed (after game):</span>
                        <div className="font-mono text-xs bg-gray-700 text-gray-200 rounded p-2 break-all border border-gray-600 mt-1 flex items-center justify-between">
                          <span>{gameState.seed}</span>
                          <button
                            className="ml-2 p-1 text-gray-400 hover:text-white"
                            onClick={() => navigator.clipboard.writeText(gameState.seed)}
                            title="Copy Seed"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-7 8h6a2 2 0 002-2V6a2 2 0 00-2-2H8a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </button>
                        </div>
                      </div>
                    )}
                   
                  </div>
                </div>

                {/* Removed duplicate Current Seed Hash box */}
                {/* The New Game button was moved to the left column */}
              </div>
            </div>
            {/* Footer with smart contract link, only after wallet is connected */}
            <footer className="w-full mt-12 py-6 border-t border-gray-800 text-center text-sm text-gray-400 flex flex-col items-center gap-2">
              <a
                href="https://shannon-explorer.somnia.network/address/0x989535dBb065129342DAc412D6125Df7a4D38ecA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
              >
                <span>Smart Contract</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </footer>
          </>
        )}

        <FairnessModal
          isOpen={showFairnessModal}
          onClose={() => setShowFairnessModal(false)}
          gameState={gameState}
        />
      </div>
    </div>
  );
}

export default App;