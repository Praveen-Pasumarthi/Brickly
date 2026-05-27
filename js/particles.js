/**
 * Gridly - Particle System & Visual Juice Engine
 * Renders particle bursts, floating reward text, and screen shake multipliers
 * directly onto the active gameplay canvas.
 */

export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.texts = [];
        
        // Screen Shake state
        this.shakeTime = 0;
        this.shakeIntensity = 0;
        this.shakeX = 0;
        this.shakeY = 0;
    }

    /**
     * Triggers a screen shake of designated duration and intensity.
     * @param {number} duration - Count of update ticks.
     * @param {number} intensity - Max offset range in pixels.
     */
    triggerShake(duration = 15, intensity = 6) {
        this.shakeTime = duration;
        this.shakeIntensity = intensity;
    }

    /**
     * Registers a new floating reward text.
     * @param {string} text - Message (e.g. "+36 Combo!")
     * @param {number} x - Center X coordinate.
     * @param {number} y - Center Y coordinate.
     * @param {string} color - Text color.
     * @param {number} scale - Font multiplier.
     */
    addFloatingText(text, x, y, color = '#ffffff', scale = 1.0) {
        this.texts.push({
            text,
            x,
            y,
            color,
            scale,
            alpha: 1.0,
            vy: -1.8, // Float upwards
            life: 1.0,
            decay: 0.02
        });
    }

    /**
     * Spawns a cluster of particles at a designated grid tile.
     */
    spawnTileClearParticles(x, y, tileSize, theme) {
        const type = theme.particleStyle;
        const count = type === 'glitch' ? 12 : type === 'leaves' ? 8 : 10;
        const colors = [theme.colors[1], theme.colors[2], theme.colors[3], theme.colors[4]];

        for (let i = 0; i < count; i++) {
            const px = x + tileSize / 2 + (Math.random() - 0.5) * (tileSize * 0.8);
            const py = y + tileSize / 2 + (Math.random() - 0.5) * (tileSize * 0.8);
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // Random direction
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 3.5;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            this.particles.push({
                x: px,
                y: py,
                vx,
                vy,
                color,
                alpha: 1.0,
                life: 1.0,
                decay: 0.015 + Math.random() * 0.02,
                size: 3 + Math.random() * 6,
                type,
                rotation: Math.random() * Math.PI,
                rotSpeed: (Math.random() - 0.5) * 0.15,
                gravity: type === 'leaves' ? 0.04 : type === 'sparkles' ? 0.12 : 0
            });
        }
    }

    /**
     * Spawns particle bursts along intersecting lines.
     * @param {Array<number>} rows - Cleared row indices.
     * @param {Array<number>} cols - Cleared col indices.
     * @param {Object} boardLayout - Holds grid coordinates { x, y, width, height, cellSize }
     * @param {Object} theme - Selected theme.
     */
    spawnLineClearParticles(rows, cols, boardLayout, theme) {
        const { x: boardX, y: boardY, cellSize, cols: layoutCols = 8, rows: layoutRows = 8 } = boardLayout;
        
        // Screen shake intensity increases with line clears
        const linesCount = rows.length + cols.length;
        if (linesCount > 1) {
            this.triggerShake(12 + linesCount * 4, 3 + linesCount * 2.5);
        }

        // Spawn particles along full rows
        rows.forEach(r => {
            const cy = boardY + r * cellSize;
            for (let c = 0; c < layoutCols; c++) {
                const cx = boardX + c * cellSize;
                this.spawnTileClearParticles(cx, cy, cellSize, theme);
            }
        });

        // Spawn particles along full columns
        cols.forEach(c => {
            const cx = boardX + c * cellSize;
            for (let r = 0; r < layoutRows; r++) {
                const cy = boardY + r * cellSize;
                // Avoid double spawning at row/column intersections
                if (!rows.includes(r)) {
                    this.spawnTileClearParticles(cx, cy, cellSize, theme);
                }
            }
        });
    }

    /**
     * Spawns subtle drop particles when a block is placed.
     */
    spawnPlacementParticles(r, c, shapeMatrix, boardLayout, theme) {
        const { x: boardX, y: boardY, cellSize } = boardLayout;
        const color = theme.colors[1] || '#ffffff';

        for (let row = 0; row < shapeMatrix.length; row++) {
            for (let col = 0; col < shapeMatrix[row].length; col++) {
                if (shapeMatrix[row][col] > 0) {
                    const cx = boardX + (c + col) * cellSize;
                    const cy = boardY + (r + row) * cellSize;

                    // Spawn 6 small particles around block perimeter
                    for (let i = 0; i < 6; i++) {
                        const px = cx + cellSize/2 + (Math.random() - 0.5) * cellSize;
                        const py = cy + cellSize - 2; // spawn at bottom base

                        this.particles.push({
                            x: px,
                            y: py,
                            vx: (Math.random() - 0.5) * 1.5,
                            vy: -0.5 - Math.random() * 1.5,
                            color,
                            alpha: 0.8,
                            life: 1.0,
                            decay: 0.04 + Math.random() * 0.03,
                            size: 2 + Math.random() * 3,
                            type: theme.particleStyle,
                            rotation: 0,
                            rotSpeed: 0,
                            gravity: 0.08
                        });
                    }
                }
            }
        }
    }

    /**
     * Updates physics properties for all particles, floating texts, and screen shake.
     */
    update() {
        // 1. Update Screen Shake
        if (this.shakeTime > 0) {
            this.shakeX = (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeY = (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeTime--;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }

        // 2. Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            if (p.gravity) {
                p.vy += p.gravity;
            }
            p.rotation += p.rotSpeed;
            p.life -= p.decay;
            p.alpha = Math.max(0, p.life);

            // Filter out dead particles
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // 3. Update Floating Reward Texts
        for (let i = this.texts.length - 1; i >= 0; i--) {
            const t = this.texts[i];
            t.y += t.vy;
            t.vy *= 0.98; // Dampen rising speed
            t.life -= t.decay;
            t.alpha = Math.max(0, t.life);

            if (t.life <= 0) {
                this.texts.splice(i, 1);
            }
        }
    }

    /**
     * Draws particles and floating texts onto the canvas context.
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        ctx.save();
        
        // Draw Particles
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);

            if (p.type === 'glitch') {
                // Neon Glitch Rects
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                
                // Horizontal glitch line offsets
                if (Math.random() > 0.8) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(-p.size, -p.size / 6, p.size * 2, p.size / 3);
                }
            } else if (p.type === 'leaves') {
                // Woodland leaf shape
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.moveTo(0, -p.size);
                ctx.quadraticCurveTo(p.size * 0.5, -p.size * 0.5, 0, p.size);
                ctx.quadraticCurveTo(-p.size * 0.5, -p.size * 0.5, 0, -p.size);
                ctx.closePath();
                ctx.fill();
            } else if (p.type === 'sparkles') {
                // Gemstone sparkling diamond
                ctx.fillStyle = '#ffffff'; // Twinkle core
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 1;
                
                ctx.beginPath();
                ctx.moveTo(0, -p.size);
                ctx.lineTo(p.size * 0.6, 0);
                ctx.lineTo(0, p.size);
                ctx.lineTo(-p.size * 0.6, 0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (p.type === 'bubbles') {
                // Pastel round fading circles
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(0, 0, p.size * 0.7, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        });

        // Draw Floating Reward Texts
        this.texts.forEach(t => {
            ctx.save();
            ctx.globalAlpha = t.alpha;
            
            if (t.text === 'Perfect!' || t.text === 'Excellent!') {
                // Gold Sunblast behind text
                const radius = 90 * t.scale;
                const radialGrad = ctx.createRadialGradient(t.x, t.y, 5, t.x, t.y, radius);
                radialGrad.addColorStop(0, 'rgba(255, 177, 66, 0.85)');
                radialGrad.addColorStop(0.4, 'rgba(255, 71, 87, 0.45)');
                radialGrad.addColorStop(1, 'rgba(255, 71, 87, 0)');
                ctx.fillStyle = radialGrad;
                ctx.beginPath();
                ctx.arc(t.x, t.y, radius, 0, Math.PI * 2);
                ctx.fill();

                // Stylized outline text
                const textSize = Math.round(38 * t.scale);
                ctx.font = `extrabold ${textSize}px 'Outfit', 'Inter', system-ui, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Shadow
                ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetY = 4;

                // White stroke outline
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 8;
                ctx.strokeText(t.text, t.x, t.y);

                // Orange-red to gold linear gradient fill
                const textGrad = ctx.createLinearGradient(t.x, t.y - textSize/2, t.x, t.y + textSize/2);
                textGrad.addColorStop(0, '#ffd32a');
                textGrad.addColorStop(1, '#ff4757');
                ctx.fillStyle = textGrad;
                ctx.fillText(t.text, t.x, t.y);
            } else {
                // Normal score/combo text popups
                ctx.fillStyle = t.color;
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 6;
                
                const size = Math.round(20 * t.scale);
                ctx.font = `bold ${size}px 'Outfit', 'Inter', system-ui, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                ctx.fillText(t.text, t.x, t.y);
            }
            ctx.restore();
        });

        ctx.restore();
    }
}
