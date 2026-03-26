# Active context

Short-lived **handoff** for anyone continuing work in this workspace: current theme, next actions, and open questions. For stable product facts use [`productContext.md`](./productContext.md) and [`docs/product/PRD.md`](../product/PRD.md); for stack and commands use [`techContext.md`](./techContext.md).

## Details

Related references:

- **Architecture** — [`docs/technical/architecture.md`](../technical/architecture.md)
- **Package boundaries** — [`systemPatterns.md`](./systemPatterns.md)
- **Onboarding & CI** — [`docs/technical/dev-setup.md`](../technical/dev-setup.md)
- **Domain glossary** — [`docs/product/domain-glossary.md`](../product/domain-glossary.md)

---

## Current focus

- **Documentation baseline:** Core Memory Bank files (`projectbrief`, `techContext`, `systemPatterns`) and extended Memory Bank files (`productContext`, `activeContext`, `progress`, `decisionLog`) are **present** under `docs/memory/`; keep them in sync when behavior or scope changes.
- **Next doc work:** Prefer **targeted updates** (collab, persistence, new packages) over broad rewrites; link new **findings** from Memory Bank instead of duplicating long excerpts.

---

## Immediate next steps

1. When you **start or finish** a significant task, **refresh this file** so “current focus” names the next concrete slice (feature, refactor, or doc pass).
2. When touching **collab** or **persistence** in `excalidraw-app/`, cross-check [`docs/technical/architecture.md`](../technical/architecture.md) host vs library **Jotai** split so state ownership stays accurate in any new notes.
3. Prefer **findings** deep dives ([`docs/findings/`](../findings/)) for package-level investigations; link them from Memory Bank instead of duplicating long excerpts.

---

## Hot paths (when coding)

| Area | Typical entry |
|------|----------------|
| Editor orchestration | `packages/excalidraw/components/App.tsx` |
| Commands | `packages/excalidraw/actions/` |
| Element graph | `packages/element/src/Scene.ts`, `packages/element/src/store.ts` |
| Host shell | `excalidraw-app/App.tsx`, `excalidraw-app/vite.config.mts` |

---

## Open questions

- **Workshop-specific:** Whether participants must document **three or more undocumented behaviors** as a checklist item; no dedicated doc section exists yet under `docs/`—confirm with course staff before inventing a template.
- **Product vs fork:** This directory name (`2026-fwdays-agentic-large-day01-hw`) marks a **course/homework** fork; when upstream Excalidraw changes land, re-verify version pins in root and `packages/excalidraw/package.json` before stating behavior in UX scenarios.

---

## Maintenance

Update this file **when starting or finishing** a significant task so the next session does not rely on chat history alone.
