import fs from 'fs';
import path from 'path';

// Read the original WAV file
const inputBuffer = fs.readFileSync(path.resolve('bgm/original_synth.wav'));

// Parse header information
const sampleRate = inputBuffer.readUInt32LE(24);
const bitsPerSample = inputBuffer.readUInt16LE(34);
const channels = inputBuffer.readUInt16LE(22);

const bytesPerSample = bitsPerSample / 8;

// Calculate bytes for exactly 1 second of audio
const bytesToRemove = sampleRate * channels * bytesPerSample;

const currentDataSize = inputBuffer.readUInt32LE(40);
const newDataSize = currentDataSize - bytesToRemove;

// Create new buffer and copy data (excluding the last second)
const newBuffer = Buffer.alloc(44 + newDataSize);
inputBuffer.copy(newBuffer, 0, 0, 44 + newDataSize);

// Update WAV RIFF headers with new sizes
newBuffer.writeUInt32LE(36 + newDataSize, 4); // RIFF chunk size
newBuffer.writeUInt32LE(newDataSize, 40);     // data chunk size

// Write to new file
fs.writeFileSync(path.resolve('bgm/bgm.wav'), newBuffer);
console.log('Successfully trimmed exactly 1 second and saved to bgm.wav');
