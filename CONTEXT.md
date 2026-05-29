# Brickly Project Context

## Overview
Brickly is a premium block puzzle game (Tetris/1010-style) built as a single-page HTML5 Canvas application, packaged for Android and iOS using Capacitor.

## Project Structure
```
Brickly/
├── index.html                    # Single-page app entry point
├── style.css                     # All UI styling
├── package.json                  # Capacitor + dependencies
├── capacitor.config.json         # Mobile app config (appId: com.brickly.game)
├── MOBILE.md                     # Build instructions
├── CONTEXT.md                    # This file - project context for AI sessions
│
├── assets/                       # Static assets
│   ├── images/
│   │   ├── logo.png              # App logo
│   │   └── ingame_logo.png       # In-game logo
│   └── audio/
│       ├── bgm/                  # Background music
│       │   ├── gaming_music.mp3  # Active BGM (from Pixabay, CC0 license)
│       │   ├── bgm.wav           # Original BGM (unused)
│       │   ├── original_synth.wav
│       │   └── Glass_Garden_Paths.mp3
│       ├── male_voices/          # Male voice clips
│       │   ├── fantastic.mp3
│       │   ├── perfect.mp3
│       │   ├── unbelievable.mp3
│       │   └── wonderful.mp3
│       └── female_voices/        # Female voice clips
│           ├── amazing.mp3
│           ├── excellent.mp3
│           ├── good.mp3
│           └── great.mp3
│
├── js/                           # Core game source code
│   ├── game.js                   # Main orchestrator, game loop, UI bindings
│   ├── engine.js                 # Board grid matrix, placement validation, line clearing (191 lines)
│   ├── spawner.js                # Shape database, weighted spawning, tray management (1239 lines)
│   ├── audio.js                  # Web Audio API synthesis + voice playback (447 lines)
│   ├── particles.js              # Particle system, floating text, screen shake (520 lines)
│   ├── themes.js                 # 18 visual themes with color palettes (886 lines)
│   ├── modes.js                  # 10 adventure levels + Blast Mode bomb logic (279 lines)
│   └── storage.js                # LocalStorage persistence (195 lines)
│
├── scripts/                      # Build utilities
│   ├── build-mobile-assets.mjs   # Copies web assets to dist/
│   └── generate_wav.mjs          # Generates BGM WAV from scratch
│
├── utils/                        # Dev utility scripts (not needed for game)
│   ├── font_preview.html
│   ├── remove_bg.js
│   ├── rename.js
│   └── rename_packages.js
│
├── legal/                        # Legal pages (included in dist/ build)
│   ├── privacy.html              # Privacy Policy page
│   └── terms.html                # Terms of Service page
│
├── android/                      # Native Android project (Capacitor)
└── ios/                          # Native iOS project (Capacitor)
```

## Haptic Feedback System (`js/game.js`)

### Plugin Access
Capacitor 8 does NOT have `window.Capacitor.registerPlugin`. The Haptics plugin is auto-registered at `window.Capacitor.Plugins.Haptics`.

```javascript
let _hapticsPlugin = undefined;
function getHaptics() {
    if (_hapticsPlugin === undefined) {
        _hapticsPlugin = (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics)
            ? window.Capacitor.Plugins.Haptics
            : null;
    }
    if (_hapticsPlugin === null && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics) {
        _hapticsPlugin = window.Capacitor.Plugins.Haptics;
    }
    return _hapticsPlugin;
}
```

### Haptic Durations
Uses `Haptics.vibrate({ duration })` instead of `Haptics.impact()` — the impact method produces vibrations too short to perceive on many Android devices.

| Type | Duration | When Triggered |
|------|----------|----------------|
| light | 50ms | Piece pickup, snap, menu button taps |
| medium | 70ms | Normal block placement |
| heavy | 100ms | Line clear, theme shift |
| double | 60ms x2 (100ms gap) | Perfect placement |

### Web Fallback
`navigator.vibrate()` is used as fallback (works in Android Chrome, NOT on iOS Safari).

### Vibration Toggle
`vibrationEnabled` boolean, persisted to LocalStorage. Controls all haptic feedback.

## Audio System Architecture

### BGM (`js/audio.js`)
- **Active track:** `assets/audio/bgm/gaming_music.mp3` (from Pixabay)
- **Artist:** ViacheslavStarostin
- **Track name:** "Gaming Game Video Game Music"
- **License:** Pixabay Content License (free for commercial use, no attribution required)
- **Playback:** HTMLAudioElement, looped
- **Volume levels:**
  - Default/startup: 0.20
  - Gameplay: 0.15
  - Main Menu: 0.20

