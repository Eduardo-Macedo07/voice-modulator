import { PitchShifterCore } from "../dsp/pitchShifter";

// AudioWorkletGlobalScope types are not part of lib.dom.
declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  constructor();
}
declare function registerProcessor(name: string, ctor: new () => AudioWorkletProcessor): void;

class PitchShifterProcessor extends AudioWorkletProcessor {
  private cores: PitchShifterCore[] = [];

  static get parameterDescriptors() {
    return [{ name: "ratio", defaultValue: 1, minValue: 0.25, maxValue: 4, automationRate: "k-rate" }];
  }

  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>) {
    const input = inputs[0];
    const output = outputs[0];
    const ratio = parameters.ratio[0];

    for (let ch = 0; ch < output.length; ch++) {
      this.cores[ch] ??= new PitchShifterCore();
      // A silent/disconnected input has no channels: feed zeros so the delay line drains.
      const source = input[ch] ?? new Float32Array(output[ch].length);
      this.cores[ch].process(source, output[ch], ratio);
    }
    return true;
  }
}

registerProcessor("pitch-shifter", PitchShifterProcessor);
