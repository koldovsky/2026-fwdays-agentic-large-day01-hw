# AGENTS.md

## Purpose

Project-level guidance for Codex and similar coding agents working in this repository.

## Source Of Truth

- Prefer source code over docs when they disagree.
- Treat `packages/` and `excalidraw-app/` as the primary source of truth for behavior and architecture.
- Use `package.json`, `tsconfig.json`, `vitest.config.mts`, and actual scripts/config files as authoritative for tooling and workflows.
- Use `docs/technical/` and `docs/product/` as helpful secondary context, but verify important claims against code.

## Read First

- For app-level behavior, start in `excalidraw-app/App.tsx` and `excalidraw-app/`.
- For editor/runtime behavior, start in `packages/excalidraw/`.
- For scene and element model logic, start in `packages/element/`.
- For shared constants and helpers, use `packages/common/`.

## Avoid By Default

Do not read these paths unless the task directly requires them:

- `node_modules/`
- `packages/excalidraw/fonts/`
- `packages/excalidraw/locales/`
- `packages/excalidraw/tests/fixtures/`
- `**/__snapshots__/`
- `scripts/wasm/`
- `packages/excalidraw/subset/woff2/woff2-wasm.ts`
- `packages/excalidraw/subset/harfbuzz/harfbuzz-wasm.ts`
- `repomix-output.xml`
- `.claude/`
- build outputs such as `build/`, `dist/`, `dev-dist/`, `coverage/`, `html/`

## Docs Guidance

- Do not treat `memory-bank/` as canonical product or implementation truth without code verification.
- Do not rely on generated or derived documentation when the implementation is easy to inspect directly.
- When updating docs, keep them aligned with current code paths and type names.
- Prefer concise docs that reference concrete files over high-level summaries detached from code.

## Search Hygiene

- Use targeted search in relevant packages before broad repo-wide search.
- Prefer `rg` on specific directories such as `packages/excalidraw`, `packages/element`, or `excalidraw-app`.
- Avoid scanning large generated, binary, or localization-heavy directories unless explicitly needed.

## Editing Guidance

- Preserve the monorepo package boundaries.
- Keep changes minimal and local to the layer that owns the behavior.
- Do not edit generated assets, locale bundles, snapshots, or lockfiles unless the task explicitly requires it.
- When docs mention architecture or domain concepts, verify names and usage in code before editing.

## Testing Guidance

- Run the smallest relevant test scope first.
- Prefer package-local tests over full-suite runs unless the change spans multiple layers.

## If Unsure

- Ask whether docs or code should be treated as the target artifact.
- Default to inspecting implementation rather than expanding context with broad documentation reads.
