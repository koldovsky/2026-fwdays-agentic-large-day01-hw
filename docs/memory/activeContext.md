# Active Context

## Related Docs
- [Progress — full assignment status](progress.md)
- [Dev Setup — how to run the project](../technical/dev-setup.md)
- [Decision Log — key code findings](decisionLog.md)
- [System Patterns — architecture overview](systemPatterns.md)

---

## Current Work (this repository)

This is a **fwdays 2026 Day 1 workshop assignment**. The goal is to set up AI-assisted development tooling and documentation for a large unfamiliar codebase (Excalidraw).

### Assignment Checklist (from `.github/PULL_REQUEST_TEMPLATE.md`)

**Required:**
- [x] `.cursorignore` — created, tuned to exclude noise (locales, fonts, WASM, repomix output)
- [x] `docs/memory/projectbrief.md`
- [x] `docs/memory/techContext.md`
- [x] `docs/memory/systemPatterns.md`
- [x] `docs/memory/productContext.md`
- [x] `docs/memory/activeContext.md`
- [x] `docs/memory/progress.md`
- [x] `docs/memory/decisionLog.md`
- [ ] `docs/technical/architecture.md`
- [ ] `docs/product/domain-glossary.md`
- [ ] `docs/product/PRD.md`

**Bonus:**
- [ ] `docs/technical/dev-setup.md`
- [ ] 3+ undocumented behaviors documented

## Recent Git History

```
4451b1e updates
da795d2 check-instructions
5247322 initial
a345399 Initial
```

Recent commits focus on project setup: CI config (`.coderabbit.yaml`, 257 lines) and PR template.

## Recently Modified Files

| File | Status | Notes |
|------|--------|-------|
| `.cursorignore` | Modified | Tuned to exclude fonts, locales, WASM, repomix output |
| `docs/memory/*.md` | New | Memory bank files being created now |
| `projectbrief.md` | New | Root-level (pre-memory-bank) |
| `systemPatterns.md` | New | Root-level (pre-memory-bank) |
| `decisionLog.md` | New | Root-level (pre-memory-bank) |
| `techContext.md` | New | Root-level (pre-memory-bank) |

## Known Technical Debt (verified from `App.tsx` TODOs)

| Location | TODO | Impact |
|----------|------|--------|
| `App.tsx` ~line 445 | Unify touch and pointer events — currently a hack | Medium |
| `App.tsx` ~line 890 | Paste logic needs test coverage | Low |
| `App.tsx` ~line 1250 | Rewrite to paste text & images simultaneously | Medium |
| `App.tsx` ~line 2340 | Consolidate double-click logic (currently scattered) | Medium |
| `App.tsx` ~line 3890 | Rename `isResizing` state field to `isScaling` | Low |
| `App.tsx` ~line 105 | Normalize UIOptions props in parent component | Low |

## Active Hotspots in Codebase

These files are large, complex, or have multiple TODOs — most likely to need changes:

| File | Size | Notes |
|------|------|-------|
| `packages/excalidraw/components/App.tsx` | ~12,800 lines | Core editor, monolithic class |
| `excalidraw-app/collab/Collab.tsx` | Large | WebSocket sync, conflict resolution |
| `packages/excalidraw/types.ts` | 33KB | All type definitions |
| `packages/element/src/linearElementEditor.ts` | Large | Arrow/line point editing |
| `packages/excalidraw/snapping.ts` | 36KB | Complex snap detection |

## Focus for Next Steps

1. Complete remaining required docs: `docs/technical/architecture.md`, `docs/product/domain-glossary.md`, `docs/product/PRD.md`
2. Optionally: find and document 3+ undocumented behaviors
3. Optionally: write `docs/technical/dev-setup.md` onboarding guide
