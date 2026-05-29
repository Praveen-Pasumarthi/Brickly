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
│   ├── engine.js                 # Board grid matrix, placement validation, line clearing
│   ├── spawner.js                # Shape database, weighted spawning, tray management
│   ├── audio.js                  # Web Audio API synthesis + voice playback
│   ├── particles.js              # Particle system, floating text, screen shake
│   ├── themes.js                 # 18 visual themes with color palettes
│   ├── modes.js                  # 500 adventure levels + Blast Mode bomb logic
│   └── storage.js                # LocalStorage persistence
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
`vibrationEnabled` boolean, persisted to LocalStorage. Controls all haptic feedback. Toggle in settings modal uses `.settings-toggle-icon` with `.off` class (red strikethrough line).

## Audio System Architecture

### BGM (`js/audio.js`)
- **Active track:** `assets/audio/bgm/gaming_music.mp3` (from Pixabay)
- **Artist:** ViacheslavStarostin
- **Track name:** "Gaming Game Video Game Music"
- **License:** Pixabay Content License (free for commercial use, no attribution required)
- **Playback:** HTMLAudioElement, looped
- **Volume cap:** BGM volume capped at 40% max (`Math.min(0.4, vol)` in `setBgmVolume()`)
- **SFX volume:** Controlled via `masterGain.gain.value` range 0-2.5 (`vol * 2.5` in `setSfxVolume()`)
- **Volume restored on startup** from `settings.sfxVolume` / `settings.bgmVolume` (0-100 slider values)
- **Gameplay volume:** slider value × 0.3 (min 0.05) for better SFX audibility
- **Menu return:** restores exact saved slider volume from settings

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
- `decay: 0.012` — text fades in ~1.2 seconds
- `vy: -0.9` — moderate upward float
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
- `playTap()` - Menu/settings button clicks (mutes with Sound volume slider)

## Settings & Pause System

### Settings Modal
Accessible from main menu (gear icon) and in-game (gear icon). Shows/hides buttons based on context:

**Main Menu Mode:**
- Sound volume slider (icon click toggles mute)
- Music volume slider (icon click toggles mute)
- Vibration toggle
- Menu Theme button
- Rate Us, Feedback, Privacy Policy, Terms of Service buttons

**In-Game Mode (Pauses game):**
- Sound volume slider, Music volume slider, Vibration toggle
- Resume button (top of actions)
- Home, Restart, Change Skin buttons
- Rate Us, Feedback, Privacy, Terms are hidden

### Volume Sliders
- `input[type=range]` with values 0-100
- Icon click mutes/unmutes (remembers last non-zero volume)
- Muted state: `.settings-slider-icon.muted` class (red strikethrough line)
- SFX volume stored as `sfxVolume`, BGM as `bgmVolume` in settings
- Slider thumb: 20px white circle, centered on 5px track via `margin-top: -7.5px`
- Vibration is still a toggle (`.settings-toggle-icon` with `.off` class)

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

### Main Menu High Score
- Displayed underneath the game mode buttons inside the `.arcade-layout` container for perfect centering.
- Styled using `var(--btn1-from)` CSS custom property for theme-matching color with `font-weight: 800`.

## Theme System

### Gameplay Themes (18)
- Defined in `themes.js` with color palettes
- Theme shifts every 15 block placements (instant, 350ms smooth color interpolation, no overlay)
- Theme shift triggers heavy haptic feedback
- Transition: 350ms canvas color interpolation via smoothstep easing (no blur overlay or body bg interpolation)
- `applyTheme()` selectively removes old theme classes instead of `className=''` to prevent black flash

### Menu Background Themes (10)
Cycled via Settings → Menu Theme button. Each applies a gradient to `#main-menu-overlay` and defines CSS custom properties for button colors:
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

