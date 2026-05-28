import fs from 'fs';
import path from 'path';

// Read the seamless WAV file
const inputBuffer = fs.readFileSync(path.resolve('bgm/bgm.wav'));

const sampleRate = inputBuffer.readUInt32LE(24);
const channels = inputBuffer.readUInt16LE(22);
const dataSize = inputBuffer.readUInt32LE(40);
const numSamples = dataSize / 2; // 16-bit = 2 bytes per sample

// Read PCM data into a Float array
const samples = new Float32Array(numSamples);
for (let i = 0; i < numSamples; i++) {
    const intVal = inputBuffer.readInt16LE(44 + i * 2);
    samples[i] = intVal / 32768.0;
}

// Apply a 20ms linear fade-in at the start and fade-out at the end
// This mathematically forces the start and end of the audio file to cross exactly at 0.0
// Completely eliminating the digital pop/crackle when the file loops!
const fadeSamples = Math.floor(0.02 * sampleRate); // 20ms

for (let i = 0; i < fadeSamples; i++) {
    // Fade in
    const fadeInFactor = i / fadeSamples;
    samples[i] *= fadeInFactor;
    
    // Fade out
    const fadeOutIdx = numSamples - 1 - i;
    const fadeOutFactor = i / fadeSamples;
    samples[fadeOutIdx] *= fadeOutFactor;
}

// Boost the overall volume by 2x (user requested it's too quiet)
for (let i = 0; i < numSamples; i++) {
    samples[i] *= 2.0;
}

// Write back to WAV buffer
const outputBuffer = Buffer.alloc(inputBuffer.length);
inputBuffer.copy(outputBuffer, 0, 0, 44); // Copy headers

for (let i = 0; i < numSamples; i++) {
    // Hard clip protection
    let sample = Math.max(-1, Math.min(1, samples[i]));
    let val = sample < 0 ? sample * 32768 : sample * 32767;
    outputBuffer.writeInt16LE(Math.round(val), 44 + i * 2);
}

fs.writeFileSync(path.resolve('bgm/bgm.wav'), outputBuffer);
console.log('Successfully removed loop boundary crackle and boosted volume in bgm.wav');
