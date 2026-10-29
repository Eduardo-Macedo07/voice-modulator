/**
 * Granular pitch shifter: two read heads travel through a delay line, half a
 * window apart, each faded in and out by a Hann window. Reading faster or
 * slower than the write speed transposes the signal; the crossfade hides the
 * jump when a head wraps around. Pure TS so it can be tested without an AudioContext.
 */

export const MIN_RATIO = 0.25;
export const MAX_RATIO = 4;

export function semitonesToRatio(semitones: number): number {
  return 2 ** (semitones / 12);
}

/** Hann grain gain for a head at `phase` in [0, 1). Two heads half a cycle apart sum to 1. */
export function grainGain(phase: number): number {
  const s = Math.sin(Math.PI * phase);
  return s * s;
}

/** Moves a head's delay phase. Reading at `ratio` speed means the delay changes by (1 - ratio) per sample. */
export function advancePhase(phase: number, ratio: number, windowSize: number): number {
  const next = phase + (1 - ratio) / windowSize;
  return next - Math.floor(next);
}

export class PitchShifterCore {
  private readonly buffer: Float32Array;
  private writeIndex = 0;
  private phase = 0;

  constructor(private readonly windowSize = 2048) {
    // Two heads never read further back than windowSize samples; the extra room keeps interpolation in range.
    this.buffer = new Float32Array(windowSize * 2);
  }

  process(input: Float32Array, output: Float32Array, ratio: number): void {
    const r = Math.min(Math.max(ratio, MIN_RATIO), MAX_RATIO);
    const size = this.buffer.length;
    const w = this.windowSize;

    for (let i = 0; i < input.length; i++) {
      this.buffer[this.writeIndex] = input[i];

      const phaseB = (this.phase + 0.5) % 1;
      output[i] =
        this.read(this.phase * w) * grainGain(this.phase) + this.read(phaseB * w) * grainGain(phaseB);

      this.phase = advancePhase(this.phase, r, w);
      this.writeIndex = (this.writeIndex + 1) % size;
    }
  }

  private read(delay: number): number {
    const size = this.buffer.length;
    const pos = this.writeIndex - delay;
    const base = Math.floor(pos);
    const frac = pos - base;
    const a = this.buffer[((base % size) + size) % size];
    const b = this.buffer[(((base + 1) % size) + size) % size];
    return a + (b - a) * frac;
  }
}
