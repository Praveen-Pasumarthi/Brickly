/**
 * Brickly - Game Modes Controller
 * Contains Mission Level definitions and Blast Mode bomb state managers.
 */

// Cell IDs mapping:
// 0: Empty
// 1-12: Normal colored blocks (themes map these to Neon/Pastel/Wood/Gems)
// 13: Target/Pre-filled Block (Missions clear objective)
// 14: Bomb Block (Blast Mode, countdown timer triggers game over)

export const AdventureLevels = [
    {
        levelNumber: 1,
        name: "First Steps",
        description: "Clear 5 lines within 25 moves.",
        movesLimit: 25,
        scoreTarget: 0,
        linesTarget: 5,
        preFilledTarget: 0,
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ]
    },
    {
        levelNumber: 2,
        name: "Gold Rush",
        description: "Clear all 4 gold blocks in 22 moves.",
        movesLimit: 22,
        scoreTarget: 0,
        linesTarget: 0,
        preFilledTarget: 4,
        grid: [
            [13, 0, 0, 0, 0, 0, 0, 13],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [13, 0, 0, 0, 0, 0, 0, 13]
        ]
    },
    {
        levelNumber: 3,
        name: "Combo Training",
        description: "Score 400 points in 24 moves.",
        movesLimit: 24,
        scoreTarget: 400,
        linesTarget: 0,
        preFilledTarget: 0,
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 13, 0, 0, 13, 0, 0],
            [0, 0, 0, 13, 13, 0, 0, 0],
            [0, 0, 0, 13, 13, 0, 0, 0],
            [0, 0, 13, 0, 0, 13, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ]
    },
    {
        levelNumber: 4,
        name: "Corner Pocket",
        description: "Clear all 8 gold blocks in 28 moves.",
        movesLimit: 28,
        scoreTarget: 0,
        linesTarget: 0,
        preFilledTarget: 8,
        grid: [
            [13, 13, 0, 0, 0, 0, 13, 13],
            [13, 0, 0, 0, 0, 0, 0, 13],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [13, 0, 0, 0, 0, 0, 0, 13],
            [13, 13, 0, 0, 0, 0, 13, 13]
        ]
    },
    {
        levelNumber: 5,
        name: "Gridlock Line",
        description: "Clear 8 lines in 32 moves.",
        movesLimit: 32,
        scoreTarget: 0,
        linesTarget: 8,
        preFilledTarget: 0,
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 13, 0, 0, 0, 0, 13, 0],
            [0, 0, 13, 0, 0, 13, 0, 0],
            [0, 0, 0, 13, 13, 0, 0, 0],
            [0, 0, 0, 13, 13, 0, 0, 0],
            [0, 0, 13, 0, 0, 13, 0, 0],
            [0, 13, 0, 0, 0, 0, 13, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ]
    },
    {
        levelNumber: 6,
        name: "Crossroads",
        description: "Clear 12 gold blocks in 30 moves.",
        movesLimit: 30,
        scoreTarget: 0,
        linesTarget: 0,
        preFilledTarget: 12,
        grid: [
            [0, 0, 0, 13, 13, 0, 0, 0],
            [0, 0, 0, 13, 13, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [13, 13, 0, 0, 0, 0, 13, 13],
            [13, 13, 0, 0, 0, 0, 13, 13],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 13, 13, 0, 0, 0],
            [0, 0, 0, 13, 13, 0, 0, 0]
        ]
    },
    {
        levelNumber: 7,
        name: "Score Attack",
        description: "Score 1000 points in 34 moves.",
        movesLimit: 34,
        scoreTarget: 1000,
        linesTarget: 0,
        preFilledTarget: 0,
        grid: [
            [13, 0, 0, 0, 0, 0, 0, 13],
            [0, 13, 0, 0, 0, 0, 13, 0],
            [0, 0, 13, 0, 0, 13, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 13, 0, 0, 13, 0, 0],
            [0, 13, 0, 0, 0, 0, 13, 0],
            [13, 0, 0, 0, 0, 0, 0, 13]
        ]
    },
    {
        levelNumber: 8,
        name: "Heavy Columns",
        description: "Clear all 12 gold blocks in 32 moves.",
        movesLimit: 32,
        scoreTarget: 0,
        linesTarget: 0,
        preFilledTarget: 12,
        grid: [
            [13, 0, 0, 0, 0, 0, 0, 13],
            [13, 0, 0, 0, 0, 0, 0, 13],
            [13, 0, 0, 0, 0, 0, 0, 13],
            [13, 0, 0, 0, 0, 0, 0, 13],
            [13, 0, 0, 0, 0, 0, 0, 13],
            [13, 0, 0, 0, 0, 0, 0, 13],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ]
    },
    {
        levelNumber: 9,
        name: "The Fort",
        description: "Clear 16 gold blocks in 36 moves.",
        movesLimit: 36,
        scoreTarget: 0,
        linesTarget: 0,
        preFilledTarget: 16,
        grid: [
            [13, 13, 13, 13, 13, 13, 13, 13],
            [13, 0, 0, 0, 0, 0, 0, 13],
            [13, 0, 0, 0, 0, 0, 0, 13],
            [13, 0, 0, 0, 0, 0, 0, 13],
            [13, 0, 0, 0, 0, 0, 0, 13],
            [13, 0, 0, 0, 0, 0, 0, 13],
            [13, 0, 0, 0, 0, 0, 0, 13],
            [13, 13, 13, 13, 13, 13, 13, 13]
        ]
    },
    {
        levelNumber: 10,
        name: "Obsidian Core",
        description: "Score 1500 points and clear 12 gold blocks in 40 moves.",
        movesLimit: 40,
        scoreTarget: 1500,
        linesTarget: 0,
        preFilledTarget: 12,
        grid: [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 13, 13, 0, 0, 13, 13, 0],
            [0, 13, 13, 0, 0, 13, 13, 0],
            [0, 0, 0, 13, 13, 0, 0, 0],
            [0, 0, 0, 13, 13, 0, 0, 0],
            [0, 13, 13, 0, 0, 13, 13, 0],
            [0, 13, 13, 0, 0, 13, 13, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ]
    }
];

