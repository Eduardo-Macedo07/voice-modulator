export interface VoiceSettings {
  pitch: { enabled: boolean; semitones: number };
  robot: { enabled: boolean; frequency: number };
  distortion: { enabled: boolean; amount: number };
  bitcrusher: { enabled: boolean; bits: number; reduction: number };
  echo: { enabled: boolean; time: number; feedback: number; mix: number };
  reverb: { enabled: boolean; size: number; mix: number };
  /** Shelf gains in dB. */
  eq: { bass: number; treble: number };
}

export const DEFAULT_SETTINGS: VoiceSettings = {
  pitch: { enabled: false, semitones: 0 },
  robot: { enabled: false, frequency: 50 },
  distortion: { enabled: false, amount: 40 },
  bitcrusher: { enabled: false, bits: 8, reduction: 6 },
  echo: { enabled: false, time: 0.3, feedback: 0.4, mix: 0.5 },
  reverb: { enabled: false, size: 2, mix: 0.4 },
  eq: { bass: 0, treble: 0 },
};
