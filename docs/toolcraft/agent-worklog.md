# Toolcraft App Agent Worklog

## Status

Mode: product

## Decision Trail

### Change - Parallax landscape bottom coverage

- Change ID: parallax-bottom-coverage-2026-11-13
- Active change: parallax-bottom-coverage-2026-11-13
- Request: "arregla el paralaxx image depth ,cuando la imagen sube en su contenedor se ve un huecho debajo de la imagen"
- Task type: Later localized visual bug fix; focused checks only.
- Owner: `src/app/scroll-renderer-subjects.ts`, private `drawParallaxSubject` branch.
- Decision: Preserve ridge vertices, parallax motion, scale and palette; extend both mountain slopes collinearly past the inverse-transformed lower clipping edge (`groundBottom`) to eliminate any bottom gap or vertical transparency seam. Existing constant-cost Canvas 2D pipeline, inputs, workload limits and export path remain unchanged.
- Docs/contracts read: workflow, decision-contract, core/runtime-boundary, core/performance, component-rules, renderer-technique, acceptance-testing, performance.
- Verification: `vitest run src/app/scroll-parallax.test.ts src/app/scroll-model.test.ts src/app/scroll-visuals.test.ts` (17/17 passed), `vitest run src/app/scrollcraft-acceptance.test.ts` (10/10 passed), `vite build` (passed), `playwright test e2e/acceptance-effect.spec.ts` under `TOOLCRAFT_BROWSER_SERVER_MODE=preview` (2/2 passed including lower-edge pixel checks on `effect.preset`), `check-toolcraft-docs.mjs` and `check-toolcraft-integrity.mjs` (passed). Note: `npm run test:feature -- effect.preset` failed in `scripts/toolcraft-journal-runs.mjs` with Windows `EPERM` on directory `rename` while `events.jsonl` is open.
- Risks: None; isolated parallax geometry, no shared transform or runtime changes. No measured performance or aggregate delivery run is required.

### Visual refinement - graphite and warm neutrals

- Change ID: scrollcraft-visual-refinement-2026-11-13
- Active change: scrollcraft-visual-refinement-2026-11-13
- Request: "mejora la ui , los colores son muy feos."
- Task type: Focused later visual edit; no new product capabilities or performance iteration.
- Decision: Replace competing neon colors with graphite surfaces, a warm ivory reveal card, sage highlights and muted terracotta end guides. Preserve all geometry, timing, schema values, user background choices and export mechanics.
- Owners: src/app/scroll-renderer.tsx, src/app/scroll-renderer-subjects.ts, src/app/css-inspector-control.module.css.
- Visual map: Existing read-only inspector remains a product composition, not an editable code control. Public code/text controls were checked via the public UI barrel; this change retains the live computed read-only inspector and adds no interactive chrome. Code backing uses custom-viz-surface/border with foreground text; metadata uses muted-foreground; badges use neutral custom-viz-fill-dim with foreground text. No accent or primary tokens. All public controls and runtime shell remain untouched.
- Verification selected: Palette/contrast renderer unit tests, existing model/renderer acceptance tests, focused preview.deviceMockup, preview.showHud, effect.preset and css.inspector browser acceptance. Additional targeted visual browser check for theme readability and actual pixels. No aggregate delivery or performance rerun.
- RED: Two new palette/contrast assertions fail against the original renderer; five preset determinism/HUD-isolation checks pass.
- Risks: Existing Windows first-delivery failures remain outside this visual change. Engram rejected the resolved scrollcraft project as unknown; memory persistence unavailable. This folder is not a Git repository, so no commit or Git-based review is available.

### Delivery 1 - ScrollCraft Studio initial product delivery

- Request: Build ScrollCraft Studio, an interactive CSS Scroll-Driven Animations laboratory supporting view()/scroll() timelines, animation-range calibration, curated presets, live Baseline 2026 CSS generation, PNG poster export, and looping MP4/WebM video export.
- Task type: W3C scroll-range math engine, CSS generator, Canvas 2D simulator renderer, Toolcraft schema, custom CSS inspector control, acceptance matrix, E2E specs, and 16:9 product cover.
- User-visible result: Users calibrate CSS scroll-driven animations in real time inside a Browser/Mobile/Minimal viewport simulator with optional geometric range HUD guides, inspect and copy Baseline 2026 CSS, and export high-resolution PNG/JPG posters or seamless looping MP4/WebM videos.
- Source/reference checked: User prompt specification (Phases 0-5), Toolcraft runtime schema/renderer/export contracts, and W3C CSS Scroll-Driven Animations Level 1 boundary definitions.
- Reference inputs: None.
- Docs/contracts read: docs/toolcraft/workflow.md, docs/toolcraft/acceptance-testing.md, docs/toolcraft/core/control-selection.md, docs/toolcraft/core/app-cover.md, and docs/toolcraft/performance.md.
- Contract rules applied: runtime-shell-required, controls-section-inventory-required, controls-product-coverage, output-export-required, timeline-enabled-behavior, acceptance-product-observable, and infinity-canvas-scene-bounds.
- View interaction intent: non-spatial; the simulator draws 2D viewport frames and analytical CSS 3D card perspective without a 3D orbital camera.
- Interaction ownership: Panel actions own curated preset switching (presets.quickSelect) and clipboard CSS copying (css.copyAction); non-Space canvas pointer drags scrub timeline currentTime directly without duplicating panel buttons.
- Decision: Implement a pure deterministic W3C math engine in src/app/scroll-model.ts paired with a Canvas 2D renderer in src/app/scroll-renderer.tsx and Baseline 2026 CSS synthesizer in src/app/css-generator.ts.
- Alternatives rejected: DOM-only CSS scroll simulation because offline deterministic PNG/MP4 frame export requires pixel-identical Canvas 2D rendering, and generic built-in text/code controls for CSS output because live Baseline 2026 compatibility badges and synced copy status require a minimal read-only custom inspector.
- State/output mapping: Toolcraft schema values feed readScrollCraftConfigFromValues into both renderScrollCraftScene (live preview + raster/video exporter) and generateScrollDrivenCss (live CSS Output inspector and clipboard action); runtime timeline.currentTimeSeconds drives the cyclic scroll curve y(t) = (1 - cos(2*pi*t)) / 2.
- Performance intent: ordinary-product-work
- Verification: Covered by the product delivery verification plan and protected receipt.
- Risks: CSS backdrop-filter blur and perspective foreshortening are approximated analytically in Canvas 2D rather than browser DOM compositing; large high-DPR canvas blurs can increase software raster cost.

