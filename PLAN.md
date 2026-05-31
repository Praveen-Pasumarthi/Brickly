# Brickly — Game Plan & Reference

> Comprehensive reference for the Brickly block puzzle game. Covers architecture, features, game mechanics, deployment, and key file locations.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Architecture & File Map](#2-architecture--file-map)
3. [Game Modes](#3-game-modes)
4. [Score System](#4-score-system)
5. [High Score System](#5-high-score-system)
6. [Block Shapes & Difficulty Tiers](#6-block-shapes--difficulty-tiers)
7. [Theme System](#7-theme-system)
8. [Audio System](#8-audio-system)
9. [Haptic Feedback](#9-haptic-feedback)
10. [Adventure / Missions Mode](#10-adventure--missions-mode)
11. [AdMob Ads](#11-admob-ads)
12. [Firebase Integration](#12-firebase-integration)
13. [UI Overlays & Modals](#13-ui-overlays--modals)
14. [Settings & Persistence](#14-settings--persistence)
15. [Capacitor & Native Setup](#15-capacitor--native-setup)
16. [Build & Deploy](#16-build--deploy)
17. [Production Deployment Checklist](#17-production-deployment-checklist)

---

## 1. Project Overview
- **Type:** Premium block puzzle game (Tetris/1010-style)
- **Platform:** Single-page HTML5 Canvas app, packaged for Android & iOS via Capacitor
- **Framework:** Vanilla JS with ES modules — no bundler, no framework
- **Entry Point:** `index.html` → `js/game.js` (orchestrator)
- **App ID:** `com.brickly.game`

---

## 2. Architecture & File Map

### Core Source (`js/`)
| File | Role |
|------|------|
| `game.js` | Main orchestrator — game loop, UI bindings, input handling, HUD, all game state |
| `engine.js` | Board grid matrix, placement validation, line clearing logic |
| `spawner.js` | 48 shape definitions, weighted spawn pools, difficulty tiers, tray management |
| `audio.js` | Web Audio API synthesis (SFX) + pre-recorded MP3 voice playback |
| `particles.js` | Particle system, floating text, screen shake, clear effects |
| `themes.js` | 38 gameplay themes with color palettes and block rendering |
| `modes.js` | 500 adventure levels (10 hand-crafted + 490 procedural), Blast Mode bomb logic |
| `storage.js` | LocalStorage persistence — settings, per-mode high scores, game state, adventure progress |
| `firebase.js` | Firebase Auth (Google Sign-In) + Firestore cloud sync |
| `ads.js` | AdMob orchestrator — interstitial + rewarded ads, master enable/disable switch |

### Other Key Files
| File | Role |
|------|------|
| `index.html` | Single-page app — all 13 overlay elements defined here |
| `style.css` | All UI styling — 10 menu themes, modals, HUD, responsive layout |
| `capacitor.config.json` | Capacitor config (`appId: com.brickly.game`, `webDir: "dist"`) |
| `android/` | Native Android project |
| `ios/` | Native iOS project |
| `legal/` | Privacy Policy + Terms of Service HTML pages (loaded in-app) |
| `assets/` | Images (logos, textures) + Audio (BGM, voice clips) |

---

## 3. Game Modes

| Mode | Board | Prefill | Key Feature |
|------|-------|---------|-------------|
| **Classic** | 8×8 | 30% (shape-based) | Core gameplay |
| **Classic XL** | 10×10 | 30% (shape-based) | Larger board |
| **Endless** | 10×10 | None (empty) | No prefill, old classic behavior |
| **Blast** | 8×8 | 30% (shape-based) | Bombs with staggered move timers |
| **Missions** | 8×8 (varies) | Level-specific | 500 adventure levels with objectives |

### Mode-Specific Behavior
- **Classic / Classic XL / Blast**: Spring-reveal prefill animation on start/resume/restart
- **Endless**: Empty board, no prefill animation
- **Missions**: Grid loaded from level definition, moves limit, gold blocks, objective tracking
- **Blast**: Spawns 2 initial bombs (9-move and 14-move timers), danger banner UI

---

## 4. Score System

| Source | Points |
|--------|--------|
| Per block placed | +20 |
| Perfect placement | +100 |
| 1 line cleared | 150 |
| 2 lines cleared | 300 |
| 3 lines cleared | 450 |
| 4 lines cleared | 600 |
| 5+ lines | N × 150 |
| Combo x2–x10 | +250 streak bonus |
| Combo x11–x20 | +500 streak bonus |
| Combo x21–x30 | +750 streak bonus |
| Board clear (entire board emptied) | 2500 |

### Combo System
- Sequential line-clear streak counter
- 10-second combo window (frozen when paused)
- Streak bonus: `tier = floor((streak-1)/10)+1`, `streakBonus = tier × 250`

---

## 5. High Score System

### Per-Mode Storage
Each mode has its own LocalStorage key:
| Mode | Key |
|------|-----|
| Classic | `brickly_hs_classic` |
| Classic XL | `brickly_hs_classic_10` |
| Endless | `brickly_hs_endless` |
| Blast | `brickly_hs_blast` |

### Display Rules
- **In-game HUD** (crown icon + "BEST SCORE" label): Shows best score for the **current mode only**
- **Main menu "High Score"**: Shows **highest across all modes** via `StorageManager.getOverallHighScore()`
- **Game Over modal**: Shows best score for the mode just played

### Migration
- One-time `migrateOldHighScores()` copies old shared keys (`brickly_high_score`) into per-mode keys
- Firebase Firestore sync at `users/{uid}/highScores/{mode}` when signed in

---

## 6. Block Shapes & Difficulty Tiers

### Shape Pool (48 variants)
- 1-cell: `SINGLE`
- 2-cell: `H_LINE_2`, `V_LINE_2`, `DIAG_2`, `DIAG_2_R1`
- 3-cell: `H_LINE_3`, `V_LINE_3`, `V_L_3` (+ rotations), `DIAG_3` (+ rotation)
- 4-cell: Lines, `SQUARE_2`, `T_4`, `Z_4`, `S_4`, `L_4`, `J_4` (with rotations)
- 5-cell: `H_LINE_5`, `V_LINE_5`, `CORNER_3`, `BIG_T`, `BIG_L` (with rotations)
- 6-cell: `RECT_3X2`, `RECT_2X3`
- 7-cell: `L_7` (+ rotations, 10×10 mode only)
- 9-cell: `SQUARE_3`

### Difficulty Tiers
| Tier | Score Range | Character |
|------|-------------|-----------|
| 0 | < 1,000 | Small shapes dominate (1-2 cell heavy) |
| 1 | < 3,000 | Medium shapes gain weight, SQUARE_3 jumps |
| 2 | < 7,500 | Large shapes dominant |
| 3 | 7,500+ | Maximum difficulty, small shapes minimal |

### Starter Pools (first 3 tray fills override normal tiers)
- **Tray 0**: Only 1-2 cell shapes (gentle intro)
- **Tray 1**: 2-3 cell shapes + SQUARE_2
- **Tray 2**: 3-4 cell shapes (T/Z/S/L/J variants)

---

## 7. Theme System

### Gameplay Themes (38)
Classic Pink, Neon Cyberpunk, Woodland Classic, Gemstone Blitz, Minimalist Pastel, Indigo Night, Blush Rose, Winter Snow, Ocean Depths, Aurora Night, Watermelon, Cheese, Crochet Ribbons, Tropical Fruits, Marble, Lava, Sakura, Candy, Brick Wall, Industrial Metal, Slate, Volcanic, Classic Brick, Earthy Dirt, Heavy Metal, Cobblestone, Mahogany Wood, Driftwood, Mosaic Tile, Terrazzo Tile, Ceramic Tile, Porcelain Tile, Tuscan Clay, Marble Tile, Granite Tile, Slate Tile, Tuscan Sun, Spanish Tile

### Theme Mechanics
- Theme shifts every 15 block placements (350ms smooth color interpolation)
- Shift triggers heavy haptic feedback
- `applyTheme()` selectively removes old theme classes (prevents black flash)
- 4 "textured" themes (`brickWall`, `industrialMetal`, `slate`, `volcanic`) use texture images as primary block fill at 90% opacity

### Menu Background Themes (10)
Royal, Neon, Twilight, Teal, Obsidian, Violet, Rose, Emerald, Chrome, Crimson
- Each defines 10 CSS custom properties (`--btn1-from/to` through `--btn5-from/to`) for button gradients
- High score text uses `var(--btn1-from)` for theme-matching color
- Persisted via LocalStorage

### Theme Picker
- Bottom-sheet modal (`#skin-picker-overlay`) with 3-column scrollable grid
- Shows color swatch + 2×2 block dots + theme name per entry
- Auto-scrolls to active theme, applies on tap, auto-closes after 380ms

---

## 8. Audio System

### Synthesized SFX (Web Audio API)
| Sound | Trigger |
|-------|---------|
| `playDragStart()` | High-frequency tick when dragging starts |
| `playTap()` | Menu/settings button clicks |
| `playPlace()` | Mechanical thud on block placement |
| `playClear(combo)` | Pentatonic arpeggio scaling with combo count |
| `playGameOver()` | Descending minor arpeggio |
| `playLevelWin()` | Rising C major arpeggio sweep |

### Voice Announcements (Pre-recorded MP3)
| Phrase | Trigger | Voice |
|--------|---------|-------|
| "Great" | 2 lines at once | female |
| "Amazing" | 3 lines at once | female |
| "Excellent" | 4+ lines at once | female |
| "Perfect" | Combo reaches 10+ | male |
| "Fantastic" | Combo reaches 20+ | male |
| "Unbelievable" | Board cleared | male |

### Background Music
- `assets/audio/bgm/gaming_music.mp3` — looped, max volume 40%
- Auto-pauses when app is backgrounded

---

## 9. Haptic Feedback

| Type | Duration | Trigger |
|------|----------|---------|
| light | 50ms | Piece pickup, snap, menu taps |
| medium | 70ms | Block placement |
| heavy | 100ms | Line clear, theme shift |
| double | 60ms × 2 (100ms gap) | Perfect placement |

- Uses `Haptics.vibrate({ duration })` (Capacitor plugin)
- Web fallback: `navigator.vibrate()` (Android Chrome only, not iOS)
- Toggle via settings, persisted to LocalStorage

---

## 10. Adventure / Missions Mode

### Structure
- **500 total levels** (10 hand-crafted + 490 procedurally generated)
- Levels start locked; completing level N unlocks level N+1
- Progress tracked via `StorageManager.getAdventureProgress()`

### 6 Objective Types
| Objective | Description |
|-----------|-------------|
| `scoreTarget` | Score at least N points |
| `linesTarget` | Clear N lines total |
| `preFilledTarget` | Cover N gold blocks |
| `comboTarget` | Reach Nx combo streak |
| `placementsTarget` | Place N block shapes |
| `linesOneTurnTarget` | Clear N lines in one placement |

### Level Templates (10-Cycle Rotation)
Levels 11-500 rotate through 10 templates:
1. Pure Lines → 2. Pure Score → 3. Gold Blocks → 4. Combo Streak → 5. Placements → 6. One-Turn Clear → 7. Score+Lines → 8. Gold+Combo → 9. Lines+Combo → 10. Lines+Placements

### Difficulty Scaling
- Moves limit: `max(12, 27 - floor(level × 0.045))`
- Shape difficulty tiers scale with level number
- Level Select UI: glass-morphism overlay with locked/completed/current states

---

## 11. AdMob Ads

### Master Switch
`ADS_ENABLED` in `js/ads.js` — set to `false` during dev/testing, `true` for production.
When `false`, ALL ad logic is bypassed (no native calls, no simulated dialogs).

### Ad Types
- **Interstitial**: Shown at game-over transitions
- **Rewarded Video ("Second Chance")**: Triggers when player runs out of moves or bomb explodes
  - Grants revive: clears 3 random rows/columns, refills tray, clears bomb alerts
  - Only once per game, not available in Missions mode

### Production IDs (Commented Out, Ready for Release)
| Platform | App ID | Interstitial | Rewarded |
|----------|--------|-------------|----------|
| Android | `ca-app-pub-1104715539013161~4290494176` | `.../4805122197` | `.../7162702540` |
| iOS | `ca-app-pub-1104715539013161~1807423767` | `.../9577112893` | `.../4501869865` |

### Test IDs (Currently Active)
| Platform | App ID | Interstitial | Rewarded |
|----------|--------|-------------|----------|
| Android | `ca-app-pub-3940256099942544~3347511713` | `.../1044939714` | `.../5224354917` |
| iOS | `ca-app-pub-3940256099942544~1458002511` | `.../4411468910` | `.../1712485313` |

---

## 12. Firebase Integration

### Services
- **Firebase Auth**: Google Sign-In (`window.Capacitor.Plugins.FirebaseAuthentication`)
- **Firestore**: Cloud sync for settings, progress, high scores

### Firestore Schema
```
users/{uid}/
  settings/data       → theme, sound preferences
  progress/data       → unlocked adventure level
  highScores/{mode}   → score per mode with timestamp
```

### Project
- Firebase project: `brickly-007`
- Android app: `com.brickly.game` with SHA-1 fingerprint

---

## 13. UI Overlays & Modals

| ID | Purpose |
|----|---------|
| `#splash-screen` | App splash/loading |
| `#onboarding-screen` | First-run onboarding (Google login / Guest) |
| `#main-menu-overlay` | Main menu with mode selection |
| `#settings-overlay` | Settings (volume, vibration, theme, legal) |
| `#skin-picker-overlay` | Theme/skin picker grid (z-index: 1800) |
| `#gameover-overlay` | Game Over (score, high score, restart) |
| `#revive-overlay` | "Second Chance" rewarded ad prompt |
| `#success-overlay` | Level victory screen |
| `#level-select-overlay` | Missions level select grid |
| `#about-overlay` | About dialog (version, credits) |
| `#legal-overlay` | Privacy Policy / Terms iframe viewer |
| `#confirm-overlay` | Generic confirm dialog (z-index: 2000) |
| `#theme-shift-overlay` | Theme shift transition flash |

---

## 14. Settings & Persistence

### Settings (LocalStorage key: `brickly_settings`)
| Setting | Default | Description |
|---------|---------|-------------|
| `sfxVolume` | 80 | Sound effects volume (0-100) |
| `bgmVolume` | 50 | Background music volume (0-100) |
| `vibration` | true | Haptic feedback toggle |
| `theme` | 'neon' | Active gameplay theme |
| `menuTheme` | 'royal' | Active menu background theme |

### Other Persisted Data
| Key | Purpose |
|-----|---------|
| `brickly_hs_classic` | Classic mode high score |
| `brickly_hs_classic_10` | Classic XL high score |
| `brickly_hs_endless` | Endless mode high score |
| `brickly_hs_blast` | Blast mode high score |
| `brickly_save_state` | Mid-game save for resume |
| `brickly_adventure_level` | Highest unlocked missions level |
| `brickly_daily_streak` | Daily challenge streak |
| `brickly_daily_last_date` | Last daily completion date |

### Volume Behavior
- SFX volume slider range 0-100, internally scaled to 0-2.5 (`vol × 2.5`)
- BGM volume capped at 40% max (`Math.min(0.4, vol)`)
- Gameplay volume: slider × 0.3 (min 0.05) for better SFX audibility
- Menu return restores exact saved slider volume

---

## 15. Capacitor & Native Setup

### Plugins
| Plugin | Access Pattern |
|--------|---------------|
| `@capacitor/haptics` | `window.Capacitor.Plugins.Haptics` |
| `@capacitor/browser` | `window.Capacitor.Plugins.Browser` |
| `@capacitor-community/admob` | `window.Capacitor.Plugins.AdMob` |
| `@capacitor-community/text-to-speech` | `window.Capacitor.Plugins.TTS` |
| Firebase Auth | `window.Capacitor.Plugins.FirebaseAuthentication` |
| Firebase Firestore | `window.Capacitor.Plugins.FirebaseFirestore` |

**Important:** All plugins accessed via `window.Capacitor.Plugins.*` at runtime — NOT bare imports.

### Android
- Min SDK: configured in `build.gradle`
- Splash screen: `SplashScreen.installSplashScreen(this)` in `MainActivity.java`
- ActionBar hidden programmatically (Xiaomi/Poco fail-safe)
- Auto Backup enabled for LocalStorage data

### iOS
- `NSUserTrackingUsageDescription` defined for ATT
- iCloud backup automatic

---

## 16. Build & Deploy

### Web
- Serve root directory directly (`index.html` is entry point)
- No bundler needed

### Mobile
```bash
npm run build          # Copies assets/, js/, index.html, style.css, legal/ to dist/
npx cap sync           # Syncs web assets to native projects
```

### Android Debug
```bash
npm run android:debug:windows
```

---

## 17. Production Deployment Checklist

### Step 1 — `js/ads.js`
1. Set `ADS_ENABLED = true`
2. Comment out the 4 test ID constants
3. Uncomment the 4 production ID constants
4. Set `initializeForTesting: false`
5. Set `isTesting: false` in both `prepareInterstitial` and `prepareRewardVideoAd`

### Step 2 — `android/app/src/main/AndroidManifest.xml`
- Swap `android:value` from test app ID to production app ID

### Step 3 — `ios/App/App/Info.plist`
- Swap `<string>` under `GADApplicationIdentifier` from test app ID to production app ID

### Step 4 — Verify
- Test interstitial shows at game-over
- Test rewarded ad triggers on "Second Chance"
- Test ad dismissal returns to correct game state
- Verify no crashes on network failure

---

## Key Conventions
- All game state managed in `game.js` (orchestrator pattern)
- Board is a 2D matrix in `engine.js` (0 = empty, >0 = filled)
- No framework dependencies — vanilla JS with ES modules
- No bundler — bare specifiers do NOT work
- Plugins accessed at runtime via `window.Capacitor.Plugins.*`
- LocalStorage for all persistence (with optional Firestore cloud sync)
- Canvas rendering with 60 FPS target — no native shadowBlur, uses flat offsets
