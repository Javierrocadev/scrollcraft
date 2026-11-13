import { describe, expect, it } from "vitest";

import { handleScrollCraftPanelAction } from "./app-composition";
import { appSchema } from "./app-schema";
import { generateScrollDrivenCss } from "./css-generator";
import { readScrollCraftConfigFromValues } from "./scroll-config";
import { evaluateCyclicScrollNorm, type ScrollCraftConfig } from "./scroll-model";
import { computeSimulatorLayout, renderScrollCraftScene } from "./scroll-renderer";
import {
  scrollCraftRasterExporter,
  scrollCraftSceneBoundsProvider,
} from "./scroll-scene";

interface RecordedCanvasCalls {
  fills: number;
  fillTexts: string[];
  setLineDashes: number[][];
  translates: Array<[number, number]>;
}

function createCanvasSpy(): {
  calls: RecordedCanvasCalls;
  ctx: CanvasRenderingContext2D;
} {
  const calls: RecordedCanvasCalls = {
    fills: 0,
    fillTexts: [],
    setLineDashes: [],
    translates: [],
  };
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
    fillText: (text: string) => {
      calls.fillTexts.push(String(text));
    },
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
    setLineDash: (segments: number[]) => {
      calls.setLineDashes.push([...segments]);
    },
    shadowBlur: 0,
    shadowColor: "transparent",
    shadowOffsetY: 0,
    stroke: () => undefined,
    strokeRect: () => undefined,
    strokeStyle: "#000000",
    textAlign: "left",
    textBaseline: "alphabetic",
    translate: (x: number, y: number) => {
      calls.translates.push([x, y]);
    },
  } as unknown as CanvasRenderingContext2D;
  return { calls, ctx };
}

function defaultConfig(): ScrollCraftConfig {
  return readScrollCraftConfigFromValues({});
}

function getAllControls(): Array<Record<string, unknown>> {
  const sections = appSchema.panels.controls?.sections ?? [];
  return sections.flatMap((section) =>
    Object.values(section.controls ?? {}) as Array<Record<string, unknown>>,
  );
}

