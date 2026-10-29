import { useCallback, useEffect, useRef, useState } from "react";
import { AudioEngine, NO_OUTPUT, listDevices, type AudioDevice } from "./audio/engine";
import { DEFAULT_SETTINGS, type VoiceSettings } from "./audio/settings";
import { VB_CABLE_URL, findVirtualCable } from "./audio/virtualCable";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Visualizer } from "./components/Visualizer";
import { PRESETS } from "./presets";
import "./App.css";

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

  // Send to the virtual cable the first time it shows up; after that the user's choice wins.
  useEffect(() => {
    if (!cable || autoSelectedCable.current) return;
    autoSelectedCable.current = true;
    setOutputId(cable.deviceId);
    engine.setOutputDevice(cable.deviceId).catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [cable, engine]);

  async function run(action: () => Promise<void>) {
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

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

  function update(next: VoiceSettings) {
    setSettings(next);
    engine.applySettings(next);
  }

  function choosePreset(name: string) {
    setPreset(name);
    const found = PRESETS.find((p) => p.name === name);
    if (found) update(found.settings);
  }

  /** Manual tweaks leave the preset behind. */
  function tweak(next: VoiceSettings) {
    setPreset("Custom");
    update(next);
  }

  return (
    <main className="app">
      <h1>Voice Modulator</h1>

      <Visualizer analyser={analyser} />

      <section className="panel">
        <div className="presets">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              className={p.name === preset ? "chip active" : "chip"}
              onClick={() => choosePreset(p.name)}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="effect">
          <label className="check">
            <input
              type="checkbox"
              checked={settings.pitch.enabled}
              onChange={(e) => tweak({ ...settings, pitch: { ...settings.pitch, enabled: e.currentTarget.checked } })}
            />
            Pitch: {settings.pitch.semitones > 0 ? "+" : ""}
            {settings.pitch.semitones} semitones
          </label>
          <input
            type="range"
            min={-12}
            max={12}
            step={1}
            value={settings.pitch.semitones}
            onChange={(e) => tweak({ ...settings, pitch: { enabled: true, semitones: Number(e.currentTarget.value) } })}
          />
        </div>

        <div className="effect">
          <label className="check">
            <input
              type="checkbox"
              checked={settings.robot.enabled}
              onChange={(e) => tweak({ ...settings, robot: { ...settings.robot, enabled: e.currentTarget.checked } })}
            />
            Robot: {settings.robot.frequency} Hz
          </label>
          <input
            type="range"
            min={20}
            max={200}
            step={1}
            value={settings.robot.frequency}
            onChange={(e) => tweak({ ...settings, robot: { enabled: true, frequency: Number(e.currentTarget.value) } })}
          />
        </div>

        <div className="effect">
          <label>
            Bass: {settings.eq.bass} dB
            <input
              type="range"
              min={-12}
              max={12}
              step={1}
              value={settings.eq.bass}
              onChange={(e) => tweak({ ...settings, eq: { ...settings.eq, bass: Number(e.currentTarget.value) } })}
            />
          </label>
          <label>
            Treble: {settings.eq.treble} dB
            <input
              type="range"
              min={-12}
              max={12}
              step={1}
              value={settings.eq.treble}
              onChange={(e) => tweak({ ...settings, eq: { ...settings.eq, treble: Number(e.currentTarget.value) } })}
            />
          </label>
        </div>
      </section>

      {labelsKnown && !cable && (
        <section className="panel setup">
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
          <button onClick={() => openUrl(VB_CABLE_URL).catch((e) => setError(String(e)))}>Download VB-Cable</button>
        </section>
      )}
      {cable && (
        <p className="hint ok">
          Virtual microphone ready: in other apps, choose "CABLE Output" as the microphone.
        </p>
      )}

      <section className="panel">
        <label>
          Microphone
          <select
            value={inputId}
            onChange={(e) => {
              setInputId(e.currentTarget.value);
              if (running) start(e.currentTarget.value);
            }}
          >
            <option value="">Default</option>
            {inputs.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Output for other apps (e.g. VB-Cable's "CABLE Input")
          <select
            value={outputId}
            onChange={(e) => {
              setOutputId(e.currentTarget.value);
              run(() => engine.setOutputDevice(e.currentTarget.value));
            }}
          >
            <option value={NO_OUTPUT}>None</option>
            {outputs.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </select>
        </label>

        <label className="check">
          <input
            type="checkbox"
            checked={monitoring}
            onChange={(e) => {
              setMonitoring(e.currentTarget.checked);
              engine.setMonitoring(e.currentTarget.checked);
            }}
          />
          Monitor (hear myself)
        </label>
        {monitoring && (
          <>
            <label>
              Monitor device
              <select
                value={monitorId}
                onChange={(e) => {
                  setMonitorId(e.currentTarget.value);
                  run(() => engine.setMonitorDevice(e.currentTarget.value));
                }}
              >
                <option value="">System default</option>
                {outputs.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="hint">Use headphones, or the speakers will feed back into the mic.</p>
          </>
        )}

        <label>
          Volume: {Math.round(gain * 100)}%
          <input
            type="range"
            min={0}
            max={2}
            step={0.01}
            value={gain}
            onChange={(e) => {
              setGain(Number(e.currentTarget.value));
              engine.setMasterGain(Number(e.currentTarget.value));
            }}
          />
        </label>

        <button className={running ? "stop" : "start"} onClick={() => (running ? stop() : start())}>
          {running ? "Stop" : "Start microphone"}
        </button>
        {error && <p className="error">{error}</p>}
      </section>
    </main>
  );
}

export default App;
