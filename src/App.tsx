import { openUrl } from "@tauri-apps/plugin-opener";
import {
  AudioLines,
  AudioWaveform,
  Binary,
  Bot,
  Download,
  Power,
  Repeat2,
  SlidersHorizontal,
  Waves,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AudioEngine, NO_OUTPUT, listDevices, type AudioDevice } from "./audio/engine";
import { DEFAULT_SETTINGS, type VoiceSettings } from "./audio/settings";
import { VB_CABLE_URL, findVirtualCable } from "./audio/virtualCable";
import { DevicePanel } from "./components/DevicePanel";
import { EffectCard } from "./components/EffectCard";
import { PresetGrid } from "./components/PresetGrid";
import { Slider } from "./components/Slider";
import { Visualizer } from "./components/Visualizer";
import { PRESETS } from "./presets";
import "./App.css";

const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);
const percent = (n: number) => `${Math.round(n * 100)}%`;

function App() {
  const engineRef = useRef<AudioEngine | null>(null);
  if (!engineRef.current) engineRef.current = new AudioEngine();
  const engine = engineRef.current;

  const [inputs, setInputs] = useState<AudioDevice[]>([]);
  const [outputs, setOutputs] = useState<AudioDevice[]>([]);
  const [inputId, setInputId] = useState("");
  const [outputId, setOutputId] = useState(NO_OUTPUT);
  const [monitorId, setMonitorId] = useState("");
  const [running, setRunning] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [gain, setGain] = useState(1);
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);
  const [preset, setPreset] = useState("Normal");
  const [error, setError] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  // Output device labels stay empty until the user has granted mic permission.
  const [labelsKnown, setLabelsKnown] = useState(false);
  const autoSelectedCable = useRef(false);
  const cable = findVirtualCable(outputs);

  const refreshDevices = useCallback(async () => {
    const [i, o] = await Promise.all([listDevices("audioinput"), listDevices("audiooutput")]);
    setInputs(i);
    setOutputs(o);
  }, []);

  useEffect(() => {
    refreshDevices().catch(() => {});
    // Fires when the virtual cable driver is installed while the app is open.
    navigator.mediaDevices.addEventListener("devicechange", refreshDevices);
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", refreshDevices);
      engine.stop();
    };
  }, [engine, refreshDevices]);

  async function run(action: () => Promise<void>) {
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  // Send to the virtual cable the first time it shows up; after that the user's choice wins.
  useEffect(() => {
    if (!cable || autoSelectedCable.current) return;
    autoSelectedCable.current = true;
    setOutputId(cable.deviceId);
    run(() => engine.setOutputDevice(cable.deviceId));
  }, [cable, engine]);

  const start = (id = inputId) =>
    run(async () => {
      try {
        await engine.start(id || undefined);
      } catch (e) {
        setRunning(false);
        setAnalyser(null);
        throw e;
      }
      setAnalyser(engine.analyser);
      setRunning(true);
      setLabelsKnown(true);
      // Device labels are only available after the user grants mic permission.
      await refreshDevices();
    });

  const stop = () =>
    run(async () => {
      await engine.stop();
      setAnalyser(null);
      setRunning(false);
    });

  function choosePreset(name: string) {
    const found = PRESETS.find((p) => p.name === name);
    if (!found) return;
    setPreset(name);
    setSettings(found.settings);
    engine.applySettings(found.settings);
  }

  /** Manual tweaks leave the preset behind. */
  function tweak<K extends keyof VoiceSettings>(key: K, patch: Partial<VoiceSettings[K]>) {
    const next = { ...settings, [key]: { ...settings[key], ...patch } };
    setPreset("Custom");
    setSettings(next);
    engine.applySettings(next);
  }

  const { pitch, robot, distortion, bitcrusher, echo, reverb, eq } = settings;

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">
            <AudioLines size={22} />
          </span>
          <div>
            <h1>Voice Modulator</h1>
            <span className={running ? "status live" : "status"}>{running ? "Live" : "Off"}</span>
          </div>
        </div>
        <button className={running ? "power on" : "power"} onClick={() => (running ? stop() : start())}>
          <Power size={18} />
          {running ? "Stop" : "Start"}
        </button>
      </header>

      {error && <p className="notice error">{error}</p>}

      {labelsKnown && !cable && (
        <section className="card setup">
          <strong>Use your voice in Discord, WhatsApp Web, games…</strong>
          <p>
            Other apps need a virtual microphone, and Windows needs a small driver for that. The free VB-Cable
            provides one:
          </p>
          <ol>
            <li>Download VB-Cable and run the installer as administrator.</li>
            <li>Come back here: it is detected automatically and selected as the output.</li>
            <li>In Discord (or any app), choose "CABLE Output" as the microphone.</li>
          </ol>
          <button className="secondary" onClick={() => openUrl(VB_CABLE_URL).catch((e) => setError(String(e)))}>
            <Download size={16} />
            Download VB-Cable
          </button>
        </section>
      )}
      {cable && (
        <p className="notice ok">Virtual microphone ready: in other apps, choose "CABLE Output" as the microphone.</p>
      )}

      <div className="card visualizer-card">
        <Visualizer analyser={analyser} />
        {!running && <span className="visualizer-empty">Press Start to begin</span>}
      </div>

      <section>
        <h2>Voice</h2>
        <PresetGrid active={preset} onSelect={choosePreset} />
      </section>

      <section>
        <h2>Effects</h2>
        <div className="effects">
          <EffectCard
            icon={AudioWaveform}
            title="Pitch"
            enabled={pitch.enabled}
            onToggle={(enabled) => tweak("pitch", { enabled })}
          >
            <Slider
              label="Shift"
              value={pitch.semitones}
              min={-12}
              max={12}
              step={1}
              display={`${signed(pitch.semitones)} st`}
              onChange={(semitones) => tweak("pitch", { semitones, enabled: true })}
            />
          </EffectCard>

          <EffectCard icon={Bot} title="Robot" enabled={robot.enabled} onToggle={(enabled) => tweak("robot", { enabled })}>
            <Slider
              label="Frequency"
              value={robot.frequency}
              min={20}
              max={200}
              step={1}
              display={`${robot.frequency} Hz`}
              onChange={(frequency) => tweak("robot", { frequency, enabled: true })}
            />
          </EffectCard>

          <EffectCard
            icon={Zap}
            title="Distortion"
            enabled={distortion.enabled}
            onToggle={(enabled) => tweak("distortion", { enabled })}
          >
            <Slider
              label="Drive"
              value={distortion.amount}
              min={0}
              max={100}
              step={1}
              display={`${distortion.amount}%`}
              onChange={(amount) => tweak("distortion", { amount, enabled: true })}
            />
          </EffectCard>

          <EffectCard
            icon={Binary}
            title="Bitcrusher"
            enabled={bitcrusher.enabled}
            onToggle={(enabled) => tweak("bitcrusher", { enabled })}
          >
            <Slider
              label="Bit depth"
              value={bitcrusher.bits}
              min={1}
              max={16}
              step={1}
              display={`${bitcrusher.bits} bit`}
              onChange={(bits) => tweak("bitcrusher", { bits, enabled: true })}
            />
            <Slider
              label="Downsample"
              value={bitcrusher.reduction}
              min={1}
              max={40}
              step={1}
              display={`${bitcrusher.reduction}×`}
              onChange={(reduction) => tweak("bitcrusher", { reduction, enabled: true })}
            />
          </EffectCard>

          <EffectCard icon={Repeat2} title="Echo" enabled={echo.enabled} onToggle={(enabled) => tweak("echo", { enabled })}>
            <Slider
              label="Time"
              value={echo.time}
              min={0.05}
              max={1}
              step={0.01}
              display={`${Math.round(echo.time * 1000)} ms`}
              onChange={(time) => tweak("echo", { time, enabled: true })}
            />
            <Slider
              label="Feedback"
              value={echo.feedback}
              min={0}
              max={0.9}
              step={0.01}
              display={percent(echo.feedback)}
              onChange={(feedback) => tweak("echo", { feedback, enabled: true })}
            />
            <Slider
              label="Mix"
              value={echo.mix}
              min={0}
              max={1}
              step={0.01}
              display={percent(echo.mix)}
              onChange={(mix) => tweak("echo", { mix, enabled: true })}
            />
          </EffectCard>

          <EffectCard
            icon={Waves}
            title="Reverb"
            enabled={reverb.enabled}
            onToggle={(enabled) => tweak("reverb", { enabled })}
          >
            <Slider
              label="Room size"
              value={reverb.size}
              min={0.5}
              max={4}
              step={0.1}
              display={`${reverb.size.toFixed(1)} s`}
              onChange={(size) => tweak("reverb", { size, enabled: true })}
            />
            <Slider
              label="Mix"
              value={reverb.mix}
              min={0}
              max={1}
              step={0.01}
              display={percent(reverb.mix)}
              onChange={(mix) => tweak("reverb", { mix, enabled: true })}
            />
          </EffectCard>

          <EffectCard icon={SlidersHorizontal} title="Equalizer">
            <Slider
              label="Bass"
              value={eq.bass}
              min={-12}
              max={12}
              step={1}
              display={`${signed(eq.bass)} dB`}
              onChange={(bass) => tweak("eq", { bass })}
            />
            <Slider
              label="Treble"
              value={eq.treble}
              min={-12}
              max={12}
              step={1}
              display={`${signed(eq.treble)} dB`}
              onChange={(treble) => tweak("eq", { treble })}
            />
          </EffectCard>
        </div>
      </section>

      <section>
        <h2>Audio</h2>
        <DevicePanel
          inputs={inputs}
          outputs={outputs}
          inputId={inputId}
          outputId={outputId}
          monitorId={monitorId}
          monitoring={monitoring}
          gain={gain}
          onInput={(id) => {
            setInputId(id);
            if (running) start(id);
          }}
          onOutput={(id) => {
            setOutputId(id);
            run(() => engine.setOutputDevice(id));
          }}
          onMonitorDevice={(id) => {
            setMonitorId(id);
            run(() => engine.setMonitorDevice(id));
          }}
          onMonitoring={(on) => {
            setMonitoring(on);
            engine.setMonitoring(on);
          }}
          onGain={(level) => {
            setGain(level);
            engine.setMasterGain(level);
          }}
        />
      </section>
    </main>
  );
}

export default App;
