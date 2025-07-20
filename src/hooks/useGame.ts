import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { GameState } from '../types/game';
import { MINES_GAME_ABI, CONTRACT_ADDRESS } from '../contracts/abi';
import { 
  generateSeed, 
  hashSeed, 
  generateMines, 
  calculateMultiplier, 
  generateGameId,
  GRID_SIZE 
} from '../utils/gameLogic';

const initialGameState: GameState = {
  isPlaying: false,
  isGameOver: false,
  hasWon: false,
  revealedTiles: new Array(GRID_SIZE).fill(false),
  mines: [],
  safeClickCount: 0,
  currentMultiplier: 1.0,
  wagerAmount: '0.25',
  mineCount: 5,
  seed: '',
  seedHash: '',
  gameId: '',
};

// Live blockchain mode - contract is now deployed!

export function useGame(provider: ethers.BrowserProvider | null, signer: ethers.JsonRpcSigner | null) {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isLoading, setIsLoading] = useState(false);

  const startGame = useCallback(async () => {
    if (!provider || !signer) {
      alert('Please connect your wallet first!');
      return;
    }

    setIsLoading(true);
    
    try {
      const seed = generateSeed();
      const seedHash = hashSeed(seed);
      const gameId = generateGameId();
      const mines = generateMines(seed, gameState.mineCount);

      // Only real blockchain mode
      try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, MINES_GAME_ABI, signer);
        const wagerWei = ethers.parseEther(gameState.wagerAmount);
        
        // Convert seed hash to bytes32 format
        const seedHashBytes32 = ethers.keccak256(ethers.toUtf8Bytes(seed));
        const gameIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(gameId));
        
        console.log('Starting game on blockchain...');
        console.log('Game ID:', gameId);
        console.log('Seed Hash:', seedHashBytes32);
        console.log('Wager:', gameState.wagerAmount, 'STT');
        console.log('Mine Count:', gameState.mineCount);
        
        const tx = await contract.startGame(gameIdBytes32, seedHashBytes32, gameState.mineCount, {
          value: wagerWei,
         
        });

        console.log('Transaction sent:', tx.hash);
        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt);

        setGameState(prev => ({
          ...prev,
          isPlaying: true,
          isGameOver: false,
          hasWon: false,
          revealedTiles: new Array(GRID_SIZE).fill(false),
          mines,
          safeClickCount: 0,
          currentMultiplier: 1.0,
          seed,
          seedHash: seedHashBytes32,
          gameId: gameIdBytes32,
        }));
      } catch (contractError: any) {
        console.error('Contract interaction failed:', contractError);
        
        // More specific error handling
        if (contractError.code === 'INSUFFICIENT_FUNDS') {
          throw new Error('Insufficient STT balance to place this wager.');
        } else if (contractError.code === 'USER_REJECTED') {
          throw new Error('Transaction was rejected by user.');
        } else if (contractError.message?.includes('Daily limit exceeded')) {
          throw new Error('Daily wagering limit exceeded (10 STT max per day).');
        } else if (contractError.message?.includes('Invalid wager amount')) {
          throw new Error('Invalid wager amount. Must be between 0.01 and 1.0 STT.');
        } else if (contractError.message?.includes('Invalid mine count')) {
          throw new Error('Invalid mine count. Must be between 3 and 10 mines.');
        } else {
          throw new Error(`Smart contract error: ${contractError.message || 'Unknown error occurred'}`);
        }
      }
    } catch (error) {
      console.error('Error starting game:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start game. Please try again.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [provider, signer, gameState.wagerAmount, gameState.mineCount]);

  const clickTile = useCallback((index: number) => {
    if (!gameState.isPlaying || gameState.revealedTiles[index] || gameState.isGameOver) {
      return;
    }

    const newRevealedTiles = [...gameState.revealedTiles];
    newRevealedTiles[index] = true;

    const hitMine = gameState.mines.includes(index);

    if (hitMine) {
      // Game over - hit a mine
      setGameState(prev => ({
        ...prev,
        revealedTiles: newRevealedTiles,
        isGameOver: true,
        hasWon: false,
        isPlaying: false,
      }));

      // Call smart contract to end game
      endGameOnChain(false);
    } else {
      // Safe tile - update multiplier
      const newSafeClickCount = gameState.safeClickCount + 1;
      const newMultiplier = calculateMultiplier(newSafeClickCount, gameState.mineCount);

      setGameState(prev => ({
        ...prev,
        revealedTiles: newRevealedTiles,
        safeClickCount: newSafeClickCount,
        currentMultiplier: newMultiplier,
      }));
    }
  }, [gameState]);

  const endGameOnChain = useCallback(async (won: boolean) => {
    if (!provider || !signer) return;

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MINES_GAME_ABI, signer);
      
      if (won) {
        console.log('Cashing out on blockchain...');
        const multiplierInt = Math.floor(gameState.currentMultiplier * 1000);
        const tx = await contract.cashOut(gameState.gameId, multiplierInt, gameState.seed, {
         
        });
        console.log('Cashout transaction sent:', tx.hash);
        await tx.wait();
        console.log('Cashout confirmed');
      } else {
        console.log('Ending game on blockchain (hit mine)...');
        const tx = await contract.gameOver(gameState.gameId, gameState.seed, {
          
        });
        console.log('Game over transaction sent:', tx.hash);
        await tx.wait();
        console.log('Game over confirmed');
      }
    } catch (error) {
      console.error('Error ending game on chain:', error);
    }
  }, [provider, signer, gameState]);

  const cashOut = useCallback(async () => {
    if (!gameState.isPlaying || gameState.safeClickCount === 0) return;

    setIsLoading(true);

    try {
      await endGameOnChain(true);
      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        isGameOver: true,
        hasWon: true,
      }));
    } catch (error) {
      console.error('Error cashing out:', error);
      alert('Failed to cash out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [gameState, endGameOnChain]);

  const resetGame = useCallback(() => {
    setGameState(initialGameState);
  }, []);

  const setWagerAmount = useCallback((amount: string) => {
    if (!gameState.isPlaying) {
      setGameState(prev => ({ ...prev, wagerAmount: amount }));
    }
  }, [gameState.isPlaying]);

  const setMineCount = useCallback((count: number) => {
    if (!gameState.isPlaying) {
      setGameState(prev => ({ ...prev, mineCount: count }));
    }
  }, [gameState.isPlaying]);

  return {
    gameState,
    isLoading,
    startGame,
    clickTile,
    cashOut,
    resetGame,
    setWagerAmount,
    setMineCount,
  };
}