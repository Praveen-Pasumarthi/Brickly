/**
 * Brickly - Board Logic Matrix Engine
 * Handles the 8x8 cell grid states, shape placement validation, and line clearance logic.
 */

export class Board {
    /**
     * Initializes the grid matrix.
     * @param {number} rows - Number of grid rows (default 8).
     * @param {number} cols - Number of grid columns (default 8).
     */
    constructor(rows = 8, cols = 8) {
        this.rows = rows;
        this.cols = cols;
        this.grid = this.createEmptyGrid();
    }

    /**
     * Generates a clean empty grid matrix.
     * @returns {Array<Array<number>>}
     */
    createEmptyGrid() {
        return Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
    }

    /**
     * Safely checks if a coordinate is within board bounds.
     * @param {number} r - Row index.
     * @param {number} c - Column index.
     * @returns {boolean}
     */
    isValidCell(r, c) {
        return r >= 0 && r < this.rows && c >= 0 && c < this.cols;
    }

    /**
     * Sets a grid cell value directly.
     * @param {number} r - Row index.
     * @param {number} c - Column index.
     * @param {number} val - Occupied state/color code.
     */
    setCell(r, c, val) {
        if (this.isValidCell(r, c)) {
            this.grid[r][c] = val;
        }
    }

    /**
     * Gets a grid cell value, returning 0 if out of bounds.
     * @param {number} r - Row index.
     * @param {number} c - Column index.
     * @returns {number}
     */
    getCell(r, c) {
        if (this.isValidCell(r, c)) {
            return this.grid[r][c];
        }
        return 0;
    }

    /**
     * Validates if a block shape can fit on the board starting at a given coordinate.
     * @param {Array<Array<number>>} shapeMatrix - 2D matrix representing the shape blocks (1 for block, 0 for empty).
     * @param {number} startRow - Target board row index for shape's top-left block.
     * @param {number} startCol - Target board column index for shape's top-left block.
     * @returns {boolean} True if placement is valid (within boundaries and doesn't overlap occupied cells).
     */
    validatePlacement(shapeMatrix, startRow, startCol) {
        const shapeRows = shapeMatrix.length;
        const shapeCols = shapeMatrix[0].length;

        for (let r = 0; r < shapeRows; r++) {
            for (let c = 0; c < shapeCols; c++) {
                if (shapeMatrix[r][c] !== 0) {
                    const targetRow = startRow + r;
                    const targetCol = startCol + c;

                    // Out of bounds check
                    if (!this.isValidCell(targetRow, targetCol)) {
                        return false;
                    }

                    // Collision check: any cell value > 0 represents an occupied block.
                    // Note: adventure goals or bombs will have values > 0.
                    if (this.grid[targetRow][targetCol] > 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    /**
     * Places a block shape on the board grid. Assumes validatePlacement has already succeeded.
     * @param {Array<Array<number>>} shapeMatrix - 2D shape layout matrix.
     * @param {number} startRow - Top-left row placement coordinate.
     * @param {number} startCol - Top-left column placement coordinate.
     * @param {number} blockValue - The color/theme integer ID assigned to the placed shape blocks (must be >= 1).
     */
    placeShape(shapeMatrix, startRow, startCol, blockValue) {
        const shapeRows = shapeMatrix.length;
        const shapeCols = shapeMatrix[0].length;

        for (let r = 0; r < shapeRows; r++) {
            for (let c = 0; c < shapeCols; c++) {
                if (shapeMatrix[r][c] !== 0) {
                    const targetRow = startRow + r;
                    const targetCol = startCol + c;
                    this.grid[targetRow][targetCol] = blockValue;
                }
            }
        }
    }

    /**
     * Analyzes the grid to find completely full rows and columns simultaneously.
     * @returns {Object} An object containing lists of completed row and column indices.
     */
    checkFullLines() {
        const fullRows = [];
        const fullCols = [];

        // Check rows for fullness (all cells > 0)
        for (let r = 0; r < this.rows; r++) {
            let rowFull = true;
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c] === 0) {
                    rowFull = false;
                    break;
                }
            }
            if (rowFull) {
                fullRows.push(r);
            }
        }

        // Check columns for fullness (all cells > 0)
        for (let c = 0; c < this.cols; c++) {
            let colFull = true;
            for (let r = 0; r < this.rows; r++) {
                if (this.grid[r][c] === 0) {
                    colFull = false;
                    break;
                }
            }
            if (colFull) {
                fullCols.push(c);
            }
        }

        return { rows: fullRows, cols: fullCols };
    }

    /**
     * Clears all blocks in the designated rows and columns.
     * @param {Array<number>} rows - Row indices to clear.
     * @param {Array<number>} cols - Column indices to clear.
     */
    clearLines(rows, cols) {
        // Clear full rows
        rows.forEach(r => {
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c] = 0;
            }
        });

        // Clear full columns
        cols.forEach(c => {
            for (let r = 0; r < this.rows; r++) {
                this.grid[r][c] = 0;
            }
        });
    }

