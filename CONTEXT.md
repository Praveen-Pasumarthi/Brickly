# Brickly Project Context

## Overview
Brickly is a premium block puzzle game (Tetris/1010-style) built as a single-page HTML5 Canvas application, packaged for Android and iOS using Capacitor.

## Project Structure
```
Brickly/
├── index.html                    # Single-page app entry point
├── style.css                     # All UI styling (1626 lines)
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
│       │   ├── bgm.wav           # Active BGM (seamless loop)
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
│   ├── game.js                   # Main orchestrator, game loop, UI bindings (1792 lines)
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
├── android/                      # Native Android project (Capacitor)
└── ios/                          # Native iOS project (Capacitor)
```

## Audio System Architecture

### Voice System (`js/audio.js`)
The `AudioManager` class handles all audio. The `speak()` method (lines 341-446) plays pre-recorded MP3 clips using Web Audio API for line-clear praise announcements.

#### Voice Phrase Mapping
Phrases are triggered from `js/game.js` lines 469-487 when lines are cleared or combos are reached:

| Trigger | Phrase | Condition | Voice Gender | MP3 File |
|---|---|---|---|---|
| Combo 20, 30, 40... | "Fantastic" | Combo reaches multiple of 10 (≥20) | male | `assets/audio/male_voices/fantastic.mp3` |
| Combo 10, 20, 30... | "Perfect" | Combo reaches multiple of 10 (≥10) | male | `assets/audio/male_voices/perfect.mp3` |
| 4+ simultaneous | "Excellent" | 4+ lines cleared at once | female | `assets/audio/female_voices/excellent.mp3` |
| 3 simultaneous | "Amazing" | 3 lines cleared at once | female | `assets/audio/female_voices/amazing.mp3` |
| 2 simultaneous | "Great" | 2 lines cleared at once | female | `assets/audio/female_voices/great.mp3` |
| Board clear | "Unbelievable" | Entire board emptied | male | `assets/audio/male_voices/unbelievable.mp3` |

Unused voices: `good.mp3`, `wonderful.mp3`

#### Gender Map (`audio.js` lines 349-358)
```javascript
const genderMap = {
    "Good": "female",  // Only female_voices/good.mp3 exists
    "Great": "female",
    "Excellent": "female",
    "Wonderful": "male",
    "Amazing": "female",
    "Fantastic": "male",
    "Perfect": "male",
    "Marvelous": "female",  // No MP3 exists - falls back to SpeechSynthesis
    "Unbelievable": "female"
};
```

#### Voice File Map (`audio.js` lines 361-370)
```javascript
const voiceFiles = {
    "Good":         { female: "assets/audio/female_voices/good.mp3" },
    "Great":        { female: "assets/audio/female_voices/great.mp3" },
    "Excellent":    { female: "assets/audio/female_voices/excellent.mp3" },
    "Wonderful":    { male: "assets/audio/male_voices/wonderful.mp3" },
    "Amazing":      { female: "assets/audio/female_voices/amazing.mp3" },
    "Fantastic":    { male: "assets/audio/male_voices/fantastic.mp3" },
    "Perfect":      { male: "assets/audio/male_voices/perfect.mp3" },
    "Unbelievable": { male: "assets/audio/male_voices/unbelievable.mp3" }
};
```

#### Voice Playback Implementation
The `speak()` method uses Web Audio API to play MP3 files:
1. Initializes AudioContext and resumes if suspended
2. Fetches the MP3 file via `fetch()`
3. Decodes audio data via `this.ctx.decodeAudioData()`
4. Creates a `BufferSource`, routes through a `voiceGain` node (0.25 volume), then to `masterGain`
5. Falls back to SpeechSynthesis for phrases without MP3 (e.g. "Marvelous")

### Floating Text System (`js/particles.js`)
The `addFloatingText()` method (lines 37-49) displays reward messages:
- `decay: 0.008` — text stays visible ~2 seconds
- `vy: -1.2` — slow upward float
- Special styling for praise words (gold sunblast + gradient text)

### Line Clearing Flow
1. After placing a block shape, `board.checkFullLines()` is called (game.js:442)
2. Combo streak increments if lines cleared (game.js:446)
3. Score calculated: `clearedLinesCount * 100 * comboStreak + streakBonus` (game.js:452-453)
4. Particle effects spawned along cleared rows/columns (game.js:470)
5. `audio.playClear(comboStreak)` plays arpeggio sound (game.js:471)
6. Voice announcement triggered based on achievement tier (game.js:473-517)
7. `board.clearLines(rows, cols)` zeros out cells (game.js:544)

### SFX (Synthesized Sounds)
- `playDragStart()` - High-frequency tick on drag start
- `playPlace()` - Mechanical grid placement thud
- `playClear(comboCount)` - Sparkling arpeggio scaling with combo
- `playGameOver()` - Descending minor arpeggio
- `playLevelWin()` - Uplifting sweeping major arpeggio

## Build Process
- Web: Serve root directory directly (index.html is entry point)
- Mobile: Run `node scripts/build-mobile-assets.mjs` then `npx cap sync`
- The build script copies `assets/` to `dist/`

## Key Conventions
- All game state managed in `game.js` (orchestrator pattern)
- Board is a 2D matrix in `engine.js` (0 = empty, >0 = filled)
- Themes defined in `themes.js` with color palettes
- LocalStorage persistence via `storage.js` (settings, high scores, game state)
- No framework dependencies - vanilla JS with ES modules

## Settings Persistence
Sound, BGM, and vibration settings are saved to LocalStorage via `StorageManager.saveSettings()` and restored on startup. The `saveSettingsState()` function (game.js:1710) saves current toggle states, and initialization reads them back with `settings.sfx !== false` defaults.

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
