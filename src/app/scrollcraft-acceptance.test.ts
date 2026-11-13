import { describe, expect, it } from "vitest";

import { handleScrollCraftPanelAction } from "./app-composition";
import { generateScrollDrivenCss } from "./css-generator";
import { SCROLLCRAFT_CURATED_PRESETS } from "./presets";
import { readScrollCraftConfigFromValues } from "./scroll-config";
import {
  calculateDocumentScrollProgress,
  calculateScrollProgress,
  evaluateEasing,
  evaluateScrollSimulation,
  type ScrollCraftConfig,
} from "./scroll-model";
import { renderScrollCraftScene } from "./scroll-renderer";

interface RecordedCanvasCalls {
  fills: number;
}

function createCanvasSpy(): {
  calls: RecordedCanvasCalls;
  ctx: CanvasRenderingContext2D;
} {
  const calls: RecordedCanvasCalls = { fills: 0 };
  const gradientStub = { addColorStop: () => undefined };
  const ctx = {
    arc: () => undefined,
    arcTo: () => undefined,
    beginPath: () => undefined,
    clearRect: () => undefined,
    clip: () => undefined,
    closePath: () => undefined,
    createLinearGradient: () => gradientStub,
    createRadialGradient: () => gradientStub,
    fill: () => {
      calls.fills += 1;
    },
    fillRect: () => {
      calls.fills += 1;
    },
    fillStyle: "#000000",
    fillText: () => undefined,
    filter: "none",
    font: "12px sans-serif",
    globalAlpha: 1,
    lineTo: () => undefined,
    lineWidth: 1,
    measureText: (text: string) => ({ width: text.length * 7 }),
    moveTo: () => undefined,
    quadraticCurveTo: () => undefined,
    restore: () => undefined,
    rotate: () => undefined,
    save: () => undefined,
    scale: () => undefined,
    setLineDash: () => undefined,
    shadowBlur: 0,
    shadowColor: "transparent",
    shadowOffsetY: 0,
    stroke: () => undefined,
    strokeRect: () => undefined,
    strokeStyle: "#000000",
    textAlign: "left",
    textBaseline: "alphabetic",
    translate: () => undefined,
  } as unknown as CanvasRenderingContext2D;
  return { calls, ctx };
}

function defaultConfig(): ScrollCraftConfig {
  return readScrollCraftConfigFromValues({});
}

