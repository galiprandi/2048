import { useState, useEffect, useCallback } from "react";
import { useSwipeable } from "react-swipeable";
import GameBoard from "./components/GameBoard/GameBoard";
import ScoreDisplay from "./components/ScoreDisplay/ScoreDisplay";
import Button from "./components/Button/Button";
import GameOverOverlay from "./components/GameOverOverlay/GameOverOverlay";
import type { GameState, Grid } from "./types";
import { useGameStorage } from "./hooks/useGameStorage";
import {
  moveLeft,
  moveRight,
  moveUp,
  moveDown,
  initializeGame,
  addRandomTile,
  checkAvailableMoves,
} from "./lib/gameLogic";
import type { MoveResult } from "./lib/gameLogic";
import styles from "./App.module.css"; // Import CSS module

function App() {
  const {
    isLoaded,
    initialState: loadedState,
    saveGameState,
    clearGameState,
    loadedBestScore,
  } = useGameStorage();

  // Initialize state directly with a valid default state using the imported function
  const [gameState, setGameState] = useState<GameState>(() => {
    const { grid, tiles } = initializeGame(); // Use imported initializeGame
    return {
      grid,
      tiles,
      score: 0,
      bestScore: 0, // Placeholder, will be updated by effect
      isGameOver: false,
    };
  });

  // Effect to load game state from storage ONCE after mount
  useEffect(() => {
    if (isLoaded) {
      if (loadedState) {
        // Found saved state, update the current state
        // Make sure to include the loaded best score from the hook
        setGameState({ ...loadedState, bestScore: loadedBestScore ?? 0 });
        console.log("Loaded game state from storage.");
      } else {
        // No saved game state, but update the best score in the default state
        setGameState((prevState) => ({
          ...prevState,
          bestScore: loadedBestScore ?? 0,
        }));
        console.log("Initialized new game."); // Confirm init
      }
    }
  }, [isLoaded, loadedState, loadedBestScore]); // Run when loading is complete and data is available

  // Effect to save game state whenever it changes
  useEffect(() => {
    // Save state only after the initial load is complete and gameState is not the initial placeholder
    if (isLoaded && gameState) {
      // Avoid saving the initial default state immediately if nothing was loaded
      // We might need a better flag or check later if this causes issues
      saveGameState(gameState);
    }
  }, [gameState, saveGameState, isLoaded]);

  // Helper function to update parts of the game state
  const updateGameState = useCallback((newState: Partial<GameState>) => {
    setGameState((prevState) => ({
      ...prevState, // Spread the previous state first
      ...newState, // Then overwrite with the new partial state
    }));
  }, []); // No external dependencies, so empty array is fine

  // --- Memoize handleMove with useCallback ---
  // Need to wrap handleMove in useCallback because it's in useEffect dependency array
  // and it depends on changing state (grid, score, isGameOver).
  const memoizedHandleMove = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (!gameState || gameState.isGameOver) return; // Guard against null state and game over

      let result: MoveResult | null = null;

      switch (direction) {
        case "left":
          result = moveLeft(gameState.tiles);
          break;
        case "right":
          result = moveRight(gameState.tiles);
          break;
        case "up":
          result = moveUp(gameState.tiles);
          break;
        case "down":
          result = moveDown(gameState.tiles);
          break;
      }

      if (result && result.moved) {
        const { updatedTiles, scoreIncrease } = result;
        const newScore = gameState.score + scoreIncrease;
        const newBestScore = Math.max(newScore, gameState.bestScore);

        // Add a new tile if a move was made
        let finalTiles = updatedTiles;
        let finalGrid = gameState.grid;
        const addResult = addRandomTile(updatedTiles); // Pass updated tiles

        if (addResult) {
          finalTiles = addResult.tilesWithNew; // Use the correct property
          // Manually derive the grid from the final tiles array
          const derivedGrid: Grid = [];
          for (let i = 0; i < 4; i++) {
            derivedGrid[i] = [];
            for (let j = 0; j < 4; j++) {
              derivedGrid[i][j] = 0;
            }
          }
          finalTiles.forEach((tile) => {
            derivedGrid[tile.row][tile.col] = tile.value;
          });
          finalGrid = derivedGrid;
        }

        // Check for available moves on the new state
        const canMove = checkAvailableMoves(finalTiles); // Pass the latest tiles
        const gameOver = !canMove;

        updateGameState({
          tiles: finalTiles,
          grid: finalGrid, // Update grid based on the final tiles
          score: newScore,
          bestScore: newBestScore,
          isGameOver: gameOver,
        });
      }
    },
    [gameState, updateGameState] // Depend on gameState and the updater
  );

  // Effect to handle keyboard input for movement
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default scrolling behavior for arrow keys
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
      ) {
        event.preventDefault();
      }

      switch (event.key) {
        case "ArrowUp":
        case "w": // Optional: Add WASD support
          memoizedHandleMove("up");
          break;
        case "ArrowDown":
        case "s":
          memoizedHandleMove("down");
          break;
        case "ArrowLeft":
        case "a":
          memoizedHandleMove("left");
          break;
        case "ArrowRight":
        case "d":
          memoizedHandleMove("right");
          break;
        // Optional: Add Reset key (e.g., 'r')
        // case 'r':
        //   handleReset();
        //   break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [memoizedHandleMove]); // Dependency array

  const handleReset = () => {
    clearGameState(); // Clear saved state first
    const { grid: initialGrid, tiles: initialTiles } = initializeGame();
    updateGameState({
      grid: initialGrid,
      tiles: initialTiles,
      score: 0,
      isGameOver: false,
      // Keep bestScore
    });
    // We keep the bestScore
  };

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => memoizedHandleMove("left"),
    onSwipedRight: () => memoizedHandleMove("right"),
    onSwipedUp: () => memoizedHandleMove("up"),
    onSwipedDown: () => memoizedHandleMove("down"),
    preventScrollOnSwipe: true, // Prevent page scrolling on swipe
    trackMouse: true, // Allow mouse drags to simulate swipes
  });

  const handleOpenSettings = () => {
    console.log("Open Settings");
    // Open settings modal/panel logic here
  };

  // Show loading until gameState is initialized
  if (!isLoaded || !gameState) {
    return <div className={styles.loadingContainer}>Loading Game...</div>; // Improved loading display
  }

  // Destructure state now that we know gameState is not null
  const { tiles, score, bestScore, isGameOver } = gameState;

  return (
    // Apply swipe handlers to the main container
    <div className="app-container" {...swipeHandlers}>
      <div className="header-container">
        <h1>2048 Game</h1>
        <ScoreDisplay score={score} bestScore={bestScore} />
      </div>
      {/* Pass the actual tiles state to the GameBoard */}
      <GameBoard tiles={tiles} /> {/* Remove grid prop */}
      <div className="footer-container">
        <Button onClick={handleReset}>Reset</Button>
        <Button
          onClick={handleOpenSettings}
          className={styles.settingsButton}
          aria-label="Settings"
        >
          {/* Placeholder for Settings Icon - using text for now */}
          ⚙️
        </Button>
      </div>
      {/* Conditionally render the Game Over overlay */}
      <GameOverOverlay
        isGameOver={isGameOver}
        score={score}
        onReset={handleReset}
      />
    </div>
  );
}

export default App;
