# Development Plan: 2048 Mobile-First with React 19

This document outlines the steps to create the mobile-first version of the 2048 game. All code, comments, and documentation will be in **English**.

* [X] **1. Initial Project Setup:**
  * [X] Initialize or verify React 19 project with Vite and TypeScript.
  * [X] Install necessary dependencies: `react-swipeable`, `framer-motion`.
  * [X] Configure `tsconfig.json` and `vite.config.ts` (ensure CSS Modules are enabled by default in Vite).
  * [X] Clean up initial template files.

* [X] **2. Base HTML Structure and Viewport:**
  * [X] Modify `index.html` to include the specified `viewport` meta tag.
  * [X] Set up the basic HTML structure in `App.tsx`.
  * [X] Create a base `index.css` or `App.module.css` for global styles.

* [X] **3. Basic UI Components:**
  * [X] Create `GameBoard` component with `GameBoard.module.css`.
  * [X] Create `Tile` component with `Tile.module.css`.
  * [X] Create components for `ScoreDisplay` (current and best) and buttons (`ResetButton`, `SettingsButton`) with their respective `.module.css` files.
  * [X] Style components using **CSS Modules** (mobile-first, responsive). Ensure the board occupies 85-90% height.
  * [X] Add basic **ARIA attributes** (`role="grid"`, `role="gridcell"`, etc.).

* [ ] **4. Core Game Logic:**
  * [ ] Implement board initialization logic (4x4 grid, initial tiles).
  * [ ] Develop movement functions (left, right, up, down). Consider using `useReducer` for state management if complexity warrants.
  * [ ] Implement tile merging logic.
  * [ ] Add new tile generation after each move.
  * [ ] Calculate and update the score.
  * [ ] Detect game over conditions (win/lose).

* [ ] **5. `useGameStorage` Hook for Persistence:**
  * [ ] Create the `useGameStorage` custom hook.
  * [ ] Implement functions to save/load game state (board, score) to/from `localStorage`.
  * [ ] Implement functions to save/load best score to/from `localStorage`.
  * [ ] Implement functions to save/load settings (vibration on/off) to/from `localStorage`.
  * [ ] Integrate initial loading of saved state on app mount.
  * [ ] Implement auto-saving on every valid move.

* [ ] **6. `useSwipeControls` Hook for Touch & Keyboard Input:**
  * [ ] Create the `useSwipeControls` custom hook.
  * [ ] Integrate `react-swipeable` for swipe detection (up, down, left, right) with a 15px threshold.
  * [ ] Add `touch-action: pan-x pan-y;` style to the game board container using CSS Modules.
  * [ ] Implement **basic keyboard navigation** (Arrow Keys) for accessibility.
  * [ ] (Optional Advanced) Implement visual drag animation during swipe.

* [ ] **7. Merge Feedback (Vibration & Animation):**
  * [ ] Implement `vibrateOnMerge` function using `navigator.vibrate(50)`.
  * [ ] Create a settings component (e.g., a simple modal) accessible via `SettingsButton`.
  * [ ] Include a toggle switch in settings to enable/disable vibration.
  * [ ] Connect the toggle state to the settings saved in `localStorage` via `useGameStorage`.
  * [ ] Conditionally call `vibrateOnMerge` (if enabled) after a successful merge.
  * [ ] Use **Framer Motion** for smooth tile animations (appearance, movement, merge).

* [ ] **8. Optimizations & PWA:**
  * [ ] Apply `will-change: transform, opacity;` style to tiles (managed by Framer Motion likely) using CSS Modules.
  * [ ] (Optional) Configure `vite-plugin-pwa` for basic offline capabilities and a custom splash screen.
  * [ ] Review overall performance on mobile devices.

* [ ] **9. Final Refinement & Testing:**
  * [ ] Test thoroughly on various mobile screen sizes.
  * [ ] Adjust styles and UX as needed using CSS Modules.
  * [ ] Validate persistence and settings functionality.
  * [ ] Test keyboard navigation and ARIA attributes.

* [ ] **10. (Optional) Unit/Integration Tests:**
  * [ ] Set up Vitest.
  * [ ] Write tests for core game logic and custom hooks.

## TODOs Futuros / Mejoras:
* [ ] Implementar control por teclado (flechas)
* [ ] Implementar condición de victoria (llegar a 2048)
* [ ] Añadir animaciones (movimiento, fusión, aparición)
* [ ] Implementar funcionalidad de Ajustes (Settings) (ej: tamaño de tablero, tema)
