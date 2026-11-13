import type { ToolcraftComponentAcceptance } from "./acceptance/types";
import { appSchema } from "./app-schema";
export {
  appControlSectionInventory,
  appProductReadiness,
  appTransferMode,
} from "./app-acceptance-inventory";

const resolvedPersistenceSlices =
  appSchema.persistence.storage === "localStorage"
    ? appSchema.persistence.include
    : [];

const PRESETS_SPEC = "e2e/acceptance-presets.spec.ts" as const;
const TIMELINE_SPEC = "e2e/acceptance-timeline.spec.ts" as const;
const EFFECT_SPEC = "e2e/acceptance-effect.spec.ts" as const;
const PREVIEW_SPEC = "e2e/acceptance-preview.spec.ts" as const;
const CSS_SPEC = "e2e/acceptance-css.spec.ts" as const;
const APPEARANCE_SPEC = "e2e/acceptance-appearance.spec.ts" as const;
const ACTIONS_SPEC = "e2e/acceptance-actions.spec.ts" as const;
const EXPORT_SPEC = "e2e/acceptance-export.spec.ts" as const;
const CANVAS_SPEC = "e2e/acceptance-canvas.spec.ts" as const;

const TEST_PRESETS =
  "browser: presets populate schema values and simulator canvas";
const TEST_TIMELINE_SOURCE_AXIS =
  "browser: timeline source and axis update simulation and CSS";
const TEST_TIMELINE_START_OFFSET =
  "browser: timeline range start offset updates simulation and CSS";
const TEST_TIMELINE_END_OFFSET =
  "browser: timeline range end offset updates simulation and CSS";
const TEST_TIMELINE_START_NAME =
  "browser: view() range start boundary name updates applicability and simulation";
const TEST_TIMELINE_END_NAME =
  "browser: view() range end boundary name updates applicability and simulation";
const TEST_EFFECT_PRESET =
  "browser: scroll effect preset renders all five subject presets";
const TEST_EFFECT_CURVE_INTENSITY =
  "browser: scroll effect easing and intensity update simulation and CSS";
const TEST_PREVIEW_DEVICE =
  "browser: device mockup frame updates simulator preview";
const TEST_PREVIEW_HUD_SWITCHES =
  "browser: range HUD and export HUD switches toggle guides and export";
const TEST_PREVIEW_EXPORT_HUD_APPLICABILITY =
  "browser: export HUD applicability follows range HUD switch";
const TEST_CSS_INSPECTOR =
  "browser: CSS inspector shows live Baseline 2026 rules on preset change";
const TEST_CSS_OUTPUT =
  "browser: CSS output syntax, @supports wrapper, and clipboard copy work";
const TEST_APPEARANCE_BACKDROP =
  "browser: canvas backdrop color updates simulator background";
const TEST_TIMELINE_PLAYBACK =
  "browser: timeline playback controls drive scroll loop";
const TEST_RENDER_SCALE =
  "browser: render scale preserves crisp backing pixels across states";
const TEST_ACTIONS_EXPORT =
  "browser: actions export default PNG poster and MP4 video loop matching simulated scroll";
const TEST_IMAGE_EXPORTS =
  "browser: export image format and resolution controls scale JPG and 8K PNG";
const TEST_VIDEO_EXPORTS =
  "browser: export video format and resolution controls encode WebM and 4K loop";
const TEST_BACKGROUND_OUTPUT =
  "browser: background visibility hides preview background, makes PNG transparent, and preserves video background";
const TEST_INFINITY_CONTINUITY =
  "browser: infinity canvas preserves world frame continuity and dormant finite size";
const TEST_INFINITY_CANVAS =
  "browser: infinity canvas preserves world frame continuity and exports full scene bounds";

