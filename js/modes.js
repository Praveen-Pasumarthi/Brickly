/**
 * Brickly - Game Modes Controller
 * Contains 100 Mission Level definitions and Blast Mode bomb state managers.
 */

// Cell IDs mapping:
// 0: Empty
// 1-12: Normal colored blocks (themes map these to Neon/Pastel/Wood/Gems)
// 13: Target/Pre-filled Block (Missions clear objective)
// 14: Bomb Block (Blast Mode, countdown timer triggers game over)

const HAND_CRAFTED = generateHandCraftedLevels();

function generateHandCraftedLevels() {
    return [
        {
            levelNumber: 1,
            name: "First Steps",
            description: "Clear 5 lines within 25 moves.",
            movesLimit: 25,
            scoreTarget: 0,
            linesTarget: 5,
            preFilledTarget: 0,
            grid: emptyGrid()
        },
        {
            levelNumber: 2,
            name: "Gold Rush",
            description: "Clear all 4 gold blocks in 22 moves.",
            movesLimit: 22,
            scoreTarget: 0,
            linesTarget: 0,
            preFilledTarget: 4,
            grid: [[13,0,0,0,0,0,0,13],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[13,0,0,0,0,0,0,13]]
        },
        {
            levelNumber: 3,
            name: "Combo Training",
            description: "Score 400 points in 24 moves.",
            movesLimit: 24,
            scoreTarget: 400,
            linesTarget: 0,
            preFilledTarget: 0,
            grid: emptyGrid()
        },
        {
            levelNumber: 4,
            name: "Corner Pocket",
            description: "Clear all 8 gold blocks in 28 moves.",
            movesLimit: 28,
            scoreTarget: 0,
            linesTarget: 0,
            preFilledTarget: 8,
            grid: [[13,13,0,0,0,0,13,13],[13,0,0,0,0,0,0,13],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[13,0,0,0,0,0,0,13],[13,13,0,0,0,0,13,13]]
        },
        {
            levelNumber: 5,
            name: "Gridlock Line",
            description: "Clear 8 lines in 32 moves.",
            movesLimit: 32,
            scoreTarget: 0,
            linesTarget: 8,
            preFilledTarget: 0,
            grid: emptyGrid()
        },
        {
            levelNumber: 6,
            name: "Crossroads",
            description: "Clear 12 gold blocks in 30 moves.",
            movesLimit: 30,
            scoreTarget: 0,
            linesTarget: 0,
            preFilledTarget: 12,
            grid: [[0,0,0,13,13,0,0,0],[0,0,0,13,13,0,0,0],[0,0,0,0,0,0,0,0],[13,13,0,0,0,0,13,13],[13,13,0,0,0,0,13,13],[0,0,0,0,0,0,0,0],[0,0,0,13,13,0,0,0],[0,0,0,13,13,0,0,0]]
        },
        {
            levelNumber: 7,
            name: "Score Attack",
            description: "Score 1000 points in 34 moves.",
            movesLimit: 34,
            scoreTarget: 1000,
            linesTarget: 0,
            preFilledTarget: 0,
            grid: emptyGrid()
        },
        {
            levelNumber: 8,
            name: "Heavy Columns",
            description: "Clear all 12 gold blocks in 32 moves.",
            movesLimit: 32,
            scoreTarget: 0,
            linesTarget: 0,
            preFilledTarget: 12,
            grid: [[13,0,0,0,0,0,0,13],[13,0,0,0,0,0,0,13],[13,0,0,0,0,0,0,13],[13,0,0,0,0,0,0,13],[13,0,0,0,0,0,0,13],[13,0,0,0,0,0,0,13],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]]
        },
        {
            levelNumber: 9,
            name: "The Fort",
            description: "Clear 16 gold blocks in 36 moves.",
            movesLimit: 36,
            scoreTarget: 0,
            linesTarget: 0,
            preFilledTarget: 16,
            grid: [[13,13,13,13,13,13,13,13],[13,0,0,0,0,0,0,13],[13,0,0,0,0,0,0,13],[13,0,0,0,0,0,0,13],[13,0,0,0,0,0,0,13],[13,0,0,0,0,0,0,13],[13,0,0,0,0,0,0,13],[13,13,13,13,13,13,13,13]]
        },
        {
            levelNumber: 10,
            name: "Obsidian Core",
            description: "Score 1500 points and clear 12 gold blocks in 40 moves.",
            movesLimit: 40,
            scoreTarget: 1500,
            linesTarget: 0,
            preFilledTarget: 12,
            grid: [[0,0,0,0,0,0,0,0],[0,13,13,0,0,13,13,0],[0,13,13,0,0,13,13,0],[0,0,0,13,13,0,0,0],[0,0,0,13,13,0,0,0],[0,13,13,0,0,13,13,0],[0,13,13,0,0,13,13,0],[0,0,0,0,0,0,0,0]]
        }
    ];
}

