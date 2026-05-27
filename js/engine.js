/**
 * Gridly - Board Logic Matrix Engine
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
}
