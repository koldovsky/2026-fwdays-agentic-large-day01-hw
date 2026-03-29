# Progress

## Related Docs
- [Active Context — current focus & TODOs](activeContext.md)
- [Dev Setup — onboarding guide](../technical/dev-setup.md)
- [PRD — product requirements](../product/PRD.md)

---

## Workshop Assignment Status

### Completed

| Deliverable | File | Notes |
|-------------|------|-------|
| Cursor ignore config | `.cursorignore` | Excludes: locales, fonts, WASM, build artifacts, repomix output |
| Memory bank: project brief | `docs/memory/projectbrief.md` | Purpose, structure, AI coding standards |
| Memory bank: tech context | `docs/memory/techContext.md` | Verified versions, all yarn commands, build/test config, Repomix analysis |
| Memory bank: system patterns | `docs/memory/systemPatterns.md` | 3-layer state, component tree, data flow, patterns, lifecycle |
| Memory bank: product context | `docs/memory/productContext.md` | UX philosophy, user flows, public API, integrations |
| Memory bank: active context | `docs/memory/activeContext.md` | Assignment checklist, TODOs, hotspots |
| Memory bank: progress | `docs/memory/progress.md` | This file |
| Memory bank: decision log | `docs/memory/decisionLog.md` | App.tsx deep dive: state, side effects, lifecycle |

### In Progress

| Deliverable | File | Status |
|-------------|------|--------|
| Technical architecture | `docs/technical/architecture.md` | Not started |
| Domain glossary | `docs/product/domain-glossary.md` | Not started |
| PRD (reverse-engineered) | `docs/product/PRD.md` | Not started |

### Bonus (Not Started)

- [ ] `docs/technical/dev-setup.md` — onboarding guide
- [ ] 3+ undocumented behaviors documented

---

## What Was Learned

### Codebase Complexity
- `App.tsx` is ~12,800 lines — a monolithic class component managing all editor state
- State is split across 3 layers: React class state, instance fields, Jotai atoms
- 856 files total; top 3 token hogs (WASM + font files) account for 41% of all tokens

### Tooling Decisions
- **Repomix compressed mode** saves 62% tokens (3.3M → 1.26M) — always use `--compress`
- **`.cursorignore`** critical for Cursor performance — locales (59 files) + fonts (234 woff2) + WASM-as-TS add massive noise
- **No `repomix.config.json`** yet — could reduce further to ~400k tokens by excluding font/WASM source

### Architecture Insights
- All user actions go through `ActionManager` (Command pattern) — good entry point for understanding any feature
- `onChangeEmitter` fires on every `componentDidUpdate` — this is how the app layer (collab, persistence) reacts to changes
- `mutateElement()` returns a new object and increments `version` — never mutate elements directly
- Fractional indexing on element `.index` field enables conflict-free ordering in multiplayer

---

## File Inventory: `docs/`

```
docs/
└── memory/
    ├── projectbrief.md      ✅
    ├── techContext.md       ✅
    ├── systemPatterns.md    ✅
    ├── productContext.md    ✅
    ├── activeContext.md     ✅
    ├── progress.md          ✅ (this file)
    └── decisionLog.md       ✅
```
