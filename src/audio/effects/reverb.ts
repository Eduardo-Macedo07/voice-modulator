import { generateImpulse } from "../dsp/curves";
import { Effect } from "./effect";

export class ReverbEffect extends Effect {
  private readonly convolver: ConvolverNode;
  private readonly mix: GainNode;
  private size = -1;

  constructor(ctx: AudioContext) {
    super(ctx, true);
    this.convolver = ctx.createConvolver();
    this.mix = ctx.createGain();
    this.input.connect(this.convolver).connect(this.mix).connect(this.wet);
  }

  /** Room size as the tail length in seconds. */
  setSize(seconds: number): void {
    if (seconds === this.size) return;
    this.size = seconds;
    const channels = generateImpulse(this.ctx.sampleRate, seconds);
    const buffer = this.ctx.createBuffer(channels.length, channels[0].length, this.ctx.sampleRate);
    channels.forEach((data, i) => buffer.copyToChannel(data, i));
    this.convolver.buffer = buffer;
  }

  setMix(amount: number): void {
    this.ramp(this.mix.gain, amount);
  }
}
