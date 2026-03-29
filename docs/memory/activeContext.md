# Active context

**Purpose:** Single place for *current* focus. Update this when the team’s priority changes.

**As of last Memory Bank sync:** no feature branch or ticket id is encoded in the repo; this section is inferred from repository layout and recent `docs/memory/` activity.

---

## Repository identity

- **Name (package):** `excalidraw-monorepo` — root `package.json`.
- **Context:** Path `2026-fwdays-agentic-large-day01-hw` indicates a **course / homework clone** of the upstream Excalidraw monorepo; behavior matches upstream patterns unless locally patched.

---

## Precise focus for agents and contributors

### 1. Memory Bank and documentation hygiene

- Maintain **`docs/memory/`** as the lightweight source of truth for product context, progress, and decisions.
- Avoid duplicating long architectural narratives: **`systemPatterns.md`** already covers `packages/excalidraw` layout and `App` state split; link there instead of copying.

### 2. Where product behavior is implemented

| Concern | Primary location |
|--------|-------------------|
| Hosted app shell, routing via hash/query | `excalidraw-app/App.tsx` |
| Collab socket + room lifecycle | `excalidraw-app/collab/` |
| Backend export/import, encryption hooks | `excalidraw-app/data/index.ts` (+ `firebase.ts`, `FileManager.ts`) |
| Share / QR UI | `excalidraw-app/share/` |
| Embeddable editor | `packages/excalidraw/` (`components/App.tsx`, `index.tsx`) |

### 3. Verification discipline

- Claims in Memory Bank files should be **traceable** to `package.json`, `app_constants.ts`, or the files above.
- When changing UX flags (e.g. `UIOptions`, `detectScroll`), update **`productContext.md`** or this file in the same change.

---

## Out of scope for “active” work unless explicitly assigned

- Rewriting the core class-based `App` in `packages/excalidraw/components/App.tsx` (large, high-risk).
- Publishing packages — follow `scripts/release.js` and workspace `build:*` scripts only when release is the task.

---

## Quick commands (from root `package.json`)

- **Dev app:** `yarn start` → `yarn --cwd ./excalidraw-app start` (Vite).
- **Tests:** `yarn test`, `yarn test:all` (includes typecheck, eslint, prettier, vitest).
- **Build packages + app:** `yarn build:packages`, `yarn build`.

---

## Next steps
- [ ] Перевірити та зафіксувати відмінності цього форку від upstream Excalidraw, які потрібно зберігати.
- [ ] Після кожного суттєвого merge оновлювати `docs/memory/progress.md` відповідно до фактичної поведінки.

---

## Details

For detailed architecture → see `docs/technical/architecture.md`.

For domain glossary → see `docs/product/domain-glossary.md`.