    /**
     * Resets the entire board state. Can optionally load a pre-configured matrix.
     * @param {Array<Array<number>>|null} newGrid - Optional grid structure to initialize (useful for Adventure mode levels).
     */
    reset(newGrid = null, rows = 8, cols = 8) {
        this.starterShapes = [];
        this.starterPlacements = [];
        if (newGrid) {
            this.grid = newGrid.map(row => [...row]);
            this.rows = this.grid.length;
            this.cols = this.grid[0].length;
        } else {
            this.rows = rows;
            this.cols = cols;
            this.grid = this.createEmptyGrid();
        }
    }

    /**
     * Pre-fills the grid using actual game shapes placed randomly.
     * Leaves strategic gaps for the player's starting tray pieces.
     * @param {number} fillPercent - Target percentage of cells to fill (20-60, default 50).
     * @param {Object} shapesDb - The SHAPES database from spawner.js.
     */
    prefillGrid(fillPercent = 30, shapesDb = null) {
        if (!shapesDb) return;
        
        // Reset starterShapes array
        this.starterShapes = [];
        this.starterPlacements = [];

        const totalCells = this.rows * this.cols;
        const targetFill = Math.floor(totalCells * fillPercent / 100);

        // Define nice, standard candidate starter shapes (excluding giant shapes or single dots)
        const starterCandidates = [
            'H_LINE_3', 'V_LINE_3', 'V_L_3', 'V_L_3_R1', 'V_L_3_R2', 'V_L_3_R3',
            'SQUARE_2', 'T_4', 'T_4_R1', 'T_4_R2', 'T_4_R3',
            'H_LINE_4', 'V_LINE_4', 'RECT_3X2', 'RECT_2X3', 'Z_4', 'S_4',
            'L_4', 'L_4_R1', 'L_4_R2', 'L_4_R3', 'J_4', 'J_4_R1', 'J_4_R2', 'J_4_R3'
        ];

        // We will try to generate a clean prefill.
        // If random placements fail, we try again (up to 50 attempts).
        for (let attempt = 0; attempt < 50; attempt++) {
            // Reset grid
            this.grid = this.createEmptyGrid();

            // 1. Pick 3 random starter shapes
            const chosenKeys = [];
            for (let i = 0; i < 3; i++) {
                chosenKeys.push(starterCandidates[Math.floor(Math.random() * starterCandidates.length)]);
            }

            // 2. Select active lines (rows & cols) to place these shapes and fill blocks.
            let numRows = this.rows >= 10 ? 3 : 2;
            let numCols = this.cols >= 10 ? 2 : 2;
            
            const activeRows = [];
            const activeCols = [];
            while (activeRows.length < numRows) {
                const r = Math.floor(Math.random() * this.rows);
                if (!activeRows.includes(r)) activeRows.push(r);
            }
            while (activeCols.length < numCols) {
                const c = Math.floor(Math.random() * this.cols);
                if (!activeCols.includes(c)) activeCols.push(c);
            }

            const isActiveLine = (r, c) => activeRows.includes(r) || activeCols.includes(c);

            // A helper grid to check overlaps during placement of starter shapes
            const tempGrid = this.createEmptyGrid();

            // Try to place the 3 chosen shapes within the active lines
            let placedAll = true;
            const placements = [];

            for (const key of chosenKeys) {
                const shape = shapesDb[key];
                const matrix = shape.matrix;
                const sRows = matrix.length;
                const sCols = matrix[0].length;

                // Find all valid positions in the active lines for this shape
                const validPositions = [];
                for (let r = 0; r <= this.rows - sRows; r++) {
                    for (let c = 0; c <= this.cols - sCols; c++) {
                        let ok = true;
                        for (let sr = 0; sr < sRows; sr++) {
                            for (let sc = 0; sc < sCols; sc++) {
                                if (matrix[sr][sc] > 0) {
                                    const tr = r + sr;
                                    const tc = c + sc;
                                    if (tempGrid[tr][tc] > 0 || !isActiveLine(tr, tc)) {
                                        ok = false;
                                        break;
                                    }
                                }
                            }
                            if (!ok) break;
                        }
                        if (ok) {
                            validPositions.push({ r, c });
                        }
                    }
                }

                if (validPositions.length === 0) {
                    placedAll = false;
                    break;
                }

                // Pick a random valid position
                const pos = validPositions[Math.floor(Math.random() * validPositions.length)];
                placements.push({ key, r: pos.r, c: pos.c });

                // Mark cells as occupied in tempGrid
                for (let sr = 0; sr < sRows; sr++) {
                    for (let sc = 0; sc < sCols; sc++) {
                        if (matrix[sr][sc] > 0) {
                            tempGrid[pos.r + sr][pos.c + sc] = 1;
                        }
                    }
                }
            }

            if (!placedAll) {
                continue;
            }

            // 3. We successfully placed the 3 shapes!
            // Fill the remaining cells of the active lines (which are not occupied by our starter shapes)
            const gapCells = [];
            const prefillCells = [];

            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    if (isActiveLine(r, c)) {
                        if (tempGrid[r][c] > 0) {
                            gapCells.push({ r, c });
                        } else {
                            prefillCells.push({ r, c });
                        }
                    }
                }
            }

