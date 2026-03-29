# Progress

> Last updated: 2026-03-29
> Sources: `git log --oneline`, `git status`, `docs/memory/`, `.coderabbit.yaml`, directory listing

---

## Workshop Overview

**fwdays Agentic IDE Workshop — Day 1 homework** built on top of the official Excalidraw monorepo fork.

Participants complete numbered steps; each is graded automatically by CodeRabbit (`.coderabbit.yaml`).

PR title format required: `Day 1: <participant-name> — Workshop Assignment`

---

## Step-by-Step Progress

| Step | Task | Status | Evidence |
|------|------|--------|----------|
| 1 | Fork & clone the Excalidraw repo | ✅ Done | Commit `a345399 Initial` |
| 2 | Create `.cursorignore` for AI context filtering | ✅ Done | Commit `30a038e added cursorignore` |
| 3 | Cursor rules / `AGENTS.md` for AI guidance | ❌ Not started | No `.cursorrules` or `AGENTS.md` found |
| 4 | Memory Bank (`docs/memory/`) | 🔄 In progress | Files exist; `?? docs/` (untracked) |
| 5 | Technical docs + Product docs | ❌ Not started | `docs/technical/` and `docs/product/` do not exist |

> Source: `git log --oneline` (5 commits), `git status --short` (`?? docs/`)

---

## Current Git State

- **Branch:** `master` (1 commit ahead of `origin/master`)
- **Commits (oldest → newest):**
  1. `a345399` — Initial (fork baseline)
  2. `5247322` — initial
  3. `da795d2` — check-instructions
  4. `4451b1e` — updates
  5. `30a038e` — added cursorignore ← **HEAD**
- **Untracked:** `docs/` (entire Memory Bank folder)

---

## Step 4 — Memory Bank Detail

Six files exist in `docs/memory/` but are **not yet committed**:

| File | Status | Purpose |
|------|--------|---------|
| `projectbrief.md` | ✅ Created | Project overview, goals, repo structure, key scripts |
| `techContext.md` | ✅ Created | Full tech stack with versions, CI/CD, browser targets |
| `systemPatterns.md` | ✅ Created | Architecture, Jotai patterns, collab, testing conventions |
| `activeContext.md` | ✅ Created | Current focus, workshop progress, key commands |
| `productContext.md` | ✅ Created | Product goals, UX scenarios, user personas |
| `progress.md` | ✅ Created | This file — current progress tracker |

**Next action:** `git add docs/memory/ && git commit -m "Day 1: <name> — Memory Bank (Step 4)"`

---

## Step 3 — What's Needed

`.coderabbit.yaml` path instructions check for:

- `.cursorrules` — project-level Cursor AI rules file
- `.cursor/**` — Cursor rules directory
- `AGENTS.md` — top-level agent guidance file

**Neither file nor directory exists yet.**

---

## Step 5 — What's Needed

Three files must be created:

### `docs/technical/architecture.md`
- 100–500 lines
- Required: High-level Architecture (Mermaid preferred), Data Flow, State Management, Rendering Pipeline, Package Dependencies

### `docs/product/domain-glossary.md`
- Minimum 5 Excalidraw-specific terms
- Required terms: `Element`, `Scene`, `AppState`, `ExcalidrawElement`, `Tool`, `Action`
- Each entry: Name, Definition, Key files, "Not to be confused with"

### `docs/product/PRD.md`
- 50–300 lines
- Required sections: Product Purpose, Target Audience, Key Features (≥5), Non-goals / Constraints

---

## Remaining Work Summary

| Priority | Action |
|----------|--------|
| 1 | Commit `docs/memory/` → satisfies Step 4 grading |
| 2 | Create `.cursorrules` or `AGENTS.md` → satisfies Step 3 |
| 3 | Create `docs/technical/architecture.md` → part of Step 5 |
| 4 | Create `docs/product/domain-glossary.md` → part of Step 5 |
| 5 | Create `docs/product/PRD.md` → part of Step 5 |
| 6 | Open PR with correct title format → triggers CodeRabbit review |

---

## Key Commands

```bash
# Commit Memory Bank (Step 4)
git add docs/memory/
git commit -m "Day 1: <name> — Memory Bank (Step 4)"

# Run all checks before submitting
yarn test:all        # typecheck + lint + prettier + vitest

# Open PR (triggers CodeRabbit auto-grading)
gh pr create --title "Day 1: <name> — Workshop Assignment"
```

> Source: root `package.json` scripts, `.coderabbit.yaml` pre_merge_checks, `activeContext.md`

## Details

- **Product:** [PRD](../product/PRD.md), [Domain glossary](../product/domain-glossary.md)
- **Technical:** [Architecture](../technical/architecture.md), [Dev setup](../technical/dev-setup.md)
