import { getToolcraftApplicabilityRequirementId } from "../src/app/app-acceptance";
import { expectToolcraftAcceptanceOutcome } from "./browser-acceptance-outcome-helpers";
import { expectToolcraftControlApplicabilityState } from "./browser-control-applicability-evidence";
import { createToolcraftBrowserProofSession } from "./browser-proof-session";
import { expectToolcraftSegmentedControlCellsPreservePadding } from "./performance-control-layout-helpers";
import { expectToolcraftProductObservableToChange } from "./product-observable-helpers";
import {
  ensureTimelinePausedAt,
  FAST_STATIC_OBSERVABLE,
  getApplicabilityCase,
  SIMULATOR_CANVAS,
} from "./scrollcraft-test-helpers";
import { test } from "./toolcraft-product-test";

test("browser: device mockup frame updates simulator preview", async ({ page }) => {
  await page.goto("/");
  const session = await createToolcraftBrowserProofSession(page);
  await ensureTimelinePausedAt(page, 0.2);

  await expectToolcraftSegmentedControlCellsPreservePadding(page, "Device frame", {
    requirementId: "preview.deviceMockup",
    target: "preview.deviceMockup",
  });
  await expectToolcraftProductObservableToChange(
    session,
    session.controlAction("preview.deviceMockup", async (control) => {
      await control.scrollIntoViewIfNeeded();
      await control.getByRole("button", { exact: true, name: "Mobile" }).click();
      await control.getByRole("button", { exact: true, name: "Minimal" }).click();
    }),
    { ...FAST_STATIC_OBSERVABLE, requirementId: "preview.deviceMockup", selector: SIMULATOR_CANVAS },
  );
});

test("browser: range HUD and export HUD switches toggle guides and export", async ({
  page,
}) => {
  await page.goto("/");
  const session = await createToolcraftBrowserProofSession(page);
  await ensureTimelinePausedAt(page, 0.2);

  const visibleHudCase = getApplicabilityCase("preview.exportHud", "visible");
  await expectToolcraftAcceptanceOutcome(
    () =>
      page
        .getByRole("switch", { exact: true, name: "Export HUD" })
        .getAttribute("aria-checked"),
    session.controlAction("preview.exportHud", async (control) => {
      await control.scrollIntoViewIfNeeded();
      await control.getByRole("switch").click();
    }),
    {
      evidenceType: "command-side-effect",
      requirementId: getToolcraftApplicabilityRequirementId("preview.exportHud", visibleHudCase),
    },
  );

  await expectToolcraftProductObservableToChange(
    session,
    session.controlAction("preview.showHud", async (control) => {
      await control.scrollIntoViewIfNeeded();
      await control.getByRole("switch").click();
    }),
    { ...FAST_STATIC_OBSERVABLE, requirementId: "preview.showHud", selector: SIMULATOR_CANVAS },
  );
});

test("browser: export HUD applicability follows range HUD switch", async ({
  page,
}) => {
  await page.goto("/");
  const session = await createToolcraftBrowserProofSession(page);
  await ensureTimelinePausedAt(page, 0.2);

  const hiddenHudCase = getApplicabilityCase("preview.exportHud", "hidden");
  const visibleHudCase = getApplicabilityCase("preview.exportHud", "visible");
  await expectToolcraftControlApplicabilityState(
    session,
    session.controlAction("preview.showHud", async (control) => {
      await control.scrollIntoViewIfNeeded();
      await control.getByRole("switch").click();
    }),
    hiddenHudCase,
    { baseRequirementId: "preview.exportHud" },
  );
  await expectToolcraftControlApplicabilityState(
    session,
    session.controlAction("preview.showHud", async (control) => {
      await control.scrollIntoViewIfNeeded();
      await control.getByRole("switch").click();
    }),
    visibleHudCase,
    { baseRequirementId: "preview.exportHud" },
  );
});
