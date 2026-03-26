# Active Context

## Documentation Map

One row per Markdown file under `docs/`. **Layer** groups how “hot” the doc is for sessions; **Path** is clickable from this file.

| Layer | Path | Purpose | When to @-load |
|--------|------|---------|----------------|
| **Memory Bank** | [docs/memory/activeContext.md](./activeContext.md) | Rolling session state: current focus, recent git/working-tree notes, immediate next steps. | Starting or resuming a session; need “what changed today” and open questions. |
| **Memory Bank** | [docs/memory/projectbrief.md](./projectbrief.md) | Short project charter: purpose, stack summary, success criteria, code entry points. | Onboarding or scoping work without loading the full PRD. |
| **Memory Bank** | [docs/memory/productContext.md](./productContext.md) | Product lens: personas, UX principles, journeys, shell workflows (collab, share, TTD). | UX, flows, or product behavior in the app shell—not formal requirements text. |
| **Memory Bank** | [docs/memory/techContext.md](./techContext.md) | Stack versions, monorepo layout, workflow summary, env/deployment pointers. | Tooling, dependencies, scripts, or constraints without full setup prose. |
| **Memory Bank** | [docs/memory/systemPatterns.md](./systemPatterns.md) | Code patterns: ActionManager, Jotai, tunnels, data flow, naming/file conventions. | Implementing features or refactors in editor/app code; need pattern names and boundaries. |
| **Memory Bank** | [docs/memory/decisionLog.md](./decisionLog.md) | Compact table of major architecture/toolchain decisions + pending items. | “Why is it X?” at a glance; need the one-screen summary. |
| **Memory Bank** | [docs/memory/progress.md](./progress.md) | Completion status, WIP checklist, roadmap hints, known-issue hotspots (short). | Sprint/status questions or where tech debt is called out briefly. |
| **Technical** | [docs/technical/architecture.md](../technical/architecture.md) | Full system architecture: App/Store/Scene/History/Renderer, canvas pipeline, mermaid diagrams. | Editor internals, rendering, persistence loop, or cross-package runtime wiring. |
| **Technical** | [docs/technical/dev-setup.md](../technical/dev-setup.md) | Install, prerequisites, env variable tables, scripts, Docker/Vite, troubleshooting. | First clone, CI parity, or configuring/debugging `VITE_*` and local services. |
| **Technical** | [docs/technical/decision-log.md](../technical/decision-log.md) | Long-form decision log: context, rationale, and consequences per decision. | Audits, ADR-style detail, or when [decisionLog.md](./decisionLog.md) is too terse. |
| **Product** | [docs/product/PRD.md](../product/PRD.md) | Full PRD: requirements, personas in depth, features, NFRs, traceability to code. | Prioritization, acceptance criteria, scope conflicts, or stakeholder-facing spec. |
| **Product** | [docs/product/domain-glossary.md](../product/domain-glossary.md) | Domain and UI terminology, feature names, acronyms, disambiguation. | Exact naming, glossary lookups, or aligning copy with implemented concepts. |

**Rule of thumb:** Default to **Memory Bank** rows for breadth; **@**-load **Deep Docs** when you need diagrams, full env tables, PRD-level requirements, or long decision narratives.

---

## Current Focus

* **Primary task**: **Stand up and complete the project Memory Bank** under [docs/memory/](./) so agents and humans share a single, accurate picture of the Excalidraw monorepo (product, architecture, and toolchain)—with **[activeContext.md](./activeContext.md)** as the rolling “now” layer on top of longer-lived briefs.
* **Objective**: Capture what is actively being worked on **today**, reconcile **working tree vs. last commit**, and list immediate follow-ups so the next session does not lose context.

---

## Recent Changes

### Committed history (authoritative)

| When ( committed ) | Summary |
|--------------------|--------|
| **2026-03-24** — `4451b1e` *updates* | Expanded **`.coderabbit.yaml`**; added **`.github/PULL_REQUEST_TEMPLATE.md`**. |
| **2026-03-24** — `da795d2` *check-instructions* | Trimmed **`.coderabbit.yaml`** (smaller diff vs. initial). |
| **2026-03-24** — `5247322` *initial* | Introduced **`.coderabbit.yaml`** (initial CodeRabbit config). |
| **2026-03-23** — `a345399` *Initial* | Repository bootstrap commit. |

*Interpretation*: Recent **git** activity is **review/CI ergonomics** (CodeRabbit, PR template), not an Excalidraw feature change.

### Working tree (uncommitted — “live” editor state)

* **Memory Bank (in progress)**  
  * Staged/tracked edits: [docs/memory/projectbrief.md](./projectbrief.md), [docs/memory/systemPatterns.md](./systemPatterns.md), [docs/memory/techContext.md](./techContext.md) (paths show **add + modify** in index).  
  * New, not yet tracked: [docs/memory/productContext.md](./productContext.md), and **this file** [docs/memory/activeContext.md](./activeContext.md) once saved.  
* **Tooling / repo hygiene**  
  * `yarn.lock` **modified**: large diff pattern consistent with **registry URL normalization** (`registry.yarnpkg.com` → `registry.npmjs.org`) after install—verify no unintended version bumps before commit.  
  * Untracked: `.cursorignore`, `repomix-compressed.txt`, root `systemPatterns.md` (possible duplicate or export—see considerations).  
* **Editor activity signal**: [docs/memory/systemPatterns.md](./systemPatterns.md) was recently focused in the IDE; aligns with documentation-first work this session.

### Structural updates

* **No application package layout changes** reported in recent commits; structure remains **`excalidraw-app/`**

---

## Active Considerations

### Technical challenges

* **Memory Bank consistency**: Keep [projectbrief.md](./projectbrief.md), [productContext.md](./productContext.md), [techContext.md](./techContext.md), [systemPatterns.md](./systemPatterns.md), and [activeContext.md](./activeContext.md) aligned when any stack or architecture claim changes (versions, commands, env vars).  
* **`yarn.lock` noise**: Registry-only churn can swamp reviews—confirm whether to **commit** after a deliberate `yarn install` or **revert** if accidental.  
* **Environment sensitivity**: Some paths (e.g. `.husky/`, `__snapshots__/`, `.github/`) may hit **permission or sandbox** warnings locally; CI remains the ground truth for hooks and workflows.


---

*Last Updated: 2026-03-26 (session write)*  
*Verified against recent activity: **Yes** — `git log` (4 commits), `git status`, Memory Bank file reads, `yarn.lock` diff sample, commit stats for `4451b1e` / `da795d2` / `5247322`*
