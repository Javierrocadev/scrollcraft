import {
  clamp01,
  lerp,
  type ScrollCraftConfig,
  type ScrollSimulationSample,
} from "./scroll-model";

export type SimulatorFrameRect = Readonly<{
  chromeHeight: number;
  frameHeight: number;
  frameWidth: number;
  frameX: number;
  frameY: number;
  viewportHeight: number;
  viewportWidth: number;
  viewportX: number;
  viewportY: number;
}>;

export function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width * 0.5, height * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawInlineContextualBlock(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): void {
  roundRectPath(ctx, bx, by, bw, bh, 12);
  ctx.fillStyle = "rgba(48, 52, 48, 0.9)";
  ctx.fill();
  ctx.strokeStyle = "rgba(172, 179, 168, 0.14)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "rgba(172, 179, 168, 0.25)";
  roundRectPath(ctx, bx + 16, by + 18, bw - 32, 12, 4);
  ctx.fill();
  ctx.fillStyle = "rgba(134, 143, 131, 0.22)";
  roundRectPath(ctx, bx + 16, by + 40, bw * 0.65, 9, 4);
  ctx.fill();
  roundRectPath(ctx, bx + 16, by + 56, bw * 0.52, 9, 4);
  ctx.fill();
}

function drawBlockContextualBlock(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): void {
  roundRectPath(ctx, bx, by, bw, bh, 12);
  ctx.fillStyle = "rgba(48, 52, 48, 0.9)";
  ctx.fill();
  ctx.strokeStyle = "rgba(172, 179, 168, 0.12)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "rgba(172, 179, 168, 0.28)";
  roundRectPath(ctx, bx + 18, by + 20, Math.min(200, bw * 0.45), 11, 4);
  ctx.fill();
  ctx.fillStyle = "rgba(134, 143, 131, 0.22)";
  roundRectPath(ctx, bx + 18, by + 42, bw - 44, 8, 4);
  ctx.fill();
  roundRectPath(ctx, bx + 18, by + 58, bw * 0.72, 8, 4);
  ctx.fill();
}

function drawInlineContextualBlocks(
  ctx: CanvasRenderingContext2D,
  layout: SimulatorFrameRect,
  sample: ScrollSimulationSample,
  pad: number,
): void {
  const span = sample.subjectSizePx + 34;
  const bw = sample.subjectSizePx * 0.85;
  const by = layout.viewportY + pad + 26;
  const bh = layout.viewportHeight - pad * 2 - 44;

  for (let i = 0; i < 7; i += 1) {
    if (i === 3) continue;
    const bx = layout.viewportX + (52 + i * span) - sample.scrollOffsetPx;
    if (bx + bw >= layout.viewportX - 40 && bx <= layout.viewportX + layout.viewportWidth + 40) {
      drawInlineContextualBlock(ctx, bx, by, bw, bh);
    }
  }
}

function drawBlockContextualBlocks(
  ctx: CanvasRenderingContext2D,
  layout: SimulatorFrameRect,
  sample: ScrollSimulationSample,
  pad: number,
): void {
  const span = sample.subjectSizePx + 34;
  const bh = 96;
  const bx = layout.viewportX + pad;
  const bw = layout.viewportWidth - pad * 2 - 14;

  for (let i = 0; i < 7; i += 1) {
    if (i === 3) continue;
    const by = layout.viewportY + (52 + i * span) - sample.scrollOffsetPx;
    if (by + bh >= layout.viewportY - 40 && by <= layout.viewportY + layout.viewportHeight + 40) {
      drawBlockContextualBlock(ctx, bx, by, bw, bh);
    }
  }
}

export function drawContextualBlocks(
  ctx: CanvasRenderingContext2D,
  layout: SimulatorFrameRect,
  config: ScrollCraftConfig,
  sample: ScrollSimulationSample,
): void {
  const pad = Math.min(28, layout.viewportWidth * 0.06);
  if (config.timeline.axis === "inline") {
    drawInlineContextualBlocks(ctx, layout, sample, pad);
  } else {
    drawBlockContextualBlocks(ctx, layout, sample, pad);
  }
}

