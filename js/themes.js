/**
 * Gridly - Visual Themes configurations
 * Contains HSL colors mapping, layout themes, and graphics directives for the Canvas renderer.
 */

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
        particleStyle: 'sparkles'
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
        particleStyle: 'glitch'
    },
    wood: {
        id: 'wood',
        name: 'Woodland Classic',
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
        particleStyle: 'leaves'
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
        particleStyle: 'sparkles'
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
        particleStyle: 'bubbles'
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
        particleStyle: 'sparkles'
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
            13: '#ffd700', 14: '#ff3300'
        },
        blockStyle: 'cushion',
        particleStyle: 'sparkles'
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
        particleStyle: 'bubbles'
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
        particleStyle: 'bubbles'
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
        particleStyle: 'glitch'
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
export function drawThemeBlock(ctx, x, y, w, h, colorId, theme) {
    const color = theme.colors[colorId] || '#ffffff';
    const style = theme.blockStyle;
    
    // Save drawing context state
    ctx.save();

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
        const radius = Math.min(w, h) * 0.14;
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
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.stroke();

        // Inner highlight dot/ring
        if (colorId === 13) {
            // Gold Target: draw inner circle
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w * 0.22, 0, Math.PI * 2);
            ctx.stroke();
        } else if (colorId === 14) {
            // Bomb: inner pulse core
            ctx.shadowColor = theme.colors.bombGlow;
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, w * 0.25, 0, Math.PI * 2);
            ctx.fillStyle = '#ffcc00';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
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
    }

    ctx.restore();
}

/**
 * Converts Hex string to RGBA with alpha.
 */
function hexToRgbA(hex, alpha = 1) {
    let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length === 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x' + c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
    }
    return hex;
}

/**
 * Returns a lighter shade of a hex color.
 */
function lightenColor(hex, percent) {
    const num = parseInt(hex.replace("#",""), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<0?0:R:255)*0x10000 + (G<255?G<0?0:G:255)*0x100 + (B<255?B<0?0:B:255)).toString(16).slice(1);
}

/**
 * Returns a darker shade of a hex color.
 */
function darkenColor(hex, percent) {
    return lightenColor(hex, percent);
}
