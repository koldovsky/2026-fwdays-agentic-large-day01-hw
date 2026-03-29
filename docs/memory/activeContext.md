# Active Context

> Last updated: 2026-03-29
> Sources: `.coderabbit.yaml`, `git log`, `docs/memory/`, `package.json`, `excalidraw-app/`, `packages/`

---

## Current Focus

This repository is the **fwdays Agentic IDE Workshop — Day 1 homework** built on top of the official Excalidraw monorepo fork.

The participant progresses through numbered steps, each graded automatically by CodeRabbit (`.coderabbit.yaml`).

---

## Workshop Progress

| Step | Task | Status |
|------|------|--------|
| 1 | Fork & clone the Excalidraw repo | ✅ Done (initial commit `a345399`) |
| 2 | Create `.cursorignore` for AI context filtering | ✅ Done (committed `30a038e`) |
| 3 | Cursor rules / AGENTS.md for AI guidance | ⬜ Not started |
| 4 | Memory Bank (`docs/memory/`) | 🔄 In progress (files exist, not yet committed) |
| 5 | Technical docs (`docs/technical/architecture.md`) + Product docs (`docs/product/`) | ⬜ Not started |

> Source: `git log --oneline`, `git status` (`?? docs/`), `.coderabbit.yaml` path_instructions

---

## Memory Bank Status (Step 4)

Four required files exist in `docs/memory/` but are **untracked** (not yet committed to git):

- `projectbrief.md` — project overview, goals, repo structure, key scripts
- `techContext.md` — full tech stack with versions, CI/CD, browser targets
- `systemPatterns.md` — architecture, Jotai patterns, collab, testing conventions
- `activeContext.md` — **this file** (being created now)

**Next action:** commit `docs/memory/` to satisfy Step 4 grading criteria.

---

## Remaining Work (Step 5)

CodeRabbit checks require three more files that **do not yet exist**:

### `docs/technical/architecture.md`
Required sections (100–500 lines):
- High-level Architecture (Mermaid diagram preferred)
- Data Flow
- State Management (`appState`, elements, `actionManager`)
- Rendering Pipeline (React → canvas via Rough.js)
- Package Dependencies

### `docs/product/domain-glossary.md`
Required: minimum 5 Excalidraw-specific terms with:
- Name (as used in code)
- Definition in Excalidraw context
- Key files where used
- "Not to be confused with" note

Mandatory terms: `Element`, `Scene`, `AppState`, `ExcalidrawElement`, `Tool`, `Action`

### `docs/product/PRD.md`
Required sections (50–300 lines):
- Product Purpose
- Target Audience
- Key Features (≥5)
- Non-goals / Constraints

---

## Active Working Files

Files recently modified or created this session:

| File | Change |
|------|--------|
| `.cursorignore` | Created — 77-line ignore list for AI tools |
| `docs/memory/projectbrief.md` | Created — project overview |
| `docs/memory/techContext.md` | Created — tech stack reference |
| `docs/memory/systemPatterns.md` | Created — architecture patterns |
| `docs/memory/activeContext.md` | **Creating now** |

> Source: `git status`, file timestamps

---

## Key Commands for This Session

```bash
# Dev server (excalidraw-app via Vite)
yarn start

# Run all checks before committing
yarn test:all          # typecheck + lint + prettier + vitest

# Commit the docs/memory/ files
git add docs/memory/
git commit -m "Day 1: Oleksiy Onufriychuk — Memory Bank (Step 4)"

# Then create PR with title (substitute your name as needed):
# "Day 1: Oleksiy Onufriychuk — Workshop Assignment"
```

> Source: root `package.json` scripts, `.coderabbit.yaml` pre_merge_checks

---

## CodeRabbit Auto-grading Rules

Reviews are triggered on **all branches** (`base_branches: ".*"`), including draft PRs.

- Path filters scope reviews to: `docs/**`, `.cursorignore`, `.cursorrules`, `.cursor/**`, `AGENTS.md`
- Source code changes (`.ts`, `.tsx`) are **not reviewed** for grading
- PR title must follow the workshop pattern, e.g. `Day 1: Oleksiy Onufriychuk — Workshop Assignment`
- Language: Ukrainian (`uk-UA`), assertive mentor tone

> Source: `.coderabbit.yaml` lines 6–29, 38–50, 195–197

---

## Important Constraints

- **Do not modify** existing Excalidraw source code — workshop tasks are documentation-only
- All `docs/memory/*.md` files must be ≤200 lines, structured with headings + bullets
- No placeholder text or hallucinated facts — all content must be verifiable against source
- `@excalidraw/utils` version is `0.1.2` (differs from other packages at `0.18.0`)

> Source: `.coderabbit.yaml` path_instructions, `packages/utils/package.json`

## Details

- **Product:** [PRD](../product/PRD.md), [Domain glossary](../product/domain-glossary.md)
- **Technical:** [Architecture](../technical/architecture.md), [Dev setup](../technical/dev-setup.md)
