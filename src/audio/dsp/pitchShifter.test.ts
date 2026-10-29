import { describe, expect, it } from "vitest";
import { PitchShifterCore, advancePhase, grainGain, semitonesToRatio } from "./pitchShifter";

const SAMPLE_RATE = 48000;

function sine(freq: number, length: number): Float32Array {
  const out = new Float32Array(length);
  for (let i = 0; i < length; i++) out[i] = Math.sin((2 * Math.PI * freq * i) / SAMPLE_RATE);
  return out;
}

/** Frequency estimated from rising zero crossings. */
function estimateFrequency(signal: Float32Array): number {
  let crossings = 0;
  for (let i = 1; i < signal.length; i++) {
    if (signal[i - 1] < 0 && signal[i] >= 0) crossings++;
  }
  return (crossings * SAMPLE_RATE) / signal.length;
}

function shift(freq: number, ratio: number): Float32Array {
  const core = new PitchShifterCore();
  const input = sine(freq, SAMPLE_RATE);
  const output = new Float32Array(input.length);
  const block = 128;
  for (let i = 0; i < input.length; i += block) {
    core.process(input.subarray(i, i + block), output.subarray(i, i + block), ratio);
  }
  // Skip the first 0.25 s so the delay line is full.
  return output.subarray(SAMPLE_RATE / 4);
}

describe("semitonesToRatio", () => {
  it("maps 12 semitones to an octave", () => {
    expect(semitonesToRatio(12)).toBeCloseTo(2);
    expect(semitonesToRatio(-12)).toBeCloseTo(0.5);
    expect(semitonesToRatio(0)).toBe(1);
  });
});

describe("grainGain", () => {
  it("crossfades to a constant gain of 1", () => {
    for (const phase of [0, 0.1, 0.25, 0.4, 0.7]) {
      expect(grainGain(phase) + grainGain((phase + 0.5) % 1)).toBeCloseTo(1);
    }
  });
});

describe("advancePhase", () => {
  it("stays in [0, 1) when wrapping in either direction", () => {
    expect(advancePhase(0.999, 0.5, 100)).toBeLessThan(1);
    expect(advancePhase(0.001, 2, 100)).toBeGreaterThanOrEqual(0);
  });
});

describe("PitchShifterCore", () => {
  it("raises a 440 Hz tone an octave", () => {
    expect(estimateFrequency(shift(440, 2))).toBeCloseTo(880, -2);
  });

  it("lowers a 440 Hz tone an octave", () => {
    expect(estimateFrequency(shift(440, 0.5))).toBeCloseTo(220, -2);
  });

  it("keeps the output level close to the input", () => {
    const out = shift(440, 1.5);
    const peak = out.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
    expect(peak).toBeGreaterThan(0.7);
    expect(peak).toBeLessThan(1.1);
  });
});
