/**
 * Brickly - Main Game Orchestrator & Loop
 * Integrates the core engine, spawner, audio, themes, particles, and storage,
 * managing mobile touch dragging, state validations, and HUD bindings.
 */

import { Board } from './engine.js';
import { Spawner } from './spawner.js';
import { StorageManager } from './storage.js';
import { ModeManager, AdventureLevels } from './modes.js';
import { THEMES, drawThemeBlock } from './themes.js';
import { AudioManager } from './audio.js';
import { ParticleSystem } from './particles.js';

// --- Null-safe DOM helper ---
function $(id) { return document.getElementById(id); }

// Global error handler — catch silent crashes that prevent init
window.onerror = function(msg, src, line, col, err) {
    console.error('[Brickly] Runtime error:', msg, 'at', src, line + ':' + col, err);
    document.body.classList.add('menu-active');
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
const COMBO_WINDOW_MS = 10000;
let lastFrameTime = 0;     // For deltaTime computation in renderLoop
let placementCount = 0;    // Number of blocks placed in Blast mode

let activeMode = 'classic'; // 'classic', 'missions', 'blast'
let activeTheme = 'indigo'; // default skin: dark blue with gold+purple blocks
let prevTheme = 'indigo';
let transitionProgress = 1.0;
const transitionDuration = 75; // ~1.25 s at 60 fps
let transitionStartTime = 0;   // performance.now() when transition began
let vibrationEnabled = true;

const MENU_THEMES = ['royal', 'neon', 'twilight', 'teal'];
let activeMenuTheme = 'royal';

// Mode Specific States
let currentLevelConfig = null;
let missionLevel = 1;
let movesLimit = 0;
let linesClearedCount = 0;
let targetGoldBlocksCount = 0;
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
    if (splashEl) {
        setTimeout(() => {
            splashEl.classList.add('splash-out');
            setTimeout(() => splashEl.classList.add('splash-gone'), 580);
        }, 2200); // matches splashLoad animation (0.6s delay + 1.8s duration = 2.4s)
    }

    try {
        initGame();
    } catch (err) {
        console.error('[Brickly] initGame crashed:', err);
        document.body.classList.add('menu-active');
    }
});

