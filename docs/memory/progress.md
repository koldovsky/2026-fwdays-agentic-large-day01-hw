# Progress

## Done

- Mapped repository scope and purpose:
  - monorepo shape,
  - main package (`@excalidraw/excalidraw`),
  - app/examples relation.
- Verified technical baseline:
  - workspace package manager and scripts,
  - build/test/lint command surface,
  - stack versions from package manifests.
- Documented architecture patterns:
  - `App` orchestration,
  - scene/store/history model,
  - Jotai-based isolated UI atoms,
  - action manager pattern.
- Created memory bank files in `docs/memory/`.
- Added technical docs: `docs/technical/architecture.md`, `docs/technical/dev-setup.md` (English).

## In progress

- Consolidating durable project knowledge so future tasks can start faster.
- Validating generated-artifact ignore strategy in `.cursorignore`.

## Pending / next

- Review and refine memory docs with team-specific conventions.
- Add missing operational details:
  - release checklist,
  - CI expectations,
  - troubleshooting notes.
- Link `docs/memory/` and `docs/technical/` from a central docs index (if desired).

## Risks / gaps

- Root-level product README is not present; context is inferred from package/app sources.
- Working tree contains non-doc changes (`yarn.lock`, `.cursorignore`, `repomix-output.xml`) that should be intentionally managed before commit.

## Source verification

- Root `package.json` and workspace manifests.
- `packages/excalidraw/README.md` and `packages/excalidraw/components/App.tsx`.
- Current git state from `git status --short --branch`.

---

## Related documentation

**Technical** (`docs/technical/`)

- [Architecture](../technical/architecture.md)
- [Developer setup](../technical/dev-setup.md)

**Product** (`docs/product/`)

- [PRD](../product/PRD.md)
- [Domain glossary](../product/domain-glossary.md)
