# Progress Log — Excalidraw Monorepo

> **Format:** Append-only, time-ordered journal of key milestones, decisions, and outcomes.
> **Purpose:** Long-term memory retention for iterative development, AI agents, and evolving systems.
> **Convention:** Newest entries go at the **bottom**. Do not edit past entries — append only.

---

## [2026-03-23] - Repository Initialized

### Context

A fresh fork/clone of the upstream Excalidraw open-source codebase was established as the starting point for an agentic brownfield development workflow. The goal was to stand up the project locally and confirm the baseline is sound before layering new documentation and tooling.

### Action

- Cloned the repository and ran the initial commit (`a3453993`) to establish the baseline.
- Confirmed monorepo structure: `packages/` (5 packages) + `excalidraw-app/` + `examples/`.
- Verified Node ≥18 requirement and Yarn 1.22.22 as the package manager.

### Outcome

Repository initialized and accessible. Baseline source code reflects Excalidraw v0.18.0 (packages) and v1.0.0 (app). No local customizations yet.

### Decision / Reasoning

Chose to fork the upstream Excalidraw repo rather than building from scratch because it provides a mature, production-grade canvas engine (Rough.js, perfect-freehand, collaborative via Socket.io + Firebase) as the foundation. Building from scratch would duplicate significant prior art.

### Lessons Learned

- The monorepo uses Yarn Workspaces and requires careful attention to package boundary imports (ESLint enforces no direct `jotai` imports outside of `app-jotai`/`editor-jotai` wrappers).
- `yarn clean-install` is the safe reset command when dependency state is uncertain.

### Tags

`#setup` `#monorepo` `#baseline`

---

## [2026-03-24] - Baseline Verification & Cursor Ignore Setup

### Context

After the initial commit, the next step was to verify the developer environment configuration was correct and filter out noise from AI-assisted tooling (Cursor IDE).

### Action

- Added `.cursorignore` (`9e07c0c`) to exclude `node_modules/`, `dist/`, `build/`, generated scopes, and other non-essential paths from Cursor's context window.
- Ran additional baseline checks (`da795d2` — check-instructions) to validate configuration correctness.
- Applied minor updates (`4451b1e`) to align local state with environment expectations.

### Outcome

Development environment confirmed stable. Cursor IDE configured to focus on relevant source files only, reducing token noise in AI-assisted workflows.

### Decision / Reasoning

`.cursorignore` was added proactively to prevent AI tooling from indexing `node_modules/` (100k+ files) or generated artifacts. This keeps AI context windows meaningful and reduces latency. Standard practice for large monorepos using Cursor.

### Lessons Learned

- Setting up AI tooling boundaries early (before documentation or code changes) prevents context pollution downstream.
- Vite build output (`dist/`) and Repomix scope snapshots (`docs/scopes/`) should always be excluded from AI context.

### Tags

`#tooling` `#dx` `#ai-agent-setup`

---

## [2026-03-28] - Memory Bank Documentation Sprint

### Context

Before beginning any code changes or feature development, a complete documentation memory bank was established to capture the system's current state, architectural decisions, and operational context. This sprint was triggered by the need to support long-running agentic workflows that require persistent, structured memory across sessions.

The project follows a **memory bank pattern**: a set of living markdown files in `docs/memory/` that an AI agent (or developer) reads at the start of each session to restore full context.

### Action

Created the following documentation files across two sessions on 2026-03-28:

| Commit | File | Purpose |
|--------|------|---------|
| `4fbabae` | `docs/memory/projectbrief.md` | Project objectives, scope, success criteria, constraints |
| `84461bd` | `docs/memory/productContext.md` | Vision, user personas, core workflows, integration points |
| `f71e035` | `docs/memory/systemPatterns.md` | Architectural patterns, core design principles, component topology |
| `8ccc02f` | `docs/memory/techContext.md` | Full technology stack, dev practices, build/test pipeline |
| `ea43a6a` | `docs/technical/architecture.md` | Detailed system design, data flow, deployment targets |
| `81e623c` | `docs/product/domain-glossary.md` | Canonical Excalidraw terminology for consistent communication |
| `abab951` | `docs/technical/dev-setup.md` | Developer onboarding, env vars, local run instructions |
| `2fa57fd` | `docs/product/PRD.md` | Product requirements, features, user roles |
| `f04185a` | `docs/memory/decisionLog.md` | Technical debt, undocumented behaviors, FIXME/HACK catalog (598 lines) |
| `8a1f1d9` | `docs/memory/activeContext.md` | Living reference: current sprint state, recent changes, ongoing work |

