import { describe, expect, it } from "vitest";

import {
  appAcceptance,
  validateProductAcceptanceCoverage,
} from "./app-acceptance";
import { appPerformance } from "./app-performance";
import { appSchema } from "./app-schema";

describe("ScrollCraft Studio appSchema", () => {
  it("configures canvas, playback timeline, image/video export, and localStorage persistence", () => {
    expect(appSchema.canvas.enabled).toBe(true);
    expect(appSchema.canvas.sizing).toEqual({
      defaultMode: "finite",
      mode: "editable-output",
    });
    expect(appSchema.canvas.renderScale.enabled).toBe(true);
    expect(appSchema.canvas.upload).toBe(false);
    expect(appSchema.panels.layers).toBeUndefined();
    expect(appSchema.panels.timeline).toMatchObject({
      defaultDurationSeconds: 4,
      enabled: true,
      mode: "playback",
    });
    expect(appSchema.persistence.storage).toBe("localStorage");
    if (appSchema.persistence.storage !== "localStorage") {
      throw new Error("ScrollCraft Studio requires localStorage persistence.");
    }
    expect(appSchema.persistence.include).toEqual(
      expect.arrayContaining(["canvas", "panels", "timeline", "values"]),
    );

    expect(
      appSchema.modulePlan.capabilities.map(({ capabilityId }) => capabilityId),
    ).toEqual(
      expect.arrayContaining([
        "artifact.image-export",
        "artifact.video-export",
        "timeline.playback",
      ]),
    );
  });

  it("declares all five product control sections plus runtime Setup and export sections", () => {
    const sectionIds =
      appSchema.panels.controls?.sections.map((section) => section.id) ?? [];

    expect(sectionIds).toEqual(
      expect.arrayContaining([
        "runtime.defaults",
        "runtime.setup",
        "presets",
        "timeline-range",
        "scroll-effect",
        "viewport-simulator",
        "css-output",
        "runtime.image-export",
        "runtime.video-export",
        "runtime.export",
      ]),
    );
  });

  it("derives performance paths and validates complete product acceptance coverage", () => {
    expect(appPerformance.scenarios.length).toBeGreaterThan(0);
    expect(appPerformance.workloadEnvelope.dimensions.length).toBe(1);
    expect(
      appAcceptance.find((entry) => entry.id === "persistence.reload"),
    ).toBeDefined();
    expect(validateProductAcceptanceCoverage()).toEqual([]);
  });
});
