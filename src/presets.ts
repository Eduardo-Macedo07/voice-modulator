import { DEFAULT_SETTINGS, type VoiceSettings } from "./audio/settings";

export type PresetIcon = "mic" | "robot" | "squirrel" | "deep" | "radio" | "cave" | "demon" | "alien";

export interface Preset {
  name: string;
  icon: PresetIcon;
  settings: VoiceSettings;
}

type Overrides = { [K in keyof VoiceSettings]?: Partial<VoiceSettings[K]> };

/** Starts from the defaults so a preset only lists what makes it different. */
function settings(overrides: Overrides): VoiceSettings {
  const result = structuredClone(DEFAULT_SETTINGS);
  for (const key of Object.keys(overrides) as (keyof VoiceSettings)[]) {
    Object.assign(result[key], overrides[key]);
  }
  return result;
}

export const PRESETS: Preset[] = [
  { name: "Normal", icon: "mic", settings: settings({}) },
  {
    name: "Robot",
    icon: "robot",
    settings: settings({ robot: { enabled: true, frequency: 50 }, eq: { treble: 2 } }),
  },
  {
    name: "Squirrel",
    icon: "squirrel",
    settings: settings({ pitch: { enabled: true, semitones: 9 }, eq: { bass: -4, treble: 4 } }),
  },
  {
    name: "Deep",
    icon: "deep",
    settings: settings({ pitch: { enabled: true, semitones: -5 }, eq: { bass: 6, treble: -2 } }),
  },
  {
    name: "Radio",
    icon: "radio",
    settings: settings({
      bitcrusher: { enabled: true, bits: 10, reduction: 4 },
      distortion: { enabled: true, amount: 15 },
      eq: { bass: -8, treble: 5 },
    }),
  },
  {
    name: "Cave",
    icon: "cave",
    settings: settings({
      echo: { enabled: true, time: 0.45, feedback: 0.45, mix: 0.45 },
      reverb: { enabled: true, size: 3.5, mix: 0.7 },
    }),
  },
  {
    name: "Demon",
    icon: "demon",
    settings: settings({
      pitch: { enabled: true, semitones: -8 },
      distortion: { enabled: true, amount: 55 },
      reverb: { enabled: true, size: 1.5, mix: 0.35 },
      eq: { bass: 8 },
    }),
  },
  {
    name: "Alien",
    icon: "alien",
    settings: settings({
      pitch: { enabled: true, semitones: 4 },
      robot: { enabled: true, frequency: 110 },
      echo: { enabled: true, time: 0.18, feedback: 0.5, mix: 0.4 },
    }),
  },
];
