import fs from 'fs';
import path from 'path';

const SAMPLE_RATE = 44100;
const DURATION_SECS = 25; // Render ~25 seconds of the loop
const NUM_SAMPLES = SAMPLE_RATE * DURATION_SECS;

// The notes sequence
const notes = [196, 246.94, 293.66, 369.99, 329.63, 246.94, 220, 293.66];
const NOTE_DURATION = 0.78;
const NOTE_SPACING = 0.76;

// Create floating point buffer for audio
const buffer = new Float32Array(NUM_SAMPLES);

// We simulate oscillators and gain nodes
for (let noteIdx = 0; ; noteIdx++) {
    const startTime = noteIdx * NOTE_SPACING;
    if (startTime > DURATION_SECS) break;

    const freq = notes[noteIdx % notes.length];
    
    const startSample = Math.floor(startTime * SAMPLE_RATE);
    const endSample = Math.min(NUM_SAMPLES, Math.floor((startTime + NOTE_DURATION + 0.3) * SAMPLE_RATE));

    for (let i = startSample; i < endSample; i++) {
        const t = (i - startSample) / SAMPLE_RATE;
        
        // Sine wave
        const osc = Math.sin(2 * Math.PI * freq * t);
        
        // Envelope matching the exact Web Audio API sequence I wrote:
        // linearRampToValueAtTime(0.45, 0.08)
        // setTargetAtTime(0, NOTE_DURATION - 0.1, 0.05)
        let env = 0;
        if (t <= 0.08) {
            env = (t / 0.08) * 0.45;
        } else if (t < NOTE_DURATION - 0.1) {
            env = 0.45;
        } else {
            // Decay curve: standard exponential decay formula: V(t) = V0 * e^(-t/tau)
            const decayTime = t - (NOTE_DURATION - 0.1);
            env = 0.45 * Math.exp(-decayTime / 0.05);
        }

        // Add to main mix bus. Multiply by 0.7 to normalize it nicely for WAV export
        buffer[i] += osc * env * 0.7; 
    }
}

// Convert Float32Array to 16-bit PCM WAV
const wavBuffer = Buffer.alloc(44 + NUM_SAMPLES * 2);

// Write WAV Header
wavBuffer.write('RIFF', 0);
wavBuffer.writeUInt32LE(36 + NUM_SAMPLES * 2, 4);
wavBuffer.write('WAVE', 8);
wavBuffer.write('fmt ', 12);
wavBuffer.writeUInt32LE(16, 16); // Subchunk1Size
wavBuffer.writeUInt16LE(1, 20); // AudioFormat (PCM)
wavBuffer.writeUInt16LE(1, 22); // NumChannels
wavBuffer.writeUInt32LE(SAMPLE_RATE, 24); // SampleRate
wavBuffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // ByteRate
wavBuffer.writeUInt16LE(2, 32); // BlockAlign
wavBuffer.writeUInt16LE(16, 34); // BitsPerSample
wavBuffer.write('data', 36);
wavBuffer.writeUInt32LE(NUM_SAMPLES * 2, 40);

// Write PCM data
for (let i = 0; i < NUM_SAMPLES; i++) {
    // Hard clip protection
    let sample = Math.max(-1, Math.min(1, buffer[i]));
    // Convert to 16 bit
    let val = sample < 0 ? sample * 32768 : sample * 32767;
    wavBuffer.writeInt16LE(Math.round(val), 44 + i * 2);
}

const outputPath = path.resolve('bgm/original_synth.wav');
fs.writeFileSync(outputPath, wavBuffer);
console.log(`Successfully generated ${outputPath}`);
