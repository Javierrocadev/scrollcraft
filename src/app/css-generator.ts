import type {
  EffectEasing,
  EffectPreset,
  ScrollCraftConfig,
} from "./scroll-model";

export type GeneratedScrollCssResult = Readonly<{
  compatibilitySummary: string;
  cssText: string;
  keyframeName: string;
  rangeSummary: string;
  selectorName: string;
  timelineRule: string;
}>;

function formatCssEasing(easing: EffectEasing): string {
  switch (easing) {
    case "linear":
      return "linear";
    case "ease-out":
      return "ease-out";
    case "cubic-bezier":
      return "cubic-bezier(0.22, 1, 0.36, 1)";
  }
}

function roundCss(value: number, digits = 2): string {
  const factor = 10 ** digits;
  const rounded = Math.round(value * factor) / factor;
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

function getSelectorForPreset(preset: EffectPreset): string {
  switch (preset) {
    case "card-3d":
      return ".card-3d-reveal";
    case "scale-down":
      return ".sticky-header";
    case "progress-tracker":
      return ".reading-progress-bar";
    case "parallax":
      return ".parallax-media-layer";
    case "fade-blur":
      return ".kinetic-list-item";
  }
}

function getKeyframeNameForPreset(preset: EffectPreset): string {
  switch (preset) {
    case "card-3d":
      return "scroll-card-3d";
    case "scale-down":
      return "scroll-sticky-shrink";
    case "progress-tracker":
      return "scroll-reading-progress";
    case "parallax":
      return "scroll-parallax-depth";
    case "fade-blur":
      return "scroll-stagger-fade-blur";
  }
}

function buildKeyframesBlock(
  keyframeName: string,
  preset: EffectPreset,
  intensity: number,
): string {
  const amp = Math.min(100, Math.max(0, intensity)) / 100;

  switch (preset) {
    case "card-3d": {
      const startOpacity = roundCss(Math.max(0.18, 1 - 0.82 * amp));
      const rotX = roundCss(28 * amp, 1);
      const rotY = roundCss(-12 * amp, 1);
      const scale = roundCss(1 - 0.18 * amp);
      const ty = roundCss(42 * amp, 1);
      return [
        `@keyframes ${keyframeName} {`,
        `  from {`,
        `    opacity: ${startOpacity};`,
        `    transform: perspective(720px) translateY(${ty}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale});`,
        `  }`,
        `  to {`,
        `    opacity: 1;`,
        `    transform: perspective(720px) translateY(0px) rotateX(0deg) rotateY(0deg) scale(1);`,
        `  }`,
        `}`,
      ].join("\n");
    }
    case "scale-down": {
      const padY = roundCss(20 - 10 * amp, 0);
      const blur = roundCss(10 * amp, 1);
      const scale = roundCss(1 - 0.28 * amp);
      return [
        `@keyframes ${keyframeName} {`,
        `  from {`,
        `    padding-block: 20px;`,
        `    backdrop-filter: blur(0px);`,
        `    transform: scale(1);`,
        `  }`,
        `  to {`,
        `    padding-block: ${padY}px;`,
        `    backdrop-filter: blur(${blur}px);`,
        `    transform: scale(${scale});`,
        `  }`,
        `}`,
      ].join("\n");
    }
    case "progress-tracker": {
      return [
        `@keyframes ${keyframeName} {`,
        `  from {`,
        `    transform: scaleX(0);`,
        `    transform-origin: left center;`,
        `  }`,
        `  to {`,
        `    transform: scaleX(1);`,
        `    transform-origin: left center;`,
        `  }`,
        `}`,
      ].join("\n");
    }
    case "parallax": {
      const shift = roundCss(68 * amp, 1);
      const scale = roundCss(1 + 0.14 * amp);
      return [
        `@keyframes ${keyframeName} {`,
        `  from {`,
        `    transform: translateY(${shift}px) scale(${scale});`,
        `  }`,
        `  to {`,
        `    transform: translateY(-${shift}px) scale(1);`,
        `  }`,
        `}`,
      ].join("\n");
    }
    case "fade-blur": {
      const startOpacity = roundCss(Math.max(0.08, 1 - 0.92 * amp));
      const blur = roundCss(14 * amp, 1);
      const ty = roundCss(34 * amp, 1);
      const scale = roundCss(1 - 0.08 * amp);
      return [
        `@keyframes ${keyframeName} {`,
        `  from {`,
        `    opacity: ${startOpacity};`,
        `    filter: blur(${blur}px);`,
        `    transform: translateY(${ty}px) scale(${scale});`,
        `  }`,
        `  to {`,
        `    opacity: 1;`,
        `    filter: blur(0px);`,
        `    transform: translateY(0px) scale(1);`,
        `  }`,
        `}`,
      ].join("\n");
    }
  }
}

export function generateScrollDrivenCss(
  config: ScrollCraftConfig,
): GeneratedScrollCssResult {
  const { timeline, effect, css } = config;
  const selectorName = getSelectorForPreset(effect.preset);
  const keyframeName = getKeyframeNameForPreset(effect.preset);
  const easingCss = formatCssEasing(effect.easing);
  const axisSuffix = timeline.axis === "inline" ? " inline" : "";

  const timelineRule =
    timeline.type === "view"
      ? `view(${timeline.axis})`
      : `scroll(root ${timeline.axis})`;

  const rangeStartToken =
    timeline.type === "view"
      ? `${timeline.rangeStart.name} ${Math.round(timeline.rangeStart.offset)}%`
      : `${Math.round(timeline.rangeStart.offset)}%`;
  const rangeEndToken =
    timeline.type === "view"
      ? `${timeline.rangeEnd.name} ${Math.round(timeline.rangeEnd.offset)}%`
      : `${Math.round(timeline.rangeEnd.offset)}%`;

  const rangeSummary = `${rangeStartToken} ${rangeEndToken}`;

  const keyframes = buildKeyframesBlock(
    keyframeName,
    effect.preset,
    effect.intensity,
  );

  const rangeLines =
    css.rangeSyntax === "shorthand"
      ? [`  animation-range: ${rangeStartToken} ${rangeEndToken};`]
      : [
          `  animation-range-start: ${rangeStartToken};`,
          `  animation-range-end: ${rangeEndToken};`,
        ];

  const ruleLines = [
    `${selectorName} {`,
    `  animation: ${keyframeName} ${easingCss} both;`,
    `  animation-timeline: ${timelineRule};`,
    ...rangeLines,
    `}`,
  ];

  const baseRuleBlock = ruleLines.join("\n");
  const supportsQuery =
    timeline.type === "view"
      ? `(animation-timeline: view(${axisSuffix.trim() || "block"}))`
      : `(animation-timeline: scroll())`;

  const bodyBlock = css.includeSupports
    ? [
        `${selectorName} {`,
        `  /* Graceful static fallback when Scroll-Driven Animations are unsupported */`,
        `  opacity: 1;`,
        `  transform: none;`,
        `}`,
        ``,
        `@supports ${supportsQuery} {`,
        ...ruleLines.map((line) => `  ${line}`),
        `}`,
      ].join("\n")
    : baseRuleBlock;

  return {
    compatibilitySummary: "Chrome 115+, Edge 115+, Safari 26, Firefox 159",
    cssText: `${keyframes}\n\n${bodyBlock}`,
    keyframeName,
    rangeSummary,
    selectorName,
    timelineRule,
  };
}
