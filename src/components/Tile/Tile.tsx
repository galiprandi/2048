import { motion } from 'framer-motion';
import styles from './Tile.module.css';

// Basic type for Tile props - will likely expand
interface TileProps {
  value: number;
  row: number;
  col: number;
  id: number; // Add id for keying animations
  merged?: boolean; // Flag indicating if this tile resulted from a merge
}

/**
 * Renders a single game tile with its value.
 * Uses framer-motion for animations.
 */
function Tile({ value, row, col, id, merged = false }: TileProps) {
  // Basic logic to determine tile appearance based on value (can be moved to helper)
  const tileStyle = value <= 2048 ? `tile${value}` : 'tileSuper';
  const tileValue = value > 0 ? value : '';

  const variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: 'tween', duration: 0.15, ease: 'easeOut' }, // Smoother slide
    },
    mergedPop: {
      scale: [1, 1.2, 1], // Scale up then back down
      opacity: 1,
      transition: { duration: 0.2, times: [0, 0.5, 1] }, // Quick pop animation
    },
  };

  return (
    <motion.div
      key={id} // Use the unique tile ID as the key for framer-motion
      className={`${styles.tile} ${styles[tileStyle]}`}
      variants={variants}
      initial="hidden"
      animate={merged ? 'mergedPop' : 'visible'}
      exit="hidden"
      layout // Use layout for position changes. 'position' is implicit now.
      style={{ gridRowStart: row + 1, gridColumnStart: col + 1 }}
      role="gridcell"
      aria-valuenow={value}
    >
      {tileValue}
    </motion.div>
  );
}

export default Tile;
