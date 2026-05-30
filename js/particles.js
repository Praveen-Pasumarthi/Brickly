/**
 * Brickly - Particle System & Visual Juice Engine
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
            vy: -0.9, // Float upwards
            life: 1.0,
            decay: 0.012 // Faster decay - text fades quickly (~1.2 seconds)
        });
    }

    /**
     * Spawns a cluster of particles at a designated grid tile.
     */
    spawnTileClearParticles(x, y, tileSize, theme) {
        const type = theme.particleStyle;
        const colors = [theme.colors[1], theme.colors[2], theme.colors[3], theme.colors[4]];

        // Per-type particle configs: { count, gravity, speed, decay, rotSpeed, sizeRange }
        const configs = {
            sparkles:  { count: 10, gravity: 0.12, speed: 3.5, decay: 0.018, rotSpeed: 0.15, sizeMin: 3, sizeMax: 8 },
            glitch:    { count: 12, gravity: 0,    speed: 2.5, decay: 0.014, rotSpeed: 0.08, sizeMin: 3, sizeMax: 7 },
            leaves:    { count: 8,  gravity: 0.04, speed: 2.0, decay: 0.012, rotSpeed: 0.10, sizeMin: 4, sizeMax: 9 },
            bubbles:   { count: 10, gravity: -0.02,speed: 2.0, decay: 0.012, rotSpeed: 0.05, sizeMin: 3, sizeMax: 7 },
            star:      { count: 11, gravity: 0.06, speed: 3.0, decay: 0.016, rotSpeed: 0.18, sizeMin: 3, sizeMax: 8 },
            petal:     { count: 9,  gravity: 0.03, speed: 2.2, decay: 0.011, rotSpeed: 0.12, sizeMin: 4, sizeMax: 9 },
            snowflake: { count: 13, gravity: 0.02, speed: 1.8, decay: 0.010, rotSpeed: 0.06, sizeMin: 3, sizeMax: 7 },
            ember:     { count: 14, gravity: -0.06,speed: 3.0, decay: 0.020, rotSpeed: 0.20, sizeMin: 2, sizeMax: 6 },
            sprinkle:  { count: 15, gravity: 0.08, speed: 3.5, decay: 0.018, rotSpeed: 0.25, sizeMin: 2, sizeMax: 5 },
            yarn:      { count: 8,  gravity: -0.01,speed: 1.5, decay: 0.010, rotSpeed: 0.08, sizeMin: 4, sizeMax: 8 },
            shard:     { count: 11, gravity: 0.10, speed: 3.8, decay: 0.017, rotSpeed: 0.22, sizeMin: 3, sizeMax: 7 },
            ribbon:    { count: 9,  gravity: -0.01,speed: 2.0, decay: 0.011, rotSpeed: 0.10, sizeMin: 5, sizeMax: 10 },
            seed:      { count: 10, gravity: 0.14, speed: 2.8, decay: 0.016, rotSpeed: 0.12, sizeMin: 2, sizeMax: 4 },
            crumb:     { count: 10, gravity: 0.10, speed: 2.5, decay: 0.015, rotSpeed: 0.14, sizeMin: 2, sizeMax: 5 },
            brick_chunk:  { count: 8,  gravity: 0.20, speed: 4.0, decay: 0.022, rotSpeed: 0.30, sizeMin: 3, sizeMax: 6 },
            fabric_strip: { count: 6,  gravity: 0.01, speed: 2.0, decay: 0.012, rotSpeed: 0.08, sizeMin: 5, sizeMax: 12 },
            thread_seg:   { count: 10, gravity: -0.01,speed: 1.8, decay: 0.011, rotSpeed: 0.15, sizeMin: 4, sizeMax: 8 },
            crack_line:   { count: 5,  gravity: 0,    speed: 0.5, decay: 0.015, rotSpeed: 0.05, sizeMin: 6, sizeMax: 14 },
            dust_cloud:   { count: 12, gravity: -0.03,speed: 1.2, decay: 0.010, rotSpeed: 0.03, sizeMin: 5, sizeMax: 10 },
            molten_drop:  { count: 10, gravity: 0.18, speed: 3.0, decay: 0.018, rotSpeed: 0.12, sizeMin: 2, sizeMax: 5 },
            splinter:     { count: 8,  gravity: 0.15, speed: 3.5, decay: 0.020, rotSpeed: 0.25, sizeMin: 3, sizeMax: 7 }
        };

        const cfg = configs[type] || configs.sparkles;

        for (let i = 0; i < cfg.count; i++) {
            const px = x + tileSize / 2 + (Math.random() - 0.5) * (tileSize * 0.8);
            const py = y + tileSize / 2 + (Math.random() - 0.5) * (tileSize * 0.8);
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            const angle = Math.random() * Math.PI * 2;
            const speed = (cfg.speed * 0.4) + Math.random() * cfg.speed;
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
                decay: cfg.decay + Math.random() * 0.008,
                size: cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin),
                type,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * cfg.rotSpeed,
                gravity: cfg.gravity
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
     * Spawns theme-specific line clear particles.
     */
    spawnLineClearEffect(rows, cols, boardLayout, theme) {
        const style = theme.lineClearStyle;
        const { x: boardX, y: boardY, cellSize, cols: layoutCols = 8, rows: layoutRows = 8 } = boardLayout;

        // Screen shake intensity increases with line clears
        const linesCount = rows.length + cols.length;
        if (linesCount > 1) {
            this.triggerShake(12 + linesCount * 4, 3 + linesCount * 2.5);
        }

        // Create a temporary theme override for particle spawning
        const effectTheme = { ...theme };

        // Override particleStyle based on lineClearStyle
        const styleToParticle = {
            'puff': 'bubbles',
            'glitch_zap': 'glitch',
            'splinter': 'splinter',
            'shatter': 'shard',
            'pop': 'bubbles',
            'starpulse': 'star',
            'petalfall': 'petal',
            'flakefall': 'snowflake',
            'bubblerise': 'bubbles',
            'ribbonflow': 'ribbon',
            'seedburst': 'seed',
            'crumble': 'crumb',
            'unravel': 'yarn',
            'dustcrack': 'crack_line',
            'ember_rise': 'ember',
            'sprinkle_burst': 'sprinkle'
        };

        effectTheme.particleStyle = styleToParticle[style] || theme.particleStyle;

        // Spawn particles along cleared rows/cols using the override style
        rows.forEach(r => {
            const cy = boardY + r * cellSize;
            for (let c = 0; c < layoutCols; c++) {
                const cx = boardX + c * cellSize;
                this.spawnTileClearParticles(cx, cy, cellSize, effectTheme);
            }
        });
        cols.forEach(c => {
            const cx = boardX + c * cellSize;
            for (let r = 0; r < layoutRows; r++) {
                const cy = boardY + r * cellSize;
                if (!rows.includes(r)) {
                    this.spawnTileClearParticles(cx, cy, cellSize, effectTheme);
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
            } else if (p.type === 'star') {
                // Five-pointed star
                ctx.fillStyle = p.color;
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                    const r = i === 0 ? p.size : p.size;
                    const method = i === 0 ? 'moveTo' : 'lineTo';
                    ctx[method](Math.cos(angle) * r, Math.sin(angle) * r);
                    const innerAngle = angle + (2 * Math.PI) / 10;
                    ctx.lineTo(Math.cos(innerAngle) * p.size * 0.4, Math.sin(innerAngle) * p.size * 0.4);
                }
                ctx.closePath();
                ctx.fill();
                // White twinkle center
                ctx.fillStyle = 'rgba(255,255,255,0.6)';
                ctx.beginPath();
                ctx.arc(0, 0, p.size * 0.2, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'petal') {
                // Flower petal — elongated oval with pointed tip
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.moveTo(0, -p.size);
                ctx.bezierCurveTo(p.size * 0.6, -p.size * 0.6, p.size * 0.5, p.size * 0.5, 0, p.size);
                ctx.bezierCurveTo(-p.size * 0.5, p.size * 0.5, -p.size * 0.6, -p.size * 0.6, 0, -p.size);
                ctx.closePath();
                ctx.fill();
                // Subtle vein line
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(0, -p.size * 0.8);
                ctx.lineTo(0, p.size * 0.8);
                ctx.stroke();
            } else if (p.type === 'snowflake') {
                // Six-armed snowflake
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 1.2;
                ctx.lineCap = 'round';
                const arms = 6;
                const armLen = p.size * 0.8;
                for (let i = 0; i < arms; i++) {
                    const a = (i * Math.PI * 2) / arms;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    const ex = Math.cos(a) * armLen;
                    const ey = Math.sin(a) * armLen;
                    ctx.lineTo(ex, ey);
                    // Small branch at 60% of arm
                    const bx = Math.cos(a) * armLen * 0.6;
                    const by = Math.sin(a) * armLen * 0.6;
                    const ba1 = a + Math.PI / 6;
                    const ba2 = a - Math.PI / 6;
                    ctx.moveTo(bx, by);
                    ctx.lineTo(bx + Math.cos(ba1) * armLen * 0.3, by + Math.sin(ba1) * armLen * 0.3);
                    ctx.moveTo(bx, by);
                    ctx.lineTo(bx + Math.cos(ba2) * armLen * 0.3, by + Math.sin(ba2) * armLen * 0.3);
                    ctx.stroke();
                }
                // White center dot
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'ember') {
                // Glowing ember — radial gradient circle
                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.3, p.color);
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'sprinkle') {
                // Candy sprinkle — small rounded bar
                const w = p.size * 1.8;
                const h = p.size * 0.5;
                const r = h / 2;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.moveTo(-w / 2 + r, -h / 2);
                ctx.lineTo(w / 2 - r, -h / 2);
                ctx.arc(w / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2);
                ctx.lineTo(-w / 2 + r, h / 2);
                ctx.arc(-w / 2 + r, 0, r, Math.PI / 2, -Math.PI / 2);
                ctx.closePath();
                ctx.fill();
            } else if (p.type === 'yarn') {
                // Yarn loop — open circle with a trailing tail
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 1.6);
                ctx.stroke();
                // Small trailing tail
                const tailAngle = Math.PI * 1.6;
                ctx.beginPath();
                ctx.moveTo(Math.cos(tailAngle) * p.size * 0.6, Math.sin(tailAngle) * p.size * 0.6);
                ctx.quadraticCurveTo(
                    p.size * 0.3, p.size * 0.4,
                    p.size * 0.1, p.size * 0.7
                );
                ctx.stroke();
            } else if (p.type === 'ribbon') {
                // Aurora ribbon — wavy flowing shape
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 2.5;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(-p.size, 0);
                ctx.bezierCurveTo(
                    -p.size * 0.3, -p.size * 0.6,
                    p.size * 0.3, p.size * 0.6,
                    p.size, 0
                );
                ctx.stroke();
                // Soft glow behind
                ctx.strokeStyle = p.color;
                ctx.globalAlpha = p.alpha * 0.3;
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(-p.size, 0);
                ctx.bezierCurveTo(
                    -p.size * 0.3, -p.size * 0.6,
                    p.size * 0.3, p.size * 0.6,
                    p.size, 0
                );
                ctx.stroke();
            } else if (p.type === 'seed') {
                // Watermelon seed — small teardrop
                ctx.fillStyle = '#1a1a1a';
                ctx.beginPath();
                ctx.moveTo(0, -p.size * 0.8);
                ctx.bezierCurveTo(p.size * 0.4, -p.size * 0.3, p.size * 0.3, p.size * 0.4, 0, p.size * 0.8);
                ctx.bezierCurveTo(-p.size * 0.3, p.size * 0.4, -p.size * 0.4, -p.size * 0.3, 0, -p.size * 0.8);
                ctx.closePath();
                ctx.fill();
                // Glossy highlight
                ctx.fillStyle = 'rgba(255,255,255,0.25)';
                ctx.beginPath();
                ctx.ellipse(-p.size * 0.08, -p.size * 0.2, p.size * 0.1, p.size * 0.3, -0.3, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'crumb') {
                // Cheese crumb — irregular polygon
                ctx.fillStyle = p.color;
                ctx.beginPath();
                const sides = 5 + Math.floor(Math.random() * 2);
                for (let i = 0; i < sides; i++) {
                    const a = (i / sides) * Math.PI * 2;
                    const r = p.size * (0.5 + Math.random() * 0.3);
                    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
                    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                }
                ctx.closePath();
                ctx.fill();
            } else if (p.type === 'shard') {
                // Shattered gemstone/glass shard — sharp irregular triangle
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.moveTo(0, -p.size);
                ctx.lineTo(p.size * 0.8, p.size * 0.4);
                ctx.lineTo(-p.size * 0.5, p.size * 0.7);
                ctx.closePath();
                ctx.fill();
                // Specular bright edge to make it look like broken glass
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(0, -p.size);
                ctx.lineTo(p.size * 0.8, p.size * 0.4);
                ctx.stroke();
            } else if (p.type === 'brick_chunk') {
                // Small rectangular brick fragment
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
                ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
            } else if (p.type === 'fabric_strip') {
                // Long thin wavy fabric strip
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(-p.size, 0);
                ctx.bezierCurveTo(-p.size * 0.3, -p.size * 0.4, p.size * 0.3, p.size * 0.4, p.size, 0);
                ctx.stroke();
            } else if (p.type === 'thread_seg') {
                // Thin curling thread segment
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 1.5;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 1.5);
                ctx.stroke();
                // Trailing loose end
                const endA = Math.PI * 1.5;
                ctx.beginPath();
                ctx.moveTo(Math.cos(endA) * p.size * 0.5, Math.sin(endA) * p.size * 0.5);
                ctx.lineTo(p.size * 0.2, p.size * 0.6);
                ctx.stroke();
            } else if (p.type === 'crack_line') {
                // Jagged lightning/crack path
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 1.5;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(-p.size, 0);
                for (let i = 0; i < 4; i++) {
                    const px = -p.size + (p.size * 2 * (i + 1) / 4);
                    const py = (Math.random() - 0.5) * p.size * 0.6;
                    ctx.lineTo(px, py);
                }
                ctx.stroke();
            } else if (p.type === 'dust_cloud') {
                ctx.globalAlpha = p.alpha * 0.4;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = p.alpha;
            } else if (p.type === 'molten_drop') {
                // Teardrop molten lava shape
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.moveTo(0, -p.size * 0.8);
                ctx.bezierCurveTo(p.size * 0.4, -p.size * 0.2, p.size * 0.3, p.size * 0.4, 0, p.size * 0.8);
                ctx.bezierCurveTo(-p.size * 0.3, p.size * 0.4, -p.size * 0.4, -p.size * 0.2, 0, -p.size * 0.8);
                ctx.closePath();
                ctx.fill();
                // Hot core
                ctx.fillStyle = 'rgba(255, 255, 100, 0.5)';
                ctx.beginPath();
                ctx.arc(0, 0, p.size * 0.2, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'splinter') {
                // Elongated wood splinter trapezoid
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.moveTo(-p.size * 0.3, -p.size);
                ctx.lineTo(p.size * 0.3, -p.size);
                ctx.lineTo(p.size * 0.15, p.size);
                ctx.lineTo(-p.size * 0.15, p.size);
                ctx.closePath();
                ctx.fill();
            }

            ctx.restore();
        });

        // Draw Floating Reward Texts
        this.texts.forEach(t => {
            ctx.save();
            ctx.globalAlpha = t.alpha;
            
            const upperText = t.text.toUpperCase();
            if (['GOOD!', 'GREAT!', 'EXCELLENT!', 'WONDERFUL!', 'AMAZING!', 'FANTASTIC!', 'PERFECT!', 'MARVELOUS!', 'UNBELIEVABLE!'].includes(upperText)) {
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
                ctx.font = `900 ${textSize}px 'Outfit', 'Inter', system-ui, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // White stroke outline with flat black shadow drawn manually underneath (fast)
                ctx.lineWidth = 8;
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.strokeText(t.text, t.x + 2, t.y + 3);

                ctx.strokeStyle = '#ffffff';
                ctx.strokeText(t.text, t.x, t.y);

                // Orange-red to gold linear gradient fill
                const textGrad = ctx.createLinearGradient(t.x, t.y - textSize/2, t.x, t.y + textSize/2);
                textGrad.addColorStop(0, '#ffd32a');
                textGrad.addColorStop(1, '#ff4757');
                ctx.fillStyle = textGrad;
                ctx.fillText(t.text, t.x, t.y);
            } else {
                // Normal score/combo text popups
                const size = Math.round(16 * t.scale);
                ctx.font = `bold ${size}px 'Outfit', 'Inter', system-ui, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Draw manual flat drop shadow offset
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillText(t.text, t.x + 1.5, t.y + 1.5);

                ctx.fillStyle = t.color;
                ctx.fillText(t.text, t.x, t.y);
            }
            ctx.restore();
        });

        ctx.restore();
    }
}