function drawProgressTrackerSubject(
  ctx: CanvasRenderingContext2D,
  layout: SimulatorFrameRect,
  sample: ScrollSimulationSample,
  pad: number,
): void {
  const barTrackX = layout.viewportX;
  const barTrackY = layout.viewportY;
  const barTrackW = layout.viewportWidth;
  const barH = 7;

  ctx.fillStyle = "rgba(41, 46, 41, 0.9)";
  ctx.fillRect(barTrackX, barTrackY, barTrackW, barH);

  const fillW = Math.max(0, barTrackW * sample.transform.progressRatio);
  const grad = ctx.createLinearGradient(barTrackX, barTrackY, barTrackX + barTrackW, barTrackY);
  grad.addColorStop(0, "#b8cbb2");
  grad.addColorStop(0.55, "#9fb69f");
  grad.addColorStop(1, "#b8cbb2");
  ctx.fillStyle = grad;
  ctx.fillRect(barTrackX, barTrackY, fillW, barH);

  const pillW = 148;
  const pillH = 30;
  const pillX = layout.viewportX + pad;
  const pillY = layout.viewportY + 20;
  roundRectPath(ctx, pillX, pillY, pillW, pillH, 15);
  ctx.fillStyle = "rgba(27, 31, 27, 0.9)";
  ctx.fill();
  ctx.strokeStyle = "rgba(184, 203, 178, 0.45)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#e5e9e1";
  ctx.font = "600 11px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    `Reading Progress: ${Math.round(sample.transform.progressRatio * 100)}%`,
    pillX + pillW * 0.5,
    pillY + pillH * 0.5,
  );
}

