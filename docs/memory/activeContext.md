# Active Context

## Current Focus

Setting up the AI-assisted development memory bank for the fwdays workshop (Day 1 assignment). The goal is to give AI coding assistants (Cursor, Claude Code) enough persistent context to work productively in this codebase without re-exploring from scratch each session.

## What Was Just Done

- Created `.cursorignore` — excludes binaries, generated files, lock files, and translation JSONs from AI context
- Created `CLAUDE.md` — guidance file for Claude Code covering commands, architecture, and code rules
- Created full `docs/` memory bank: projectbrief, techContext, systemPatterns, architecture, domain-glossary, PRD, decisionLog, productContext, progress, activeContext

## What's Done

- `docs/technical/dev-setup.md` — onboarding guide for new contributors ✓
- `docs/technical/undocumented-behaviors.md` — 6 non-obvious behaviors documented ✓
- `CLAUDE.md` — Claude Code guidance file ✓

## Open Questions / Risks

- `.env.development` is intentionally committed with dev-safe defaults (public OSS Firebase project); secrets should go in `.env.development.local` (gitignored)
- `excalidraw-app/collab/` contains WebSocket logic tightly coupled to excalidraw.com infrastructure; local collab requires running a separate server on port 3002
