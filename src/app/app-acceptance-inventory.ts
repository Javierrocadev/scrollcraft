import type {
  ToolcraftControlSectionInventoryEntry,
  ToolcraftProductReadiness,
  ToolcraftTransferMode,
} from "./acceptance/types";

export const appTransferMode: ToolcraftTransferMode = {
  animationIntent: {
    loopDuration: {
      evidence:
        "ScrollCraft Studio uses a 4-second periodic forward scroll simulation cycle y(t) = (1 - cos(2*pi*t)) / 2 so scroll progress smoothly loops 0 -> 1 -> 0 across runtime durationSeconds.",
      seconds: 4,
      source: "product-derived",
    },
    mode: "timeline-playback",
  },
  mode: "new-toolcraft-app",
  referenceInputs: [],
};

export const appProductReadiness: ToolcraftProductReadiness = {
  exportIntent: {
    image: { mode: "toolcraft-default" },
    svg: { mode: "not-requested" },
    video: {
      evidence: {
        messageRef: "step-0:user-input",
        messageText:
          "Exportación: Copia directa al portapapeles del snippet CSS puro (@keyframes + animation-timeline + animation-range), captura de póster PNG en alta resolución y renderizado de video en bucle (MP4/WebM) simulando el scroll continuo.",
        quote:
          "captura de póster PNG en alta resolución y renderizado de video en bucle (MP4/WebM) simulando el scroll continuo.",
        source: "user-message",
      },
      mode: "user-requested",
    },
  },
  interactionOwnership: [
    {
      alternative: {
        reason:
          "Canvas drags cannot enumerate named animation recipes cleanly without obscuring the viewport mockup.",
        surface: "canvas",
      },
      capability: "command",
      evidence: {
        detail:
          "Curated preset selection triggers one-click multi-target updates via panel actions in ScrollCraft Studio.",
        source: "user-request",
      },
      id: "presets.panel-select",
      reason:
        "Labeled preset action buttons in the Curated Presets panel let developers switch complete recipes immediately.",
      surface: "panel",
      target: "presets.quickSelect",
    },
    {
      alternative: {
        reason:
          "Clipboard actions and syntax inspection require selectable monospace text inside a read-only panel inspector rather than canvas hits.",
        surface: "canvas",
      },
      capability: "command",
      evidence: {
        detail:
          "The CSS Output section provides live Baseline 2026 CSS preview and a dedicated Copy CSS button.",
        source: "user-request",
      },
      id: "css.panel-copy",
      reason:
        "A dedicated Copy CSS action button alongside the read-only inspector keeps code inspection and clipboard copy unambiguous.",
      surface: "panel",
      target: "css.copyAction",
    },
  ],
  mode: "product",
  productName: "ScrollCraft Studio",
  productSummary:
    "Interactive CSS Scroll-Driven Animations laboratory for calibrating view()/scroll() timelines, geometric ranges, and exporting Baseline 2026 CSS, PNG posters, and looping MP4/WebM videos.",
  requestedBehavior:
    "Simulate CSS scroll-driven animations in a real-time 60fps Canvas 2D viewport with geometric range HUD guides, live Baseline 2026 CSS output with clipboard copy, curated presets, PNG poster export, and looping MP4/WebM video export.",
  viewInteraction: {
    mode: "non-spatial",
    reason:
      "ScrollCraft Studio renders a 2D viewport mockup and geometric range overlay with CSS 3D card perspective simulated deterministically in 2D without an interactive 3D camera.",
  },
};

