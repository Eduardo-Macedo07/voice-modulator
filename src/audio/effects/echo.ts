import { Effect } from "./effect";

const MAX_DELAY_SECONDS = 1;

export class EchoEffect extends Effect {
  private readonly delay: DelayNode;
  private readonly feedback: GainNode;
  private readonly mix: GainNode;

  constructor(ctx: AudioContext) {
    super(ctx, true);
    this.delay = ctx.createDelay(MAX_DELAY_SECONDS);
    this.feedback = ctx.createGain();
    this.mix = ctx.createGain();

    this.input.connect(this.delay);
    this.delay.connect(this.feedback).connect(this.delay);
    this.delay.connect(this.mix).connect(this.wet);
  }

  setTime(seconds: number): void {
    this.ramp(this.delay.delayTime, seconds);
  }

  setFeedback(amount: number): void {
    this.ramp(this.feedback.gain, amount);
  }

  setMix(amount: number): void {
    this.ramp(this.mix.gain, amount);
  }
}
