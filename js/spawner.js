/**
 * Brickly - Spawn & Tray Engine
 * Stores the core shape database including all rotations, handles weighted spawning by score difficulty,
 * maintains the three tray slots, and performs game-over evaluations.
 */

export const SHAPES = {
    // --- 1-cell shape ---
    SINGLE: {
        matrix: [[1]],
        colorId: 1,
        name: 'single'
    },

    // --- 2-cell shapes ---
    H_LINE_2: {
        matrix: [[1, 1]],
        colorId: 2,
        name: 'h_line_2'
    },
    V_LINE_2: {
        matrix: [[1], [1]],
        colorId: 2,
        name: 'v_line_2'
    },
    DIAG_2: {
        matrix: [
            [0, 1],
            [1, 0]
        ],
        colorId: 2,
        name: 'diag_2'
    },
    DIAG_2_R1: {
        matrix: [
            [1, 0],
            [0, 1]
        ],
        colorId: 2,
        name: 'diag_2_r1'
    },

    // --- 3-cell shapes ---
    H_LINE_3: {
        matrix: [[1, 1, 1]],
        colorId: 3,
        name: 'h_line_3'
    },
    V_LINE_3: {
        matrix: [[1], [1], [1]],
        colorId: 3,
        name: 'v_line_3'
    },
    // 3-block Corner (L-3) rotations
    V_L_3: {
        matrix: [
            [1, 0],
            [1, 1]
        ],
        colorId: 3,
        name: 'v_l_3'
    },
    V_L_3_R1: {
        matrix: [
            [1, 1],
            [1, 0]
        ],
        colorId: 3,
        name: 'v_l_3_r1'
    },
    V_L_3_R2: {
        matrix: [
            [1, 1],
            [0, 1]
        ],
        colorId: 3,
        name: 'v_l_3_r2'
    },
    V_L_3_R3: {
        matrix: [
            [0, 1],
            [1, 1]
        ],
        colorId: 3,
        name: 'v_l_3_r3'
    },
    DIAG_3: {
        matrix: [
            [0, 0, 1],
            [0, 1, 0],
            [1, 0, 0]
        ],
        colorId: 3,
        name: 'diag_3'
    },
    DIAG_3_R1: {
        matrix: [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ],
        colorId: 3,
        name: 'diag_3_r1'
    },

    // --- 4-cell shapes ---
    H_LINE_4: {
        matrix: [[1, 1, 1, 1]],
        colorId: 4,
        name: 'h_line_4'
    },
    V_LINE_4: {
        matrix: [[1], [1], [1], [1]],
        colorId: 4,
        name: 'v_line_4'
    },
    SQUARE_2: {
        matrix: [
            [1, 1],
            [1, 1]
        ],
        colorId: 5,
        name: 'square_2'
    },

    // T-4 Rotations
    T_4: {
        matrix: [
            [1, 1, 1],
            [0, 1, 0]
        ],
        colorId: 7,
        name: 't_4'
    },
    T_4_R1: {
        matrix: [
            [0, 1],
            [1, 1],
            [0, 1]
        ],
        colorId: 7,
        name: 't_4_r1'
    },
    T_4_R2: {
        matrix: [
            [0, 1, 0],
            [1, 1, 1]
        ],
        colorId: 7,
        name: 't_4_r2'
    },
    T_4_R3: {
        matrix: [
            [1, 0],
            [1, 1],
            [1, 0]
        ],
        colorId: 7,
        name: 't_4_r3'
    },
    // Z-4 steps
    Z_4: {
        matrix: [
            [1, 1, 0],
            [0, 1, 1]
        ],
        colorId: 8,
        name: 'z_4'
    },
    Z_4_R1: {
        matrix: [
            [0, 1],
            [1, 1],
            [1, 0]
        ],
        colorId: 8,
        name: 'z_4_r1'
    },
    S_4: {
        matrix: [
            [0, 1, 1],
            [1, 1, 0]
        ],
        colorId: 8,
        name: 's_4'
    },
    S_4_R1: {
        matrix: [
            [1, 0],
            [1, 1],
            [0, 1]
        ],
        colorId: 8,
        name: 's_4_r1'
    },

    // --- 5-cell shapes (Large advanced shapes) ---
    H_LINE_5: {
        matrix: [[1, 1, 1, 1, 1]],
        colorId: 10,
        name: 'h_line_5'
    },
    V_LINE_5: {
        matrix: [[1], [1], [1], [1], [1]],
        colorId: 10,
        name: 'v_line_5'
    },
    // 3x3 Large Corners (5 blocks)
    CORNER_3: {
        matrix: [
            [1, 1, 1],
            [1, 0, 0],
            [1, 0, 0]
        ],
        colorId: 9,
        name: 'corner_3'
    },
    CORNER_3_R1: {
        matrix: [
            [1, 1, 1],
            [0, 0, 1],
            [0, 0, 1]
        ],
        colorId: 9,
        name: 'corner_3_r1'
    },
    CORNER_3_R2: {
        matrix: [
            [0, 0, 1],
            [0, 0, 1],
            [1, 1, 1]
        ],
        colorId: 9,
        name: 'corner_3_r2'
    },
    CORNER_3_R3: {
        matrix: [
            [1, 0, 0],
            [1, 0, 0],
            [1, 1, 1]
        ],
        colorId: 9,
        name: 'corner_3_r3'
    },
    // Big T (5 blocks)
    BIG_T: {
        matrix: [
            [1, 1, 1],
            [0, 1, 0],
            [0, 1, 0]
        ],
        colorId: 11,
        name: 'big_t'
    },
    BIG_T_R1: {
        matrix: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 1]
        ],
        colorId: 11,
        name: 'big_t_r1'
    },
    BIG_T_R2: {
        matrix: [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 1]
        ],
        colorId: 11,
        name: 'big_t_r2'
    },
    BIG_T_R3: {
        matrix: [
            [1, 0, 0],
            [1, 1, 1],
            [1, 0, 0]
        ],
        colorId: 11,
        name: 'big_t_r3'
    },
    // Big L (5 blocks)
    BIG_L: {
        matrix: [
            [1, 1, 1],
            [0, 0, 1],
            [0, 0, 1]
        ],
        colorId: 11,
        name: 'big_l'
    },
    BIG_L_R1: {
        matrix: [
            [0, 0, 1],
            [0, 0, 1],
            [1, 1, 1]
        ],
        colorId: 11,
        name: 'big_l_r1'
    },
    BIG_L_R2: {
        matrix: [
            [1, 0, 0],
            [1, 0, 0],
            [1, 1, 1]
        ],
        colorId: 11,
        name: 'big_l_r2'
    },
    BIG_L_R3: {
        matrix: [
            [1, 1, 1],
            [1, 0, 0],
            [1, 0, 0]
        ],
        colorId: 11,
        name: 'big_l_r3'
    },



    // --- 9-cell shape (Giant 3x3 Square) ---
    SQUARE_3: {
        matrix: [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1]
        ],
        colorId: 12,
        name: 'square_3'
    },
    // --- 7-cell giant L shapes (10x10 mode only) ---
    L_7: {
        matrix: [
            [1, 0, 0, 0],
            [1, 0, 0, 0],
            [1, 0, 0, 0],
            [1, 1, 1, 1]
        ],
        colorId: 12,
        name: 'l_7'
    },
    L_7_R1: {
        matrix: [
            [1, 1, 1, 1],
            [1, 0, 0, 0],
            [1, 0, 0, 0],
            [1, 0, 0, 0]
        ],
        colorId: 12,
        name: 'l_7_r1'
    },
    L_7_R2: {
        matrix: [
            [1, 1, 1, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1]
        ],
        colorId: 12,
        name: 'l_7_r2'
    },
    L_7_R3: {
        matrix: [
            [0, 0, 0, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1],
            [1, 1, 1, 1]
        ],
        colorId: 12,
        name: 'l_7_r3'
    },
    RECT_3X2: {
        matrix: [
            [1, 1],
            [1, 1],
            [1, 1]
        ],
        colorId: 3,
        name: 'rect_3x2'
    },
    RECT_2X3: {
        matrix: [
            [1, 1, 1],
            [1, 1, 1]
        ],
        colorId: 7,
        name: 'rect_2x3'
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Progressive Starter Pools — used only for the very first spawns of each game.
// These ensure new players get small, manageable shapes so the game hooks them
// before ramping up. Spawn 0 → tiny, Spawn 1 → small, Spawn 2 → medium.
// ─────────────────────────────────────────────────────────────────────────────

const STARTER_POOL_0 = [
    // Tray 0: Only 1–2 cell shapes — zero stress, player can place anything
    { key: 'SINGLE',    weight: 10 },
    { key: 'H_LINE_2',  weight: 14 },
    { key: 'V_LINE_2',  weight: 14 },
    { key: 'DIAG_2',    weight: 8  },
    { key: 'DIAG_2_R1', weight: 8  },
];

const STARTER_POOL_1 = [
    // Tray 1: 2–3 cell shapes — still very manageable, 2nd-spawn line-clear guarantee applies
    { key: 'H_LINE_2',  weight: 8  },
    { key: 'V_LINE_2',  weight: 8  },
    { key: 'H_LINE_3',  weight: 14 },
    { key: 'V_LINE_3',  weight: 14 },
    { key: 'V_L_3',     weight: 7  },
    { key: 'V_L_3_R1',  weight: 7  },
    { key: 'V_L_3_R2',  weight: 7  },
    { key: 'V_L_3_R3',  weight: 7  },
    { key: 'SQUARE_2',  weight: 8  },
];

const STARTER_POOL_2 = [
    // Tray 2: 3–4 cell shapes — player now has confidence, gentle ramp begins
    { key: 'H_LINE_3',  weight: 8  },
    { key: 'V_LINE_3',  weight: 8  },
    { key: 'H_LINE_4',  weight: 12 },
    { key: 'V_LINE_4',  weight: 12 },
    { key: 'SQUARE_2',  weight: 8  },
    { key: 'V_L_3',     weight: 5  },
    { key: 'V_L_3_R1',  weight: 5  },
    { key: 'V_L_3_R2',  weight: 5  },
    { key: 'V_L_3_R3',  weight: 5  },
    { key: 'T_4',       weight: 6  },
    { key: 'T_4_R1',    weight: 6  },
    { key: 'T_4_R2',    weight: 6  },
    { key: 'T_4_R3',    weight: 6  },
    { key: 'Z_4',       weight: 5  },
    { key: 'S_4',       weight: 5  },
];

// Spawn weights for different score intervals (difficulty scaling)
// Balanced so L-shapes don't dominate — squares, rectangles, and corners get fair weight.
// Thresholds calibrated for the new scoring system (+5/block, 100-500/line, 1000 board clear)
export const SHAPE_TIERS = [
    {
        maxScore: 2000,
        pool: [
            { key: 'SINGLE', weight: 14 },
            { key: 'H_LINE_2', weight: 14 },
            { key: 'V_LINE_2', weight: 14 },
            { key: 'DIAG_2', weight: 8 },
            { key: 'DIAG_2_R1', weight: 8 },
            { key: 'H_LINE_3', weight: 12 },
            { key: 'V_LINE_3', weight: 12 },
            { key: 'V_L_3', weight: 5 },
            { key: 'V_L_3_R1', weight: 5 },
            { key: 'V_L_3_R2', weight: 5 },
            { key: 'V_L_3_R3', weight: 5 },
            { key: 'DIAG_3', weight: 6 },
            { key: 'DIAG_3_R1', weight: 6 },
            { key: 'SQUARE_2', weight: 12 },

            // 4-block lines & shapes
            { key: 'H_LINE_4', weight: 12 },
            { key: 'V_LINE_4', weight: 12 },
            { key: 'T_4', weight: 4 },
            { key: 'T_4_R1', weight: 4 },
            { key: 'T_4_R2', weight: 4 },
            { key: 'T_4_R3', weight: 4 },
            { key: 'Z_4', weight: 3 },
            { key: 'Z_4_R1', weight: 3 },
            { key: 'S_4', weight: 3 },
            { key: 'S_4_R1', weight: 3 },

            // 5-block lines, large corners, 3x3 square, rectangles — rare at this tier
            { key: 'H_LINE_5', weight: 5 },
            { key: 'V_LINE_5', weight: 5 },
            { key: 'CORNER_3', weight: 2 },
            { key: 'CORNER_3_R1', weight: 2 },
            { key: 'CORNER_3_R2', weight: 2 },
            { key: 'CORNER_3_R3', weight: 2 },
            { key: 'BIG_T', weight: 1 },
            { key: 'BIG_T_R1', weight: 1 },
            { key: 'BIG_T_R2', weight: 1 },
            { key: 'BIG_T_R3', weight: 1 },
            { key: 'BIG_L', weight: 1 },
            { key: 'BIG_L_R1', weight: 1 },
            { key: 'BIG_L_R2', weight: 1 },
            { key: 'BIG_L_R3', weight: 1 },
            { key: 'SQUARE_3', weight: 3 },
            { key: 'RECT_3X2', weight: 4 },
            { key: 'RECT_2X3', weight: 4 },

            // 7-block giant L shapes (10x10 mode only)
            { key: 'L_7', weight: 1 },
            { key: 'L_7_R1', weight: 1 },
            { key: 'L_7_R2', weight: 1 },
            { key: 'L_7_R3', weight: 1 }
        ]
    },
    {
        maxScore: 6000,
        pool: [
            { key: 'SINGLE', weight: 7 },
            { key: 'H_LINE_2', weight: 8 },
            { key: 'V_LINE_2', weight: 8 },
            { key: 'DIAG_2', weight: 6 },
            { key: 'DIAG_2_R1', weight: 6 },
            { key: 'H_LINE_3', weight: 8 },
            { key: 'V_LINE_3', weight: 8 },
            { key: 'V_L_3', weight: 3.5 },
            { key: 'V_L_3_R1', weight: 3.5 },
            { key: 'V_L_3_R2', weight: 3.5 },
            { key: 'V_L_3_R3', weight: 3.5 },
            { key: 'DIAG_3', weight: 5 },
            { key: 'DIAG_3_R1', weight: 5 },
            { key: 'H_LINE_4', weight: 11 },
            { key: 'V_LINE_4', weight: 11 },
            { key: 'SQUARE_2', weight: 8 },
            { key: 'T_4', weight: 5 },
            { key: 'T_4_R1', weight: 5 },
            { key: 'T_4_R2', weight: 5 },
            { key: 'T_4_R3', weight: 5 },
            { key: 'Z_4', weight: 5 },
            { key: 'Z_4_R1', weight: 5 },
            { key: 'S_4', weight: 5 },
            { key: 'S_4_R1', weight: 5 },

            // Large shapes — boosted variety
            { key: 'H_LINE_5', weight: 8 },
            { key: 'V_LINE_5', weight: 8 },
            { key: 'CORNER_3', weight: 6 },
            { key: 'CORNER_3_R1', weight: 6 },
            { key: 'CORNER_3_R2', weight: 6 },
            { key: 'CORNER_3_R3', weight: 6 },
            { key: 'BIG_T', weight: 4 },
            { key: 'BIG_T_R1', weight: 4 },
            { key: 'BIG_T_R2', weight: 4 },
            { key: 'BIG_T_R3', weight: 4 },
            { key: 'BIG_L', weight: 2.5 },
            { key: 'BIG_L_R1', weight: 2.5 },
            { key: 'BIG_L_R2', weight: 2.5 },
            { key: 'BIG_L_R3', weight: 2.5 },
            { key: 'SQUARE_3', weight: 12 },
            { key: 'RECT_3X2', weight: 8 },
            { key: 'RECT_2X3', weight: 8 },

            // 7-block giant L shapes (10x10 mode only)
            { key: 'L_7', weight: 4 },
            { key: 'L_7_R1', weight: 4 },
            { key: 'L_7_R2', weight: 4 },
            { key: 'L_7_R3', weight: 4 }
        ]
    },
    {
        maxScore: 15000,
        pool: [
            { key: 'SINGLE', weight: 4 },
            { key: 'H_LINE_2', weight: 6 },
            { key: 'V_LINE_2', weight: 6 },
            { key: 'DIAG_2', weight: 5 },
            { key: 'DIAG_2_R1', weight: 5 },
            { key: 'H_LINE_3', weight: 6 },
            { key: 'V_LINE_3', weight: 6 },
            { key: 'DIAG_3', weight: 4 },
            { key: 'DIAG_3_R1', weight: 4 },
            { key: 'H_LINE_4', weight: 10 },
            { key: 'V_LINE_4', weight: 10 },
            { key: 'SQUARE_2', weight: 7 },
            { key: 'T_4', weight: 5 },
            { key: 'T_4_R1', weight: 5 },
            { key: 'T_4_R2', weight: 5 },
            { key: 'T_4_R3', weight: 5 },
            { key: 'Z_4', weight: 5 },
            { key: 'Z_4_R1', weight: 5 },
            { key: 'S_4', weight: 5 },
            { key: 'S_4_R1', weight: 5 },

            // Large shapes — high variety at high scores
            { key: 'H_LINE_5', weight: 10 },
            { key: 'V_LINE_5', weight: 10 },
            { key: 'CORNER_3', weight: 8 },
            { key: 'CORNER_3_R1', weight: 8 },
            { key: 'CORNER_3_R2', weight: 8 },
            { key: 'CORNER_3_R3', weight: 8 },
            { key: 'BIG_T', weight: 6 },
            { key: 'BIG_T_R1', weight: 6 },
            { key: 'BIG_T_R2', weight: 6 },
            { key: 'BIG_T_R3', weight: 6 },
            { key: 'BIG_L', weight: 3 },
            { key: 'BIG_L_R1', weight: 3 },
            { key: 'BIG_L_R2', weight: 3 },
            { key: 'BIG_L_R3', weight: 3 },
            { key: 'SQUARE_3', weight: 14 },
            { key: 'RECT_3X2', weight: 9 },
            { key: 'RECT_2X3', weight: 9 },

            // 7-block giant L shapes (10x10 mode only)
            { key: 'L_7', weight: 5 },
            { key: 'L_7_R1', weight: 5 },
            { key: 'L_7_R2', weight: 5 },
            { key: 'L_7_R3', weight: 5 }
        ]
    },
    {
        maxScore: Infinity,
        pool: [
            { key: 'SINGLE', weight: 3 },
            { key: 'H_LINE_2', weight: 4 },
            { key: 'V_LINE_2', weight: 4 },
            { key: 'DIAG_2', weight: 3 },
            { key: 'DIAG_2_R1', weight: 3 },
            { key: 'H_LINE_3', weight: 5 },
            { key: 'V_LINE_3', weight: 5 },
            { key: 'DIAG_3', weight: 3 },
            { key: 'DIAG_3_R1', weight: 3 },
            { key: 'H_LINE_4', weight: 8 },
            { key: 'V_LINE_4', weight: 8 },
            { key: 'SQUARE_2', weight: 5 },
            { key: 'T_4', weight: 5 },
            { key: 'T_4_R1', weight: 5 },
            { key: 'T_4_R2', weight: 5 },
            { key: 'T_4_R3', weight: 5 },
            { key: 'Z_4', weight: 5 },
            { key: 'Z_4_R1', weight: 5 },
            { key: 'S_4', weight: 5 },
            { key: 'S_4_R1', weight: 5 },

            // Large board-filling shapes — most common at high scores
            { key: 'H_LINE_5', weight: 12 },
            { key: 'V_LINE_5', weight: 12 },
            { key: 'CORNER_3', weight: 10 },
            { key: 'CORNER_3_R1', weight: 10 },
            { key: 'CORNER_3_R2', weight: 10 },
            { key: 'CORNER_3_R3', weight: 10 },
            { key: 'BIG_T', weight: 7 },
            { key: 'BIG_T_R1', weight: 7 },
            { key: 'BIG_T_R2', weight: 7 },
            { key: 'BIG_T_R3', weight: 7 },
            { key: 'BIG_L', weight: 3 },
            { key: 'BIG_L_R1', weight: 3 },
            { key: 'BIG_L_R2', weight: 3 },
            { key: 'BIG_L_R3', weight: 3 },
            { key: 'SQUARE_3', weight: 16 },
            { key: 'RECT_3X2', weight: 10 },
            { key: 'RECT_2X3', weight: 10 },
            
            // 7-block giant L shapes (10x10 mode only)
            { key: 'L_7', weight: 6.0 },
            { key: 'L_7_R1', weight: 6.0 },
            { key: 'L_7_R2', weight: 6.0 },
            { key: 'L_7_R3', weight: 6.0 }
        ]
    }
];

export class Spawner {
    /**
     * Initializes the 3 active tray slots.
     */
    constructor() {
        this.slots = [null, null, null];
        this.spawnCount = 0;
        this.simulatedFirstSpawnGrid = null;
        this.recentShapes = []; // tracks last 6 shape keys for variety
    }

    /**
     * Board-intelligent placement evaluation.
     * Scores a potential placement by how well it serves the current board state:
     * - Completes or nearly completes rows/cols
     * - Fills isolated holes
     * - Keeps the board flat and organized
     * - Avoids creating new hard-to-fill gaps
     */
    evaluatePlacement(board, tempGrid, matrix, startRow, startCol, mode, activeBombs = []) {
        const rows = board.rows;
        const cols = board.cols;
        const shapeRows = matrix.length;
        const shapeCols = matrix[0].length;
        
        // Generous phase: first 8 spawns actively help the player
        const generous = this.spawnCount < 15;
        const clearMultiplier = generous ? 2.5 : 1;
        
        // 1. Simulate the placement
        const simGrid = tempGrid.map(row => [...row]);
        for (let r = 0; r < shapeRows; r++) {
            for (let c = 0; c < shapeCols; c++) {
                if (matrix[r][c] > 0) {
                    simGrid[startRow + r][startCol + c] = 1;
                }
            }
        }
        
        let score = 0;
        
        // 2. Analyze row/col fill states BEFORE and AFTER placement
        const preRowFill = [];
        const preColFill = [];
        const postRowFill = [];
        const postColFill = [];
        
        for (let r = 0; r < rows; r++) {
            let pre = 0, post = 0;
            for (let c = 0; c < cols; c++) {
                if (tempGrid[r][c] > 0) pre++;
                if (simGrid[r][c] > 0) post++;
            }
            preRowFill.push(pre);
            postRowFill.push(post);
        }
        for (let c = 0; c < cols; c++) {
            let pre = 0, post = 0;
            for (let r = 0; r < rows; r++) {
                if (tempGrid[r][c] > 0) pre++;
                if (simGrid[r][c] > 0) post++;
            }
            preColFill.push(pre);
            postColFill.push(post);
        }
        
        // 3. Line clear detection
        let clearedRows = 0;
        let clearedCols = 0;
        for (let r = 0; r < rows; r++) {
            if (postRowFill[r] === cols && preRowFill[r] < cols) clearedRows++;
        }
        for (let c = 0; c < cols; c++) {
            if (postColFill[c] === rows && preColFill[c] < rows) clearedCols++;
        }
        
        const totalCleared = clearedRows + clearedCols;
        
        // Line clear rewards — MASSIVE priority (doubled in generous phase)
        if (totalCleared > 0) {
            score += totalCleared * 200 * clearMultiplier;
            if (totalCleared >= 2) score += 500 * clearMultiplier;
            if (totalCleared >= 3) score += 1000 * clearMultiplier;
        }
        
        // 4. Near-completion bonus — rows/cols that are now 1 away from full
        //    MASSIVE boost in generous phase to set up clears
        for (let r = 0; r < rows; r++) {
            if (postRowFill[r] === cols - 1 && preRowFill[r] < cols - 1) {
                score += 80 * clearMultiplier;
            }
        }
        for (let c = 0; c < cols; c++) {
            if (postColFill[c] === rows - 1 && preColFill[c] < rows - 1) {
                score += 80 * clearMultiplier;
            }
        }
        
        // 5. Fill-progress reward
        for (let r = 0; r < rows; r++) {
            const progress = postRowFill[r] - preRowFill[r];
            if (progress > 0) score += progress * 8 * clearMultiplier;
        }
        for (let c = 0; c < cols; c++) {
            const progress = postColFill[c] - preColFill[c];
            if (progress > 0) score += progress * 8 * clearMultiplier;
        }
        
        // 6. Hole analysis — penalize creating trapped empty cells
        const countHoles = (grid) => {
            let holes = 0;
            for (let c = 0; c < cols; c++) {
                let occupiedAbove = false;
                for (let r = 0; r < rows; r++) {
                    if (grid[r][c] > 0) occupiedAbove = true;
                    else if (grid[r][c] === 0 && occupiedAbove) holes++;
                }
            }
            return holes;
        };
        
        const holesBefore = countHoles(tempGrid);
        const holesAfter = countHoles(simGrid);
        const newHoles = holesAfter - holesBefore;
        
        if (newHoles > 0) {
            score -= newHoles * (generous ? 30 : 80); // lighter penalty during generous phase
        } else if (newHoles < 0) {
            score += Math.abs(newHoles) * (generous ? 80 : 40); // bigger bonus for filling holes early
        }
        
        // 7. Flatness — prefer placements lower on the board
        score += startRow * (generous ? 8 : 5);
        
        // 8. Compactness — prefer placements that cluster with existing blocks
        let adjacentCount = 0;
        for (let r = 0; r < shapeRows; r++) {
            for (let c = 0; c < shapeCols; c++) {
                if (matrix[r][c] > 0) {
                    const cr = startRow + r;
                    const cc = startCol + c;
                    if (cr > 0 && tempGrid[cr - 1][cc] > 0) adjacentCount++;
                    if (cr < rows - 1 && tempGrid[cr + 1][cc] > 0) adjacentCount++;
                    if (cc > 0 && tempGrid[cr][cc - 1] > 0) adjacentCount++;
                    if (cc < cols - 1 && tempGrid[cr][cc + 1] > 0) adjacentCount++;
                }
            }
        }
        score += adjacentCount * (generous ? 10 : 6);
        
        // 9. Mode-specific bonuses
        if (mode === 'blast') {
            activeBombs.forEach(bomb => {
                // Check if this placement's row or col contains a bomb
                for (let r = 0; r < shapeRows; r++) {
                    for (let c = 0; c < shapeCols; c++) {
                        if (matrix[r][c] > 0) {
                            if (startRow + r === bomb.r || startCol + c === bomb.c) {
                                score += 150;
                                if (bomb.timer <= 3) score += 200;
                            }
                        }
                    }
                }
            });
        } else if (mode === 'missions') {
            // Prioritize clearing gold blocks (color 13)
            for (let r = 0; r < shapeRows; r++) {
                for (let c = 0; c < shapeCols; c++) {
                    if (matrix[r][c] > 0) {
                        const cr = startRow + r;
                        const cc = startCol + c;
                        if (board.grid[cr] && board.grid[cr][cc] === 13) {
                            score += 100;
                        }
                    }
                }
            }
        }
        
        return score;
    }

    /**
     * Fills the tray with 3 new random shapes, but ONLY if all 3 slots are empty.
     * Generates shapes that can fit on the current board (onscreen available slots)
     * and assigns them an optimal targetSpot coordinate evaluated in realtime.
     * @param {Board} board - Board grid state to check valid placement slots.
     * @param {number} score - Current player score.
     * @param {string} mode - Active game mode ('classic', 'adventure', 'blast', 'daily').
     * @param {number} levelNum - Current level number.
     * @param {Array<Object>} activeBombs - List of active bombs.
     * @param {number} [seed] - Optional seed for daily challenges.
     * @returns {boolean} True if a refill was performed, false otherwise.
     */
    refillTray(board, score, mode = 'classic', levelNum = 1, activeBombs = [], seed = null) {
        if (this.slots.every(slot => slot === null)) {
            // Create a temporary grid clone to simulate placements sequentially
            const tempGrid = board.grid.map(row => [...row]);
            
            // Helper board validation using the temporary grid clone
            const validateOnTempGrid = (matrix, startRow, startCol) => {
                const shapeRows = matrix.length;
                const shapeCols = matrix[0].length;
                
                // Bounds check
                if (startRow < 0 || startRow + shapeRows > board.rows || startCol < 0 || startCol + shapeCols > board.cols) {
                    return false;
                }
                
                // Overlap check
                for (let r = 0; r < shapeRows; r++) {
                    for (let c = 0; c < shapeCols; c++) {
                        if (matrix[r][c] > 0 && tempGrid[startRow + r][startCol + c] > 0) {
                            return false;
                        }
                    }
                }
                return true;
            };

            for (let i = 0; i < 3; i++) {
                const rng = seed !== null ? this.seededRandom(seed + i) : Math.random;
                
                // Determine difficulty tier pool based on spawn count (first 3 trays are gated)
                // then fall back to score or level-based scaling from tray 3 onward.
                let tier;
                if (mode !== 'adventure' && mode !== 'missions' && this.spawnCount === 0) {
                    tier = { pool: STARTER_POOL_0 };
                } else if (mode !== 'adventure' && mode !== 'missions' && this.spawnCount === 1) {
                    tier = { pool: STARTER_POOL_1 };
                } else if (mode !== 'adventure' && mode !== 'missions' && this.spawnCount === 2) {
                    tier = { pool: STARTER_POOL_2 };
                } else if (mode === 'adventure' || mode === 'missions') {
                    if (levelNum <= 3) tier = SHAPE_TIERS[0];
                    else if (levelNum <= 6) tier = SHAPE_TIERS[1];
                    else if (levelNum <= 9) tier = SHAPE_TIERS[2];
                    else tier = SHAPE_TIERS[3];
                } else {
                    tier = SHAPE_TIERS.find(t => score < t.maxScore) || SHAPE_TIERS[SHAPE_TIERS.length - 1];
                }
                
                const isBoard10 = (board.cols >= 10);
                const pool = tier.pool.filter(item => {
                    if (!isBoard10) {
                        // 10x10-only shapes
                        if (item.key.startsWith('L_7')) return false;
                        if (item.key.startsWith('BIG_T')) return false;
                    }
                    return true;
                });
                
                // Filter pool: only keep shapes that can fit somewhere on tempGrid
                const validPool = [];
                const shapePlacements = new Map(); // key: shapeKey, value: array of {r, c, evalScore}
                
                for (const item of pool) {
                    const baseShape = SHAPES[item.key];
                    if (!baseShape) continue;
                    
                    const matrix = baseShape.matrix;
                    const shapeRows = matrix.length;
                    const shapeCols = matrix[0].length;
                    const placements = [];
                    
                    // Scan all possible positions on board
                    for (let r = 0; r <= board.rows - shapeRows; r++) {
                        for (let c = 0; c <= board.cols - shapeCols; c++) {
                            if (validateOnTempGrid(matrix, r, c)) {
                                const evalScore = this.evaluatePlacement(board, tempGrid, matrix, r, c, mode, activeBombs);
                                placements.push({ r, c, evalScore });
                            }
                        }
                    }
                    
                    if (placements.length > 0) {
                        validPool.push(item);
                        // Sort placements by tactical score in descending order
                        placements.sort((a, b) => b.evalScore - a.evalScore);
                        shapePlacements.set(item.key, placements);
                    }
                }
                
                // Fallback to full pool if no shape fits on the simulated grid
                let activePool = validPool.length > 0 ? validPool : pool;
                
                if (this.spawnCount === 1 && i === 0 && this.simulatedFirstSpawnGrid) {
                    const clearingPool = activePool.filter(item => {
                        const baseShape = SHAPES[item.key];
                        return baseShape && this.canShapeClearLine(baseShape.matrix, this.simulatedFirstSpawnGrid, board.rows, board.cols);
                    });
                    
                    if (clearingPool.length > 0) {
                        activePool = clearingPool;
                    }
                }
                
                // ═══════════════════════════════════════════════════════════
                //  BOARD-INTELLIGENT SELECTION
                //  Score each shape by its best placement, pick from top
                // ═══════════════════════════════════════════════════════════
                
                // Generous phase: first 8 spawns actively help the player (mirrors evaluatePlacement)
                const generous = this.spawnCount < 15;
                
                // Map each shape to its best placement score
                const scoredShapes = validPool.map(item => {
                    const placements = shapePlacements.get(item.key);
                    const bestScore = placements && placements.length > 0 ? placements[0].evalScore : 0;
                    
                    // Generous phase: boost smaller shapes (1-4 blocks) for easier early game
                    let sizeBonus = 1.0;
                    if (generous) {
                        const baseShape = SHAPES[item.key];
                        if (baseShape) {
                            const blockCount = baseShape.matrix.flat().filter(v => v > 0).length;
                            if (blockCount <= 2) sizeBonus = 1.4;
                            else if (blockCount <= 4) sizeBonus = 1.2;
                            else if (blockCount <= 5) sizeBonus = 1.0;
                            else sizeBonus = 0.7; // penalize large shapes early
                        }
                    }
                    
                    // Variety penalty: reduce score for recently used shapes
                    let varietyMultiplier = 1.0;
                    const recentIdx = this.recentShapes.lastIndexOf(item.key);
                    if (recentIdx >= 0) {
                        const recency = this.recentShapes.length - recentIdx;
                        varietyMultiplier = Math.max(0.2, 1 - (0.2 * (7 - recency)));
                    }
                    
                    // Also penalize same "family" as last shape (e.g., don't give 2 L-shapes in a row)
                    if (this.recentShapes.length > 0) {
                        const lastKey = this.recentShapes[this.recentShapes.length - 1];
                        const lastFamily = lastKey.replace(/_R\d+$/, '').replace(/_\d+$/, '');
                        const thisFamily = item.key.replace(/_R\d+$/, '').replace(/_\d+$/, '');
                        if (lastFamily === thisFamily && lastFamily.length > 2) {
                            varietyMultiplier *= 0.35;
                        }
                    }
                    
                    return {
                        key: item.key,
                        bestScore: bestScore,
                        finalScore: bestScore * varietyMultiplier * sizeBonus,
                        weight: item.weight
                    };
                });
                
                // Sort by finalScore descending — best-fitting shapes first
                scoredShapes.sort((a, b) => b.finalScore - a.finalScore);
                
                // Pick from the top candidates (top 6 or however many exist)
                const topN = Math.min(6, scoredShapes.length);
                const candidates = scoredShapes.slice(0, topN);
                
                let selectedKey;
                if (candidates.length > 0) {
                    // Score-weighted random pick from candidates
                    const candidateTotal = candidates.reduce((s, c) => s + Math.max(c.finalScore, 1), 0);
                    let pick = rng() * candidateTotal;
                    selectedKey = candidates[0].key;
                    for (const c of candidates) {
                        pick -= Math.max(c.finalScore, 1);
                        if (pick <= 0) {
                            selectedKey = c.key;
                            break;
                        }
                    }
                } else {
                    // Fallback: plain weighted random from activePool
                    const totalWeight = activePool.reduce((sum, item) => sum + item.weight, 0);
                    let randomVal = rng() * totalWeight;
                    selectedKey = activePool[0].key;
                    for (const item of activePool) {
                        randomVal -= item.weight;
                        if (randomVal <= 0) {
                            selectedKey = item.key;
                            break;
                        }
                    }
                }

                // Track for variety
                this.recentShapes.push(selectedKey);
                if (this.recentShapes.length > 6) this.recentShapes.shift();
                
                const baseShape = SHAPES[selectedKey];
                const shape = {
                    name: baseShape.name,
                    colorId: baseShape.colorId,
                    matrix: baseShape.matrix.map(row => [...row]),
                    targetSpot: null
                };
                
                // Assign the highest-scoring (best tactical) placement coordinate as targetSpot
                let placements = shapePlacements.get(selectedKey);
                if (!placements || placements.length === 0) {
                    // Recalculate placements if we had to fall back to the full pool
                    placements = [];
                    const matrix = baseShape.matrix;
                    const shapeRows = matrix.length;
                    const shapeCols = matrix[0].length;
                    for (let r = 0; r <= board.rows - shapeRows; r++) {
                        for (let c = 0; c <= board.cols - shapeCols; c++) {
                            if (validateOnTempGrid(matrix, r, c)) {
                                const evalScore = this.evaluatePlacement(board, tempGrid, matrix, r, c, mode, activeBombs);
                                placements.push({ r, c, evalScore });
                            }
                        }
                    }
                    placements.sort((a, b) => b.evalScore - a.evalScore);
                }
                
                if (placements.length > 0) {
                    // Pick the single best placement coordinate (first in sorted list)
                    const spot = placements[0];
                    shape.targetSpot = { r: spot.r, c: spot.c };
                    
                    // Simulate placing the shape on the tempGrid
                    const matrix = baseShape.matrix;
                    for (let r = 0; r < matrix.length; r++) {
                        for (let c = 0; c < matrix[r].length; c++) {
                            if (matrix[r][c] > 0) {
                                tempGrid[spot.r + r][spot.c + c] = 1;
                            }
                        }
                    }
                }
                
                this.slots[i] = shape;
            }
            
            if (this.spawnCount === 0) {
                this.simulatedFirstSpawnGrid = tempGrid.map(row => [...row]);
            }
            this.spawnCount = (this.spawnCount || 0) + 1;
            return true;
        }
        return false;
    }

    /**
     * Helper to create a simple deterministic random generator.
     * @param {number} s - Seed number.
     * @returns {function} RNG function returning 0 to 1.
     */
    seededRandom(s) {
        return function() {
            let t = s += 0x6D2B79F5;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    /**
     * Selects and generates a deep copy of a random shape from the database.
     * @param {number} score - Player score for scaling tiers.
     * @param {function} rng - Random number generator (defaults to Math.random).
     * @returns {Object} Shape object.
     */
    generateRandomShape(score, rng = Math.random) {
        const tier = SHAPE_TIERS.find(t => score < t.maxScore) || SHAPE_TIERS[SHAPE_TIERS.length - 1];
        const pool = tier.pool;

        const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
        let randomVal = rng() * totalWeight;

        let selectedKey = pool[0].key;
        for (const item of pool) {
            randomVal -= item.weight;
            if (randomVal <= 0) {
                selectedKey = item.key;
                break;
            }
        }

        const baseShape = SHAPES[selectedKey];
        return {
            name: baseShape.name,
            colorId: baseShape.colorId,
            matrix: baseShape.matrix.map(row => [...row])
        };
    }

    /**
     * Empties the designated slot after successful board placement.
     * @param {number} index - Tray index (0, 1, or 2).
     */
    useShape(index) {
        if (index >= 0 && index < 3) {
            this.slots[index] = null;
        }
    }

    /**
     * Evaluates if any of the remaining shapes in the tray can fit anywhere in the board's empty cells.
     * @param {Board} board - Board instance with current grid.
     * @returns {boolean} True if no valid moves exist across all remaining tray shapes, triggering game-over.
     */
    checkGameOver(board) {
        const activeShapes = this.slots.filter(s => s !== null);

        if (activeShapes.length === 0) {
            return false;
        }

        for (const shape of activeShapes) {
            const matrix = shape.matrix;
            const shapeRows = matrix.length;
            const shapeCols = matrix[0].length;

            for (let r = 0; r <= board.rows - shapeRows; r++) {
                for (let c = 0; c <= board.cols - shapeCols; c++) {
                    if (board.validatePlacement(matrix, r, c)) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    /**
     * Checks if a shape can clear at least one line (row or column) when placed on a grid.
     * @param {Array<Array<number>>} matrix - Shape block matrix.
     * @param {Array<Array<number>>} grid - Grid board state.
     * @param {number} boardRows - Number of rows.
     * @param {number} boardCols - Number of columns.
     * @returns {boolean} True if a placement exists that clears a line.
     */
    canShapeClearLine(matrix, grid, boardRows, boardCols) {
        const shapeRows = matrix.length;
        const shapeCols = matrix[0].length;
        
        for (let r = 0; r <= boardRows - shapeRows; r++) {
            for (let c = 0; c <= boardCols - shapeCols; c++) {
                // Check if shape fits at (r, c)
                let fits = true;
                for (let sr = 0; sr < shapeRows; sr++) {
                    for (let sc = 0; sc < shapeCols; sc++) {
                        if (matrix[sr][sc] > 0 && grid[r + sr][c + sc] > 0) {
                            fits = false;
                            break;
                        }
                    }
                    if (!fits) break;
                }
                
                if (fits) {
                    // Check if placement completes any row or column
                    // Row check
                    for (let sr = 0; sr < shapeRows; sr++) {
                        const rowIdx = r + sr;
                        let rowFull = true;
                        for (let colIdx = 0; colIdx < boardCols; colIdx++) {
                            const isShapeCell = (colIdx >= c && colIdx < c + shapeCols && matrix[sr][colIdx - c] > 0);
                            if (!isShapeCell && grid[rowIdx][colIdx] === 0) {
                                rowFull = false;
                                break;
                            }
                        }
                        if (rowFull) return true;
                    }
                    
                    // Column check
                    for (let sc = 0; sc < shapeCols; sc++) {
                        const colIdx = c + sc;
                        let colFull = true;
                        for (let rowIdx = 0; rowIdx < boardRows; rowIdx++) {
                            const isShapeCell = (rowIdx >= r && rowIdx < r + shapeRows && matrix[rowIdx - r][sc] > 0);
                            if (!isShapeCell && grid[rowIdx][colIdx] === 0) {
                                colFull = false;
                                break;
                            }
                        }
                        if (colFull) return true;
                    }
                }
            }
        }
        return false;
    }
}
