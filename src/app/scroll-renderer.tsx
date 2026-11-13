import {
  clamp01,
  evaluateCyclicScrollNorm,
  evaluateScrollSimulation,
  type ScrollCraftConfig,
  type ScrollSimulationSample,
} from "./scroll-model";
import {
  drawAnimatedSubject,
  drawContextualBlocks,
  roundRectPath,
  type SimulatorFrameRect,
} from "./scroll-renderer-subjects";

export type { SimulatorFrameRect };

export function computeSimulatorLayout(
  canvasWidth: number,
  canvasHeight: number,
  config: ScrollCraftConfig,
): SimulatorFrameRect {
  const padX = Math.max(24, canvasWidth * 0.06);
  const padY = Math.max(24, canvasHeight * 0.06);
  const availW = Math.max(220, canvasWidth - padX * 2);
  const availH = Math.max(200, canvasHeight - padY * 2);

  let frameWidth = availW;
  let frameHeight = availH;
  let chromeHeight = 44;

  if (config.preview.deviceMockup === "mobile") {
    const targetAspect = 9 / 16;
    frameHeight = Math.min(availH, 620);
    frameWidth = Math.min(availW, frameHeight * targetAspect);
    frameHeight = frameWidth / targetAspect;
    chromeHeight = Math.max(28, frameHeight * 0.07);
  } else if (config.preview.deviceMockup === "browser") {
    frameWidth = Math.min(availW, Math.max(460, availH * 1.48));
    frameHeight = Math.min(availH, frameWidth / 1.48);
    chromeHeight = Math.max(38, frameHeight * 0.082);
  } else {
    frameWidth = Math.min(availW, availH * 1.42);
    frameHeight = Math.min(availH, frameWidth / 1.42);
    chromeHeight = 0;
  }

  const frameX = (canvasWidth - frameWidth) * 0.5;
  const frameY = (canvasHeight - frameHeight) * 0.5;
  const inset = config.preview.deviceMockup === "mobile" ? 10 : 0;

  return {
    chromeHeight,
    frameHeight,
    frameWidth,
    frameX,
    frameY,
    viewportHeight: Math.max(120, frameHeight - chromeHeight - inset * 2),
    viewportWidth: Math.max(140, frameWidth - inset * 2),
    viewportX: frameX + inset,
    viewportY: frameY + chromeHeight + inset,
  };
}

export function computeScrollSampleForLayout(
  layout: SimulatorFrameRect,
  config: ScrollCraftConfig,
  scrollPortNorm: number,
): ScrollSimulationSample {
  const isInline = config.timeline.axis === "inline";
  const viewportSizePx = isInline ? layout.viewportWidth : layout.viewportHeight;
  const isFullSpan =
    config.effect.preset === "scale-down" ||
    config.effect.preset === "progress-tracker";

  const subjectSizePx = isFullSpan
    ? Math.round(viewportSizePx * 0.24)
    : Math.round(viewportSizePx * 0.44);
  const totalScrollContentPx = Math.round(viewportSizePx * 2.9);
  const subjectOffsetInScrollPx = Math.round(viewportSizePx * 1.25);

  return evaluateScrollSimulation(scrollPortNorm, config, {
    subjectOffsetInScrollPx,
    subjectSizePx,
    totalScrollContentPx,
    viewportSizePx,
  });
}

function drawDeviceChrome(
  ctx: CanvasRenderingContext2D,
  layout: SimulatorFrameRect,
  config: ScrollCraftConfig,
): void {
  const { frameX, frameY, frameWidth, frameHeight, chromeHeight } = layout;
  const radius =
    config.preview.deviceMockup === "mobile"
      ? 34
      : config.preview.deviceMockup === "browser"
        ? 18
        : 14;

  ctx.save();
  ctx.shadowColor = "rgba(12, 15, 12, 0.55)";
  ctx.shadowBlur = 42;
  ctx.shadowOffsetY = 18;
  roundRectPath(ctx, frameX, frameY, frameWidth, frameHeight, radius);
  ctx.fillStyle = "#292c29";
  ctx.fill();
  ctx.restore();

  roundRectPath(ctx, frameX, frameY, frameWidth, frameHeight, radius);
  ctx.strokeStyle =
    config.preview.deviceMockup === "mobile"
      ? "rgba(172, 179, 168, 0.36)"
      : "rgba(172, 179, 168, 0.24)";
  ctx.lineWidth = config.preview.deviceMockup === "mobile" ? 3 : 1.5;
  ctx.stroke();

  if (config.preview.deviceMockup === "browser") {
    ctx.save();
    roundRectPath(ctx, frameX, frameY, frameWidth, frameHeight, radius);
    ctx.clip();

    ctx.fillStyle = "#252825";
    ctx.fillRect(frameX, frameY, frameWidth, chromeHeight);
    ctx.fillStyle = "rgba(172, 179, 168, 0.14)";
    ctx.fillRect(frameX, frameY + chromeHeight - 1, frameWidth, 1);

    const dotY = frameY + chromeHeight * 0.5;
    const dotColors = ["#d8a89c", "#c8ba97", "#adc5b0"];
    dotColors.forEach((color, idx) => {
      ctx.beginPath();
      ctx.arc(frameX + 20 + idx * 16, dotY, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });

    const pillW = Math.min(300, frameWidth * 0.45);
    const pillH = Math.max(20, chromeHeight * 0.54);
    const pillX = frameX + (frameWidth - pillW) * 0.5;
    const pillY = frameY + (chromeHeight - pillH) * 0.5;
    roundRectPath(ctx, pillX, pillY, pillW, pillH, 8);
    ctx.fillStyle = "rgba(27, 31, 27, 0.72)";
    ctx.fill();
    ctx.strokeStyle = "rgba(172, 179, 168, 0.18)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#a4aaa2";
    ctx.font = "500 11px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      `scroll-timeline: ${config.timeline.type}(${config.timeline.axis})`,
      pillX + pillW * 0.5,
      pillY + pillH * 0.5,
    );
    ctx.restore();
  } else if (config.preview.deviceMockup === "mobile") {
    const islandW = Math.min(104, frameWidth * 0.34);
    const islandH = 18;
    const islandX = frameX + (frameWidth - islandW) * 0.5;
    const islandY = frameY + 14;
    roundRectPath(ctx, islandX, islandY, islandW, islandH, 9);
    ctx.fillStyle = "#131513";
    ctx.fill();
  }
}


