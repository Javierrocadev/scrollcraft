import { createToolcraftVideoFrameSchedule } from "../src/toolcraft/runtime/export/video-frame-schedule";
import { expectToolcraftBackgroundOutputSemantics } from "./browser-background-output-evidence";
import { getToolcraftControlFieldByTarget } from "./browser-control-target-helpers";
import { expectToolcraftInfinityCanvasBackgroundEvidence } from "./browser-infinity-canvas-evidence";
import {
  expectToolcraftImageExportArtifact,
  expectToolcraftVideoExportArtifact,
} from "./browser-media-export-evidence";
import { createToolcraftBrowserProofSession } from "./browser-proof-session";
import { inspectToolcraftImageDownload } from "./image-artifact-inspection";
import {
  BG_RGBA,
  ensureTimelinePausedAt,
  EXPECTED_PIXELS,
  EXPECTED_SCENE_BOUNDS,
  readImageAlphaAtOrigin,
  selectDropdownOptionByTarget,
  setTimelineDuration,
  triggerExportDownload,
} from "./scrollcraft-test-helpers";
import { test } from "./toolcraft-product-test";
import { inspectToolcraftVideoDownload } from "./video-artifact-inspection";

test("browser: export image format and resolution controls scale JPG and 8K PNG", async ({
  page,
}) => {
  await page.goto("/");
  const session = await createToolcraftBrowserProofSession(page);
  await ensureTimelinePausedAt(page, 0);

  await selectDropdownOptionByTarget(page, "export.image.resolution", "2K");
  await selectDropdownOptionByTarget(page, "export.image.format", "JPG");
  await expectToolcraftImageExportArtifact(
    session.targetAction("export.image.format", (p) => triggerExportDownload(p, /^Export JPG$/)),
    {
      backgroundRgba: BG_RGBA,
      expectedBounds: EXPECTED_SCENE_BOUNDS,
      expectedHeight: 1152,
      expectedMediaType: "image/jpeg",
      expectedPixels: EXPECTED_PIXELS,
      expectedWidth: 2048,
      page,
      requirementId: "export.image.format",
    },
  );

  await selectDropdownOptionByTarget(page, "export.image.format", "PNG");
  await selectDropdownOptionByTarget(page, "export.image.resolution", "8K");
  await expectToolcraftImageExportArtifact(
    session.targetAction("export.image.resolution", (p) => triggerExportDownload(p, /^Export PNG$/)),
    {
      backgroundRgba: BG_RGBA,
      expectedBounds: EXPECTED_SCENE_BOUNDS,
      expectedHeight: 4608,
      expectedMediaType: "image/png",
      expectedPixels: EXPECTED_PIXELS,
      expectedWidth: 8192,
      page,
      requirementId: "export.image.resolution",
    },
  );
});

test("browser: export video format and resolution controls encode WebM and 4K loop", async ({
  page,
}) => {
  await page.goto("/");
  const session = await createToolcraftBrowserProofSession(page);
  await setTimelineDuration(page, "1s");
  const schedule = createToolcraftVideoFrameSchedule(1);
  const sampleIndices = [...new Set([0, Math.floor(schedule.length / 2), schedule.length - 1])];
  const expectedSamples = sampleIndices.map((idx) => ({
    pixels: EXPECTED_PIXELS,
    timeSeconds: schedule[idx]!.timeSeconds,
  }));

  await selectDropdownOptionByTarget(page, "export.video.format", "WebM");
  await selectDropdownOptionByTarget(page, "export.video.resolution", "4K");
  await expectToolcraftVideoExportArtifact(
    session.targetAction("export.video.format", (p) => triggerExportDownload(p, /^Export WebM$/)),
    {
      additionalArtifactRequirements: [
        { requirementId: "export.video.resolution", target: "export.video.resolution" },
      ],
      animated: true,
      backgroundRgba: BG_RGBA,
      expectedDurationSeconds: 1,
      expectedHeight: 2160,
      expectedMediaType: "video/webm",
      expectedSamples,
      expectedWidth: 3840,
      page,
      requirementId: "export.video.format",
      schedule,
    },
  );
});

test("browser: background visibility hides preview background, makes PNG transparent, and preserves video background", async ({
  page,
}) => {
  await page.goto("/");
  const session = await createToolcraftBrowserProofSession(page);
  await setTimelineDuration(page, "1s");
  await selectDropdownOptionByTarget(page, "export.image.resolution", "2K");
  const schedule = createToolcraftVideoFrameSchedule(1);

  const observePreview = session.observe((root) => {
    const bgLayer = root.querySelector<HTMLElement>("[data-toolcraft-finite-background-layer]");
    const bg = bgLayer ? getComputedStyle(bgLayer).backgroundColor : "rgba(0, 0, 0, 0)";
    const backgroundVisible =
      bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)" && !bg.endsWith(", 0)");
    return { backgroundVisible, outputSignature: `bg:${bg}:${backgroundVisible}` };
  });

  await expectToolcraftBackgroundOutputSemantics(
    observePreview,
    session.controlAction("export.includeBackground", async (control) => {
      await control.getByRole("switch").click();
    }),
    { backgroundVisible: false, outputSignature: "bg:rgba(0, 0, 0, 0):false" },
    session.targetAction("actions.output", (p) => triggerExportDownload(p, /^Export PNG$/)),
    async (download) => {
      const inspected = await inspectToolcraftImageDownload({
        backgroundRgba: [0, 0, 0, 0],
        download,
        page,
      });
      const backgroundAlpha = await readImageAlphaAtOrigin(page, download);
      return { ...inspected.inspection, backgroundAlpha };
    },
    {
      requirementId: "export.includeBackground",
      video: {
        exportArtifact: session.targetAction("actions.output", (p) =>
          triggerExportDownload(p, /^Export MP4$/),
        ),
        inspectArtifact: async (download) => {
          const inspected = await inspectToolcraftVideoDownload({
            backgroundRgba: BG_RGBA,
            download,
            page,
            schedule,
          });
          const corner = inspected.observations[0]?.normalizedPixels.slice(0, 4);
          const dist = corner
            ? Math.hypot(
                corner[0]! - BG_RGBA[0],
                corner[1]! - BG_RGBA[1],
                corner[2]! - BG_RGBA[2],
              )
            : Number.POSITIVE_INFINITY;
          return {
            ...inspected.inspection,
            backgroundIncluded: dist <= 48,
          };
        },
      },
    },
  );

  const bgSwitch = (
    await getToolcraftControlFieldByTarget(page, "export.includeBackground")
  ).getByRole("switch");
  await bgSwitch.click();
  const infinitySwitch = (
    await getToolcraftControlFieldByTarget(page, "canvas.infinity")
  ).getByRole("switch");
  await infinitySwitch.click();

  const { observeInfinityCanvasBackground } = await import("./browser-infinity-canvas-evidence");
  const infinite = await observeInfinityCanvasBackground(page);
  await bgSwitch.click();
  const backgroundExcluded = await observeInfinityCanvasBackground(page);
  await bgSwitch.click();
  const backgroundRestored = await observeInfinityCanvasBackground(page);

  await expectToolcraftInfinityCanvasBackgroundEvidence(
    { backgroundExcluded, backgroundRestored, infinite },
    {
      expectedBackgroundColor: "#0B1020",
      requirementId: "export.includeBackground",
      target: "export.includeBackground",
    },
  );
});
