/**
 * Gridly - Web Audio API Synthesis Engine
 * Synthesizes clean, latency-free haptic-like sound effects (SFX) directly
 * inside the client browser context, removing large file asset downloads.
 */

export class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.bgmEnabled = true;
        this.musicGain = null;
        this.musicTimer = null;
        this.musicStep = 0;
        this.nextNoteTime = 0;   // Audio-context-clock time of the next note to schedule
        // Master gain node — all SFX route through this so volume is consistent
        this.masterGain = null;
    }

    /**
     * Lazy initializes the AudioContext upon user gesture.
     */
    init() {
        if (this.ctx) return;
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextClass();

            // Master gain bus — all SFX route through here for unified volume control
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 2.5; // Boosted for phone speaker audibility
            this.masterGain.connect(this.ctx.destination);
        } catch (e) {
            console.warn("Web Audio API is not supported on this platform:", e);
        }
    }

    /**
     * Resumes AudioContext if suspended (mobile browsers auto-suspend by default).
     */
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    unlock() {
        this.init();
        this.resume();
        this.startBgm();
    }

    setSfxEnabled(enabled) {
        this.enabled = enabled;
    }

    setBgmEnabled(enabled) {
        this.bgmEnabled = enabled;
        if (enabled) {
            this.startBgm();
        } else {
            this.stopBgm();
        }
    }

    startBgm() {
        if (!this.bgmEnabled || this.musicTimer) return;
        this.init();
        this.resume();
        if (!this.ctx) return;

        if (!this.musicGain) {
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.28;
            this.musicGain.connect(this.ctx.destination);
        }

        const notes    = [196, 246.94, 293.66, 369.99, 329.63, 246.94, 220, 293.66];
        const DURATION = 0.78;   // seconds each note sounds for
        const SPACING  = 0.76;   // seconds between note start times (slight overlap = smooth crossfade)
        const LOOKAHEAD = 0.10;  // schedule notes up to 100 ms ahead of playback time

        // Seed the scheduler time to now so the first note plays immediately
        this.nextNoteTime = this.ctx.currentTime;

        const scheduleNotes = () => {
            if (!this.bgmEnabled || !this.ctx || !this.musicGain) return;

            // Keep scheduling notes that fall within the next LOOKAHEAD window
            while (this.nextNoteTime < this.ctx.currentTime + LOOKAHEAD) {
                const freq     = notes[this.musicStep % notes.length];
                const playTime = this.nextNoteTime;

                const osc  = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, playTime);

                // Smooth attack + decay — fade fully to silence 60 ms before the note ends
                // so there is NEVER an abrupt cut that causes a click
                gain.gain.setValueAtTime(0.0001, playTime);
                gain.gain.exponentialRampToValueAtTime(0.85, playTime + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.0001, playTime + DURATION - 0.06);

                osc.connect(gain);
                gain.connect(this.musicGain);
                osc.start(playTime);
                osc.stop(playTime + DURATION);

                // Advance the clock by exactly SPACING — no drift possible
                this.nextNoteTime += SPACING;
                this.musicStep++;
            }
        };

        // First pass immediately, then poll every 25 ms to refill the lookahead buffer
        scheduleNotes();
        this.musicTimer = window.setInterval(scheduleNotes, 25);
    }

    stopBgm() {
        if (this.musicTimer) {
            window.clearInterval(this.musicTimer);
            this.musicTimer = null;
        }
        this.nextNoteTime = 0;
    }

    /**
     * Plays a brief high-frequency tick upon starting to drag a shape.
     */
    playDragStart() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);

        // Raised from 0.04 → 0.25 — clearly audible tap
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    /**
     * Plays a satisfying mechanical grid placement thud.
     */
    playPlace() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // Main placement thud (raised from 0.08 → 0.45)
        const thudOsc = this.ctx.createOscillator();
        const thudGain = this.ctx.createGain();

        thudOsc.type = 'triangle';
        thudOsc.frequency.setValueAtTime(280, now);
        thudOsc.frequency.exponentialRampToValueAtTime(140, now + 0.07);

        thudGain.gain.setValueAtTime(0.45, now);
        thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.10);

        thudOsc.connect(thudGain);
        thudGain.connect(this.masterGain);

        thudOsc.start(now);
        thudOsc.stop(now + 0.10);

        // Clicky snap highlight (raised from 0.04 → 0.2)
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();

        clickOsc.type = 'sine';
        clickOsc.frequency.setValueAtTime(900, now);
        clickOsc.frequency.exponentialRampToValueAtTime(500, now + 0.04);

        clickGain.gain.setValueAtTime(0.2, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        clickOsc.connect(clickGain);
        clickGain.connect(this.masterGain);

        clickOsc.start(now);
        clickOsc.stop(now + 0.05);
    }

    /**
     * Plays a bright, sparkling arpeggio which scales up with combo streaks.
     * @param {number} comboCount - Active sequential multiplier.
     */
    playClear(comboCount = 1) {
        if (!this.enabled) return;
        this.init();
        this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // C Major Pentatonic — harmonious clear sounds
        const pentatonicScale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
        const baseIndex = Math.min(comboCount - 1, pentatonicScale.length - 1);
        const rootFreq = pentatonicScale[baseIndex];

        // Rising major triad arpeggio: [Root, Major 3rd, Perfect 5th]
        const notes = [rootFreq, rootFreq * 1.25, rootFreq * 1.5];

        notes.forEach((freq, idx) => {
            const noteDelay = idx * 0.055;
            const playTime = now + noteDelay;

            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, playTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.1, playTime + 0.16);

            // Raised from max 0.12 → 0.5 (scales with combos but caps cleanly)
            const volume = Math.min(0.35 + (comboCount * 0.03), 0.6);
            gainNode.gain.setValueAtTime(volume, playTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, playTime + 0.30);

            osc.connect(gainNode);
            gainNode.connect(this.masterGain);

            osc.start(playTime);
            osc.stop(playTime + 0.32);
        });

        // Glitter shimmer on top (raised from 0.015 → 0.12)
        const glitterOsc = this.ctx.createOscillator();
        const glitterGain = this.ctx.createGain();

        glitterOsc.type = 'triangle';
        glitterOsc.frequency.setValueAtTime(rootFreq * 2, now);
        glitterOsc.frequency.linearRampToValueAtTime(rootFreq * 3.2, now + 0.18);

        glitterGain.gain.setValueAtTime(0.12, now);
        glitterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.20);

        glitterOsc.connect(glitterGain);
        glitterGain.connect(this.masterGain);

        glitterOsc.start(now);
        glitterOsc.stop(now + 0.22);
    }

    /**
     * Plays a short descending minor arpeggio — game over motif.
     */
    playGameOver() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // Descending minor motif: E4 → C4 → A3 → E3
        const motif = [329.63, 261.63, 220.00, 164.81];
        motif.forEach((freq, idx) => {
            const delay = idx * 0.10;
            const playTime = now + delay;

            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, playTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.88, playTime + 0.18);

            // Raised from 0.08 → 0.45
            gainNode.gain.setValueAtTime(0.45, playTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, playTime + 0.22);

            osc.connect(gainNode);
            gainNode.connect(this.masterGain);

            osc.start(playTime);
            osc.stop(playTime + 0.24);
        });
    }

    /**
     * Plays an uplifting sweeping major arpeggio — level win fanfare.
     */
    playLevelWin() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        // Rising C major arpeggio
        const winScale = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];

        winScale.forEach((freq, idx) => {
            const noteDelay = idx * 0.085;
            const playTime = now + noteDelay;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, playTime);

            // Raised from 0.04 → 0.4
            gain.gain.setValueAtTime(0.4, playTime);
            gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.48);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(playTime);
            osc.stop(playTime + 0.5);
        });
    }

    /**
     * Synthesizes/speaks vocal announcements like Good, Great, Excellent, Amazing, Unbelievable.
     * @param {string} phrase - Word to speak.
     */
    speak(phrase) {
        if (!this.enabled) return;
        if (!('speechSynthesis' in window)) return;
        
        try {
            // Cancel current speech to prevent queuing lag
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(phrase);
            utterance.pitch = 1.35; // slightly higher pitch for gamey energy
            utterance.rate = 1.15; // slightly faster rate
            utterance.volume = 1.0; // Full volume
            
            // Prefer an English voice
            const voices = window.speechSynthesis.getVoices();
            const enVoice = voices.find(v => v.lang.startsWith('en'));
            if (enVoice) {
                utterance.voice = enVoice;
            }
            
            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.warn("Speech Synthesis error:", e);
        }
    }
}
