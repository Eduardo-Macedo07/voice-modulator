import type { VoiceSettings } from "./audio/settings";

export interface Preset {
  name: string;
  settings: VoiceSettings;
}

export const PRESETS: Preset[] = [
  {
    name: "Normal",
    settings: {
      pitch: { enabled: false, semitones: 0 },
      robot: { enabled: false, frequency: 50 },
      eq: { bass: 0, treble: 0 },
    },
  },
  {
    name: "Robot",
    settings: {
      pitch: { enabled: false, semitones: 0 },
      robot: { enabled: true, frequency: 50 },
      eq: { bass: 0, treble: 2 },
    },
  },
  {
    name: "Squirrel",
    settings: {
      pitch: { enabled: true, semitones: 9 },
      robot: { enabled: false, frequency: 50 },
      eq: { bass: -4, treble: 4 },
    },
  },
  {
    name: "Deep",
    settings: {
      pitch: { enabled: true, semitones: -5 },
      robot: { enabled: false, frequency: 50 },
      eq: { bass: 6, treble: -2 },
    },
  },
];
