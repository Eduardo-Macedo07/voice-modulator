import { distortionCurve } from "../dsp/curves";
import { Effect } from "./effect";

export class DistortionEffect extends Effect {
  private readonly shaper: WaveShaperNode;
  private amount = -1;

  constructor(ctx: AudioContext) {
    super(ctx);
    this.shaper = ctx.createWaveShaper();
    this.shaper.oversample = "4x";
    this.input.connect(this.shaper).connect(this.wet);
  }

  setAmount(amount: number): void {
    if (amount === this.amount) return;
    this.amount = amount;
    this.shaper.curve = distortionCurve(amount);
  }
}