### Voice System (`js/audio.js`)
The `speak()` method plays pre-recorded MP3 clips for line-clear praise announcements.

#### Voice Phrase Mapping
Phrases are triggered from `js/game.js` when lines are cleared or combos are reached:

| Trigger | Phrase | Condition | Voice Gender | MP3 File |
|---|---|---|---|---|
| Combo 20, 30, 40... | "Fantastic" | Combo reaches multiple of 10 (≥20) | male | `assets/audio/male_voices/fantastic.mp3` |
| Combo 10, 20, 30... | "Perfect" | Combo reaches multiple of 10 (≥10) | male | `assets/audio/male_voices/perfect.mp3` |
| 4+ simultaneous | "Excellent" | 4+ lines cleared at once | female | `assets/audio/female_voices/excellent.mp3` |
| 3 simultaneous | "Amazing" | 3 lines cleared at once | female | `assets/audio/female_voices/amazing.mp3` |
| 2 simultaneous | "Great" | 2 lines cleared at once | female | `assets/audio/female_voices/great.mp3` |
| Board clear | "Unbelievable" | Entire board emptied | male | `assets/audio/male_voices/unbelievable.mp3` |

Unused voices: `good.mp3`, `wonderful.mp3`

### Floating Text System (`js/particles.js`)
The `addFloatingText()` method displays reward messages on the canvas:
- `decay: 0.006` — text stays visible ~2.5 seconds
- `vy: -0.7` — slow upward float
- Base font size: `16 * scale` pixels
- Combo text scale: `0.7 + (comboStreak * 0.05)` (starts smaller, grows slower)
- Special styling for praise words (gold sunblast + gradient text)

### Line Clearing Flow
1. After placing a block shape, `board.checkFullLines()` is called
2. Combo streak increments if lines cleared
3. Score calculated: `clearedLinesCount * 75 * comboStreak + streakBonus`
   - `streakBonus = (comboStreak - 1) * 100` (for combo streak > 1)
4. Particle effects spawned along cleared rows/columns
5. `audio.playClear(comboStreak)` plays arpeggio sound
6. Voice announcement triggered based on achievement tier
7. `board.clearLines(rows, cols)` zeros out cells

### Score System
| Source | Points |
|--------|--------|
| Per block placed | +1 |
| Perfect spot bonus | +20 |
| 1 line cleared | 75 |
| 2 lines cleared | 150 |
| 3 lines cleared | 225 |
| 4 lines cleared | 300 |
| Combo x2 (1 line) | 250 |
| Combo x3 (1 line) | 425 |
| Board clear bonus | 300 |

### SFX (Synthesized Sounds)
- `playDragStart()` - High-frequency tick on drag start
- `playPlace()` - Mechanical grid placement thud
- `playClear(comboCount)` - Sparkling arpeggio scaling with combo
- `playGameOver()` - Descending minor arpeggio
- `playLevelWin()` - Uplifting sweeping major arpeggio

## Settings & Pause System

### Settings Modal
Accessible from main menu (gear icon) and in-game (gear icon). Shows/hides buttons based on context:

**Main Menu Mode:**
- Sound toggle, Music toggle, Vibration toggle
- Menu Theme button
- Rate Us, Feedback, Privacy Policy, Terms of Service buttons

**In-Game Mode (Pauses game):**
- Sound toggle, Music toggle, Vibration toggle
- Resume button (top of actions)
- Home, Restart, Change Skin buttons
- Rate Us, Feedback, Privacy, Terms are hidden

### Pause System (`gamePaused` state)
- `openSettings()` sets `gamePaused = true` during gameplay
- `closeSettings()` sets `gamePaused = false`
- When paused:
  - Combo timer countdown is frozen
  - Piece dragging is blocked (`pointerdown` handler checks `gamePaused`)

### About Modal
- Brickly logo, version (v0.1.0), description
- Developer: Pasumarthi Venkata Praveen
- Music: "Gaming Game Video Game Music" by ViacheslavStarostin from Pixabay (Pixabay Content License)
- Privacy Policy link (opens in legal modal)
- Copyright: © 2026 Brickly

### Legal Modals (Privacy / Terms)
Privacy Policy and Terms of Service open as **in-app modal overlays** with an iframe, NOT as external pages. This provides a close button (✕) and backdrop tap to dismiss.
- Content loaded from `legal/privacy.html` and `legal/terms.html`
- Files are copied to `dist/legal/` during build

### Main Menu Footer
- Version number (`v0.1.0`)
- About button → opens About modal
- Privacy button → opens Privacy Policy in legal modal

## Theme System