function emptyGrid() {
    return [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0]
    ];
}

function symGrid(pattern) {
    const g = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0]
    ];
    const coords = [
        [[0,0],[0,7],[7,0],[7,7]],
        [[0,1],[0,6],[7,1],[7,6]],
        [[1,0],[1,7],[6,0],[6,7]],
        [[1,1],[1,6],[6,1],[6,6]],
        [[0,2],[0,5],[7,2],[7,5]],
        [[2,0],[2,7],[5,0],[5,7]],
        [[0,3],[0,4],[7,3],[7,4]],
        [[1,2],[1,5],[6,2],[6,5]],
        [[2,1],[2,6],[5,1],[5,6]],
        [[2,2],[2,5],[5,2],[5,5]],
        [[1,3],[1,4],[6,3],[6,4]],
        [[3,1],[3,6],[4,1],[4,6]],
        [[3,0],[3,7],[4,0],[4,7]],
        [[2,3],[2,4],[5,3],[5,4]],
        [[3,2],[3,5],[4,2],[4,5]],
        [[3,3],[3,4],[4,3],[4,4]]
    ];
    for (let i = 0; i < pattern.length && i < coords.length; i++) {
        if (pattern[i]) {
            for (const [r, c] of coords[i]) {
                g[r][c] = 13;
            }
        }
    }
    return g;
}

function countGoldFromPattern(pattern) {
    const coordsCount = [
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4
    ];
    let count = 0;
    for (let i = 0; i < pattern.length && i < coordsCount.length; i++) {
        if (pattern[i]) count += coordsCount[i];
    }
    return count;
}

