import {
  defineToolcraftPerformance,
  defineToolcraftSchemaDiscreteFixtureAdapter,
  deriveToolcraftPerformancePaths,
  registerToolcraftRendererPipeline,
  type ToolcraftEnvelopePerformanceConfig,
  type ToolcraftPerformanceScenario,
  type ToolcraftRendererPipelinePassContract,
} from "@/toolcraft/runtime";

import { appSchema } from "./app-schema";
import type { ScrollSimulationSample } from "./scroll-model";

type ScrollCraftPassContracts = Readonly<{
  "simulate-scroll": ToolcraftRendererPipelinePassContract<ScrollSimulationSample>;
  "composite-simulator": ToolcraftRendererPipelinePassContract<void>;
  "export-frame": ToolcraftRendererPipelinePassContract<void>;
}>;

export const scrollCraftRendererPipelineRegistration =
  registerToolcraftRendererPipeline<ScrollCraftPassContracts>()({
    interactionInvalidation: [
      {
        interaction: "initial-render",
        invalidates: ["simulate-scroll", "composite-simulator"],
        targets: ["timeline.type", "effect.preset", "preview.deviceMockup"],
      },
      {
        interaction: "control-change",
        invalidates: ["simulate-scroll", "composite-simulator"],
        targets: [
          "timeline.type",
          "timeline.axis",
          "timeline.rangeStart.name",
          "timeline.rangeStart.offset",
          "timeline.rangeEnd.name",
          "timeline.rangeEnd.offset",
          "effect.preset",
          "effect.easing",
          "effect.intensity",
          "preview.deviceMockup",
          "preview.showHud",
          "preview.exportHud",
          "css.rangeSyntax",
          "css.includeSupports",
          "export.includeBackground",
          "appearance.background",
          "canvas.aspectRatio",
          "canvas.size.width",
          "canvas.size.height",
        ],
      },
      {
        interaction: "control-drag",
        invalidates: ["simulate-scroll", "composite-simulator"],
        targets: [
          "timeline.rangeStart.offset",
          "timeline.rangeEnd.offset",
          "effect.intensity",
        ],
      },
      {
        interaction: "viewport-zoom",
        invalidates: ["composite-simulator"],
        mustNotInvalidate: ["simulate-scroll"],
        targets: ["canvas.renderScale"],
      },
      {
        interaction: "timeline-playback",
        invalidates: ["simulate-scroll", "composite-simulator"],
        targets: ["timeline.currentTimeSeconds"],
      },
      {
        interaction: "timeline-scrub",
        invalidates: ["simulate-scroll", "composite-simulator"],
        targets: ["timeline.currentTimeSeconds"],
      },
      {
        interaction: "export",
        invalidates: ["simulate-scroll", "export-frame"],
        targets: [
          "export.image.format",
          "export.image.resolution",
          "export.video.format",
          "export.video.resolution",
        ],
      },
    ],
    passes: [
      {
        cost: {
          dimensions: [],
          frequency: "frame",
          relationship: "constant",
        },
        id: "simulate-scroll",
        inputs: [
          "timeline.type",
          "timeline.axis",
          "timeline.rangeStart.name",
          "timeline.rangeStart.offset",
          "timeline.rangeEnd.name",
          "timeline.rangeEnd.offset",
          "effect.preset",
          "effect.easing",
          "effect.intensity",
          "timeline.currentTimeSeconds",
        ],
        invalidatedBy: [
          "timeline.type",
          "timeline.axis",
          "timeline.rangeStart.name",
          "timeline.rangeStart.offset",
          "timeline.rangeEnd.name",
          "timeline.rangeEnd.offset",
          "effect.preset",
          "effect.easing",
          "effect.intensity",
          "timeline.currentTimeSeconds",
        ],
        kind: "vector-build",
        lifecycle: {
          cache: "none",
          resourceScope: "call",
        },
        output: "intermediate",
        quality: "preview",
        runsOn: "main",
        sceneBounds: {
          kind: "intrinsic",
          reason:
            "ScrollCraft Studio simulates a bounded device or browser viewport centered inside the finite canvas frame and clips all scrolling content inside the mockup viewport.",
        },
      },
      {
        cost: {
          dimensions: [],
          frequency: "frame",
          relationship: "constant",
        },
        id: "composite-simulator",
        inputs: [
          "simulate-scroll",
          "preview.deviceMockup",
          "preview.showHud",
          "canvas.size.width",
          "canvas.size.height",
          "canvas.renderScale",
        ],
        invalidatedBy: [
          "simulate-scroll",
          "preview.deviceMockup",
          "preview.showHud",
          "canvas.size.width",
          "canvas.size.height",
          "canvas.renderScale",
        ],
        kind: "composite",
        lifecycle: {
          cache: "none",
          resourceScope: "call",
        },
        output: "preview",
        quality: "retina",
        runsOn: "main",
        sceneBounds: {
          kind: "intrinsic",
          reason:
            "ScrollCraft Studio composites the device chrome, clipped viewport, and geometric range HUD strictly within the authored canvas frame.",
        },
      },
      {
        cost: {
          dimensions: ["image-export-resolution"],
          frequency: "batch",
          relationship: "linear",
        },
        id: "export-frame",
        inputs: [
          "simulate-scroll",
          "preview.exportHud",
          "export.includeBackground",
          "export.image.format",
          "export.image.resolution",
          "export.video.format",
          "export.video.resolution",
        ],
        invalidatedBy: [
          "simulate-scroll",
          "preview.exportHud",
          "export.includeBackground",
          "export.image.format",
          "export.image.resolution",
          "export.video.format",
          "export.video.resolution",
        ],
        kind: "export",
        lifecycle: {
          cache: "none",
          resourceScope: "call",
        },
        output: "export",
        quality: "export",
        runsOn: "export-only",
      },
    ],
    runtimeId: "scrollcraft-canvas2d-v1",
  });

