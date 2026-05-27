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
    }

    /**
     * Lazy initializes the AudioContext upon user gesture.
     */
    init() {
        if (this.ctx) return;
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextClass();
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
            this.musicGain.gain.value = 0.035;
            this.musicGain.connect(this.ctx.destination);
        }

        const notes = [196, 246.94, 293.66, 369.99, 329.63, 246.94, 220, 293.66];
        const playNote = () => {
            if (!this.bgmEnabled || !this.ctx || !this.musicGain) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const freq = notes[this.musicStep % notes.length];

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.45, now + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);

            osc.connect(gain);
            gain.connect(this.musicGain);
            osc.start(now);
            osc.stop(now + 0.78);
            this.musicStep++;
        };

        playNote();
        this.musicTimer = window.setInterval(playNote, 760);
    }

    stopBgm() {
        if (this.musicTimer) {
            window.clearInterval(this.musicTimer);
            this.musicTimer = null;
        }
    }

    /**
     * Plays a brief high-frequency frequency tick upon starting to drag a shape.
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

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
    }

    /**
     * Plays a satisfying, heavy mechanical grid placement thud.
     */
    playPlace() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // Sub-bass thud
        const thudOsc = this.ctx.createOscillator();
        const thudGain = this.ctx.createGain();

        thudOsc.type = 'triangle';
        thudOsc.frequency.setValueAtTime(140, now);
        thudOsc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

        thudGain.gain.setValueAtTime(0.4, now);
        thudGain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

        thudOsc.connect(thudGain);
        thudGain.connect(this.ctx.destination);

        thudOsc.start(now);
        thudOsc.stop(now + 0.14);

        // Clicky alignment highlight
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();

        clickOsc.type = 'sine';
        clickOsc.frequency.setValueAtTime(800, now);
        clickOsc.frequency.exponentialRampToValueAtTime(350, now + 0.04);

        clickGain.gain.setValueAtTime(0.08, now);
        clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        clickOsc.connect(clickGain);
        clickGain.connect(this.ctx.destination);

        clickOsc.start(now);
        clickOsc.stop(now + 0.05);
    }

    /**
     * Plays a bright, sparkling arpeggio which scales up in key as combo streaks increase.
     * @param {number} comboCount - Active sequential multiplier.
     */
    playClear(comboCount = 1) {
        if (!this.enabled) return;
        this.init();
        this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // Pitch multiplier scales based on combos
        // C Major Pentatonic intervals to keep clears harmonious:
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
            osc.frequency.exponentialRampToValueAtTime(freq * 1.15, playTime + 0.16);

            // Slightly louder chimes for bigger combos
            const volume = Math.min(0.12 + (comboCount * 0.015), 0.2);
            gainNode.gain.setValueAtTime(volume, playTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, playTime + 0.28);

            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);

            osc.start(playTime);
            osc.stop(playTime + 0.3);
        });

        // Synthetic glitter noise
        const glitterOsc = this.ctx.createOscillator();
        const glitterGain = this.ctx.createGain();

        glitterOsc.type = 'triangle';
        glitterOsc.frequency.setValueAtTime(rootFreq * 2, now);
        glitterOsc.frequency.linearRampToValueAtTime(rootFreq * 3.5, now + 0.18);

        glitterGain.gain.setValueAtTime(0.03, now);
        glitterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        glitterOsc.connect(glitterGain);
        glitterGain.connect(this.ctx.destination);

        glitterOsc.start(now);
        glitterOsc.stop(now + 0.18);
    }

    /**
     * Plays a sad, descending series of detuned sawtooth waves.
     */
    playGameOver() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [320, 250, 180]; // Descending pitches

        notes.forEach((freq, idx) => {
            const noteDelay = idx * 0.18;
            const playTime = now + noteDelay;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, playTime);
            osc.frequency.linearRampToValueAtTime(freq - 40, playTime + 0.3);

            gain.gain.setValueAtTime(0.12, playTime);
            gain.gain.linearRampToValueAtTime(0.001, playTime + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(playTime);
            osc.stop(playTime + 0.36);
        });
    }

    /**
     * Plays an uplifting, sweeping major arpeggio.
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

            gain.gain.setValueAtTime(0.07, playTime);
            gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.45);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

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
