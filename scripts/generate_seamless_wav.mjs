import fs from 'fs';
import path from 'path';

const SAMPLE_RATE = 44100;
const LOOP_LENGTH_SECS = 6.08;
const NUM_LOOPS = 4;
const EXACT_DURATION_SECS = LOOP_LENGTH_SECS * NUM_LOOPS; // exactly 24.32 seconds
const NUM_SAMPLES = Math.round(EXACT_DURATION_SECS * SAMPLE_RATE); // 1072512

// The notes sequence
const notes = [196, 246.94, 293.66, 369.99, 329.63, 246.94, 220, 293.66];
const NOTE_DURATION = 0.78;
const NOTE_SPACING = 0.76;

const buffer = new Float32Array(NUM_SAMPLES);

const totalNotes = 8 * NUM_LOOPS;

for (let noteIdx = 0; noteIdx < totalNotes; noteIdx++) {
    const startTime = noteIdx * NOTE_SPACING;
    const freq = notes[noteIdx % notes.length];
    
    // Calculate exact start and end bounds for the envelope
    const startSample = Math.floor(startTime * SAMPLE_RATE);
    // Envelope lasts up to NOTE_DURATION + 0.3s safely
    const durationSamples = Math.floor((NOTE_DURATION + 0.3) * SAMPLE_RATE);

    for (let j = 0; j < durationSamples; j++) {
        const i = startSample + j;
        const t = j / SAMPLE_RATE;
        
        const osc = Math.sin(2 * Math.PI * freq * t);
        
        let env = 0;
        if (t <= 0.08) {
            env = (t / 0.08) * 0.45;
        } else if (t < NOTE_DURATION - 0.1) {
            env = 0.45;
        } else {
            const decayTime = t - (NOTE_DURATION - 0.1);
            env = 0.45 * Math.exp(-decayTime / 0.05);
        }

        const sampleValue = osc * env * 0.7;

        // TAIL WRAPPING: If the note's decay tail spills past the end of the 24.32s track,
        // we wrap it mathematically to the very beginning of the track. 
        // This guarantees a mathematically perfect, seamless zero-crossing loop.
        if (i < NUM_SAMPLES) {
            buffer[i] += sampleValue;
        } else {
            buffer[i % NUM_SAMPLES] += sampleValue;
        }
    }
}

// Write to WAV
const wavBuffer = Buffer.alloc(44 + NUM_SAMPLES * 2);
wavBuffer.write('RIFF', 0);
wavBuffer.writeUInt32LE(36 + NUM_SAMPLES * 2, 4);
wavBuffer.write('WAVE', 8);
wavBuffer.write('fmt ', 12);
wavBuffer.writeUInt32LE(16, 16);
wavBuffer.writeUInt16LE(1, 20);
wavBuffer.writeUInt16LE(1, 22);
wavBuffer.writeUInt32LE(SAMPLE_RATE, 24);
wavBuffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
wavBuffer.writeUInt16LE(2, 32);
wavBuffer.writeUInt16LE(16, 34);
wavBuffer.write('data', 36);
wavBuffer.writeUInt32LE(NUM_SAMPLES * 2, 40);

for (let i = 0; i < NUM_SAMPLES; i++) {
    let sample = Math.max(-1, Math.min(1, buffer[i]));
    let val = sample < 0 ? sample * 32768 : sample * 32767;
    wavBuffer.writeInt16LE(Math.round(val), 44 + i * 2);
}

fs.writeFileSync(path.resolve('bgm/bgm.wav'), wavBuffer);
console.log('Successfully generated mathematically seamless bgm.wav');
