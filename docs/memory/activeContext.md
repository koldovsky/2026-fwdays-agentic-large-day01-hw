# Active Context

## Last updated

2026-03-30 — branch `day-1/brainboost721`, HEAD `06d3176`. Commit `06d3176` corrects `systemPatterns.md` layering: `packages/utils` no longer claims a dependency on `@excalidraw/common`; wording matches `packages/utils/package.json` (external utilities only).

## Current focus

- Building a **comprehensive documentation suite** for the Excalidraw monorepo, reverse-engineered entirely from source code.
- No application or library code has been modified — every commit since `b9f16d4` is documentation or tooling configuration.
- The Memory Bank (`docs/memory/`) is the central knowledge base; product docs and technical docs live alongside it in [`docs/product/`](../product/) and [`docs/technical/`](../technical/).
- **Cross-link polish:** `docs/memory/systemPatterns.md` includes `<a id="cicd-pipeline"></a>` before the CI/CD workflow table so `docs/memory/techContext.md` can use `./systemPatterns.md#cicd-pipeline` without depending on heading slug rules. `docs/memory/projectbrief.md` and `docs/memory/systemPatterns.md` link to architecture and glossary via relative markdown URLs.
- **Architecture prose polish:** `docs/technical/architecture.md` step list under `syncActionResult` now varies sentence openings while preserving references to `actionResult.appState`, `this.setState`, `editingTextElement`, `viewModeEnabled`, and `this.scene.triggerUpdate`.

## Recent changes (since `b9f16d4`)

Use `git show <hash>` in a clone of this repo to inspect messages and diffs (`day-1/brainboost721` history). Short hashes are enough for everyday use; Git resolves them unambiguously here.

| Commit | Date (author) | What changed |
| --- | --- | --- |
| `b9f16d4` | 2026-03-26 | `.cursorignore`, `.repomixignore`, `.gitignore` — tooling for repo packing |
| `785c979` | 2026-03-26 | `repomix-compressed.txt` (~110K lines) — compressed export used as source material |
| `02477fe` | 2026-03-29 | Initial Memory Bank: `docs/memory/projectbrief.md`, `docs/memory/systemPatterns.md`, `docs/memory/techContext.md`; `docs/product/domain-glossary.md`, `docs/technical/architecture.md` |
| `a7e3804` | 2026-03-29 | `docs/technical/agent-sharp-edges.md`; edits to `docs/memory/systemPatterns.md`, `docs/technical/architecture.md` |
| `7ed9b19` | 2026-03-29 | `docs/memory/productContext.md` |
| `21d1500` | 2026-03-29 | `docs/technical/dev-setup.md`, `docs/memory/activeContext.md` (skeleton) |
| `ea876ca` | 2026-03-29 | `docs/product/PRD.md` |
| `1a1b065` | 2026-03-29 | `docs/memory/decisionLog.md`; removed `docs/technical/agent-sharp-edges.md` (folded into decision log); cross-links |
| `39daee4` | 2026-03-29 | `docs/memory/activeContext.md`, `docs/memory/decisionLog.md`, `docs/memory/progress.md` |
| `649e956` | 2026-03-29 | `.cursor/rules/memory-bank.mdc` (always-apply rule); Memory Bank / product / technical doc polish |
| `34efb2b` | 2026-03-30 | Rule: no circular reads, anti-churn; service worker wording; `systemPatterns.md` links + `#cicd-pipeline`; `architecture.md` `syncActionResult`; `code-behavior-gaps.md`, `implicit-invariants.md` (B/C split); `decisionLog.md` index trim + cross-links |
| `06d3176` | 2026-03-30 | `systemPatterns.md`: fix `packages/utils` layering line (remove false `common` dep; list external deps per `packages/utils/package.json`) |

## Repository state

- Branch `day-1/brainboost721`. HEAD `06d3176`. Local branch may be **ahead/behind** `origin/day-1/brainboost721` — pull/rebase before assuming parity with remote.

## Decisions made during this documentation effort

- **Source-verified only:** Every assertion in Memory Bank files cites specific files/paths. Inferences are explicitly labeled.
- **`agent-sharp-edges.md` → `decisionLog.md` + technical splits:** The standalone doc was removed in `1a1b065` in favor of `docs/memory/decisionLog.md`. Section B/C full text lives in [`code-behavior-gaps.md`](../technical/code-behavior-gaps.md) and [`implicit-invariants.md`](../technical/implicit-invariants.md) (`34efb2b`); the Memory Bank keeps summaries and links.
- **Separate directories for different audiences:** `docs/memory/` (AI/contributor context), `docs/product/` (product requirements, domain terms), `docs/technical/` (architecture, dev setup).
- **Decision log location:** Canonical file is `docs/memory/decisionLog.md`. A root-level redirect existed in `1a1b065` but was removed in `649e956`.
- **Cursor rule for Memory Bank:** `.cursor/rules/memory-bank.mdc` (`alwaysApply: true`) — added in `649e956`, anti-churn and no-circular-reads clarification in `34efb2b`. Prescribes reading order, update protocol, and **anti-churn** meta-edits (`docs/memory/decisionLog.md` section 8).

## Blockers & risks

- **No code changes on this branch:** The application itself is untouched. All risk is limited to documentation accuracy.

## Next steps

1. When starting code work, replace **Current focus** with task-specific bullets and bump **Last updated** (and sync `progress.md` if scope changes).

## Open questions

- None.
