import { describe, expect, it } from "vitest";
import { BitcrusherCore, quantize } from "./bitcrusher";

describe("quantize", () => {
  it("snaps to the full-scale values at 1 bit", () => {
    expect(quantize(0.3, 1)).toBe(1);
    expect(quantize(-0.3, 1)).toBe(-1);
  });

  it("is nearly transparent at 16 bits", () => {
    expect(quantize(0.123456, 16)).toBeCloseTo(0.123456, 4);
  });

  it("uses at most 2^bits distinct levels", () => {
    const levels = new Set<number>();
    for (let i = 0; i <= 1000; i++) levels.add(quantize(i / 500 - 1, 3));
    expect(levels.size).toBeLessThanOrEqual(8);
  });
});

describe("BitcrusherCore", () => {
  it("holds each sample for `reduction` samples", () => {
    const core = new BitcrusherCore();
    const input = Float32Array.from({ length: 12 }, (_, i) => Math.sin(i));
    const output = new Float32Array(12);
    core.process(input, output, 16, 4);
    // Hold groups: samples 0-2 keep the initial value, then each 4 outputs share one value.
    expect(output[3]).toBe(output[4]);
    expect(output[4]).toBe(output[5]);
    expect(output[5]).toBe(output[6]);
    expect(output[7]).not.toBe(output[6]);
  });

  it("passes the signal through when reduction is 1 at high bit depth", () => {
    const core = new BitcrusherCore();
    const input = Float32Array.from({ length: 8 }, (_, i) => Math.sin(i));
    const output = new Float32Array(8);
    core.process(input, output, 16, 1);
    output.forEach((v, i) => expect(v).toBeCloseTo(input[i], 3));
  });
});
