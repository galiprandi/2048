import type { Grid, TileData } from '../types';

export const GRID_SIZE = 4; // Export GRID_SIZE
let nextTileId = Date.now();

/**
 * Creates an empty 4x4 grid initialized with zeros.
 * @returns {Grid} A 4x4 grid.
 */
export function createEmptyGrid(size = GRID_SIZE): Grid {
  return Array.from({ length: size }, () =>
    Array(size).fill(0),
  );
}

/**
 * Adds a random tile (90% chance of 2, 10% chance of 4) to an empty cell.
 * Updates the grid and returns the new tile and the updated grid.
 * @param tiles The current array of TileData objects.
 * @param size The size of the grid.
 * @returns {TileData | null} The new tile object, or null if no space.
 */
export function addRandomTile(tiles: TileData[]): { tilesWithNew: TileData[]; newTile: TileData } | null {
  const emptyCells: { row: number; col: number }[] = [];
  const grid = tilesToGrid(tiles, GRID_SIZE);

  // Prioritize top row (r=0)
  for (let c = 0; c < GRID_SIZE; c++) {
    if (grid[0][c] === 0) {
      emptyCells.push({ row: 0, col: c });
    }
  }

  // If top row is full, check the rest of the grid
  if (emptyCells.length === 0) {
    for (let r = 1; r < GRID_SIZE; r++) { // Start from row 1
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === 0) {
          emptyCells.push({ row: r, col: c });
        }
      }
    }
  }

  if (emptyCells.length === 0) {
    return null; // No space left
  }

  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  const { row, col } = emptyCells[randomIndex];
  const value = Math.random() < 0.9 ? 2 : 4; // 90% chance of 2, 10% chance of 4

  const newTile: TileData = {
    id: nextTileId++, // Assign and increment the persistent ID
    value,
    row,
    col,
    // Add isNew: true here if needed for appearance animation later
  };

  return { tilesWithNew: [...tiles, newTile], newTile };
}

/**
 * Slides tiles in a row to the left, removing zeros.
 * Example: [0, 2, 0, 2] => [2, 2, 0, 0]
 * @param row The row to slide.
 * @returns The slided row.
 */
function slideRowLeft(row: number[]): number[] {
  const filteredRow = row.filter(val => val !== 0);
  const newRow = Array(GRID_SIZE).fill(0);
  filteredRow.forEach((val, index) => {
    newRow[index] = val;
  });
  return newRow;
}

/**
 * Merges adjacent equal tiles in a row (after sliding left).
 * Example: [2, 2, 4, 0] => [4, 4, 0, 0] (returns row + score increase)
 * @param row The row (assumed to be already slided left).
 * @returns An object containing the merged row and the score increase.
 */
function mergeRowLeft(row: number[]): { mergedRow: number[]; scoreIncrease: number } {
  let scoreIncrease = 0;
  const mergedRow = [...row]; // Copy the row

  for (let i = 0; i < GRID_SIZE - 1; i++) {
    if (mergedRow[i] !== 0 && mergedRow[i] === mergedRow[i + 1]) {
      mergedRow[i] *= 2; // Merge tile
      scoreIncrease += mergedRow[i]; // Add to score
      mergedRow[i + 1] = 0; // Empty the merged tile's original position
    }
  }
  return { mergedRow, scoreIncrease };
}

/**
 * Moves a row completely to the left (slide, merge, slide again).
 * @param row The original row.
 * @returns An object containing the final row state and the score increase.
 */
export function moveRowLeft(row: number[]): { movedRow: number[]; scoreIncrease: number } {
  const slidedOnce = slideRowLeft(row);
  const { mergedRow, scoreIncrease } = mergeRowLeft(slidedOnce);
  const finalRow = slideRowLeft(mergedRow); // Slide again after merging
  return { movedRow: finalRow, scoreIncrease };
}

/**
 * Moves tiles up and merges them, operating on the TileData array.
 * @param tiles The current array of TileData objects.
 * @returns {MoveResult} The updated tiles, score increase, and movement status.
 */
