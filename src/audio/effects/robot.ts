import { Effect } from "./effect";

/** Ring modulation: the voice is multiplied by a sine wave, which gives the metallic robot timbre. */
export class RobotEffect extends Effect {
  private readonly osc: OscillatorNode;

  constructor(ctx: AudioContext) {
    super(ctx);
    const modulator = ctx.createGain();
    modulator.gain.value = 0; // the oscillator drives the gain entirely
    this.osc = ctx.createOscillator();
    this.osc.frequency.value = 50;
    this.osc.connect(modulator.gain);
    this.osc.start();
    this.input.connect(modulator).connect(this.wet);
  }

  setFrequency(hz: number): void {
    this.ramp(this.osc.frequency, hz);
  }
}
