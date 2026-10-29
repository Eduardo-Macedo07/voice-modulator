import { SMOOTHING_SECONDS } from "./effect";

const BASS_HZ = 200;
const TREBLE_HZ = 3000;

/** Two shelving filters. Flat at 0 dB, so it needs no bypass. */
export class Equalizer {
  readonly input: BiquadFilterNode;
  readonly output: BiquadFilterNode;

  constructor(private readonly ctx: AudioContext) {
    this.input = ctx.createBiquadFilter();
    this.input.type = "lowshelf";
    this.input.frequency.value = BASS_HZ;

    this.output = ctx.createBiquadFilter();
    this.output.type = "highshelf";
    this.output.frequency.value = TREBLE_HZ;

    this.input.connect(this.output);
  }

  setBass(db: number): void {
    this.input.gain.setTargetAtTime(db, this.ctx.currentTime, SMOOTHING_SECONDS);
  }

  setTreble(db: number): void {
    this.output.gain.setTargetAtTime(db, this.ctx.currentTime, SMOOTHING_SECONDS);
  }
}