function drawScaleDownSubject(
  ctx: CanvasRenderingContext2D,
  layout: SimulatorFrameRect,
  config: ScrollCraftConfig,
  sample: ScrollSimulationSample,
): void {
  const baseH = Math.min(82, layout.viewportHeight * 0.2);
  const minH = Math.max(40, baseH * (1 - 0.34 * (config.effect.intensity / 100)));
  const headerH = lerp(baseH, minH, clamp01(sample.easedProgress));
  const margin = lerp(16, 8, clamp01(sample.easedProgress));
  const hx = layout.viewportX + margin;
  const hy = layout.viewportY + margin;
  const hw = layout.viewportWidth - margin * 2 - 12;

  ctx.save();
  roundRectPath(ctx, hx, hy, hw, headerH, lerp(14, 22, sample.easedProgress));
  ctx.fillStyle = `rgba(27, 31, 27, ${lerp(0.95, 0.78, sample.easedProgress)})`;
  ctx.fill();
  ctx.strokeStyle = `rgba(184, 203, 178, ${lerp(0.22, 0.6, sample.easedProgress)})`;
  ctx.lineWidth = 1.25;
  ctx.stroke();

  ctx.fillStyle = "#f0eee7";
  ctx.font = `700 ${Math.round(lerp(17, 13, sample.easedProgress))}px ui-sans-serif, system-ui, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("Sticky Nav Header", hx + 20, hy + headerH * 0.5);

  ctx.fillStyle = "#b8cbb2";
  ctx.font = "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "right";
  ctx.fillText(
    `scale(${sample.transform.scale.toFixed(2)}) • blur(${sample.transform.blurPx.toFixed(1)}px)`,
    hx + hw - 18,
    hy + headerH * 0.5,
  );
  ctx.restore();
}

function drawParallaxSubject(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  baseY: number,
  cardW: number,
  cardH: number,
  cx: number,
  sample: ScrollSimulationSample,
): void {
  const { transform } = sample;
  roundRectPath(ctx, baseX, baseY, cardW, cardH, 16);
  ctx.clip();

  const skyGrad = ctx.createLinearGradient(baseX, baseY, baseX, baseY + cardH);
  skyGrad.addColorStop(0, "#303a31");
  skyGrad.addColorStop(0.6, "#526451");
  skyGrad.addColorStop(1, "#202420");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(baseX, baseY, cardW, cardH);

  const bgY = baseY + transform.parallaxOffsetPx;
  // Extend the mountain slopes below the clip without changing the animated ridgelines.
  const groundBottom = Math.max(
    cardH * 0.55,
    (cardH * 0.5 - transform.parallaxOffsetPx) / transform.scale,
  ) + 1;
  const extendX = (x0: number, y0: number, x1: number, y1: number): number =>
    x0 + ((x1 - x0) * (groundBottom - y0)) / (y1 - y0);
  ctx.save();
  ctx.translate(cx, bgY + cardH * 0.5);
  ctx.scale(transform.scale, transform.scale);
  ctx.beginPath();
  ctx.arc(-cardW * 0.22, -cardH * 0.14, cardH * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(224, 209, 172, 0.9)";
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-cardW * 0.6, cardH * 0.55);
  ctx.lineTo(-cardW * 0.1, -cardH * 0.08);
  ctx.lineTo(cardW * 0.35, cardH * 0.55);
  ctx.lineTo(extendX(-cardW * 0.1, -cardH * 0.08, cardW * 0.35, cardH * 0.55), groundBottom);
  ctx.lineTo(extendX(-cardW * 0.1, -cardH * 0.08, -cardW * 0.6, cardH * 0.55), groundBottom);
  ctx.closePath();
  ctx.fillStyle = "rgba(184, 203, 178, 0.42)";
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-cardW * 0.1, cardH * 0.55);
  ctx.lineTo(cardW * 0.25, -cardH * 0.16);
  ctx.lineTo(cardW * 0.65, cardH * 0.55);
  ctx.lineTo(extendX(cardW * 0.25, -cardH * 0.16, cardW * 0.65, cardH * 0.55), groundBottom);
  ctx.lineTo(extendX(cardW * 0.25, -cardH * 0.16, -cardW * 0.1, cardH * 0.55), groundBottom);
  ctx.closePath();
  ctx.fillStyle = "rgba(141, 165, 137, 0.52)";
  ctx.fill();
  ctx.restore();

  const fgY = baseY + cardH * 0.5 + transform.fgOffsetPx;
  roundRectPath(ctx, baseX + 22, fgY - 22, Math.min(230, cardW - 44), 44, 12);
  ctx.fillStyle = "rgba(27, 31, 27, 0.82)";
  ctx.fill();
  ctx.strokeStyle = "rgba(184, 203, 178, 0.5)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "#f0eee7";
  ctx.font = "600 13px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("Parallax Depth Layer", baseX + 36, fgY);

  ctx.restore();
  roundRectPath(ctx, baseX, baseY, cardW, cardH, 16);
  ctx.strokeStyle = "rgba(141, 165, 137, 0.55)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawFadeBlurSubject(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  baseY: number,
  cardW: number,
  cardH: number,
  config: ScrollCraftConfig,
  sample: ScrollSimulationSample,
): void {
  const itemCount = 3;
  const gap = 10;
  const itemH = (cardH - gap * (itemCount - 1)) / itemCount;
  for (let i = 0; i < itemCount; i += 1) {
    const stagger = clamp01((sample.easedProgress - i * 0.12) / 0.76);
    const iy = baseY + i * (itemH + gap) + lerp(20 * (config.effect.intensity / 100), 0, stagger);
    const iscale = lerp(0.94, 1, stagger);
    const iw = cardW * iscale;
    const ix = baseX + (cardW - iw) * 0.5;

    ctx.save();
    ctx.globalAlpha = clamp01(lerp(0.15, 1, stagger));
    roundRectPath(ctx, ix, iy, iw, itemH, 12);
    ctx.fillStyle = "rgba(41, 46, 41, 0.92)";
    ctx.fill();
    ctx.strokeStyle = "rgba(184, 203, 178, 0.45)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = "#b8cbb2";
    ctx.beginPath();
    ctx.arc(ix + 22, iy + itemH * 0.5, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f0eee7";
    ctx.font = "600 12px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`Kinetic Item 0${i + 1}`, ix + 40, iy + itemH * 0.5);
    ctx.restore();
  }
  ctx.restore();
}

function drawCard3dSubject(
  ctx: CanvasRenderingContext2D,
  cardW: number,
  cardH: number,
  cx: number,
  cy: number,
  sample: ScrollSimulationSample,
): void {
  const { transform } = sample;
  const wScaled = cardW * transform.scale;
  const hScaled = cardH * transform.scale;
  const tiltRad = (transform.rotateXDeg * Math.PI) / 180;
  const yawRad = (transform.rotateYDeg * Math.PI) / 180;
  const foreshorten = Math.max(0.55, Math.cos(tiltRad));
  const topInset = Math.sin(tiltRad) * (wScaled * 0.13);
  const skewY = Math.sin(yawRad) * (hScaled * 0.08);
  const drawH = hScaled * foreshorten;
  const left = cx - wScaled * 0.5;
  const right = cx + wScaled * 0.5;
  const top = cy - drawH * 0.5;
  const bottom = cy + drawH * 0.5;

  ctx.beginPath();
  ctx.moveTo(left + topInset, top + skewY);
  ctx.lineTo(right - topInset, top - skewY);
  ctx.lineTo(right, bottom - skewY * 0.4);
  ctx.lineTo(left, bottom + skewY * 0.4);
  ctx.closePath();

  const cardGrad = ctx.createLinearGradient(left, top, right, bottom);
  cardGrad.addColorStop(0, "#f0eee7");
  cardGrad.addColorStop(0.55, "#e4e5dc");
  cardGrad.addColorStop(1, "#d4dbcf");
  ctx.fillStyle = cardGrad;
  ctx.shadowColor = "rgba(0, 0, 0, 0.24)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 14;
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
  ctx.lineWidth = 1.75;
  ctx.stroke();

  ctx.fillStyle = "rgba(55, 76, 54, 0.1)";
  roundRectPath(ctx, left + 22, top + 20, 108, 22, 11);
  ctx.fill();
  ctx.fillStyle = "#40533e";
  ctx.font = "600 10px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("BASELINE 2026", left + 33, top + 31);

  ctx.fillStyle = "#252a26";
  ctx.font = "700 17px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("3D Scroll Reveal Subject", left + 22, top + drawH * 0.54);

  ctx.fillStyle = "#535d50";
  ctx.font = "500 11px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText(
    `rotateX(${transform.rotateXDeg.toFixed(1)}deg)  scale(${transform.scale.toFixed(2)})`,
    left + 22,
    top + drawH * 0.74,
  );

  ctx.restore();
}

export function drawAnimatedSubject(
  ctx: CanvasRenderingContext2D,
  layout: SimulatorFrameRect,
  config: ScrollCraftConfig,
  sample: ScrollSimulationSample,
): void {
  const isInline = config.timeline.axis === "inline";
  const pad = Math.min(28, layout.viewportWidth * 0.06);
  const { transform } = sample;
  const preset = config.effect.preset;

  if (preset === "progress-tracker") {
    drawProgressTrackerSubject(ctx, layout, sample, pad);
    return;
  }

  if (preset === "scale-down") {
    drawScaleDownSubject(ctx, layout, config, sample);
    return;
  }

  const cardW = isInline
    ? sample.subjectSizePx
    : Math.min(layout.viewportWidth - pad * 2 - 14, 480);
  const cardH = isInline
    ? Math.min(layout.viewportHeight - pad * 2 - 24, 260)
    : sample.subjectSizePx;
  const baseX = isInline
    ? layout.viewportX + sample.subjectPosPx
    : layout.viewportX + (layout.viewportWidth - cardW - 10) * 0.5;
  const baseY = isInline
    ? layout.viewportY + (layout.viewportHeight - cardH) * 0.5
    : layout.viewportY + sample.subjectPosPx;

  const cx = baseX + cardW * 0.5;
  const cy = baseY + cardH * 0.5 + transform.translateYPx;

  ctx.save();
  ctx.globalAlpha = clamp01(transform.opacity);
  if (transform.blurPx > 0.25 && "filter" in ctx) {
    ctx.filter = `blur(${transform.blurPx.toFixed(1)}px)`;
  }

  if (preset === "parallax") {
    drawParallaxSubject(ctx, baseX, baseY, cardW, cardH, cx, sample);
    return;
  }

  if (preset === "fade-blur") {
    drawFadeBlurSubject(ctx, baseX, baseY, cardW, cardH, config, sample);
    return;
  }

  drawCard3dSubject(ctx, cardW, cardH, cx, cy, sample);
}
