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

        // Cache SpeechSynthesis voices (loaded asynchronously on most browsers)
        this.voices = [];
        if ('speechSynthesis' in window) {
            const loadVoices = () => { this.voices = window.speechSynthesis.getVoices(); };
            loadVoices();
            window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
        }

        // BGM using HTMLAudioElement for simple, native playback (no cracking)
        this.bgmAudio = new Audio('assets/audio/bgm/gaming_music.mp3');
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = 0.2;

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
        
        // Unlock Web Speech API — must speak audible text during user gesture
        if (!this.speechUnlocked && 'speechSynthesis' in window) {
            try {
                const unlockUtterance = new SpeechSynthesisUtterance(' ');
                unlockUtterance.volume = 0.01;
                unlockUtterance.rate = 2.0;
                window.speechSynthesis.speak(unlockUtterance);
                this.speechUnlocked = true;
            } catch (e) {}
        }
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
        this.bgmAudio.volume = Math.max(0, Math.min(0.4, vol));
    }

    setSfxVolume(vol) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(2.5, vol * 2.5));
        }
        this.enabled = vol > 0;
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
     * Plays a short, subtle UI tap sound for menu buttons.
     */
    playTap() {
        if (!this.enabled) return;
        this.init();
        this.resume();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.03);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.06);
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

        // C Major Pentatonic — dropped two octaves for a soft, deep tone
        const pentatonicScale = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63];
        const baseIndex = Math.min(comboCount - 1, 3, pentatonicScale.length - 1);
        const rootFreq = pentatonicScale[baseIndex];

        // Soft triad: [Root, minor 3rd, 5th] — mellower intervals
        const notes = [rootFreq, rootFreq * 1.18, rootFreq * 1.38];

        notes.forEach((freq, idx) => {
            const noteDelay = idx * 0.055;
            const playTime = now + noteDelay;

            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, playTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.03, playTime + 0.16);

            // Low volume — keeps combo audible but never harsh
            const volume = Math.min(0.07 + 0.03 * Math.log2(1 + comboCount), 0.13);
            gainNode.gain.setValueAtTime(0, playTime);
            gainNode.gain.linearRampToValueAtTime(volume, playTime + 0.015);
            gainNode.gain.exponentialRampToValueAtTime(0.001, playTime + 0.25);

            osc.connect(gainNode);
            gainNode.connect(this.masterGain);

            osc.start(playTime);
            osc.stop(playTime + 0.30);
            osc.onended = () => { osc.disconnect(); gainNode.disconnect(); };
        });

        // Glitter shimmer — very subtle, fades at higher combos
        const shimmerGain = Math.max(0.008, 0.015 - comboCount * 0.001);
        const glitterOsc = this.ctx.createOscillator();
        const glitterGain = this.ctx.createGain();

        glitterOsc.type = 'sine';
        glitterOsc.frequency.setValueAtTime(rootFreq * 1.2, now);
        glitterOsc.frequency.linearRampToValueAtTime(rootFreq * 1.6, now + 0.15);

        glitterGain.gain.setValueAtTime(0, now);
        glitterGain.gain.linearRampToValueAtTime(shimmerGain, now + 0.02);
        glitterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        glitterOsc.connect(glitterGain);
        glitterGain.connect(this.masterGain);

        glitterOsc.start(now);
        glitterOsc.stop(now + 0.22);
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
     * Speaks vocal announcements using pre-recorded MP3 clips.
     * Falls back to SpeechSynthesis for phrases without MP3 files.
     * @param {string} phrase - Word to speak.
     */
    async speak(phrase) {
        if (!this.enabled) return;

        const genderMap = {
            "Good": "female",
            "Great": "female",
            "Excellent": "female",
            "Wonderful": "male",
            "Amazing": "female",
            "Fantastic": "male",
            "Perfect": "male",
            "Marvelous": "female",
            "Unbelievable": "female"
        };

        const voiceFiles = {
            "Good":           { female: "assets/audio/female_voices/good.mp3" },
            "Great":          { female: "assets/audio/female_voices/great.mp3" },
            "Excellent":      { female: "assets/audio/female_voices/excellent.mp3" },
            "Wonderful":      { male: "assets/audio/male_voices/wonderful.mp3" },
            "Amazing":        { female: "assets/audio/female_voices/amazing.mp3" },
            "Fantastic":      { male: "assets/audio/male_voices/fantastic.mp3" },
            "Perfect":        { male: "assets/audio/male_voices/perfect.mp3" },
            "Unbelievable":   { male: "assets/audio/male_voices/unbelievable.mp3" }
        };

        const gender = genderMap[phrase] || "female";

        // Try pre-recorded MP3 first via Web Audio API
        const files = voiceFiles[phrase];
        if (files) {
            const src = files[gender] || files.male || files.female;
            if (src) {
                try {
                    this.init();
                    this.resume();
                    if (this.ctx) {
                        const response = await fetch(src);
                        const arrayBuffer = await response.arrayBuffer();
                        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
                        const source = this.ctx.createBufferSource();
                        source.buffer = audioBuffer;
                        const voiceGain = this.ctx.createGain();
                        voiceGain.gain.value = 0.25;
                        source.connect(voiceGain);
                        voiceGain.connect(this.masterGain);
                        source.start(0);
                        return;
                    }
                } catch (e) {
                    console.warn("Pre-recorded voice playback failed:", e);
                }
            }
        }

        // Fallback to SpeechSynthesis for phrases without MP3 (e.g. Marvelous)
        if (!('speechSynthesis' in window)) return;

        const doSpeak = () => {
            try {
                const utterance = new SpeechSynthesisUtterance(phrase);
                utterance.pitch = 0.95;
                utterance.rate = 0.95;
                utterance.volume = 1.0;

                const voices = this.voices.length ? this.voices : window.speechSynthesis.getVoices();
                const enVoices = voices.filter(v => v.lang.startsWith('en'));

                let bestVoice = null;
                if (gender === "female") {
                    bestVoice = enVoices.find(v =>
                        /samantha|victoria|karen|moira|tessa|zira|female/i.test(v.name)
                    );
                    if (!bestVoice) bestVoice = enVoices.find(v => /google.*uk.*female|google.*us.*female/i.test(v.name));
                } else {
                    bestVoice = enVoices.find(v =>
                        /daniel|alex|arthur|male|james|matthew|google.*uk.*male|google.*us.*male/i.test(v.name)
                    );
                }

                if (!bestVoice) bestVoice = enVoices.find(v => v.lang.startsWith('en-'));
                if (!bestVoice) bestVoice = enVoices[0];
                if (!bestVoice && voices.length) bestVoice = voices[0];

                if (bestVoice) utterance.voice = bestVoice;

                window.speechSynthesis.speak(utterance);

                setTimeout(() => {
                    if (window.speechSynthesis.speaking) return;
                    try { window.speechSynthesis.speak(utterance); } catch (_) {}
                }, 150);
            } catch (e) {
                console.warn("Speech synthesis error:", e);
            }
        };

        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
            setTimeout(doSpeak, 60);
        } else {
            doSpeak();
        }
    }
}