**Total documentation produced:** ~2,100+ lines across 10 files.

### Outcome

- Full memory bank established. Any agent or developer joining the project can read `docs/memory/` to restore complete context within minutes.
- `decisionLog.md` captures 598 lines of implicit architectural knowledge, technical debt markers, and rationale for non-obvious code patterns found in the brownfield codebase.
- `activeContext.md` serves as the "current state" anchor updated at the start/end of each sprint.
- `docs/technical/` and `docs/product/` provide reference-grade documentation for architecture and product requirements.

### Decision / Reasoning

**Why document before coding?**
In a brownfield codebase with significant undocumented decisions (Excalidraw has ~5 years of organic growth), attempting changes without a documented understanding of system patterns leads to regressions. The memory bank approach front-loads understanding costs to amortize them across all future sessions.

**Why a separate `decisionLog.md` vs. inline comments?**
Inline code comments are lost when files are refactored. A centralized decision log persists independently of the code it describes, making it audit-friendly and searchable.

**Why `activeContext.md` as a living file rather than git history?**
Git history requires mental reconstruction across commits. `activeContext.md` provides an always-current snapshot — it is overwritten (not appended) at each sprint boundary, keeping it small and focused.

**Trade-off:** Documentation sprints carry the risk of drift if the docs are not updated when code changes. Mitigated by requiring `docs/memory/` updates as part of the definition-of-done for future PRs.

### Lessons Learned

- Brownfield codebases benefit enormously from a structured pass to externalize implicit knowledge before beginning active development. Surfacing undocumented behaviors in `decisionLog.md` revealed several non-obvious constraints (e.g., ESLint-enforced Jotai import wrappers, `noEmit: true` in tsconfig means TypeScript is for type checking only, not compilation).
- The memory bank pattern works best when each file has a clearly distinct scope. Overlap between `systemPatterns.md` and `techContext.md` required careful delineation (patterns = *how things work*; tech context = *what things are*).
- `docs/scopes/` (Repomix snapshots) provide a useful compressed view of the codebase for AI context windows but should never be treated as authoritative — they go stale quickly.

### Tags

`#documentation` `#memory-bank` `#architecture` `#decision-log` `#onboarding` `#agentic-workflow`

---

## [2026-03-28] - Progress Log Initialized (This File)

### Context

The memory bank documentation sprint (see entry above) established 10 core files. This file — `docs/memory/progress.md` — was identified as the missing piece: a chronological, append-only journal tracking *what happened* and *why*, as opposed to the snapshot-style files that capture *current state*.

### Action

- Created `docs/memory/progress.md` as an append-only progress journal.
- Backfilled entries from repository inception (2026-03-23) through the documentation sprint (2026-03-28) using git log and existing memory docs as source material.
- Established the entry format: Context → Action → Outcome → Decision/Reasoning → Lessons Learned → Tags.

### Outcome

Progress log initialized with 3 backfilled entries covering the full history to date. Future work will be appended chronologically at the bottom of this file.

### Decision / Reasoning

The append-only constraint is intentional. Editing past entries would undermine auditability — the log should reflect what was *believed to be true at the time*, including any errors or pivots. If an earlier decision turns out to be wrong, that is captured in a new entry (not by editing the old one).

Chose markdown over a structured database (JSON/YAML) for human readability and git-diff friendliness. Markdown entries are reviewable in any PR and require no tooling to read.

### Lessons Learned

- A progress log is most useful when entries are written *at the time of action*, not reconstructed afterward. Backfilled entries are lower fidelity by nature — start writing entries in real time going forward.
- The `### Tags` section enables lightweight filtering: search for `#bugfix` or `#architecture` across the file to find relevant entries quickly.

### Tags

`#documentation` `#memory-bank` `#meta` `#progress-log`

---

<!-- ============================================================ -->
<!-- APPEND NEW ENTRIES BELOW THIS LINE — DO NOT EDIT ABOVE      -->
<!-- Format: ## [YYYY-MM-DD] - [Short Title]                      -->
<!-- ============================================================ -->
