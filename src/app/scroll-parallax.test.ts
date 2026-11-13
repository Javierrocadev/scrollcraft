import { describe, expect, it, vi } from "vitest";

import { readScrollCraftConfigFromValues } from "./scroll-config";
import { evaluateEffectTransform, evaluateScrollSimulation } from "./scroll-model";
import { drawAnimatedSubject, type SimulatorFrameRect } from "./scroll-renderer-subjects";

function recordMountains() {
  let path: number[][] = [];
  const mountains: number[][][] = [];
  const ctx = {
    arc: vi.fn(),
    arcTo: vi.fn(),
    beginPath: () => { path = []; },
    clip: vi.fn(),
    closePath: vi.fn(),
    createLinearGradient: () => ({ addColorStop: vi.fn() }),
    fill: () => {
      if (path.length >= 3) {
        mountains.push(path);
      }
    },
    fillRect: vi.fn(),
    fillStyle: "",
    fillText: vi.fn(),
    lineTo: (x: number, y: number) => { path.push([x, y]); },
    moveTo: (x: number, y: number) => { path.push([x, y]); },
    restore: vi.fn(),
    save: vi.fn(),
    scale: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
  };
  return { ctx: ctx as unknown as CanvasRenderingContext2D, mountains };
}

describe("parallax landscape coverage", () => {
  it("keeps both mountain bases below the clipped card throughout the motion", () => {
    const layout: SimulatorFrameRect = {
      chromeHeight: 0, frameHeight: 600, frameWidth: 600,
      frameX: 0, frameY: 0, viewportHeight: 600, viewportWidth: 600,
      viewportX: 0, viewportY: 0,
    };
    for (const height of [80, 200, 500]) {
      for (const intensity of [0, 75, 100]) {
        const config = readScrollCraftConfigFromValues({
          "effect.preset": "parallax", "effect.intensity": intensity,
        });
        for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
          const transform = evaluateEffectTransform(progress, config.effect);
          const sample = {
            ...evaluateScrollSimulation(0.5, config, {
              subjectOffsetInScrollPx: 0, subjectSizePx: height,
              totalScrollContentPx: 1200, viewportSizePx: 600,
            }),
            subjectPosPx: 100, easedProgress: progress, transform,
          };
          const { ctx, mountains } = recordMountains();
          drawAnimatedSubject(ctx, layout, config, sample);
          expect(mountains).toHaveLength(2);
          for (const mountain of mountains) {
            const bottom = Math.max(...mountain.map(([, y]) => y));
            const screenBottom = height * 0.5 + transform.parallaxOffsetPx + bottom * transform.scale;
            expect(screenBottom, `height=${height}, intensity=${intensity}, progress=${progress}`)
              .toBeGreaterThanOrEqual(height);
          }
          // Extending the base must not reshape or reposition the original ridgelines.
          expect(mountains[0].slice(0, 3)).toEqual([
            [-480 * 0.6, height * 0.55], [-480 * 0.1, -height * 0.08],
            [480 * 0.35, height * 0.55],
          ]);
          expect(mountains[0][3]![0]).toBeGreaterThanOrEqual(480 * 0.35);
          expect(mountains[0][4]![0]).toBeLessThanOrEqual(-480 * 0.6);
          expect(mountains[1].slice(0, 3)).toEqual([
            [-480 * 0.1, height * 0.55], [480 * 0.25, -height * 0.16],
            [480 * 0.65, height * 0.55],
          ]);
          expect(mountains[1][3]![0]).toBeGreaterThanOrEqual(480 * 0.65);
          expect(mountains[1][4]![0]).toBeLessThanOrEqual(-480 * 0.1);
        }
      }
    }
  });
});
