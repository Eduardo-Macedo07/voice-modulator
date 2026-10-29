import { Equalizer } from "./effects/equalizer";
import { PitchEffect } from "./effects/pitch";
import { RobotEffect } from "./effects/robot";
import { DEFAULT_SETTINGS, type VoiceSettings } from "./settings";

const SMOOTHING_SECONDS = 0.02;

/** Output value that mutes the "send to other apps" path. */
export const NO_OUTPUT = "none";

export interface AudioDevice {
  deviceId: string;
  label: string;
}

export async function listDevices(kind: "audioinput" | "audiooutput"): Promise<AudioDevice[]> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices
    .filter((d) => d.kind === kind)
    .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Device ${i + 1}` }));
}

interface Graph {
  ctx: AudioContext;
  stream: MediaStream;
  source: MediaStreamAudioSourceNode;
  pitch: PitchEffect;
  robot: RobotEffect;
  eq: Equalizer;
  master: GainNode;
  analyser: AnalyserNode;
  out: GainNode;
  monitor: GainNode;
  monitorAudio: HTMLAudioElement;
}

/**
 * Mic → Pitch → Robot → EQ → Master ─┬→ Analyser
 *                                    ├→ Out → ctx.destination (output device, e.g. a virtual cable)
 *                                    └→ Monitor → <audio> (monitor device, e.g. headphones)
 */
export class AudioEngine {
  private graph: Graph | null = null;
  private settings: VoiceSettings = DEFAULT_SETTINGS;
  private monitoring = false;
  private masterLevel = 1;
  private outputId = NO_OUTPUT;
  private monitorId = "";

  get analyser(): AnalyserNode | null {
    return this.graph?.analyser ?? null;
  }

  async start(inputId?: string): Promise<void> {
    await this.stop();

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: inputId ? { exact: inputId } : undefined,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    try {
      const ctx = new AudioContext({ latencyHint: "interactive" });
      await PitchEffect.load(ctx);

      const source = ctx.createMediaStreamSource(stream);
      const pitch = new PitchEffect(ctx);
      const robot = new RobotEffect(ctx);
      const eq = new Equalizer(ctx);
      const master = ctx.createGain();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      const out = ctx.createGain();
      const monitor = ctx.createGain();
      const monitorDest = ctx.createMediaStreamDestination();
      const monitorAudio = new Audio();
      monitorAudio.srcObject = monitorDest.stream;

      source.connect(pitch.input);
      pitch.output.connect(robot.input);
      robot.output.connect(eq.input);
      eq.output.connect(master);
      master.connect(analyser);
      master.connect(out).connect(ctx.destination);
      master.connect(monitor).connect(monitorDest);

      this.graph = { ctx, stream, source, pitch, robot, eq, master, analyser, out, monitor, monitorAudio };

      master.gain.value = this.masterLevel;
      monitor.gain.value = this.monitoring ? 1 : 0;
      this.applySettings(this.settings);
      await Promise.all([this.applyOutput(), this.applyMonitorDevice()]);
      await monitorAudio.play();
    } catch (e) {
      await this.stop();
      stream.getTracks().forEach((t) => t.stop());
      throw e;
    }
  }

  async stop(): Promise<void> {
    const g = this.graph;
    if (!g) return;
    this.graph = null;
    g.stream.getTracks().forEach((t) => t.stop());
    g.monitorAudio.pause();
    g.monitorAudio.srcObject = null;
    await g.ctx.close();
  }

  applySettings(settings: VoiceSettings): void {
    this.settings = settings;
    const g = this.graph;
    if (!g) return;
    g.pitch.setEnabled(settings.pitch.enabled);
    g.pitch.setSemitones(settings.pitch.semitones);
    g.robot.setEnabled(settings.robot.enabled);
    g.robot.setFrequency(settings.robot.frequency);
    g.eq.setBass(settings.eq.bass);
    g.eq.setTreble(settings.eq.treble);
  }

  setMonitoring(on: boolean): void {
    this.monitoring = on;
    this.ramp(this.graph?.monitor, on ? 1 : 0);
  }

  setMasterGain(level: number): void {
    this.masterLevel = level;
    this.ramp(this.graph?.master, level);
  }

  async setOutputDevice(id: string): Promise<void> {
    this.outputId = id;
    await this.applyOutput();
  }

  async setMonitorDevice(id: string): Promise<void> {
    this.monitorId = id;
    await this.applyMonitorDevice();
  }

  private async applyOutput(): Promise<void> {
    const g = this.graph;
    if (!g) return;
    const muted = this.outputId === NO_OUTPUT;
    this.ramp(g.out, muted ? 0 : 1);
    // AudioContext.setSinkId is Chromium-only and missing from lib.dom.
    if (!muted) await (g.ctx as AudioContext & { setSinkId(id: string): Promise<void> }).setSinkId(this.outputId);
  }

  private async applyMonitorDevice(): Promise<void> {
    await this.graph?.monitorAudio.setSinkId(this.monitorId);
  }

  private ramp(node: GainNode | undefined, value: number): void {
    if (!node || !this.graph) return;
    node.gain.setTargetAtTime(value, this.graph.ctx.currentTime, SMOOTHING_SECONDS);
  }
}
