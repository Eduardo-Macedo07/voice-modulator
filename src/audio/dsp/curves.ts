/** WaveShaper transfer curve: soft clipping that gets harder as `amount` (0–100) grows. */
export function distortionCurve(amount: number, samples = 1024): Float32Array<ArrayBuffer> {
  const drive = 1 + amount * 0.3;
  const norm = Math.tanh(drive);
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    const x = (i / (samples - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * drive) / norm;
  }
  return curve;
}

/**
 * Synthetic reverb impulse response: decaying noise, a different sequence per channel
 * for a wide stereo tail. `rand` is injectable for deterministic tests.
 */
export function generateImpulse(
  sampleRate: number,
  seconds: number,
  channels = 2,
  rand: () => number = Math.random,
): Float32Array<ArrayBuffer>[] {
  const length = Math.max(1, Math.floor(sampleRate * seconds));
  return Array.from({ length: channels }, () => {
    const data = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      const decay = (1 - i / length) ** 3;
      data[i] = (rand() * 2 - 1) * decay;
    }
    return data;
  });
}