const scrollCraftWorkloadEnvelope = {
  dimensions: [
    {
      batchMax: 33,
      defaultValue: 8,
      id: "image-export-resolution",
      mapping: "area" as const,
      source: {
        kind: "schema-target" as const,
        target: "export.image.resolution",
      },
      unit: "megapixels",
    },
  ],
} as const;

const derivedPaths = deriveToolcraftPerformancePaths(appSchema, {
  rendererPipeline: scrollCraftRendererPipelineRegistration,
  rendererStrategy: "canvas-2d",
  scenarios: [],
  usesCustomRenderer: true,
  workloadEnvelope: scrollCraftWorkloadEnvelope,
});

const pathScenarios: readonly ToolcraftPerformanceScenario[] = derivedPaths.map(
  (path) => {
    if (path.interaction === "export") {
      return {
        actionValue: "export.png",
        automated: true,
        automatedTestName: `perf: ${path.id}`,
        browser: true,
        browserTestName: `browser perf: ${path.id}`,
        completionEvidence: "download" as const,
        controlLabel: "Export PNG",
        coversTargets: path.targets,
        expectedObservable:
          "Exports crisp PNG poster or looping video frame matching the simulated scroll state.",
        fixture: "ScrollCraft Studio 1280x720 default viewport",
        id: `scenario.${path.interaction}`,
        interaction: "export" as const,
        pathId: path.id,
        target: path.targets[0],
      };
    }

    return {
      automated: true,
      automatedTestName: `perf: ${path.id}`,
      browser: true,
      browserTestName: `browser perf: ${path.id}`,
      coversTargets: path.targets,
      expectedObservable: `Updates the Canvas 2D simulator smoothly during ${path.interaction}.`,
      fixture: "ScrollCraft Studio 1280x720 default viewport",
      id: `scenario.${path.interaction}`,
      interaction: path.interaction,
      pathId: path.id,
      target: path.targets[0],
      uiSelector: "[data-scrollcraft-simulator-canvas]",
    };
  },
);

export const appPerformance: ToolcraftEnvelopePerformanceConfig =
  defineToolcraftPerformance({
    fixtureAdapters: {
      dimensions: {
        "image-export-resolution": defineToolcraftSchemaDiscreteFixtureAdapter(
          appSchema,
          {
            dimensionId: "image-export-resolution",
            entries: [
              { appliedValue: "2k", value: 2 },
              { appliedValue: "4k", value: 8 },
              { appliedValue: "8k", value: 33 },
            ],
            target: "export.image.resolution",
          },
        ),
      },
    },
    rendererPipeline: scrollCraftRendererPipelineRegistration,
    rendererStrategy: "canvas-2d",
    rendererTechnique: {
      exportRenderer: "canvas-2d",
      fidelityRisks: [
        "CSS backdrop-filter blur and perspective foreshortening are approximated analytically in Canvas 2D rather than browser DOM compositing.",
      ],
      layers: [
        {
          content: ["geometry", "text", "composite"],
          exportMode: "included",
          id: "scrollcraft-simulator-canvas",
          intentionalRasterizationReason:
            "Unified Canvas 2D simulator draws the device mockup, animated subject, and optional geometric range HUD so live 60fps playback and deterministic PNG/MP4 exports remain pixel-identical.",
          kind: "product-foreground",
          primitiveCount: "medium",
          renderer: "canvas-2d",
          uiSelector: "[data-scrollcraft-simulator-canvas]",
        },
      ],
      performanceRisks: [
        "High-radius canvas ctx.filter blur on large high-DPR frames during fade-blur or scale-down presets can increase software raster cost.",
      ],
      previewRenderer: "canvas-2d",
      productRepresentation: "pixel",
      rendererStrategy: "canvas-2d",
      sourceRepresentation: "procedural-data",
      whyNotAlternativeStrategies: [
        "DOM-only CSS rendering cannot render deterministic offline frame-by-frame PNG/MP4 exports without screen capture permissions.",
        "WebGL/WebGPU would add shader/pipeline overhead unnecessary for crisp 2D rounded vector mockups, typography, and dashed range guides.",
      ],
    },
    scenarios: pathScenarios,
    usesCustomRenderer: true,
    workloadEnvelope: scrollCraftWorkloadEnvelope,
  });
