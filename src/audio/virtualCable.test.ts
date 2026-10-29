import { describe, expect, it } from "vitest";
import { findVirtualCable } from "./virtualCable";

const device = (label: string) => ({ deviceId: label, label });

describe("findVirtualCable", () => {
  it("finds the VB-Cable playback device", () => {
    const cable = device("CABLE Input (VB-Audio Virtual Cable)");
    expect(findVirtualCable([device("Speakers"), cable])).toBe(cable);
  });

  it("returns undefined when it is not installed", () => {
    expect(findVirtualCable([device("Speakers"), device("Headphones")])).toBeUndefined();
  });
});
