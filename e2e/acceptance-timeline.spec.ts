import { getToolcraftApplicabilityRequirementId } from "../src/app/app-acceptance";
import { expectToolcraftControlApplicabilityState } from "./browser-control-applicability-evidence";
import { createToolcraftBrowserProofSession } from "./browser-proof-session";
import { expectToolcraftStandardTimelinePlayback } from "./browser-standard-timeline-evidence";
import { expectToolcraftSegmentedControlCellsPreservePadding } from "./performance-control-layout-helpers";
import { expectToolcraftProductObservableToChange } from "./product-observable-helpers";
import {
  ensureTimelinePausedAt,
  FAST_STATIC_OBSERVABLE,
  getApplicabilityCase,
  scrollAndDragSlider,
  selectDropdownOption,
  SIMULATOR_CANVAS,
} from "./scrollcraft-test-helpers";
import { test } from "./toolcraft-product-test";

test("browser: timeline source and axis update simulation and CSS", async ({
  page,
}) => {
  await page.goto("/");
  const session = await createToolcraftBrowserProofSession(page);
  await ensureTimelinePausedAt(page, 0.25);

  await expectToolcraftSegmentedControlCellsPreservePadding(page, "Timeline source", {
    requirementId: "timeline.type",
    target: "timeline.type",
  });
  await expectToolcraftSegmentedControlCellsPreservePadding(page, "Scroll axis", {
    requirementId: "timeline.axis",
    target: "timeline.axis",
  });

  await expectToolcraftProductObservableToChange(
    session,
    session.controlAction("timeline.type", async (control) => {
      await control.getByRole("button", { exact: true, name: "scroll()" }).click();
    }),
    { ...FAST_STATIC_OBSERVABLE, requirementId: "timeline.type", selector: SIMULATOR_CANVAS },
  );
  await page
    .locator('[data-toolcraft-control-target="timeline.type"]')
    .getByRole("button", { exact: true, name: "view()" })
    .click();

  await expectToolcraftProductObservableToChange(
    session,
    session.controlAction("timeline.axis", async (control) => {
      await control.getByRole("button", { exact: true, name: "Inline" }).click();
    }),
    { ...FAST_STATIC_OBSERVABLE, requirementId: "timeline.axis", selector: SIMULATOR_CANVAS },
  );
});

test("browser: timeline range start offset updates simulation and CSS", async ({
  page,
}) => {
  await page.goto("/");
  const session = await createToolcraftBrowserProofSession(page);
  await ensureTimelinePausedAt(page, 0.25);

  await expectToolcraftProductObservableToChange(
    session,
    session.controlAction("timeline.rangeStart.offset", async () => {
      await scrollAndDragSlider(page, "timeline.rangeStart.offset", 20);
    }),
    {
      ...FAST_STATIC_OBSERVABLE,
      requirementId: "timeline.rangeStart.offset",
      selector: SIMULATOR_CANVAS,
    },
  );
});

test("browser: timeline range end offset updates simulation and CSS", async ({
  page,
}) => {
  await page.goto("/");
  const session = await createToolcraftBrowserProofSession(page);
  await ensureTimelinePausedAt(page, 0.25);

  await expectToolcraftProductObservableToChange(
    session,
    session.controlAction("timeline.rangeEnd.offset", async () => {
      await scrollAndDragSlider(page, "timeline.rangeEnd.offset", 80);
    }),
    {
      ...FAST_STATIC_OBSERVABLE,
      requirementId: "timeline.rangeEnd.offset",
      selector: SIMULATOR_CANVAS,
    },
  );
});

test("browser: view() range start boundary name updates applicability and simulation", async ({
  page,
}) => {
  await page.goto("/");
  const session = await createToolcraftBrowserProofSession(page);
  await ensureTimelinePausedAt(page, 0.25);

  const target = "timeline.rangeStart.name" as const;
  const hiddenCase = getApplicabilityCase(target, "hidden");
  const visibleCase = getApplicabilityCase(target, "visible");

  await expectToolcraftControlApplicabilityState(
    session,
    session.controlAction("timeline.type", async (control) => {
      await control.scrollIntoViewIfNeeded();
      await control.getByRole("button", { exact: true, name: "scroll()" }).click();
    }),
    hiddenCase,
    { baseRequirementId: target },
  );
  await expectToolcraftControlApplicabilityState(
    session,
    session.controlAction("timeline.type", async (control) => {
      await control.scrollIntoViewIfNeeded();
      await control.getByRole("button", { exact: true, name: "view()" }).click();
    }),
    visibleCase,
    { baseRequirementId: target },
  );

  await expectToolcraftProductObservableToChange(
    session,
    session.controlAction(target, async (control) => {
      for (const opt of ["cover", "contain", "exit", "contain"]) {
        await selectDropdownOption(page, control, opt);
      }
    }),
    {
      ...FAST_STATIC_OBSERVABLE,
      requirementId: getToolcraftApplicabilityRequirementId(target, visibleCase),
      selector: SIMULATOR_CANVAS,
    },
  );
});

test("browser: view() range end boundary name updates applicability and simulation", async ({
  page,
}) => {
  await page.goto("/");
  const session = await createToolcraftBrowserProofSession(page);
  await ensureTimelinePausedAt(page, 0.25);

  const target = "timeline.rangeEnd.name" as const;
  const hiddenCase = getApplicabilityCase(target, "hidden");
  const visibleCase = getApplicabilityCase(target, "visible");

  await expectToolcraftControlApplicabilityState(
    session,
    session.controlAction("timeline.type", async (control) => {
      await control.scrollIntoViewIfNeeded();
      await control.getByRole("button", { exact: true, name: "scroll()" }).click();
    }),
    hiddenCase,
    { baseRequirementId: target },
  );
  await expectToolcraftControlApplicabilityState(
    session,
    session.controlAction("timeline.type", async (control) => {
      await control.scrollIntoViewIfNeeded();
      await control.getByRole("button", { exact: true, name: "view()" }).click();
    }),
    visibleCase,
    { baseRequirementId: target },
  );

  await expectToolcraftProductObservableToChange(
    session,
    session.controlAction(target, async (control) => {
      for (const opt of ["entry", "contain", "exit"]) {
        await selectDropdownOption(page, control, opt);
      }
    }),
    {
      ...FAST_STATIC_OBSERVABLE,
      requirementId: getToolcraftApplicabilityRequirementId(target, visibleCase),
      selector: SIMULATOR_CANVAS,
    },
  );
});

test("browser: timeline playback controls drive scroll loop", async ({ page }) => {
  await page.goto("/");
  const session = await createToolcraftBrowserProofSession(page);
  await expectToolcraftStandardTimelinePlayback(session, {
    markerSelector: "[data-scrollcraft-timeline-marker]",
    requirementId: "timeline.playback",
  });
});