function drawVirtualScrollbar(
  ctx: CanvasRenderingContext2D,
  layout: SimulatorFrameRect,
  config: ScrollCraftConfig,
  scrollPortNorm: number,
): void {
  const isInline = config.timeline.axis === "inline";
  if (isInline) {
    const trackX = layout.viewportX + 12;
    const trackY = layout.viewportY + layout.viewportHeight - 10;
    const trackW = Math.max(40, layout.viewportWidth - 24);
    const thumbW = Math.max(36, trackW * 0.28);
    const thumbX = trackX + (trackW - thumbW) * clamp01(scrollPortNorm);

    roundRectPath(ctx, trackX, trackY, trackW, 5, 2.5);
    ctx.fillStyle = "rgba(172, 179, 168, 0.16)";
    ctx.fill();
    roundRectPath(ctx, thumbX, trackY, thumbW, 5, 2.5);
    ctx.fillStyle = "rgba(184, 203, 178, 0.72)";
    ctx.fill();
  } else {
    const trackX = layout.viewportX + layout.viewportWidth - 10;
    const trackY = layout.viewportY + 12;
    const trackH = Math.max(40, layout.viewportHeight - 24);
    const thumbH = Math.max(36, trackH * 0.28);
    const thumbY = trackY + (trackH - thumbH) * clamp01(scrollPortNorm);

    roundRectPath(ctx, trackX, trackY, 5, trackH, 2.5);
    ctx.fillStyle = "rgba(172, 179, 168, 0.16)";
    ctx.fill();
    roundRectPath(ctx, trackX, thumbY, 5, thumbH, 2.5);
    ctx.fillStyle = "rgba(184, 203, 178, 0.72)";
    ctx.fill();
  }
}

