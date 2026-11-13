import {
  defineToolcraft,
  defineToolcraftCustomControlType,
  imageExportModule,
  timelineModule,
  videoExportModule,
} from "@/toolcraft/runtime";

import appDefaults from "./app-defaults.json" with { type: "json" };
import { appIdentity } from "./app-identity";
import { SCROLLCRAFT_CURATED_PRESETS } from "./presets";

export const CSS_INSPECTOR_CONTROL_TYPE =
  defineToolcraftCustomControlType("css-inspector");

export const appSchema = defineToolcraft({
  base: {
    canvas: {
      draggable: true,
      enabled: true,
      infinityBackgroundPolicy: "optional",
      renderScale: true,
      size: { height: 720, unit: "px", width: 1280 },
      sizing: { defaultMode: "finite", mode: "editable-output" },
      upload: false,
    },
    identity: appIdentity,
    panels: {
      controls: {
        sections: [
          {
            controls: {
              presetActions: {
                actions: SCROLLCRAFT_CURATED_PRESETS.map((preset) => ({
                  label: preset.label,
                  value: preset.id,
                })),
                applicability: { mode: "always" },
                description:
                  "Load curated CSS Scroll-Driven Animations configurations.",
                label: false,
                orderRole: "action",
                performanceRole: "responsiveness",
                target: "presets.quickSelect",
                type: "actions",
              },
            },
            description:
              "Apply curated modern CSS scroll animation patterns in one click.",
            id: "presets",
            title: "Curated Presets",
          },
          {
            controls: {
              timelineType: {
                applicability: { mode: "always" },
                defaultValue: "view",
                description:
                  "Choose element intersection (view()) or document scrollport progress (scroll()).",
                label: "Timeline source",
                options: [
                  { label: "view()", value: "view" },
                  { label: "scroll()", value: "scroll" },
                ],
                orderRole: "mode",
                performanceRole: "responsiveness",
                target: "timeline.type",
                type: "segmented",
              },
              timelineAxis: {
                applicability: { mode: "always" },
                defaultValue: "block",
                label: "Scroll axis",
                options: [
                  { label: "Block", value: "block" },
                  { label: "Inline", value: "inline" },
                ],
                orderRole: "mode",
                performanceRole: "responsiveness",
                target: "timeline.axis",
                type: "segmented",
              },
              rangeStartName: {
                applicability: {
                  all: [{ equals: "view", target: "timeline.type" }],
                  mode: "conditional",
                },
                defaultValue: "entry",
                label: "Range start",
                options: [
                  { label: "entry", value: "entry" },
                  { label: "cover", value: "cover" },
                  { label: "contain", value: "contain" },
                  { label: "exit", value: "exit" },
                ],
                orderRole: "primary",
                performanceRole: "responsiveness",
                target: "timeline.rangeStart.name",
                type: "select",
              },
              rangeEndName: {
                applicability: {
                  all: [{ equals: "view", target: "timeline.type" }],
                  mode: "conditional",
                },
                defaultValue: "cover",
                label: "Range end",
                options: [
                  { label: "entry", value: "entry" },
                  { label: "cover", value: "cover" },
                  { label: "contain", value: "contain" },
                  { label: "exit", value: "exit" },
                ],
                orderRole: "primary",
                performanceRole: "responsiveness",
                target: "timeline.rangeEnd.name",
                type: "select",
              },
              rangeStartOffset: {
                applicability: { mode: "always" },
                defaultValue: 0,
                label: "Start offset",
                max: 100,
                min: 0,
                orderRole: "strength",
                performanceRole: "responsiveness",
                sliderValueKind: "continuous",
                step: 1,
                target: "timeline.rangeStart.offset",
                type: "slider",
                unit: "%",
                variant: "continuous",
              },
              rangeEndOffset: {
                applicability: { mode: "always" },
                defaultValue: 40,
                label: "End offset",
                max: 100,
                min: 0,
                orderRole: "strength",
                performanceRole: "responsiveness",
                sliderValueKind: "continuous",
                step: 1,
                target: "timeline.rangeEnd.offset",
                type: "slider",
                unit: "%",
                variant: "continuous",
              },
            },
            description:
              "Configure W3C animation-timeline and animation-range start/end thresholds.",
            id: "timeline-range",
            title: "Timeline Range",
          },
          {
            controls: {
              effectPreset: {
                applicability: { mode: "always" },
                defaultValue: "card-3d",
                label: "Effect preset",
                options: SCROLLCRAFT_CURATED_PRESETS.map((preset) => ({
                  label: preset.label,
                  value: preset.effectPreset,
                })),
                orderRole: "mode",
                performanceRole: "responsiveness",
                target: "effect.preset",
                type: "select",
              },
              effectEasing: {
                applicability: { mode: "always" },
                defaultValue: "ease-out",
                label: "Timing curve",
                options: [
                  { label: "linear", value: "linear" },
                  { label: "ease-out", value: "ease-out" },
                  {
                    label: "cubic-bezier(0.22, 1, 0.36, 1)",
                    value: "cubic-bezier",
                  },
                ],
                orderRole: "primary",
                performanceRole: "responsiveness",
                target: "effect.easing",
                type: "select",
              },
              effectIntensity: {
                applicability: { mode: "always" },
                defaultValue: 85,
                label: "Effect intensity",
                max: 100,
                min: 0,
                orderRole: "strength",
                performanceRole: "responsiveness",
                sliderValueKind: "continuous",
                step: 1,
                target: "effect.intensity",
                type: "slider",
                variant: "continuous",
              },
            },
            description:
              "Select the CSS keyframe transformation, easing curve, and amplitude.",
            id: "scroll-effect",
            title: "Scroll Effect",
          },
          {
            controls: {
              deviceMockup: {
                applicability: { mode: "always" },
                defaultValue: "browser",
                label: "Device frame",
                options: [
                  { label: "Browser", value: "browser" },
                  { label: "Mobile", value: "mobile" },
                  { label: "Minimal", value: "minimal" },
                ],
                orderRole: "mode",
                performanceRole: "responsiveness",
                target: "preview.deviceMockup",
                type: "segmented",
              },
              showHud: {
                applicability: { mode: "always" },
                defaultValue: true,
                description:
                  "Display live green/red range boundaries and pixel progress telemetry.",
                label: "Range HUD",
                orderRole: "detail",
                performanceRole: "responsiveness",
                target: "preview.showHud",
                type: "switch",
              },
              exportHud: {
                applicability: {
                  all: [{ equals: true, target: "preview.showHud" }],
                  mode: "conditional",
                },
                defaultValue: false,
                description:
                  "Keep geometric range HUD guides visible inside exported PNG posters and videos.",
                label: "Export HUD",
                orderRole: "detail",
                performanceRole: "responsiveness",
                target: "preview.exportHud",
                type: "switch",
              },
            },
            description:
              "Switch the simulator frame and geometric range HUD visibility.",
            id: "viewport-simulator",
            layoutGroups: [
              {
                columns: 2,
                controls: ["showHud", "exportHud"],
                layout: "inline",
              },
            ],
            title: "Viewport Simulator",
          },
          {
            controls: {
              cssRangeSyntax: {
                applicability: { mode: "always" },
                defaultValue: "shorthand",
                label: "Range syntax",
                options: [
                  { label: "Shorthand", value: "shorthand" },
                  { label: "Split", value: "longhand" },
                ],
                orderRole: "mode",
                performanceRole: "responsiveness",
                target: "css.rangeSyntax",
                type: "segmented",
              },
              cssIncludeSupports: {
                applicability: { mode: "always" },
                defaultValue: false,
                label: "@supports fallback",
                orderRole: "primary",
                performanceRole: "responsiveness",
                target: "css.includeSupports",
                type: "switch",
              },
              cssInspector: {
                applicability: { mode: "always" },
                defaultValue: "ready",
                label: "Generated CSS",
                orderRole: "detail",
                performanceRole: "responsiveness",
                target: "css.inspector",
                type: CSS_INSPECTOR_CONTROL_TYPE,
              },
              cssCopyAction: {
                actions: [
                  {
                    icon: "copy",
                    label: "Copy CSS",
                    value: "copy-css",
                  },
                ],
                applicability: { mode: "always" },
                label: "Clipboard",
                orderRole: "action",
                performanceRole: "responsiveness",
                target: "css.copyAction",
                type: "actions",
              },
            },
            description:
              "Inspect and copy production Baseline 2026 CSS Scroll-Driven Animations code.",
            id: "css-output",
            title: "CSS Output",
          },
          {
            controls: {
              includeBackground: {
                applicability: { mode: "always" },
                defaultValue: true,
                label: "Background",
                performanceRole: "responsiveness",
                target: "export.includeBackground",
                type: "switch",
              },
              background: {
                applicability: { mode: "always" },
                defaultValue: "#0b1020",
                label: "Background color",
                orderRole: "color",
                performanceRole: "responsiveness",
                target: "appearance.background",
                type: "color",
              },
            },
            id: "background",
            title: "Background",
          },
        ],
        title: "Controls",
      },
    },
    persistence: {
      storage: "localStorage",
    },
    toolbar: {
      history: true,
      radar: true,
      theme: true,
      zoom: true,
    },
  },
  defaults: appDefaults,
  modules: [
    imageExportModule(),
    videoExportModule(),
    timelineModule({ defaultDurationSeconds: 4, mode: "playback" }),
  ],
});
