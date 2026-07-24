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
*   *Grand Master*: Score 5,000+ points in Classic mode.
*   *Combo Legend*: Reach a 15x combo streak.
*   *Skin Collector*: Unlock 10 different themes.
*   *Streak Keeper*: Maintain a 7-day daily challenge streak.

### Technical Implementation Files
*   [index.html](file:///c:/Users/user/Documents/GitHub/Brickly/index.html): Stats and Achievements tabbed modal, unlock toast notification.
*   [style.css](file:///c:/Users/user/Documents/GitHub/Brickly/style.css): Progress bars, custom badge icons, toast fade-in animations.
*   [js/game.js](file:///c:/Users/user/Documents/GitHub/Brickly/js/game.js): Increments and saves stats, checks achievement logic on specific gameplay milestones.
*   [js/storage.js](file:///c:/Users/user/Documents/GitHub/Brickly/js/storage.js): Persists lifetime statistics and unlocked achievement state.

---

## 4. Theme Collection & Unlock System
Transforms the visual skins into collectible items to give players a progression loop.

### Mechanics
*   **Base Skins**: 6 themes unlocked by default (e.g., Classic Pink, Neon Cyberpunk, Minimalist Pastel).
*   **Locked Skins**: The remaining 32 themes are locked behind achievements or coin costs.
*   **Unlock Requirements Examples**:
    *   *Volcanic Theme*: Pay 400 Brick Coins.
    *   *Sakura Theme*: Reach level 50 in Missions mode.
    *   *Lava Theme*: Clear 1,000 lines overall.
*   **Redesigned Skin Picker**:
    *   Displays locked themes as faded out with a lock icon.
    *   Tapping shows a tooltip with unlock requirements and a "Buy" button if coins are sufficient.

### Technical Implementation Files
*   [js/themes.js](file:///c:/Users/user/Documents/GitHub/Brickly/js/themes.js): Store metadata (cost, achievement key) for each theme configuration.
*   [js/game.js](file:///c:/Users/user/Documents/GitHub/Brickly/js/game.js): Render locked overlay on grid items, handle purchase transaction validation.
*   [js/storage.js](file:///c:/Users/user/Documents/GitHub/Brickly/js/storage.js): Save the player's collection of unlocked themes.

---

## 5. Interactive Tutorial Overlay
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