function updateMenuHighScore() {
    const menuHighScoreEl = document.getElementById('menu-high-score');
    if (menuHighScoreEl) {
        const classic = StorageManager.getHighScore('classic') || 0;
        const classic10 = StorageManager.getHighScore('classic_10') || 0;
        const blast = StorageManager.getHighScore('blast') || 0;
        menuHighScoreEl.innerText = Math.max(classic, classic10, blast);
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

    // 3. Load Saved Settings and High Scores
    const settings = StorageManager.getSettings();
    
    activeTheme = settings.theme || 'classic';
    activeMenuTheme = settings.menuTheme || 'royal';
    prevTheme = activeTheme;
    transitionProgress = 1.0;
    
    audio.setSfxEnabled(settings.sfx !== false);
    audio.setBgmEnabled(settings.bgm !== false);
    vibrationEnabled = settings.vibration !== false;
    highScore = StorageManager.getHighScore(activeMode);

    applyTheme(activeTheme);
    applyMenuTheme(activeMenuTheme);
    updateSoundIcons();

    // 4. Initialize layout
    window.addEventListener('resize', handleResize);
    handleResize();

    // 5. Setup Input Event Listeners (must run even if earlier steps fail)
    setupDragEvents();
    setupUIBindings();

    // 6. Write high score to header crown
    const topScoreEl = $('best-score-top-val');
    if (topScoreEl) topScoreEl.innerText = highScore;
    updateMenuHighScore();

    // 7. Start Render Animation Loop
    requestAnimationFrame(renderLoop);
}

// --- Layout Handling ---
function handleResize() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

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
            if (isDragging) return;
            const slotIndex = parseInt(slot.dataset.slot, 10);
            
            // Check if slot has active shape
            const shape = spawner.slots[slotIndex];
            if (!shape) return;

            // Unlock audio on first gesture if suspended
            audio.unlock();

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
            audio.playDragStart();
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
    if (hoverRow >= 0 && hoverCol >= 0 && draggedShape) {
        const matrix = draggedShape.matrix;
        const colorId = draggedShape.colorId;
        
        let hasClearedLines = false;
        let hasPerfectSpot = false;

        // 1. Commit placement
        board.placeShape(matrix, hoverRow, hoverCol, colorId);
        audio.playPlace();
        particles.spawnPlacementParticles(hoverRow, hoverCol, matrix, boardLayout, getActiveThemeConfig());

        // Calculate score points for placed blocks count (+1 pt per block)
        let blocksCount = 0;
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c] > 0) blocksCount++;
            }
        }
        score += blocksCount;

        // Check if placed in the target spot in the background (perfect spot)
        let targetSpotBonus = 0;
        if (draggedShape.targetSpot && hoverRow === draggedShape.targetSpot.r && hoverCol === draggedShape.targetSpot.c) {
            targetSpotBonus = 30; // Small score boost
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
            comboTimerMs = COMBO_WINDOW_MS;   // reset/extend combo window
            comboTimerActive = true;
            hasClearedLines = true;
            
            // Score Math: Cleared count * 100 * comboStreak + streak bonus
            const streakBonus = comboStreak > 1 ? (comboStreak - 1) * 200 : 0;
            const pointsGained = clearedLinesCount * 100 * comboStreak + streakBonus;
            score += pointsGained;

            // Spawn floating reward text
            const rect = gameCanvas.getBoundingClientRect();
            const textX = boardOffsetX + (hoverCol + matrix[0].length / 2) * cellSize;
            const textY = boardOffsetY + (hoverRow) * cellSize - 10;
            
            let floatMsg = `+${pointsGained}`;
            if (comboStreak > 1) {
                floatMsg += ` (Combo x${comboStreak}! +${streakBonus} Bonus)`;
            } else if (clearedLinesCount > 1) {
                floatMsg += ` (Multi x${clearedLinesCount}!)`;
            }
            particles.addFloatingText(floatMsg, textX, textY, getActiveThemeConfig().colors.textPrimary, 1.0 + (comboStreak * 0.12));

            // Trigger sparkles and explosions
            particles.spawnLineClearParticles(rows, cols, boardLayout, getActiveThemeConfig());
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
                const clearBonus = 500; // Large reward
                score += clearBonus;
                
                const centerX = boardOffsetX + (cellSize * board.cols) / 2;
                const centerY = boardOffsetY + (cellSize * board.rows) / 2;
                
                // Big "MARVELOUS!" text with theme color
                particles.addFloatingText('MARVELOUS!', centerX, centerY - 20, theme.colors.textPrimary || '#ffd32a', 1.6);
                particles.addFloatingText(`+${clearBonus} Board Clear!`, centerX, centerY + 30, '#ffd700', 1.15);
                
                // Heavy screen shake for impact
                particles.triggerShake(20, 8);
                
                // Burst particles across the entire board
                for (let r = 0; r < board.rows; r++) {
                    for (let c = 0; c < board.cols; c++) {
                        const bx = boardOffsetX + c * cellSize;
                        const by = boardOffsetY + r * cellSize;
                        particles.spawnTileClearParticles(bx, by, cellSize, theme);
                    }
                }
                
                audio.speak("Unbelievable");
                
                // Cycle theme as reward
                triggerThemeChange(true);
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
                triggerGameOver("A bomb detonated!");
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
                triggerGameOver("Out of moves!");
                cleanupDragState();
                return;
            }
        }

        // 5. Refill tray slots if all three are empty
        const refilled = spawner.refillTray(board, score, activeMode, missionLevel, activeBombs);

        // 6. High Score check (Classic & Classic 10x10 mode)
        if (activeMode === 'classic' || activeMode === 'classic_10') {
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
            triggerGameOver("No valid placement moves left!");
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
function renderLoop(now) {
    // Compute deltaTime for smooth timer updates
    const deltaMs = now - (lastFrameTime || now);
    lastFrameTime = now;

    // Tick combo countdown window
    if (comboTimerActive) {
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
        const raw = Math.min(elapsed / 1250, 1.0);          // 1250 ms total
        // smoothstep: 3t²-2t³  (ease-in-out)
        transitionProgress = raw * raw * (3 - 2 * raw);
    }

    // 1. Update particles physics
    particles.update();

    // 2. Clear canvas
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
            const cellValue = board.grid[r][c];

            if (cellValue > 0) {
                // Occupied Cell
                drawThemeBlock(ctx, cx, cy, cellSize, cellSize, cellValue, theme);

                // Draw bomb countdown indicator overlay
                if (cellValue === 14 && activeMode === 'blast') {
                    const bomb = activeBombs.find(b => b.r === r && b.c === c);
                    if (bomb) {
                        drawBombOverlay(cx, cy, cellSize, bomb.timer);
                    }
                }
            } else {
                // Empty Cell
                ctx.save();
                ctx.fillStyle = theme.colors.cellEmpty;
                ctx.strokeStyle = theme.colors.gridLines;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.roundRect(cx + 1.5, cy + 1.5, cellSize - 3, cellSize - 3, cellSize * 0.12);
                ctx.fill();
                ctx.stroke();
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

                // Bright pulsing border — theme-colored, thick, unmistakable
                ctx.globalAlpha = 0.65 + pulse * 0.35;
                ctx.strokeStyle = blockColor;
                ctx.lineWidth = 2.5;
                ctx.shadowColor = blockColor;
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.roundRect(cx + inset, cy + inset, cellSize - inset * 2, cellSize - inset * 2, rad);
                ctx.stroke();
                ctx.shadowBlur = 0;
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

            // 4-sided border — clipped to board area
            ctx.globalAlpha = 0.65 + pulse * 0.35;
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 2.5;
            ctx.shadowColor = accentColor;
            ctx.shadowBlur = 10;
            ctx.strokeRect(boardOffsetX + 1, ry + 1, totalW - 2, cellSize - 2);
            ctx.shadowBlur = 0;

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

            // 4-sided border — clipped to board area
            ctx.globalAlpha = 0.65 + pulse * 0.35;
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 2.5;
            ctx.shadowColor = accentColor;
            ctx.shadowBlur = 10;
            ctx.strokeRect(cx + 1, boardOffsetY + 1, cellSize - 2, totalH - 2);
            ctx.shadowBlur = 0;

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
    dragCtx.shadowColor = 'rgba(0, 0, 0, 0.50)';
    dragCtx.shadowBlur = 16;
    dragCtx.shadowOffsetY = 10;
    dragCtx.globalAlpha = 0.96;

    for (let r = 0; r < shapeRows; r++) {
        for (let c = 0; c < shapeCols; c++) {
            if (shapeMatrix[r][c] > 0) {
                const tx = startX + c * dragCellSize;
                const ty = startY + r * dragCellSize;
                drawThemeBlock(dragCtx, tx, ty, dragCellSize, dragCellSize, draggedShape.colorId, theme);
            }
        }
    }
    dragCtx.restore();
}

function drawTraySlot(slotIndex) {
    // If dragged slot is active, do not render inside slot tray (transferred to pointer drag)
    if (isDragging && draggedSlot === slotIndex) {
        return;
    }

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

    for (let r = 0; r < shapeRows; r++) {
        for (let c = 0; c < shapeCols; c++) {
            if (shapeMatrix[r][c] > 0) {
                const tx = sx + c * slotCellSize;
                const ty = sy + r * slotCellSize;
                drawThemeBlock(slotCtx, tx, ty, slotCellSize, slotCellSize, shape.colorId, theme);
            }
        }
    }
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

    // --- Danger ring (outer stroke) ---
    ctx.beginPath();
    ctx.arc(cx, cy, bgRadius, 0, Math.PI * 2);
    ctx.strokeStyle = isUrgent ? '#ff2222' : '#ff8800';
    ctx.lineWidth = w * 0.07;
    ctx.shadowColor  = isUrgent ? '#ff0000' : '#ff6600';
    ctx.shadowBlur   = isUrgent ? 12 : 6;
    ctx.stroke();

    // --- Countdown number ---
    const fontSize = Math.round(w * 0.42);
    ctx.shadowBlur = 0;
    ctx.font = `bold ${fontSize}px Outfit, system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Tight drop-shadow so number is legible on any theme
    ctx.shadowColor = 'rgba(0,0,0,0.95)';
    ctx.shadowBlur  = 3;
    ctx.fillText(countdown.toString(), cx, cy + fontSize * 0.04);

    ctx.restore();
}

// --- Game Logic Controllers ---
export function selectMode(modeName) {
    try {
        audio.unlock();
        const settings = StorageManager.getSettings();
        if (settings.bgm !== false) {
            audio.setBgmEnabled(true);
        }
    } catch (err) {
        console.warn('[Brickly] audio unlock failed:', err);
    }
    
    // Lower BGM volume during gameplay to make SFX more audible
    audio.setBgmVolume(0.45);
    
    activeMode = modeName;
    
    // Hide Main Menu overlay
    document.body.classList.remove('menu-active');
    const menuOverlay = $('main-menu-overlay');
    if (menuOverlay) menuOverlay.classList.add('hidden');
    
    // Ensure body theme classes sync immediately
    applyTheme(activeTheme);

    const savedState = StorageManager.getGameState();
    
    let resumeOk = false;
    if (savedState && savedState.mode === activeMode && savedState.grid) {
        try {
            // Resume game state
            score = savedState.score || 0;
            highScore = StorageManager.getHighScore(activeMode);
            comboStreak = savedState.comboStreak || 0;
            placementCount = savedState.placementCount || 0;
            
            board.reset(savedState.grid);
            spawner.slots = savedState.slots || [null, null, null];
            spawner.spawnCount = savedState.spawnCount !== undefined ? savedState.spawnCount : 2;
            
            // Mode specific restores
            if (activeMode === 'blast') {
                activeBombs = savedState.activeBombs || [];
                updateDangerBanner();
            } else if (activeMode === 'missions') {
                missionLevel = savedState.missionLevel || 1;
                movesLimit = savedState.movesLimit || 20;
                linesClearedCount = savedState.linesClearedCount || 0;
                targetGoldBlocksCount = countGoldBlocksRemaining();
            }

            updateHUD();
            updateTraySlotOpacities();
            resumeOk = true;
        } catch (err) {
            console.warn('[Brickly] corrupted save state, starting fresh:', err);
            StorageManager.clearGameState();
        }
    }
    if (!resumeOk) {
        startNewGame();
    }
    try { handleResize(); } catch (err) { console.warn('[Brickly] handleResize error:', err); }
}

function startNewGame() {
    score = 0;
    comboStreak = 0;
    comboTimerMs = 0;
    comboTimerActive = false;
    placementCount = 0;
    activeBombs = [];
    spawner.spawnCount = 0;
    const dangerBar = $('danger-bar');
    if (dangerBar) dangerBar.classList.add('hidden');
    // Force-hide the combo widget immediately — state reset above won't hide the DOM element
    // unless updateComboWidget() is explicitly called.
    updateComboWidget();

    if (activeMode === 'classic') {
        board.reset(null, 8, 8);
        spawner.slots = [null, null, null];
        spawner.refillTray(board, score, activeMode, missionLevel, activeBombs);
    } else if (activeMode === 'classic_10') {
        board.reset(null, 10, 10);
        spawner.slots = [null, null, null];
        spawner.refillTray(board, score, activeMode, missionLevel, activeBombs);
    } else if (activeMode === 'missions') {
        loadMissionLevel(missionLevel);
    } else if (activeMode === 'blast') {
        board.reset(null, 8, 8);
        spawner.slots = [null, null, null];
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
}

function saveCurrentGameState() {
    // If the gameover or success modals are displayed, do not overwrite the cleared state
    const gameoverOverlay = $('gameover-overlay');
    const successOverlay = $('success-overlay');
    if ((gameoverOverlay && !gameoverOverlay.classList.contains('hidden')) || 
        (successOverlay && !successOverlay.classList.contains('hidden'))) {
        return;
    }

    StorageManager.saveGameState({
        mode: activeMode,
        score,
        comboStreak,
        placementCount,
        grid: board.grid,
        slots: spawner.slots,
        activeBombs,
        missionLevel,
        movesLimit,
        linesClearedCount,
        spawnCount: spawner.spawnCount
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

        return goalClearedBlocks && goalScore && goalLines;
    }
    return false;
}

// --- HUD & Overlay UI Handlers ---
function updateHUD() {
    const scoreEl = $('score-val');
    const bestEl = $('best-score-val');
    const topEl = $('best-score-top-val');
    if (scoreEl) scoreEl.innerText = score;
    if (bestEl) bestEl.innerText = highScore;
    if (topEl) topEl.innerText = highScore;

    // Display appropriate level names based on the active mode
    const modeNames = {
        classic: 'Classic (8x8)',
        classic_10: 'Classic 10x10',
        missions: `Missions Lvl ${missionLevel}`,
        blast: 'Blast Mode'
    };
    const modeLabel = $('active-mode-label');
    if (modeLabel) modeLabel.innerText = modeNames[activeMode] || 'Classic Mode';

    // Toggle specific HUD panels
    const modeHud = $('mode-specific-hud');

    if (activeMode === 'classic' || activeMode === 'classic_10' || activeMode === 'blast') {
        if (modeHud) modeHud.classList.add('hidden');
    } else if (activeMode === 'missions') {
        if (modeHud) modeHud.classList.remove('hidden');
        updateHUDObjective();
    }
}

function updateHUDObjective() {
    const objectiveText = $('objective-text');
    const movesVal = $('moves-val');
    if (movesVal) movesVal.innerText = movesLimit;

    if (activeMode === 'missions') {
        const config = AdventureLevels.find(l => l.levelNumber === missionLevel) || AdventureLevels[0];
        
        if (objectiveText) {
            if (config.preFilledTarget > 0) {
                objectiveText.innerText = `Gold Blocks Remaining: ${targetGoldBlocksCount}`;
            } else if (config.linesTarget > 0) {
                objectiveText.innerText = `Lines Cleared: ${linesClearedCount}/${config.linesTarget}`;
            } else if (config.scoreTarget > 0) {
                objectiveText.innerText = `Reach: ${score}/${config.scoreTarget} pts`;
            }
        }

        // Show level progression percentage fill
        const progressContainer = $('progress-bar-container');
        const progressFill = $('progress-bar-fill');
        if (progressContainer) progressContainer.classList.remove('hidden');
        let percent = 0;
        if (config.preFilledTarget > 0) {
            percent = ((config.preFilledTarget - targetGoldBlocksCount) / config.preFilledTarget) * 100;
        } else if (config.linesTarget > 0) {
            percent = (linesClearedCount / config.linesTarget) * 100;
        } else if (config.scoreTarget > 0) {
            percent = (score / config.scoreTarget) * 100;
        }
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

function triggerGameOver(reason) {
    audio.playGameOver();
    triggerHaptic('heavy');
    StorageManager.clearGameState();

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
    audio.playLevelWin();
    triggerHaptic('double');
    StorageManager.clearGameState();

    const successOverlay = $('success-overlay');
    const successScoreEl = $('success-score-val');
    if (successScoreEl) successScoreEl.innerText = score;

    if (activeMode === 'missions') {
        const msgEl = $('success-message');
        const nextBtn = $('btn-next-level');
        if (msgEl) msgEl.innerText = `Level ${missionLevel} Completed!`;
        if (nextBtn) nextBtn.innerText = "Next Level";
        
        // Progress unlocked levels
        missionLevel = Math.min(missionLevel + 1, AdventureLevels.length);
        StorageManager.saveAdventureProgress(missionLevel);
    }

    if (successOverlay) successOverlay.classList.remove('hidden');
}

// --- Menu UI Event Bindings ---
function setupUIBindings() {
    // Play buttons in the Main Menu overlay
    const btnMissions = $('btn-play-missions');
    const btnClassic = $('btn-play-classic');
    const btnClassic10 = $('btn-play-classic-10');
    const btnBlast = $('btn-play-blast');

    if (btnMissions) btnMissions.addEventListener('click', () => selectMode('missions'));
    if (btnClassic) btnClassic.addEventListener('click', () => selectMode('classic'));
    if (btnClassic10) btnClassic10.addEventListener('click', () => selectMode('classic_10'));
    if (btnBlast) btnBlast.addEventListener('click', () => selectMode('blast'));

    // Home button in HUD
    const btnHome = $('btn-home');
    if (btnHome) {
        btnHome.addEventListener('click', () => {
            saveCurrentGameState();
            audio.setBgmVolume(0.95); // Restore BGM volume for Main Menu
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
            const overlay = $('gameover-overlay');
            if (overlay) overlay.classList.add('hidden');
            startNewGame();
        });
    }

    // Next Level / Continue button on Success Modal
    const btnNextLevel = $('btn-next-level');
    if (btnNextLevel) {
        btnNextLevel.addEventListener('click', () => {
            const overlay = $('success-overlay');
            if (overlay) overlay.classList.add('hidden');
            startNewGame();
        });
    }

    // Close button on Success Modal
    const btnSuccessClose = $('btn-success-close');
    if (btnSuccessClose) {
        btnSuccessClose.addEventListener('click', () => {
            const overlay = $('success-overlay');
            if (overlay) overlay.classList.add('hidden');
            audio.setBgmVolume(0.95); // Restore BGM volume for Main Menu
            document.body.classList.add('menu-active');
            const menuOverlay = $('main-menu-overlay');
            if (menuOverlay) menuOverlay.classList.remove('hidden');
            updateMenuHighScore();
        });
    }

    // Settings gear button — open the settings modal
    const btnMenuSettings = $('btn-menu-settings');
    if (btnMenuSettings) btnMenuSettings.addEventListener('click', () => openSettings());

    const btnGameSettings = $('btn-game-settings');
    if (btnGameSettings) btnGameSettings.addEventListener('click', () => openSettings());

    // Settings modal: close X button
    const btnSettingsClose = $('btn-settings-close');
    if (btnSettingsClose) btnSettingsClose.addEventListener('click', closeSettings);

    // Settings modal: backdrop tap to close
    const settingsOverlay = $('settings-overlay');
    if (settingsOverlay) {
        settingsOverlay.addEventListener('click', (e) => {
            if (e.target === settingsOverlay) closeSettings();
        });
    }

    // Settings modal: Sound toggle
    const toggleSound = $('toggle-sound');
    if (toggleSound) {
        toggleSound.addEventListener('click', () => {
            audio.setSfxEnabled(!audio.enabled);
            saveSettingsState();
            updateSoundIcons();
        });
    }

    // Settings modal: BGM toggle
    const toggleBgm = $('toggle-bgm');
    if (toggleBgm) {
        toggleBgm.addEventListener('click', () => {
            audio.setBgmEnabled(!audio.bgmEnabled);
            saveSettingsState();
            updateSoundIcons();
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

    // Settings modal: Home button
    const btnSettingsHome = $('btn-settings-home');
    if (btnSettingsHome) {
        btnSettingsHome.addEventListener('click', () => {
            closeSettings();
            saveCurrentGameState();
            audio.setBgmVolume(0.95); // Restore BGM volume for Main Menu
            document.body.classList.add('menu-active');
            const menuOverlay = $('main-menu-overlay');
            if (menuOverlay) menuOverlay.classList.remove('hidden');
        });
    }

    // Settings modal: Restart button
    const btnSettingsRestart = $('btn-settings-restart');
    if (btnSettingsRestart) {
        btnSettingsRestart.addEventListener('click', () => {
            closeSettings();
            startNewGame();
        });
    }

    // Settings modal: Change Skin / cycle theme
    const btnSettingsTheme = $('btn-settings-theme');
    if (btnSettingsTheme) {
        btnSettingsTheme.addEventListener('click', () => {
            triggerThemeChange(false);
            const label = $('game-theme-label');
            if (label) label.innerText = 'Skin: ' + activeTheme.charAt(0).toUpperCase() + activeTheme.slice(1);
        });
    }

    // Settings modal: Menu Background change
    const btnSettingsMenuTheme = $('btn-settings-menu-theme');
    if (btnSettingsMenuTheme) {
        btnSettingsMenuTheme.addEventListener('click', () => {
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

// --- Settings Modal Open/Close ---
function openSettings() {
    updateSoundIcons();
    
    const isMenu = document.body.classList.contains('menu-active');
    
    const btnHome = $('btn-settings-home');
    const btnRestart = $('btn-settings-restart');
    const btnTheme = $('btn-settings-theme');
    const btnMenuBg = $('btn-settings-menu-theme');
    
    if (isMenu) {
        if (btnHome) btnHome.style.display = 'none';
        if (btnRestart) btnRestart.style.display = 'none';
        if (btnTheme) btnTheme.style.display = 'none';
        if (btnMenuBg) {
            btnMenuBg.style.display = 'flex';
            const label = $('menu-theme-label');
            if (label) label.innerText = 'Theme: ' + activeMenuTheme.charAt(0).toUpperCase() + activeMenuTheme.slice(1);
        }
    } else {
        if (btnHome) btnHome.style.display = 'flex';
        if (btnRestart) btnRestart.style.display = 'flex';
        if (btnTheme) {
            btnTheme.style.display = 'flex';
            const label = $('game-theme-label');
            if (label) label.innerText = 'Skin: ' + activeTheme.charAt(0).toUpperCase() + activeTheme.slice(1);
        }
        if (btnMenuBg) btnMenuBg.style.display = 'none';
    }

    const overlay = $('settings-overlay');
    if (overlay) overlay.classList.remove('hidden');
}

function closeSettings() {
    const overlay = $('settings-overlay');
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
    const themeKeys = ['indigo', 'classic', 'neon', 'wood', 'gems', 'pastel', 'blush', 'snow', 'ocean', 'aurora', 'watermelon', 'cheese', 'crochet', 'tropical', 'marble', 'lava', 'sakura', 'candy'];
    let nextIndex = (themeKeys.indexOf(activeTheme) + 1) % themeKeys.length;
    const nextTheme = themeKeys[nextIndex];
    
    triggerHaptic('heavy');
    
    const overlay = $('theme-shift-overlay');
    if (isGameplay && overlay) {
        overlay.classList.add('active');
        
        const praises = ["Excellent", "Good", "Wonderful", "Amazing", "Fantastic", "Marvelous", "Perfect"];
        const praise = praises[Math.floor(Math.random() * praises.length)];
        
        const textEl = overlay.querySelector('.theme-shift-text');
        if (textEl) textEl.innerText = praise.toUpperCase();
        
        if (audio && typeof audio.speak === 'function') {
            audio.speak(praise);
        }
        
        // Change the theme in the background after 400ms (when overlay is fully blurred and visible)
        setTimeout(() => {
            prevTheme = activeTheme;
            activeTheme = nextTheme;
            transitionProgress = 0.0;
            transitionStartTime = performance.now();
            applyTheme(activeTheme);
            saveSettingsState();
            
            // Fade out the splash after another 700ms (total 1.1s display time)
            setTimeout(() => {
                overlay.classList.remove('active');
            }, 700);
        }, 400);
    } else {
        prevTheme = activeTheme;
        activeTheme = nextTheme;
        transitionProgress = 0.0;
        transitionStartTime = performance.now();
        applyTheme(activeTheme);
        saveSettingsState();
    }
}

function applyTheme(themeId) {
    const menuActive = document.body.classList.contains('menu-active');
    document.body.className = ''; // Reset theme classes
    if (menuActive) document.body.classList.add('menu-active');
    document.body.classList.add(`theme-${themeId}`);
}

function applyMenuTheme(themeId) {
    const overlay = $('main-menu-overlay');
    if (!overlay) return;
    MENU_THEMES.forEach(t => overlay.classList.remove(`menu-theme-${t}`));
    overlay.classList.add(`menu-theme-${themeId}`);
}

async function triggerHaptic(type = 'light') {
    if (!vibrationEnabled) return;

    // 1. Try native Capacitor Haptics first (works on physical devices)
    try {
        if (window.Capacitor && window.Capacitor.registerPlugin) {
            // Capacitor 3+ requires registering the plugin proxy directly
            const Haptics = window.Capacitor.registerPlugin('Haptics');
            if (type === 'light') {
                await Haptics.impact({ style: 'LIGHT' });
            } else if (type === 'medium') {
                await Haptics.impact({ style: 'MEDIUM' });
            } else if (type === 'heavy') {
                await Haptics.impact({ style: 'HEAVY' });
            } else if (type === 'double') {
                await Haptics.impact({ style: 'MEDIUM' });
                setTimeout(async () => { await Haptics.impact({ style: 'MEDIUM' }); }, 150);
            }
            return; // Exit if native haptics succeeded
        }
    } catch (e) {
        console.warn("Capacitor Haptics error:", e);
    }

    // 2. Fallback to standard web vibration API
    if (!('vibrate' in navigator)) return;
    try {
        if (type === 'light') {
            navigator.vibrate(10);
        } else if (type === 'medium') {
            navigator.vibrate(22);
        } else if (type === 'heavy') {
            navigator.vibrate(50);
        } else if (type === 'double') {
            navigator.vibrate([20, 30, 20]);
        }
    } catch (e) {
        console.warn("Haptic feedback vibration error:", e);
    }
}

function updateSoundIcons() {
    const soundIcon = $('settings-sound-icon');
    if (soundIcon) soundIcon.classList.toggle('off', !audio.enabled);

    const bgmIcon = $('toggle-bgm')?.querySelector('.settings-toggle-icon');
    if (bgmIcon) bgmIcon.classList.toggle('off', !audio.bgmEnabled);

    const vibrationIcon = $('toggle-vibration')?.querySelector('.settings-toggle-icon');
    if (vibrationIcon) vibrationIcon.classList.toggle('off', !vibrationEnabled);
}

function saveSettingsState() {
    StorageManager.saveSettings({
        theme: activeTheme,
        menuTheme: activeMenuTheme,
        sfx: audio.enabled,
        bgm: audio.bgmEnabled,
        vibration: vibrationEnabled
    });
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
    const targetTheme = THEMES[activeTheme];
    if (transitionProgress >= 1.0) {
        return targetTheme;
    }
    const fromTheme = THEMES[prevTheme] || targetTheme;
    const t = transitionProgress;
    const colors = {};
    for (const key in targetTheme.colors) {
        colors[key] = lerpColor(fromTheme.colors[key], targetTheme.colors[key], t);
    }
    return {
        id: targetTheme.id,
        name: targetTheme.name,
        colors: colors,
        blockStyle: t < 0.5 ? fromTheme.blockStyle : targetTheme.blockStyle,
        particleStyle: t < 0.5 ? fromTheme.particleStyle : targetTheme.particleStyle
    };
}
