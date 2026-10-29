import type { CSSProperties } from "react";

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  /** Text shown next to the label. Defaults to the raw value. */
  display?: string;
  onChange: (value: number) => void;
}

export function Slider({ label, value, min, max, step, display, onChange }: Props) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <label className="slider">
      <span className="slider-head">
        <span>{label}</span>
        <output>{display ?? value}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ "--fill": `${fill}%` } as CSSProperties}
        onChange={(e) => onChange(Number(e.currentTarget.value))}
      />
    </label>
  );
}
