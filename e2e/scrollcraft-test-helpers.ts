import fs from "node:fs/promises";
import type { Download, Locator, Page } from "@playwright/test";

import {
  appControlSectionInventory,
  getToolcraftControlApplicabilityCases,
  type ToolcraftControlApplicabilityCase,
} from "../src/app/app-acceptance";
import { appSchema } from "../src/app/app-schema";
import { getToolcraftControlFieldByTarget } from "./browser-control-target-helpers";
import { dragToolcraftSliderTargetToValue } from "./performance-slider-helpers";
import { expect } from "./toolcraft-product-test";

export const SIMULATOR_CANVAS = "[data-scrollcraft-simulator-canvas]";
export const CSS_CODE_SELECTOR = "[data-scrollcraft-css-code]";
export const EDITABLE_CANVAS = "[data-toolcraft-editable-canvas]";

export const BG_RGBA = [11, 16, 32, 255] as const;
export const CHROME_RGBA = [37, 40, 37, 255] as const;
export const EXPECTED_SCENE_BOUNDS = { height: 0.88, width: 0.7326, x: 0.1337, y: 0.06 };
export const EXPECTED_PIXELS = [
  { rgba: BG_RGBA, xRatio: 0.02, yRatio: 0.02 },
  { rgba: CHROME_RGBA, xRatio: 0.25, yRatio: 0.08 },
] as const;

export const FAST_STATIC_OBSERVABLE = {
  baselineStabilityIntervalMs: 0,
  baselineStabilitySamples: 2,
  stabilityIntervalMs: 0,
  stabilitySamples: 2,
} as const;

export async function ensureTimelinePausedAt(page: Page, ratio: number): Promise<void> {
  const scrubber = page.getByRole("slider", { name: "Playback position" });
  if (!(await scrubber.isVisible())) {
    const timelineSwitch = page.getByRole("switch", { exact: true, name: "Timeline" });
    await timelineSwitch.scrollIntoViewIfNeeded();
    await timelineSwitch.click();
    await expect(scrubber).toBeVisible();
  }
  const pause = page.getByRole("button", { name: "Pause playback" });
  if (await pause.isVisible()) {
    await pause.click();
  }
  await scrubber.press("Home");
  if (ratio > 0) {
    const box = await scrubber.boundingBox();
    if (!box) throw new Error("Timeline playback scrubber bounds unavailable.");
    await page.mouse.click(box.x + box.width * ratio, box.y + box.height / 2);
  }
}

export async function setTimelineDuration(page: Page, value: string): Promise<void> {
  await ensureTimelinePausedAt(page, 0);
  await page.getByRole("button", { name: "Edit timeline duration" }).click();
  const editor = page.getByRole("textbox", { name: "timeline duration" });
  await editor.fill(value);
  await editor.press("Enter");
  await ensureTimelinePausedAt(page, 0);
}

export async function selectDropdownOption(
  page: Page,
  control: Locator,
  label: string,
): Promise<void> {
  await control.scrollIntoViewIfNeeded();
  await control.getByRole("combobox").click();
  await page.getByRole("option", { exact: true, name: label }).click();
}

export async function selectDropdownOptionByTarget(
  page: Page,
  target: string,
  label: string,
): Promise<void> {
  const direct = page.locator(`[data-toolcraft-control-target="${target}"]`);
  const field =
    (await direct.count()) === 1
      ? direct
      : await getToolcraftControlFieldByTarget(page, target);
  await selectDropdownOption(page, field, label);
}

export async function scrollAndDragSlider(
  page: Page,
  target: string,
  value: number,
): Promise<void> {
  const direct = page.locator(`[data-toolcraft-control-target="${target}"]`);
  if ((await direct.count()) !== 1) {
    const field = await getToolcraftControlFieldByTarget(page, target);
    await field.scrollIntoViewIfNeeded();
    await dragToolcraftSliderTargetToValue(page, target, value);
    return;
  }
  const field = direct.locator('[data-slot="field"]').first();
  await field.scrollIntoViewIfNeeded();
  const sliderTrack = field.locator('[data-slot="slider"]').first();
  const sliderThumb = field.getByRole("slider").first();
  await expect(sliderTrack).toBeVisible();
  const range = await sliderThumb.evaluate((el) => ({
    max: Number(el.getAttribute("aria-valuemax") ?? "100"),
    min: Number(el.getAttribute("aria-valuemin") ?? "0"),
  }));
  const denom = range.max - range.min;
  const ratio = Math.min(1, Math.max(0, denom === 0 ? 0 : (value - range.min) / denom));
  const box = await sliderTrack.boundingBox();
  if (!box) throw new Error(`Could not measure slider "${target}".`);
  const startX = box.x + box.width * 0.15;
  const endX = box.x + box.width * ratio;
  const y = box.y + box.height / 2;
  const before = await sliderThumb.getAttribute("aria-valuenow");
  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(endX, y, { steps: 10 });
  await page.mouse.up();
  expect(await sliderThumb.getAttribute("aria-valuenow")).not.toBe(before);
}

export function getApplicabilityCase(
  target: string,
  expectation: ToolcraftControlApplicabilityCase["expectation"],
): ToolcraftControlApplicabilityCase {
  const found = getToolcraftControlApplicabilityCases({
    schema: appSchema,
    sectionInventory: appControlSectionInventory,
    target,
  }).find((item) => item.expectation === expectation);
  if (!found) {
    throw new Error(`Missing ${expectation} applicability case for "${target}".`);
  }
  return found;
}

export async function triggerExportDownload(
  page: Page,
  buttonPattern: RegExp,
): Promise<Download> {
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: buttonPattern }).click();
  return downloadPromise;
}

export async function readImageAlphaAtOrigin(
  page: Page,
  download: Download,
): Promise<number> {
  const downloadPath = await download.path();
  if (!downloadPath) throw new Error("Image download path unavailable.");
  const bytes = await fs.readFile(downloadPath);
  return page.evaluate(async (base64) => {
    const bin = atob(base64);
    const data = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const bitmap = await createImageBitmap(new Blob([data], { type: "image/png" }));
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Cannot read PNG pixel alpha.");
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    return ctx.getImageData(0, 0, 1, 1).data[3] ?? 255;
  }, bytes.toString("base64"));
}