export const appControlSectionInventory: readonly ToolcraftControlSectionInventoryEntry[] =
  [
    {
      entity: "Curated Presets",
      entityId: "presets",
      finiteSelectors: [],
      groupingReason:
        "Curated preset action buttons apply synchronized timeline, range, and effect defaults.",
      id: "presets",
      targets: ["presets.quickSelect"],
      title: "Curated Presets",
    },
    {
      entity: "Timeline Range",
      entityId: "timeline-range",
      finiteSelectors: [
        {
          affectedTargets: [],
          reason:
            "Switches between element intersection view() mode, which exposes range boundary names, and document scroll() mode.",
          role: "branch",
          target: "timeline.type",
        },
        {
          reason:
            "Selects block (vertical) or inline (horizontal) scroll simulation axis and CSS axis keyword.",
          role: "parameter",
          target: "timeline.axis",
        },
        {
          reason:
            "Selects the W3C view-timeline named range boundary where animation progress reaches 0%.",
          role: "parameter",
          target: "timeline.rangeStart.name",
        },
        {
          reason:
            "Selects the W3C view-timeline named range boundary where animation progress reaches 100%.",
          role: "parameter",
          target: "timeline.rangeEnd.name",
        },
      ],
      groupingReason:
        "Groups timeline source, scroll axis, named view boundaries, and percentage offsets that define the W3C animation-range mapping.",
      id: "timeline-range",
      targets: [
        "timeline.type",
        "timeline.axis",
        "timeline.rangeStart.name",
        "timeline.rangeEnd.name",
        "timeline.rangeStart.offset",
        "timeline.rangeEnd.offset",
      ],
      title: "Timeline Range",
    },
    {
      entity: "Scroll Effect",
      entityId: "scroll-effect",
      finiteSelectors: [
        {
          reason:
            "Selects the animated CSS subject recipe (3D card reveal, header shrink, progress tracker, parallax, or blur reveal).",
          role: "parameter",
          target: "effect.preset",
        },
        {
          reason:
            "Selects the easing curve evaluated for animation progress and CSS animation-timing-function.",
          role: "parameter",
          target: "effect.easing",
        },
      ],
      groupingReason:
        "Groups the keyframe transformation preset, timing function, and effect intensity amplitude.",
      id: "scroll-effect",
      targets: ["effect.preset", "effect.easing", "effect.intensity"],
      title: "Scroll Effect",
    },
    {
      entity: "Viewport Simulator",
      entityId: "viewport-simulator",
      finiteSelectors: [
        {
          reason:
            "Switches the simulator container chrome between Browser window, Mobile device, and Minimal viewport.",
          role: "parameter",
          target: "preview.deviceMockup",
        },
        {
          affectedTargets: [],
          reason:
            "Toggles live geometric range boundary guides and enables the conditional Export HUD option.",
          role: "branch",
          target: "preview.showHud",
        },
        {
          reason:
            "Controls whether geometric range guides are kept visible inside exported PNG and video artifacts.",
          role: "parameter",
          target: "preview.exportHud",
        },
      ],
      groupingReason:
        "Groups simulator viewport chrome framing and geometric range HUD visibility switches.",
      id: "viewport-simulator",
      targets: ["preview.deviceMockup", "preview.showHud", "preview.exportHud"],
      title: "Viewport Simulator",
    },
    {
      entity: "CSS Output",
      entityId: "css-output",
      finiteSelectors: [
        {
          reason:
            "Switches generated CSS between shorthand animation-range and split animation-range-start/end declarations.",
          role: "parameter",
          target: "css.rangeSyntax",
        },
        {
          reason:
            "Wraps generated scroll-driven rules in @supports (animation-timeline: view()) progressive enhancement guards.",
          role: "parameter",
          target: "css.includeSupports",
        },
      ],
      groupingReason:
        "Groups CSS syntax formatting toggles, the live read-only Baseline 2026 CSS inspector, and the clipboard copy action.",
      id: "css-output",
      targets: [
        "css.rangeSyntax",
        "css.includeSupports",
        "css.inspector",
        "css.copyAction",
      ],
      title: "CSS Output",
    },
    {
      entity: "Settings",
      entityId: "runtime-setup",
      finiteSelectors: [
        {
          reason:
            "Toggles canvas background visibility in live preview and raster image exports.",
          role: "parameter",
          target: "export.includeBackground",
        },
      ],
      groupingReason:
        "Groups canvas background visibility and backdrop color controls within Settings.",
      id: "runtime.setup",
      targets: ["export.includeBackground", "appearance.background"],
      title: "Settings",
    },
    {
      entity: "Image Export",
      entityId: "runtime-image-export",
      finiteSelectors: [
        {
          reason:
            "Selects raster output format (PNG or JPG) for exported frames.",
          role: "parameter",
          target: "export.image.format",
        },
        {
          reason:
            "Selects raster output resolution tier (2K, 4K, or 8K) for exported frames.",
          role: "parameter",
          target: "export.image.resolution",
        },
      ],
      groupingReason:
        "Groups raster image export format and output resolution controls.",
      id: "runtime.image-export",
      targets: ["export.image.format", "export.image.resolution"],
      title: "Image Export",
    },
    {
      entity: "Video Export",
      entityId: "runtime-video-export",
      finiteSelectors: [
        {
          reason:
            "Selects looping video container format (MP4 or WebM) for timeline export.",
          role: "parameter",
          target: "export.video.format",
        },
        {
          reason:
            "Selects video frame output resolution preset (Current or 4K) for timeline export.",
          role: "parameter",
          target: "export.video.resolution",
        },
      ],
      groupingReason:
        "Groups looping video container format and output resolution controls.",
      id: "runtime.video-export",
      targets: ["export.video.format", "export.video.resolution"],
      title: "Video Export",
    },
  ];
