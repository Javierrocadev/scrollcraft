export type TimelineType = "view" | "scroll";
export type TimelineAxis = "block" | "inline";
export type RangeName = "entry" | "cover" | "exit" | "contain";
export type EffectPreset =
  | "card-3d"
  | "scale-down"
  | "progress-tracker"
  | "parallax"
  | "fade-blur";
export type EffectEasing = "linear" | "ease-out" | "cubic-bezier";
export type DeviceMockup = "browser" | "mobile" | "minimal";
export type CssRangeSyntax = "shorthand" | "longhand";

export type RangeEndpoint = Readonly<{
  name: RangeName;
  offset: number;
}>;

export type ScrollCraftTimelineConfig = Readonly<{
  axis: TimelineAxis;
  rangeEnd: RangeEndpoint;
  rangeStart: RangeEndpoint;
  type: TimelineType;
}>;

export type ScrollCraftEffectConfig = Readonly<{
  easing: EffectEasing;
  intensity: number;
  preset: EffectPreset;
}>;

export type ScrollCraftPreviewConfig = Readonly<{
  deviceMockup: DeviceMockup;
  exportHud: boolean;
  showHud: boolean;
}>;

export type ScrollCraftCssConfig = Readonly<{
  includeSupports: boolean;
  rangeSyntax: CssRangeSyntax;
}>;

export type ScrollCraftConfig = Readonly<{
  css: ScrollCraftCssConfig;
  effect: ScrollCraftEffectConfig;
  preview: ScrollCraftPreviewConfig;
  timeline: ScrollCraftTimelineConfig;
}>;

export type ScrollSubjectTransform = Readonly<{
  blurPx: number;
  fgOffsetPx: number;
  headerShrink: number;
  opacity: number;
  parallaxOffsetPx: number;
  progressRatio: number;
  rotateXDeg: number;
  rotateYDeg: number;
  scale: number;
  translateYPx: number;
}>;

export type RangeBoundaryResolution = Readonly<{
  enteredPx: number;
  subjectPosPx: number;
}>;

export type ScrollSimulationSample = Readonly<{
  boundaryEndPx: number;
  boundaryStartPx: number;
  easedProgress: number;
  rawProgress: number;
  scrollOffsetPx: number;
  scrollPortNorm: number;
  subjectPosPx: number;
  subjectSizePx: number;
  transform: ScrollSubjectTransform;
  viewportSizePx: number;
}>;

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Smooth periodic scroll curve y(t) = (1 - cos(2 * pi * t)) / 2 over t in [0, 1].
 * Guarantees seamless video loops and exact start/end phase parity (y(0) === y(1) === 0).
 */
export function evaluateCyclicScrollNorm(normalizedTime: number): number {
  const wrapped = ((normalizedTime % 1) + 1) % 1;
  return 0.5 * (1 - Math.cos(2 * Math.PI * wrapped));
}

function solveCubicBezierYForX(
  xTarget: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const x = clamp01(xTarget);
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  const sampleCurveX = (u: number): number => {
    const inv = 1 - u;
    return 3 * inv * inv * u * x1 + 3 * inv * u * u * x2 + u * u * u;
  };
  const sampleCurveY = (u: number): number => {
    const inv = 1 - u;
    return 3 * inv * inv * u * y1 + 3 * inv * u * u * y2 + u * u * u;
  };

  let low = 0;
  let high = 1;
  let u = x;
  for (let i = 0; i < 18; i += 1) {
    const estimated = sampleCurveX(u);
    if (Math.abs(estimated - x) < 1e-6) break;
    if (estimated < x) {
      low = u;
    } else {
      high = u;
    }
    u = 0.5 * (low + high);
  }
  return sampleCurveY(u);
}

export function evaluateEasing(progress: number, easing: EffectEasing): number {
  const p = clamp01(progress);
  switch (easing) {
    case "linear":
      return p;
    case "ease-out":
      return solveCubicBezierYForX(p, 0, 0, 0.58, 1);
    case "cubic-bezier":
      return solveCubicBezierYForX(p, 0.22, 1, 0.36, 1);
  }
}