function generateLevels() {
    const levels = [...HAND_CRAFTED];
    const levelNames = [
        "Crystal Cave", "Emerald City", "Sapphire Mine", "Ruby Ridge", "Diamond Dash",
        "Twin Peaks", "Moonlight", "Sunburst", "Starfall", "Nebula",
        "Thunderstrike", "Frostbite", "Inferno", "Avalanche", "Tidal Wave",
        "Sandstorm", "Wildfire", "Hurricane", "Monsoon", "Earthquake",
        "Labyrinth", "Maze Runner", "Block Party", "Gridlock", "Chain Reaction",
        "Domino Effect", "Ripple", "Cascade", "Waterfall", "Tornado",
        "Pyramid", "Obelisk", "Citadel", "Bastille", "Dungeon",
        "Tower", "Spire", "Summit", "Peak", "Cliffhanger",
        "Volcano", "Glacier", "Oasis", "Delta", "Canyon",
        "Rapids", "Current", "Drift", "Stream", "River",
        "Eclipse", "Solstice", "Equinox", "Horizon", "Zenith",
        "Nadir", "Apex", "Core", "Nucleus", "Center",
        "Paradox", "Mystery", "Enigma", "Riddle", "Puzzle",
        "Chaos", "Order", "Balance", "Harmony", "Union",
        "Genesis", "Pulse", "Beat", "Rhythm", "Flow",
        "Zen", "Karma", "Destiny", "Fate", "Fortune",
        "Courage", "Wisdom", "Power", "Glory", "Honor",
        "Victory", "Triumph", "Conquest", "Legacy", "Magnum",
        "Ultima", "Omega", "Finale", "Endgame", "Checkmate",
        "Aether", "Nova", "Comet", "Meteor", "Asteroid",
        "Galaxy", "Cosmos", "Orbit", "Lunar", "Solar",
        "Prism", "Shard", "Crest", "Emblem", "Sigil",
        "Rune", "Glyph", "Totem", "Idol", "Relic",
        "Phantom", "Specter", "Wraith", "Ghost", "Spirit",
        "Aegis", "Shield", "Armor", "Blade", "Saber",
        "Phoenix", "Griffin", "Dragon", "Hydra", "Chimera",
        "Titan", "Colossus", "Golem", "Behemoth", "Leviathan",
        "Sentinel", "Guardian", "Warden", "Paladin", "Knight",
        "Wizard", "Mage", "Sage", "Oracle", "Seer",
        "Monarch", "Emperor", "Sovereign", "Overlord", "Warlord",
        "Celestial", "Eternal", "Infinite", "Boundless", "Endless"
    ];
    for (let i = 11; i <= 500; i++) {
        const idx = i - 11;
        const nameIdx = idx % levelNames.length;
        const cycle = idx % 10;
        const moves = Math.max(12, 27 - Math.floor(i * 0.045));
        const g = emptyGrid();
        let linesTarget = 0;
        let preFilledTarget = 0;
        let scoreTarget = 0;
        let comboTarget = 0;
        let placementsTarget = 0;
        let linesOneTurnTarget = 0;
        let desc = "";
        let grid = g;

        if (cycle === 0) {
            const lines = Math.min(4 + Math.floor(i * 0.05), 20);
            linesTarget = lines;
            desc = `Clear ${lines} lines in ${moves} moves.`;
        } else if (cycle === 1) {
            const pts = 150 + Math.floor(i * 9);
            scoreTarget = pts;
            desc = `Reach ${pts} points in ${moves} moves.`;
        } else if (cycle === 2) {
            const gold = Math.min(2 + Math.floor(i * 0.08), 28);
            preFilledTarget = gold;
            const bits = Math.min(gold, 32);
            const pat = [];
            let placed = 0;
            for (let b = 0; b < 16 && placed < bits; b++) {
                const put = Math.min(4, bits - placed);
                pat.push(put >= 1);
                placed += Math.min(4, put);
            }
            while (pat.length < 16) pat.push(false);
            grid = symGrid(pat);
            desc = `Clear ${gold} gold blocks in ${moves} moves.`;
        } else if (cycle === 3) {
            const combo = Math.min(2 + Math.floor(i * 0.04), 15);
            comboTarget = combo;
            desc = `Reach ${combo}x combo streak in ${moves} moves.`;
        } else if (cycle === 4) {
            const place = Math.min(8 + Math.floor(i * 0.12), 40);
            placementsTarget = place;
            desc = `Place ${place} blocks in ${moves} moves.`;
        } else if (cycle === 5) {
            const lines = Math.min(3 + Math.floor(i * 0.04), 14);
            linesOneTurnTarget = lines;
            desc = `Clear ${lines} lines at once in ${moves} moves.`;
        } else if (cycle === 6) {
            const lines = Math.min(3 + Math.floor(i * 0.04), 12);
            const pts = 100 + Math.floor(i * 7);
            linesTarget = lines;
            scoreTarget = pts;
            desc = `Clear ${lines} lines & score ${pts} pts in ${moves} moves.`;
        } else if (cycle === 7) {
            const gold = Math.min(2 + Math.floor(i * 0.06), 20);
            const combo = Math.min(2 + Math.floor(i * 0.03), 10);
            preFilledTarget = gold;
            comboTarget = combo;
            const bits = Math.min(gold, 32);
            const pat = [];
            let placed = 0;
            for (let b = 0; b < 16 && placed < bits; b++) {
                const put = Math.min(4, bits - placed);
                pat.push(put >= 1);
                placed += Math.min(4, put);
            }
            while (pat.length < 16) pat.push(false);
            grid = symGrid(pat);
            desc = `Clear ${gold} gold blocks with ${combo}x combo in ${moves} moves.`;
        } else if (cycle === 8) {
            const lines = Math.min(3 + Math.floor(i * 0.03), 10);
            const combo = Math.min(2 + Math.floor(i * 0.04), 12);
            linesTarget = lines;
            comboTarget = combo;
            desc = `Clear ${lines} lines with ${combo}x combo in ${moves} moves.`;
        } else if (cycle === 9) {
            const lines = Math.min(2 + Math.floor(i * 0.03), 8);
            const place = Math.min(6 + Math.floor(i * 0.10), 30);
            linesTarget = lines;
            placementsTarget = place;
            desc = `Clear ${lines} lines, place ${place} blocks in ${moves} moves.`;
        }

        levels.push({
            levelNumber: i,
            name: levelNames[nameIdx],
            description: desc,
            movesLimit: moves,
            scoreTarget,
            linesTarget,
            preFilledTarget,
            comboTarget,
            placementsTarget,
            linesOneTurnTarget,
            grid
        });
    }
    return levels;
}

export const AdventureLevels = generateLevels();

export class ModeManager {
    static spawnBomb(board, activeBombsList, countdown = 9) {
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
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const { r, c } = emptyCells[randomIndex];
        board.grid[r][c] = 14;
        activeBombsList.push({ r, c, timer: countdown });
        return true;
    }

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

    static cleanseBombs(board, clearedRows, clearedCols, activeBombsList) {
        for (let i = activeBombsList.length - 1; i >= 0; i--) {
            const bomb = activeBombsList[i];
            const rowCleared = clearedRows.includes(bomb.r);
            const colCleared = clearedCols.includes(bomb.c);
            if (rowCleared || colCleared || board.grid[bomb.r][bomb.c] === 0) {
                activeBombsList.splice(i, 1);
            }
        }
    }
}
