const SMOOTHING_SECONDS = 0.02;

export interface InputDevice {
  deviceId: string;
  label: string;
}

export async function listInputDevices(): Promise<InputDevice[]> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices
    .filter((d) => d.kind === "audioinput")
    .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${i + 1}` }));
}

/**
 * Mic → Master Gain ─┬→ Analyser
 *                    └→ Monitor Gain → destination (headphones)
 * Effects will be inserted between the source and the master gain.
 */
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private master: GainNode | null = null;
  private monitor: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private monitoring = false;
  private masterLevel = 1;

  get analyser(): AnalyserNode | null {
    return this.analyserNode;
  }

  get running(): boolean {
    return this.ctx !== null;
  }

  async start(deviceId?: string): Promise<void> {
    await this.stop();

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    const ctx = new AudioContext({ latencyHint: "interactive" });
    const source = ctx.createMediaStreamSource(stream);
    const master = ctx.createGain();
    const monitor = ctx.createGain();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;

    master.gain.value = this.masterLevel;
    monitor.gain.value = this.monitoring ? 1 : 0;

    source.connect(master);
    master.connect(analyser);
    master.connect(monitor);
    monitor.connect(ctx.destination);

    this.ctx = ctx;
    this.stream = stream;
    this.source = source;
    this.master = master;
    this.monitor = monitor;
    this.analyserNode = analyser;
  }

  async stop(): Promise<void> {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.source?.disconnect();
    this.master?.disconnect();
    this.monitor?.disconnect();
    await this.ctx?.close();
    this.ctx = null;
    this.stream = null;
    this.source = null;
    this.master = null;
    this.monitor = null;
    this.analyserNode = null;
  }

  setMonitoring(on: boolean): void {
    this.monitoring = on;
    this.ramp(this.monitor, on ? 1 : 0);
  }

  setMasterGain(level: number): void {
    this.masterLevel = level;
    this.ramp(this.master, level);
  }

  private ramp(node: GainNode | null, value: number): void {
    if (!node || !this.ctx) return;
    node.gain.setTargetAtTime(value, this.ctx.currentTime, SMOOTHING_SECONDS);
  }
}
