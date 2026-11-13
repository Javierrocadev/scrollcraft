import { readScrollCraftConfigFromValues } from "../src/app/scroll-config";
import { computeScrollSampleForLayout, computeSimulatorLayout } from "../src/app/scroll-renderer";
import { createToolcraftBrowserProofSession } from "./browser-proof-session";
import { expectToolcraftProductObservableToChange } from "./product-observable-helpers";
import {
  ensureTimelinePausedAt,
  FAST_STATIC_OBSERVABLE,
  scrollAndDragSlider,
  selectDropdownOption,
  SIMULATOR_CANVAS,
} from "./scrollcraft-test-helpers";
import { expect, test } from "./toolcraft-product-test";

test("browser: scroll effect preset renders all five subject presets", async ({
  page,
}) => {
  await page.goto("/");
  const session = await createToolcraftBrowserProofSession(page);
  await ensureTimelinePausedAt(page, 0.25);

  await expectToolcraftProductObservableToChange(
    session,
    session.controlAction("effect.preset", async (control) => {
      for (const label of [
        "Sticky Header Shrink",
        "Reading Progress Bar",
        "Parallax Image Depth",
        "Stagger Kinetic List",
        "3D Card Reveal",
        "Parallax Image Depth",
      ]) {
        await selectDropdownOption(page, control, label);
      }
    }),
    { ...FAST_STATIC_OBSERVABLE, requirementId: "effect.preset", selector: SIMULATOR_CANVAS },
  );

  const hud = page.getByRole("switch", { exact: true, name: "Range HUD" });
  if (await hud.isChecked()) await hud.click();
  const config = readScrollCraftConfigFromValues({ "effect.preset": "parallax" });
  for (const phase of [0.25, 0.27, 0.29]) {
    await ensureTimelinePausedAt(page, phase);
    const canvas = page.locator(SIMULATOR_CANVAS);
    const size = await canvas.evaluate((element: HTMLCanvasElement) => ({
      width: Number.parseFloat(element.style.width),
      height: Number.parseFloat(element.style.height),
    }));
    const scroll = Number(await page.locator("[data-scrollcraft-timeline-marker]")
      .getAttribute("data-timeline-progress"));
    const layout = computeSimulatorLayout(size.width, size.height, config);
    const sample = computeScrollSampleForLayout(layout, config, scroll);
    expect(sample.transform.parallaxOffsetPx).toBeLessThan(0);
    const cardWidth = Math.min(layout.viewportWidth - Math.min(28, layout.viewportWidth * 0.06) * 2 - 14, 480);
    const left = layout.viewportX + (layout.viewportWidth - cardWidth - 10) * 0.5;
    const bottom = layout.viewportY + sample.subjectPosPx + sample.subjectSizePx - 4;
    // A bare sky strip is dark; both mountain fills remain bright at the bottom.
    await expect.poll(() => canvas.evaluate((element: HTMLCanvasElement, probe) => {
      const ctx = element.getContext("2d")!;
      const scale = element.width / probe.width;
      return Math.min(...[0.3, 0.5, 0.7].map((fraction) => ctx.getImageData(
        Math.round((probe.left + probe.cardWidth * fraction) * scale),
        Math.round(probe.bottom * scale), 1, 1,
      ).data[1]));
    }, { ...size, left, bottom, cardWidth })).toBeGreaterThan(75);
  }
});

test("browser: scroll effect easing and intensity update simulation and CSS", async ({
  page,
}) => {
  await page.goto("/");
  const session = await createToolcraftBrowserProofSession(page);
  await ensureTimelinePausedAt(page, 0.25);

  await expectToolcraftProductObservableToChange(
    session,
    session.controlAction("effect.easing", async (control) => {
      await selectDropdownOption(page, control, "cubic-bezier(0.22, 1, 0.36, 1)");
      await selectDropdownOption(page, control, "linear");
    }),
    { ...FAST_STATIC_OBSERVABLE, requirementId: "effect.easing", selector: SIMULATOR_CANVAS },
  );

  await expectToolcraftProductObservableToChange(
    session,
    session.controlAction("effect.intensity", async () => {
      await scrollAndDragSlider(page, "effect.intensity", 25);
    }),
    { ...FAST_STATIC_OBSERVABLE, requirementId: "effect.intensity", selector: SIMULATOR_CANVAS },
  );
});