## Decisions

### Renderer

- Decision: Use Canvas 2D via src/app/scroll-renderer.tsx and src/app/scroll-scene.tsx wired into composeToolcraftApp.
- Reason: Unified Canvas 2D drawing guarantees pixel-identical live 60fps simulation, geometric HUD guides, PNG poster exports, and MP4/WebM video loop frames.
- Evidence: src/app/scroll-renderer.tsx, src/app/scroll-scene.tsx, and src/app/app-performance.ts.

### View Interaction

- Decision: Use non-spatial view interaction without an orientation gizmo.
- Reason: ScrollCraft Studio renders 2D viewport mockups and analytical 2D projections rather than a free-orbiting 3D scene.
- Evidence: appProductReadiness.viewInteraction in src/app/app-acceptance-data.ts.

### Interaction Ownership

- Decision: Keep curated preset commands and CSS copy actions on panel controls while canvas pointer dragging scrubs scroll progress.
- Reason: Avoids mirroring one operation across canvas and panel surfaces.
- Evidence: appProductReadiness.interactionOwnership in src/app/app-acceptance-data.ts.

### Timeline

- Decision: Enable timelineModule in playback mode with a 4-second periodic forward loop.
- Reason: Continuous scroll simulation and looping MP4/WebM export require runtime state.timeline.durationSeconds and cyclic t in [0, 1] evaluation.
- Evidence: src/app/app-schema.ts and src/app/scroll-model.ts.

### Layers

- Decision: Do not enable panels.layers.
- Reason: ScrollCraft Studio calibrates a single simulated scroll subject and timeline per composition.
- Evidence: appSchema.panels.layers is omitted in src/app/app-schema.ts.

### Controls

- Decision: Organize product controls into Curated Presets, Timeline Range, Scroll Effect, Viewport Simulator, and CSS Output sections, plus one minimal read-only css-inspector control backed by builtInFitCheck.
- Reason: Each section maps directly to one domain workflow stage and matches appControlSectionInventory.
- Evidence: src/app/app-schema.ts, src/app/css-inspector-control.tsx, and src/app/app-acceptance-data.ts.

### Export

- Decision: Expose Export PNG (imageExportModule) and Export Video (videoExportModule) with Background inclusion and HUD export controls.
- Reason: The specification requests high-resolution PNG poster capture and continuous looping MP4/WebM video export alongside clipboard CSS.
- Evidence: src/app/app-schema.ts and scrollCraftRasterExporter in src/app/scroll-scene.tsx.

### Performance

- Decision: Register scrollcraft-canvas2d-v1 pipeline passes (simulate-scroll, composite-simulator, export-frame) with intrinsic viewport bounds and image-export-resolution envelope.
- Reason: Bounds viewport passes cleanly and binds 2K/4K/8K export resolution scaling to the performance path matrix.
- Evidence: src/app/app-performance.ts.

## Evidence

- Source reviewed: src/app/scroll-model.ts, src/app/css-generator.ts, src/app/presets.ts, src/app/scroll-renderer.tsx, src/app/scroll-scene.tsx, src/app/app-schema.ts, src/app/app-acceptance-data.ts, and src/app/app-performance.ts.
- Contract applied: Toolcraft schema, acceptance coverage, control-section inventory, custom control built-in fit check, and export/timeline runtime contracts.

## Verification

Protected receipts own commands, selectors, measurements, and pass/fail evidence.

## Risks

- Risk: Browser DOM CSS rendering of complex 3D perspective transforms or filters may differ slightly from Canvas 2D analytical projection in edge cases.

### Product Cover

- Capture path: `public/toolcraft/cover.png` (2048x1152, 16:9 PNG, 467,867 bytes) registered in `app-cover.json`.
- Settings: `app-cover-state.json` (`card-3d` preset, `view(block)`, `entry 0%` to `cover 40%`, `ease-out`, intensity `85`, Browser mockup, `preview.exportHud: true`, `export.image.resolution: 2k`, paused at `0.78s` of `4.0s` loop).
- Verification: Visually inspected `public/toolcraft/cover.png` confirming clean 16:9 framing, legible 3D card and range HUD guides, and zero editor UI or baked-in title.

