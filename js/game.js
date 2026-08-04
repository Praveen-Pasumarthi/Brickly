/**
 * Brickly - Main Game Orchestrator & Loop
 * Integrates the core engine, spawner, audio, themes, particles, and storage,
 * managing mobile touch dragging, state validations, and HUD bindings.
 */

import { Board } from './engine.js';
import { Spawner, SHAPES } from './spawner.js';
import { StorageManager } from './storage.js';
import { ModeManager, AdventureLevels } from './modes.js';
import { THEMES, drawThemeBlock, texturePatterns, lightenColor, darkenColor } from './themes.js';
import { AudioManager } from './audio.js';
import { ParticleSystem } from './particles.js';
import { Auth, DB } from './firebase.js';
import { AdManager } from './ads.js';

// --- Null-safe DOM helper ---
function $(id) { return document.getElementById(id); }

// Global error handler — catch silent crashes that prevent init
window.onerror = function(msg, src, line, col, err) {
    console.error('[Brickly] Runtime error:', msg, 'at', src, line + ':' + col, err);
    document.body.classList.add('menu-active');
    const errDiv = document.createElement('div');
    errDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:red;color:#fff;padding:12px;font-size:12px;font-family:monospace;word-break:break-all;';
    errDiv.textContent = 'ERROR: ' + msg + ' at line ' + line;
    document.body.appendChild(errDiv);
    return false;
};

// --- Game State Variables ---
let board;
let spawner;
let audio;
let particles;

let score = 0;
let highScore = 0;
let comboStreak = 0;       // Sequential line-clear combo counter
let comboTimerMs = 0;      // Milliseconds remaining in the 10-second combo window
let comboTimerActive = false;
let gamePaused = false;      // Pause combo timer when settings opened mid-game
const COMBO_WINDOW_MS = 10000;
let lastFrameTime = 0;     // For deltaTime computation in renderLoop
let placementCount = 0;    // Number of blocks placed in Blast mode

// Prefill spring-reveal animation state
let prefillAnimActive = false;
let prefillAnimStartTime = 0;
let prefillAnimDuration = 0;
const PREFILL_ANIM_WAVE_DELAY = 18;   // ms between columns (diagonal wave)
const PREFILL_ANIM_ROW_DELAY = 80;   // ms between rows (wave propagation)
const PREFILL_ANIM_ARC_HEIGHT = 180;  // px below board start position
const PREFILL_ANIM_OVERSHOOT = 25;    // px above final position for bounce
const PREFILL_ANIM_SETTLE_MS = 450;   // ms for each cell's spring settle

// Board clear smooth wave animation state
let boardClearAnimActive = false;
let boardClearAnimStartTime = 0;   // performance.now() when animation began
let boardClearAnimStage = 0;       // 0 = inactive, 1 = wave clearing, 2 = celebration burst
let boardClearGridSnapshot = null;  // Snapshot of board grid prior to clear
const BOARD_CLEAR_WAVE_DURATION = 1200;  // ms for the diagonal wave sweep
const BOARD_CLEAR_CELL_DURATION = 400;  // ms per cell shrink+fade
const BOARD_CLEAR_ROW_DELAY = 60;       // ms delay between rows (wave propagation)
const BOARD_CLEAR_COL_DELAY = 25;       // ms delay between columns (diagonal spread)
const BOARD_CLEAR_SETTLE_DELAY = 300;   // ms post-wave settle before ending

let activeMode = 'classic'; // 'classic', 'missions', 'blast'
let activeTheme = 'indigo'; // default skin: dark blue with gold+purple blocks
let prevTheme = 'indigo';
let transitionProgress = 1.0;
const transitionDuration = 75; // ~1.25 s at 60 fps
let transitionStartTime = 0;   // performance.now() when transition began
let vibrationEnabled = true;

const MENU_THEMES = ['royal', 'neon', 'twilight', 'teal', 'obsidian', 'violet', 'rose', 'emerald', 'chrome', 'crimson'];
let activeMenuTheme = 'royal';

// Mode Specific States
let currentLevelConfig = null;
let missionLevel = 1;
let movesLimit = 0;
let linesClearedCount = 0;
let targetGoldBlocksCount = 0;
let maxComboStreak = 0;     // Highest combo streak achieved this level
let totalPlacements = 0;    // Total blocks placed this level
let maxLinesOneTurn = 0;    // Most lines cleared in a single placement
let activeBombs = []; // [{ r, c, timer }]

// Canvas Scaling & Layout
let gameCanvas;
let ctx;
let dragCanvas;
let dragCtx;
let cellSize = 0;
let boardOffsetX = 0;
let boardOffsetY = 0;
const boardLayout = { x: 0, y: 0, width: 0, height: 0, cellSize: 0 };

// Touch Dragging State
let isDragging = false;
let draggedSlot = -1; // 0, 1, 2
let draggedShape = null;
let pointerX = 0;
let pointerY = 0;

// Grid Snapping / Preview Projector State
let hoverRow = -1;
let hoverCol = -1;
let previewClearedLines = { rows: [], cols: [] };

// --- DOM Bindings ---
// (sound icons now live inside the settings modal)

// --- Initialization ---
window.addEventListener('DOMContentLoaded', () => {
    // Dismiss splash after loading bar animation completes (~2.4s total)
    const splashEl = document.getElementById('splash-screen');
    const onboardEl = document.getElementById('onboarding-screen');
    const hasOnboarded = localStorage.getItem('brickly_has_onboarded') === 'true';

    if (splashEl) {
        setTimeout(() => {
            splashEl.classList.add('splash-out');
            
            // Intercept with Onboarding screen if not logged in and hasn't explicitly skipped
            if (!Auth.currentUser && !hasOnboarded) {
                onboardEl.classList.remove('hidden');
                // Ensure it sits on top of the main menu
                onboardEl.style.zIndex = '500';
            }

            setTimeout(() => splashEl.classList.add('splash-gone'), 580);
        }, 2200); // matches splashLoad animation (0.6s delay + 1.8s duration = 2.4s)
    }

    try {
        initGame();
    } catch (err) {
        console.error('[Brickly] initGame crashed:', err);
        document.body.classList.add('menu-active');
        const errDiv = document.createElement('div');
        errDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:red;color:#fff;padding:12px;font-size:12px;font-family:monospace;word-break:break-all;';
        errDiv.textContent = 'ERROR: ' + err.message;
        document.body.appendChild(errDiv);
    }
});

function updateMenuHighScore() {
    const menuHighScoreEl = document.getElementById('menu-high-score');
    if (menuHighScoreEl) {
        menuHighScoreEl.innerText = StorageManager.getOverallHighScore();
    }
}

// --- Texture Loading System ---
// Only textures that look visually appealing for a premium puzzle game are used.
// Dirt/ and Plaster/ categories are excluded — too gritty/bland for colorful blocks.
const TEXTURE_MAP = {
    wood:           { file: 'Wood/Wood_01-128x128',         alpha: 0.10 },
    marble:         { file: 'Stone/Stone_01-128x128',       alpha: 0.08 },
    lava:           { file: 'Elements/Elements_01-128x128', alpha: 0.12 },
    brickWall:      { file: 'Brick/Brick_15-128x128',       alpha: 0.90 }, // texture IS the block fill
    industrialMetal:{ file: 'Metal/Metal_05-128x128',       alpha: 0.45 }, // strong metal overlay on neon
    slate:          { file: 'Stone/Stone_11-128x128',       alpha: 0.90 }, // texture IS the block fill
    volcanic:       { file: 'Elements/Elements_05-128x128', alpha: 0.25 }, // volcanic color overlay
    brickClassic:   { file: 'Brick/Brick_02-128x128',       alpha: 0.90 },
    muddyDirt:      { file: 'Dirt/Dirt_14-128x128',         alpha: 0.90 },
    heavyMetal:     { file: 'Metal/Metal_15-128x128',       alpha: 0.90 },
    cobbleStone:    { file: 'Stone/Stone_18-128x128',       alpha: 0.90 },
    mahoganyWood:   { file: 'Wood/Wood_15-128x128',         alpha: 0.90 },
    driftWood:      { file: 'Wood/Wood_13-128x128',         alpha: 0.90 },
    tile01:         { file: 'Tile/Tile_01-128x128',         alpha: 0.90 },
    tile03:         { file: 'Tile/Tile_03-128x128',         alpha: 0.90 },
    tile05:         { file: 'Tile/Tile_05-128x128',         alpha: 0.90 },
    tile07:         { file: 'Tile/Tile_07-128x128',         alpha: 0.90 },
    tile09:         { file: 'Tile/Tile_09-128x128',         alpha: 0.90 },
    tile11:         { file: 'Tile/Tile_11-128x128',         alpha: 0.90 },
    tile13:         { file: 'Tile/Tile_13-128x128',         alpha: 0.90 },
    tile15:         { file: 'Tile/Tile_15-128x128',         alpha: 0.90 },
    tile17:         { file: 'Tile/Tile_17-128x128',         alpha: 0.90 },
    tile19:         { file: 'Tile/Tile_19-128x128',         alpha: 0.90 },
};

function loadTextures() {
    for (const [themeId, texDef] of Object.entries(TEXTURE_MAP)) {
        const img = new Image();
        img.onload = () => {
            texturePatterns.set(themeId, {
                image: img,
                alpha: texDef.alpha || 0.12
            });
        };
        img.onerror = (err) => {
            console.warn(`[Brickly] Failed to load texture for ${themeId}:`, err);
        };
        img.src = `assets/images/textures/${texDef.file}.png`;
    }
}

function initGame() {
    document.body.classList.add('menu-active');

    // 1. Instantiate Core Classes
    board = new Board();
    spawner = new Spawner();
    audio = new AudioManager();
    particles = new ParticleSystem();

    // 2. Setup Canvas
    gameCanvas = document.getElementById('game-canvas');
    ctx = gameCanvas.getContext('2d');
    dragCanvas = document.getElementById('drag-canvas');
    dragCtx = dragCanvas.getContext('2d');

    // 2b. Load texture images (async, non-blocking)
    loadTextures();

    // One-time migration: copy old shared high scores into per-mode keys
    StorageManager.migrateOldHighScores();

    // One-time score migration: cut old high scores to 50% of their original values
    if (localStorage.getItem('brickly_score_migrated_v3') !== 'true') {
        const hasV2 = localStorage.getItem('brickly_score_migrated_v2') === 'true';
        const classicHigh = localStorage.getItem('brickly_high_score');
        if (classicHigh) {
            const val = parseInt(classicHigh, 10);
            if (val > 0) {
                const newVal = hasV2 ? val * 5 : Math.round(val / 2);
                localStorage.setItem('brickly_high_score', newVal.toString());
            }
        }
        const classic10High = localStorage.getItem('brickly_high_score_10');
        if (classic10High) {
            const val = parseInt(classic10High, 10);
            if (val > 0) {
                const newVal = hasV2 ? val * 5 : Math.round(val / 2);
                localStorage.setItem('brickly_high_score_10', newVal.toString());
            }
        }
        localStorage.setItem('brickly_score_migrated_v3', 'true');
    }

    // 3. Load Saved Settings and High Scores
    const settings = StorageManager.getSettings();
    
    activeTheme = settings.theme || 'classic';
    if (!THEMES[activeTheme]) {
        activeTheme = 'classic';
    }
    activeMenuTheme = settings.menuTheme || 'royal';
    if (!MENU_THEMES.includes(activeMenuTheme)) {
        activeMenuTheme = 'royal';
    }
    prevTheme = activeTheme;
    transitionProgress = 1.0;
    
    audio.setSfxEnabled(settings.sfx !== false);
    audio.setBgmEnabled(settings.bgm !== false);
    vibrationEnabled = settings.vibration !== false;
    
    // Restore volume levels
    if (settings.sfxVolume !== undefined) {
        audio.setSfxVolume(settings.sfxVolume / 100);
    } else {
        audio.setSfxVolume(settings.sfx !== false ? 0.8 : 0);
    }
    if (settings.bgmVolume !== undefined) {
        audio.setBgmVolume(settings.bgmVolume / 100);
    } else {
        audio.setBgmVolume(settings.bgm !== false ? 0.5 : 0);
    }
    
    highScore = StorageManager.getHighScore(activeMode);

    applyTheme(activeTheme);
    applyMenuTheme(activeMenuTheme);
    updateSoundIcons();

    // 4. Initialize layout and dynamically observe size changes to prevent 0-size canvas issues
    window.addEventListener('resize', handleResize);
    const container = document.getElementById('canvas-container');
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(() => {
            try { handleResize(); } catch (err) { console.warn('[Brickly] ResizeObserver handleResize error:', err); }
        });
        if (container) resizeObserver.observe(container);
        document.querySelectorAll('.tray-slot').forEach(slot => {
            resizeObserver.observe(slot);
        });
    }
    handleResize();

    // 5. Setup Input Event Listeners (must run even if earlier steps fail)
    setupDragEvents();
    setupUIBindings();

    // 6. Write high score to header crown
    const topScoreEl = $('best-score-top-val');
    if (topScoreEl) topScoreEl.innerText = StorageManager.getOverallHighScore();
    updateMenuHighScore();

    // 7. Start Render Animation Loop
    requestAnimationFrame(renderLoop);

    // 8. Unlock BGM on first user interaction (Android WebView blocks autoplay without gesture)
    const unlockBgmOnFirstTouch = () => {
        const settings = StorageManager.getSettings();
        const savedVol = settings.bgmVolume !== undefined ? settings.bgmVolume : 50;
        if (settings.bgm !== false && savedVol > 0) {
            audio.unlock();
            audio.setBgmVolume(savedVol / 100);
            audio.startBgm();
        }
        // Remove all listeners after first trigger — only need one unlock
        document.removeEventListener('touchstart', unlockBgmOnFirstTouch);
        document.removeEventListener('click', unlockBgmOnFirstTouch);
        document.removeEventListener('pointerdown', unlockBgmOnFirstTouch);
    };
    document.addEventListener('touchstart', unlockBgmOnFirstTouch, { once: true });
    document.addEventListener('click', unlockBgmOnFirstTouch, { once: true });
    document.addEventListener('pointerdown', unlockBgmOnFirstTouch, { once: true });

    // 9. Initialize AdMob Ads
    AdManager.initialize();
}

