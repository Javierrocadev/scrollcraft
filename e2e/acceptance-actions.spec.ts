import { createToolcraftVideoFrameSchedule } from "../src/toolcraft/runtime/export/video-frame-schedule";
import {
  expectToolcraftImageExportArtifact,
  expectToolcraftVideoExportArtifact,
} from "./browser-media-export-evidence";
import { createToolcraftBrowserProofSession } from "./browser-proof-session";
import {
  BG_RGBA,
  ensureTimelinePausedAt,
  EXPECTED_PIXELS,
  EXPECTED_SCENE_BOUNDS,
  setTimelineDuration,
  triggerExportDownload,
} from "./scrollcraft-test-helpers";
import { test } from "./toolcraft-product-test";

test("browser: actions export default PNG poster and MP4 video loop matching simulated scroll", async ({
  page,
}) => {
  await page.goto("/");
  const session = await createToolcraftBrowserProofSession(page);
  await ensureTimelinePausedAt(page, 0);

  await expectToolcraftImageExportArtifact(
    session.targetAction("actions.output", (p) => triggerExportDownload(p, /^Export PNG$/)),
    {
      backgroundRgba: BG_RGBA,
      expectedBounds: EXPECTED_SCENE_BOUNDS,
      expectedHeight: 2304,
      expectedMediaType: "image/png",
      expectedPixels: EXPECTED_PIXELS,
      expectedWidth: 4096,
      page,
      requirementId: "actions.output",
    },
  );

  await setTimelineDuration(page, "1s");
  const schedule = createToolcraftVideoFrameSchedule(1);
  const sampleIndices = [...new Set([0, Math.floor(schedule.length / 2), schedule.length - 1])];
  const expectedSamples = sampleIndices.map((idx) => ({
    pixels: EXPECTED_PIXELS,
    timeSeconds: schedule[idx]!.timeSeconds,
  }));

  await expectToolcraftVideoExportArtifact(
    session.targetAction("actions.output", (p) => triggerExportDownload(p, /^Export MP4$/)),
    {
      animated: true,
      backgroundRgba: BG_RGBA,
      expectedDurationSeconds: 1,
      expectedHeight: 720,
      expectedMediaType: "video/mp4",
      expectedSamples,
      expectedWidth: 1280,
      page,
      requirementId: "actions.output",
      schedule,
    },
  );
});
