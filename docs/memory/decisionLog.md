# Undocumented behaviour

Where **repository or inline documentation** does not fully match **runtime behaviour** in code. Each item lists **file paths**, **what is documented**, **what the code does**, and a short **description** of the gap.

---

### Example 1 — Pre-commit hook does not run lint-staged

**File paths**

- `.husky/pre-commit`
- `package.json` (root) — `scripts.prepare` → `husky install`
- `docs/technical/dev-setup.md` — § Git hooks and pre-commit

**What is documented**

- Onboarding says Husky runs after `yarn install` and describes `.lintstagedrc.js` rules. It states that `yarn lint-staged` in `.husky/pre-commit` **may be commented** and can be **uncommented** to enable checks—implying the hook file is wired for lint-staged once that line is active.

**What the code does**

- `.husky/pre-commit` only contains `#!/bin/sh` and the line `# yarn lint-staged` (comment). **No executable command** runs on `git commit`, so lint-staged never runs in a clean checkout until the hook script is changed.

**Description**

- **Undocumented / under-documented:** contributors may assume “Husky installed = commits are guarded.” In reality **pre-commit is a no-op** until a real command is added; only the *possibility* of lint-staged is documented, not that the committed hook file currently runs nothing.

---

### Example 2 — `yarn start` runs a full install before Vite

**File paths**

- `excalidraw-app/package.json` — `scripts.start`
- `package.json` (root) — `scripts.start` → `yarn --cwd ./excalidraw-app start`
- `docs/technical/dev-setup.md` — § Run the main application

**What is documented**

- Dev setup says from the repo root, `yarn start` runs the Vite dev server for the product app. It does **not** say that the app package’s `start` script runs **`yarn` (install)** first.

**What the code does**

- `excalidraw-app/package.json` defines `"start": "yarn && vite"`. Every start executes **`yarn`** in that workspace (dependency install / resolution) **before** `vite`, which adds latency and network/disk work compared to `vite` alone.

**Description**

- **Undocumented behaviour:** the extra **`yarn &&`** step is easy to miss when reading only the root `package.json`; integrators are not told that “start dev” is not equivalent to “launch Vite only.”

---

### Example 3 — Global Jotai store vs “isolated” editor state

**File paths**

- `packages/excalidraw/editor-jotai.ts` — `editorJotaiStore`, `EditorJotaiProvider`
- `packages/excalidraw/context/tunnels.ts` — comment about per-instance Jotai
- `packages/excalidraw/data/library.ts` — `Library.destroy` (commented `libraryItemsAtom` reset)
- `docs/technical/architecture.md` — Jotai / `EditorJotaiProvider` section
- `packages/excalidraw/README.md` — embed quick start (no multi-instance note)

**What is documented**

- Architecture describes **Jotai** with **`jotai-scope` isolation** and an `EditorJotaiProvider`, which reads like **per-tree** UI state. The public README does **not** warn embedders about multiple `<Excalidraw />` roots on one page.

**What the code does**

- A **module-singleton** `createStore()` backs `editorJotaiStore`; `App` updates atoms via that global store. Inline comments in `tunnels.ts` and `library.ts` acknowledge **per-instance** stores are **not** implemented yet. `Library.destroy` clears in-memory queues and SVG cache but **does not** reset `libraryItemsAtom` (reset block is commented with a TODO), so unmount leaves shared atom state.

**Description**

- **Undocumented for product integrators:** multiple instances can **share** Jotai-backed UI state. Architecture emphasizes isolation **primitives**, but the **singleton store** and partial cleanup on destroy are not spelled out in user-facing integration docs—only partially in code comments.

---

### Example 4 — `updateScene` JSDoc default vs conditional `scheduleMicroAction`

**File paths**

- `packages/excalidraw/components/App.tsx` — `updateScene` method and its JSDoc block

**What is documented**

- The inline JSDoc on `updateScene` documents `captureUpdate` with **`@default CaptureUpdateAction.EVENTUALLY`**, suggesting callers get that capture policy when the field is omitted.

**What the code does**

- The implementation only calls `this.store.scheduleMicroAction({ ... })` when **`if (captureUpdate)`** is truthy. If `captureUpdate` is **omitted**, that entire block is skipped—there is **no** assignment of `EVENTUALLY` (or any default) inside this method.

**Description**

- **Documented default not applied in this function:** the JSDoc and the body disagree. Readers of the API comment can assume implicit **`EVENTUALLY`** capture; the code does **not** implement that default here—behaviour is **undocumented** unless callers always pass `captureUpdate` or another layer sets it (not visible in this method).

---

## Related documentation

**Technical** (`docs/technical/`)

- [Architecture](../technical/architecture.md)
- [Developer setup](../technical/dev-setup.md)

**Product** (`docs/product/`)

- [PRD](../product/PRD.md)
- [Domain glossary](../product/domain-glossary.md)
