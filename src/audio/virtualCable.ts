import type { AudioDevice } from "./engine";

export const VB_CABLE_URL = "https://vb-audio.com/Cable/";

/** The playback side of VB-Cable, which other apps then see as a microphone called "CABLE Output". */
export function findVirtualCable(outputs: AudioDevice[]): AudioDevice | undefined {
  return outputs.find((d) => /CABLE Input/i.test(d.label));
}
