import { expectToolcraftAcceptanceOutcome } from "./browser-acceptance-outcome-helpers";
import { createToolcraftBrowserProofSession } from "./browser-proof-session";
import { ensureTimelinePausedAt, SIMULATOR_CANVAS, CSS_CODE_SELECTOR } from "./scrollcraft-test-helpers";
import { test } from "./toolcraft-product-test";

test("browser: presets populate schema values and simulator canvas", async ({
  page,
}) => {
  await page.goto("/");
  const session = await createToolcraftBrowserProofSession(page);
  await ensureTimelinePausedAt(page, 0.2);

  const presetLabels = [
    "3D Card Reveal",
    "Sticky Header Shrink",
    "Reading Progress Bar",
    "Parallax Image Depth",
    "Stagger Kinetic List",
  ];
  await expectToolcraftAcceptanceOutcome(
    async () => {
      const css = await page.locator(CSS_CODE_SELECTOR).textContent();
      const canvasSig = await page.locator(SIMULATOR_CANVAS).evaluate((el) => {
        const canvas = el as HTMLCanvasElement;
        return canvas.toDataURL().slice(-64);
      });
      return `${css ?? ""}::${canvasSig}`;
    },
    session.controlAction("presets.quickSelect", async (control) => {
      for (const label of presetLabels) {
        await control.getByRole("button", { exact: true, name: label }).click();
      }
    }),
    { evidenceType: "command-side-effect", requirementId: "presets.quickSelect" },
  );
});
