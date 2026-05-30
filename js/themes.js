/**
 * Brickly - Visual Themes configurations
 * Contains HSL colors mapping, layout themes, and graphics directives for the Canvas renderer.
 */

// Texture pattern registry — populated by game.js at startup
// Maps theme.id → { pattern: CanvasPattern, alpha: number }
export const texturePatterns = new Map();

export const THEMES = {
    classic: {
        id: 'classic',
        name: 'Classic Pink',
        colors: {
            bg: '#7c3a47',
            gridBg: '#40181e',
            gridLines: '#2a0c10',
            cellEmpty: 'rgba(42, 12, 16, 0.4)',
            textPrimary: '#ffffff',
            textSecondary: '#ffb3c1',
            hudBg: 'rgba(64, 24, 30, 0.75)',
            boardBorder: '#2a0c10',
            shadow: 'rgba(42, 12, 16, 0.45)',
            glow: 'rgba(255, 179, 193, 0.85)',
            goldGlow: 'rgba(255, 215, 0, 0.85)',
            bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#e84575', // Primary pink
            2: '#3ba9e2', // Light Blue
            3: '#a645e8', // Purple
            4: '#3be27b', // Green
            5: '#e24e3b', // Orange
            6: '#e8bc45', // Yellow
            7: '#e2753b', // Brownish Orange
            8: '#3be2d0', // Turquoise
            9: '#e84575',
            10: '#3ba9e2',
            11: '#e8bc45',
            12: '#a645e8',
            13: '#ffd700', // Target (Gold cushion)
            14: '#ff3300'  // Bomb (Red warning cushion)
        },
        blockStyle: 'cushion',
        particleStyle: 'star',
        lineClearStyle: 'puff',
        boardClearStyle: 'fade_sweep'
    },
    neon: {
        id: 'neon',
        name: 'Neon Cyberpunk',
        colors: {
            bg: '#050508',
            gridBg: '#0c0d14',
            gridLines: '#1a1d2e',
            cellEmpty: 'rgba(26, 29, 46, 0.4)',
            textPrimary: '#00f6ff',
            textSecondary: '#ff007f',
            hudBg: 'rgba(12, 13, 20, 0.75)',
            boardBorder: '#1a1d2e',
            shadow: 'rgba(0, 246, 255, 0.4)',
            glow: 'rgba(0, 246, 255, 0.95)',
            goldGlow: 'rgba(255, 215, 0, 0.85)',
            bombGlow: 'rgba(255, 51, 0, 0.85)',
            // Block colors (Neon glowing neon shades)
            1: '#ff007f', // Hot Pink
            2: '#00f6ff', // Ice Cyan
            3: '#9d00ff', // Violet Purple
            4: '#39ff14', // Acid Green
            5: '#ff003c', // Cyber Red
            6: '#ffff00', // Electric Yellow
            7: '#ff5e00', // Synth Orange
            8: '#003cff', // Cobalt Blue
            9: '#ff007f', // corner
            10: '#39ff14', // 1x5
            11: '#ffff00', // big L
            12: '#9d00ff', // big Z
            13: '#ffd700', // Target (Neon Gold)
            14: '#ff3300'  // Bomb (Neon Red-Orange)
        },
        blockStyle: 'neon',
        particleStyle: 'glitch',
        lineClearStyle: 'glitch_zap',
        boardClearStyle: 'glitch_surge'
    },
    wood: {
        id: 'wood',
        name: 'Woodland Classic',
        texture: 'Wood/Wood_01-128x128',
        colors: {
            bg: '#1b0e07',
            gridBg: '#2a160b',
            gridLines: '#3d2010',
            cellEmpty: 'rgba(61, 32, 16, 0.35)',
            textPrimary: '#fbdcb9',
            textSecondary: '#d89b65',
            hudBg: 'rgba(42, 22, 11, 0.8)',
            boardBorder: '#4a2613',
            shadow: 'rgba(0, 0, 0, 0.65)',
            glow: 'rgba(216, 155, 101, 0.55)',
            goldGlow: 'rgba(240, 190, 80, 0.6)',
            bombGlow: 'rgba(180, 30, 20, 0.6)',
            // Block colors (Rich organic wood shades)
            1: '#844d2b', // Walnut
            2: '#b87747', // Mahogany
            3: '#ca8a52', // Cherry
            4: '#734125', // Dark Oak
            5: '#a36239', // Cedar
            6: '#d89d6c', // Maple
            7: '#e2ad81', // Birch
            8: '#5c3118', // Ebony
            9: '#844d2b',
            10: '#b87747',
            11: '#d89d6c',
            12: '#734125',
            13: '#ffc83b', // Target (Polished Gilded Wood)
            14: '#9b1c1c'  // Bomb (Charcoal Ember Wood)
        },
        blockStyle: 'wood',
        particleStyle: 'leaves',
        lineClearStyle: 'splinter',
        boardClearStyle: 'timber'
    },
    gems: {
        id: 'gems',
        name: 'Gemstone Blitz',
        colors: {
            bg: '#05030a',
            gridBg: '#0e0a1b',
            gridLines: '#1d1637',
            cellEmpty: 'rgba(29, 22, 55, 0.35)',
            textPrimary: '#e076ff',
            textSecondary: '#7b2eff',
            hudBg: 'rgba(14, 10, 27, 0.8)',
            boardBorder: '#291f4f',
            shadow: 'rgba(123, 46, 255, 0.4)',
            glow: 'rgba(224, 118, 255, 0.8)',
            goldGlow: 'rgba(255, 215, 0, 0.8)',
            bombGlow: 'rgba(255, 0, 80, 0.8)',
            // Block colors (Crystalline faceted gemstone tones)
            1: '#e6005c', // Ruby
            2: '#00cc66', // Emerald
            3: '#0066ff', // Sapphire
            4: '#ffcc00', // Amber
            5: '#ac00e6', // Amethyst
            6: '#00e6e6', // Aquamarine
            7: '#ff6600', // Garnet
            8: '#ff0099', // Pink Tourmaline
            9: '#e6005c',
            10: '#00cc66',
            11: '#ffcc00',
            12: '#ac00e6',
            13: '#ffd700', // Target (Topaz Ring)
            14: '#e60026'  // Bomb (Fissured Obsidian Core)
        },
        blockStyle: 'gemstone',
        particleStyle: 'shard',
        lineClearStyle: 'shatter',
        boardClearStyle: 'crystal_collapse'
    },
    pastel: {
        id: 'pastel',
        name: 'Minimalist Pastel',
        colors: {
            bg: '#2a2f3a',
            gridBg: '#171a21',
            gridLines: '#232730',
            cellEmpty: 'rgba(35, 39, 48, 0.55)',
            textPrimary: '#e2e8f0',
            textSecondary: '#94a3b8',
            hudBg: 'rgba(23, 26, 33, 0.75)',
            boardBorder: '#232730',
            shadow: 'rgba(15, 17, 22, 0.35)',
            glow: 'rgba(148, 163, 184, 0.45)',
            goldGlow: 'rgba(217, 160, 24, 0.45)',
            bombGlow: 'rgba(217, 50, 50, 0.45)',
            // Block colors (Soft, low-eye-strain pastel values)
            1: '#fecaca', // Soft Rose Pink
            2: '#fed7aa', // Soft Peach
            3: '#fef08a', // Soft Butter
            4: '#bbf7d0', // Soft Pale Green
            5: '#bfdbfe', // Soft Pale Blue
            6: '#f5d0fe', // Soft Lavender
            7: '#ffedd5', // Soft Creamsicle
            8: '#ccfbf1', // Soft Mint
            9: '#fecaca',
            10: '#bbf7d0',
            11: '#fef08a',
            12: '#f5d0fe',
            13: '#fbbf24', // Target (Warm Gold Cream)
            14: '#f87171'  // Bomb (Pastel Rose-Red)
        },
        blockStyle: 'pastel',
        particleStyle: 'bubbles',
        lineClearStyle: 'pop',
        boardClearStyle: 'fade_sweep'
    },
    indigo: {
        id: 'indigo',
        name: 'Indigo Night',
        colors: {
            bg: '#3a4a7a',          // medium navy-blue screen background
            gridBg: '#1e2545',      // deep navy board panel
            gridLines: '#252e55',   // subtle grid line
            cellEmpty: 'rgba(30, 37, 70, 0.5)',
            textPrimary: '#ffffff',
            textSecondary: '#c8d4ff',
            hudBg: 'rgba(20, 26, 60, 0.75)',
            boardBorder: '#1a2040',
            shadow: 'rgba(20, 26, 60, 0.5)',
            glow: 'rgba(180, 160, 255, 0.7)',
            goldGlow: 'rgba(255, 215, 0, 0.85)',
            bombGlow: 'rgba(255, 51, 0, 0.85)',
            // Two-tone: warm gold and rich violet — contrasting and vibrant
            1:  '#e8b84b',  // Golden Amber
            2:  '#8b5cf6',  // Violet Purple
            3:  '#f59e0b',  // Warm Honey
            4:  '#7c3aed',  // Deep Violet
            5:  '#fbbf24',  // Sunflower Gold
            6:  '#6d28d9',  // Royal Purple
            7:  '#d97706',  // Burnt Gold
            8:  '#a78bfa',  // Soft Lavender
            9:  '#e8b84b',
            10: '#8b5cf6',
            11: '#fbbf24',
            12: '#7c3aed',
            13: '#ffd700',  // Target Gold
            14: '#ff3300'   // Bomb Red
        },
        blockStyle: 'cushion',
        particleStyle: 'star',
        lineClearStyle: 'starpulse',
        boardClearStyle: 'starwave'
    },
    blush: {
        id: 'blush',
        name: 'Blush Rose',
        colors: {
            bg: '#e8909a',          // warm pink screen background
            gridBg: '#7a3040',      // deep rose board panel
            gridLines: '#6a2535',   // subtle darker rose grid lines
            cellEmpty: 'rgba(90, 30, 45, 0.38)',
            textPrimary: '#ffffff',
            textSecondary: '#ffd6de',
            hudBg: 'rgba(90, 25, 40, 0.6)',
            boardBorder: '#5a1928',
            shadow: 'rgba(90, 25, 40, 0.45)',
            glow: 'rgba(255, 150, 170, 0.8)',
            goldGlow: 'rgba(255, 215, 0, 0.85)',
            bombGlow: 'rgba(255, 51, 0, 0.85)',
            // Monochromatic rose-pink family with 3D cushion depth
            1:  '#e8647a',  2:  '#d4546a',  3:  '#f07888',
            4:  '#c84c60',  5:  '#e87888',  6:  '#ea8090',
            7:  '#d05e70',  8:  '#e06878',  9:  '#e8647a',
            10: '#d4546a', 11: '#f07888', 12: '#c84c60',
            13: '#ffd700',             14: '#ff3300'
        },
        blockStyle: 'cushion',
        particleStyle: 'petal',
        lineClearStyle: 'petalfall',
        boardClearStyle: 'rosestorm'
    },
    snow: {
        id: 'snow',
        name: '❄️ Winter Snow',
        colors: {
            bg: '#c8e6f5',          // icy pale blue sky
            gridBg: '#d0ecff',      // frosted board
            gridLines: '#a8d4ee',   // light blue grid dividers
            cellEmpty: 'rgba(168, 212, 238, 0.35)',
            textPrimary: '#1a3a5c',
            textSecondary: '#4a7a9b',
            hudBg: 'rgba(200, 230, 245, 0.8)',
            boardBorder: '#9ac8e0',
            shadow: 'rgba(100, 160, 200, 0.3)',
            glow: 'rgba(255, 255, 255, 0.9)',
            goldGlow: 'rgba(255, 200, 80, 0.8)',
            bombGlow: 'rgba(220, 50, 50, 0.8)',
            // Christmas: deep reds and forest greens on an ice background
            1:  '#cc2222',  // Christmas Red
            2:  '#228b22',  // Forest Green
            3:  '#e63b3b',  // Bright Red
            4:  '#2da52d',  // Vivid Green
            5:  '#b81c1c',  // Deep Berry Red
            6:  '#1a7a1a',  // Dark Pine
            7:  '#ff4444',  // Candy Red
            8:  '#33aa33',  // Holly Green
            9:  '#cc2222',
            10: '#228b22',
            11: '#e63b3b',
            12: '#1a7a1a',
            13: '#ffd700',  // Gold Star
            14: '#cc2222'   // Red Candy Bomb
        },
        blockStyle: 'cushion',
        particleStyle: 'snowflake',
        lineClearStyle: 'flakefall',
        boardClearStyle: 'blizzard'
    },
    ocean: {
        id: 'ocean',
        name: '🌊 Ocean Depths',
        colors: {
            bg: '#0d3350',          // deep ocean midnight blue
            gridBg: '#082840',      // deep sea board
            gridLines: '#0d3a52',   // subtle current lines
            cellEmpty: 'rgba(8, 40, 64, 0.5)',
            textPrimary: '#b0e8ff',
            textSecondary: '#5bc8e8',
            hudBg: 'rgba(8, 30, 50, 0.78)',
            boardBorder: '#0a2a3e',
            shadow: 'rgba(5, 180, 220, 0.3)',
            glow: 'rgba(80, 220, 255, 0.7)',
            goldGlow: 'rgba(255, 215, 0, 0.85)',
            bombGlow: 'rgba(255, 80, 50, 0.85)',
            // Jewel-toned ocean palette: teals, aquas, coral
            1:  '#00bcd4',  // Tropical Teal
            2:  '#26c6da',  // Aqua Cyan
            3:  '#00838f',  // Deep Teal
            4:  '#4dd0e1',  // Ice Blue
            5:  '#ff7043',  // Coral Reef
            6:  '#0097a7',  // Pacific Blue
            7:  '#ff8a65',  // Warm Coral
            8:  '#00acc1',  // Mid Teal
            9:  '#00bcd4',
            10: '#26c6da',
            11: '#00838f',
            12: '#ff7043',
            13: '#ffd700',
            14: '#ff3300'
        },
        blockStyle: 'cushion',
        particleStyle: 'bubbles',
        lineClearStyle: 'bubblerise',
        boardClearStyle: 'tidal_surge'
    },
    aurora: {
        id: 'aurora',
        name: '🌌 Aurora Night',
        colors: {
            bg: '#060d18',          // near-black cosmic dark
            gridBg: '#0c1424',      // midnight board
            gridLines: '#121e30',   // barely-visible grid
            cellEmpty: 'rgba(12, 20, 36, 0.55)',
            textPrimary: '#a8ffdb',
            textSecondary: '#7de8c8',
            hudBg: 'rgba(6, 13, 24, 0.82)',
            boardBorder: '#0e1a28',
            shadow: 'rgba(80, 255, 180, 0.25)',
            glow: 'rgba(120, 255, 200, 0.65)',
            goldGlow: 'rgba(255, 215, 0, 0.8)',
            bombGlow: 'rgba(255, 80, 80, 0.8)',
            // Aurora: glowing greens and purples on deep cosmic dark
            1:  '#00e676',  // Aurora Green
            2:  '#b04dff',  // Violet Aurora
            3:  '#00c853',  // Emerald Pulse
            4:  '#9c27b0',  // Deep Purple
            5:  '#69f0ae',  // Soft Mint
            6:  '#ce93d8',  // Soft Lilac
            7:  '#00bfa5',  // Teal Shimmer
            8:  '#7c4dff',  // Electric Indigo
            9:  '#00e676',
            10: '#b04dff',
            11: '#00c853',
            12: '#9c27b0',
            13: '#ffd700',
            14: '#ff1744'
        },
        blockStyle: 'neon',
        particleStyle: 'ribbon',
        lineClearStyle: 'ribbonflow',
        boardClearStyle: 'aurora_sweep'
    },
    watermelon: {
        id: 'watermelon',
        name: 'Watermelon',
        colors: {
            bg: '#1a472a',
            gridBg: '#0f2e1a',
            gridLines: '#1a3d24',
            cellEmpty: 'rgba(26, 61, 36, 0.4)',
            textPrimary: '#ffffff',
            textSecondary: '#a8e6a0',
            hudBg: 'rgba(15, 46, 26, 0.8)',
            boardBorder: '#0a1f10',
            shadow: 'rgba(0, 0, 0, 0.5)',
            glow: 'rgba(168, 230, 160, 0.6)',
            goldGlow: 'rgba(255, 215, 0, 0.85)',
            bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#e53935', 2: '#43a047', 3: '#ef5350', 4: '#66bb6a',
            5: '#c62828', 6: '#2e7d32', 7: '#ff7043', 8: '#81c784',
            9: '#e53935', 10: '#43a047', 11: '#ef5350', 12: '#66bb6a',
            13: '#ffd700', 14: '#ff1744'
        },
        blockStyle: 'cushion',
        particleStyle: 'seed',
        lineClearStyle: 'seedburst',
        boardClearStyle: 'seedsplash'
    },
    cheese: {
        id: 'cheese',
        name: 'Cheese',
        colors: {
            bg: '#5c4a1e',
            gridBg: '#3d3010',
            gridLines: '#4a3a15',
            cellEmpty: 'rgba(74, 58, 21, 0.4)',
            textPrimary: '#fff8e1',
            textSecondary: '#ffe082',
            hudBg: 'rgba(61, 48, 16, 0.8)',
            boardBorder: '#2a1f08',
            shadow: 'rgba(0, 0, 0, 0.5)',
            glow: 'rgba(255, 224, 130, 0.6)',
            goldGlow: 'rgba(255, 215, 0, 0.85)',
            bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#ffc107', 2: '#ff9800', 3: '#ffca28', 4: '#ffb300',
            5: '#ff8f00', 6: '#ffe082', 7: '#ffa726', 8: '#ffd54f',
            9: '#ffc107', 10: '#ff9800', 11: '#ffca28', 12: '#ffb300',
            13: '#ffd700', 14: '#ff5722'
        },
        blockStyle: 'cushion',
        particleStyle: 'crumb',
        lineClearStyle: 'crumble',
        boardClearStyle: 'cheese_collapse'
    },
    crochet: {
        id: 'crochet',
        name: 'Crochet Ribbons',
        colors: {
            bg: '#4a3048',
            gridBg: '#2d1c2c',
            gridLines: '#3a2538',
            cellEmpty: 'rgba(58, 37, 56, 0.4)',
            textPrimary: '#f3e5f5',
            textSecondary: '#ce93d8',
            hudBg: 'rgba(45, 28, 44, 0.8)',
            boardBorder: '#1a0e19',
            shadow: 'rgba(0, 0, 0, 0.5)',
            glow: 'rgba(206, 147, 216, 0.6)',
            goldGlow: 'rgba(255, 215, 0, 0.85)',
            bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#f48fb1', 2: '#80cbc4', 3: '#fff176', 4: '#b39ddb',
            5: '#f06292', 6: '#4dd0e1', 7: '#ffcc80', 8: '#a5d6a7',
            9: '#f48fb1', 10: '#80cbc4', 11: '#fff176', 12: '#b39ddb',
            13: '#ffd700', 14: '#ef5350'
        },
        blockStyle: 'pastel',
        particleStyle: 'yarn',
        lineClearStyle: 'unravel',
        boardClearStyle: 'unravel_full'
    },
    tropical: {
        id: 'tropical',
        name: 'Tropical Fruits',
        colors: {
            bg: '#004d40',
            gridBg: '#00332b',
            gridLines: '#004036',
            cellEmpty: 'rgba(0, 64, 54, 0.4)',
            textPrimary: '#e0f2f1',
            textSecondary: '#80cbc4',
            hudBg: 'rgba(0, 51, 43, 0.8)',
            boardBorder: '#001a15',
            shadow: 'rgba(0, 0, 0, 0.5)',
            glow: 'rgba(128, 203, 196, 0.6)',
            goldGlow: 'rgba(255, 215, 0, 0.85)',
            bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#ff7043', 2: '#66bb6a', 3: '#fdd835', 4: '#ab47bc',
            5: '#ff5722', 6: '#43a047', 7: '#ffca28', 8: '#7e57c2',
            9: '#ff7043', 10: '#66bb6a', 11: '#fdd835', 12: '#ab47bc',
            13: '#ffd700', 14: '#d32f2f'
        },
        blockStyle: 'cushion',
        particleStyle: 'petal',
        lineClearStyle: 'petalfall',
        boardClearStyle: 'bloom_burst'
    },
    marble: {
        id: 'marble',
        name: 'Marble',
        texture: 'Stone/Stone_01-128x128',
        colors: {
            bg: '#263238',
            gridBg: '#1a2327',
            gridLines: '#232f34',
            cellEmpty: 'rgba(35, 47, 52, 0.4)',
            textPrimary: '#eceff1',
            textSecondary: '#90a4ae',
            hudBg: 'rgba(26, 35, 39, 0.8)',
            boardBorder: '#0d1416',
            shadow: 'rgba(0, 0, 0, 0.5)',
            glow: 'rgba(144, 164, 174, 0.5)',
            goldGlow: 'rgba(255, 215, 0, 0.85)',
            bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#b0bec5', 2: '#78909c', 3: '#cfd8dc', 4: '#546e7a',
            5: '#90a4ae', 6: '#607d8b', 7: '#b0bec5', 8: '#455a64',
            9: '#b0bec5', 10: '#78909c', 11: '#cfd8dc', 12: '#546e7a',
            13: '#ffd700', 14: '#ef5350'
        },
        blockStyle: 'gemstone',
        particleStyle: 'shard',
        lineClearStyle: 'dustcrack',
        boardClearStyle: 'stone_collapse'
    },
    lava: {
        id: 'lava',
        name: 'Lava',
        texture: 'Elements/Elements_01-128x128',
        colors: {
            bg: '#1a0a00',
            gridBg: '#120700',
            gridLines: '#1f0d00',
            cellEmpty: 'rgba(31, 13, 0, 0.4)',
            textPrimary: '#ffccbc',
            textSecondary: '#ff8a65',
            hudBg: 'rgba(18, 7, 0, 0.85)',
            boardBorder: '#0a0400',
            shadow: 'rgba(255, 87, 34, 0.3)',
            glow: 'rgba(255, 138, 101, 0.6)',
            goldGlow: 'rgba(255, 215, 0, 0.85)',
            bombGlow: 'rgba(255, 255, 0, 0.85)',
            1: '#ff5722', 2: '#ff9800', 3: '#f44336', 4: '#ffc107',
            5: '#e64a19', 6: '#ef6c00', 7: '#d32f2f', 8: '#ff8f00',
            9: '#ff5722', 10: '#ff9800', 11: '#f44336', 12: '#ffc107',
            13: '#ffd700', 14: '#ffff00'
        },
        blockStyle: 'neon',
        particleStyle: 'ember',
        lineClearStyle: 'ember_rise',
        boardClearStyle: 'eruption'
    },
    sakura: {
        id: 'sakura',
        name: 'Sakura',
        colors: {
            bg: '#2c1a2e',
            gridBg: '#1e1020',
            gridLines: '#281528',
            cellEmpty: 'rgba(40, 21, 40, 0.4)',
            textPrimary: '#fce4ec',
            textSecondary: '#f48fb1',
            hudBg: 'rgba(30, 16, 32, 0.8)',
            boardBorder: '#120814',
            shadow: 'rgba(0, 0, 0, 0.5)',
            glow: 'rgba(244, 143, 177, 0.5)',
            goldGlow: 'rgba(255, 215, 0, 0.85)',
            bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#f8bbd0', 2: '#e91e63', 3: '#f48fb1', 4: '#c2185b',
            5: '#f06292', 6: '#ad1457', 7: '#fce4ec', 8: '#ec407a',
            9: '#f8bbd0', 10: '#e91e63', 11: '#f48fb1', 12: '#c2185b',
            13: '#ffd700', 14: '#ff1744'
        },
        blockStyle: 'cushion',
        particleStyle: 'petal',
        lineClearStyle: 'petalfall',
        boardClearStyle: 'petal_storm'
    },
    candy: {
        id: 'candy',
        name: 'Candy',
        colors: {
            bg: '#4a148c',
            gridBg: '#311b5e',
            gridLines: '#3a1f70',
            cellEmpty: 'rgba(58, 31, 112, 0.4)',
            textPrimary: '#f3e5f5',
            textSecondary: '#ce93d8',
            hudBg: 'rgba(49, 27, 94, 0.8)',
            boardBorder: '#1a0a3e',
            shadow: 'rgba(0, 0, 0, 0.5)',
            glow: 'rgba(206, 147, 216, 0.5)',
            goldGlow: 'rgba(255, 215, 0, 0.85)',
            bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#e040fb', 2: '#00e5ff', 3: '#ffeb3b', 4: '#76ff03',
            5: '#d500f9', 6: '#00b8d4', 7: '#ffd600', 8: '#64dd17',
            9: '#e040fb', 10: '#00e5ff', 11: '#ffeb3b', 12: '#76ff03',
            13: '#ffd700', 14: '#ff1744'
        },
        blockStyle: 'pastel',
        particleStyle: 'sprinkle',
        lineClearStyle: 'sprinkle_burst',
        boardClearStyle: 'candy_rain'
    },
    brickWall: {
        id: 'brickWall',
        name: 'Brick Wall',
        texture: 'Brick/Brick_15-128x128',
        colors: {
            bg: '#2a1510', gridBg: '#1a0d08', gridLines: '#3a2018',
            cellEmpty: 'rgba(58, 32, 24, 0.4)',
            textPrimary: '#f5e6d3', textSecondary: '#c4956a',
            hudBg: 'rgba(26, 13, 8, 0.8)', boardBorder: '#4a2818',
            shadow: 'rgba(0, 0, 0, 0.5)', glow: 'rgba(196, 149, 106, 0.6)',
            goldGlow: 'rgba(255, 215, 0, 0.85)', bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#8b4513', 2: '#a0522d', 3: '#cd853f', 4: '#6b3410',
            5: '#b8652a', 6: '#d2a679', 7: '#9c5c2e', 8: '#7a3b12',
            9: '#8b4513', 10: '#a0522d', 11: '#d2a679', 12: '#6b3410',
            13: '#ffd700', 14: '#ff3300'
        },
        blockStyle: 'textured', particleStyle: 'crumb',
        lineClearStyle: 'crumble', boardClearStyle: 'timber'
    },
    industrialMetal: {
        id: 'industrialMetal',
        name: 'Industrial Metal',
        texture: 'Metal/Metal_05-128x128',
        colors: {
            bg: '#0a0a0f', gridBg: '#12121a', gridLines: '#1e1e2a',
            cellEmpty: 'rgba(30, 30, 42, 0.4)',
            textPrimary: '#c8d0e0', textSecondary: '#7888a8',
            hudBg: 'rgba(18, 18, 26, 0.85)', boardBorder: '#2a2a3a',
            shadow: 'rgba(0, 0, 0, 0.6)', glow: 'rgba(120, 136, 168, 0.5)',
            goldGlow: 'rgba(255, 215, 0, 0.85)', bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#4a5568', 2: '#718096', 3: '#2d3748', 4: '#a0aec0',
            5: '#3182ce', 6: '#63b3ed', 7: '#2c5282', 8: '#90cdf4',
            9: '#4a5568', 10: '#718096', 11: '#63b3ed', 12: '#2d3748',
            13: '#ffd700', 14: '#ff3300'
        },
        blockStyle: 'textured', particleStyle: 'glitch',
        lineClearStyle: 'glitch_zap', boardClearStyle: 'glitch_surge'
    },
    slate: {
        id: 'slate',
        name: 'Slate',
        texture: 'Stone/Stone_11-128x128',
        colors: {
            bg: '#1a1e24', gridBg: '#12151a', gridLines: '#222830',
            cellEmpty: 'rgba(34, 40, 48, 0.4)',
            textPrimary: '#d1d5db', textSecondary: '#9ca3af',
            hudBg: 'rgba(18, 21, 26, 0.82)', boardBorder: '#2a3038',
            shadow: 'rgba(0, 0, 0, 0.55)', glow: 'rgba(156, 163, 175, 0.5)',
            goldGlow: 'rgba(255, 215, 0, 0.85)', bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#64748b', 2: '#94a3b8', 3: '#475569', 4: '#334155',
            5: '#7dd3fc', 6: '#38bdf8', 7: '#0284c7', 8: '#bae6fd',
            9: '#64748b', 10: '#94a3b8', 11: '#38bdf8', 12: '#475569',
            13: '#ffd700', 14: '#ff3300'
        },
        blockStyle: 'textured', particleStyle: 'shard',
        lineClearStyle: 'shatter', boardClearStyle: 'crystal_collapse'
    },
    volcanic: {
        id: 'volcanic',
        name: 'Volcanic',
        texture: 'Elements/Elements_05-128x128',
        colors: {
            bg: '#0a0200', gridBg: '#120400', gridLines: '#1e0800',
            cellEmpty: 'rgba(30, 8, 0, 0.4)',
            textPrimary: '#ffccbc', textSecondary: '#ff8a65',
            hudBg: 'rgba(18, 4, 0, 0.88)', boardBorder: '#2a0c00',
            shadow: 'rgba(255, 87, 34, 0.3)', glow: 'rgba(255, 138, 101, 0.6)',
            goldGlow: 'rgba(255, 215, 0, 0.85)', bombGlow: 'rgba(255, 255, 0, 0.85)',
            1: '#ff5722', 2: '#ff9800', 3: '#f44336', 4: '#ffc107',
            5: '#e64a19', 6: '#ef6c00', 7: '#d32f2f', 8: '#ff8f00',
            9: '#ff5722', 10: '#ff9800', 11: '#f44336', 12: '#ffc107',
            13: '#ffd700', 14: '#ffff00'
        },
        blockStyle: 'volcanic', particleStyle: 'dust_cloud',
        lineClearStyle: 'dust_puff', boardClearStyle: 'eruption'
    },
    brickClassic: {
        id: 'brickClassic',
        name: 'Classic Brick',
        texture: 'Brick/Brick_02-128x128',
        colors: {
            bg: '#401e18', gridBg: '#220e0b', gridLines: '#3a1b15',
            cellEmpty: 'rgba(58, 27, 21, 0.4)',
            textPrimary: '#f4e6e3', textSecondary: '#dca69a',
            hudBg: 'rgba(34, 14, 11, 0.8)', boardBorder: '#4e221b',
            shadow: 'rgba(0, 0, 0, 0.5)', glow: 'rgba(220, 166, 154, 0.6)',
            goldGlow: 'rgba(255, 215, 0, 0.85)', bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#b24c3d', 2: '#8c352a', 3: '#cd6555', 4: '#6e271e',
            5: '#dca69a', 6: '#808080', 7: '#a9a9a9', 8: '#5c2d25',
            9: '#b24c3d', 10: '#8c352a', 11: '#cd6555', 12: '#6e271e',
            13: '#ffd700', 14: '#ff3300'
        },
        blockStyle: 'textured', particleStyle: 'crumb',
        lineClearStyle: 'crumble', boardClearStyle: 'timber'
    },
    muddyDirt: {
        id: 'muddyDirt',
        name: 'Earthy Dirt',
        texture: 'Dirt/Dirt_14-128x128',
        colors: {
            bg: '#2b1d0c', gridBg: '#170e05', gridLines: '#2a1b0d',
            cellEmpty: 'rgba(42, 27, 13, 0.4)',
            textPrimary: '#eedcc5', textSecondary: '#c5a37d',
            hudBg: 'rgba(23, 14, 5, 0.82)', boardBorder: '#3d2813',
            shadow: 'rgba(0, 0, 0, 0.65)', glow: 'rgba(197, 163, 125, 0.55)',
            goldGlow: 'rgba(255, 215, 0, 0.85)', bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#8b5a2b', 2: '#6e473b', 3: '#a0522d', 4: '#556b2f',
            5: '#8fbc8f', 6: '#cd853f', 7: '#b5a642', 8: '#483c32',
            9: '#8b5a2b', 10: '#6e473b', 11: '#a0522d', 12: '#556b2f',
            13: '#ffd700', 14: '#ff3300'
        },
        blockStyle: 'textured', particleStyle: 'dust_cloud',
        lineClearStyle: 'dust_puff', boardClearStyle: 'stone_collapse'
    },
    heavyMetal: {
        id: 'heavyMetal',
        name: 'Heavy Metal',
        texture: 'Metal/Metal_15-128x128',
        colors: {
            bg: '#15181e', gridBg: '#0c0d10', gridLines: '#1d2028',
            cellEmpty: 'rgba(29, 32, 40, 0.4)',
            textPrimary: '#d0d5dd', textSecondary: '#8a95a5',
            hudBg: 'rgba(12, 13, 16, 0.85)', boardBorder: '#2b303b',
            shadow: 'rgba(0, 0, 0, 0.6)', glow: 'rgba(138, 149, 165, 0.5)',
            goldGlow: 'rgba(255, 215, 0, 0.85)', bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#708090', 2: '#778899', 3: '#4f5d75', 4: '#dcdcdc',
            5: '#b0c4de', 6: '#daa520', 7: '#cd7f32', 8: '#3a4454',
            9: '#708090', 10: '#778899', 11: '#4f5d75', 12: '#daa520',
            13: '#ffd700', 14: '#ff3300'
        },
        blockStyle: 'textured', particleStyle: 'glitch',
        lineClearStyle: 'metal_snap', boardClearStyle: 'glitch_surge'
    },
    cobbleStone: {
        id: 'cobbleStone',
        name: 'Cobblestone',
        texture: 'Stone/Stone_18-128x128',
        colors: {
            bg: '#1c1e22', gridBg: '#101114', gridLines: '#22252a',
            cellEmpty: 'rgba(34, 37, 42, 0.4)',
            textPrimary: '#e2e8f0', textSecondary: '#94a3b8',
            hudBg: 'rgba(16, 17, 20, 0.82)', boardBorder: '#2e333d',
            shadow: 'rgba(0, 0, 0, 0.55)', glow: 'rgba(148, 163, 184, 0.5)',
            goldGlow: 'rgba(255, 215, 0, 0.85)', bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#5c677d', 2: '#334155', 3: '#708090', 4: '#475569',
            5: '#94a3b8', 6: '#1e293b', 7: '#64748b', 8: '#38bdf8',
            9: '#5c677d', 10: '#334155', 11: '#708090', 12: '#475569',
            13: '#ffd700', 14: '#ff3300'
        },
        blockStyle: 'textured', particleStyle: 'shard',
        lineClearStyle: 'shatter', boardClearStyle: 'stone_collapse'
    },
    mahoganyWood: {
        id: 'mahoganyWood',
        name: 'Mahogany Wood',
        texture: 'Wood/Wood_15-128x128',
        colors: {
            bg: '#3b1510', gridBg: '#220b08', gridLines: '#3a1712',
            cellEmpty: 'rgba(58, 23, 18, 0.4)',
            textPrimary: '#eed9d7', textSecondary: '#c88279',
            hudBg: 'rgba(34, 11, 8, 0.85)', boardBorder: '#501d16',
            shadow: 'rgba(0, 0, 0, 0.65)', glow: 'rgba(200, 130, 121, 0.55)',
            goldGlow: 'rgba(255, 215, 0, 0.85)', bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#800000', 2: '#8b4513', 3: '#a0522d', 4: '#5c2d25',
            5: '#d2b48c', 6: '#cd853f', 7: '#b22222', 8: '#4a150e',
            9: '#800000', 10: '#8b4513', 11: '#cd853f', 12: '#5c2d25',
            13: '#ffd700', 14: '#ff3300'
        },
        blockStyle: 'textured', particleStyle: 'splinter',
        lineClearStyle: 'splinter', boardClearStyle: 'timber'
    },
    driftWood: {
        id: 'driftWood',
        name: 'Driftwood',
        texture: 'Wood/Wood_13-128x128',
        colors: {
            bg: '#2c2a27', gridBg: '#1a1917', gridLines: '#2d2b28',
            cellEmpty: 'rgba(45, 43, 40, 0.4)',
            textPrimary: '#e5e2dd', textSecondary: '#aba69e',
            hudBg: 'rgba(26, 25, 23, 0.8)', boardBorder: '#3f3c38',
            shadow: 'rgba(0, 0, 0, 0.5)', glow: 'rgba(171, 166, 158, 0.5)',
            goldGlow: 'rgba(255, 215, 0, 0.85)', bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#8a7d72', 2: '#6e645a', 3: '#bfae9e', 4: '#524a43',
            5: '#d3c2b0', 6: '#a39587', 7: '#decbb7', 8: '#3d3732',
            9: '#8a7d72', 10: '#6e645a', 11: '#bfae9e', 12: '#524a43',
            13: '#ffd700', 14: '#ff3300'
        },
        blockStyle: 'textured', particleStyle: 'splinter',
        lineClearStyle: 'splinter', boardClearStyle: 'timber'
    },
    tile01: {
        id: 'tile01',
        name: 'Mosaic Tile',
        texture: 'Tile/Tile_01-128x128',
        colors: {
            bg: '#0f3a40', gridBg: '#092125', gridLines: '#154e56',
            cellEmpty: 'rgba(21, 78, 86, 0.4)',
            textPrimary: '#e0f7fa', textSecondary: '#80deea',
            hudBg: 'rgba(9, 33, 37, 0.8)', boardBorder: '#154e56',
            shadow: 'rgba(0, 0, 0, 0.5)', glow: 'rgba(128, 222, 234, 0.5)',
            goldGlow: 'rgba(255, 215, 0, 0.85)', bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#00838f', 2: '#00acc1', 3: '#0097a7', 4: '#ffd700',
            5: '#80deea', 6: '#00e5ff', 7: '#006064', 8: '#e0f7fa',
            9: '#00838f', 10: '#00acc1', 11: '#0097a7', 12: '#006064',
            13: '#ffd700', 14: '#ff3300'
        },
        blockStyle: 'textured', particleStyle: 'shard',
        lineClearStyle: 'tile_break', boardClearStyle: 'stone_collapse'
    },
    tile03: {
        id: 'tile03',
        name: 'Terrazzo Tile',
        texture: 'Tile/Tile_03-128x128',
        colors: {
            bg: '#3e2723', gridBg: '#271714', gridLines: '#4e342e',
            cellEmpty: 'rgba(78, 52, 46, 0.4)',
            textPrimary: '#efebe9', textSecondary: '#bcaaa4',
            hudBg: 'rgba(39, 23, 20, 0.8)', boardBorder: '#4e342e',
            shadow: 'rgba(0, 0, 0, 0.5)', glow: 'rgba(188, 170, 164, 0.5)',
            goldGlow: 'rgba(255, 215, 0, 0.85)', bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#8d6e63', 2: '#a1887f', 3: '#795548', 4: '#6d4c41',
            5: '#bcaaa4', 6: '#d7ccc8', 7: '#5d4037', 8: '#ffe0b2',
            9: '#8d6e63', 10: '#a1887f', 11: '#795548', 12: '#5d4037',
            13: '#ffd700', 14: '#ff3300'
        },
        blockStyle: 'textured', particleStyle: 'shard',
        lineClearStyle: 'tile_break', boardClearStyle: 'stone_collapse'
    },
    tile05: {
        id: 'tile05',
        name: 'Ceramic Tile',
        texture: 'Tile/Tile_05-128x128',
        colors: {
            bg: '#1b5e20', gridBg: '#0c3814', gridLines: '#2e7d32',
            cellEmpty: 'rgba(46, 125, 50, 0.4)',
            textPrimary: '#e8f5e9', textSecondary: '#a5d6a7',
            hudBg: 'rgba(12, 56, 20, 0.8)', boardBorder: '#2e7d32',
            shadow: 'rgba(0, 0, 0, 0.5)', glow: 'rgba(165, 214, 167, 0.5)',
            goldGlow: 'rgba(255, 215, 0, 0.85)', bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#4caf50', 2: '#81c784', 3: '#388e3c', 4: '#2e7d32',
            5: '#a5d6a7', 6: '#c8e6c9', 7: '#1b5e20', 8: '#dcedc8',
            9: '#4caf50', 10: '#81c784', 11: '#388e3c', 12: '#1b5e20',
            13: '#ffd700', 14: '#ff3300'
        },
        blockStyle: 'textured', particleStyle: 'shard',
        lineClearStyle: 'tile_break', boardClearStyle: 'stone_collapse'
    },
    tile07: {
        id: 'tile07',
        name: 'Porcelain Tile',
        texture: 'Tile/Tile_07-128x128',
        colors: {
            bg: '#0d47a1', gridBg: '#082b68', gridLines: '#1565c0',
            cellEmpty: 'rgba(21, 101, 192, 0.4)',
            textPrimary: '#e3f2fd', textSecondary: '#90caf9',
            hudBg: 'rgba(8, 43, 104, 0.8)', boardBorder: '#1565c0',
            shadow: 'rgba(0, 0, 0, 0.5)', glow: 'rgba(144, 202, 249, 0.5)',
            goldGlow: 'rgba(255, 215, 0, 0.85)', bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#1e88e5', 2: '#64b5f6', 3: '#1565c0', 4: '#0d47a1',
            5: '#90caf9', 6: '#bbdefb', 7: '#1976d2', 8: '#e0f7fa',
            9: '#1e88e5', 10: '#64b5f6', 11: '#1565c0', 12: '#0d47a1',
            13: '#ffd700', 14: '#ff3300'
        },
        blockStyle: 'textured', particleStyle: 'shard',
        lineClearStyle: 'tile_break', boardClearStyle: 'stone_collapse'
    },
    tile09: {
        id: 'tile09',
        name: 'Tuscan Clay',
        texture: 'Tile/Tile_09-128x128',
        colors: {
            bg: '#4e342e', gridBg: '#2e1c18', gridLines: '#5d4037',
            cellEmpty: 'rgba(93, 64, 55, 0.4)',
            textPrimary: '#fbe9e7', textSecondary: '#ffab91',
            hudBg: 'rgba(46, 28, 24, 0.8)', boardBorder: '#5d4037',
            shadow: 'rgba(0, 0, 0, 0.5)', glow: 'rgba(255, 171, 145, 0.5)',
            goldGlow: 'rgba(255, 215, 0, 0.85)', bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#d84315', 2: '#e64a19', 3: '#ff7043', 4: '#ff8a65',
            5: '#ffab91', 6: '#ffb74d', 7: '#bf360c', 8: '#ffe0b2',
            9: '#d84315', 10: '#e64a19', 11: '#ff7043', 12: '#bf360c',
            13: '#ffd700', 14: '#ff3300'
        },
        blockStyle: 'textured', particleStyle: 'shard',
        lineClearStyle: 'tile_break', boardClearStyle: 'stone_collapse'
    },
    tile11: {
        id: 'tile11',
        name: 'Marble Tile',
        texture: 'Tile/Tile_11-128x128',
        colors: {
            bg: '#263238', gridBg: '#1a2327', gridLines: '#37474f',
            cellEmpty: 'rgba(55, 71, 79, 0.4)',
            textPrimary: '#eceff1', textSecondary: '#b0bec5',
            hudBg: 'rgba(26, 35, 39, 0.8)', boardBorder: '#37474f',
            shadow: 'rgba(0, 0, 0, 0.5)', glow: 'rgba(176, 190, 197, 0.5)',
            goldGlow: 'rgba(255, 215, 0, 0.85)', bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#90a4ae', 2: '#cfd8dc', 3: '#b0bec5', 4: '#78909c',
            5: '#607d8b', 6: '#455a64', 7: '#eceff1', 8: '#37474f',
            9: '#90a4ae', 10: '#cfd8dc', 11: '#b0bec5', 12: '#455a64',
            13: '#ffd700', 14: '#ff3300'
        },
        blockStyle: 'textured', particleStyle: 'shard',
        lineClearStyle: 'tile_break', boardClearStyle: 'stone_collapse'
    },
    tile13: {
        id: 'tile13',
        name: 'Granite Tile',
        texture: 'Tile/Tile_13-128x128',
        colors: {
            bg: '#212121', gridBg: '#111111', gridLines: '#333333',
            cellEmpty: 'rgba(51, 51, 51, 0.4)',
            textPrimary: '#f5f5f5', textSecondary: '#e0e0e0',
            hudBg: 'rgba(17, 17, 17, 0.85)', boardBorder: '#333333',
            shadow: 'rgba(0, 0, 0, 0.6)', glow: 'rgba(224, 224, 224, 0.5)',
            goldGlow: 'rgba(255, 215, 0, 0.85)', bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#9e9e9e', 2: '#e0e0e0', 3: '#bdbdbd', 4: '#757575',
            5: '#616161', 6: '#424242', 7: '#f5f5f5', 8: '#212121',
            9: '#9e9e9e', 10: '#e0e0e0', 11: '#bdbdbd', 12: '#424242',
            13: '#ffd700', 14: '#ff3300'
        },
        blockStyle: 'textured', particleStyle: 'shard',
        lineClearStyle: 'tile_break', boardClearStyle: 'stone_collapse'
    },
    tile15: {
        id: 'tile15',
        name: 'Slate Tile',
        texture: 'Tile/Tile_15-128x128',
        colors: {
            bg: '#2e3d52', gridBg: '#1c2633', gridLines: '#3d4f66',
            cellEmpty: 'rgba(61, 79, 102, 0.4)',
            textPrimary: '#eceff1', textSecondary: '#b0bec5',
            hudBg: 'rgba(28, 38, 51, 0.8)', boardBorder: '#3d4f66',
            shadow: 'rgba(0, 0, 0, 0.5)', glow: 'rgba(176, 190, 197, 0.5)',
            goldGlow: 'rgba(255, 215, 0, 0.85)', bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#78909c', 2: '#b0bec5', 3: '#4f5d75', 4: '#3d4f66',
            5: '#cfd8dc', 6: '#90a4ae', 7: '#2e3d52', 8: '#7dd3fc',
            9: '#78909c', 10: '#b0bec5', 11: '#4f5d75', 12: '#2e3d52',
            13: '#ffd700', 14: '#ff3300'
        },
        blockStyle: 'textured', particleStyle: 'shard',
        lineClearStyle: 'tile_break', boardClearStyle: 'stone_collapse'
    },
    tile17: {
        id: 'tile17',
        name: 'Tuscan Sun',
        texture: 'Tile/Tile_17-128x128',
        colors: {
            bg: '#5c4308', gridBg: '#382803', gridLines: '#73540a',
            cellEmpty: 'rgba(115, 84, 10, 0.4)',
            textPrimary: '#fff8e1', textSecondary: '#ffe082',
            hudBg: 'rgba(56, 40, 3, 0.8)', boardBorder: '#73540a',
            shadow: 'rgba(0, 0, 0, 0.5)', glow: 'rgba(255, 224, 130, 0.5)',
            goldGlow: 'rgba(255, 215, 0, 0.85)', bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#ffb300', 2: '#ffc107', 3: '#ff8f00', 4: '#ffa000',
            5: '#ffe082', 6: '#ffca28', 7: '#e65100', 8: '#fffde7',
            9: '#ffb300', 10: '#ffc107', 11: '#ff8f00', 12: '#e65100',
            13: '#ffd700', 14: '#ff3300'
        },
        blockStyle: 'textured', particleStyle: 'shard',
        lineClearStyle: 'tile_break', boardClearStyle: 'stone_collapse'
    },
    tile19: {
        id: 'tile19',
        name: 'Spanish Tile',
        texture: 'Tile/Tile_19-128x128',
        colors: {
            bg: '#3e1b0c', gridBg: '#240f05', gridLines: '#522410',
            cellEmpty: 'rgba(82, 36, 16, 0.4)',
            textPrimary: '#fbe9e7', textSecondary: '#ffab91',
            hudBg: 'rgba(36, 15, 5, 0.8)', boardBorder: '#522410',
            shadow: 'rgba(0, 0, 0, 0.5)', glow: 'rgba(255, 171, 145, 0.5)',
            goldGlow: 'rgba(255, 215, 0, 0.85)', bombGlow: 'rgba(255, 51, 0, 0.85)',
            1: '#ff7043', 2: '#00bcd4', 3: '#ff5722', 4: '#ffab91',
            5: '#00e5ff', 6: '#ff8a65', 7: '#bf360c', 8: '#e0f7fa',
            9: '#ff7043', 10: '#00bcd4', 11: '#ff5722', 12: '#bf360c',
            13: '#ffd700', 14: '#ff3300'
        },
        blockStyle: 'textured', particleStyle: 'shard',
        lineClearStyle: 'tile_break', boardClearStyle: 'stone_collapse'
    }
};

