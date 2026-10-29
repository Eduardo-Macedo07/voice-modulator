import { useCallback, useEffect, useRef, useState } from "react";
import { AudioEngine, listInputDevices, type InputDevice } from "./audio/engine";
import { Visualizer } from "./components/Visualizer";
import "./App.css";

function App() {
  const engineRef = useRef<AudioEngine | null>(null);
  if (!engineRef.current) engineRef.current = new AudioEngine();
  const engine = engineRef.current;

  const [devices, setDevices] = useState<InputDevice[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [running, setRunning] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [gain, setGain] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const refreshDevices = useCallback(async () => {
    setDevices(await listInputDevices());
  }, []);

  useEffect(() => {
    refreshDevices().catch(() => {});
    return () => {
      engine.stop();
    };
  }, [engine, refreshDevices]);

  async function start(id = deviceId) {
    setError(null);
    try {
      await engine.start(id || undefined);
      setAnalyser(engine.analyser);
      setRunning(true);
      // Labels are only available after the user grants mic permission.
      await refreshDevices();
    } catch (e) {
      setRunning(false);
      setAnalyser(null);
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function stop() {
    await engine.stop();
    setAnalyser(null);
    setRunning(false);
  }

  function changeDevice(id: string) {
    setDeviceId(id);
    if (running) start(id);
  }

  function toggleMonitoring(on: boolean) {
    setMonitoring(on);
    engine.setMonitoring(on);
  }

  function changeGain(value: number) {
    setGain(value);
    engine.setMasterGain(value);
  }

  return (
    <main className="app">
      <h1>Voice Modulator</h1>

      <Visualizer analyser={analyser} />

      <section className="controls">
        <label>
          Microphone
          <select value={deviceId} onChange={(e) => changeDevice(e.currentTarget.value)}>
            <option value="">Default</option>
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Volume: {Math.round(gain * 100)}%
          <input
            type="range"
            min={0}
            max={2}
            step={0.01}
            value={gain}
            onChange={(e) => changeGain(Number(e.currentTarget.value))}
          />
        </label>

        <label className="check">
          <input
            type="checkbox"
            checked={monitoring}
            onChange={(e) => toggleMonitoring(e.currentTarget.checked)}
          />
          Monitor (hear myself)
        </label>
        {monitoring && <p className="hint">Use headphones, or the speakers will feed back into the mic.</p>}

        <button className={running ? "stop" : "start"} onClick={() => (running ? stop() : start())}>
          {running ? "Stop" : "Start microphone"}
        </button>
        {error && <p className="error">{error}</p>}
      </section>
    </main>
  );
}

export default App;