export const appAcceptance: readonly ToolcraftComponentAcceptance[] = [
  {
    actionCoverage: [
      "card-3d",
      "scale-down",
      "progress-tracker",
      "parallax",
      "fade-blur",
    ],
    automated: true,
    automatedTestName: "presets populate schema values and simulator canvas",
    browser: {
      budget: "standard",
      file: PRESETS_SPEC,
      testName: TEST_PRESETS,
    },
    componentType: "actions",
    evidence: "command-side-effect",
    expectedObservable:
      "Clicking each curated preset updates timeline, range, effect controls, simulator canvas pixels, and generated CSS.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "presets.quickSelect",
    interactionId: "presets.panel-select",
    kind: "control",
    target: "presets.quickSelect",
    userAction: "Click curated preset buttons in Curated Presets.",
  },
  {
    automated: true,
    automatedTestName: "timeline.type switches between view() and scroll()",
    browser: {
      budget: "standard",
      file: TIMELINE_SPEC,
      testName: TEST_TIMELINE_SOURCE_AXIS,
    },
    componentType: "segmented",
    evidence: "rendered-pixels",
    expectedObservable:
      "Switching view()/scroll() updates simulator range guide geometry and CSS animation-timeline output.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "timeline.type",
    kind: "control",
    optionCoverage: "each-visible-item",
    target: "timeline.type",
    userAction: "Toggle Timeline source between view() and scroll().",
  },
  {
    automated: true,
    automatedTestName: "timeline.axis switches between block and inline",
    browser: {
      budget: "standard",
      file: TIMELINE_SPEC,
      testName: TEST_TIMELINE_SOURCE_AXIS,
    },
    componentType: "segmented",
    evidence: "rendered-pixels",
    expectedObservable:
      "Switching Block/Inline reorients scroll simulation, range HUD guide lines, and CSS axis keyword.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "timeline.axis",
    kind: "control",
    optionCoverage: "each-visible-item",
    target: "timeline.axis",
    userAction: "Switch Scroll axis between Block and Inline.",
  },
  {
    automated: true,
    automatedTestName: "timeline.rangeStart.name updates entry/cover/contain/exit",
    browser: {
      budget: "standard",
      file: TIMELINE_SPEC,
      testName: TEST_TIMELINE_START_NAME,
    },
    componentType: "select",
    evidence: "rendered-pixels",
    expectedObservable:
      "Selecting entry, cover, contain, or exit updates the green start threshold line and animation-range start keyword.",
    fixture: "view() timeline mode",
    id: "timeline.rangeStart.name",
    kind: "control",
    optionCoverage: "each-visible-item",
    target: "timeline.rangeStart.name",
    userAction: "Select each Range start boundary option.",
  },
  {
    automated: true,
    automatedTestName: "timeline.rangeEnd.name updates entry/cover/contain/exit",
    browser: {
      budget: "standard",
      file: TIMELINE_SPEC,
      testName: TEST_TIMELINE_END_NAME,
    },
    componentType: "select",
    evidence: "rendered-pixels",
    expectedObservable:
      "Selecting entry, cover, contain, or exit updates the red end threshold line and animation-range end keyword.",
    fixture: "view() timeline mode",
    id: "timeline.rangeEnd.name",
    kind: "control",
    optionCoverage: "each-visible-item",
    target: "timeline.rangeEnd.name",
    userAction: "Select each Range end boundary option.",
  },
  {
    automated: true,
    automatedTestName: "timeline.rangeStart.offset shifts start threshold",
    browser: {
      budget: "standard",
      file: TIMELINE_SPEC,
      testName: TEST_TIMELINE_START_OFFSET,
    },
    componentType: "slider",
    evidence: "rendered-pixels",
    expectedObservable:
      "Adjusting Start offset updates the simulator boundary guide, telemetry progress, and generated CSS percentage.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "timeline.rangeStart.offset",
    kind: "control",
    target: "timeline.rangeStart.offset",
    userAction: "Adjust Start offset slider.",
  },
  {
    automated: true,
    automatedTestName: "timeline.rangeEnd.offset shifts end threshold",
    browser: {
      budget: "standard",
      file: TIMELINE_SPEC,
      testName: TEST_TIMELINE_END_OFFSET,
    },
    componentType: "slider",
    evidence: "rendered-pixels",
    expectedObservable:
      "Adjusting End offset updates the simulator boundary guide, telemetry progress, and generated CSS percentage.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "timeline.rangeEnd.offset",
    kind: "control",
    target: "timeline.rangeEnd.offset",
    userAction: "Adjust End offset slider.",
  },
  {
    automated: true,
    automatedTestName: "effect.preset renders all five CSS subject presets",
    browser: {
      budget: "standard",
      file: EFFECT_SPEC,
      testName: TEST_EFFECT_PRESET,
    },
    componentType: "select",
    evidence: "rendered-pixels",
    expectedObservable:
      "Selecting each Effect preset renders the corresponding subject geometry and updates @keyframes CSS.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "effect.preset",
    kind: "control",
    optionCoverage: "each-visible-item",
    target: "effect.preset",
    userAction: "Select each Effect preset option.",
  },
  {
    automated: true,
    automatedTestName: "effect.easing changes curve interpolation and CSS output",
    browser: {
      budget: "standard",
      file: EFFECT_SPEC,
      testName: TEST_EFFECT_CURVE_INTENSITY,
    },
    componentType: "select",
    evidence: "rendered-pixels",
    expectedObservable:
      "Changing Timing curve updates eased progress evaluation and CSS animation-timing-function.",
    fixture: "timeline scrubbed to mid-range progress",
    id: "effect.easing",
    kind: "control",
    optionCoverage: "each-visible-item",
    target: "effect.easing",
    userAction: "Select each Timing curve option.",
  },
  {
    automated: true,
    automatedTestName: "effect.intensity scales transform amplitude",
    browser: {
      budget: "standard",
      file: EFFECT_SPEC,
      testName: TEST_EFFECT_CURVE_INTENSITY,
    },
    componentType: "slider",
    evidence: "rendered-pixels",
    expectedObservable:
      "Adjusting Effect intensity scales the subject transform magnitude and CSS keyframe values.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "effect.intensity",
    kind: "control",
    target: "effect.intensity",
    userAction: "Adjust Effect intensity slider.",
  },
  {
    automated: true,
    automatedTestName: "preview.deviceMockup switches Browser, Mobile, Minimal frames",
    browser: {
      budget: "standard",
      file: PREVIEW_SPEC,
      testName: TEST_PREVIEW_DEVICE,
    },
    componentType: "segmented",
    evidence: "rendered-pixels",
    expectedObservable:
      "Switching Device frame redraws the canvas with browser chrome, mobile phone frame, or minimal container.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "preview.deviceMockup",
    kind: "control",
    optionCoverage: "each-visible-item",
    target: "preview.deviceMockup",
    userAction: "Select Browser, Mobile, and Minimal device frames.",
  },
  {
    automated: true,
    automatedTestName: "preview.showHud toggles geometric range HUD guides",
    browser: {
      budget: "standard",
      file: PREVIEW_SPEC,
      testName: TEST_PREVIEW_HUD_SWITCHES,
    },
    componentType: "switch",
    evidence: "rendered-pixels",
    expectedObservable:
      "Toggling Range HUD removes/restores green and red dashed boundary guides and telemetry chip on canvas.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "preview.showHud",
    kind: "control",
    target: "preview.showHud",
    userAction: "Toggle Range HUD switch.",
  },
  {
    automated: true,
    automatedTestName: "preview.exportHud toggles HUD retention inside exports",
    browser: {
      budget: "standard",
      file: PREVIEW_SPEC,
      testName: TEST_PREVIEW_EXPORT_HUD_APPLICABILITY,
    },
    componentType: "switch",
    evidence: "command-side-effect",
    expectedObservable:
      "Export HUD appears when Range HUD is enabled, hides when Range HUD is disabled, and updates export HUD inclusion.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "preview.exportHud",
    kind: "control",
    target: "preview.exportHud",
    userAction: "Toggle Export HUD while Range HUD is enabled.",
  },
  {
    automated: true,
    automatedTestName: "css.rangeSyntax toggles shorthand and longhand CSS output",
    browser: {
      budget: "standard",
      file: CSS_SPEC,
      testName: TEST_CSS_OUTPUT,
    },
    componentType: "segmented",
    evidence: "product-output",
    expectedObservable:
      "Switching Shorthand/Split updates generated CSS between animation-range and animation-range-start/end.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "css.rangeSyntax",
    kind: "control",
    optionCoverage: "each-visible-item",
    target: "css.rangeSyntax",
    userAction: "Toggle Range syntax between Shorthand and Split.",
  },
  {
    automated: true,
    automatedTestName: "css.includeSupports wraps rules in @supports block",
    browser: {
      budget: "standard",
      file: CSS_SPEC,
      testName: TEST_CSS_OUTPUT,
    },
    componentType: "switch",
    evidence: "product-output",
    expectedObservable:
      "Enabling @supports fallback wraps generated CSS rules inside @supports (animation-timeline: view()).",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "css.includeSupports",
    kind: "control",
    target: "css.includeSupports",
    userAction: "Toggle @supports fallback switch.",
  },
  {
    automated: true,
    automatedTestName: "css.inspector renders Baseline 2026 compatibility and live CSS",
    browser: {
      budget: "standard",
      file: CSS_SPEC,
      testName: TEST_CSS_INSPECTOR,
    },
    builtInFitCheck: {
      capabilities: ["custom-visualization"],
      checkedBuiltIns: ["code", "text"],
      closestBuiltIn: "code",
      productObservable:
        "Live formatted CSS block paired with Baseline 2026 support badge and instant copy feedback inside CSS Output.",
      whyInsufficient:
        "Built-in text or code controls only render a static editable field without live derived CSS synthesis, Baseline 2026 browser badges, and synced copy-state indicator.",
    },
    componentType: "css-inspector",
    customControlCoverage: [
      "built-in-gap",
      "kit-primitives",
      "minimal-ui",
      "product-output",
      "runtime-state",
    ],
    evidence: "product-output",
    expectedObservable:
      "Live CSS inspector displays updated @keyframes, animation-timeline, animation-range, and Baseline 2026 compatibility badge.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "css.inspector",
    kind: "control",
    target: "css.inspector",
    userAction: "Change timeline or effect settings and read Generated CSS output.",
  },
  {
    actionCoverage: ["copy-css"],
    automated: true,
    automatedTestName: "css.copyAction writes generated CSS to clipboard",
    browser: {
      budget: "standard",
      file: CSS_SPEC,
      testName: TEST_CSS_OUTPUT,
    },
    componentType: "actions",
    evidence: "command-side-effect",
    expectedObservable:
      "Clicking Copy CSS writes the current Baseline 2026 CSS snippet to clipboard and shows copied feedback.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "css.copyAction",
    interactionId: "css.panel-copy",
    kind: "control",
    target: "css.copyAction",
    userAction: "Click Copy CSS button.",
  },
  {
    automated: true,
    automatedTestName: "export.includeBackground controls preview, PNG transparency, and video background",
    backgroundOutputCoverage: "all-required-background-output",
    browser: {
      budget: "extended-io",
      file: EXPORT_SPEC,
      testName: TEST_BACKGROUND_OUTPUT,
    },
    componentType: "switch",
    evidence: "exported-bytes",
    expectedObservable:
      "Turning Background off hides preview background, exports transparent PNG, preserves video background, and keeps Infinity viewport color synced.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "export.includeBackground",
    kind: "control",
    target: "export.includeBackground",
    userAction: "Toggle Background switch in Settings and export PNG/Video.",
  },
  {
    automated: true,
    automatedTestName: "appearance.background updates canvas and exported background color",
    browser: {
      budget: "standard",
      file: APPEARANCE_SPEC,
      testName: TEST_APPEARANCE_BACKDROP,
    },
    componentType: "color",
    evidence: "rendered-pixels",
    expectedObservable:
      "Editing Background color changes the canvas backdrop color and exported PNG/video backdrop.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "appearance.background",
    kind: "control",
    target: "appearance.background",
    userAction: "Change Background color in Settings.",
  },
  {
    automated: true,
    automatedTestName: "export.image.format switches PNG and JPG image output",
    browser: {
      budget: "extended-io",
      file: EXPORT_SPEC,
      testName: TEST_IMAGE_EXPORTS,
    },
    componentType: "select",
    evidence: "exported-bytes",
    expectedObservable:
      "Selecting PNG or JPG exports a decoded image file matching the chosen image media type.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "export.image.format",
    kind: "control",
    optionCoverage: "each-visible-item",
    target: "export.image.format",
    userAction: "Select PNG and JPG in Image Export Format.",
  },
  {
    automated: true,
    automatedTestName: "export.image.resolution scales exported image pixel dimensions",
    browser: {
      budget: "extended-io",
      file: EXPORT_SPEC,
      testName: TEST_IMAGE_EXPORTS,
    },
    componentType: "select",
    evidence: "exported-bytes",
    expectedObservable:
      "Selecting 2K, 4K, or 8K exports crisp raster images at matching scaled pixel dimensions.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "export.image.resolution",
    kind: "control",
    optionCoverage: "each-visible-item",
    target: "export.image.resolution",
    userAction: "Select image resolution presets and click Export PNG.",
  },
  {
    automated: true,
    automatedTestName: "export.video.format switches MP4 and WebM loop export",
    browser: {
      budget: "extended-io",
      file: EXPORT_SPEC,
      testName: TEST_VIDEO_EXPORTS,
    },
    componentType: "select",
    evidence: "exported-bytes",
    expectedObservable:
      "Selecting MP4 or WebM exports a looping video file matching the selected video container.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "export.video.format",
    kind: "control",
    optionCoverage: "each-visible-item",
    target: "export.video.format",
    userAction: "Select MP4 and WebM in Video Export Format.",
  },
  {
    automated: true,
    automatedTestName: "export.video.resolution switches Current and 4K video export",
    browser: {
      budget: "extended-io",
      file: EXPORT_SPEC,
      testName: TEST_VIDEO_EXPORTS,
    },
    componentType: "select",
    evidence: "exported-bytes",
    expectedObservable:
      "Selecting Current or 4K updates exported video frame dimensions accordingly.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "export.video.resolution",
    kind: "control",
    optionCoverage: "each-visible-item",
    target: "export.video.resolution",
    userAction: "Select Current and 4K in Video Export Resolution.",
  },
  {
    actionCoverage: ["export.png", "export.video"],
    automated: true,
    automatedTestName: "actions.output exports real PNG poster and looping MP4/WebM video",
    browser: {
      budget: "extended-io",
      file: ACTIONS_SPEC,
      testName: TEST_ACTIONS_EXPORT,
    },
    componentType: "panelActions",
    evidence: "exported-bytes",
    exportArtifactCoverage: [
      "all-required-image-export-behavior",
      "all-required-video-export-behavior",
    ],
    expectedObservable:
      "Export PNG and Export Video produce valid decoded raster and animated loop artifacts matching the canvas simulation.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "actions.output",
    kind: "control",
    target: "actions.output",
    userAction: "Click Export PNG and Export Video in the footer actions.",
  },
  {
    automated: true,
    automatedTestName: "timeline.playback drives scroll simulation loop seamlessly across duration edits",
    browser: {
      budget: "standard",
      file: TIMELINE_SPEC,
      testName: TEST_TIMELINE_PLAYBACK,
    },
    componentType: "timeline",
    evidence: "timeline-output",
    expectedObservable:
      "Scrubbing, pausing/resuming, and changing timeline duration smoothly drives the periodic scroll loop with matching start and end seam frames.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "timeline.playback",
    kind: "runtime",
    target: "timeline.playback",
    timelineCoverage: "playback",
    timelineLoopProof: {
      direction: "forward-only",
      durationChange: "reproved-after-edit",
      reversePlayback: "forbidden",
      seam: "first-last-match",
    },
    timelinePlaybackCoverage: "all-playback-behavior",
    userAction: "Open Timeline, scrub, edit duration, pause, and resume playback.",
  },
  {
    automated: true,
    automatedTestName: "canvas.renderScale maintains selected backing pixel multiplier",
    browser: {
      budget: "standard",
      file: CANVAS_SPEC,
      testName: TEST_RENDER_SCALE,
    },
    componentType: "canvas",
    evidence: "rendered-pixels",
    expectedObservable:
      "Simulator canvas preserves exact selected backing pixels during interaction, playback, and steady states.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "canvas.renderScale",
    kind: "runtime",
    renderScaleCoverage: {
      kind: "selected-backing-pixels",
      states: ["interaction", "playback", "steady"],
    },
    target: "canvas.renderScale",
    userAction: "Inspect canvas backing dimensions across interaction, playback, and steady states.",
  },
  {
    automated: true,
    automatedTestName: "canvas.infinity preserves world frame continuity and dormant finite size",
    browser: {
      budget: "standard",
      file: CANVAS_SPEC,
      testName: TEST_INFINITY_CONTINUITY,
    },
    componentType: "canvas",
    evidence: "viewport-side-effect",
    expectedObservable:
      "Toggling Infinity canvas preserves simulator world coordinates, view state, and dormant finite dimensions across pan, reload, and undo/redo.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "canvas.infinity.continuity",
    infinityCanvasCoverage: "mode-continuity-and-restoration",
    kind: "runtime",
    target: "canvas.infinity",
    userAction: "Enable Infinity canvas, pan, reload, restore finite mode, and undo/redo.",
  },
  {
    automated: true,
    automatedTestName: "canvas.infinity image export matches scene bounds",
    browser: {
      budget: "extended-io",
      file: CANVAS_SPEC,
      testName: TEST_INFINITY_CANVAS,
    },
    componentType: "canvas",
    evidence: "exported-bytes",
    expectedObservable:
      "Export PNG while Infinity canvas is active exports the complete bounded simulator scene parity-matched with finite export.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "canvas.infinity.imageExport",
    infinityCanvasCoverage: "scene-bounds-image-export",
    kind: "runtime",
    target: "canvas.infinity",
    userAction: "Export PNG in finite and infinite canvas modes and compare decoded dimensions and pixels.",
  },
  {
    automated: true,
    automatedTestName: "canvas.infinity video export preserves finite dimensions and frames",
    browser: {
      budget: "extended-io",
      file: CANVAS_SPEC,
      testName: TEST_INFINITY_CANVAS,
    },
    componentType: "canvas",
    evidence: "exported-bytes",
    expectedObservable:
      "Export Video while Infinity canvas is active preserves saved finite artboard dimensions, duration, and encoded frames.",
    fixture: "default 1280x720 ScrollCraft Studio session",
    id: "canvas.infinity.videoExport",
    infinityCanvasCoverage: "scene-bounds-video-export",
    kind: "runtime",
    target: "canvas.infinity",
    userAction: "Export Video in finite and infinite canvas modes and compare frame parity.",
  },
  {
    automated: true,
    automatedTestName: "persisted ScrollCraft workspace restores across browser reload",
    browser: {
      budget: "extended-io",
      file: "e2e/app-persistence.spec.ts",
      testName:
        "browser: app restores exact canvas, values, and panel workspace slices after reload",
    },
    componentType: "persistence",
    evidence: "persistence-state",
    expectedObservable:
      "Canvas size, zoom, runtime values, timeline state, and panel workspace offsets restore after a real browser reload.",
    fixture: "persisted ScrollCraft Studio workspace",
    id: "persistence.reload",
    kind: "runtime",
    persistenceCoverage: "reload",
    persistenceSlices: resolvedPersistenceSlices,
    target: "canvas.size.width",
    userAction: "Edit Canvas width and zoom, move and collapse Controls, wait for persistence, and reload.",
  },
];