/**
 * Draws a stylized block cell onto the canvas.
 * Handles the custom aesthetic filters of each theme.
 * @param {CanvasRenderingContext2D} ctx - Drawing context.
 * @param {number} x - Target x coord.
 * @param {number} y - Target y coord.
 * @param {number} w - Block width.
 * @param {number} h - Block height.
 * @param {number} colorId - Color ID mapping.
 * @param {Object} theme - Active theme configuration object.
 */
export function drawThemeBlock(ctx, x, y, w, h, colorId, theme, cellR = 0, cellC = 0) {
    const color = theme.colors[colorId] || '#ffffff';
    const style = theme.blockStyle;
    const isTextured = style === 'textured';
    
    // Save drawing context state
    ctx.save();

    // Helpers to retrieve border radius and layout insets per style
    const getRadiusForStyle = (s, bw, bh) => {
        if (s === 'cushion')  return Math.min(bw, bh) * 0.14;
        if (s === 'neon')     return Math.min(bw, bh) * 0.15;
        if (s === 'wood')     return Math.min(bw, bh) * 0.12;
        if (s === 'gemstone') return Math.min(bw, bh) * 0.08;
        if (s === 'pastel')   return Math.min(bw, bh) * 0.22;
        return Math.min(bw, bh) * 0.12;
    };
    
    const getInsetForStyle = (s) => {
        if (s === 'textured') return 1.5;
        if (s === 'pastel')   return 2.5;
        if (s === 'gemstone') return 2;
        if (s === 'neon')     return 2;
        return 1.5;
    };

    // Helper: Rounded Rect
    const roundRect = (rx, ry, rw, rh, rad) => {
        ctx.beginPath();
        ctx.moveTo(rx + rad, ry);
        ctx.arcTo(rx + rw, ry, rx + rw, ry + rh, rad);
        ctx.arcTo(rx + rw, ry + rh, rx, ry + rh, rad);
        ctx.arcTo(rx, ry + rh, rx, ry, rad);
        ctx.arcTo(rx, ry, rx + rw, ry, rad);
        ctx.closePath();
    };

    if (style === 'cushion') {
        const radius = getRadiusForStyle(style, w, h);
        roundRect(x + 1.5, y + 1.5, w - 3, h - 3, radius);

        // Fill with linear gradient to give a 3D cushion roll
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, color);
        grad.addColorStop(1, darkenColor(color, -15));
        ctx.fillStyle = grad;
        ctx.fill();

        // Stroke dark outer border
        ctx.strokeStyle = darkenColor(color, -25);
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Inner raised cushion face
        const inset = w * 0.12;
        const innerW = w - inset * 2;
        const innerH = h - inset * 2;
        const innerRad = radius * 0.75;
        
        ctx.fillStyle = lightenColor(color, 18);
        roundRect(x + inset, y + inset, innerW, innerH, innerRad);
        ctx.fill();

        // Inner raised face stroke highlighting
        ctx.strokeStyle = lightenColor(color, 35);
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Small specular square highlight in top-left
        ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
        roundRect(x + inset + 1.5, y + inset + 1.5, innerW * 0.35, innerH * 0.35, innerRad * 0.5);
        ctx.fill();

        // WATERMELON SEEDS OR CHEESE HOLES DRAWING LOGIC
        if (theme.id === 'watermelon') {
            // Generate stable pseudo-random seed based on coordinates and colorId
            const blockSeed = Math.abs(Math.sin(cellR * 12.9898 + cellC * 78.233 + colorId * 437.123) * 43758.5453) % 1;
            
            // Draw seeds on ~60% of the blocks randomly
            if (blockSeed < 0.6) {
                // Determine how many seeds to draw (1 or 2)
                const numSeeds = blockSeed < 0.3 ? 1 : 2;
                
                ctx.fillStyle = '#141414'; // Dark black/brown seeds
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 1;
                
                for (let s = 0; s < numSeeds; s++) {
                    const seedOffset = (blockSeed * (s + 1) * 97.234) % 1;
                    
                    // Keep seeds inside the inner raised face bounds
                    const seedX = x + inset + innerW * 0.2 + (innerW * 0.6) * ((seedOffset * 13) % 1);
                    const seedY = y + inset + innerH * 0.2 + (innerH * 0.6) * ((seedOffset * 7) % 1);
                    
                    // Draw a small rotated elliptical seed shape
                    ctx.save();
                    ctx.translate(seedX, seedY);
                    ctx.rotate(((seedOffset * 360) * Math.PI) / 180);
                    
                    ctx.beginPath();
                    ctx.ellipse(0, 0, w * 0.05, w * 0.08, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                }
            }
        } else if (theme.id === 'cheese') {
            // Cheese holes drawing logic
            const blockSeed = Math.abs(Math.sin(cellR * 12.9898 + cellC * 78.233 + colorId * 437.123) * 43758.5453) % 1;
            
            // Draw cheese holes on ~80% of blocks
            if (blockSeed < 0.8) {
                const numHoles = blockSeed < 0.4 ? 1 : 2;
                for (let hIndex = 0; hIndex < numHoles; hIndex++) {
                    const holeOffset = (blockSeed * (hIndex + 1) * 83.743) % 1;
                    
                    // Position holes
                    const holeX = x + inset + innerW * 0.15 + (innerW * 0.7) * ((holeOffset * 17) % 1);
                    const holeY = y + inset + innerH * 0.15 + (innerH * 0.7) * ((holeOffset * 9) % 1);
                    
                    // Uneven hole sizes (radius from w*0.06 to w*0.14)
                    const radius = w * (0.06 + 0.08 * ((holeOffset * 3) % 1));
                    
                    // Draw hole with shadow to make it look "carved" into the cheese
                    ctx.save();
                    
                    // Clip to the inner card face to make sure holes don't bleed out
                    roundRect(x + inset, y + inset, innerW, innerH, innerRad);
                    ctx.clip();
                    
                    // Draw the hole background (slightly darkened color to look like a crater)
                    ctx.fillStyle = darkenColor(color, -20);
                    ctx.beginPath();
                    ctx.arc(holeX, holeY, radius, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Top-left dark inner shadow stroke
                    ctx.strokeStyle = darkenColor(color, -35);
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.arc(holeX, holeY, radius, Math.PI * 1.0, Math.PI * 1.8);
                    ctx.stroke();
                    
                    // Bottom-right light highlight stroke
                    ctx.strokeStyle = lightenColor(color, 25);
                    ctx.lineWidth = 1.0;
                    ctx.beginPath();
                    ctx.arc(holeX, holeY, radius, Math.PI * 0.0, Math.PI * 0.8);
                    ctx.stroke();
                    
                    ctx.restore();
                }
            }
        }

        // Target / Bomb decor
        if (colorId === 13) {
            // Gold cushion crown ring
            ctx.fillStyle = '#ffe57f';
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w * 0.16, 0, Math.PI * 2);
            ctx.fill();
        } else if (colorId === 14) {
            // White warning core
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w * 0.15, 0, Math.PI * 2);
            ctx.fill();
        }

    } else if (style === 'neon') {
        // Glowing Neon Style
        const radius = Math.min(w, h) * 0.15;
        roundRect(x + 2, y + 2, w - 4, h - 4, radius);
        
        ctx.fillStyle = hexToRgbA(color, 0.22);
        ctx.fill();
        
        // Draw the outer neon glow by stroking wider, semi-transparent paths (hardware-accelerated, zero CPU blur overhead)
        ctx.strokeStyle = hexToRgbA(color, 0.35);
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.strokeStyle = hexToRgbA(color, 0.15);
        ctx.lineWidth = 10;
        ctx.stroke();

        // Sharp inner neon core
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Inner highlight dot/ring
        if (colorId === 13) {
            // Gold Target: draw inner circle
            ctx.strokeStyle = hexToRgbA(color, 0.3);
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w * 0.22, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w * 0.22, 0, Math.PI * 2);
            ctx.stroke();
        } else if (colorId === 14) {
            // Bomb: inner pulse core
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w * 0.25, 0, Math.PI * 2);
            ctx.fillStyle = '#ffcc00';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

    } else if (style === 'wood') {
        // Wooden Carved Block
        const radius = Math.min(w, h) * 0.12;
        roundRect(x + 1.5, y + 1.5, w - 3, h - 3, radius);

        // Fill with wood grain gradient
        const grad = ctx.createLinearGradient(x, y, x + w, y + h);
        grad.addColorStop(0, color);
        grad.addColorStop(1, darkenColor(color, -20));
        ctx.fillStyle = grad;
        ctx.fill();

        // Draw inner wood bevel
        ctx.strokeStyle = lightenColor(color, 25);
        ctx.lineWidth = 1.5;
        roundRect(x + 3.5, y + 3.5, w - 7, h - 7, radius - 1);
        ctx.stroke();

        ctx.strokeStyle = darkenColor(color, -40);
        ctx.lineWidth = 2;
        roundRect(x + 1.5, y + 1.5, w - 3, h - 3, radius);
        ctx.stroke();

        // Draw wood grain lines (2 subtle curved diagonal lines)
        ctx.strokeStyle = hexToRgbA(darkenColor(color, -30), 0.35);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.15, y + h * 0.2);
        ctx.quadraticCurveTo(x + w * 0.5, y + h * 0.4, x + w * 0.85, y + h * 0.25);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + w * 0.2, y + h * 0.75);
        ctx.quadraticCurveTo(x + w * 0.55, y + h * 0.6, x + w * 0.9, y + h * 0.8);
        ctx.stroke();

        // Target / Bomb decals
        if (colorId === 13) {
            // Engraved concentric target
            ctx.strokeStyle = '#ffe27a';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w * 0.2, 0, Math.PI * 2);
            ctx.stroke();
        } else if (colorId === 14) {
            // Burning circular fuse core
            ctx.fillStyle = '#ff4d00';
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w * 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffd000';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

    } else if (style === 'gemstone') {
        // Faceted Gemstone Blitz
        const radius = Math.min(w, h) * 0.08;
        roundRect(x + 2, y + 2, w - 4, h - 4, radius);

        // Gradient base fill
        const grad = ctx.createLinearGradient(x + 2, y + 2, x + 2, y + h - 2);
        grad.addColorStop(0, lightenColor(color, 20));
        grad.addColorStop(0.5, color);
        grad.addColorStop(1, darkenColor(color, -25));
        ctx.fillStyle = grad;
        ctx.fill();

        // Draw crystal facet lines (diagonal cuts from corners to a smaller inner rectangle)
        const innerOffset = w * 0.2;
        const ix = x + innerOffset;
        const iy = y + innerOffset;
        const iw = w - innerOffset * 2;
        const ih = h - innerOffset * 2;

        ctx.strokeStyle = lightenColor(color, 45);
        ctx.lineWidth = 1;
        ctx.fillStyle = lightenColor(color, 12);
        ctx.fillRect(ix, iy, iw, ih);
        ctx.strokeRect(ix, iy, iw, ih);

        // Draw diagonals
        ctx.beginPath();
        // Top-left
        ctx.moveTo(x + 2, y + 2); ctx.lineTo(ix, iy);
        // Top-right
        ctx.moveTo(x + w - 2, y + 2); ctx.lineTo(ix + iw, iy);
        // Bottom-left
        ctx.moveTo(x + 2, y + h - 2); ctx.lineTo(ix, iy + ih);
        // Bottom-right
        ctx.moveTo(x + w - 2, y + h - 2); ctx.lineTo(ix + iw, iy + ih);
        ctx.stroke();

        // Specular glare reflection on top edge
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.moveTo(x + 3, y + 3);
        ctx.lineTo(x + w - 3, y + 3);
        ctx.lineTo(ix + iw - 1, iy - 1);
        ctx.lineTo(ix + 1, iy - 1);
        ctx.closePath();
        ctx.fill();

        // Outer border
        ctx.strokeStyle = darkenColor(color, -40);
        ctx.lineWidth = 1.5;
        roundRect(x + 2, y + 2, w - 4, h - 4, radius);
        ctx.stroke();

        // Highlight targets
        if (colorId === 13) {
            // Gold gemstone crown emblem
            ctx.strokeStyle = '#fff080';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + w * 0.35, y + h * 0.35, w * 0.3, h * 0.3);
            ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
            ctx.fillRect(x + w * 0.35, y + h * 0.35, w * 0.3, h * 0.3);
        } else if (colorId === 14) {
            // Red warning core
            ctx.fillStyle = '#ff003c';
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w * 0.18, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();
        }

    } else if (style === 'pastel') {
        // Matte Pastel style
        const radius = Math.min(w, h) * 0.22; // Very rounded
        roundRect(x + 2.5, y + 2.5, w - 5, h - 5, radius);

        ctx.fillStyle = color;
        ctx.fill();

        // Subtle soft shadow bezel
        ctx.strokeStyle = darkenColor(color, -10);
        ctx.lineWidth = 2.5;
        roundRect(x + 2.5, y + 2.5, w - 5, h - 5, radius);
        ctx.stroke();

        if (colorId === 13) {
            // Flat minimal target ring
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w * 0.18, 0, Math.PI * 2);
            ctx.stroke();
        } else if (colorId === 14) {
            // Pastel round bomb icon
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w * 0.22, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

    } else if (style === 'textured') {
        // Textured Block — texture image IS the block.
        // Nothing drawn here; the texture overlay section below handles everything.
    } else if (style === 'volcanic') {
        const radius = Math.min(w, h) * 0.12;
        roundRect(x + 1.5, y + 1.5, w - 3, h - 3, radius);

        // Fill with solid color gradient
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, color);
        grad.addColorStop(1, darkenColor(color, -25));
        ctx.fillStyle = grad;
        ctx.fill();

        // Outline is reddish/yellowish/orangeish (block color slightly lightened)
        ctx.strokeStyle = lightenColor(color, 25);
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Target / Bomb decals
        if (colorId === 13) {
            ctx.fillStyle = '#ffe57f';
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w * 0.16, 0, Math.PI * 2);
            ctx.fill();
        } else if (colorId === 14) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w * 0.15, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Texture overlay section — blends texture patterns. Supports smooth crossfading during transitions.
    const isTransitioning = theme.transitionProgress !== undefined && theme.transitionProgress < 1.0;

    if (isTransitioning) {
        const t = theme.transitionProgress;
        const fromTheme = THEMES[theme.prevThemeId] || THEMES['classic'] || Object.values(THEMES)[0];
        const toTheme = THEMES[theme.activeThemeId] || THEMES['classic'] || Object.values(THEMES)[0];
        
        const texFrom = texturePatterns.get(theme.prevThemeId);
        const texTo = texturePatterns.get(theme.activeThemeId);
        
        // Draw FROM theme texture (fading out)
        if (texFrom && texFrom.image) {
            ctx.save();
            const styleFrom = fromTheme.blockStyle;
            const isTexturedFrom = styleFrom === 'textured';
            const radiusFrom = getRadiusForStyle(styleFrom, w, h);
            const insetFrom = getInsetForStyle(styleFrom);
            
            ctx.globalAlpha = isTexturedFrom ? (1 - t) : (texFrom.alpha * (1 - t));
            
            roundRect(x + insetFrom, y + insetFrom, w - insetFrom * 2, h - insetFrom * 2, radiusFrom);
            ctx.clip();
            ctx.drawImage(texFrom.image, x + insetFrom, y + insetFrom, w - insetFrom * 2, h - insetFrom * 2);
            ctx.restore();
        }
        
        // Draw TO theme texture (fading in)
        if (texTo && texTo.image) {
            ctx.save();
            const styleTo = toTheme.blockStyle;
            const isTexturedTo = styleTo === 'textured';
            const radiusTo = getRadiusForStyle(styleTo, w, h);
            const insetTo = getInsetForStyle(styleTo);
            
            ctx.globalAlpha = isTexturedTo ? t : (texTo.alpha * t);
            
            roundRect(x + insetTo, y + insetTo, w - insetTo * 2, h - insetTo * 2, radiusTo);
            ctx.clip();
            ctx.drawImage(texTo.image, x + insetTo, y + insetTo, w - insetTo * 2, h - insetTo * 2);
            ctx.restore();
        }
    } else {
        const texEntry = texturePatterns.get(theme.id);
        if (texEntry && texEntry.image) {
            const radius = getRadiusForStyle(style, w, h);
            const inset = getInsetForStyle(style);
            
            ctx.save();
            if (!isTextured) ctx.globalAlpha = texEntry.alpha;
            
            roundRect(x + inset, y + inset, w - inset * 2, h - inset * 2, radius);
            ctx.clip();
            ctx.drawImage(texEntry.image, x + inset, y + inset, w - inset * 2, h - inset * 2);
            ctx.restore();
        }
    }

    // For textured blocks: draw border + markers ON TOP of the texture
    if (isTextured) {
        ctx.save(); // isolate border drawing so it respects parent alpha
        const r = Math.min(w, h) * 0.12;

        // Dark cell-separation border (softened for drag preview readability)
        roundRect(x + 1.5, y + 1.5, w - 3, h - 3, r);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Target spot marker (gold ring)
        if (colorId === 13) {
            ctx.beginPath();
            ctx.arc(x + w / 2, y + h / 2, w * 0.22, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 215, 0, 0.45)';
            ctx.fill();
            ctx.strokeStyle = '#ffe57f';
            ctx.lineWidth = 2.5;
            ctx.stroke();

        // Bomb marker (red circle)
        } else if (colorId === 14) {
            ctx.beginPath();
            ctx.arc(x + w / 2, y + h / 2, w * 0.22, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 51, 0, 0.85)';
            ctx.fill();
            ctx.strokeStyle = '#ffcc00';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.restore();
    }

    ctx.restore();
}

