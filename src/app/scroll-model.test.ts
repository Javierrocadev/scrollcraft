import { describe, expect, it } from "vitest";

import { generateScrollDrivenCss } from "./css-generator";
import { SCROLLCRAFT_CURATED_PRESETS } from "./presets";
import {
  calculateDocumentScrollProgress,
  calculateScrollProgress,
  evaluateCyclicScrollNorm,
  evaluateEasing,
  evaluateScrollSimulation,
  resolveRangeBoundaryOffset,
  type ScrollCraftConfig,
} from "./scroll-model";

const baseConfig: ScrollCraftConfig = {
  css: {
    includeSupports: false,
    rangeSyntax: "shorthand",
  },
  effect: {
    easing: "ease-out",
    intensity: 85,
    preset: "card-3d",
  },
  preview: {
    deviceMockup: "browser",
    exportHud: false,
    showHud: true,
  },
  timeline: {
    axis: "block",
    rangeEnd: { name: "cover", offset: 40 },
    rangeStart: { name: "entry", offset: 0 },
    type: "view",
  },
};

describe("scroll-model W3C ViewTimeline range math", () => {
  const viewportHeight = 400;
  const subjectHeight = 200;

  it("matches W3C critical thresholds for entry, cover, contain, and exit", () => {
    expect(
      resolveRangeBoundaryOffset({ name: "entry", offset: 0 }, viewportHeight, subjectHeight)
        .subjectPosPx,
    ).toBe(400);
    expect(
      resolveRangeBoundaryOffset({ name: "entry", offset: 100 }, viewportHeight, subjectHeight)
        .subjectPosPx,
    ).toBe(200);
    expect(
      resolveRangeBoundaryOffset({ name: "cover", offset: 0 }, viewportHeight, subjectHeight)
        .subjectPosPx,
    ).toBe(400);
    expect(
      resolveRangeBoundaryOffset({ name: "cover", offset: 50 }, viewportHeight, subjectHeight)
        .subjectPosPx,
    ).toBe(100);
    expect(
      resolveRangeBoundaryOffset({ name: "cover", offset: 100 }, viewportHeight, subjectHeight)
        .subjectPosPx,
    ).toBe(-200);
    expect(
      resolveRangeBoundaryOffset({ name: "contain", offset: 0 }, viewportHeight, subjectHeight)
        .subjectPosPx,
    ).toBe(200);
    expect(
      resolveRangeBoundaryOffset({ name: "contain", offset: 100 }, viewportHeight, subjectHeight)
        .subjectPosPx,
    ).toBe(0);
    expect(
      resolveRangeBoundaryOffset({ name: "exit", offset: 0 }, viewportHeight, subjectHeight)
        .subjectPosPx,
    ).toBe(0);
    expect(
      resolveRangeBoundaryOffset({ name: "exit", offset: 100 }, viewportHeight, subjectHeight)
        .subjectPosPx,
    ).toBe(-200);
  });

  it("evaluates calculateScrollProgress across entry 0%, cover 50%, and exit 100%", () => {
    const start = { name: "entry", offset: 0 } as const;
    const end = { name: "exit", offset: 100 } as const;

    expect(
      calculateScrollProgress(400, viewportHeight, subjectHeight, start, end),
    ).toBe(0);
    expect(
      calculateScrollProgress(100, viewportHeight, subjectHeight, start, end),
    ).toBeCloseTo(0.5, 6);
    expect(
      calculateScrollProgress(-200, viewportHeight, subjectHeight, start, end),
    ).toBe(1);

    // Clamps outside active range
    expect(
      calculateScrollProgress(520, viewportHeight, subjectHeight, start, end),
    ).toBe(0);
    expect(
      calculateScrollProgress(-300, viewportHeight, subjectHeight, start, end),
    ).toBe(1);
  });

  it("handles subjects taller than the viewport according to W3C contain/entry rules", () => {
    const tallSubject = 600;
    expect(
      resolveRangeBoundaryOffset({ name: "entry", offset: 100 }, 400, tallSubject)
        .subjectPosPx,
    ).toBe(0);
    expect(
      resolveRangeBoundaryOffset({ name: "contain", offset: 0 }, 400, tallSubject)
        .subjectPosPx,
    ).toBe(0);
    expect(
      resolveRangeBoundaryOffset({ name: "contain", offset: 100 }, 400, tallSubject)
        .subjectPosPx,
    ).toBe(-200);
  });

  it("evaluates document scroll() progress over percentage offsets", () => {
    expect(calculateDocumentScrollProgress(0, 0, 100)).toBe(0);
    expect(calculateDocumentScrollProgress(0.5, 0, 100)).toBe(0.5);
    expect(calculateDocumentScrollProgress(1, 0, 100)).toBe(1);
    expect(calculateDocumentScrollProgress(0.2, 0, 40)).toBeCloseTo(0.5, 6);
    expect(calculateDocumentScrollProgress(0.6, 0, 40)).toBe(1);
  });

  it("evaluates seamless cyclic scroll loop with exact start and end parity", () => {
    expect(evaluateCyclicScrollNorm(0)).toBeCloseTo(0, 8);
    expect(evaluateCyclicScrollNorm(0.5)).toBeCloseTo(1, 8);
    expect(evaluateCyclicScrollNorm(1)).toBeCloseTo(0, 8);
  });

  it("evaluates monotonic easing curves bounded in [0, 1]", () => {
    for (const easing of ["linear", "ease-out", "cubic-bezier"] as const) {
      expect(evaluateEasing(0, easing)).toBe(0);
      expect(evaluateEasing(1, easing)).toBe(1);
      const quarter = evaluateEasing(0.25, easing);
      const half = evaluateEasing(0.5, easing);
      expect(quarter).toBeGreaterThan(0);
      expect(half).toBeGreaterThan(quarter);
      expect(half).toBeLessThan(1);
    }
  });

  it("produces deterministic transforms for every curated preset", () => {
    for (const preset of SCROLLCRAFT_CURATED_PRESETS) {
      const sample = evaluateScrollSimulation(
        0.5,
        {
          ...baseConfig,
          effect: {
            easing: preset.effectEasing,
            intensity: preset.effectIntensity,
            preset: preset.effectPreset,
          },
          timeline: {
            axis: preset.timelineAxis,
            rangeEnd: { name: preset.rangeEndName, offset: preset.rangeEndOffset },
            rangeStart: {
              name: preset.rangeStartName,
              offset: preset.rangeStartOffset,
            },
            type: preset.timelineType,
          },
        },
        {
          subjectOffsetInScrollPx: 480,
          subjectSizePx: 220,
          totalScrollContentPx: 1200,
          viewportSizePx: 420,
        },
      );
      expect(sample.rawProgress).toBeGreaterThanOrEqual(0);
      expect(sample.rawProgress).toBeLessThanOrEqual(1);
      expect(sample.easedProgress).toBeGreaterThanOrEqual(0);
      expect(sample.easedProgress).toBeLessThanOrEqual(1);
    }
  });
});

