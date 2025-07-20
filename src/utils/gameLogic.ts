import { sha256 } from 'js-sha256';
import { MultiplierTable } from '../types/game';

export const GRID_SIZE = 25;

export const multiplierTable: MultiplierTable = {
  3: { 1: 1.12, 2: 1.29, 3: 1.50, 4: 1.78, 5: 2.14, 6: 2.64, 7: 3.32, 8: 4.28, 9: 5.71, 10: 7.92, 11: 11.38, 12: 17.29, 13: 27.11, 14: 45.21, 15: 81.37, 16: 162.75, 17: 365.69, 18: 914.22, 19: 2743, 20: 9576, 21: 38304, 22: 191520 },
  4: { 1: 1.18, 2: 1.46, 3: 1.84, 4: 2.35, 5: 3.05, 6: 4.02, 7: 5.37, 8: 7.32, 9: 10.19, 10: 14.49, 11: 21.07, 12: 31.60, 13: 49.39, 14: 80.59, 15: 136.99, 16: 251.12, 17: 502.25, 18: 1107.39, 19: 2768.47, 20: 7667.71, 21: 23003 },
  5: { 1: 1.24, 2: 1.66, 3: 2.23, 4: 3.02, 5: 4.15, 6: 5.79, 7: 8.22, 8: 11.89, 9: 17.61, 10: 26.70, 11: 41.61, 12: 66.41, 13: 109.89, 14: 189.75, 15: 342.26, 16: 649.48, 17: 1343.88, 18: 2985.52, 19: 7267.71, 20: 19113 },
  6: { 1: 1.31, 2: 1.89, 3: 2.75, 4: 4.07, 5: 6.14, 6: 9.44, 7: 14.79, 8: 23.68, 9: 38.95, 10: 65.91, 11: 114.24, 12: 204.75, 13: 378.28, 14: 729.75, 15: 1459.5, 16: 3038.13, 17: 6683.89, 18: 15541, 19: 38853 },
  7: { 1: 1.39, 2: 2.17, 3: 3.43, 4: 5.50, 5: 8.98, 6: 14.93, 7: 25.30, 8: 43.88, 9: 78.36, 10: 143.75, 11: 272.25, 12: 537.67, 13: 1105.83, 14: 2368.33, 15: 5263.33, 16: 12368, 17: 30920 },
  8: { 1: 1.48, 2: 2.50, 3: 4.27, 4: 7.41, 5: 13.12, 6: 23.72, 7: 43.87, 8: 83.20, 9: 162.64, 10: 325.28, 11: 675.59, 12: 1463.79, 13: 3317.26, 14: 7813.95, 15: 19535, 16: 52093 },
  9: { 1: 1.58, 2: 2.89, 3: 5.33, 4: 9.92, 5: 18.81, 6: 36.42, 7: 72.84, 8: 149.68, 9: 314.13, 10: 683.95, 11: 1535.89, 12: 3583.41, 13: 8709.82, 14: 22609, 15: 63125 },
  10: { 1: 1.69, 2: 3.35, 3: 6.71, 4: 13.56, 5: 27.71, 6: 57.81, 7: 123.66, 8: 270.91, 9: 609.55, 10: 1423.62, 11: 3422.58, 12: 8556.46, 13: 22816, 14: 65189 }
};

export function generateSeed(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function hashSeed(seed: string): string {
  return sha256(seed);
}

export function generateMines(seed: string, mineCount: number): number[] {
  const hash = sha256(seed);
  const mines: number[] = [];
  const used = new Set<number>();
  
  let index = 0;
  while (mines.length < mineCount && index < hash.length - 1) {
    const byte1 = parseInt(hash.substring(index, index + 2), 16);
    const byte2 = parseInt(hash.substring(index + 2, index + 4), 16);
    const position = ((byte1 << 8) | byte2) % GRID_SIZE;
    
    if (!used.has(position)) {
      mines.push(position);
      used.add(position);
    }
    
    index += 4;
    if (index >= hash.length - 1) {
      // If we need more entropy, hash the current hash
      const newHash = sha256(hash + index.toString());
      hash.substring(0, 0, newHash);
      index = 0;
    }
  }
  
  return mines.sort((a, b) => a - b);
}

export function calculateMultiplier(safeClicks: number, mineCount: number): number {
  const table = multiplierTable[mineCount];
  if (!table || !table[safeClicks]) {
    return 1.0;
  }
  return table[safeClicks];
}

export function calculatePayout(wager: number, multiplier: number, houseEdge: number = 0.07): number {
  const grossPayout = wager * multiplier;
  const houseEdgeFee = grossPayout * houseEdge;
  return grossPayout - houseEdgeFee;
}

export function generateGameId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

export function verifyFairness(seed: string, seedHash: string, mineCount: number): {
  isValid: boolean;
  mines: number[];
} {
  const computedHash = hashSeed(seed);
  const isValid = computedHash === seedHash;
  const mines = isValid ? generateMines(seed, mineCount) : [];
  
  return { isValid, mines };
}