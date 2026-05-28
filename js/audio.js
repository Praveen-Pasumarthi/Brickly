/**
 * Brickly - Web Audio API Synthesis Engine
 * Synthesizes clean, latency-free haptic-like sound effects (SFX) directly
 * inside the client browser context, removing large file asset downloads.
 */

export class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.bgmEnabled = true;
        
        // Master gain node — all SFX route through this so volume is consistent
        this.masterGain = null;

        // BGM using HTMLAudioElement for simple, native playback (no cracking)
        this.bgmAudio = new Audio('bgm/bgm.wav');
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = 0.95;

        // Auto-pause audio engine when app is minimized or backgrounded
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (this.ctx && this.ctx.state === 'running') {
                    this.ctx.suspend();
                }
                if (this.bgmEnabled && !this.bgmAudio.paused) {
                    this.bgmAudio.pause();
                }
            } else {
                if (this.ctx && this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
                if (this.bgmEnabled) {
                    this.bgmAudio.play().catch(e => console.warn("BGM resume blocked:", e));
                }
            }
        });
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

    setBgmVolume(vol) {
        this.bgmAudio.volume = Math.max(0, Math.min(1, vol));
    }

    startBgm() {
        if (!this.bgmEnabled) return;
        this.init();
        this.resume();
        
        this.bgmAudio.play().catch(e => console.warn("BGM autoplay blocked by browser policy:", e));
    }

    stopBgm() {
        this.bgmAudio.pause();
        this.bgmAudio.currentTime = 0;
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

        // 10ms micro-attack to prevent pop
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.20, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.1);
        osc.onended = () => { osc.disconnect(); gain.disconnect(); };
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

        thudGain.gain.setValueAtTime(0, now);
        thudGain.gain.linearRampToValueAtTime(0.35, now + 0.01);
        thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        thudOsc.connect(thudGain);
        thudGain.connect(this.masterGain);

        thudOsc.start(now);
        thudOsc.stop(now + 0.15);
        thudOsc.onended = () => { thudOsc.disconnect(); thudGain.disconnect(); };

        // Clicky snap highlight
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();

        clickOsc.type = 'sine';
        clickOsc.frequency.setValueAtTime(900, now);
        clickOsc.frequency.exponentialRampToValueAtTime(500, now + 0.04);

        clickGain.gain.setValueAtTime(0, now);
        clickGain.gain.linearRampToValueAtTime(0.15, now + 0.01);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        clickOsc.connect(clickGain);
        clickGain.connect(this.masterGain);

        clickOsc.start(now);
        clickOsc.stop(now + 0.1);
        clickOsc.onended = () => { clickOsc.disconnect(); clickGain.disconnect(); };
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

            // 15ms micro-attack
            const volume = Math.min(0.25 + (comboCount * 0.03), 0.5);
            gainNode.gain.setValueAtTime(0, playTime);
            gainNode.gain.linearRampToValueAtTime(volume, playTime + 0.015);
            gainNode.gain.exponentialRampToValueAtTime(0.001, playTime + 0.30);

            osc.connect(gainNode);
            gainNode.connect(this.masterGain);

            osc.start(playTime);
            osc.stop(playTime + 0.35);
            osc.onended = () => { osc.disconnect(); gainNode.disconnect(); };
        });

        // Glitter shimmer on top (raised from 0.015 → 0.12)
        const glitterOsc = this.ctx.createOscillator();
        const glitterGain = this.ctx.createGain();

        glitterOsc.type = 'sine';
        glitterOsc.frequency.setValueAtTime(rootFreq * 2, now);
        glitterOsc.frequency.linearRampToValueAtTime(rootFreq * 4, now + 0.15);

        glitterGain.gain.setValueAtTime(0, now);
        glitterGain.gain.linearRampToValueAtTime(0.08, now + 0.02);
        glitterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.20);

        glitterOsc.connect(glitterGain);
        glitterGain.connect(this.masterGain);

        glitterOsc.start(now);
        glitterOsc.stop(now + 0.25);
        glitterOsc.onended = () => { glitterOsc.disconnect(); glitterGain.disconnect(); };
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

            gain.gain.setValueAtTime(0, playTime);
            gain.gain.linearRampToValueAtTime(0.25, playTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.48);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(playTime);
            osc.stop(playTime + 0.55);
            osc.onended = () => { osc.disconnect(); gain.disconnect(); };
        });
    }

    /**
     * Synthesizes/speaks vocal announcements like Good, Great, Excellent, Amazing, Unbelievable.
     * @param {string} phrase - Word to speak.
     */
    async speak(phrase) {
        if (!this.enabled) return;
        
        // 1. Try Native Capacitor TextToSpeech Plugin (Robust on Android)
        try {
            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                const TTS = window.Capacitor.registerPlugin('TextToSpeech');
                if (TTS) {
                    await TTS.speak({
                        text: phrase,
                        lang: 'en-US',
                        rate: 0.95,
                        pitch: 0.95,
                        volume: 1.0
                    });
                    return; // Skip Web Speech API if native succeeds
                }
            }
        } catch (e) {
            console.warn("Capacitor Native TTS error:", e);
        }

        // 2. Fallback to Web Speech API
        if (!('speechSynthesis' in window)) return;
        
        // Permanently map specific praises to a specific soothing voice gender
        const genderMap = {
            "Good": "male",
            "Great": "female",
            "Excellent": "female",
            "Wonderful": "male",
            "Amazing": "female",
            "Fantastic": "male",
            "Perfect": "male",
            "Marvelous": "female",
            "Unbelievable": "female"
        };
        
        try {
            // Cancel current speech to prevent queuing lag
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(phrase);
            utterance.pitch = 0.95; // Soothing, lower pitch
            utterance.rate = 0.95; // Slightly slower, calm delivery
            utterance.volume = 1.0; 
            
            const targetGender = genderMap[phrase] || "female"; // Default to female if unknown
            const voices = window.speechSynthesis.getVoices();
            
            let bestVoice = null;
            if (targetGender === "female") {
                // Find a soothing female voice
                bestVoice = voices.find(v => v.lang.startsWith('en') && 
                    (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('victoria')));
            } else {
                // Find a soothing male voice
                bestVoice = voices.find(v => v.lang.startsWith('en') && 
                    (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('daniel') || v.name.toLowerCase().includes('alex') || v.name.toLowerCase().includes('arthur')) 
                    && !v.name.toLowerCase().includes('female'));
            }

            // Fallbacks if no specific gender match found
            if (!bestVoice) bestVoice = voices.find(v => v.lang.startsWith('en-GB'));
            if (!bestVoice) bestVoice = voices.find(v => v.lang.startsWith('en'));
            
            if (bestVoice) {
                utterance.voice = bestVoice;
            }
            
            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.warn("Speech synthesis error:", e);
        }
    }
}