const colorCache = new Map();
const rgbaCache = new Map();

/**
 * Converts Hex string to RGBA with alpha (cached version).
 */
function hexToRgbA(hex, alpha = 1) {
    const key = `${hex}_${alpha}`;
    let cached = rgbaCache.get(key);
    if (!cached) {
        cached = hexToRgbAUncached(hex, alpha);
        rgbaCache.set(key, cached);
    }
    return cached;
}

function hexToRgbAUncached(hex, alpha = 1) {
    if (!hex) return 'rgba(255, 255, 255, 1)';
    hex = hex.trim();
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        let c = hex.substring(1).split('');
        if(c.length === 3){
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
    } else if (hex.startsWith('rgba') || hex.startsWith('rgb')) {
        const parts = hex.match(/[\d.]+/g);
        if (parts && parts.length >= 3) {
            return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
        }
    }
    return hex;
}

/**
 * Returns a lighter shade of a color (supports HEX and RGB/RGBA) (cached version).
 */
export function lightenColor(colorStr, percent) {
    const key = `${colorStr}_${percent}`;
    let cached = colorCache.get(key);
    if (!cached) {
        cached = lightenColorUncached(colorStr, percent);
        colorCache.set(key, cached);
    }
    return cached;
}

function lightenColorUncached(colorStr, percent) {
    if (!colorStr) return '#ffffff';
    colorStr = colorStr.trim();
    
    let r, g, b, a = 1;
    if (colorStr.startsWith('#')) {
        let hex = colorStr.replace('#', '');
        if (hex.length === 3) {
            hex = hex.split('').map(x => x + x).join('');
        }
        const num = parseInt(hex, 16);
        r = num >> 16;
        g = (num >> 8) & 255;
        b = num & 255;
    } else if (colorStr.startsWith('rgba') || colorStr.startsWith('rgb')) {
        const parts = colorStr.match(/[\d.]+/g);
        if (parts) {
            r = parseInt(parts[0], 10);
            g = parseInt(parts[1], 10);
            b = parseInt(parts[2], 10);
            a = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
        } else {
            return colorStr;
        }
    } else {
        return colorStr;
    }

    const amt = Math.round(2.55 * percent);
    r = Math.min(255, Math.max(0, r + amt));
    g = Math.min(255, Math.max(0, g + amt));
    b = Math.min(255, Math.max(0, b + amt));

    if (colorStr.startsWith('#')) {
        return "#" + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
    } else {
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
}

/**
 * Returns a darker shade of a color (supports HEX and RGB/RGBA).
 */
export function darkenColor(hex, percent) {
    return lightenColor(hex, percent);
}
