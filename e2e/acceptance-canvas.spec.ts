import { appAcceptance } from "../src/app/app-acceptance";
import { createToolcraftVideoFrameSchedule } from "../src/toolcraft/runtime/export/video-frame-schedule";
import { getToolcraftControlFieldByTarget } from "./browser-control-target-helpers";
import {
  expectToolcraftInfinityCanvasImageExportEvidence,
  expectToolcraftInfinityCanvasModeEvidence,
  expectToolcraftInfinityCanvasVideoExportEvidence,
  observeInfinityCanvas,
} from "./browser-infinity-canvas-evidence";
import { createToolcraftBrowserProofSession } from "./browser-proof-session";
import { inspectToolcraftImageDownload } from "./image-artifact-inspection";
import {
  BG_RGBA,
  ensureTimelinePausedAt,
  scrollAndDragSlider,
  selectDropdownOptionByTarget,
  setTimelineDuration,
  SIMULATOR_CANVAS,
  triggerExportDownload,
} from "./scrollcraft-test-helpers";
import { expect, expectToolcraftCanvasRenderScaleEvidence, test } from "./toolcraft-product-test";
import { inspectToolcraftVideoDownload } from "./video-artifact-inspection";

test("browser: render scale preserves crisp backing pixels across states", async ({
  page,
}) => {
  await page.goto("/");
  await createToolcraftBrowserProofSession(page);
  await ensureTimelinePausedAt(page, 0);

  const renderScaleRow = await getToolcraftControlFieldByTarget(page, "canvas.renderScale");
  await renderScaleRow.scrollIntoViewIfNeeded();
  await expect(renderScaleRow.getByRole("slider")).toHaveAttribute("aria-valuenow", "2");

  await expectToolcraftCanvasRenderScaleEvidence(page, {
    canvasSelector: SIMULATOR_CANVAS,
    requirementId: "canvas.renderScale",
    selectedScale: 2,
    stateTransitions: [
      {
        state: "interaction",
        run: async () => {
          await scrollAndDragSlider(page, "effect.intensity", 40);
        },
      },
      {
        state: "playback",
        run: async () => {
          await page.getByRole("button", { name: "Play playback" }).click();
          await page.waitForTimeout(80);
        },
      },
      {
        state: "steady",
        run: async () => {
          const pause = page.getByRole("button", { name: "Pause playback" });
          if (await pause.isVisible()) await pause.click();
          await page.waitForTimeout(100);
        },
      },
    ],
    target: "canvas.renderScale",
  });

  expect(appAcceptance.length).toBeGreaterThan(0);
});

