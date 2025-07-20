export interface GameState {
  isPlaying: boolean;
  isGameOver: boolean;
  hasWon: boolean;
  revealedTiles: boolean[];
  mines: number[];
  safeClickCount: number;
  currentMultiplier: number;
  wagerAmount: string;
  mineCount: number;
  seed: string;
  seedHash: string;
  gameId: string;
}

export interface WalletState {
  address: string | null;
  balance: string;
  isConnected: boolean;
  isConnecting: boolean;
  provider: any;
  signer: any;
}

export interface GameConfig {
  gridSize: number;
  minMines: number;
  maxMines: number;
  minWager: number;
  maxWager: number;
  houseEdge: number;
}

export interface MultiplierTable {
  [key: number]: { [safeClicks: number]: number };
}