describe("css-generator native CSS output", () => {
  it("generates distinct standard CSS for all 5 curated presets", () => {
    const outputs = SCROLLCRAFT_CURATED_PRESETS.map((preset) =>
      generateScrollDrivenCss({
        ...baseConfig,
        effect: {
          easing: preset.effectEasing,
          intensity: preset.effectIntensity,
          preset: preset.effectPreset,
        },
        timeline: {
          axis: preset.timelineAxis,
          rangeEnd: { name: preset.rangeEndName, offset: preset.rangeEndOffset },
          rangeStart: {
            name: preset.rangeStartName,
            offset: preset.rangeStartOffset,
          },
          type: preset.timelineType,
        },
      }),
    );

    const uniqueCss = new Set(outputs.map((item) => item.cssText));
    expect(uniqueCss.size).toBe(5);
    expect(outputs[0]?.cssText).toContain("animation-timeline: view(block);");
    expect(outputs[0]?.cssText).toContain("animation-range: entry 0% cover 40%;");
    expect(outputs[1]?.cssText).toContain("animation-timeline: scroll(root block);");
  });

  it("supports longhand animation-range and optional @supports fallback", () => {
    const output = generateScrollDrivenCss({
      ...baseConfig,
      css: {
        includeSupports: true,
        rangeSyntax: "longhand",
      },
    });

    expect(output.cssText).toContain("animation-range-start: entry 0%;");
    expect(output.cssText).toContain("animation-range-end: cover 40%;");
    expect(output.cssText).toContain("@supports (animation-timeline: view(block))");
  });
});
