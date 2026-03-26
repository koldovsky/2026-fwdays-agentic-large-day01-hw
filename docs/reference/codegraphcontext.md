# CodeGraphContext: Value and Current Status

## What It Gave Us
- Working code graph indexing for this repository.
- Reusable CLI workflow for codebase analysis (`cgc`).
- Faster architecture/code navigation tasks (callers/usages/dependency checks).
- Better support for AI/MCP-assisted repository exploration.

## What Is Already Done
- `codegraphcontext` installed (`CodeGraphContext 0.3.1`).
- `cgc` CLI is available.
- Repository indexed successfully via wrapper script.
- Local wrapper created: `scripts/cgc.ps1`.

## Why Wrapper Is Required Here
- Default profile path (`C:\Users\arabu\.codegraphcontext`) is not writable in this environment.
- Wrapper routes runtime state to local repo folder `.cgc_home`.

## Recommended Commands
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\cgc.ps1 --version
powershell -ExecutionPolicy Bypass -File .\scripts\cgc.ps1 doctor
powershell -ExecutionPolicy Bypass -File .\scripts\cgc.ps1 index .
powershell -ExecutionPolicy Bypass -File .\scripts\cgc.ps1 list
```

## Practical Use Cases for This Repo
- Find where specific editor internals are used (`AppState`, `ActionManager`, `StoreDelta`).
- Trace impact before refactoring files in `packages/excalidraw`.
- Validate assumptions for docs/ADR updates with graph-backed queries.

When graph queries **confirm or change** your mental model of dependencies, **update `docs/memory/techContext.md`** (and `docs/technical/architecture.md` if the high-level story changes) so written docs stay aligned with the index. See `docs/memory/activeContext.md` — Documentation maintenance policy.

## Known Constraints
- Some Python package version conflicts appeared during installation (`click`, `typing-inspection` vs other tools).
- This does not block CGC usage via `scripts/cgc.ps1`, but should be tracked as environment debt.