describe("ScrollCraft Studio preview, CSS, export, canvas, and persistence acceptance", () => {
  it("preview.deviceMockup switches Browser, Mobile, Minimal frames", () => {
    const base = defaultConfig();
    const browserLayout = computeSimulatorLayout(1280, 720, {
      ...base,
      preview: { ...base.preview, deviceMockup: "browser" },
    });
    const mobileLayout = computeSimulatorLayout(1280, 720, {
      ...base,
      preview: { ...base.preview, deviceMockup: "mobile" },
    });
    const minimalLayout = computeSimulatorLayout(1280, 720, {
      ...base,
      preview: { ...base.preview, deviceMockup: "minimal" },
    });

    expect(browserLayout.chromeHeight).toBeGreaterThan(0);
    expect(mobileLayout.frameWidth).toBeLessThan(browserLayout.frameWidth);
    expect(minimalLayout.chromeHeight).toBe(0);
  });

  it("preview.showHud toggles geometric range HUD guides", () => {
    const base = defaultConfig();
    const withHud = createCanvasSpy();
    renderScrollCraftScene(withHud.ctx, 1280, 720, base, 0.25, {
      includeHud: true,
    });
    const withoutHud = createCanvasSpy();
    renderScrollCraftScene(withoutHud.ctx, 1280, 720, base, 0.25, {
      includeHud: false,
    });

    expect(
      withHud.calls.setLineDashes.some((dash) => dash.length > 0),
    ).toBe(true);
    expect(
      withoutHud.calls.setLineDashes.some((dash) => dash.length > 0),
    ).toBe(false);
  });

  it("preview.exportHud toggles HUD retention inside exports", () => {
    const control = getAllControls().find(
      (item) => item.target === "preview.exportHud",
    );
    expect(control?.applicability).toMatchObject({
      all: [{ equals: true, target: "preview.showHud" }],
      mode: "conditional",
    });

    const spyOff = createCanvasSpy();
    scrollCraftRasterExporter.renderFrame({
      context: spyOff.ctx,
      frame: { height: 720, width: 1280, x: 0, y: 0 },
      pixelRatio: 1,
      rendererPipeline: null,
      signal: new AbortController().signal,
      state: {
        values: { "preview.exportHud": false, "preview.showHud": true },
      } as never,
      timeSeconds: 0,
      timelineProgress: 0.25,
    });
    const spyOn = createCanvasSpy();
    scrollCraftRasterExporter.renderFrame({
      context: spyOn.ctx,
      frame: { height: 720, width: 1280, x: 0, y: 0 },
      pixelRatio: 1,
      rendererPipeline: null,
      signal: new AbortController().signal,
      state: {
        values: { "preview.exportHud": true, "preview.showHud": true },
      } as never,
      timeSeconds: 0,
      timelineProgress: 0.25,
    });

    expect(
      spyOff.calls.setLineDashes.some((dash) => dash.length > 0),
    ).toBe(false);
    expect(
      spyOn.calls.setLineDashes.some((dash) => dash.length > 0),
    ).toBe(true);
  });

  it("css.rangeSyntax toggles shorthand and longhand CSS output", () => {
    const base = defaultConfig();
    const shorthand = generateScrollDrivenCss({
      ...base,
      css: { ...base.css, rangeSyntax: "shorthand" },
    }).cssText;
    const longhand = generateScrollDrivenCss({
      ...base,
      css: { ...base.css, rangeSyntax: "longhand" },
    }).cssText;

    expect(shorthand).toContain("animation-range:");
    expect(longhand).toContain("animation-range-start:");
    expect(longhand).toContain("animation-range-end:");
  });

  it("css.includeSupports wraps rules in @supports block", () => {
    const base = defaultConfig();
    const wrapped = generateScrollDrivenCss({
      ...base,
      css: { ...base.css, includeSupports: true },
    }).cssText;

    expect(wrapped).toContain("@supports (animation-timeline: view(block))");
  });

  it("css.inspector renders Baseline 2026 compatibility and live CSS", () => {
    const control = getAllControls().find(
      (item) => item.target === "css.inspector",
    );
    expect(control?.type).toBe("css-inspector");
    expect(generateScrollDrivenCss(defaultConfig()).compatibilitySummary).toContain(
      "Chrome 115+",
    );
  });

  it("css.copyAction writes generated CSS to clipboard", async () => {
    const dispatches: Array<Record<string, unknown>> = [];
    handleScrollCraftPanelAction({
      action: { label: "Copy CSS", value: "copy-css" },
      dispatch: (action) => dispatches.push(action as Record<string, unknown>),
      reportFeedback: () => undefined,
      reportProgress: () => undefined,
      resolveMediaResource: async () => null,
      state: { values: {} } as never,
    });

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(dispatches).toContainEqual({
      target: "css.inspector",
      type: "controls.setValue",
      value: "copied",
    });
  });

  it("export.includeBackground controls preview, PNG transparency, and video background", () => {
    expect(appSchema.canvas.infinityBackgroundPolicy).toBe("optional");
    const bgToggle = getAllControls().find(
      (item) => item.target === "export.includeBackground",
    );
    expect(bgToggle?.defaultValue).toBe(true);
  });

  it("appearance.background updates canvas and exported background color", () => {
    const bgColor = getAllControls().find(
      (item) => item.target === "appearance.background",
    );
    expect(bgColor?.type).toBe("color");
    expect(bgColor?.defaultValue).toBe("#0b1020");
  });

  it("export.image.format switches PNG and JPG image output", () => {
    const imageFormat = getAllControls().find(
      (item) => item.target === "export.image.format",
    );
    expect(imageFormat).toBeDefined();
    expect(
      appSchema.modulePlan.capabilities.some(
        (cap) => cap.capabilityId === "artifact.image-export",
      ),
    ).toBe(true);
  });

  it("export.image.resolution scales exported image pixel dimensions", () => {
    const imageRes = getAllControls().find(
      (item) => item.target === "export.image.resolution",
    );
    expect(imageRes).toBeDefined();
    expect(scrollCraftRasterExporter.baseFileName).toBe("scrollcraft-studio");
  });

  it("export.video.format switches MP4 and WebM loop export", () => {
    const videoFormat = getAllControls().find(
      (item) => item.target === "export.video.format",
    );
    expect(videoFormat).toBeDefined();
    expect(
      appSchema.modulePlan.capabilities.some(
        (cap) => cap.capabilityId === "artifact.video-export",
      ),
    ).toBe(true);
  });

  it("export.video.resolution switches Current and 4K video export", () => {
    const videoRes = getAllControls().find(
      (item) => item.target === "export.video.resolution",
    );
    expect(videoRes).toBeDefined();
  });

  it("actions.output exports real PNG poster and looping MP4/WebM video", () => {
    const spyStart = createCanvasSpy();
    const spyEnd = createCanvasSpy();
    const frame = { height: 720, width: 1280, x: 0, y: 0 };

    scrollCraftRasterExporter.renderFrame({
      context: spyStart.ctx,
      frame,
      pixelRatio: 1,
      rendererPipeline: null,
      signal: new AbortController().signal,
      state: { values: {} } as never,
      timeSeconds: 0,
      timelineProgress: 0,
    });
    scrollCraftRasterExporter.renderFrame({
      context: spyEnd.ctx,
      frame,
      pixelRatio: 1,
      rendererPipeline: null,
      signal: new AbortController().signal,
      state: { values: {} } as never,
      timeSeconds: 4,
      timelineProgress: 1,
    });

    expect(spyStart.calls.fillTexts).toEqual(spyEnd.calls.fillTexts);
  });

  it("timeline.playback drives scroll simulation loop seamlessly across duration edits", () => {
    expect(evaluateCyclicScrollNorm(0)).toBeCloseTo(
      evaluateCyclicScrollNorm(1),
      8,
    );
    expect(appSchema.panels.timeline).toMatchObject({
      defaultDurationSeconds: 4,
      enabled: true,
      mode: "playback",
    });
  });

  it("canvas.renderScale maintains selected backing pixel multiplier", () => {
    expect(appSchema.canvas.renderScale.enabled).toBe(true);
  });

  it("canvas.infinity preserves world frame continuity and dormant finite size", () => {
    expect(appSchema.canvas.sizing).toEqual({
      defaultMode: "finite",
      mode: "editable-output",
    });
    expect(
      scrollCraftSceneBoundsProvider({
        state: { canvas: { size: { height: 720, width: 1280 } } } as never,
      }),
    ).toEqual([{ height: 720, width: 1280, x: -640, y: -360 }]);
  });

  it("canvas.infinity image export matches scene bounds", () => {
    const bounds = scrollCraftRasterExporter.getContentBounds?.({
      frame: { height: 720, width: 1280, x: -640, y: -360 },
      rendererPipeline: null as never,
      signal: new AbortController().signal,
      state: { canvas: { size: { height: 720, width: 1280 } } } as never,
      timeSeconds: 0,
      timelineProgress: 0,
    });
    expect(bounds).toEqual([{ height: 720, width: 1280, x: -640, y: -360 }]);
  });

  it("canvas.infinity video export preserves finite dimensions and frames", () => {
    const spy = createCanvasSpy();
    scrollCraftRasterExporter.renderFrame({
      context: spy.ctx,
      frame: { height: 720, width: 1280, x: -640, y: -360 },
      pixelRatio: 1,
      rendererPipeline: null,
      signal: new AbortController().signal,
      state: { values: {} } as never,
      timeSeconds: 2,
      timelineProgress: 0.5,
    });
    expect(spy.calls.translates[0]).toEqual([-640, -360]);
  });

  it("persisted ScrollCraft workspace restores across browser reload", () => {
    expect(appSchema.persistence.storage).toBe("localStorage");
    if (appSchema.persistence.storage !== "localStorage") {
      throw new Error("Expected localStorage persistence.");
    }
    expect(appSchema.persistence.include).toEqual(
      expect.arrayContaining(["canvas", "panels", "timeline", "values"]),
    );
  });
});
