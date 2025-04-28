import styles from './ScoreDisplay.module.css';

interface ScoreDisplayProps {
  score: number;
  bestScore: number;
}

/**
 * Displays the current score and the best score.
 */
function ScoreDisplay({ score, bestScore }: ScoreDisplayProps) {
  return (
    <div className={styles.scoreContainer}>
      <div className={styles.scoreBox}>
        <span className={styles.scoreLabel}>SCORE</span>
        <span className={styles.scoreValue}>{score}</span>
      </div>
      <div className={styles.scoreBox}>
        <span className={styles.scoreLabel}>BEST</span>
        <span className={styles.scoreValue}>{bestScore}</span>
      </div>
    </div>
  );
}

export default ScoreDisplay;
