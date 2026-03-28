# Progress

## What works

- Core Excalidraw value is implemented and production-proven:
  - infinite hand-drawn style canvas;
  - rich editing toolkit (shapes, arrows, free-draw, zoom/pan, undo/redo);
  - export formats (PNG, SVG, clipboard, `.excalidraw` JSON).
- The dual product model is operational:
  - hosted app experience (`excalidraw.com`);
  - embeddable React package (`@excalidraw/excalidraw`) for external integrations.
- App-level capabilities are functional:
  - local-first autosave and recovery;
  - real-time collaboration flow;
  - end-to-end encrypted collaboration/share link mechanisms.
- Recent release trajectory confirms mature feature delivery (command palette, multiplayer undo/redo, flowcharts, scene search, image cropping, element linking).

## What's left to build

- Continue reducing editor UX edge cases visible in active PR stream:
  - text/WYSIWYG behavior near viewport and focus boundaries;
  - frame/grouping and selection consistency;
  - geometry/rendering corner cases.
- Improve release hardening around high-churn areas:
  - broader regression coverage for editor interactions;
  - stronger validation for collab/history behavior.
- Keep ecosystem migration smooth for integrators:
  - clear guidance for ESM-first setup and module resolution expectations;
  - continued updates for compatibility docs and examples.
- Incremental product polish:
  - accessibility and RTL improvements;
  - mobile/small-viewport robustness;
  - continued UI consistency refinements.

## Current status

- Project status: **active but slow moving** (only one big release per year for the last 3 years).
- Upstream baseline: latest referenced release is `v0.18.0` (2025-03-11).
- Repository direction is coherent:
  - ESM-centered package distribution;
  - explicit scene update capture semantics (`captureUpdate`);
  - ongoing editor quality improvements through many parallel PRs.
- Documentation status in this workspace:
  - Memory Bank core files exist (`projectbrief`, `techContext`, `systemPatterns`, `productContext`, `activeContext`);
  - this file (`progress.md`) extends that set with delivery-oriented tracking.

## Known issues

- Integrator friction risk after ESM transition:
  - environments with outdated module resolution or strict bundler defaults may need config changes.
- Regression risk concentration in:
  - text/WYSIWYG workflows;
  - frame/selection/grouping logic;
  - viewport and mobile-specific interactions.
- Operational complexity:
  - correctness depends on interaction among local-first persistence, collaboration sync, and history capture.
- High PR volume can increase merge coordination overhead and make release validation more demanding.

## Evolution of project decisions

- **From simple editor to platform**:
  - evolved from a drawing tool into a combined app + embeddable engine ecosystem.
- **From monolithic delivery to layered architecture**:
  - clear split between reusable editor core (`packages/excalidraw`) and app orchestration (`excalidraw-app`).
- **From implicit to explicit state semantics**:
  - move from `commitToHistory` toward `captureUpdate` reflects stricter, more scalable history/collab control.
- **From legacy packaging to modern distribution**:
  - strategic move to ESM-first packaging improves long-term ecosystem alignment and tree-shaking.
- **From feature breadth to quality depth**:
  - current PR trend indicates emphasis on UX correctness, edge-case fixes, and stability refinement.

