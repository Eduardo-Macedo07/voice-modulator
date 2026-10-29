export interface VoiceSettings {
  pitch: { enabled: boolean; semitones: number };
  robot: { enabled: boolean; frequency: number };
  /** Shelf gains in dB. */
  eq: { bass: number; treble: number };
}

export const DEFAULT_SETTINGS: VoiceSettings = {
  pitch: { enabled: false, semitones: 0 },
  robot: { enabled: false, frequency: 50 },
  eq: { bass: 0, treble: 0 },
};