// --- Layout Handling ---
function handleResize() {
    const container = document.getElementById('canvas-container');
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width <= 0 || height <= 0) {
        // Layout not ready yet, prevent negative / invalid dimensions
        cellSize = 0;
        boardOffsetX = 0;
        boardOffsetY = 0;
        return;
    }

    const dpr = window.devicePixelRatio || 1;
    gameCanvas.width = width * dpr;
    gameCanvas.height = height * dpr;
    
    // Scale canvas context for Retina/High-DPI sharp rendering
    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    // Resize drag overlay canvas to cover entire app container
    const appContainer = document.getElementById('app-container');
    if (appContainer && dragCanvas) {
        const appW = appContainer.clientWidth;
        const appH = appContainer.clientHeight;
        dragCanvas.width = appW * dpr;
        dragCanvas.height = appH * dpr;
        dragCtx.resetTransform();
        dragCtx.scale(dpr, dpr);
    }

    // Keep grid perfectly square and centered in canvas
    const padding = 10;
    const boardSize = Math.min(width, height) - padding * 2;
    const cols = board ? board.cols : 8;
    const rows = board ? board.rows : 8;
    cellSize = boardSize / cols;
    boardOffsetX = (width - boardSize) / 2;
    boardOffsetY = (height - boardSize) / 2;

    // Cache layout bounds for particle explosions projection
    boardLayout.x = boardOffsetX;
    boardLayout.y = boardOffsetY;
    boardLayout.width = boardSize;
    boardLayout.height = boardSize;
    boardLayout.cellSize = cellSize;
    boardLayout.cols = cols;
    boardLayout.rows = rows;

    // Redraw slots canvases
    for (let i = 0; i < 3; i++) {
        resizeTraySlot(i);
    }
}

function resizeTraySlot(slotIndex) {
    const canvas = document.getElementById(`tray-canvas-${slotIndex}`);
    if (!canvas) return;

    const slotDiv = canvas.parentElement;
    const width = slotDiv.clientWidth;
    const height = slotDiv.clientHeight;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    const slotCtx = canvas.getContext('2d');
    slotCtx.resetTransform();
    slotCtx.scale(dpr, dpr);
}

// --- Drag & Drop Core Pointer Event Handlers ---
function setupDragEvents() {
    // We bind touch listeners on each slot container
    const slots = document.querySelectorAll('.tray-slot');
    
    slots.forEach(slot => {
        slot.addEventListener('pointerdown', (e) => {
            if (isDragging || gamePaused || boardClearAnimActive) return;
            const slotIndex = parseInt(slot.dataset.slot, 10);
            
            // Check if slot has active shape
            const shape = spawner.slots[slotIndex];
            if (!shape) return;

            // Unlock audio on first gesture if suspended
            audio.init();
            audio.resume();

            // Capture pointer so pointermove/up/cancel always fire on this element
            // even if the finger drifts outside — prevents OS scroll stealing the gesture
            try { slot.setPointerCapture(e.pointerId); } catch (_) {}

            // Set dragging states
            isDragging = true;
            draggedSlot = slotIndex;
            draggedShape = shape;

            // Get pointer relative positions
            pointerX = e.clientX;
            pointerY = e.clientY;

            // Add dragging visual class
            slot.classList.add('dragging');
            triggerHaptic('light'); // light tick on pickup
        });
    });

    // Move and release event bindings are bound globally to window
    // to handle pointer exits from the container borders
    window.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        pointerX = e.clientX;
        pointerY = e.clientY;

        // Calculate projections
        projectDraggedShapePreview();
    });

    window.addEventListener('pointerup', (e) => {
        if (!isDragging) return;
        
        // Remove dragging class from all slots
        document.querySelectorAll('.tray-slot').forEach(s => s.classList.remove('dragging'));

        attemptBlockPlacement();
    });

    // pointercancel fires when the OS interrupts the touch gesture (e.g. notification
    // pull-down, incoming call, system scroll takeover). Without this handler the drag
    // state stays locked forever — the piece appears stuck until the user taps again.
    window.addEventListener('pointercancel', () => {
        if (!isDragging) return;
        document.querySelectorAll('.tray-slot').forEach(s => s.classList.remove('dragging'));
        cleanupDragState();
    });

    // visibilitychange fires when the app is backgrounded (home button, task switcher).
    // Same problem: the pointerup is never delivered, so we reset drag on re-focus.
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isDragging) {
            document.querySelectorAll('.tray-slot').forEach(s => s.classList.remove('dragging'));
            cleanupDragState();
        }
    });
}

/**
 * Calculates board snap projections and highlights Prospective lines clearing.
 */
function projectDraggedShapePreview() {
    if (!draggedShape) return;

    const rect = gameCanvas.getBoundingClientRect();

    const shapeRows = draggedShape.matrix.length;
    const shapeCols = draggedShape.matrix[0].length;

    // The bottom edge of the shape floats 28px above the finger.
    // Therefore, the top-left corner of the shape is at:
    const shapeWidthPx = shapeCols * cellSize;
    const shapeHeightPx = shapeRows * cellSize;
    const localX = pointerX - rect.left - shapeWidthPx / 2;
    const localY = pointerY - shapeHeightPx - 28 - rect.top;

    // Snap: find the nearest grid column and row for the top-left corner
    const col = Math.round((localX - boardOffsetX) / cellSize);
    const row = Math.round((localY - boardOffsetY) / cellSize);

    // Validate placement at computed coords
    if (board.validatePlacement(draggedShape.matrix, row, col)) {
        if (hoverRow !== row || hoverCol !== col) {
            triggerHaptic('light'); // snap tick on position shift
        }
        hoverRow = row;
        hoverCol = col;

        // Calculate line clearances on prospective placement
        calculateGlowPreviews(row, col);
    } else {
        hoverRow = -1;
        hoverCol = -1;
        previewClearedLines = { rows: [], cols: [] };
    }
}

/**
 * Predicts rows and columns that will clear if placed at current coords.
 */
function calculateGlowPreviews(row, col) {
    // Temporarily apply shape blocks
    const tempGrid = board.grid.map(r => [...r]);
    const shapeMatrix = draggedShape.matrix;

    for (let r = 0; r < shapeMatrix.length; r++) {
        for (let c = 0; c < shapeMatrix[r].length; c++) {
            if (shapeMatrix[r][c] > 0) {
                tempGrid[row + r][col + c] = draggedShape.colorId;
            }
        }
    }

    // Run clearance check on temp grid
    const fullRows = [];
    const fullCols = [];

    // Check rows
    for (let r = 0; r < board.rows; r++) {
        if (tempGrid[r].every(val => val > 0)) fullRows.push(r);
    }
    // Check columns
    for (let c = 0; c < board.cols; c++) {
        let colFull = true;
        for (let r = 0; r < board.rows; r++) {
            if (tempGrid[r][c] === 0) {
                colFull = false;
                break;
            }
        }
        if (colFull) fullCols.push(c);
    }

    previewClearedLines.rows = fullRows;
    previewClearedLines.cols = fullCols;
}

/**
 * Places the shape if snapped, triggers scoring, decrements moves, refills slots,
 * and checks for victory or game over conditions.
 */
function attemptBlockPlacement() {
    // Board placement takes priority when there's a valid snap position.
    // This prevents the pointer (which sits 28px below the shape) from
    // accidentally hitting a tray slot when placing on the bottom rows.
    if (hoverRow >= 0 && hoverCol >= 0 && draggedShape) {
        const matrix = draggedShape.matrix;
        const colorId = draggedShape.colorId;
        
        let hasClearedLines = false;
        let hasPerfectSpot = false;

        // 1. Commit placement
        board.placeShape(matrix, hoverRow, hoverCol, colorId);
        audio.playPlace();
        particles.spawnPlacementParticles(hoverRow, hoverCol, matrix, boardLayout, getActiveThemeConfig());

        // Calculate score points for placed blocks count (+20 pt per block)
        let blocksCount = 0;
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c] > 0) blocksCount++;
            }
        }
        score += blocksCount * 20;

        // Check if placed in the target spot in the background (perfect spot)
        let targetSpotBonus = 0;
        if (draggedShape.targetSpot && hoverRow === draggedShape.targetSpot.r && hoverCol === draggedShape.targetSpot.c) {
            targetSpotBonus = 100; // Perfect spot score boost
            score += targetSpotBonus;
            hasPerfectSpot = true;
            
            // Floating bonus score text near the placement
            const textX = boardOffsetX + (hoverCol + matrix[0].length / 2) * cellSize;
            const textY = boardOffsetY + (hoverRow) * cellSize - 10;
            particles.addFloatingText(`+${targetSpotBonus} Perfect Spot!`, textX, textY - 20, '#ffd700', 1.15);
        }

        // 2. Consume slot
        spawner.useShape(draggedSlot);

        // Increment placement counters
        placementCount++;
        totalPlacements++;

        // Timely theme change: cycle theme every 15 placements
        if (placementCount > 0 && placementCount % 15 === 0) {
            triggerThemeChange();
            const centerX = boardOffsetX + (cellSize * board.cols) / 2;
            const centerY = boardOffsetY + (cellSize * board.rows) / 2;
            particles.addFloatingText('Theme Shift!', centerX, centerY, getActiveThemeConfig().colors.textPrimary, 1.15);
        }

        // 3. Scan & Clear filled lines
        const { rows, cols } = board.checkFullLines();
        const clearedLinesCount = rows.length + cols.length;

        if (clearedLinesCount > 0) {
            comboStreak += 1;
            if (comboStreak > maxComboStreak) maxComboStreak = comboStreak;
            if (clearedLinesCount > maxLinesOneTurn) maxLinesOneTurn = clearedLinesCount;
            comboTimerMs = COMBO_WINDOW_MS;   // reset/extend combo window
            comboTimerActive = true;
            hasClearedLines = true;
            
            // Score Math (calibrated for custom points and combo system)
            // Base line-clear score (flat reward per placement)
            let baseLineScore = 0;
            if (clearedLinesCount === 1) baseLineScore = 150;
            else if (clearedLinesCount === 2) baseLineScore = 300;
            else if (clearedLinesCount === 3) baseLineScore = 450;
            else if (clearedLinesCount === 4) baseLineScore = 600;
            else baseLineScore = clearedLinesCount * 150; // 5+ lines: 150 × N

            // Combo Streak Bonus — flat tier system:
            //   x2–x10  → +250 per combo step  (tier 1)
            //   x11–x20 → +500 per combo step  (tier 2)
            //   x21–x30 → +750 per combo step  (tier 3)
            //   Every 10 more combo levels adds another +250 to the per-step reward.
            //   Formula: tier = floor((streak - 1) / 10) + 1
            //            streakBonus = tier * 250
            let streakBonus = 0;
            if (comboStreak >= 2) {
                const comboTier = Math.floor((comboStreak - 1) / 10) + 1;
                streakBonus = comboTier * 250;

                // Multi-line multiplier: clearing 2+ lines at once during a combo earns extra
                // 2 lines = 1.5x streak bonus, 3 lines = 2.25x, 4 lines = 3x
                if (clearedLinesCount >= 2) {
                    const multiLineMultiplier = 1 + (clearedLinesCount - 1) * 0.75;
                    streakBonus = Math.round(streakBonus * multiLineMultiplier);
                }
            }

            const pointsGained = baseLineScore + streakBonus;
            score += pointsGained;

            // Spawn floating reward text
            const rect = gameCanvas.getBoundingClientRect();
            const textX = boardOffsetX + (hoverCol + matrix[0].length / 2) * cellSize;
            const textY = boardOffsetY + (hoverRow) * cellSize - 10;
            
            let floatMsg = `+${pointsGained}`;
            if (comboStreak > 1 && clearedLinesCount > 1) {
                floatMsg += ` (Combo x${comboStreak} × ${clearedLinesCount} Lines!)`;
            } else if (comboStreak > 1) {
                floatMsg += ` (Combo x${comboStreak}! +${streakBonus})`;
            } else if (clearedLinesCount > 1) {
                floatMsg += ` (${clearedLinesCount} Lines!)`;
            }
            particles.addFloatingText(floatMsg, textX, textY, getActiveThemeConfig().colors.textPrimary, Math.min(1.2, 0.75 + (comboStreak * 0.05)));

            // Trigger sparkles and explosions
            const activeThemeConfig = getActiveThemeConfig();
            particles.spawnLineClearEffect(rows, cols, boardLayout, activeThemeConfig);
            audio.playClear(comboStreak);

            // Voice announcement and center text for combo/clears
            let vocalMsg = "";
            let msgColor = '#ffd32a';
            
            // Combo milestones - only triggers at exact multiples (10, 20, 30...)
            if (comboStreak >= 20 && comboStreak % 10 === 0) {
                vocalMsg = "Fantastic";
                msgColor = '#ee5253';
            } else if (comboStreak >= 10 && comboStreak % 10 === 0) {
                vocalMsg = "Perfect";
                msgColor = '#ff9f43';
            }
            // Simultaneous multi-line clears (2+)
            else if (clearedLinesCount >= 4) {
                vocalMsg = "Excellent";
                msgColor = '#ffd32a';
            } else if (clearedLinesCount === 3) {
                vocalMsg = "Amazing";
                msgColor = '#ff9f43';
            } else if (clearedLinesCount === 2) {
                vocalMsg = "Great";
                msgColor = '#ff6b81';
            }
            
            if (vocalMsg) {
                audio.speak(vocalMsg);
                
                // Show the specific text on screen instead of just generic 'Perfect!'
                const centerX = boardOffsetX + (cellSize * board.cols) / 2;
                const centerY = boardOffsetY + (cellSize * board.rows) / 2;
                particles.addFloatingText(vocalMsg.toUpperCase() + '!', centerX, centerY, msgColor, 1.25);
            }

            // Cleanse bomb timers (Blast Mode)
            if (activeMode === 'blast') {
                ModeManager.cleanseBombs(board, rows, cols, activeBombs);
                updateDangerBanner();
            }

            // Sync targets destroyed (Missions Mode)
            if (activeMode === 'missions') {
                // Count targets remaining in cleared lines
                let clearedTargets = 0;
                rows.forEach(r => {
                    for (let c = 0; c < board.cols; c++) {
                        if (board.grid[r][c] === 13) clearedTargets++;
                    }
                });
                cols.forEach(c => {
                    for (let r = 0; r < board.rows; r++) {
                        if (board.grid[r][c] === 13 && !rows.includes(r)) clearedTargets++;
                    }
                });
                
                linesClearedCount += clearedLinesCount;
            }

            // Check if this clear will empty the board
            let willBeEmpty = true;
            for (let r = 0; r < board.rows; r++) {
                for (let c = 0; c < board.cols; c++) {
                    if (board.grid[r][c] > 0) {
                        if (!rows.includes(r) && !cols.includes(c)) {
                            willBeEmpty = false;
                            break;
                        }
                    }
                }
                if (!willBeEmpty) break;
            }

            if (willBeEmpty) {
                // Capture snapshot of the board grid before it is cleared
                boardClearGridSnapshot = board.grid.map(row => [...row]);
            } else {
                boardClearGridSnapshot = null;
            }

            // Execute grid collapse state update
            board.clearLines(rows, cols);

            // Check for a Full Board Clear (board completely empty)
            let boardIsEmpty = true;
            for (let r = 0; r < board.rows; r++) {
                for (let c = 0; c < board.cols; c++) {
                    if (board.grid[r][c] > 0) {
                        boardIsEmpty = false;
                        break;
                    }
                }
                if (!boardIsEmpty) break;
            }

            if (boardIsEmpty) {
                const clearBonus = 2500; // Board clear reward
                score += clearBonus;
                
                // Trigger the smooth wave animation
                boardClearAnimActive = true;
                boardClearAnimStage = 1;
                boardClearAnimStartTime = performance.now();
            }

        } // no else — combo now resets via timer expiry, not on missed placement

        // Trigger Placement Haptic feedback
        if (hasClearedLines) {
            triggerHaptic('heavy');
        } else if (hasPerfectSpot) {
            triggerHaptic('double');
        } else {
            triggerHaptic('medium');
        }

        // 4. Mode Specific Counters
        if (activeMode === 'blast') {
            // Tick bombs down
            const exploded = ModeManager.tickBombs(activeBombs);
            updateDangerBanner();

            if (exploded) {
                checkForReviveOrGameOver("A bomb detonated!");
                cleanupDragState();
                return;
            }

            // Spawn a new bomb every 5 moves, scaling the timer based on how many bombs are already active.
            // More active bombs = more time to prevent overwhelming the player.
            if (placementCount % 5 === 0) {
                const nextBombTimer = activeBombs.length >= 2 ? 15 : activeBombs.length === 1 ? 12 : 9;
                ModeManager.spawnBomb(board, activeBombs, nextBombTimer);
                updateDangerBanner();
            }
        }

        if (activeMode === 'missions') {
            movesLimit--;
            updateHUDObjective();

            // Refresh target block count
            targetGoldBlocksCount = countGoldBlocksRemaining();
            
            // Check victory condition
            if (checkModeVictory()) {
                triggerVictory();
                cleanupDragState();
                return;
            }

            // Check moves depletion gameover
            if (movesLimit <= 0) {
                checkForReviveOrGameOver("Out of moves!");
                cleanupDragState();
                return;
            }
        }

        // 5. Refill tray slots if all three are empty
        const refilled = spawner.refillTray(board, score, activeMode, missionLevel, activeBombs);

        // 6. High Score check (all score-based modes)
        if (activeMode === 'classic' || activeMode === 'classic_10' || activeMode === 'endless' || activeMode === 'blast') {
            if (score > highScore) {
                highScore = score;
                StorageManager.saveHighScore(highScore, activeMode);
            }
        }

        // 7. Auto Save Game state
        saveCurrentGameState();

        // 7.5. Force immediate HUD display update
        updateHUD();

        // 8. Game Over check (Are there moves left?)
        if (spawner.checkGameOver(board)) {
            checkForReviveOrGameOver("No valid placement moves left!");
            cleanupDragState();
            return;
        }

        cleanupDragState();
        return;
    }

    // No valid board snap — check tray slot interactions (drop back or move to empty slot)
    const slots = document.querySelectorAll('.tray-slot');
    let targetSlotIndex = -1;
    for (const slot of slots) {
        const rect = slot.getBoundingClientRect();
        if (pointerX >= rect.left && pointerX <= rect.right &&
            pointerY >= rect.top && pointerY <= rect.bottom) {
            targetSlotIndex = parseInt(slot.dataset.slot, 10);
            break;
        }
    }

    if (targetSlotIndex >= 0 && draggedShape) {
        if (targetSlotIndex === draggedSlot) {
            // Drop back in its original place
            cleanupDragState();
            return;
        } else if (spawner.slots[targetSlotIndex] === null) {
            // Move shape to the new empty slot
            spawner.slots[targetSlotIndex] = draggedShape;
            spawner.slots[draggedSlot] = null;
            audio.playTap();
            triggerHaptic('light');
            cleanupDragState();
            return;
        }
    }

    cleanupDragState();
}

