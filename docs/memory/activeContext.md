# Active context — current focus

## Repository role

- This tree is an **Excalidraw monorepo fork** used for **Agentic IDE workshop (Day 1)** assignments: documentation, Cursor configuration, and Memory Bank files alongside the real codebase.

## What matters right now

- **Documentation accuracy**: Memory Bank and workshop docs should reflect **this** repo’s manifests (`package.json`, `packages/*` layout) and real commands (`yarn` at root).
- **Minimal code churn**: prefer additive docs under `docs/` over behavioral changes unless the task explicitly requires code edits.

## Engineering hotspots (for contributors)

- **`excalidraw-app/`**: Vite entry, production build, app shell wiring.
- **`packages/excalidraw/`**: editor UI, `ActionManager`, renderers, WYSIWYG text.
- **`packages/element/`**, **`packages/common/`**, **`packages/math/`**: scene model, shared utilities, geometry.

## Intentionally out of scope for “active context”

- Upstream roadmap dates or release promises.
- Vendor-specific deployment secrets (Firebase, Sentry, etc.)—treat as environment-specific.

## How to update this file

- Replace “What matters right now” when the workshop step or team priority shifts.
- Keep entries short; link to `progress.md` for dated milestones and `decisionLog.md` for irreversible choices.