/**
 * Resolves a W3C CSS Scroll-Driven Animations Level 1 ViewTimeline named range boundary.
 *
 * Coordinate convention along the active scroll axis:
 * - `subjectPosPx` (y) is the subject's leading edge relative to the viewport's leading edge.
 * - `enteredPx = viewportSizePx - subjectPosPx` increases monotonically as scroll advances.
 *   * entry 0%   => entered = 0              (y = V)
 *   * entry 100% => entered = min(V, S)      (y = V - S when S <= V)
 *   * exit 0%    => entered = max(V, S)      (y = 0 when S <= V)
 *   * exit 100%  => entered = V + S          (y = -S)
 *   * cover p%   => entered = (p/100)*(V+S)
 *   * contain p% => entered = min(V,S) + (p/100)*|V - S|
 */
export function resolveRangeBoundaryOffset(
  range: RangeEndpoint,
  viewportSizePx: number,
  subjectSizePx: number,
): RangeBoundaryResolution {
  const safeViewport = Math.max(1, viewportSizePx);
  const safeSubject = Math.max(1, subjectSizePx);
  const pct = Math.min(100, Math.max(0, range.offset)) / 100;
  const minDim = Math.min(safeViewport, safeSubject);
  const maxDim = Math.max(safeViewport, safeSubject);

  let enteredPx = 0;
  switch (range.name) {
    case "entry":
      enteredPx = pct * minDim;
      break;
    case "exit":
      enteredPx = maxDim + pct * minDim;
      break;
    case "cover":
      enteredPx = pct * (safeViewport + safeSubject);
      break;
    case "contain":
      enteredPx = minDim + pct * Math.abs(safeViewport - safeSubject);
      break;
  }

  return {
    enteredPx,
    subjectPosPx: safeViewport - enteredPx,
  };
}

/**
 * Evaluates view() progress in [0, 1] (or unclamped when `clamp: false`)
 * from subject leading edge position, viewport size, subject size, and range bounds.
 */
export function calculateScrollProgress(
  subjectTop: number,
  viewportHeight: number,
  subjectHeight: number,
  rangeStart: RangeEndpoint,
  rangeEnd: RangeEndpoint,
  options?: Readonly<{ clamp?: boolean }>,
): number {
  const startBoundary = resolveRangeBoundaryOffset(
    rangeStart,
    viewportHeight,
    subjectHeight,
  );
  const endBoundary = resolveRangeBoundaryOffset(
    rangeEnd,
    viewportHeight,
    subjectHeight,
  );
  const currentEntered = viewportHeight - subjectTop;
  const span = endBoundary.enteredPx - startBoundary.enteredPx;

  let raw: number;
  if (Math.abs(span) < 1e-6) {
    raw = currentEntered >= endBoundary.enteredPx ? 1 : 0;
  } else {
    raw = (currentEntered - startBoundary.enteredPx) / span;
  }

  return options?.clamp === false ? raw : clamp01(raw);
}

/**
 * Evaluates scroll() progress from overall scrollport progress [0, 1] and percentage range offsets.
 */
export function calculateDocumentScrollProgress(
  scrollNorm: number,
  startOffsetPct: number,
  endOffsetPct: number,
  options?: Readonly<{ clamp?: boolean }>,
): number {
  const startNorm = Math.min(100, Math.max(0, startOffsetPct)) / 100;
  const endNorm = Math.min(100, Math.max(0, endOffsetPct)) / 100;
  const span = endNorm - startNorm;

  let raw: number;
  if (Math.abs(span) < 1e-6) {
    raw = scrollNorm >= endNorm ? 1 : 0;
  } else {
    raw = (scrollNorm - startNorm) / span;
  }

  return options?.clamp === false ? raw : clamp01(raw);
}