export function moveUp(tiles: TileData[]): MoveResult {
  let scoreIncrease = 0;
  let moved = false;
  const tilesById = new Map(tiles.map(tile => [tile.id, { ...tile }])); // Work with copies

  for (let c = 0; c < GRID_SIZE; c++) { // Iterate through columns
    // Get tiles in the current column, sorted by row ASCENDING
    const colTiles = tiles
      .filter(tile => tile.col === c)
      .sort((a, b) => a.row - b.row) // Sort top-to-bottom
      .map(tile => tilesById.get(tile.id)!);

    const newCol: TileData[] = [];
    let lastMergedTileId: number | null = null;

    for (let i = 0; i < colTiles.length; i++) {
      const currentTile = colTiles[i];

      if (currentTile.value === 0) continue;

      if (newCol.length > 0) {
        const lastTileInNewCol = newCol[newCol.length - 1];
        if (lastTileInNewCol.value === currentTile.value && lastTileInNewCol.id !== lastMergedTileId) {
          const mergedValue = currentTile.value * 2;
          scoreIncrease += mergedValue;
          lastTileInNewCol.value = mergedValue;
          lastTileInNewCol.merged = true;
          lastMergedTileId = lastTileInNewCol.id;
          tilesById.delete(currentTile.id);
          moved = true;
          continue;
        }
      }
      newCol.push(currentTile);
    }

    // Update row positions for tiles in the new column (top-aligned)
    for (let i = 0; i < newCol.length; i++) {
      const tile = newCol[i];
      const newRow = i; // New row is simply the index in the processed column
      if (tile.row !== newRow) {
        tile.row = newRow;
        moved = true;
      }
    }
  }

  const finalTiles = Array.from(tilesById.values());
  return { updatedTiles: finalTiles, scoreIncrease, moved };
}

/**
 * Moves tiles down and merges them, operating on the TileData array.
 * @param tiles The current array of TileData objects.
 * @returns {MoveResult} The updated tiles, score increase, and movement status.
 */
export function moveDown(tiles: TileData[]): MoveResult {
  let scoreIncrease = 0;
  let moved = false;
  const tilesById = new Map(tiles.map(tile => [tile.id, { ...tile }])); // Work with copies

  for (let c = 0; c < GRID_SIZE; c++) { // Iterate through columns
    // Get tiles in the current column, sorted by row DESCENDING
    const colTiles = tiles
      .filter(tile => tile.col === c)
      .sort((a, b) => b.row - a.row) // Sort bottom-to-top
      .map(tile => tilesById.get(tile.id)!);

    const newCol: TileData[] = [];
    let lastMergedTileId: number | null = null;

    for (let i = 0; i < colTiles.length; i++) {
      const currentTile = colTiles[i];

      if (currentTile.value === 0) continue;

      if (newCol.length > 0) {
        const lastTileInNewCol = newCol[newCol.length - 1];
        if (lastTileInNewCol.value === currentTile.value && lastTileInNewCol.id !== lastMergedTileId) {
          const mergedValue = currentTile.value * 2;
          scoreIncrease += mergedValue;
          lastTileInNewCol.value = mergedValue;
          lastTileInNewCol.merged = true;
          lastMergedTileId = lastTileInNewCol.id;
          tilesById.delete(currentTile.id);
          moved = true;
          continue;
        }
      }
      newCol.push(currentTile);
    }

    // Update row positions for tiles in the new column (bottom-aligned)
    for (let i = 0; i < newCol.length; i++) {
      const tile = newCol[i];
      const newRow = GRID_SIZE - 1 - i; // Calculate new row from the bottom edge
      if (tile.row !== newRow) {
        tile.row = newRow;
        moved = true;
      }
    }
  }

  const finalTiles = Array.from(tilesById.values());
  return { updatedTiles: finalTiles, scoreIncrease, moved };
}

/**
 * Converts a number grid into an array of TileData objects for rendering.
 * Assigns basic IDs for now.
 * @param grid The grid to convert.
 * @returns An array of TileData objects.
 */
export function gridToTiles(grid: Grid): TileData[] {
  const tiles: TileData[] = [];
  let idCounter = Date.now(); // Simple way to get somewhat unique IDs for rendering
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const value = grid[r][c];
      if (value !== 0) {
        tiles.push({
          id: idCounter++, // Use a simple incrementing ID for now
          value,
          row: r,
          col: c,
          // isNew, isMerged etc. are not tracked in this basic version
        });
      }
    }
  }
  return tiles;
}

/**
 * Converts an array of TileData objects back into a number grid.
 * @param tiles The array of TileData objects.
 * @param size The size of the grid (e.g., 4 for a 4x4 grid).
 * @returns A Grid representing the tile values.
 */
export function tilesToGrid(tiles: TileData[], size: number): Grid {
  const grid = createEmptyGrid(size);
  tiles.forEach((tile) => {
    if (tile.row >= 0 && tile.row < size && tile.col >= 0 && tile.col < size) {
      grid[tile.row][tile.col] = tile.value;
    }
  });
  return grid;
}

/**
 * --- Interfaces & Types --- //
 */
export interface MoveResult {
  updatedTiles: TileData[];
  scoreIncrease: number;
  moved: boolean;
}

/**
 * Initializes the game with an empty grid and two random tiles.
 * @returns The initial game state including the grid and tiles array.
 */
