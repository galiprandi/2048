import Tile from '../Tile/Tile';
import styles from './GameBoard.module.css';
import type { TileData } from '../../types';
import { AnimatePresence } from 'framer-motion'; // Import restored, but usage below is commented

// Define props for GameBoard
interface GameBoardProps {
  tiles: TileData[];
}

/**
 * Renders the main game board area with grid cells and tiles.
 * Accepts an array of TileData objects to display.
 */
function GameBoard({ tiles }: GameBoardProps) {
  return (
    <div className={styles.gameBoard} role="grid">
      {/* Render background grid cells */}
      {Array.from({ length: 16 }).map((_, index) => (
        <div key={`cell-${index}`} className={styles.gridCell} />
      ))}

      {/* Render tiles based on the tiles prop */}
      {/* Wrap with AnimatePresence to handle exit animations */}
      {/* <AnimatePresence> */}
        {tiles.map((tile) => (
          <Tile key={tile.id} id={tile.id} value={tile.value} row={tile.row} col={tile.col} />
          // We'll add positioning/animation props later
        ))}
      {/* </AnimatePresence> */}
    </div>
  );
}

export default GameBoard;
