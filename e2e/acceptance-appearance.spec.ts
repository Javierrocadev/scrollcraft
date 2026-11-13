import { createToolcraftBrowserProofSession } from "./browser-proof-session";
import { expectToolcraftProductObservableToChange } from "./product-observable-helpers";
import {
  EDITABLE_CANVAS,
  ensureTimelinePausedAt,
  FAST_STATIC_OBSERVABLE,
} from "./scrollcraft-test-helpers";
import { test } from "./toolcraft-product-test";

test("browser: canvas backdrop color updates simulator background", async ({
  page,
}) => {
  await page.goto("/");
  const session = await createToolcraftBrowserProofSession(page);
  await ensureTimelinePausedAt(page, 0.2);

  await expectToolcraftProductObservableToChange(
    session,
    session.controlAction("appearance.background", async (control) => {
      await control.scrollIntoViewIfNeeded();
      const hexInput = control.getByRole("textbox");
      await hexInput.fill("#1E293B");
      await hexInput.press("Enter");
    }),
    { ...FAST_STATIC_OBSERVABLE, requirementId: "appearance.background", selector: EDITABLE_CANVAS },
  );
});
