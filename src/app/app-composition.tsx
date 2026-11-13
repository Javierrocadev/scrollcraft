import {
  composeToolcraftApp,
  type ToolcraftPanelActionHandler,
} from "@/toolcraft/runtime/react";

import { scrollCraftRendererPipelineRegistration } from "./app-performance";
import { appSchema, CSS_INSPECTOR_CONTROL_TYPE } from "./app-schema";
import { CssInspectorControl } from "./css-inspector-control";
import { generateScrollDrivenCss } from "./css-generator";
import { findCuratedPresetById } from "./presets";
import {
  readScrollCraftConfigFromValues,
  SCROLLCRAFT_EVALUATED_TARGETS,
} from "./scroll-config";
import {
  ScrollCraftCanvasScene,
  scrollCraftRasterExporter,
  scrollCraftSceneBoundsProvider,
} from "./scroll-scene";

async function writeTextToClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard writes may be rejected when permissions are restricted.
    }
  }
}

export const handleScrollCraftPanelAction: ToolcraftPanelActionHandler = ({
  action,
  dispatch,
  state,
}) => {
  const actionValue = typeof action === "string" ? action : action.value;
  const preset = actionValue ? findCuratedPresetById(actionValue) : undefined;
  if (preset) {
    const entries: Array<[string, unknown]> = [
      ["timeline.type", preset.timelineType],
      ["timeline.axis", preset.timelineAxis],
      ["timeline.rangeStart.name", preset.rangeStartName],
      ["timeline.rangeStart.offset", preset.rangeStartOffset],
      ["timeline.rangeEnd.name", preset.rangeEndName],
      ["timeline.rangeEnd.offset", preset.rangeEndOffset],
      ["effect.preset", preset.effectPreset],
      ["effect.easing", preset.effectEasing],
      ["effect.intensity", preset.effectIntensity],
    ];
    for (const [target, value] of entries) {
      dispatch({ target, type: "controls.setValue", value });
    }
    return;
  }

  if (actionValue === "copy-css") {
    const snapshot: Record<string, unknown> = {};
    for (const target of SCROLLCRAFT_EVALUATED_TARGETS) {
      snapshot[target] = state.values[target];
    }
    const config = readScrollCraftConfigFromValues(snapshot);
    const { cssText } = generateScrollDrivenCss(config);
    void writeTextToClipboard(cssText).finally(() => {
      dispatch({
        target: "css.inspector",
        type: "controls.setValue",
        value: "copied",
      });
    });
  }
};

export const appComposition = composeToolcraftApp(appSchema, {
    actions: {
      onPanelAction: handleScrollCraftPanelAction,
    },
    controls: {
      renderers: {
        [CSS_INSPECTOR_CONTROL_TYPE]: CssInspectorControl,
      },
    },
    renderer: {
      pipelineRegistration: scrollCraftRendererPipelineRegistration,
    },
    scene: {
      canvasContent: <ScrollCraftCanvasScene />,
      rasterFrameRenderer: scrollCraftRasterExporter,
      renderDefaultCanvasMedia: false,
      sceneBoundsProvider: scrollCraftSceneBoundsProvider,
    },
  },
);