test("browser: infinity canvas preserves world frame continuity and dormant finite size", async ({
  page,
}) => {
  await page.goto("/");
  await createToolcraftBrowserProofSession(page);
  await ensureTimelinePausedAt(page, 0);

  const captureIdentity = () =>
    page.evaluateHandle((selector) => ({
      host: document.querySelector("[data-toolcraft-product-scene]"),
      output: document.querySelector(selector),
    }), SIMULATOR_CANVAS);
  const compareIdentity = async (
    baseline: Awaited<ReturnType<typeof captureIdentity>>,
  ) =>
    page.evaluate(
      (handle) => ({
        productHostPreserved:
          handle.host !== null &&
          handle.host === document.querySelector("[data-toolcraft-product-scene]"),
        productOutputPreserved:
          handle.output !== null &&
          handle.output === document.querySelector("[data-scrollcraft-simulator-canvas]"),
      }),
      baseline,
    );

  const before = await observeInfinityCanvas(page);
  const initialIdentity = await captureIdentity();

  const infinitySwitch = () =>
    page.locator('[data-toolcraft-control-target="canvas.infinity"] [role="switch"]');
  await infinitySwitch().click();
  const enabled = await observeInfinityCanvas(page);
  const beforeToEnabled = await compareIdentity(initialIdentity);

  const viewportBox = await page
    .getByRole("application", { name: "Canvas viewport" })
    .boundingBox();
  if (!viewportBox) throw new Error("Canvas viewport bounds missing.");
  const cx = viewportBox.x + viewportBox.width * 0.5;
  const cy = viewportBox.y + viewportBox.height * 0.5;
  await page.mouse.move(cx, cy);
  await page.keyboard.down("Space");
  await page.mouse.down();
  await page.mouse.move(cx + 48, cy + 32, { steps: 6 });
  await page.mouse.up();
  await page.keyboard.up("Space");

  const afterPan = await observeInfinityCanvas(page);
  await expect(page.locator('[data-slot="toolcraft-runtime-app"]')).toHaveAttribute(
    "data-toolcraft-persistence-status",
    "success",
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator(SIMULATOR_CANVAS)).toBeVisible();

  const afterReload = await observeInfinityCanvas(page);
  const restoredIdentity = await captureIdentity();

  await infinitySwitch().click();
  const restored = await observeInfinityCanvas(page);
  const afterReloadToRestored = await compareIdentity(restoredIdentity);

  await page.getByRole("button", { name: "Undo" }).click();
  const undone = await observeInfinityCanvas(page);
  const restoredToUndone = await compareIdentity(restoredIdentity);

  await page.getByRole("button", { name: "Redo" }).click();
  const redone = await observeInfinityCanvas(page);
  const undoneToRedone = await compareIdentity(restoredIdentity);

  await initialIdentity.dispose();
  await restoredIdentity.dispose();

  await expectToolcraftInfinityCanvasModeEvidence(
    { afterPan, afterReload, before, enabled, redone, restored, undone },
    {
      afterReloadToRestored,
      beforeToEnabled,
      restoredToUndone,
      undoneToRedone,
    },
    {
      expectedFiniteSize: { height: 720, width: 1280 },
      expectedSceneRect: { height: 720, width: 1280, x: -640, y: -360 },
      requirementId: "canvas.infinity.continuity",
      target: "canvas.infinity",
    },
  );
});

test("browser: infinity canvas preserves world frame continuity and exports full scene bounds", async ({
  page,
}) => {
  await page.goto("/");
  await createToolcraftBrowserProofSession(page);
  await setTimelineDuration(page, "1s");
  await selectDropdownOptionByTarget(page, "export.image.resolution", "2K");
  await selectDropdownOptionByTarget(page, "export.video.format", "WebM");
  const schedule = createToolcraftVideoFrameSchedule(1);

  const finiteImgDownload = await triggerExportDownload(page, /^Export PNG$/);
  const finiteImg = await inspectToolcraftImageDownload({
    backgroundRgba: BG_RGBA,
    download: finiteImgDownload,
    page,
  });
  const finiteVidDownload = await triggerExportDownload(page, /^Export WebM$/);
  const finiteVid = await inspectToolcraftVideoDownload({
    backgroundRgba: BG_RGBA,
    download: finiteVidDownload,
    page,
    schedule,
  });

  await (await getToolcraftControlFieldByTarget(page, "canvas.infinity"))
    .getByRole("switch")
    .click();

  const infiniteImgDownload = await triggerExportDownload(page, /^Export PNG$/);
  const infiniteImg = await inspectToolcraftImageDownload({
    backgroundRgba: BG_RGBA,
    download: infiniteImgDownload,
    page,
  });
  const infiniteVidDownload = await triggerExportDownload(page, /^Export WebM$/);
  const infiniteVid = await inspectToolcraftVideoDownload({
    backgroundRgba: BG_RGBA,
    download: infiniteVidDownload,
    page,
    schedule,
  });

  await expectToolcraftInfinityCanvasImageExportEvidence(
    { finite: finiteImg.inspection, infinite: infiniteImg.inspection },
    {
      expectedSize: { height: 1152, width: 2048 },
      requirementId: "canvas.infinity.imageExport",
      target: "canvas.infinity",
    },
  );
  await expectToolcraftInfinityCanvasVideoExportEvidence(
    { finite: finiteVid.inspection, infinite: infiniteVid.inspection },
    {
      expectedSize: { height: 720, width: 1280 },
      requirementId: "canvas.infinity.videoExport",
      target: "canvas.infinity",
    },
  );
});
