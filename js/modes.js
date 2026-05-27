/**
 * Gridly - Game Modes Controller
 * Contains Campaign Level definitions, seeded Daily Challenges generator,
 * and Blast Mode bomb state managers.
 */

// Cell IDs mapping:
// 0: Empty
// 1-12: Normal colored blocks (themes map these to Neon/Pastel/Wood/Gems)
// 13: Target/Pre-filled Block (Adventure & Daily Challenge clear objective)
// 14: Bomb Block (Blast Mode, countdown timer triggers game over)

export const AdventureLevels = [
    {
        levelNumber: 1,
        name: "First Steps",
        description: "Clear 5 lines within 20 moves.",
        movesLimit: 20,
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
        description: "Clear all 4 gold blocks in 15 moves.",
        movesLimit: 15,
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
        description: "Score 400 points in 18 moves.",
        movesLimit: 18,
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
        description: "Clear all 8 gold blocks in 20 moves.",
        movesLimit: 20,
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
        description: "Clear 8 lines in 25 moves.",
        movesLimit: 25,
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
        description: "Clear 12 gold blocks in 22 moves.",
        movesLimit: 22,
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
        description: "Score 1000 points in 25 moves.",
        movesLimit: 25,
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
        description: "Clear all 12 gold blocks in 24 moves.",
        movesLimit: 24,
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
        description: "Clear 16 gold blocks in 28 moves.",
        movesLimit: 28,
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
        description: "Score 1500 points and clear 12 gold blocks in 30 moves.",
        movesLimit: 30,
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
     * Converts a calendar date string into an integer seed value.
     * @param {string} dateStr - Format 'YYYY-MM-DD'
     * @returns {number}
     */
    static getDailySeed(dateStr) {
        const parts = dateStr.split('-');
        return parseInt(parts[0] + parts[1] + parts[2], 10);
    }

    /**
     * Generates a deterministic, platform-wide level configuration based on calendar date.
     * @param {string} dateStr - 'YYYY-MM-DD'
     * @returns {Object} Deterministic challenge config.
     */
    static generateDailyChallenge(dateStr) {
        const seed = this.getDailySeed(dateStr);

        // Simple mulberry32-style seeded PRNG
        const seededRNG = (s) => {
            return function() {
                let t = s += 0x6D2B79F5;
                t = Math.imul(t ^ (t >>> 15), t | 1);
                t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
                return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
            };
        };

        const rand = seededRNG(seed);

        // Randomize goal type:
        // 1 = Clear pre-filled blocks (Gold Blocks)
        // 2 = Clear specific number of lines
        // 3 = Score milestone
        const goalType = Math.floor(rand() * 3) + 1;
        const movesLimit = 15 + Math.floor(rand() * 16); // 15 to 30 moves limit

        let scoreTarget = 0;
        let linesTarget = 0;
        let preFilledTarget = 0;
        const grid = Array.from({ length: 8 }, () => Array(8).fill(0));

        if (goalType === 1) {
            // Objective: Clear gold blocks
            const targetCount = 6 + Math.floor(rand() * 8); // 6 to 13 targets
            preFilledTarget = targetCount;

            let placed = 0;
            while (placed < targetCount) {
                const r = Math.floor(rand() * 8);
                const c = Math.floor(rand() * 8);
                if (grid[r][c] === 0) {
                    grid[r][c] = 13;
                    placed++;
                }
            }
        } else if (goalType === 2) {
            // Objective: Clear lines
            linesTarget = 6 + Math.floor(rand() * 8); // 6 to 13 lines

            // Spawn a few decorative pre-filled targets to create interesting puzzle obstacles
            const obstacleCount = 4 + Math.floor(rand() * 4);
            let placed = 0;
            while (placed < obstacleCount) {
                const r = Math.floor(rand() * 8);
                const c = Math.floor(rand() * 8);
                if (grid[r][c] === 0) {
                    grid[r][c] = 13;
                    placed++;
                }
            }
        } else {
            // Objective: Score target
            scoreTarget = 600 + Math.floor(rand() * 10) * 100; // 600 to 1500 points

            const obstacleCount = 5 + Math.floor(rand() * 5);
            let placed = 0;
            while (placed < obstacleCount) {
                const r = Math.floor(rand() * 8);
                const c = Math.floor(rand() * 8);
                if (grid[r][c] === 0) {
                    grid[r][c] = 13;
                    placed++;
                }
            }
        }

        return {
            date: dateStr,
            name: `Challenge ${dateStr}`,
            description: goalType === 1
                ? `Clear all ${preFilledTarget} gold blocks in ${movesLimit} moves!`
                : goalType === 2
                ? `Clear ${linesTarget} lines in ${movesLimit} moves!`
                : `Score ${scoreTarget} points in ${movesLimit} moves!`,
            movesLimit,
            scoreTarget,
            linesTarget,
            preFilledTarget,
            grid
        };
    }

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