Each theme also colors:
- Settings gear button (`.menu-theme-* .arcade-settings-btn`)
- Play buttons via `--btn1-from/to` through `--btn5-from/to` custom props used by `.btn-mode-1` through `.btn-mode-5`
- High score text color via `var(--btn1-from)`
- Ambient floating blocks with matching gradient
- Menu theme persists via LocalStorage

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
Sound volume (`sfxVolume`), Music volume (`bgmVolume`), and Vibration (`vibration`) are saved to LocalStorage via `StorageManager.saveSettings()` and restored on startup. Volume slider values stored as 0-100 integers.

## Game Modes

### Classic (8x8)
- Board prefilled to 50% with actual game shapes via `board.prefillGrid(50, SHAPES)`
- Shape-based fill algorithm places random shapes from a subset, checks no full lines created
- Prefill wave animation: bottom-to-top row reveal at 30ms per row

### Classic XL (10x10)
- Same as Classic but 10x10 board, 50% pre-filled

### Endless (10x10)
- Empty board (no prefill), old classic behavior on 10x10 grid

### Blast Mode (8x8)
- 50% pre-filled board, bombs spawn with staggered timers

### Missions (500 Levels)
- **500 adventure levels** with progressive difficulty across 10 rotating objective templates
- First 10 levels hand-crafted with specific grids/names, levels 11-500 procedurally generated
- **6 objective types**: `scoreTarget` (score points), `linesTarget` (clear N lines), `preFilledTarget` (cover gold blocks), `comboTarget` (reach N× combo streak), `placementsTarget` (place N blocks), `linesOneTurnTarget` (clear N lines in one placement)
- Levels cycle through 10 templates: pure lines, pure score, gold blocks, combo streak, placements, one-turn clear, score+lines, gold+combo, lines+combo, lines+placements
- Levels start locked; completing level N unlocks level N+1
- Clicking Missions opens **Level Select** overlay with premium glass-morphism UI
  - **Locked** levels: grayed out with lock icon
  - **Completed** levels: green tint with checkmark, no click
  - **Current** level: gold glow with pulsing animation, clickable to start
  - Auto-scrolls to the current level on open
  - Track progress via `StorageManager.getAdventureProgress()`
- "Next Level" on victory starts next level directly; "Levels" button returns to Level Select
- `checkModeVictory()` checks all active objectives; progress bar shows aggregate completion
- Tray difficulty scales with level number (uses same tier system as adventure mode)
- Scoring bonus: 100 points per gold block covered by a placed shape

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

## Data Backup Strategy
- **Android Auto Backup**: Enabled via `AndroidManifest.xml` with both legacy (`fullBackupContent`) and modern (`dataExtractionRules`) attributes
- `backup_rules.xml` (API 24-30): uses `<full-backup-content>` with `<include domain="sharedpref|database|file|root" path="."/>`
- `data_extraction_rules.xml` (API 31+): uses `<data-extraction-rules>` with `<cloud-backup>` and `<device-transfer>` sections
- WebView localStorage (stored in `app_webview/Default/Local Storage/leveldb/`) is covered by `<include domain="root" path="app_webview/"/>`
- On reinstall, Android Auto Backup restores all app data (settings, progress, high scores) automatically
- iOS iCloud backup is automatic (data stored in Documents directory by default)
- Until Firebase integration is complete, Auto Backup is the only data persistence mechanism across reinstalls

## Pending TODOs
- Create a new email ID `brickly.game@gmail.com` for feedback and contact purposes (currently `praveensssvv@gmail.com` in legal docs)
- Replace placeholder App Store ID with real ID when published
- Firebase integration (see above)
- **Theme Textures:** Add subtle tileable pattern textures (marble, carbon fiber, linen, etc.) behind the game grid during theme transitions. User will download textures to `assets/images/textures/` — wire them into `themes.js` and canvas rendering with fade-in transitions
- Test all features on physical device: haptic feedback, volume sliders, pre-filled boards, theme transitions, menu themes, Endless mode