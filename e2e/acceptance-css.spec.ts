import { expectToolcraftAcceptanceOutcome } from "./browser-acceptance-outcome-helpers";
import { getToolcraftControlFieldByTarget } from "./browser-control-target-helpers";
import { createToolcraftBrowserProofSession } from "./browser-proof-session";
import { expectToolcraftSegmentedControlCellsPreservePadding } from "./performance-control-layout-helpers";
import { expectToolcraftProductObservableToChange } from "./product-observable-helpers";
import {
  CSS_CODE_SELECTOR,
  ensureTimelinePausedAt,
  FAST_STATIC_OBSERVABLE,
} from "./scrollcraft-test-helpers";
import { expect, test } from "./toolcraft-product-test";

test("browser: CSS inspector shows live Baseline 2026 rules on preset change", async ({
  page,
}) => {
  await page.goto("/");
  const session = await createToolcraftBrowserProofSession(page);
  await ensureTimelinePausedAt(page, 0.2);

  await expectToolcraftProductObservableToChange(
    session,
    session.targetAction("css.inspector", async () => {
      const presetsField = await getToolcraftControlFieldByTarget(page, "presets.quickSelect");
      await presetsField.getByRole("button", { exact: true, name: "Sticky Header Shrink" }).click();
    }),
    { ...FAST_STATIC_OBSERVABLE, requirementId: "css.inspector", selector: CSS_CODE_SELECTOR },
  );

  await expect(page.locator("[data-scrollcraft-css-inspector]")).toContainText("Baseline 2026 Ready");
  const cssText = (await page.locator(CSS_CODE_SELECTOR).textContent()) ?? "";
  expect(cssText).toContain("@keyframes");
  expect(cssText).toContain("animation-timeline:");
  expect(cssText).toContain("animation-range:");
});

test("browser: CSS output syntax, @supports wrapper, and clipboard copy work", async ({
  page,
}) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  const session = await createToolcraftBrowserProofSession(page);
  await ensureTimelinePausedAt(page, 0.2);

  await expectToolcraftSegmentedControlCellsPreservePadding(page, "Range syntax", {
    requirementId: "css.rangeSyntax",
    target: "css.rangeSyntax",
  });
  await expectToolcraftProductObservableToChange(
    session,
    session.controlAction("css.rangeSyntax", async (control) => {
      await control.scrollIntoViewIfNeeded();
      await control.getByRole("button", { exact: true, name: "Split" }).click();
    }),
    { ...FAST_STATIC_OBSERVABLE, requirementId: "css.rangeSyntax", selector: CSS_CODE_SELECTOR },
  );
  expect((await page.locator(CSS_CODE_SELECTOR).textContent()) ?? "").toContain(
    "animation-range-start:",
  );

  await expectToolcraftProductObservableToChange(
    session,
    session.controlAction("css.includeSupports", async (control) => {
      await control.scrollIntoViewIfNeeded();
      await control.getByRole("switch").click();
    }),
    {
      ...FAST_STATIC_OBSERVABLE,
      requirementId: "css.includeSupports",
      selector: CSS_CODE_SELECTOR,
    },
  );
  expect((await page.locator(CSS_CODE_SELECTOR).textContent()) ?? "").toContain("@supports");

  await expectToolcraftAcceptanceOutcome(
    () => page.locator("[data-scrollcraft-copy-status]").getAttribute("data-scrollcraft-copy-status"),
    session.controlAction("css.copyAction", async (control) => {
      await control.scrollIntoViewIfNeeded();
      await control.getByRole("button", { exact: true, name: "Copy CSS" }).click();
    }),
    { evidenceType: "command-side-effect", requirementId: "css.copyAction" },
  );
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("@keyframes");
});