describe("ScrollCraft Studio presets, timeline, and effect acceptance", () => {
  it("presets populate schema values and simulator canvas", () => {
    const dispatches: Array<Record<string, unknown>> = [];
    expect(handleScrollCraftPanelAction).toBeDefined();

    for (const preset of SCROLLCRAFT_CURATED_PRESETS) {
      handleScrollCraftPanelAction({
        action: { label: preset.label, value: preset.id },
        dispatch: (action) => dispatches.push(action as Record<string, unknown>),
        reportFeedback: () => undefined,
        reportProgress: () => undefined,
        resolveMediaResource: async () => null,
        state: { values: {} } as never,
      });

      const { calls, ctx } = createCanvasSpy();
      renderScrollCraftScene(
        ctx,
        1280,
        720,
        {
          ...defaultConfig(),
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
        0.25,
      );

      expect(calls.fills).toBeGreaterThan(5);
    }

    expect(dispatches.length).toBe(SCROLLCRAFT_CURATED_PRESETS.length * 9);
  });

  it("timeline.type switches between view() and scroll()", () => {
    const viewCss = generateScrollDrivenCss({
      ...defaultConfig(),
      timeline: { ...defaultConfig().timeline, type: "view" },
    }).cssText;
    const scrollCss = generateScrollDrivenCss({
      ...defaultConfig(),
      timeline: { ...defaultConfig().timeline, type: "scroll" },
    }).cssText;

    expect(viewCss).toContain("animation-timeline: view(block);");
    expect(scrollCss).toContain("animation-timeline: scroll(root block);");
    expect(calculateDocumentScrollProgress(0.2, 0, 40)).toBeCloseTo(0.5, 6);
  });

  it("timeline.axis switches between block and inline", () => {
    const base = defaultConfig();
    const blockCss = generateScrollDrivenCss({
      ...base,
      timeline: { ...base.timeline, axis: "block" },
    }).cssText;
    const inlineCss = generateScrollDrivenCss({
      ...base,
      timeline: { ...base.timeline, axis: "inline" },
    }).cssText;

    expect(blockCss).toContain("view(block)");
    expect(inlineCss).toContain("view(inline)");
  });

  it("timeline.rangeStart.name updates entry/cover/contain/exit", () => {
    const base = defaultConfig();
    const outputs = (["entry", "cover", "contain", "exit"] as const).map(
      (name) =>
        generateScrollDrivenCss({
          ...base,
          timeline: {
            ...base.timeline,
            rangeStart: { ...base.timeline.rangeStart, name },
          },
        }).cssText,
    );

    expect(new Set(outputs).size).toBe(4);
    expect(outputs[2]).toContain("contain 0%");
  });

  it("timeline.rangeEnd.name updates entry/cover/contain/exit", () => {
    const base = defaultConfig();
    const outputs = (["entry", "cover", "contain", "exit"] as const).map(
      (name) =>
        generateScrollDrivenCss({
          ...base,
          timeline: {
            ...base.timeline,
            rangeEnd: { ...base.timeline.rangeEnd, name },
          },
        }).cssText,
    );

    expect(new Set(outputs).size).toBe(4);
    expect(outputs[3]).toContain("exit 40%");
  });

  it("timeline.rangeStart.offset shifts start threshold", () => {
    const low = calculateScrollProgress(
      360,
      400,
      200,
      { name: "entry", offset: 0 },
      { name: "exit", offset: 100 },
    );
    const shifted = calculateScrollProgress(
      360,
      400,
      200,
      { name: "entry", offset: 50 },
      { name: "exit", offset: 100 },
    );

    expect(low).toBeGreaterThan(shifted);
  });

  it("timeline.rangeEnd.offset shifts end threshold", () => {
    const wide = calculateScrollProgress(
      200,
      400,
      200,
      { name: "entry", offset: 0 },
      { name: "exit", offset: 100 },
    );
    const tight = calculateScrollProgress(
      200,
      400,
      200,
      { name: "entry", offset: 0 },
      { name: "cover", offset: 40 },
    );

    expect(tight).toBeGreaterThan(wide);
  });

  it("effect.preset renders all five CSS subject presets", () => {
    const base = defaultConfig();
    for (const preset of [
      "card-3d",
      "scale-down",
      "progress-tracker",
      "parallax",
      "fade-blur",
    ] as const) {
      const { calls, ctx } = createCanvasSpy();
      renderScrollCraftScene(
        ctx,
        1280,
        720,
        { ...base, effect: { ...base.effect, preset } },
        0.35,
      );
      expect(calls.fills).toBeGreaterThan(3);
    }
  });

  it("effect.easing changes curve interpolation and CSS output", () => {
    const base = defaultConfig();
    const linearVal = evaluateEasing(0.3, "linear");
    const easeOutVal = evaluateEasing(0.3, "ease-out");
    const cubicVal = evaluateEasing(0.3, "cubic-bezier");

    expect(easeOutVal).toBeGreaterThan(linearVal);
    expect(cubicVal).not.toBeCloseTo(linearVal, 3);
    expect(
      generateScrollDrivenCss({
        ...base,
        effect: { ...base.effect, easing: "cubic-bezier" },
      }).cssText,
    ).toContain("cubic-bezier(0.22, 1, 0.36, 1)");
  });

  it("effect.intensity scales transform amplitude", () => {
    const base = defaultConfig();
    const lowCss = generateScrollDrivenCss({
      ...base,
      effect: { ...base.effect, intensity: 10 },
    }).cssText;
    const highCss = generateScrollDrivenCss({
      ...base,
      effect: { ...base.effect, intensity: 100 },
    }).cssText;
    const lowSample = evaluateScrollSimulation(
      0.05,
      { ...base, effect: { ...base.effect, intensity: 10 } },
      {
        subjectOffsetInScrollPx: 480,
        subjectSizePx: 200,
        totalScrollContentPx: 1200,
        viewportSizePx: 400,
      },
    );
    const highSample = evaluateScrollSimulation(
      0.05,
      { ...base, effect: { ...base.effect, intensity: 100 } },
      {
        subjectOffsetInScrollPx: 480,
        subjectSizePx: 200,
        totalScrollContentPx: 1200,
        viewportSizePx: 400,
      },
    );

    expect(lowCss).not.toBe(highCss);
    expect(Math.abs(highSample.transform.translateYPx)).toBeGreaterThan(
      Math.abs(lowSample.transform.translateYPx),
    );
  });
});
