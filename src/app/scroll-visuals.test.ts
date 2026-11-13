import { describe, expect, it } from "vitest";
import { readScrollCraftConfigFromValues } from "./scroll-config";
import { renderScrollCraftScene } from "./scroll-renderer";

function recordScene(values: Record<string, unknown> = {}) {
  const text: { value: string; color: string }[] = [];
  const stops: string[] = [];
  const fills: unknown[] = [];
  const state: Record<string, unknown> = {};
  const ctx = new Proxy(state, {
    get(target, key: string) {
      if (key === "createLinearGradient") {
        return () => ({ addColorStop: (_offset: number, color: string) => stops.push(color) });
      }
      if (key === "fillText") {
        return (value: string) => text.push({ value, color: String(target.fillStyle) });
      }
      if (key === "fill" || key === "fillRect") {
        return () => fills.push(typeof target.fillStyle === "string" ? target.fillStyle : "gradient");
      }
      return target[key] ?? (() => undefined);
    },
  }) as unknown as CanvasRenderingContext2D;
  const sample = renderScrollCraftScene(ctx, 1000, 700, readScrollCraftConfigFromValues(values), 0.2);
  return { text, stops, fills, sample };
}

function contrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    const rgb = [1, 3, 5].map((offset) => {
      const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return rgb[0]! * 0.2126 + rgb[1]! * 0.7152 + rgb[2]! * 0.0722;
  };
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light! + 0.05) / (dark! + 0.05);
}

describe("ScrollCraft visual palette", () => {
  it("separates the warm reveal card from the graphite viewport with readable text", () => {
    const scene = recordScene();
    expect(scene.stops).toEqual(expect.arrayContaining(["#252826", "#212422", "#f0eee7", "#e4e5dc", "#d4dbcf"]));
    const title = scene.text.find((item) => item.value === "3D Scroll Reveal Subject")!;
    expect(title.color).toBe("#252a26");
    for (const background of ["#f0eee7", "#e4e5dc", "#d4dbcf"]) {
      expect(contrast(title.color, background)).toBeGreaterThanOrEqual(4.5);
      const detail = scene.text.find((item) => item.value.startsWith("rotateX("))!;
      expect(contrast(detail.color, background)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps labeled start/end guides readable without saturated fills", () => {
    const scene = recordScene();
    for (const [prefix, background] of [["START:", "#adc5b0"], ["END:", "#d8a89c"]]) {
      expect(scene.fills).toContain(background);
      const label = scene.text.find((item) => item.value.startsWith(prefix!))!;
      expect(contrast(label.color, background!)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(["card-3d", "scale-down", "progress-tracker", "parallax", "fade-blur"])(
    "keeps %s deterministic and HUD visibility independent of simulation",
    (preset) => {
      const values = { "effect.preset": preset };
      const shown = recordScene(values);
      const hidden = recordScene({ ...values, "preview.showHud": false });
      expect(hidden.sample).toEqual(shown.sample);
      expect(recordScene(values)).toEqual(shown);
      expect(hidden.text.some((item) => item.value.startsWith("PROGRESS:"))).toBe(false);
    },
  );
});