function updateTraySlotOpacities() {
    document.querySelectorAll('.tray-slot').forEach((slot, idx) => {
        if (spawner.slots[idx] === null) {
            slot.classList.add('empty');
        } else {
            slot.classList.remove('empty');
        }
    });
}

function cleanupDragState() {
    isDragging = false;
    draggedSlot = -1;
    draggedShape = null;
    hoverRow = -1;
    hoverCol = -1;
    previewClearedLines = { rows: [], cols: [] };

    updateTraySlotOpacities();

    // Save state
    saveCurrentGameState();
}

// --- Drawing / Render Loop ---

function startPrefillAnimation() {
    prefillAnimActive = true;
    prefillAnimStartTime = performance.now();
    // Total duration: last cell (top-right) delay + settle time
    prefillAnimDuration = ((board.rows - 1) * PREFILL_ANIM_ROW_DELAY) +
                          ((board.cols - 1) * PREFILL_ANIM_WAVE_DELAY) +
                          PREFILL_ANIM_SETTLE_MS;
}

function getCellPrefillAnimProps(r, c) {
    if (!prefillAnimActive) return { yOffset: 0, scale: 1, hidden: false };

    // Wave timing: bottom-left to top-right diagonal
    const delay = ((board.rows - 1 - r) * PREFILL_ANIM_ROW_DELAY) +
                 (c * PREFILL_ANIM_WAVE_DELAY);
    const elapsed = performance.now() - prefillAnimStartTime - delay;

    // Not yet started — hidden until wave reaches this cell
    if (elapsed < 0) return { hidden: true };

    // Settled — final position
    if (elapsed > PREFILL_ANIM_SETTLE_MS) return { yOffset: 0, scale: 1, hidden: false };

    const t = elapsed / PREFILL_ANIM_SETTLE_MS; // 0..1

    // Parabolic arc: -180 → +25 (overshoot) → 0 (settle)
    let yOffset;
    if (t < 0.6) {
        const rise = t / 0.6;
        yOffset = -PREFILL_ANIM_ARC_HEIGHT +
                  (PREFILL_ANIM_ARC_HEIGHT + PREFILL_ANIM_OVERSHOOT) * rise;
    } else {
        const settle = (t - 0.6) / 0.4;
        yOffset = PREFILL_ANIM_OVERSHOOT * (1 - settle);
    }

    // Scale: 0.4 → 1.1 (overshoot) → 1.0 (settle)
    let scale;
    if (t < 0.4) {
        scale = 0.4 + 0.7 * (t / 0.4);
    } else {
        scale = 1.1 - 0.1 * ((t - 0.4) / 0.6);
    }

    return { yOffset, scale, hidden: false };
}

function renderLoop(now) {
    // Compute deltaTime for smooth timer updates
    const deltaMs = now - (lastFrameTime || now);
    lastFrameTime = now;

    // Tick prefill spring-reveal animation (time-based)
    if (prefillAnimActive) {
        if (now - prefillAnimStartTime > prefillAnimDuration) {
            prefillAnimActive = false;
        }
    }

    // Tick board clear smooth wave animation (time-based)
    if (boardClearAnimActive) {
        const now = performance.now();
        if (boardClearAnimStage === 1) {
            // Check if wave sweep has completed
            if (now - boardClearAnimStartTime >= BOARD_CLEAR_WAVE_DURATION) {
                // Wave complete — transition to stage 2: celebration burst
                boardClearAnimStage = 2;
                boardClearAnimStartTime = now;
                
                // Heavy screen shake for impact
                particles.triggerShake(35, 12);
                
                // Burst particles across the entire board
                const theme = THEMES[activeTheme] || THEMES['classic'] || Object.values(THEMES)[0];
                const boardClearStyle = theme.boardClearStyle;
                const extraParticles = (boardClearStyle === 'blizzard' || boardClearStyle === 'eruption' 
                    || boardClearStyle === 'petal_storm') ? 2 : 1;
                for (let i = 0; i < extraParticles; i++) {
                    for (let r = 0; r < board.rows; r++) {
                        for (let c = 0; c < board.cols; c++) {
                            const bx = boardOffsetX + c * cellSize;
                            const by = boardOffsetY + r * cellSize;
                            particles.spawnTileClearParticles(bx, by, cellSize, theme);
                        }
                    }
                }
                
                // Trigger visual rewards (MARVELOUS!)
                const centerX = boardOffsetX + (cellSize * board.cols) / 2;
                const centerY = boardOffsetY + (cellSize * board.rows) / 2;
                particles.addFloatingText('MARVELOUS!', centerX, centerY - 20, theme.colors.textPrimary || '#ffd32a', 1.6);
                particles.addFloatingText('+2000 Board Clear!', centerX, centerY + 30, '#ffd700', 1.15);
                
                audio.speak("Unbelievable");
                
                // Cycle theme as reward
                triggerThemeChange(true);
            }
        } else if (boardClearAnimStage === 2) {
            // Short settle delay for particles/shake to be visible
            if (now - boardClearAnimStartTime >= BOARD_CLEAR_SETTLE_DELAY) {
                boardClearAnimActive = false;
                boardClearAnimStage = 0;
            }
        }
    }

    // Tick combo countdown window (paused when settings are open mid-game)
    if (comboTimerActive && !gamePaused) {
        comboTimerMs -= deltaMs;
        if (comboTimerMs <= 0) {
            comboTimerMs = 0;
            comboTimerActive = false;
            comboStreak = 0;
            updateComboWidget();
        } else {
            updateComboWidget();
        }
    }

    // Update theme transition using time-based easing (smoothstep, ~1.25 s)
    if (transitionProgress < 1.0) {
        const elapsed = now - transitionStartTime;
        const raw = Math.min(elapsed / 350, 1.0);          // 350 ms total — fast transition
        // smoothstep: 3t²-2t³  (ease-in-out)
        transitionProgress = raw * raw * (3 - 2 * raw);
    }

    // 1. Update particles physics
    particles.update();

    // 2. Render only if game board is visible (not covered by main menu)
    const isMenu = document.body.classList.contains('menu-active');
    if (!isMenu) {
        // Clear canvas
        ctx.clearRect(0, 0, gameCanvas.width / window.devicePixelRatio, gameCanvas.height / window.devicePixelRatio);

        // 3. Apply Screen Shake transformation matrix
        ctx.save();
        ctx.translate(particles.shakeX, particles.shakeY);

        // 4. Draw Board Grid Lines & Occupied cells
        drawBoardGrid();

        // 5. Draw Prospective Snap Glow previews
        drawSnapPreview();

        // 6. Draw particles canvas overlays
        particles.draw(ctx);

        ctx.restore();

        // 7. Render Dragging Shape at pointer position
        drawDraggedShapeOverlay();

        // 8. Render Tray Slots
        for (let i = 0; i < 3; i++) {
            drawTraySlot(i);
        }
    } else {
        // Clear dragging overlay canvas if active
        if (dragCtx && dragCanvas) {
            dragCtx.clearRect(0, 0, dragCanvas.width / window.devicePixelRatio, dragCanvas.height / window.devicePixelRatio);
        }
    }

    // 9. Frame ticker
    requestAnimationFrame(renderLoop);
}

function drawBoardGrid() {
    const theme = getActiveThemeConfig();
    const cols = board ? board.cols : 8;
    const rows = board ? board.rows : 8;
    
    // Draw background card shadow & fill
    ctx.save();
    ctx.fillStyle = theme.colors.gridBg;
    ctx.strokeStyle = theme.colors.boardBorder;
    ctx.lineWidth = 4;
    
    // Rounded Board Outer panel (reduced corner radius to 8)
    ctx.beginPath();
    ctx.roundRect(boardOffsetX - 2, boardOffsetY - 2, cellSize * cols + 4, cellSize * rows + 4, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Draw individual empty cells & blocks
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cx = boardOffsetX + c * cellSize;
            const cy = boardOffsetY + r * cellSize;
            const cellValueOnBoard = board.grid[r][c];
            let cellValue = cellValueOnBoard;
            if (boardClearAnimActive && boardClearAnimStage === 1 && boardClearGridSnapshot) {
                cellValue = boardClearGridSnapshot[r][c];
            }

            // Get spring animation properties for this cell
            const anim = getCellPrefillAnimProps(r, c);

            // Skip hidden cells (not yet reached by wave)
            if (anim.hidden) continue;

            // Draw the static empty cell background if empty
            if (cellValueOnBoard === 0) {
                if (prefillAnimActive) {
                    ctx.save();
                    ctx.translate(cx + cellSize / 2, cy + cellSize / 2 + anim.yOffset);
                    ctx.scale(anim.scale, anim.scale);
                    ctx.translate(-cellSize / 2, -cellSize / 2);
                    
                    ctx.fillStyle = theme.colors.cellEmpty;
                    ctx.strokeStyle = theme.colors.gridLines;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.roundRect(1.5, 1.5, cellSize - 3, cellSize - 3, cellSize * 0.12);
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                } else {
                    ctx.fillStyle = theme.colors.cellEmpty;
                    ctx.strokeStyle = theme.colors.gridLines;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.roundRect(cx + 1.5, cy + 1.5, cellSize - 3, cellSize - 3, cellSize * 0.12);
                    ctx.fill();
                    ctx.stroke();
                }
            }

            // Draw animated blocks
            if (cellValue > 0) {
                ctx.save();
                ctx.translate(cx + cellSize / 2, cy + cellSize / 2 + anim.yOffset);
                ctx.scale(anim.scale, anim.scale);
                ctx.translate(-cellSize / 2, -cellSize / 2);

                let clearProgress = 0;
                if (boardClearAnimActive && boardClearAnimStage === 1) {
                    clearProgress = easeOutCubic(getCellClearProgress(r, c, performance.now()));
                    if (clearProgress > 0) {
                        const clearScale = 1.0 - (0.7 * clearProgress);  // 1.0 → 0.3
                        const clearAlpha = 1.0 - clearProgress;          // 1.0 → 0.0
                        const clearRotation = clearProgress * 0.12;       // subtle tilt

                        ctx.translate(cellSize / 2, cellSize / 2);
                        ctx.rotate(clearRotation);
                        ctx.scale(clearScale, clearScale);
                        ctx.translate(-cellSize / 2, -cellSize / 2);
                        ctx.globalAlpha = clearAlpha;
                        
                        const boardClearStyle = theme.boardClearStyle;
                        if (boardClearStyle === 'glitch_surge') {
                            const glitchOffset = (Math.random() - 0.5) * clearProgress * 8;
                            ctx.translate(glitchOffset, 0);
                        }
                    }
                }

                drawThemeBlock(ctx, 0, 0, cellSize, cellSize, cellValue, theme, r, c);

                // Draw overlay visual effects for theme board clear
                if (boardClearAnimActive && boardClearAnimStage === 1 && clearProgress > 0) {
                    const boardClearStyle = theme.boardClearStyle;
                    if (boardClearStyle === 'crystal_collapse' || boardClearStyle === 'shatter') {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                        ctx.fillRect(0, 0, cellSize * 0.3, cellSize * 0.15);
                    } else if (boardClearStyle === 'blizzard' || boardClearStyle === 'flakefall') {
                        ctx.fillStyle = `rgba(255, 255, 255, ${clearProgress * 0.3})`;
                        ctx.fillRect(0, 0, cellSize, cellSize);
                    } else if (boardClearStyle === 'eruption' || boardClearStyle === 'ember_rise') {
                        ctx.fillStyle = `rgba(255, 100, 0, ${clearProgress * 0.25})`;
                        ctx.fillRect(0, 0, cellSize, cellSize);
                    }
                }

                if (cellValue === 14 && activeMode === 'blast') {
                    const bomb = activeBombs.find(b => b.r === r && b.c === c);
                    if (bomb) {
                        drawBombOverlay(0, 0, cellSize, bomb.timer);
                    }
                }

                ctx.restore();
            }
        }
    }
}

