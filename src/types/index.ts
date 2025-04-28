/**
 * Represents a single tile on the game board.
 */
export interface TileData {
  id: number; // Unique ID for React key and animations
  value: number; // The number displayed on the tile (2, 4, 8, ...)
  row: number; // Current row position (0-3)
  col: number; // Current column position (0-3)
  isNew?: boolean; // Flag indicating if the tile was just added
  isMerged?: boolean; // Flag indicating if the tile is the result of a merge
  merged?: boolean; // Temporary flag for processing within a move function
  mergedFrom?: [TileData, TileData] | null; // Tiles that merged into this one
}

/**
 * Represents the game grid as a 2D array of numbers (0 for empty).
 * This is often used for logical operations before converting to TileData[].
 */
export type Grid = number[][];

/**
 * Represents the game state.
 */
export interface GameState {
  grid: Grid;
  tiles: TileData[]; // Flattened list of active tiles for rendering/animation
  score: number;
  bestScore: number;
  isGameOver: boolean;
  // Add other state properties as needed (e.g., hasMoved, isWon)
}
