import React from 'react';
import Button from '../Button/Button'; // Reuse the Button component
import styles from './GameOverOverlay.module.css';

interface GameOverOverlayProps {
  isGameOver: boolean;
  score: number; // Optionally display final score
  onReset: () => void;
}

const GameOverOverlay: React.FC<GameOverOverlayProps> = ({ isGameOver, score, onReset }) => {
  if (!isGameOver) {
    return null; // Don't render anything if the game is not over
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <h2>Game Over!</h2>
        <p>Your final score: {score}</p>
        <Button onClick={onReset} variant="primary">
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default GameOverOverlay;
