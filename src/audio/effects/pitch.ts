import workletUrl from "../worklets/pitchShifter.worklet.ts?worker&url";
import { semitonesToRatio } from "../dsp/pitchShifter";
import { Effect } from "./effect";

export class PitchEffect extends Effect {
  private readonly ratio: AudioParam;

  static async load(ctx: AudioContext): Promise<void> {
    await ctx.audioWorklet.addModule(workletUrl);
  }

  /** Requires `PitchEffect.load(ctx)` to have resolved for this context. */
  constructor(ctx: AudioContext) {
    super(ctx);
    const node = new AudioWorkletNode(ctx, "pitch-shifter", {
      channelCount: 1,
      channelCountMode: "explicit",
      outputChannelCount: [1],
    });
    this.ratio = node.parameters.get("ratio")!;
    this.input.connect(node).connect(this.wet);
  }

  setSemitones(semitones: number): void {
    this.ramp(this.ratio, semitonesToRatio(semitones));
  }
}
