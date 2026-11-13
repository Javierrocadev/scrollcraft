import type {
  EffectEasing,
  EffectPreset,
  RangeName,
  TimelineAxis,
  TimelineType,
} from "./scroll-model";

export type ScrollCraftPresetId =
  | "preset-card-3d"
  | "preset-sticky-header"
  | "preset-reading-progress"
  | "preset-parallax-depth"
  | "preset-stagger-list";

export type ScrollCraftPresetDefinition = Readonly<{
  description: string;
  effectEasing: EffectEasing;
  effectIntensity: number;
  effectPreset: EffectPreset;
  id: ScrollCraftPresetId;
  label: string;
  rangeEndName: RangeName;
  rangeEndOffset: number;
  rangeStartName: RangeName;
  rangeStartOffset: number;
  timelineAxis: TimelineAxis;
  timelineType: TimelineType;
}>;

export const SCROLLCRAFT_CURATED_PRESETS: readonly ScrollCraftPresetDefinition[] = [
  {
    description:
      "Product card tilts out of perspective and locks upright while entering the viewport.",
    effectEasing: "ease-out",
    effectIntensity: 85,
    effectPreset: "card-3d",
    id: "preset-card-3d",
    label: "3D Card Reveal",
    rangeEndName: "cover",
    rangeEndOffset: 40,
    rangeStartName: "entry",
    rangeStartOffset: 0,
    timelineAxis: "block",
    timelineType: "view",
  },
  {
    description:
      "Sticky navigation compacts smoothly with frosted blur across initial page scroll.",
    effectEasing: "ease-out",
    effectIntensity: 80,
    effectPreset: "scale-down",
    id: "preset-sticky-header",
    label: "Sticky Header Shrink",
    rangeEndName: "cover",
    rangeEndOffset: 35,
    rangeStartName: "entry",
    rangeStartOffset: 0,
    timelineAxis: "block",
    timelineType: "scroll",
  },
  {
    description:
      "Pinned top progress bar tracks global document scroll from 0% to 100%.",
    effectEasing: "linear",
    effectIntensity: 90,
    effectPreset: "progress-tracker",
    id: "preset-reading-progress",
    label: "Reading Progress Bar",
    rangeEndName: "cover",
    rangeEndOffset: 100,
    rangeStartName: "entry",
    rangeStartOffset: 0,
    timelineAxis: "block",
    timelineType: "scroll",
  },
  {
    description:
      "Layered editorial backdrop glides at a slower relative rate across the full view travel.",
    effectEasing: "linear",
    effectIntensity: 75,
    effectPreset: "parallax",
    id: "preset-parallax-depth",
    label: "Parallax Image Depth",
    rangeEndName: "exit",
    rangeEndOffset: 100,
    rangeStartName: "entry",
    rangeStartOffset: 0,
    timelineAxis: "block",
    timelineType: "view",
  },
  {
    description:
      "Kinetic list items fade and unblur into place through entry and contain ranges.",
    effectEasing: "cubic-bezier",
    effectIntensity: 85,
    effectPreset: "fade-blur",
    id: "preset-stagger-list",
    label: "Stagger Kinetic List",
    rangeEndName: "contain",
    rangeEndOffset: 65,
    rangeStartName: "entry",
    rangeStartOffset: 10,
    timelineAxis: "block",
    timelineType: "view",
  },
] as const;

export function findCuratedPresetById(
  id: string,
): ScrollCraftPresetDefinition | undefined {
  return SCROLLCRAFT_CURATED_PRESETS.find((preset) => preset.id === id);
}

export function findCuratedPresetByEffect(
  effectPreset: EffectPreset,
): ScrollCraftPresetDefinition | undefined {
  return SCROLLCRAFT_CURATED_PRESETS.find(
    (preset) => preset.effectPreset === effectPreset,
  );
}
