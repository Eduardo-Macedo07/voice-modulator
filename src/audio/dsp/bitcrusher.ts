/** Quantizes a sample in [-1, 1] to `bits` bits. */
export function quantize(x: number, bits: number): number {
  const steps = 2 ** Math.round(bits) - 1;
  return (Math.round((x * 0.5 + 0.5) * steps) / steps) * 2 - 1;
}

/**
 * Lo-fi effect: reduces bit depth and holds each sample for `reduction` samples
 * (a cheap sample-rate reduction). Pure TS so it can be tested without an AudioContext.
 */
export class BitcrusherCore {
  private held = 0;
  private counter = 0;

  process(input: Float32Array, output: Float32Array, bits: number, reduction: number): void {
    const hold = Math.max(reduction, 1);
    for (let i = 0; i < input.length; i++) {
      this.counter += 1;
      if (this.counter >= hold) {
        this.counter -= hold;
        this.held = quantize(input[i], bits);
      }
      output[i] = this.held;
    }
  }
}
