export const SMOOTHING_SECONDS = 0.02;

/**
 * Base for effects that can be bypassed without rebuilding the graph.
 * Subclasses connect `input` → processing → `wet`.
 * A replacing effect (pitch, distortion…) swaps dry for wet; an additive one (echo, reverb)
 * keeps the dry signal and only fades its wet layer in.
 */
export abstract class Effect {
  readonly input: GainNode;
  readonly output: GainNode;
  private readonly dry: GainNode;
  protected readonly wet: GainNode;

  constructor(
    protected readonly ctx: AudioContext,
    private readonly additive = false,
  ) {
    this.input = ctx.createGain();
    this.output = ctx.createGain();
    this.dry = ctx.createGain();
    this.wet = ctx.createGain();
    this.wet.gain.value = 0;

    this.input.connect(this.dry).connect(this.output);
    this.wet.connect(this.output);
  }

  setEnabled(on: boolean): void {
    if (!this.additive) this.ramp(this.dry.gain, on ? 0 : 1);
    this.ramp(this.wet.gain, on ? 1 : 0);
  }

  protected ramp(param: AudioParam, value: number): void {
    param.setTargetAtTime(value, this.ctx.currentTime, SMOOTHING_SECONDS);
  }
}
