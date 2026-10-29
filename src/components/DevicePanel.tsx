import { Cable, Headphones, Mic, Volume2 } from "lucide-react";
import { NO_OUTPUT, type AudioDevice } from "../audio/engine";
import { Slider } from "./Slider";

interface Props {
  inputs: AudioDevice[];
  outputs: AudioDevice[];
  inputId: string;
  outputId: string;
  monitorId: string;
  monitoring: boolean;
  gain: number;
  onInput: (id: string) => void;
  onOutput: (id: string) => void;
  onMonitorDevice: (id: string) => void;
  onMonitoring: (on: boolean) => void;
  onGain: (level: number) => void;
}

function DeviceSelect(props: {
  icon: typeof Mic;
  label: string;
  value: string;
  onChange: (id: string) => void;
  devices: AudioDevice[];
  firstOption: { value: string; label: string };
}) {
  const { icon: Icon, label, value, onChange, devices, firstOption } = props;
  return (
    <label className="field">
      <span className="field-label">
        <Icon size={15} />
        {label}
      </span>
      <select value={value} onChange={(e) => onChange(e.currentTarget.value)}>
        <option value={firstOption.value}>{firstOption.label}</option>
        {devices.map((d) => (
          <option key={d.deviceId} value={d.deviceId}>
            {d.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function DevicePanel(p: Props) {
  return (
    <div className="card devices">
      <DeviceSelect
        icon={Mic}
        label="Microphone"
        value={p.inputId}
        onChange={p.onInput}
        devices={p.inputs}
        firstOption={{ value: "", label: "Default" }}
      />
      <DeviceSelect
        icon={Cable}
        label="Output for other apps"
        value={p.outputId}
        onChange={p.onOutput}
        devices={p.outputs}
        firstOption={{ value: NO_OUTPUT, label: "None" }}
      />

      <div className="monitor">
        <label className="switch-row">
          <span className="field-label">
            <Headphones size={15} />
            Monitor (hear myself)
          </span>
          <span className="switch">
            <input type="checkbox" checked={p.monitoring} onChange={(e) => p.onMonitoring(e.currentTarget.checked)} />
            <span className="track" />
          </span>
        </label>
        {p.monitoring && (
          <>
            <DeviceSelect
              icon={Headphones}
              label="Monitor device"
              value={p.monitorId}
              onChange={p.onMonitorDevice}
              devices={p.outputs}
              firstOption={{ value: "", label: "System default" }}
            />
            <p className="hint">Use headphones, or the speakers will feed back into the mic.</p>
          </>
        )}
      </div>

      <div className="volume">
        <Volume2 size={18} />
        <Slider
          label="Volume"
          value={p.gain}
          min={0}
          max={2}
          step={0.01}
          display={`${Math.round(p.gain * 100)}%`}
          onChange={p.onGain}
        />
      </div>
    </div>
  );
}
