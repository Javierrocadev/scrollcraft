import type {
  CssRangeSyntax,
  DeviceMockup,
  EffectEasing,
  EffectPreset,
  RangeName,
  ScrollCraftConfig,
  TimelineAxis,
  TimelineType,
} from "./scroll-model";

function asEnum<const T extends readonly string[]>(
  value: unknown,
  allowed: T,
  fallback: T[number],
): T[number] {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T[number])
    : fallback;
}

function asNumber(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export const SCROLLCRAFT_EVALUATED_TARGETS = [
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
] as const;

export function readScrollCraftConfigFromValues(
  values: Readonly<Record<string, unknown>>,
): ScrollCraftConfig {
  return {
    css: {
      includeSupports: asBoolean(values["css.includeSupports"], false),
      rangeSyntax: asEnum(
        values["css.rangeSyntax"],
        ["shorthand", "longhand"] as const satisfies readonly CssRangeSyntax[],
        "shorthand",
      ),
    },
    effect: {
      easing: asEnum(
        values["effect.easing"],
        ["linear", "ease-out", "cubic-bezier"] as const satisfies readonly EffectEasing[],
        "ease-out",
      ),
      intensity: asNumber(values["effect.intensity"], 85, 0, 100),
      preset: asEnum(
        values["effect.preset"],
        [
          "card-3d",
          "scale-down",
          "progress-tracker",
          "parallax",
          "fade-blur",
        ] as const satisfies readonly EffectPreset[],
        "card-3d",
      ),
    },
    preview: {
      deviceMockup: asEnum(
        values["preview.deviceMockup"],
        ["browser", "mobile", "minimal"] as const satisfies readonly DeviceMockup[],
        "browser",
      ),
      exportHud: asBoolean(values["preview.exportHud"], false),
      showHud: asBoolean(values["preview.showHud"], true),
    },
    timeline: {
      axis: asEnum(
        values["timeline.axis"],
        ["block", "inline"] as const satisfies readonly TimelineAxis[],
        "block",
      ),
      rangeEnd: {
        name: asEnum(
          values["timeline.rangeEnd.name"],
          ["entry", "cover", "contain", "exit"] as const satisfies readonly RangeName[],
          "cover",
        ),
        offset: asNumber(values["timeline.rangeEnd.offset"], 40, 0, 100),
      },
      rangeStart: {
        name: asEnum(
          values["timeline.rangeStart.name"],
          ["entry", "cover", "contain", "exit"] as const satisfies readonly RangeName[],
          "entry",
        ),
        offset: asNumber(values["timeline.rangeStart.offset"], 0, 0, 100),
      },
      type: asEnum(
        values["timeline.type"],
        ["view", "scroll"] as const satisfies readonly TimelineType[],
        "view",
      ),
    },
  };
}