export function evaluateEffectTransform(
  easedProgress: number,
  effect: ScrollCraftEffectConfig,
): ScrollSubjectTransform {
  const p = clamp01(easedProgress);
  const amp = Math.min(100, Math.max(0, effect.intensity)) / 100;

  switch (effect.preset) {
    case "card-3d":
      return {
        blurPx: 0,
        fgOffsetPx: 0,
        headerShrink: 0,
        opacity: lerp(Math.max(0.18, 1 - 0.82 * amp), 1, p),
        parallaxOffsetPx: 0,
        progressRatio: p,
        rotateXDeg: lerp(28 * amp, 0, p),
        rotateYDeg: lerp(-12 * amp, 0, p),
        scale: lerp(1 - 0.18 * amp, 1, p),
        translateYPx: lerp(42 * amp, 0, p),
      };
    case "parallax":
      return {
        blurPx: 0,
        fgOffsetPx: lerp(20 * amp, -20 * amp, p),
        headerShrink: 0,
        opacity: 1,
        parallaxOffsetPx: lerp(68 * amp, -68 * amp, p),
        progressRatio: p,
        rotateXDeg: 0,
        rotateYDeg: 0,
        scale: lerp(1 + 0.14 * amp, 1, p),
        translateYPx: 0,
      };
    case "fade-blur":
      return {
        blurPx: lerp(14 * amp, 0, p),
        fgOffsetPx: 0,
        headerShrink: 0,
        opacity: lerp(Math.max(0.08, 1 - 0.92 * amp), 1, p),
        parallaxOffsetPx: 0,
        progressRatio: p,
        rotateXDeg: 0,
        rotateYDeg: 0,
        scale: lerp(1 - 0.08 * amp, 1, p),
        translateYPx: lerp(34 * amp, 0, p),
      };
    case "scale-down":
      return {
        blurPx: lerp(0, 10 * amp, p),
        fgOffsetPx: 0,
        headerShrink: p * amp,
        opacity: 1,
        parallaxOffsetPx: 0,
        progressRatio: p,
        rotateXDeg: 0,
        rotateYDeg: 0,
        scale: lerp(1, 1 - 0.28 * amp, p),
        translateYPx: 0,
      };
    case "progress-tracker":
      return {
        blurPx: 0,
        fgOffsetPx: 0,
        headerShrink: 0,
        opacity: 1,
        parallaxOffsetPx: 0,
        progressRatio: p,
        rotateXDeg: 0,
        rotateYDeg: 0,
        scale: lerp(1, 1 + 0.03 * amp, p),
        translateYPx: 0,
      };
  }
}

export function evaluateScrollSimulation(
  scrollPortNorm: number,
  config: ScrollCraftConfig,
  geometry: Readonly<{
    subjectOffsetInScrollPx: number;
    subjectSizePx: number;
    totalScrollContentPx: number;
    viewportSizePx: number;
  }>,
): ScrollSimulationSample {
  const norm = clamp01(scrollPortNorm);
  const maxScrollPx = Math.max(
    1,
    geometry.totalScrollContentPx - geometry.viewportSizePx,
  );
  const scrollOffsetPx = norm * maxScrollPx;
  const subjectPosPx = geometry.subjectOffsetInScrollPx - scrollOffsetPx;

  let rawProgress: number;
  let boundaryStartPx: number;
  let boundaryEndPx: number;

  if (config.timeline.type === "scroll") {
    rawProgress = calculateDocumentScrollProgress(
      norm,
      config.timeline.rangeStart.offset,
      config.timeline.rangeEnd.offset,
    );
    boundaryStartPx =
      (config.timeline.rangeStart.offset / 100) * geometry.viewportSizePx;
    boundaryEndPx =
      (config.timeline.rangeEnd.offset / 100) * geometry.viewportSizePx;
  } else {
    rawProgress = calculateScrollProgress(
      subjectPosPx,
      geometry.viewportSizePx,
      geometry.subjectSizePx,
      config.timeline.rangeStart,
      config.timeline.rangeEnd,
    );
    boundaryStartPx = resolveRangeBoundaryOffset(
      config.timeline.rangeStart,
      geometry.viewportSizePx,
      geometry.subjectSizePx,
    ).subjectPosPx;
    boundaryEndPx = resolveRangeBoundaryOffset(
      config.timeline.rangeEnd,
      geometry.viewportSizePx,
      geometry.subjectSizePx,
    ).subjectPosPx;
  }

  const easedProgress = evaluateEasing(rawProgress, config.effect.easing);
  const transform = evaluateEffectTransform(easedProgress, config.effect);

  return {
    boundaryEndPx,
    boundaryStartPx,
    easedProgress,
    rawProgress,
    scrollOffsetPx,
    scrollPortNorm: norm,
    subjectPosPx,
    subjectSizePx: geometry.subjectSizePx,
    transform,
    viewportSizePx: geometry.viewportSizePx,
  };
}
