import { BitcrusherCore } from "../dsp/bitcrusher";

// AudioWorkletGlobalScope types are not part of lib.dom.
declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  constructor();
}
declare function registerProcessor(name: string, ctor: new () => AudioWorkletProcessor): void;

class BitcrusherProcessor extends AudioWorkletProcessor {
  private cores: BitcrusherCore[] = [];

  static get parameterDescriptors() {
    return [
      { name: "bits", defaultValue: 8, minValue: 1, maxValue: 16, automationRate: "k-rate" },
      { name: "reduction", defaultValue: 4, minValue: 1, maxValue: 40, automationRate: "k-rate" },
    ];
  }

  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>) {
    const input = inputs[0];
    const output = outputs[0];

    for (let ch = 0; ch < output.length; ch++) {
      this.cores[ch] ??= new BitcrusherCore();
      const source = input[ch] ?? new Float32Array(output[ch].length);
      this.cores[ch].process(source, output[ch], parameters.bits[0], parameters.reduction[0]);
    }
    return true;
  }
}

registerProcessor("bitcrusher", BitcrusherProcessor);
