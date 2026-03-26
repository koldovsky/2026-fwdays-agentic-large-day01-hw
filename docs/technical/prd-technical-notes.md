# PRD — Technical Considerations

> Extracted from `docs/product/PRD.md`. See that file for goals, requirements, and open questions.

## Known constraints

- **Rendering architecture**: The five-canvas layer model (StaticCanvas, InteractiveCanvas, NewElementCanvas, SVG layer, React DOM) is fixed. New visual features must map to one of these layers. See `docs/memory/systemPatterns.md`.
- **State management**: Element state is mutable and lives outside React. New features that mutate elements must use `mutateElement()` or `scene.mutateElement()` — not `setState`. See `docs/memory/systemPatterns.md` — Element Mutation Pattern.
- **Jotai isolation**: All Jotai atoms must go through `editor-jotai` or `app-jotai`, never direct `jotai` imports. ESLint enforces this. Violations break multi-instance isolation.
- **File format**: `.excalidraw` JSON is a public contract. Any schema change requires backwards-compatible migration code and version bumping.
- **Collaboration backend**: The web app's collaboration server is not part of this repository. The library exposes sync hooks; consumers wire their own backend. Socket.io client (`4.7.2`) is the current transport in `excalidraw-app`.
- **PWA**: Service worker registration and caching strategy must be maintained for offline P0 requirement.

## Open technical questions

- **Q-1**: What is the minimum supported browser version? — Owner: Engineering Lead — Needed by: before any browser-compatibility work begins — Resolution path: check `excalidraw-app/vite.config.ts` `build.target` field.
- **Q-2**: What is the maximum acceptable `@excalidraw/excalidraw` gzipped bundle size? — Owner: Engineering Lead — Needed by: before publishing 1.0. — Status: No documented threshold; must be established as a guardrail metric.
- **Q-3**: Does the collaboration server support end-to-end encryption for scene data? — Owner: Infrastructure — Needed by: before any enterprise or privacy-sensitive deployment guidance.

## Dependencies

| Dependency | Status | Risk if late |
|------------|--------|--------------|
| RoughJS (hand-drawn rendering) | Done — vendored | Low |
| Socket.io client (collaboration) | Done — `4.7.2` in package.json | Low |
| fractional-indexing (z-order) | Done — integrated | Low |
| jotai + jotai-scope (state isolation) | Done — integrated | Low |
| Collaboration server (excalidraw-app only) | External — not in this repo | Medium — collaboration P1 blocked if unavailable |