export function initializeGame(): { grid: Grid; tiles: TileData[] } {
  const grid = createEmptyGrid();
  let tiles: TileData[] = [];
  const tile1Result = addRandomTile(tiles); // Add first tile

  if (tile1Result) {
    tiles = tile1Result.tilesWithNew; // Use the updated array
  }

  const tile2Result = addRandomTile(tiles); // Add second tile using the updated tiles array

  if (tile2Result) {
    tiles = tile2Result.tilesWithNew; // Use the updated array again
  }

  return { grid, tiles };
}

/**
 * Moves tiles to the left and merges them, operating on the TileData array.
 * @param tiles The current array of TileData objects.
 * @returns {MoveResult} The updated tiles, score increase, and movement status.
 */
export function moveLeft(tiles: TileData[]): MoveResult {
  let scoreIncrease = 0;
  let moved = false;
  const tilesById = new Map(tiles.map(tile => [tile.id, { ...tile }])); // Work with copies

  for (let r = 0; r < GRID_SIZE; r++) {
    const currentRowTiles = tiles
      .filter(tile => tile.row === r)
      .sort((a, b) => a.col - b.col)
      .map(tile => tilesById.get(tile.id)!); // Get mutable copies

    const newRow: TileData[] = [];
    let lastMergedTileId: number | null = null;

    for (const currentTile of currentRowTiles) {
      if (newRow.length > 0) {
        const lastTileInNewRow = newRow[newRow.length - 1];
        if (lastTileInNewRow.value === currentTile.value && lastTileInNewRow.id !== lastMergedTileId) {
          const mergedValue = currentTile.value * 2;
          scoreIncrease += mergedValue;
          lastTileInNewRow.value = mergedValue;
          lastTileInNewRow.merged = true;
          lastMergedTileId = lastTileInNewRow.id;
          tilesById.delete(currentTile.id);
          moved = true;
          continue;
        }
      }
      newRow.push(currentTile);
    }

    for (let i = 0; i < newRow.length; i++) {
      const tile = newRow[i];
      if (tile.col !== i) {
        tile.col = i;
        moved = true;
      }
    }
  }

  const finalTiles = Array.from(tilesById.values());
  return { updatedTiles: finalTiles, scoreIncrease, moved };
}

/**
 * Moves tiles to the right and merges them, operating on the TileData array.
 * @param tiles The current array of TileData objects.
 * @returns {MoveResult} The updated tiles, score increase, and movement status.
 */
export function moveRight(tiles: TileData[]): MoveResult {
  let scoreIncrease = 0;
  let moved = false;
  const tilesById = new Map(tiles.map(tile => [tile.id, { ...tile }])); // Work with copies

  for (let r = 0; r < GRID_SIZE; r++) {
    const currentRowTiles = tiles
      .filter(tile => tile.row === r)
      .sort((a, b) => b.col - a.col)
      .map(tile => tilesById.get(tile.id)!);

    const newRow: TileData[] = [];
    let lastMergedTileId: number | null = null;

    for (const currentTile of currentRowTiles) {
      if (newRow.length > 0) {
        const lastTileInNewRow = newRow[newRow.length - 1];
        if (lastTileInNewRow.value === currentTile.value && lastTileInNewRow.id !== lastMergedTileId) {
          const mergedValue = currentTile.value * 2;
          scoreIncrease += mergedValue;
          lastTileInNewRow.value = mergedValue;
          lastTileInNewRow.merged = true;
          lastMergedTileId = lastTileInNewRow.id;
          tilesById.delete(currentTile.id);
          moved = true;
          continue;
        }
      }
      newRow.push(currentTile);
    }

    for (let i = 0; i < newRow.length; i++) {
      const tile = newRow[i];
      const targetCol = GRID_SIZE - 1 - i;
      if (tile.col !== targetCol) {
        tile.col = targetCol;
        moved = true;
      }
    }
  }

  const finalTiles = Array.from(tilesById.values());
  return { updatedTiles: finalTiles, scoreIncrease, moved };
}

/**
 * Checks if there are any available moves left on the grid.
 * This checks for empty cells or adjacent cells with the same value.
 * @param tiles The current array of TileData objects.
 * @returns True if a move is possible, false otherwise (Game Over). 
 */
export function checkAvailableMoves(tiles: TileData[]): boolean {
  // 1. Check for empty cells
  // If fewer tiles than grid size, a new tile can always be added.
  if (tiles.length < GRID_SIZE * GRID_SIZE) {
    return true;
  }

  // 2. Check for possible merges/moves by simulating
  // We need to simulate all directions eventually.
  // For now, just simulate left move.
  const { moved: canMoveLeft } = moveLeft(tiles);
  if (canMoveLeft) return true;

  const { moved: canMoveRight } = moveRight(tiles);
  if (canMoveRight) return true;

  const { moved: canMoveUp } = moveUp(tiles);
  if (canMoveUp) return true;

  const { moved: canMoveDown } = moveDown(tiles);
  if (canMoveDown) return true;

  // 3. If no empty cells and no move changes the grid, then game over
  return false;
}