/**
 * Shows where the dragged block will land (ghost shadow) and
 * which rows/cols will clear (bright pulsing bands with theme colors).
 */
function drawSnapPreview() {
    if (!isDragging || hoverRow < 0 || hoverCol < 0 || !draggedShape) return;

    const theme = getActiveThemeConfig();
    const shapeMatrix = draggedShape.matrix;
    const now = performance.now();
    const pulse = 0.5 + 0.5 * Math.sin(now * 0.005);

    ctx.save();

    const boardCols = board ? board.cols : 8;
    const boardRows = board ? board.rows : 8;
    const hasLineClear = previewClearedLines.rows.length > 0 || previewClearedLines.cols.length > 0;

    // ══════════════════════════════════════════════════════════════
    //  1. GHOST PIECE — dark shadow + colored border on the grid
    // ══════════════════════════════════════════════════════════════
    const blockColor = theme.colors[draggedShape.colorId] || '#ffffff';
    const inset = 2;
    const rad = cellSize * 0.14;

    for (let r = 0; r < shapeMatrix.length; r++) {
        for (let c = 0; c < shapeMatrix[r].length; c++) {
            if (shapeMatrix[r][c] > 0) {
                const cx = boardOffsetX + (hoverCol + c) * cellSize;
                const cy = boardOffsetY + (hoverRow + r) * cellSize;

                // Dark semi-transparent shadow fill
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.beginPath();
                ctx.roundRect(cx + inset, cy + inset, cellSize - inset * 2, cellSize - inset * 2, rad);
                ctx.fill();

                // Colored block preview (muted version of the actual block)
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = blockColor;
                ctx.beginPath();
                ctx.roundRect(cx + inset + 2, cy + inset + 2, cellSize - (inset + 2) * 2, cellSize - (inset + 2) * 2, rad * 0.8);
                ctx.fill();

                // Bright pulsing border — theme-colored, thick, unmistakable (hardware-accelerated, no blur)
                ctx.globalAlpha = (0.65 + pulse * 0.35) * 0.35;
                ctx.strokeStyle = blockColor;
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.roundRect(cx + inset, cy + inset, cellSize - inset * 2, cellSize - inset * 2, rad);
                ctx.stroke();

                ctx.globalAlpha = 0.65 + pulse * 0.35;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.roundRect(cx + inset, cy + inset, cellSize - inset * 2, cellSize - inset * 2, rad);
                ctx.stroke();
            }
        }
    }

    // ══════════════════════════════════════════════════════════════
    //  2. LINE-CLEAR GLOW — pulsing fill + 4-sided border inside board
    // ══════════════════════════════════════════════════════════════
    if (hasLineClear) {
        const accentColor = theme.colors.glow || blockColor;

        // --- Rows that will clear ---
        previewClearedLines.rows.forEach(r => {
            const ry = boardOffsetY + r * cellSize;

            // Colored glow fill
            ctx.globalAlpha = 0.2 + pulse * 0.2;
            ctx.fillStyle = accentColor;
            ctx.fillRect(boardOffsetX, ry, cellSize * boardCols, cellSize);

            // White inner core
            ctx.globalAlpha = 0.08 + pulse * 0.1;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(boardOffsetX + 2, ry + 2, cellSize * boardCols - 4, cellSize - 4);

            // Sweep beam — stays within board bounds
            const totalW = cellSize * boardCols;
            const sweepX = boardOffsetX + ((now * 0.05) % (totalW + cellSize * 2)) - cellSize;
            const grad = ctx.createLinearGradient(sweepX - cellSize, 0, sweepX + cellSize, 0);
            grad.addColorStop(0, 'rgba(255,255,255,0)');
            grad.addColorStop(0.5, 'rgba(255,255,255,0.35)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.globalAlpha = 0.4 + pulse * 0.4;
            ctx.fillStyle = grad;
            ctx.fillRect(boardOffsetX, ry + 1, totalW, cellSize - 2);

            // 4-sided border — clipped to board area (no blur glow)
            ctx.globalAlpha = (0.65 + pulse * 0.35) * 0.35;
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 6;
            ctx.strokeRect(boardOffsetX + 1, ry + 1, totalW - 2, cellSize - 2);

            ctx.globalAlpha = 0.65 + pulse * 0.35;
            ctx.lineWidth = 2.5;
            ctx.strokeRect(boardOffsetX + 1, ry + 1, totalW - 2, cellSize - 2);

            // Inner white border for contrast
            ctx.globalAlpha = 0.4 + pulse * 0.3;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(boardOffsetX + 3, ry + 3, totalW - 6, cellSize - 6);
        });

        // --- Cols that will clear ---
        previewClearedLines.cols.forEach(c => {
            const cx = boardOffsetX + c * cellSize;

            // Colored glow fill
            ctx.globalAlpha = 0.2 + pulse * 0.2;
            ctx.fillStyle = accentColor;
            ctx.fillRect(cx, boardOffsetY, cellSize, cellSize * boardRows);

            // White inner core
            ctx.globalAlpha = 0.08 + pulse * 0.1;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(cx + 2, boardOffsetY + 2, cellSize - 4, cellSize * boardRows - 4);

            // Sweep beam — stays within board bounds
            const totalH = cellSize * boardRows;
            const sweepY = boardOffsetY + ((now * 0.05) % (totalH + cellSize * 2)) - cellSize;
            const grad = ctx.createLinearGradient(0, sweepY - cellSize, 0, sweepY + cellSize);
            grad.addColorStop(0, 'rgba(255,255,255,0)');
            grad.addColorStop(0.5, 'rgba(255,255,255,0.35)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.globalAlpha = 0.4 + pulse * 0.4;
            ctx.fillStyle = grad;
            ctx.fillRect(cx + 1, boardOffsetY, cellSize - 2, totalH);

            // 4-sided border — clipped to board area (no blur glow)
            ctx.globalAlpha = (0.65 + pulse * 0.35) * 0.35;
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 6;
            ctx.strokeRect(cx + 1, boardOffsetY + 1, cellSize - 2, totalH - 2);

            ctx.globalAlpha = 0.65 + pulse * 0.35;
            ctx.lineWidth = 2.5;
            ctx.strokeRect(cx + 1, boardOffsetY + 1, cellSize - 2, totalH - 2);

            // Inner white border for contrast
            ctx.globalAlpha = 0.4 + pulse * 0.3;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(cx + 3, boardOffsetY + 3, cellSize - 6, totalH - 6);
        });
    }

    ctx.restore();
}

/**
 * Draws the dragged shape anchored above the finger overlay.
 */
function drawDraggedShapeOverlay() {
    if (!isDragging || !draggedShape) {
        // Clear drag overlay canvas if we are not dragging
        if (dragCtx && dragCanvas) {
            dragCtx.clearRect(0, 0, dragCanvas.width / window.devicePixelRatio, dragCanvas.height / window.devicePixelRatio);
        }
        return;
    }

    const theme = getActiveThemeConfig();
    const shapeMatrix = draggedShape.matrix;
    const shapeRows = shapeMatrix.length;
    const shapeCols = shapeMatrix[0].length;

    // Use dragCanvas bounds for layout coords on the full screen overlay
    const dragRect = dragCanvas.getBoundingClientRect();

    const dragCellSize = cellSize;
    const shapeW = shapeCols * dragCellSize;
    const shapeH = shapeRows * dragCellSize;

    // Bottom edge sits 28px above the touch point.
    // Centered horizontally, lifted vertically so bottom is 28px above finger.
    const startX = (pointerX - dragRect.left) - shapeW / 2;
    const startY = (pointerY - shapeH - 28) - dragRect.top;

    // Clear drag canvas before rendering the current frame
    dragCtx.clearRect(0, 0, dragCanvas.width / window.devicePixelRatio, dragCanvas.height / window.devicePixelRatio);

    dragCtx.save();
    
    // First pass: draw flat offset shadows for all blocks of the dragged shape (infinitely faster than shadowBlur)
    dragCtx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    const shadowOffset = Math.round(dragCellSize * 0.12);
    const rad = dragCellSize * 0.14;
    for (let r = 0; r < shapeRows; r++) {
        for (let c = 0; c < shapeCols; c++) {
            if (shapeMatrix[r][c] > 0) {
                const tx = startX + c * dragCellSize + shadowOffset;
                const ty = startY + r * dragCellSize + shadowOffset;
                dragCtx.beginPath();
                dragCtx.roundRect(tx + 1.5, ty + 1.5, dragCellSize - 3, dragCellSize - 3, rad);
                dragCtx.fill();
            }
        }
    }

    // Second pass: draw the actual blocks
    // Textured themes use alpha inheritance — lower to 0.75 so the drag piece is
    // visibly semi-transparent over placed blocks (prevents "lines through blocks" effect)
    const isTexturedStyle = theme.blockStyle === 'textured';
    dragCtx.globalAlpha = isTexturedStyle ? 0.75 : 0.96;
    for (let r = 0; r < shapeRows; r++) {
        for (let c = 0; c < shapeCols; c++) {
            if (shapeMatrix[r][c] > 0) {
                const tx = startX + c * dragCellSize;
                const ty = startY + r * dragCellSize;
                drawThemeBlock(dragCtx, tx, ty, dragCellSize, dragCellSize, draggedShape.colorId, theme, r, c);
            }
        }
    }
    dragCtx.restore();
}

function drawTraySlot(slotIndex) {
    const canvas = document.getElementById(`tray-canvas-${slotIndex}`);
    if (!canvas) return;

    const slotCtx = canvas.getContext('2d');
    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;

    slotCtx.clearRect(0, 0, width, height);

    const shape = spawner.slots[slotIndex];
    if (!shape) return;

    const theme = getActiveThemeConfig();
    const shapeMatrix = shape.matrix;
    const shapeRows = shapeMatrix.length;
    const shapeCols = shapeMatrix[0].length;

    // Small scale factor for preview slots (fits up to 5-block shapes without clipping)
    const slotCellSize = Math.min(width, height) / 5.3;
    const shapeW = shapeCols * slotCellSize;
    const shapeH = shapeRows * slotCellSize;

    // Centered start coordinates
    const sx = (width - shapeW) / 2;
    const sy = (height - shapeH) / 2;

    slotCtx.save();
    if (isDragging && draggedSlot === slotIndex) {
        slotCtx.globalAlpha = 0.25;
    }

    for (let r = 0; r < shapeRows; r++) {
        for (let c = 0; c < shapeCols; c++) {
            if (shapeMatrix[r][c] > 0) {
                const tx = sx + c * slotCellSize;
                const ty = sy + r * slotCellSize;
                drawThemeBlock(slotCtx, tx, ty, slotCellSize, slotCellSize, shape.colorId, theme, r, c);
            }
        }
    }

    slotCtx.restore();
}

function drawBombOverlay(x, y, w, countdown) {
    const cx = x + w / 2;
    const cy = y + w / 2;
    const isUrgent = countdown <= 3;

    ctx.save();

    // --- Dark circular backdrop ---
    const bgRadius = w * 0.38;
    ctx.beginPath();
    ctx.arc(cx, cy, bgRadius, 0, Math.PI * 2);
    ctx.fillStyle = isUrgent ? 'rgba(180,0,0,0.82)' : 'rgba(10,10,10,0.78)';
    ctx.fill();

    // --- Danger ring (outer stroke with semi-transparent wider stroke overlay for glow) ---
    ctx.beginPath();
    ctx.arc(cx, cy, bgRadius, 0, Math.PI * 2);
    ctx.strokeStyle = isUrgent ? 'rgba(255, 34, 34, 0.35)' : 'rgba(255, 136, 0, 0.35)';
    ctx.lineWidth = w * 0.14;
    ctx.stroke();

    ctx.strokeStyle = isUrgent ? '#ff2222' : '#ff8800';
    ctx.lineWidth = w * 0.07;
    ctx.stroke();

    // --- Countdown number ---
    const fontSize = Math.round(w * 0.42);
    ctx.font = `bold ${fontSize}px Outfit, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Manual high-performance flat shadow for the text
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillText(countdown.toString(), cx + 1, cy + fontSize * 0.04 + 1);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(countdown.toString(), cx, cy + fontSize * 0.04);

    ctx.restore();
}

// --- Game Logic Controllers ---
export function selectMode(modeName, forceNewGame = false) {
    // Lower BGM volume for gameplay
    const settings = StorageManager.getSettings();
    const savedBgmVol = settings.bgmVolume !== undefined ? settings.bgmVolume : 50;
    if (settings.bgm !== false && savedBgmVol > 0) {
        audio.setBgmVolume((savedBgmVol / 100) * 0.10);
        audio.startBgm();
    } else {
        audio.stopBgm();
    }

    try {
        audio.init();
        audio.resume();
        audio.bgmEnabled = (settings.bgm !== false && savedBgmVol > 0);
    } catch (err) {
        console.warn('[Brickly] audio unlock failed:', err);
    }
    
    activeMode = modeName;
    
    // Hide Main Menu overlay
    document.body.classList.remove('menu-active');
    const menuOverlay = $('main-menu-overlay');
    if (menuOverlay) menuOverlay.classList.add('hidden');
    
    // Ensure body theme classes sync immediately
    applyTheme(activeTheme);

    const savedState = StorageManager.getGameState();
    
    let resumeOk = false;
    if (!forceNewGame && savedState && savedState.mode === activeMode && savedState.grid) {
        try {
            // Resume game state
            score = savedState.score || 0;
            highScore = StorageManager.getHighScore(activeMode);
            comboStreak = savedState.comboStreak || 0;
            placementCount = savedState.placementCount || 0;
            revivedThisGame = savedState.revivedThisGame || false;
            
            board.reset(savedState.grid);
            spawner.slots = savedState.slots || [null, null, null];
            spawner.spawnCount = savedState.spawnCount !== undefined ? savedState.spawnCount : 2;

            // Safety check: if tray slots are completely empty, refill them to prevent game lock
            if (spawner.slots.every(s => s === null)) {
                spawner.refillTray(board, score, activeMode, missionLevel, activeBombs);
            }
            
            // Mode specific restores
            if (activeMode === 'blast') {
                activeBombs = savedState.activeBombs || [];
                updateDangerBanner();
            } else if (activeMode === 'missions') {
                missionLevel = savedState.missionLevel || 1;
                movesLimit = savedState.movesLimit || 20;
                linesClearedCount = savedState.linesClearedCount || 0;
                maxComboStreak = savedState.maxComboStreak || 0;
                totalPlacements = savedState.totalPlacements || 0;
                maxLinesOneTurn = savedState.maxLinesOneTurn || 0;
                targetGoldBlocksCount = countGoldBlocksRemaining();
            }

            updateHUD();
            updateTraySlotOpacities();
            resumeOk = true;

            // Trigger spring-reveal animation on resume (except endless mode)
            if (activeMode !== 'endless') {
                startPrefillAnimation();
            }
        } catch (err) {
            console.warn('[Brickly] corrupted save state, starting fresh:', err);
            StorageManager.clearGameState();
        }
    }
    if (!resumeOk) {
        startNewGame();
    }
    // Run handleResize immediately to prevent initial flicker if the layout is already reflowed
    try { handleResize(); } catch (err) { console.warn('[Brickly] handleResize error:', err); }

    // Defer handleResize to run after the browser has completed layout and style recalculations
    requestAnimationFrame(() => {
        try { handleResize(); } catch (err) { console.warn('[Brickly] handleResize error:', err); }
    });
    setTimeout(() => {
        try { handleResize(); } catch (err) { console.warn('[Brickly] handleResize error:', err); }
    }, 50);
    setTimeout(() => {
        try { handleResize(); } catch (err) { console.warn('[Brickly] handleResize error:', err); }
    }, 150);
    setTimeout(() => {
        try { handleResize(); } catch (err) { console.warn('[Brickly] handleResize error:', err); }
    }, 300);
    setTimeout(() => {
        try { handleResize(); } catch (err) { console.warn('[Brickly] handleResize error:', err); }
    }, 600);
}

function startNewGame() {
    score = 0;
    highScore = StorageManager.getHighScore(activeMode);
    comboStreak = 0;
    comboTimerMs = 0;
    comboTimerActive = false;
    placementCount = 0;
    revivedThisGame = false;
    maxComboStreak = 0;
    totalPlacements = 0;
    maxLinesOneTurn = 0;
    activeBombs = [];
    spawner.spawnCount = 0;
    const dangerBar = $('danger-bar');
    if (dangerBar) dangerBar.classList.add('hidden');
    // Force-hide the combo widget immediately — state reset above won't hide the DOM element
    // unless updateComboWidget() is explicitly called.
    updateComboWidget();

    if (activeMode === 'classic') {
        board.reset(null, 8, 8);
        board.prefillGrid(30, SHAPES);
        spawner.slots = [null, null, null];
        startPrefillAnimation();
        spawner.refillTray(board, score, activeMode, missionLevel, activeBombs);
    } else if (activeMode === 'classic_10') {
        board.reset(null, 10, 10);
        board.prefillGrid(30, SHAPES);
        spawner.slots = [null, null, null];
        startPrefillAnimation();
        spawner.refillTray(board, score, activeMode, missionLevel, activeBombs);
    } else if (activeMode === 'endless') {
        board.reset(null, 10, 10);
        spawner.slots = [null, null, null];
        spawner.refillTray(board, score, activeMode, missionLevel, activeBombs);
    } else if (activeMode === 'missions') {
        loadMissionLevel(missionLevel);
    } else if (activeMode === 'blast') {
        board.reset(null, 8, 8);
        board.prefillGrid(30, SHAPES);
        spawner.slots = [null, null, null];
        startPrefillAnimation();
        spawner.refillTray(board, score, activeMode, missionLevel, activeBombs);
        // Spawn 2 initial bombs with staggered timers so they don't detonate at the same time.
        // First bomb: 9 moves (urgent threat), Second bomb: 14 moves (gives breathing room).
        ModeManager.spawnBomb(board, activeBombs, 9);
        ModeManager.spawnBomb(board, activeBombs, 14);
        updateDangerBanner();
    }

    updateHUD();
    updateTraySlotOpacities();
    saveCurrentGameState();
}

function loadMissionLevel(levelNum) {
    const levelConfig = AdventureLevels.find(l => l.levelNumber === levelNum) || AdventureLevels[0];
    currentLevelConfig = levelConfig;

    board.reset(levelConfig.grid);
    spawner.slots = [null, null, null];
    spawner.refillTray(board, score, activeMode, missionLevel, activeBombs);

    movesLimit = levelConfig.movesLimit;
    linesClearedCount = 0;
    targetGoldBlocksCount = countGoldBlocksRemaining();
    maxComboStreak = 0;
    totalPlacements = 0;
    maxLinesOneTurn = 0;
}

function saveCurrentGameState() {
    // If the gameover, success, or revive modals are displayed, do not overwrite the cleared state
    const gameoverOverlay = $('gameover-overlay');
    const successOverlay = $('success-overlay');
    const reviveOverlay = $('revive-overlay');
    if ((gameoverOverlay && !gameoverOverlay.classList.contains('hidden')) || 
        (successOverlay && !successOverlay.classList.contains('hidden')) ||
        (reviveOverlay && !reviveOverlay.classList.contains('hidden'))) {
        return;
    }

    StorageManager.saveGameState({
        mode: activeMode,
        score,
        comboStreak,
        placementCount,
        maxComboStreak,
        totalPlacements,
        maxLinesOneTurn,
        grid: board.grid,
        slots: spawner.slots,
        activeBombs,
        missionLevel,
        movesLimit,
        linesClearedCount,
        spawnCount: spawner.spawnCount,
        revivedThisGame
    });
}

function countGoldBlocksRemaining() {
    let count = 0;
    for (let r = 0; r < board.rows; r++) {
        for (let c = 0; c < board.cols; c++) {
            if (board.grid[r][c] === 13) {
                count++;
            }
        }
    }
    return count;
}

function checkModeVictory() {
    if (activeMode === 'missions') {
        const config = AdventureLevels.find(l => l.levelNumber === missionLevel) || AdventureLevels[0];
        
        // Check objectives
        const goalClearedBlocks = config.preFilledTarget > 0 ? (targetGoldBlocksCount === 0) : true;
        const goalScore = config.scoreTarget > 0 ? (score >= config.scoreTarget) : true;
        const goalLines = config.linesTarget > 0 ? (linesClearedCount >= config.linesTarget) : true;
        const goalCombo = config.comboTarget > 0 ? (maxComboStreak >= config.comboTarget) : true;
        const goalPlacements = config.placementsTarget > 0 ? (totalPlacements >= config.placementsTarget) : true;
        const goalLinesOneTurn = config.linesOneTurnTarget > 0 ? (maxLinesOneTurn >= config.linesOneTurnTarget) : true;

        return goalClearedBlocks && goalScore && goalLines && goalCombo && goalPlacements && goalLinesOneTurn;
    }
    return false;
}

// --- HUD & Overlay UI Handlers ---
function updateHUD() {
    const scoreEl = $('score-val');
    const bestEl = $('best-score-val');
    const topEl = $('best-score-top-val');
    const crownWrap = document.querySelector('.hud-high-score');
    const bestScoreWrap = bestEl ? bestEl.closest('.hud-item') : null;

    if (scoreEl) {
        scoreEl.innerText = score;
        if (score.toString().length >= 6) {
            scoreEl.style.fontSize = '16px';
        } else {
            scoreEl.style.fontSize = '';
        }
    }

    // Hide score displays in Missions mode (level-based, not score-based)
    if (activeMode === 'missions') {
        if (crownWrap) crownWrap.style.visibility = 'hidden';
        if (bestScoreWrap) bestScoreWrap.style.display = 'none';
    } else {
        if (crownWrap) crownWrap.style.visibility = '';
        if (bestScoreWrap) bestScoreWrap.style.display = '';
        if (bestEl) bestEl.innerText = highScore;
        if (topEl) topEl.innerText = StorageManager.getOverallHighScore();
    }

    // Display appropriate level names based on the active mode
    const modeNames = {
        classic: 'Classic (8x8)',
        classic_10: 'Classic 10x10',
        missions: `Missions Lvl ${missionLevel}`,
        blast: 'Blast Mode',
        endless: 'Endless (10x10)'
    };
    const modeLabel = $('active-mode-label');
    if (modeLabel) modeLabel.innerText = modeNames[activeMode] || 'Classic Mode';

    // Toggle specific HUD panels
    const modeHud = $('mode-specific-hud');

    const btnMissionsLevels = $('btn-missions-levels');

    if (activeMode === 'classic' || activeMode === 'classic_10' || activeMode === 'blast' || activeMode === 'endless') {
        if (modeHud) modeHud.classList.add('hidden');
        if (btnMissionsLevels) btnMissionsLevels.style.display = 'none';
    } else if (activeMode === 'missions') {
        if (modeHud) modeHud.classList.remove('hidden');
        if (btnMissionsLevels) btnMissionsLevels.style.display = 'flex';
        updateHUDObjective();
    }
}

function updateHUDObjective() {
    const objectiveText = $('objective-text');
    const movesVal = $('moves-val');
    if (movesVal) movesVal.innerText = movesLimit;

    if (activeMode === 'missions') {
        const config = AdventureLevels.find(l => l.levelNumber === missionLevel) || AdventureLevels[0];
        
        // Build objectives display
        const parts = [];
        if (config.scoreTarget > 0) parts.push(`Score ${score}/${config.scoreTarget}`);
        if (config.linesTarget > 0) parts.push(`Lines ${linesClearedCount}/${config.linesTarget}`);
        if (config.preFilledTarget > 0) parts.push(`Gold ${targetGoldBlocksCount} left`);
        if (config.comboTarget > 0) parts.push(`Combo ${maxComboStreak}/${config.comboTarget}`);
        if (config.placementsTarget > 0) parts.push(`Place ${totalPlacements}/${config.placementsTarget}`);
        if (config.linesOneTurnTarget > 0) parts.push(`Clear ${maxLinesOneTurn}/${config.linesOneTurnTarget} in 1 go`);

        if (objectiveText) {
            objectiveText.innerText = parts.length > 0 ? parts.join(' • ') : 'Complete the level!';
        }

        // Show level progression percentage fill
        const progressContainer = $('progress-bar-container');
        const progressFill = $('progress-bar-fill');
        if (progressContainer) progressContainer.classList.remove('hidden');
        let percent = 0;
        let objectives = 0;
        let progress = 0;
        if (config.scoreTarget > 0) { objectives++; progress += Math.min(1, score / config.scoreTarget); }
        if (config.linesTarget > 0) { objectives++; progress += Math.min(1, linesClearedCount / config.linesTarget); }
        if (config.preFilledTarget > 0) { objectives++; progress += config.preFilledTarget > 0 ? Math.min(1, (config.preFilledTarget - targetGoldBlocksCount) / config.preFilledTarget) : 0; }
        if (config.comboTarget > 0) { objectives++; progress += Math.min(1, maxComboStreak / config.comboTarget); }
        if (config.placementsTarget > 0) { objectives++; progress += Math.min(1, totalPlacements / config.placementsTarget); }
        if (config.linesOneTurnTarget > 0) { objectives++; progress += Math.min(1, maxLinesOneTurn / config.linesOneTurnTarget); }
        percent = objectives > 0 ? (progress / objectives) * 100 : 0;
        if (progressFill) progressFill.style.width = `${Math.min(100, percent)}%`;
    }
}

function updateDangerBanner() {
    const dangerBar = $('danger-bar');
    if (activeMode !== 'blast' || activeBombs.length === 0) {
        if (dangerBar) dangerBar.classList.add('hidden');
        return;
    }

    // Find min timer
    const minTimer = Math.min(...activeBombs.map(b => b.timer));
    
    if (dangerBar) dangerBar.classList.remove('hidden');
    const dangerCount = $('danger-count');
    if (dangerCount) dangerCount.innerText = minTimer;
    
    // Scale intensity of shake if bomb is critical
    if (minTimer <= 3) {
        particles.triggerShake(5, 2);
    }
}

let revivedThisGame = false;
let pendingGameOverReason = "";

function checkForReviveOrGameOver(reason) {
    if (!revivedThisGame && activeMode !== 'missions') {
        pendingGameOverReason = reason;
        const overlay = $('revive-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            gamePaused = true;
        }
    } else {
        triggerGameOver(reason);
    }
}

function performReviveBoardClear() {
    const totalLines = 3;
    const clearedRows = [];
    const clearedCols = [];
    
    // Pick 3 random lines (rows or columns)
    for (let i = 0; i < totalLines; i++) {
        const isRow = Math.random() < 0.5;
        const maxLimit = isRow ? board.rows : board.cols;
        const index = Math.floor(Math.random() * maxLimit);
        
        if (isRow) {
            if (!clearedRows.includes(index)) clearedRows.push(index);
        } else {
            if (!clearedCols.includes(index)) clearedCols.push(index);
        }
    }
    
    // Clear these rows in board grid
    clearedRows.forEach(r => {
        for (let c = 0; c < board.cols; c++) {
            board.grid[r][c] = 0;
        }
    });
    
    // Clear these columns in board grid
    clearedCols.forEach(c => {
        for (let r = 0; r < board.rows; r++) {
            board.grid[r][c] = 0;
        }
    });
    
    // Spawn gorgeous clear particles!
    particles.spawnLineClearEffect(clearedRows, clearedCols, boardLayout, getActiveThemeConfig());
}

function triggerGameOver(reason) {
    // Restore BGM on game over screen
    const goSettings = StorageManager.getSettings();
    const goBgmVol = goSettings.bgmVolume !== undefined ? goSettings.bgmVolume : 50;
    if (goSettings.bgm !== false && goBgmVol > 0) {
        audio.setBgmVolume(goBgmVol / 100);
        audio.startBgm();
    }
    audio.playGameOver();
    triggerHaptic('heavy');
    StorageManager.clearGameState();

    // Show preloaded interstitial ad
    AdManager.showInterstitial();

    const reasonEl = $('gameover-reason');
    const finalScoreEl = $('final-score-val');
    const highScoreEl = $('high-score-val');
    if (reasonEl) reasonEl.innerText = reason;
    if (finalScoreEl) finalScoreEl.innerText = score;
    if (highScoreEl) highScoreEl.innerText = highScore;

    const overlay = $('gameover-overlay');
    if (overlay) overlay.classList.remove('hidden');
}

function triggerVictory() {
    // Restore BGM on victory screen
    const vicSettings = StorageManager.getSettings();
    const vicBgmVol = vicSettings.bgmVolume !== undefined ? vicSettings.bgmVolume : 50;
    if (vicSettings.bgm !== false && vicBgmVol > 0) {
        audio.setBgmVolume(vicBgmVol / 100);
        audio.startBgm();
    }
    audio.playLevelWin();
    triggerHaptic('double');
    StorageManager.clearGameState();

    const successOverlay = $('success-overlay');
    const successScoreEl = $('success-score-val');
    if (successScoreEl) successScoreEl.innerText = score;

    if (activeMode === 'missions') {
        const msgEl = $('success-message');
        const nextBtn = $('btn-next-level');
        const levelsBtn = $('btn-levels-list');
        if (msgEl) msgEl.innerText = `Level ${missionLevel} Completed!`;
        if (nextBtn) { nextBtn.innerText = "Next Level"; nextBtn.style.display = 'flex'; }
        if (levelsBtn) levelsBtn.style.display = 'flex';
        
        // Progress unlocked levels
        missionLevel = Math.min(missionLevel + 1, AdventureLevels.length);
        StorageManager.saveAdventureProgress(missionLevel);
    } else {
        const nextBtn = $('btn-next-level');
        const levelsBtn = $('btn-levels-list');
        if (nextBtn) { nextBtn.innerText = "Continue"; nextBtn.style.display = 'flex'; }
        if (levelsBtn) levelsBtn.style.display = 'none';
    }

    if (successOverlay) successOverlay.classList.remove('hidden');
}

function showToast(message) {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    if (toast && toastMsg) {
        toastMsg.textContent = message;
        toast.classList.remove('hidden');
        // Force reflow
        toast.offsetHeight;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 300);
        }, 3000);
    }
}

function applyRestoredSettings() {
    const settings = StorageManager.getSettings();
    
    activeTheme = settings.theme || 'classic';
    if (!THEMES[activeTheme]) activeTheme = 'classic';
    
    activeMenuTheme = settings.menuTheme || 'royal';
    if (!MENU_THEMES.includes(activeMenuTheme)) activeMenuTheme = 'royal';
    
    audio.setSfxEnabled(settings.sfx !== false);
    audio.setBgmEnabled(settings.bgm !== false);
    vibrationEnabled = settings.vibration !== false;
    
    if (settings.sfxVolume !== undefined) {
        audio.setSfxVolume(settings.sfxVolume / 100);
    } else {
        audio.setSfxVolume(settings.sfx !== false ? 0.8 : 0);
    }
    if (settings.bgmVolume !== undefined) {
        audio.setBgmVolume(settings.bgmVolume / 100);
    } else {
        audio.setBgmVolume(settings.bgm !== false ? 0.5 : 0);
    }
    
    highScore = StorageManager.getHighScore(activeMode);
    
    applyTheme(activeTheme);
    applyMenuTheme(activeMenuTheme);
    updateSoundIcons();
    
    const topScoreEl = $('best-score-top-val');
    if (topScoreEl) topScoreEl.innerText = StorageManager.getOverallHighScore();
    updateMenuHighScore();
    updateHUD();
}

// --- Menu UI Event Bindings ---
function setupUIBindings() {
    // --- Onboarding Logic ---
    const onboardEl = document.getElementById('onboarding-screen');
    const btnOnboardGoogle = document.getElementById('btn-onboard-google');
    const btnOnboardGuest = document.getElementById('btn-onboard-guest');

    if (btnOnboardGoogle) {
        btnOnboardGoogle.addEventListener('click', async () => {
            audio.playTap();
            try {
                const user = await Auth.signInWithGoogle();
                if (user) {
                    console.log("Logged in via onboarding:", user.displayName);
                    localStorage.setItem('brickly_has_onboarded', 'true');
                    onboardEl.classList.add('out');
                    setTimeout(() => onboardEl.classList.add('hidden'), 500);
                }
            } catch (err) {
                console.error("Onboard Google Login Failed:", err);
                alert("Login failed: " + (err.message || err));
            }
        });
    }

    if (btnOnboardGuest) {
        btnOnboardGuest.addEventListener('click', () => {
            audio.playTap();
            localStorage.setItem('brickly_has_onboarded', 'true');
            onboardEl.classList.add('out');
            setTimeout(() => onboardEl.classList.add('hidden'), 500);
        });
    }

    // Main Menu Buttonsdings
    const btnLogin = $('btn-settings-login');
    const btnLogout = $('btn-settings-logout');
    const btnGuest = $('btn-settings-guest');

    if (btnLogin) {
        btnLogin.addEventListener('click', async () => {
            triggerHaptic('light');
            audio.playTap();
            try {
                await Auth.signInWithGoogle();
                // Close settings automatically after login
                closeSettings();
            } catch (e) {
                console.error("Login failed", e);
                alert("Login failed: " + (e.message || e));
            }
        });
    }

    if (btnGuest) {
        btnGuest.addEventListener('click', () => {
            triggerHaptic('light');
            audio.playTap();
            closeSettings();
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            triggerHaptic('light');
            audio.playTap();
            
            // Show custom confirm dialog
            const confirmOverlay = $('confirm-overlay');
            const btnCancel = $('btn-confirm-cancel');
            const btnOk = $('btn-confirm-ok');
            
            if (confirmOverlay && btnCancel && btnOk) {
                confirmOverlay.classList.remove('hidden');
                
                const confirmed = await new Promise(resolve => {
                    const handleCancel = () => { cleanup(); resolve(false); };
                    const handleOk = () => { cleanup(); resolve(true); };
                    
                    const cleanup = () => {
                        btnCancel.removeEventListener('click', handleCancel);
                        btnOk.removeEventListener('click', handleOk);
                        confirmOverlay.classList.add('hidden');
                    };
                    
                    btnCancel.addEventListener('click', () => {
                        triggerHaptic('light');
                        audio.playTap();
                        handleCancel();
                    });
                    
                    btnOk.addEventListener('click', () => {
                        triggerHaptic('light');
                        audio.playTap();
                        handleOk();
                    });
                });
                
                if (!confirmed) return;
            } else {
                // Fallback if modal elements are missing
                const confirmed = window.confirm("Are you sure you want to sign out?\n\nYour progress will no longer be saved to the cloud.");
                if (!confirmed) return;
            }
            
            try {
                await Auth.signOut();
            } catch (e) {
                console.error("Logout failed", e);
            }
        });
    }

    const accountUserInfo = $('account-user-info');
    let lastUser = undefined;
    Auth.onAuthStateChanged(async (user) => {
        if (user) {
            if (btnLogin) btnLogin.style.display = 'none';
            if (btnGuest) btnGuest.style.display = 'none';
            if (btnLogout) btnLogout.style.display = 'flex';
            if (accountUserInfo) {
                accountUserInfo.style.display = 'block';
                accountUserInfo.textContent = user.displayName || user.email || 'Signed in';
            }
            if (lastUser === null) {
                showToast(`Signed in as ${user.displayName || user.email || 'User'}`);
            }
            
            try {
                await StorageManager.restoreFromCloud(user.uid);
                applyRestoredSettings();
            } catch (e) {
                console.error("Failed to restore cloud settings/scores:", e);
            }
        } else {
            if (btnLogin) btnLogin.style.display = 'flex';
            if (btnGuest) btnGuest.style.display = 'flex';
            if (btnLogout) btnLogout.style.display = 'none';
            if (accountUserInfo) {
                accountUserInfo.style.display = 'none';
                accountUserInfo.textContent = '';
            }
            if (lastUser) {
                showToast("Signed out successfully");
            }
        }
        lastUser = user;
    });
    // Play buttons in the Main Menu overlay
    const btnMissions = $('btn-play-missions');
    const btnClassic = $('btn-play-classic');
    const btnClassic10 = $('btn-play-classic-10');
    const btnBlast = $('btn-play-blast');
    const btnEndless = $('btn-play-endless');

    if (btnMissions) btnMissions.addEventListener('click', () => { triggerHaptic('light'); audio.playTap(); openLevelSelect(); });
    if (btnClassic) btnClassic.addEventListener('click', () => { triggerHaptic('light'); audio.playTap(); selectMode('classic'); });
    if (btnClassic10) btnClassic10.addEventListener('click', () => { triggerHaptic('light'); audio.playTap(); selectMode('classic_10'); });
    if (btnBlast) btnBlast.addEventListener('click', () => { triggerHaptic('light'); audio.playTap(); selectMode('blast'); });
    if (btnEndless) btnEndless.addEventListener('click', () => { triggerHaptic('light'); audio.playTap(); selectMode('endless'); });

    // About button in main menu footer
    const btnMenuAbout = $('btn-menu-about');
    if (btnMenuAbout) {
        btnMenuAbout.addEventListener('click', () => {
            triggerHaptic('light');
            audio.playTap();
            openAbout();
        });
    }

    // Privacy Policy button in main menu footer
    const btnMenuPrivacy = $('btn-menu-privacy');
    if (btnMenuPrivacy) {
        btnMenuPrivacy.addEventListener('click', () => {
            triggerHaptic('light');
            audio.playTap();
            openLegal('Privacy Policy', 'legal/privacy.html');
        });
    }

    // About modal: close button
    const btnAboutClose = $('btn-about-close');
    if (btnAboutClose) {
        btnAboutClose.addEventListener('click', () => {
            triggerHaptic('light');
            audio.playTap();
            closeAbout();
        });
    }

    // About modal: backdrop tap to close
    const aboutOverlay = $('about-overlay');
    if (aboutOverlay) {
        aboutOverlay.addEventListener('click', (e) => {
            if (e.target === aboutOverlay) closeAbout();
        });
    }

    // About modal: Privacy Policy link
    const btnAboutPrivacy = $('btn-about-privacy');
    if (btnAboutPrivacy) {
        btnAboutPrivacy.addEventListener('click', () => {
            triggerHaptic('light');
            audio.playTap();
            openLegal('Privacy Policy', 'legal/privacy.html');
        });
    }

    // Legal modal: close button
    const btnLegalClose = $('btn-legal-close');
    if (btnLegalClose) {
        btnLegalClose.addEventListener('click', () => {
            triggerHaptic('light');
            audio.playTap();
            closeLegal();
        });
    }

    // Legal modal: backdrop tap to close
    const legalOverlay = $('legal-overlay');
    if (legalOverlay) {
        legalOverlay.addEventListener('click', (e) => {
            if (e.target === legalOverlay) closeLegal();
        });
    }

    // Home button in HUD
    const btnHome = $('btn-home');
    if (btnHome) {
        btnHome.addEventListener('click', () => {
            triggerHaptic('light');
            saveCurrentGameState();
            audio.setBgmVolume(StorageManager.getSettings().bgmVolume !== undefined ? StorageManager.getSettings().bgmVolume / 100 : 0.5);
            audio.startBgm();
            document.body.classList.add('menu-active');
            const menuOverlay = $('main-menu-overlay');
            if (menuOverlay) menuOverlay.classList.remove('hidden');
            updateMenuHighScore();
        });
    }

    // Restart button on GameOver Modal
    const btnRestart = $('btn-restart');
    if (btnRestart) {
        btnRestart.addEventListener('click', () => {
            triggerHaptic('light');
            const overlay = $('gameover-overlay');
            if (overlay) overlay.classList.add('hidden');
            startNewGame();
        });
    }

    // Watch Ad to Revive Button
    const btnWatchRevive = $('btn-watch-revive');
    if (btnWatchRevive) {
        btnWatchRevive.addEventListener('click', () => {
            triggerHaptic('light');
            audio.playTap();
            
            // Show loading state
            btnWatchRevive.disabled = true;
            const originalText = btnWatchRevive.innerText;
            btnWatchRevive.innerText = "🎥 Loading Ad...";
            
            // Stop BGM before showing ad
            audio.stopBgm();

            // Watch rewarded video
            AdManager.showRewarded(
                () => {
                    // Reset button state
                    btnWatchRevive.disabled = false;
                    btnWatchRevive.innerText = originalText;

                    // Reward Granted!
                    const overlay = $('revive-overlay');
                    if (overlay) overlay.classList.add('hidden');
                    
                    // Clear 3 random rows/columns
                    performReviveBoardClear();
                    
                    // Refill tray slots
                    spawner.slots = [null, null, null];
                    spawner.refillTray(board, score, activeMode, missionLevel, activeBombs);
                    
                    // Reset bomb alerts if they were active
                    activeBombs = [];
                    const dangerBar = $('danger-bar');
                    if (dangerBar) dangerBar.classList.add('hidden');
                    
                    // Reset flags
                    revivedThisGame = true;
                    gamePaused = false;
                    
                    // Play win audio arpeggio for victory feel
                    audio.playLevelWin();
                    particles.addFloatingText('REVIVED!', boardLayout.x + boardLayout.width / 2, boardLayout.y + boardLayout.height / 2, { color: '#ffd700', isPraise: true });
                    
                    // Save the active revive state
                    saveCurrentGameState();
                },
                () => {
                    // Reset button state
                    btnWatchRevive.disabled = false;
                    btnWatchRevive.innerText = originalText;

                    // Ad Closed
                    const overlay = $('revive-overlay');
                    if (overlay) overlay.classList.add('hidden');
                    
                    gamePaused = false;
                    triggerGameOver(pendingGameOverReason);
                },
                (err) => {
                    // Reset button state
                    btnWatchRevive.disabled = false;
                    btnWatchRevive.innerText = originalText;

                    // Ad Failed to load/show - inform user and let them retry instead of forcing game over
                    console.warn('[Brickly] Rewarded ad failed to load:', err);
                    alert("Unable to load the ad. Please check your internet connection, VPN, or ad-blocker settings and try again.");
                }
            );
        });
    }

    // Skip Revive / No Thanks Button
    const btnSkipRevive = $('btn-skip-revive');
    if (btnSkipRevive) {
        btnSkipRevive.addEventListener('click', () => {
            triggerHaptic('light');
            audio.playTap();
            
            const overlay = $('revive-overlay');
            if (overlay) overlay.classList.add('hidden');
            
            gamePaused = false;
            triggerGameOver(pendingGameOverReason);
        });
    }

    // Next Level / Continue button on Success Modal
    const btnNextLevel = $('btn-next-level');
    if (btnNextLevel) {
        btnNextLevel.addEventListener('click', () => {
            triggerHaptic('light');
            const overlay = $('success-overlay');
            if (overlay) overlay.classList.add('hidden');
            startNewGame();
        });
    }

    // Levels button on Success Modal (missions only)
    const btnLevelsList = $('btn-levels-list');
    if (btnLevelsList) {
        btnLevelsList.addEventListener('click', () => {
            triggerHaptic('light');
            const overlay = $('success-overlay');
            if (overlay) overlay.classList.add('hidden');
            openLevelSelect();
        });
    }

    // Close button on Success Modal
    const btnSuccessClose = $('btn-success-close');
    if (btnSuccessClose) {
        btnSuccessClose.addEventListener('click', () => {
            triggerHaptic('light');
            const overlay = $('success-overlay');
            if (overlay) overlay.classList.add('hidden');
            audio.setBgmVolume(StorageManager.getSettings().bgmVolume !== undefined ? StorageManager.getSettings().bgmVolume / 100 : 0.5);
            audio.startBgm();
            document.body.classList.add('menu-active');
            const menuOverlay = $('main-menu-overlay');
            if (menuOverlay) menuOverlay.classList.remove('hidden');
            updateMenuHighScore();
        });
    }

    // Level Select close button
    const btnLevelSelectClose = $('btn-level-select-close');
    if (btnLevelSelectClose) {
        btnLevelSelectClose.addEventListener('click', () => {
            triggerHaptic('light');
            audio.playTap();
            closeLevelSelect();
        });
    }

    // Settings gear button — open the settings modal
    const btnMenuSettings = $('btn-menu-settings');
    if (btnMenuSettings) btnMenuSettings.addEventListener('click', () => { triggerHaptic('light'); audio.playTap(); openSettings(); });

    const btnGameSettings = $('btn-game-settings');
    if (btnGameSettings) btnGameSettings.addEventListener('click', () => { triggerHaptic('light'); audio.playTap(); openSettings(); });

    const btnMissionsLevels = $('btn-missions-levels');
    if (btnMissionsLevels) btnMissionsLevels.addEventListener('click', () => { triggerHaptic('light'); audio.playTap(); openLevelSelect(); });

    // Settings modal: close X button
    const btnSettingsClose = $('btn-settings-close');
    if (btnSettingsClose) btnSettingsClose.addEventListener('click', () => { triggerHaptic('light'); audio.playTap(); closeSettings(); });

    // Settings modal: Rate Us
    const btnSettingsRate = $('btn-settings-rate');
    if (btnSettingsRate) {
        btnSettingsRate.addEventListener('click', () => {
            triggerHaptic('light');
            audio.playTap();
            const appId = 'com.brickly.game';
            const url = `https://play.google.com/store/apps/details?id=${appId}`;
            window.open(url, '_blank');
        });
    }

    // Settings modal: Sound slider
    const sliderSound = $('slider-sound');
    const valSound = $('val-sound');
    const iconSound = $('settings-sound-icon');
    let sfxMuted = false;
    let sfxLastVol = 80;
    if (sliderSound) {
        sliderSound.addEventListener('input', () => {
            const vol = parseInt(sliderSound.value);
            audio.setSfxVolume(vol / 100);
            sfxMuted = vol === 0;
            if (valSound) valSound.textContent = vol + '%';
            if (iconSound) iconSound.classList.toggle('muted', vol === 0);
            saveSettingsState();
        });
    }
    if (iconSound) {
        iconSound.addEventListener('click', () => {
            triggerHaptic('light');
            if (sfxMuted || (sliderSound && parseInt(sliderSound.value) === 0)) {
                // Unmute — restore previous volume
                const restore = sfxLastVol || 80;
                if (sliderSound) sliderSound.value = restore;
                audio.setSfxVolume(restore / 100);
                sfxMuted = false;
                if (valSound) valSound.textContent = restore + '%';
                if (iconSound) iconSound.classList.remove('muted');
            } else {
                // Mute
                sfxLastVol = sliderSound ? parseInt(sliderSound.value) : 80;
                if (sliderSound) sliderSound.value = 0;
                audio.setSfxVolume(0);
                sfxMuted = true;
                if (valSound) valSound.textContent = '0%';
                if (iconSound) iconSound.classList.add('muted');
            }
            saveSettingsState();
        });
    }

    // Settings modal: Music slider
    const sliderMusic = $('slider-music');
    const valMusic = $('val-music');
    const iconMusic = document.querySelectorAll('.settings-slider-icon')[1];
    let bgmMuted = false;
    let bgmLastVol = 50;
    if (sliderMusic) {
        sliderMusic.addEventListener('input', () => {
            const vol = parseInt(sliderMusic.value);
            audio.setBgmVolume(vol / 100);
            bgmMuted = vol === 0;
            if (vol > 0) {
                audio.bgmEnabled = true;
                audio.init();
                audio.resume();
            }
            if (valMusic) valMusic.textContent = vol + '%';
            if (iconMusic) iconMusic.classList.toggle('muted', vol === 0);
            saveSettingsState();
        });
    }
    if (iconMusic) {
        iconMusic.addEventListener('click', () => {
            triggerHaptic('light');
            if (bgmMuted || (sliderMusic && parseInt(sliderMusic.value) === 0)) {
                // Unmute — restore previous volume
                const restore = bgmLastVol || 50;
                if (sliderMusic) sliderMusic.value = restore;
                audio.setBgmVolume(restore / 100);
                audio.bgmEnabled = true;
                audio.init();
                audio.resume();
                if (document.body.classList.contains('menu-active')) {
                    audio.startBgm();
                }
                bgmMuted = false;
                if (valMusic) valMusic.textContent = restore + '%';
                if (iconMusic) iconMusic.classList.remove('muted');
            } else {
                // Mute
                bgmLastVol = sliderMusic ? parseInt(sliderMusic.value) : 50;
                if (sliderMusic) sliderMusic.value = 0;
                audio.setBgmVolume(0);
                bgmMuted = true;
                if (valMusic) valMusic.textContent = '0%';
                if (iconMusic) iconMusic.classList.add('muted');
            }
            saveSettingsState();
        });
    }

    // Settings modal: Vibration toggle
    const toggleVibration = $('toggle-vibration');
    if (toggleVibration) {
        toggleVibration.addEventListener('click', () => {
            vibrationEnabled = !vibrationEnabled;
            saveSettingsState();
            updateSoundIcons();
            if (vibrationEnabled) triggerHaptic('light');
        });
    }

    // Settings modal: Feedback
    const btnSettingsFeedback = $('btn-settings-feedback');
    if (btnSettingsFeedback) {
        btnSettingsFeedback.addEventListener('click', () => {
            triggerHaptic('light');
            const subject = encodeURIComponent('Brickly - Feedback');
            const body = encodeURIComponent('Hi, I have some feedback about Brickly:\n\n');
            window.open(`mailto:brickly.game@gmail.com?subject=${subject}&body=${body}`, '_blank');
        });
    }

    // Settings modal: Privacy Policy
    const btnSettingsPrivacy = $('btn-settings-privacy');
    if (btnSettingsPrivacy) {
        btnSettingsPrivacy.addEventListener('click', () => {
            triggerHaptic('light');
            openLegal('Privacy Policy', 'legal/privacy.html');
        });
    }

    // Settings modal: Terms of Service
    const btnSettingsTerms = $('btn-settings-terms');
    if (btnSettingsTerms) {
        btnSettingsTerms.addEventListener('click', () => {
            triggerHaptic('light');
            openLegal('Terms of Service', 'legal/terms.html');
        });
    }

    // Settings modal: backdrop tap to close
    const settingsOverlay = $('settings-overlay');
    if (settingsOverlay) {
        settingsOverlay.addEventListener('click', (e) => {
            if (e.target === settingsOverlay) closeSettings();
        });
    }

    // Settings modal: Resume button (only visible during gameplay pause)
    const btnSettingsResume = $('btn-settings-resume');
    if (btnSettingsResume) {
        btnSettingsResume.addEventListener('click', () => {
            triggerHaptic('light');
            audio.playTap();
            closeSettings();
        });
    }

    // Settings modal: Home button
    const btnSettingsHome = $('btn-settings-home');
    if (btnSettingsHome) {
        btnSettingsHome.addEventListener('click', () => {
            triggerHaptic('light');
            audio.playTap();
            closeSettings();
            saveCurrentGameState();
            audio.setBgmVolume(StorageManager.getSettings().bgmVolume !== undefined ? StorageManager.getSettings().bgmVolume / 100 : 0.5);
            audio.startBgm();
            document.body.classList.add('menu-active');
            const menuOverlay = $('main-menu-overlay');
            if (menuOverlay) menuOverlay.classList.remove('hidden');
        });
    }

    // Settings modal: Restart button
    const btnSettingsRestart = $('btn-settings-restart');
    if (btnSettingsRestart) {
        btnSettingsRestart.addEventListener('click', () => {
            triggerHaptic('light');
            audio.playTap();
            closeSettings();
            startNewGame();
        });
    }

    // Settings modal: Change Skin — opens the theme picker grid
    const btnSettingsTheme = $('btn-settings-theme');
    if (btnSettingsTheme) {
        btnSettingsTheme.addEventListener('click', () => {
            triggerHaptic('light');
            audio.playTap();
            buildSkinPickerGrid();
            const overlay = $('skin-picker-overlay');
            if (overlay) overlay.classList.remove('hidden');
        });
    }

    // Skin picker close button
    const btnSkinPickerClose = $('skin-picker-close');
    if (btnSkinPickerClose) {
        btnSkinPickerClose.addEventListener('click', () => {
            triggerHaptic('light');
            audio.playTap();
            const overlay = $('skin-picker-overlay');
            if (overlay) overlay.classList.add('hidden');
        });
    }

    // Tap outside skin picker modal to close
    const skinPickerOverlay = $('skin-picker-overlay');
    if (skinPickerOverlay) {
        skinPickerOverlay.addEventListener('click', (e) => {
            if (e.target === skinPickerOverlay) {
                skinPickerOverlay.classList.add('hidden');
            }
        });
    }

    // Settings modal: Menu Background change
    const btnSettingsMenuTheme = $('btn-settings-menu-theme');
    if (btnSettingsMenuTheme) {
        btnSettingsMenuTheme.addEventListener('click', () => {
            triggerHaptic('light');
            audio.playTap();
            let idx = MENU_THEMES.indexOf(activeMenuTheme);
            idx = (idx + 1) % MENU_THEMES.length;
            activeMenuTheme = MENU_THEMES[idx];
            applyMenuTheme(activeMenuTheme);
            saveSettingsState();
            
            const label = $('menu-theme-label');
            if (label) label.innerText = 'Theme: ' + activeMenuTheme.charAt(0).toUpperCase() + activeMenuTheme.slice(1);
        });
    }
}

