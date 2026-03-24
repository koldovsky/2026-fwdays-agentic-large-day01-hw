# Active Context

## Current Branch

`opopkov/fw-day-1` — branched from `master`

## Recent Changes

- Added `.coderabbit.yaml` configuration
- Updated `.github/PULL_REQUEST_TEMPLATE.md`
- Added `CLAUDE.md` with project conventions and commands
- Created Memory Bank documentation in `docs/`
- Added `docs/technical/architecture.md`, `docs/product/domain-glossary.md`, `docs/product/PRD.md`

## Current State

The project is in documentation/onboarding phase. No functional code changes have been made to the Excalidraw codebase itself. The focus is on:

1. Setting up AI-assisted development tooling (CLAUDE.md, Memory Bank)
2. Documenting the existing architecture for future contributors
3. Validating documentation accuracy against the actual codebase

## Known Documentation Issues

From the Memory Bank validation (2026-03-24):

| Issue | File(s) | Fix Needed |
|-------|---------|------------|
| `@excalidraw/utils` does NOT depend on `@excalidraw/excalidraw` | architecture.md | Remove the Utils → Excalidraw dependency arrow |
| File is `store.ts` (lowercase), not `Store.ts` | systemPatterns.md, architecture.md | Fix casing |
| File is `linearElementEditor.ts`, not `linearElement.ts` | domain-glossary.md | Fix path |
| AppState has ~113 fields, not ~130 | systemPatterns.md, architecture.md | Update count |
| Action impl files are ~36, not 45+ | systemPatterns.md | Clarify count |

## What's Next

- Fix the documentation issues identified above
- Begin actual feature development or bug fixes on this branch

## Related Docs

### Technical
- [Architecture](../technical/architecture.md) — system design, data flow, rendering pipeline
- [Dev Setup](../technical/dev-setup.md) — onboarding guide, from git clone to first PR

### Product
- [PRD](../product/PRD.md) — reverse-engineered product requirements
- [Domain Glossary](../product/domain-glossary.md) — core domain terms
