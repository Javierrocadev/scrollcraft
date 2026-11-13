import { mkdir } from "node:fs/promises";
import { CSS_CODE_SELECTOR, ensureTimelinePausedAt, SIMULATOR_CANVAS } from "./scrollcraft-test-helpers";
import { expect, test } from "./toolcraft-product-test";

test("browser: refined palette renders neutral chrome and a readable CSS inspector", async ({ page }) => {
  await page.goto("/");
  await ensureTimelinePausedAt(page, 0.2);
  const simulator = page.locator(SIMULATOR_CANVAS);
  await expect(simulator).toBeVisible();
  const chrome = await simulator.evaluate((node: HTMLCanvasElement) => {
    const context = node.getContext("2d")!;
    return Array.from(context.getImageData(node.width * 0.25, node.height * 0.08, 1, 1).data);
  });
  expect(chrome).toEqual([37, 40, 37, 255]);
  const code = page.locator(CSS_CODE_SELECTOR);
  await code.scrollIntoViewIfNeeded();
  await expect(code).toContainText("animation-timeline:");
  const colors = await code.evaluate((node) => {
    const style = getComputedStyle(node);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d")!;
    const luminance = (color: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const rgb = Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3).map((v) => {
        const c = v / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return rgb[0]! * 0.2126 + rgb[1]! * 0.7152 + rgb[2]! * 0.0722;
    };
    const [a, b] = [luminance(style.color), luminance(style.backgroundColor)].sort((x, y) => y - x);
    return { contrast: (a! + 0.05) / (b! + 0.05), fontSize: style.fontSize, radius: style.borderTopLeftRadius };
  });
  expect(colors.contrast).toBeGreaterThanOrEqual(4.5);
  expect(colors.fontSize).toBe("12px");
  expect(colors.radius).toBe("8px");
  await mkdir(".toolcraft/browser-artifacts", { recursive: true });
  await page.screenshot({ path: ".toolcraft/browser-artifacts/visual-refinement.png" });
  await page.emulateMedia({ forcedColors: "active" });
  await expect(code).toBeVisible();
  await expect(code).toHaveCSS("border-top-style", "solid");
});