// --- Open URL (Capacitor in-app browser with fallback) ---
function openUrl(url) {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Browser) {
        window.Capacitor.Plugins.Browser.open({ url });
    } else {
        window.open(url, '_blank');
    }
}

// --- Open Legal Page in Modal ---
function openLegal(title, file) {
    const overlay = $('legal-overlay');
    const iframe = $('legal-iframe');
    const titleEl = $('legal-title');
    if (titleEl) titleEl.textContent = title;
    if (iframe) iframe.src = file;
    if (overlay) overlay.classList.remove('hidden');
}

function closeLegal() {
    const overlay = $('legal-overlay');
    const iframe = $('legal-iframe');
    if (iframe) iframe.src = '';
    if (overlay) overlay.classList.add('hidden');
}

// --- Settings Modal Open/Close ---
function openSettings() {
    updateSoundIcons();
    
    // Sync sliders with stored settings
    const settings = StorageManager.getSettings();
    const sfxVol = settings.sfxVolume !== undefined ? settings.sfxVolume : (settings.sfx !== false ? 80 : 0);
    const bgmVol = settings.bgmVolume !== undefined ? settings.bgmVolume : (settings.bgm !== false ? 50 : 0);

    const sliderSound = $('slider-sound');
    const valSound = $('val-sound');
    const iconSound = $('settings-sound-icon');
    const sliderMusic = $('slider-music');
    const valMusic = $('val-music');
    const iconMusic = document.querySelectorAll('.settings-slider-icon')[1];

    if (sliderSound) sliderSound.value = sfxVol;
    if (valSound) valSound.textContent = sfxVol + '%';
    if (iconSound) iconSound.classList.toggle('muted', sfxVol === 0);

    if (sliderMusic) sliderMusic.value = bgmVol;
    if (valMusic) valMusic.textContent = bgmVol + '%';
    if (iconMusic) iconMusic.classList.toggle('muted', bgmVol === 0);
    
    const isMenu = document.body.classList.contains('menu-active');
    
    const btnResume = $('btn-settings-resume');
    const btnHome = $('btn-settings-home');
    const btnRestart = $('btn-settings-restart');
    const btnTheme = $('btn-settings-theme');
    const btnMenuBg = $('btn-settings-menu-theme');
    const btnRate = $('btn-settings-rate');
    const btnFeedback = $('btn-settings-feedback');
    const btnPrivacy = $('btn-settings-privacy');
    const btnTerms = $('btn-settings-terms');
    const accountBox = $('account-settings-box');
    
    if (isMenu) {
        if (btnResume) btnResume.style.display = 'none';
        if (btnHome) btnHome.style.display = 'none';
        if (btnRestart) btnRestart.style.display = 'none';
        if (btnTheme) btnTheme.style.display = 'none';
        if (btnRate) btnRate.style.display = 'flex';
        if (btnFeedback) btnFeedback.style.display = 'flex';
        if (btnPrivacy) btnPrivacy.style.display = 'flex';
        if (btnTerms) btnTerms.style.display = 'flex';
        if (accountBox) accountBox.style.display = 'block';
        if (btnMenuBg) {
            btnMenuBg.style.display = 'flex';
            const label = $('menu-theme-label');
            if (label) label.innerText = 'Theme: ' + activeMenuTheme.charAt(0).toUpperCase() + activeMenuTheme.slice(1);
        }
    } else {
        gamePaused = true;
        if (btnResume) btnResume.style.display = 'flex';
        if (btnHome) btnHome.style.display = 'flex';
        if (btnRestart) btnRestart.style.display = 'flex';
        if (btnTheme) {
            btnTheme.style.display = 'flex';
            const label = $('game-theme-label');
            if (label) label.innerText = 'Skin: ' + activeTheme.charAt(0).toUpperCase() + activeTheme.slice(1);
        }
        if (btnMenuBg) btnMenuBg.style.display = 'none';
        if (btnRate) btnRate.style.display = 'none';
        if (btnFeedback) btnFeedback.style.display = 'none';
        if (btnPrivacy) btnPrivacy.style.display = 'none';
        if (btnTerms) btnTerms.style.display = 'none';
        if (accountBox) accountBox.style.display = 'none';
    }

    const overlay = $('settings-overlay');
    if (overlay) overlay.classList.remove('hidden');
}

