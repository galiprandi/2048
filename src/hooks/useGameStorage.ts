import { useState, useEffect, useCallback } from 'react';
import type { Grid, GameState, TileData } from '../types';
import { gridToTiles } from '../lib/gameLogic';

const STORAGE_KEY = 'gameState2048';
const BEST_SCORE_KEY = 'bestScore2048';

// Define the structure of the data we store
interface StoredGameState {
  grid: Grid; // Always store the grid for potential recovery
  tiles?: TileData[]; // Optionally store tiles directly
  score: number;
  isGameOver: boolean;
}

/**
 * Custom hook to manage saving and loading game state to localStorage.
 */
export function useGameStorage(): {
  isLoaded: boolean;
  initialState: GameState | null;
  saveGameState: (state: GameState) => void;
  clearGameState: () => void;
  loadedBestScore: number | null;
} {
  const [isLoaded, setIsLoaded] = useState(false);
  const [initialState, setInitialState] = useState<GameState | null>(null);
  const [loadedBestScore, setLoadedBestScore] = useState<number | null>(null);

  // Load state from localStorage on initial mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsedState: StoredGameState = JSON.parse(savedState);
        // Ensure tiles are present, converting from grid if necessary (legacy support?)
        const tiles = parsedState.tiles || gridToTiles(parsedState.grid);
        // Load bestScore separately
        const savedBestScore = localStorage.getItem(BEST_SCORE_KEY);
        const currentBestScore = savedBestScore ? parseInt(savedBestScore, 10) : 0;
        setLoadedBestScore(currentBestScore);
        // Set the full initial state including the loaded/default bestScore
        setInitialState({
          grid: parsedState.grid,
          tiles,
          score: parsedState.score,
          isGameOver: parsedState.isGameOver,
          bestScore: currentBestScore // Include bestScore
        });
      } else {
        // No saved game state, but still check for best score
        const savedBestScore = localStorage.getItem(BEST_SCORE_KEY);
        setLoadedBestScore(savedBestScore ? parseInt(savedBestScore, 10) : 0);
        setInitialState(null); // No game state to load
      }
    } catch (error) {
      console.error('Failed to load state from localStorage:', error);
      setInitialState(null); // Reset on error
      setLoadedBestScore(0);
    } finally {
      setIsLoaded(true); // Mark loading as complete regardless of outcome
    }
  }, []); // Empty dependency array means this runs once on mount

  // Function to save the current game state
  const saveGameState = useCallback((state: GameState) => {
    try {
      const stateToSave: StoredGameState = {
        grid: state.grid,
        score: state.score,
        isGameOver: state.isGameOver,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      // Also save best score separately
      if (state.bestScore !== undefined) {
        localStorage.setItem(BEST_SCORE_KEY, state.bestScore.toString());
      }
    } catch (error) {
      console.error('Failed to save game state to localStorage:', error);
    }
  }, []); // Keep useCallback dependency arrays empty if functions don't depend on props/state

  // Function to clear the saved game state
  const clearGameState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(BEST_SCORE_KEY); // Also remove best score
      console.log('Cleared game state from storage.');
    } catch (error) {
      console.error('Failed to clear game state from localStorage:', error);
    }
  }, []); // Keep useCallback dependency arrays empty if functions don't depend on props/state

  return { isLoaded, initialState, saveGameState, clearGameState, loadedBestScore }; // Return loadedBestScore
}
