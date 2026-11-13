"use client";

import * as React from "react";
import type {
  ToolcraftProductExportRenderer,
  ToolcraftProductSceneBoundsProvider,
} from "@/toolcraft/runtime";
import {
  useToolcraftEvaluatedValue,
  useToolcraftEvaluatedValues,
  useToolcraftProductSceneFrame,
  useToolcraftSelector,
} from "@/toolcraft/runtime/react";

import { readScrollCraftConfigFromValues } from "./scroll-config";
import { clamp01, evaluateCyclicScrollNorm } from "./scroll-model";
import { renderScrollCraftScene } from "./scroll-renderer";

function getNormalizedTimelineProgress(
  currentTimeSeconds: number,
  durationSeconds: number,
): number {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return 0;
  }
  return clamp01(currentTimeSeconds / durationSeconds);
}

export const scrollCraftSceneBoundsProvider: ToolcraftProductSceneBoundsProvider = ({
  state,
}) => [
  {
    height: state.canvas.size.height,
    width: state.canvas.size.width,
    x: -state.canvas.size.width / 2,
    y: -state.canvas.size.height / 2,
  },
];

export const scrollCraftRasterExporter: ToolcraftProductExportRenderer = {
  baseFileName: "scrollcraft-studio",
  getContentBounds: ({ frame }) => [
    {
      height: frame.height,
      width: frame.width,
      x: frame.x,
      y: frame.y,
    },
  ],
  renderFrame: ({ context, frame, state, timelineProgress }) => {
    const config = readScrollCraftConfigFromValues(state.values);
    context.save();
    context.translate(frame.x, frame.y);
    renderScrollCraftScene(
      context,
      frame.width,
      frame.height,
      config,
      timelineProgress,
      {
        clearBeforeDraw: false,
        includeHud: config.preview.showHud && config.preview.exportHud,
      },
    );
    context.restore();
  },
};

export function ScrollCraftCanvasScene(): React.JSX.Element | null {
  const productFrame = useToolcraftProductSceneFrame();
  const evaluated = useToolcraftEvaluatedValues();
  const rawRenderScale = useToolcraftEvaluatedValue("canvas.renderScale");
  const timeline = useToolcraftSelector((state) => state.timeline);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const renderScale =
    typeof rawRenderScale === "number" && Number.isFinite(rawRenderScale)
      ? Math.max(1, rawRenderScale)
      : 1;

  const config = React.useMemo(
    () => readScrollCraftConfigFromValues(evaluated),
    [evaluated],
  );

  const normalizedTimelineTime = getNormalizedTimelineProgress(
    timeline.currentTimeSeconds,
    timeline.durationSeconds,
  );
  const scrollPortNorm = evaluateCyclicScrollNorm(normalizedTimelineTime);

  const readyRect = productFrame.kind === "ready" ? productFrame.rect : null;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !readyRect) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const devicePixelRatio =
      typeof window !== "undefined" ? Math.max(1, window.devicePixelRatio || 1) : 1;
    const backingScale = devicePixelRatio * renderScale;
    const backingWidth = Math.max(1, Math.round(readyRect.width * backingScale));
    const backingHeight = Math.max(1, Math.round(readyRect.height * backingScale));

    if (canvas.width !== backingWidth || canvas.height !== backingHeight) {
      canvas.width = backingWidth;
      canvas.height = backingHeight;
    }

    ctx.setTransform(backingScale, 0, 0, backingScale, 0, 0);
    renderScrollCraftScene(
      ctx,
      readyRect.width,
      readyRect.height,
      config,
      normalizedTimelineTime,
      {
        clearBeforeDraw: true,
        includeHud: config.preview.showHud,
      },
    );
  }, [config, normalizedTimelineTime, readyRect, renderScale]);

  if (!readyRect) {
    return null;
  }

  return (
    <div
      style={{
        height: readyRect.height,
        position: "relative",
        width: readyRect.width,
      }}
    >
      <canvas
        data-scrollcraft-simulator-canvas=""
        ref={canvasRef}
        style={{
          display: "block",
          height: readyRect.height,
          width: readyRect.width,
        }}
      />
      <div
        aria-hidden="true"
        data-scrollcraft-timeline-marker=""
        data-timeline-progress={scrollPortNorm.toFixed(4)}
        style={{
          height: 1,
          left: 0,
          opacity: 0,
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          transform: `translateY(${(scrollPortNorm * 100).toFixed(2)}%)`,
          width: 1,
        }}
      />
    </div>
  );
}
