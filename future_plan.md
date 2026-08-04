# Brickly — Future Feature Roadmap & Plans

This document outlines the planned future enhancements and modules to expand Brickly into a highly engaging, polished, and social block puzzle game.

---

## 1. Power-ups & Booster Shop
Adds a strategic layer to gameplay and introduces a soft currency economy to drive repeat play.

### Mechanics & Economy
*   **Brick Coins (Soft Currency)**:
    *   `+1` coin per line cleared.
    *   `+10` coins per completed game.
    *   `+50` coins per high score beaten.
*   **Power-up Items**:
    1.  **Rotate**: Rotate any block in the spawner tray 90 degrees before placing it.
    2.  **Trash/Swap**: Discard one block from the tray and draw a random new one.
    3.  **Hammer**: Select and clear any single block directly from the board grid.
*   **Booster Shop UI**:
    *   Accessible via a menu button or directly from the in-game HUD.
    *   A premium glassmorphic modal overlay to purchase power-ups using accumulated coins.
    *   Displays current coin balance and item inventory.

### Technical Implementation Files
*   [index.html](file:///c:/Users/user/Documents/GitHub/Brickly/index.html): Markup for shop overlay and coin indicators.
*   [style.css](file:///c:/Users/user/Documents/GitHub/Brickly/style.css): Shop layout, item grid styles, and animations for coin collections.
*   [js/game.js](file:///c:/Users/user/Documents/GitHub/Brickly/js/game.js): Integrates coin additions, slots interactions for power-ups, and buy events.
*   [js/spawner.js](file:///c:/Users/user/Documents/GitHub/Brickly/js/spawner.js): Rotate and swap algorithms on tray slots.
*   [js/storage.js](file:///c:/Users/user/Documents/GitHub/Brickly/js/storage.js): Persistence for coins and power-up inventory counts.

---

## 2. Global Leaderboards
Encourages global competition by leverage the existing Firebase/Firestore backend.

### Mechanics
*   **Global Board**: Displays the top 50 scores globally for each score-based mode: Classic, Classic XL, Endless, and Blast.
*   **Leaderboard UI**:
    *   A scrollable overlay screen with tabbed navigation to switch between modes.
    *   Lists ranking, player avatar/initials, name, date, and score.
    *   Highlights the player's personal rank at the bottom of the list.

### Technical Implementation Files
*   [index.html](file:///c:/Users/user/Documents/GitHub/Brickly/index.html): Add leaderboard overlay and main menu access button.
*   [style.css](file:///c:/Users/user/Documents/GitHub/Brickly/style.css): Rankings list layout, medals (Gold, Silver, Bronze) styling for the top 3 spots.
*   [js/firebase.js](file:///c:/Users/user/Documents/GitHub/Brickly/js/firebase.js): Methods to fetch global high scores and save local scores to the shared cloud leaderboard.
*   [js/game.js](file:///c:/Users/user/Documents/GitHub/Brickly/js/game.js): Wire UI click actions, populate/render leaderboard items.

---

## 3. Advanced Statistics & Achievements
Keeps players engaged by rewarding progression milestones and detailing their gameplay habits.

### Stats Panel
Tracks and displays lifetime metrics:
*   Total lines cleared.
*   Total pieces placed.
*   Highest combo streak.
*   Total revives used.
*   Total games played per mode.

### Achievements System
15+ unlockable achievements granting unique badges and bonus coins:
*   *Combustion*: Clear 4 lines at once in Blast mode.
*   *Grand Master*: Score 1,000,000+ points in Classic mode.
*   *Combo Legend*: Reach a 20x combo streak.
*   *Streak Keeper*: Maintain a 7-day daily challenge streak.

### Technical Implementation Files
*   [index.html](file:///c:/Users/user/Documents/GitHub/Brickly/index.html): Stats and Achievements tabbed modal, unlock toast notification.
*   [style.css](file:///c:/Users/user/Documents/GitHub/Brickly/style.css): Progress bars, custom badge icons, toast fade-in animations.
*   [js/game.js](file:///c:/Users/user/Documents/GitHub/Brickly/js/game.js): Increments and saves stats, checks achievement logic on specific gameplay milestones.
*   [js/storage.js](file:///c:/Users/user/Documents/GitHub/Brickly/js/storage.js): Persists lifetime statistics and unlocked achievement state.

---

## 4. Interactive Tutorial Overlay
Polishes the first-user onboarding experience to improve player retention.

### Tour Stages
1.  **Welcome**: Short introduction to Brickly.
2.  **Basic Placement**: Spotlight on the spawner tray and board. Guides the user to drag a 3-block shape to highlight snapping.
3.  **Line Clearance**: Asks the user to complete a row/column to trigger a line clear.
4.  **Combos**: Explains how the 10-second combo ring works.
5.  **Special Modes**: Explains Blast mode (defusing bombs) and Missions (objectives).

### Technical Implementation Files
*   [index.html](file:///c:/Users/user/Documents/GitHub/Brickly/index.html): Spotlight overlay structure and tooltip card.
*   [style.css](file:///c:/Users/user/Documents/GitHub/Brickly/style.css): Dimming background masking, active item highlights, and bounce pointers.
*   [js/game.js](file:///c:/Users/user/Documents/GitHub/Brickly/js/game.js): Controls step progression, prevents normal board drag operations outside tutorial instructions.

---

## 5. Daily Challenge Mode
One predefined board per day — every player gets the same layout, creating fair global competition.

### Mechanics
*   **Daily Seed**: A seeded RNG generates the same pre-filled board and tray sequence for all players each day (UTC midnight reset).
*   **Scoring**: Standard scoring rules apply. Score is final once the game ends (no revives).
*   **Leaderboard**: A dedicated "Today" tab on the Global Leaderboard shows top 50 scores for the current day. Resets daily.
*   **Streak Badge**: Consecutive daily plays earn a streak counter displayed on the main menu.

### Technical Implementation Files
*   [js/game.js](file:///c:/Users/user/Documents/GitHub/Brickly/js/game.js): Daily seed RNG, mode entry, score submission.
*   [js/engine.js](file:///c:/Users/user/Documents/GitHub/Brickly/js/engine.js): Seeded grid prefill using deterministic random.
*   [js/firebase.js](file:///c:/Users/user/Documents/GitHub/Brickly/js/firebase.js): Daily leaderboard read/write in Firestore.
*   [index.html](file:///c:/Users/user/Documents/GitHub/Brickly/index.html): "Daily" button on main menu, daily leaderboard tab.

---

## 6. Combo Milestone Visuals
Bigger, more satisfying visual celebrations at key combo thresholds to reinforce the reward loop.

### Milestones
*   **Combo x10**: Screen-wide radial pulse + "x10!" floating text with glow effect.
*   **Combo x20**: Radial pulse + particle burst ring expanding outward from the board center.
*   **Combo x50**: Full board flash + confetti particle shower + "COMBO x50!" mega text.

### Technical Implementation Files
*   [js/particles.js](file:///c:/Users/user/Documents/GitHub/Brickly/js/particles.js): New milestone-specific particle emitters (pulse ring, confetti burst).
*   [js/game.js](file:///c:/Users/user/Documents/GitHub/Brickly/js/game.js): Detect combo milestones and trigger visual effects.
*   [style.css](file:///c:/Users/user/Documents/GitHub/Brickly/style.css): CSS animations for screen pulse and mega text.

---

## 7. Screen Transitions
Smooth visual transitions between menu and gameplay to feel more polished.

### Transitions
*   **Menu → Gameplay**: Board and tray fade+scale in from center over 300ms.
*   **Gameplay → Menu**: Reverse — game elements fade+scale out while menu overlay fades in.
*   **Game Over / Victory**: Overlay slides up from bottom with spring easing.

### Technical Implementation Files
*   [style.css](file:///c:/Users/user/Documents/GitHub/Brickly/style.css): CSS transition classes for fade/scale/slide animations.
*   [js/game.js](file:///c:/Users/user/Documents/GitHub/Brickly/js/game.js): Apply transition classes on mode switches and overlay shows/hides.
