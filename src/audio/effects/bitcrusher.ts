import workletUrl from "../worklets/bitcrusher.worklet.ts?worker&url";
import { Effect } from "./effect";

export class BitcrusherEffect extends Effect {
  private readonly bits: AudioParam;
  private readonly reduction: AudioParam;

  static async load(ctx: AudioContext): Promise<void> {
    await ctx.audioWorklet.addModule(workletUrl);
  }

  /** Requires `BitcrusherEffect.load(ctx)` to have resolved for this context. */
  constructor(ctx: AudioContext) {
    super(ctx);
    const node = new AudioWorkletNode(ctx, "bitcrusher", {
      channelCount: 1,
      channelCountMode: "explicit",
      outputChannelCount: [1],
    });
    this.bits = node.parameters.get("bits")!;
    this.reduction = node.parameters.get("reduction")!;
    this.input.connect(node).connect(this.wet);
  }

  setBits(bits: number): void {
    this.bits.value = bits;
  }

  setReduction(reduction: number): void {
    this.reduction.value = reduction;
  }
}