            // Adjust the number of prefill cells to match targetFill
            let selectedPrefill = [...prefillCells];
            if (selectedPrefill.length > targetFill) {
                selectedPrefill.sort(() => Math.random() - 0.5);
                selectedPrefill = selectedPrefill.slice(0, targetFill);
            }

            // Decide if this prefill allows a 100% complete board clear (e.g. 40% chance)
            const allowCompleteClear = Math.random() < 0.40;

            // Fill the grid with these prefill cells using random colors
            for (const cell of selectedPrefill) {
                const colorId = Math.floor(Math.random() * 12) + 1;
                this.grid[cell.r][cell.c] = colorId;
            }

            // If complete clear is not allowed, scatter some extra blocks in non-active rows/cols
            if (!allowCompleteClear) {
                const nonActiveCells = [];
                for (let r = 0; r < this.rows; r++) {
                    for (let c = 0; c < this.cols; c++) {
                        if (!isActiveLine(r, c)) {
                            nonActiveCells.push({ r, c });
                        }
                    }
                }
                nonActiveCells.sort(() => Math.random() - 0.5);
                const extraCount = Math.floor(Math.random() * 5) + 6; // 6 to 10 cells
                const selectedExtra = nonActiveCells.slice(0, extraCount);
                for (const cell of selectedExtra) {
                    const colorId = Math.floor(Math.random() * 12) + 1;
                    this.grid[cell.r][cell.c] = colorId;
                }
            }

            // Double check that we didn't accidentally complete any lines with the prefilled blocks
            const fullLines = this.checkFullLines();
            if (fullLines.rows.length > 0 || fullLines.cols.length > 0) {
                continue;
            }

            // If we got here, we have a valid, beautiful, line-group carving!
            this.starterShapes = chosenKeys;
            this.starterPlacements = placements;
            return;
        }

        // Fallback: If carving attempts failed, fall back to standard prefill
        console.warn("Puzzle carving failed to find a valid layout, falling back to legacy prefill.");
        this.starterShapes = [];
        this.starterPlacements = [];
        const legacyPrefills = ['SINGLE', 'H_LINE_2', 'V_LINE_2', 'H_LINE_3', 'V_LINE_3', 'SQUARE_2'];
        let filledCount = 0;
        let attempts = 0;
        while (filledCount < targetFill && attempts < 200) {
            attempts++;
            const key = legacyPrefills[Math.floor(Math.random() * legacyPrefills.length)];
            const shape = shapesDb[key];
            if (!shape) continue;
            const r = Math.floor(Math.random() * (this.rows - shape.matrix.length + 1));
            const c = Math.floor(Math.random() * (this.cols - shape.matrix[0].length + 1));
            if (this.validatePlacement(shape.matrix, r, c)) {
                this.placeShape(shape.matrix, r, c, Math.floor(Math.random() * 12) + 1);
                const lines = this.checkFullLines();
                if (lines.rows.length > 0 || lines.cols.length > 0) {
                    for (let sr = 0; sr < shape.matrix.length; sr++) {
                        for (let sc = 0; sc < shape.matrix[sr].length; sc++) {
                            if (shape.matrix[sr][sc] > 0) this.grid[r + sr][c + sc] = 0;
                        }
                    }
                } else {
                    filledCount += shape.matrix.flat().filter(v => v > 0).length;
                }
            }
        }
    }
}
