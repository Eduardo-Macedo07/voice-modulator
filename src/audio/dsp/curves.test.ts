import { describe, expect, it } from "vitest";
import { distortionCurve, generateImpulse } from "./curves";

describe("distortionCurve", () => {
  it("stays within [-1, 1] and is monotonic", () => {
    const curve = distortionCurve(80);
    for (let i = 1; i < curve.length; i++) {
      expect(Math.abs(curve[i])).toBeLessThanOrEqual(1.0001);
      expect(curve[i]).toBeGreaterThanOrEqual(curve[i - 1]);
    }
  });

  it("clips harder as the amount grows", () => {
    const quarter = (c: Float32Array) => c[Math.floor(c.length * 0.75)];
    expect(quarter(distortionCurve(90))).toBeGreaterThan(quarter(distortionCurve(5)));
  });

  it("is odd-symmetric", () => {
    const curve = distortionCurve(50, 1025);
    expect(curve[512]).toBeCloseTo(0);
    expect(curve[0]).toBeCloseTo(-curve[1024]);
  });
});

describe("generateImpulse", () => {
  const energy = (a: Float32Array, from: number, to: number) => {
    let sum = 0;
    for (let i = from; i < to; i++) sum += a[i] * a[i];
    return sum;
  };

  it("has the requested length and channel count", () => {
    const ir = generateImpulse(1000, 2, 2);
    expect(ir).toHaveLength(2);
    expect(ir[0]).toHaveLength(2000);
  });

  it("decays over time", () => {
    const [ch] = generateImpulse(10000, 1, 1);
    expect(energy(ch, 0, 2000)).toBeGreaterThan(energy(ch, 8000, 10000) * 10);
  });
});