### Gameplay Themes (18)
- Defined in `themes.js` with color palettes
- Theme shifts every 15 block placements (instant, no overlay)
- Theme shift triggers heavy haptic feedback

### Menu Background Themes (10)
Cycled via Settings → Menu Theme button. Each applies a gradient to `#main-menu-overlay`:
- **Royal** — Deep Blue → Dark Navy
- **Neon** — Purple → Dark Violet
- **Twilight** — Deep Purple → Navy
- **Teal** — Teal → Dark Teal
- **Obsidian** — Black → Rich Black (Dark Luxury)
- **Violet** — Deep Purple → Electric Indigo (Neon Gaming)
- **Rose** — Near Black → Dark Crimson (Dark Luxury)
- **Emerald** — Deep Teal → Vivid Green (Neon Gaming)
- **Chrome** — Dark Slate → Steel Blue (Dark Luxury)
- **Crimson** — Deep Red → Dark Red

Each theme also colors the settings gear button and ambient floating blocks with a matching gradient. Menu theme persists via LocalStorage.

## Build Process
- Web: Serve root directory directly (index.html is entry point)
- Mobile: Run `npm run build` then `npx cap sync`
- The build script copies `assets/`, `js/`, `index.html`, `style.css`, `legal/` to `dist/`
- Capacitor config: `webDir: "dist"`

## Key Conventions
- All game state managed in `game.js` (orchestrator pattern)
- Board is a 2D matrix in `engine.js` (0 = empty, >0 = filled)
- Themes defined in `themes.js` with color palettes
- LocalStorage persistence via `storage.js` (settings, high scores, game state)
- No framework dependencies - vanilla JS with ES modules
- No bundler - bare specifiers like `import { Haptics } from '@capacitor/haptics'` do NOT work
- Capacitor plugins accessed via `window.Capacitor.Plugins.*` (not `registerPlugin()`)

## Capacitor Plugins
- `@capacitor/haptics` — Haptic feedback via `window.Capacitor.Plugins.Haptics`
- `@capacitor/browser` — In-app browser for external URLs via `window.Capacitor.Plugins.Browser`
- `@capacitor-community/text-to-speech` — Voice announcements

### URL Helper (`game.js`)
External links use a helper function that opens in Capacitor's in-app browser (with back/close button) on device, or falls back to `window.open` in browser:
```javascript
function openUrl(url) {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Browser) {
        window.Capacitor.Plugins.Browser.open({ url });
    } else {
        window.open(url, '_blank');
    }
}
```

**Important:** `openUrl()` only works with http/https URLs. Do NOT use it for `mailto:`, `market://`, or `itms-apps://` schemes — these will crash. Use `window.open()` directly for those.

Rate Us and Feedback buttons use `window.open()` directly:
- Rate Us: opens Google Play Store URL via `window.open()`
- Feedback: opens `mailto:` link via `window.open()`

## Settings Persistence
Sound, Music, and vibration settings are saved to LocalStorage via `StorageManager.saveSettings()` and restored on startup.

## Firebase Integration (In Progress)

### Current Status
- User has NOT yet created a Firebase project
- Apple Sign-In is SKIPPED — using Google Sign-In only
- Next session: User will provide `firebaseConfig` object after setting up Firebase

### Setup Steps for User (Pending)
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create project named `brickly`
3. Add Web app (`</>` icon), nickname `Brickly Web`
4. Copy the `firebaseConfig` object
5. Enable **Google** sign-in under Authentication → Sign-in method
6. Create Firestore Database in test mode

### Implementation Plan
Once user provides `firebaseConfig`:
1. Install: `@capacitor-firebase/authentication`, `@capacitor-firebase/firestore`
2. Integrate Google Sign-In UI into main menu
3. Set up Firestore schema:
   - `users/{uid}/highScores` — Classic, Classic XL scores
   - `users/{uid}/progress` — Adventure level, daily streak
   - `users/{uid}/settings` — Theme, sound preferences
4. Add offline sync (Firestore handles this automatically)
5. Migrate LocalStorage data to Firestore on first sign-in
6. Update `storage.js` to read/write from Firestore when authenticated, LocalStorage when offline

### Dependencies to Install
```bash
npm install firebase @capacitor-firebase/authentication @capacitor-firebase/firestore
```

## Pending TODOs
- Create a new email ID `brickly.game@gmail.com` for feedback and contact purposes
- Replace placeholder App Store ID with real ID when published
- Firebase integration (see above)
- **Theme Textures:** Add subtle tileable pattern textures (marble, carbon fiber, linen, etc.) behind the game grid during theme transitions. User will download textures to `assets/images/textures/` — wire them into `themes.js` and canvas rendering with fade-in transitions