function drawGeometricHud(
  ctx: CanvasRenderingContext2D,
  layout: SimulatorFrameRect,
  config: ScrollCraftConfig,
  sample: ScrollSimulationSample,
): void {
  const isInline = config.timeline.axis === "inline";
  const startLabel =
    config.timeline.type === "view"
      ? `START: ${config.timeline.rangeStart.name} ${Math.round(config.timeline.rangeStart.offset)}%`
      : `START: ${Math.round(config.timeline.rangeStart.offset)}%`;
  const endLabel =
    config.timeline.type === "view"
      ? `END: ${config.timeline.rangeEnd.name} ${Math.round(config.timeline.rangeEnd.offset)}%`
      : `END: ${Math.round(config.timeline.rangeEnd.offset)}%`;

  ctx.save();
  if (isInline) {
    const sx = Math.max(
      layout.viewportX + 2,
      Math.min(layout.viewportX + layout.viewportWidth - 2, layout.viewportX + sample.boundaryStartPx),
    );
    const ex = Math.max(
      layout.viewportX + 2,
      Math.min(layout.viewportX + layout.viewportWidth - 2, layout.viewportX + sample.boundaryEndPx),
    );

    ctx.fillStyle = "rgba(173, 197, 176, 0.08)";
    ctx.fillRect(Math.min(sx, ex), layout.viewportY, Math.abs(ex - sx), layout.viewportHeight);

    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 2;

    ctx.strokeStyle = "rgba(173, 197, 176, 0.9)";
    ctx.beginPath();
    ctx.moveTo(sx, layout.viewportY);
    ctx.lineTo(sx, layout.viewportY + layout.viewportHeight);
    ctx.stroke();

    ctx.strokeStyle = "rgba(216, 168, 156, 0.9)";
    ctx.beginPath();
    ctx.moveTo(ex, layout.viewportY);
    ctx.lineTo(ex, layout.viewportY + layout.viewportHeight);
    ctx.stroke();
  } else {
    const sy = Math.max(
      layout.viewportY + 2,
      Math.min(layout.viewportY + layout.viewportHeight - 2, layout.viewportY + sample.boundaryStartPx),
    );
    const ey = Math.max(
      layout.viewportY + 2,
      Math.min(layout.viewportY + layout.viewportHeight - 2, layout.viewportY + sample.boundaryEndPx),
    );

    ctx.fillStyle = "rgba(173, 197, 176, 0.07)";
    ctx.fillRect(layout.viewportX, Math.min(sy, ey), layout.viewportWidth, Math.abs(ey - sy));

    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 2;

    ctx.strokeStyle = "rgba(173, 197, 176, 0.9)";
    ctx.beginPath();
    ctx.moveTo(layout.viewportX, sy);
    ctx.lineTo(layout.viewportX + layout.viewportWidth, sy);
    ctx.stroke();

    ctx.fillStyle = "#adc5b0";
    roundRectPath(ctx, layout.viewportX + 10, Math.max(layout.viewportY + 8, sy - 24), 138, 20, 6);
    ctx.fill();
    ctx.fillStyle = "#213126";
    ctx.font = "700 10px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(startLabel, layout.viewportX + 18, Math.max(layout.viewportY + 18, sy - 14));

    ctx.strokeStyle = "rgba(216, 168, 156, 0.9)";
    ctx.beginPath();
    ctx.moveTo(layout.viewportX, ey);
    ctx.lineTo(layout.viewportX + layout.viewportWidth, ey);
    ctx.stroke();

    ctx.fillStyle = "#d8a89c";
    roundRectPath(ctx, layout.viewportX + 10, Math.min(layout.viewportY + layout.viewportHeight - 28, ey + 6), 138, 20, 6);
    ctx.fill();
    ctx.fillStyle = "#382821";
    ctx.fillText(
      endLabel,
      layout.viewportX + 18,
      Math.min(layout.viewportY + layout.viewportHeight - 18, ey + 16),
    );
  }

  // Telemetry chip
  ctx.setLineDash([]);
  const chipW = 198;
  const chipH = 54;
  const chipX = layout.viewportX + layout.viewportWidth - chipW - 18;
  const chipY = layout.viewportY + layout.viewportHeight - chipH - 18;
  roundRectPath(ctx, chipX, chipY, chipW, chipH, 10);
  ctx.fillStyle = "rgba(12, 15, 12, 0.86)";
  ctx.fill();
  ctx.strokeStyle = "rgba(184, 203, 178, 0.45)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#b8cbb2";
  ctx.font = "700 11px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(
    `PROGRESS: ${(sample.easedProgress * 100).toFixed(1)}%`,
    chipX + 12,
    chipY + 18,
  );
  ctx.fillStyle = "#c5c9c1";
  ctx.font = "500 10px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText(
    `pos: ${Math.round(sample.subjectPosPx)}px  scroll: ${Math.round(sample.scrollOffsetPx)}px`,
    chipX + 12,
    chipY + 37,
  );
  ctx.restore();
}

export function renderScrollCraftScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: ScrollCraftConfig,
  normalizedTimelineTime: number,
  options?: Readonly<{ clearBeforeDraw?: boolean; includeHud?: boolean }>,
): ScrollSimulationSample {
  const scrollPortNorm = evaluateCyclicScrollNorm(normalizedTimelineTime);
  const layout = computeSimulatorLayout(width, height, config);
  const sample = computeScrollSampleForLayout(layout, config, scrollPortNorm);

  if (options?.clearBeforeDraw !== false) {
    ctx.clearRect(0, 0, width, height);
  }
  drawDeviceChrome(ctx, layout, config);

  ctx.save();
  roundRectPath(
    ctx,
    layout.viewportX,
    layout.viewportY,
    layout.viewportWidth,
    layout.viewportHeight,
    config.preview.deviceMockup === "mobile" ? 24 : 10,
  );
  ctx.clip();

  // Neutral mockup surface; the surrounding background remains runtime-owned.
  const bgGrad = ctx.createLinearGradient(
    layout.viewportX,
    layout.viewportY,
    layout.viewportX,
    layout.viewportY + layout.viewportHeight,
  );
  bgGrad.addColorStop(0, "#252826");
  bgGrad.addColorStop(1, "#212422");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(
    layout.viewportX,
    layout.viewportY,
    layout.viewportWidth,
    layout.viewportHeight,
  );

  drawContextualBlocks(ctx, layout, config, sample);
  drawAnimatedSubject(ctx, layout, config, sample);
  drawVirtualScrollbar(ctx, layout, config, scrollPortNorm);

  if (options?.includeHud ?? config.preview.showHud) {
    drawGeometricHud(ctx, layout, config, sample);
  }

  ctx.restore();
  return sample;
}