export class ModeManager {
    /**
     * Spawns a new bomb block at a random empty grid cell in Blast mode.
     * @param {Board} board - Board instance.
     * @param {Array<Object>} activeBombsList - Reference to the active bombs list.
     * @param {number} countdown - Spawn timer (default 9 moves).
     * @returns {boolean} True if a bomb was successfully spawned, false if grid is full.
     */
    static spawnBomb(board, activeBombsList, countdown = 9) {
        // Collect all empty cells
        const emptyCells = [];
        for (let r = 0; r < board.rows; r++) {
            for (let c = 0; c < board.cols; c++) {
                if (board.grid[r][c] === 0) {
                    emptyCells.push({ r, c });
                }
            }
        }

        if (emptyCells.length === 0) {
            return false;
        }

        // Select a random empty coordinate
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const { r, c } = emptyCells[randomIndex];

        // Mark cell as occupied by Bomb (Value 14)
        board.grid[r][c] = 14;

        // Add to active lists tracking timer
        activeBombsList.push({ r, c, timer: countdown });
        return true;
    }

    /**
     * Ticks down all active bomb counters. Triggers Game Over if any timer reaches 0.
     * @param {Array<Object>} activeBombsList - Current bombs tracking array.
     * @returns {boolean} True if a bomb exploded (timer hit 0), forcing game over.
     */
    static tickBombs(activeBombsList) {
        let exploded = false;
        for (let i = activeBombsList.length - 1; i >= 0; i--) {
            const bomb = activeBombsList[i];
            bomb.timer -= 1;
            if (bomb.timer <= 0) {
                exploded = true;
            }
        }
        return exploded;
    }

    /**
     * Updates and cleanses bomb elements if their columns or rows are cleared.
     * @param {Board} board - Board instance.
     * @param {Array<number>} clearedRows - Cleared row indices.
     * @param {Array<number>} clearedCols - Cleared column indices.
     * @param {Array<Object>} activeBombsList - Current tracking list.
     */
    static cleanseBombs(board, clearedRows, clearedCols, activeBombsList) {
        for (let i = activeBombsList.length - 1; i >= 0; i--) {
            const bomb = activeBombsList[i];
            
            // Check if the bomb cell was cleared by checking if its row/col index was in the cleared list,
            // OR if the board cell itself was set to 0.
            const rowCleared = clearedRows.includes(bomb.r);
            const colCleared = clearedCols.includes(bomb.c);
            
            if (rowCleared || colCleared || board.grid[bomb.r][bomb.c] === 0) {
                // Remove bomb from tracker list
                activeBombsList.splice(i, 1);
            }
        }
    }
}