function closeSettings() {
    gamePaused = false;
    const overlay = $('settings-overlay');
    if (overlay) overlay.classList.add('hidden');
}

// --- About Modal Open/Close ---
function openAbout() {
    const overlay = $('about-overlay');
    if (overlay) overlay.classList.remove('hidden');
}

function closeAbout() {
    const overlay = $('about-overlay');
    if (overlay) overlay.classList.add('hidden');
}

// --- Level Select (Missions) ---
function openLevelSelect() {
    const unlockedLevel = StorageManager.getAdventureProgress();
    const grid = $('level-grid');
    if (!grid) return;
    grid.innerHTML = '';

    for (let i = 0; i < AdventureLevels.length; i++) {
        const lvl = AdventureLevels[i];
        const levelNum = lvl.levelNumber;
        const cell = document.createElement('div');
        cell.className = 'level-cell';

        const numSpan = document.createElement('span');
        numSpan.className = 'cell-number';
        numSpan.textContent = levelNum;
        cell.appendChild(numSpan);

        if (levelNum < unlockedLevel) {
            cell.classList.add('completed');
            cell.addEventListener('click', () => {
                triggerHaptic('medium');
                missionLevel = levelNum;
                closeLevelSelect();
                selectMode('missions', true);
            });
        } else if (levelNum === unlockedLevel) {
            cell.classList.add('current');
            cell.addEventListener('click', () => {
                triggerHaptic('medium');
                missionLevel = levelNum;
                closeLevelSelect();
                selectMode('missions', true);
            });
        } else {
            cell.classList.add('locked');
        }

        if (levelNum > unlockedLevel) {
            const icon = document.createElement('span');
            icon.className = 'cell-icon';
            icon.textContent = '🔒';
            cell.appendChild(icon);
        }

        grid.appendChild(cell);
    }

    const progText = $('level-progress-text');
    if (progText) progText.textContent = `Progress: ${unlockedLevel - 1} / ${AdventureLevels.length}`;

    // Scroll to current level
    const currentCell = grid.querySelector('.level-cell.current');
    if (currentCell) {
        setTimeout(() => {
            currentCell.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 100);
    }

    const overlay = $('level-select-overlay');
    if (overlay) overlay.classList.remove('hidden');
}

function closeLevelSelect() {
    const overlay = $('level-select-overlay');
    if (overlay) overlay.classList.add('hidden');
}

// --- Combo Ring Widget Updater ---
function updateComboWidget() {
    const widget = $('combo-widget');
    if (!widget) return;
    if (!comboTimerActive || comboStreak < 1) {
        widget.classList.add('hidden');
        return;
    }
    widget.classList.remove('hidden');

    const CIRCUMFERENCE = 2 * Math.PI * 18; // r=18 ≈ 113.1
    const pct = comboTimerMs / COMBO_WINDOW_MS;
    const offset = CIRCUMFERENCE * (1 - pct);
    const ringFill = $('combo-ring-fill');
    if (ringFill) ringFill.style.strokeDashoffset = offset;

    const timerEl = $('combo-timer-val');
    if (timerEl) timerEl.textContent = Math.ceil(comboTimerMs / 1000);

    const countEl = $('combo-count');
    
    // Choose dynamic combo colors from the active theme's block colors
    const theme = getActiveThemeConfig();
    const comboColors = [
        theme.colors[1] || '#ffd700',
        theme.colors[2] || '#ff8c00',
        theme.colors[5] || '#ff3300',
        theme.colors[6] || '#c840ff'
    ];
    const color = comboColors[Math.min(comboStreak - 1, comboColors.length - 1)];

    if (countEl) { 
        countEl.textContent = `x${comboStreak}`; 
        countEl.style.color = color; 
    }
    if (ringFill) ringFill.style.stroke = color;
}


function triggerThemeChange(isGameplay = false) {
    const themeKeys = ['indigo', 'classic', 'neon', 'wood', 'gems', 'pastel', 'blush', 'snow', 'ocean', 'aurora', 'watermelon', 'cheese', 'crochet', 'tropical', 'marble', 'lava', 'sakura', 'candy', 'brickWall', 'industrialMetal', 'slate', 'volcanic', 'brickClassic', 'muddyDirt', 'heavyMetal', 'cobbleStone', 'mahoganyWood', 'driftWood', 'tile01', 'tile03', 'tile05', 'tile07', 'tile09', 'tile11', 'tile13', 'tile15', 'tile17', 'tile19'];
    let nextIndex = (themeKeys.indexOf(activeTheme) + 1) % themeKeys.length;
    const nextTheme = themeKeys[nextIndex];
    
    triggerHaptic('heavy');
    
    prevTheme = activeTheme;
    activeTheme = nextTheme;
    transitionProgress = 0.0;
    transitionStartTime = performance.now();
    applyTheme(activeTheme);
    saveSettingsState();
}

/**
 * Builds (or rebuilds) the skin picker grid with one swatch per theme.
 * Each swatch shows the theme bg color + 4 block color dots + theme name.
 * The currently active theme gets a white-border "active" highlight.
 */
function buildSkinPickerGrid() {
    const grid = $('skin-picker-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const themeKeys = [
        'indigo', 'classic', 'neon', 'wood', 'gems', 'pastel',
        'blush', 'snow', 'ocean', 'aurora', 'watermelon', 'cheese',
        'crochet', 'tropical', 'marble', 'lava', 'sakura', 'candy',
        'brickWall', 'industrialMetal', 'slate', 'volcanic',
        'brickClassic', 'muddyDirt', 'heavyMetal', 'cobbleStone',
        'mahoganyWood', 'driftWood', 'tile01', 'tile03', 'tile05',
        'tile07', 'tile09', 'tile11', 'tile13', 'tile15', 'tile17', 'tile19'
    ];

    themeKeys.forEach(key => {
        const theme = THEMES[key];
        if (!theme) return;

        const swatch = document.createElement('div');
        swatch.className = 'skin-swatch' + (key === activeTheme ? ' active' : '');
        swatch.style.background = theme.colors.bg;
        swatch.setAttribute('data-theme', key);

        // 2×2 block color dot grid
        const dotsEl = document.createElement('div');
        dotsEl.className = 'skin-swatch-dots';
        [1, 2, 3, 4].forEach(i => {
            const dot = document.createElement('div');
            dot.className = 'skin-swatch-dot';
            
            const color = theme.colors[i] || '#fff';
            dot.style.backgroundColor = color;
            
            // Apply style-specific rendering effects to the swatch dots
            if (theme.blockStyle === 'neon') {
                dot.style.boxShadow = `inset 0 0 4px #fff, 0 0 6px ${color}`;
                dot.style.borderColor = color;
            } else if (theme.blockStyle === 'cushion') {
                dot.style.background = `linear-gradient(135deg, ${color}, ${darkenColor(color, -18)})`;
                dot.style.border = `1px solid ${darkenColor(color, -25)}`;
            } else if (theme.blockStyle === 'gemstone') {
                dot.style.background = `linear-gradient(135deg, ${lightenColor(color, 20)}, ${color}, ${darkenColor(color, -25)})`;
                dot.style.border = `1px solid ${darkenColor(color, -40)}`;
            } else if (theme.blockStyle === 'wood') {
                dot.style.background = `linear-gradient(135deg, ${color}, ${darkenColor(color, -20)})`;
                dot.style.border = `1px solid ${darkenColor(color, -40)}`;
            } else if (theme.blockStyle === 'volcanic') {
                dot.style.background = `linear-gradient(135deg, ${color}, ${darkenColor(color, -25)})`;
                dot.style.border = `1.5px solid ${lightenColor(color, 25)}`;
            } else {
                // Default / Pastel / Textured base border
                dot.style.border = `1px solid rgba(255,255,255,0.15)`;
            }

            // Apply texture overlay if the theme has a texture configured
            if (theme.texture) {
                dot.style.backgroundImage = `url('assets/images/textures/${theme.texture}.png')`;
                dot.style.backgroundSize = 'cover';
                dot.style.backgroundPosition = 'center';
                if (theme.blockStyle !== 'textured') {
                    // Blend style colors and texture overlay (creates beautiful mahogany/wood/volcanic overlays)
                    dot.style.backgroundBlendMode = 'multiply';
                }
            }

            dotsEl.appendChild(dot);
        });

        const nameEl = document.createElement('div');
        nameEl.className = 'skin-swatch-name';
        nameEl.textContent = theme.name;

        swatch.appendChild(dotsEl);
        swatch.appendChild(nameEl);

        swatch.addEventListener('click', () => {
            if (key === activeTheme) {
                // Already active — just close
                $('skin-picker-overlay').classList.add('hidden');
                return;
            }
            prevTheme = activeTheme;
            activeTheme = key;
            transitionProgress = 0.0;
            transitionStartTime = performance.now();
            applyTheme(activeTheme);
            saveSettingsState();
            triggerHaptic('medium');
            audio.playTap();

            // Update active indicator in grid
            grid.querySelectorAll('.skin-swatch').forEach(el => el.classList.remove('active'));
            swatch.classList.add('active');

            // Update the label on the Change Skin button
            const label = $('game-theme-label');
            if (label) label.innerText = theme.name;

            // Close the picker after a short visual confirmation delay
            setTimeout(() => {
                const overlay = $('skin-picker-overlay');
                if (overlay) overlay.classList.add('hidden');
            }, 380);
        });

        grid.appendChild(swatch);
    });

    // Scroll the active swatch into view
    const activeSwatch = grid.querySelector('.skin-swatch.active');
    if (activeSwatch) {
        setTimeout(() => activeSwatch.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 50);
    }
}

function applyTheme(themeId) {
    const menuActive = document.body.classList.contains('menu-active');
    // Remove only old theme classes, keep everything else
    const classes = Array.from(document.body.classList);
    classes.forEach(cls => {
        if (cls.startsWith('theme-') && cls !== `theme-${themeId}`) {
            document.body.classList.remove(cls);
        }
    });
    if (menuActive) document.body.classList.add('menu-active');
    document.body.classList.add(`theme-${themeId}`);
}

function applyMenuTheme(themeId) {
    const overlay = $('main-menu-overlay');
    if (!overlay) return;
    MENU_THEMES.forEach(t => overlay.classList.remove(`menu-theme-${t}`));
    overlay.classList.add(`menu-theme-${themeId}`);
}

// Cache the Haptics plugin proxy at module level
let _hapticsPlugin = undefined;
function getHaptics() {
    if (_hapticsPlugin === undefined) {
        _hapticsPlugin = (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics)
            ? window.Capacitor.Plugins.Haptics
            : null;
    }
    // If still null, retry once (plugin may not have been ready on first call)
    if (_hapticsPlugin === null && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics) {
        _hapticsPlugin = window.Capacitor.Plugins.Haptics;
    }
    return _hapticsPlugin;
}

function triggerHaptic(type = 'light') {
    if (!vibrationEnabled) return;

    // 1. Capacitor native haptics (works on both iOS + Android devices)
    const Haptics = getHaptics();
    if (Haptics) {
        try {
            if (type === 'double') {
                Haptics.vibrate({ duration: 60 });
                setTimeout(() => { try { Haptics.vibrate({ duration: 60 }); } catch(_) {} }, 100);
            } else {
                const duration = type === 'light' ? 50 : type === 'heavy' ? 100 : 70;
                Haptics.vibrate({ duration });
            }
            return;
        } catch (e) {}
    }

    // 2. Web Vibration API fallback (Android Chrome only — iOS Safari does NOT support this)
    if ('vibrate' in navigator) {
        try {
            if (type === 'light') navigator.vibrate(50);
            else if (type === 'medium') navigator.vibrate(70);
            else if (type === 'heavy') navigator.vibrate(100);
            else if (type === 'double') navigator.vibrate([60, 100, 60]);
        } catch (e) {}
    }
}

function updateSoundIcons() {
    const soundIcon = $('settings-sound-icon');
    const sliderSound = $('slider-sound');
    const sfxVol = sliderSound ? parseInt(sliderSound.value) : (audio.enabled ? 80 : 0);
    if (soundIcon) soundIcon.classList.toggle('muted', sfxVol === 0);

    const bgmIcon = document.querySelectorAll('.settings-slider-icon')[1];
    const sliderMusic = $('slider-music');
    const bgmVol = sliderMusic ? parseInt(sliderMusic.value) : 50;
    if (bgmIcon) bgmIcon.classList.toggle('muted', bgmVol === 0);

    const vibrationIcon = $('toggle-vibration')?.querySelector('.settings-toggle-icon');
    if (vibrationIcon) vibrationIcon.classList.toggle('off', !vibrationEnabled);
}

function saveSettingsState() {
    const sliderSound = $('slider-sound');
    const sliderMusic = $('slider-music');
    const sfxVol = sliderSound ? parseInt(sliderSound.value) : (audio.enabled ? 80 : 0);
    const bgmVol = sliderMusic ? parseInt(sliderMusic.value) : 50;
    StorageManager.saveSettings({
        theme: activeTheme,
        menuTheme: activeMenuTheme,
        sfx: audio.enabled,
        bgm: audio.bgmEnabled,
        vibration: vibrationEnabled,
        sfxVolume: sfxVol,
        bgmVolume: bgmVol
    });
}

// --- Easing Functions ---
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

// --- Board Clear Wave Helpers ---
function getCellClearProgress(r, c, now) {
    if (!boardClearAnimActive || boardClearAnimStage !== 1) return 0;
    const elapsed = now - boardClearAnimStartTime;
    const cellDelay = (r * BOARD_CLEAR_ROW_DELAY) + (c * BOARD_CLEAR_COL_DELAY);
    const raw = (elapsed - cellDelay) / BOARD_CLEAR_CELL_DURATION;
    return clamp(raw, 0, 1);
}

// --- Theme Transition Color Interpolators ---
function parseColor(str) {
    if (!str) return [255, 255, 255, 1];
    str = str.trim();
    if (str.startsWith('#')) {
        let hex = str.slice(1);
        if (hex.length === 3) {
            hex = hex.split('').map(x => x + x).join('');
        }
        const num = parseInt(hex, 16);
        return [num >> 16, (num >> 8) & 255, num & 255, 1];
    } else if (str.startsWith('rgba') || str.startsWith('rgb')) {
        const parts = str.match(/[\d.]+/g);
        if (parts) {
            const r = parseInt(parts[0], 10);
            const g = parseInt(parts[1], 10);
            const b = parseInt(parts[2], 10);
            const a = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
            return [r, g, b, a];
        }
    }
    return [255, 255, 255, 1];
}

function stringifyColor(rgba) {
    return `rgba(${Math.round(rgba[0])}, ${Math.round(rgba[1])}, ${Math.round(rgba[2])}, ${rgba[3]})`;
}

function lerpColor(strA, strB, t) {
    const cA = parseColor(strA);
    const cB = parseColor(strB);
    const r = cA[0] + (cB[0] - cA[0]) * t;
    const g = cA[1] + (cB[1] - cA[1]) * t;
    const b = cA[2] + (cB[2] - cA[2]) * t;
    const a = cA[3] + (cB[3] - cA[3]) * t;
    return stringifyColor([r, g, b, a]);
}

function getActiveThemeConfig() {
    let targetTheme = THEMES[activeTheme];
    if (!targetTheme) {
        targetTheme = THEMES['classic'] || Object.values(THEMES)[0];
    }
    if (transitionProgress >= 1.0) {
        return targetTheme;
    }
    let fromTheme = THEMES[prevTheme] || targetTheme;
    if (!fromTheme) {
        fromTheme = targetTheme;
    }
    const t = transitionProgress;
    const colors = {};
    for (const key in targetTheme.colors) {
        colors[key] = lerpColor(fromTheme.colors[key] || targetTheme.colors[key], targetTheme.colors[key], t);
    }
    return {
        id: targetTheme.id,
        name: targetTheme.name,
        colors: colors,
        blockStyle: t < 0.5 ? fromTheme.blockStyle : targetTheme.blockStyle,
        particleStyle: t < 0.5 ? fromTheme.particleStyle : targetTheme.particleStyle,
        transitionProgress: t,
        prevThemeId: fromTheme.id,
        activeThemeId: targetTheme.id
    };
}
