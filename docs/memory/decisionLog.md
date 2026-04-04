# Decision log — key technical choices

Decisions recorded here are **descriptive of the upstream Excalidraw architecture** in this repository snapshot, not personal preferences. Use ADR-style entries when this fork introduces new choices.

---

## ADR-001 — Yarn workspaces + Vite for the web app

- **Context**: The monorepo ships multiple packages and a browser app; fast dev iteration matters.
- **Decision**: Root **`package.json`** declares **Yarn 1.x workspaces**; **`excalidraw-app`** uses **Vite** for dev/build (`yarn start`, `yarn build` via root scripts).
- **Consequences**: Contributors must use **`yarn`** at the root; mixing npm/pnpm without documentation risks lockfile drift.
- **Status**: Accepted (inherited from upstream layout).

---

## ADR-002 — Scene model split: `@excalidraw/element` vs `AppState`

- **Context**: Drawing data and UI/camera state have different lifecycles (undo, export, collaboration).
- **Decision**: **Elements** live in the element package with validation/history helpers; **AppState** holds tool, selection, zoom, and view flags in the excalidraw package.
- **Consequences**: Features touching “what is on canvas” vs “how the editor behaves” should respect this boundary.
- **Status**: Accepted.

---

## ADR-003 — Command dispatch via `ActionManager`

- **Context**: Many surfaces (menus, keyboard, API) must trigger the same operations consistently.
- **Decision**: User operations funnel through **`ActionManager`** and registered actions (`packages/excalidraw/actions/`).
- **Consequences**: New tools should register actions rather than duplicating mutation paths ad hoc.
- **Status**: Accepted.

---

## ADR-004 — Canvas rendering with Rough.js

- **Context**: Brand and performance require a hand-drawn look with acceptable frame rates.
- **Decision**: Stroke/fill styling relies on **Rough.js** (`roughjs` dependency in `packages/excalidraw/package.json`).
- **Consequences**: Visual changes may need understanding of both canvas draw calls and Rough.js primitives.
- **Status**: Accepted.

---

## Undocumented behaviors — code vs published docs (reverse-engineered)

Three behaviors observed in source that are **easy to miss** in high-level documentation (`packages/excalidraw/README.md`, workshop Memory Bank, or typical “how to embed” guides). Use these when debugging integrations or self-hosted deployments.

---

### UB-001 — Live collaboration is off when the **web app** runs inside an iframe

| | Detail |
|---|--------|
| **What the code does** | `ExcalidrawWrapper` sets `isCollabDisabled = isRunningInIframe()` (`excalidraw-app/App.tsx`). `isRunningInIframe` is `window.self !== window.top` (cross-origin safe via `try/catch` in `getFrame()` — `packages/common/src/utils.ts`). When disabled: the **`Collab` React tree is not mounted at all** (`excalidrawAPI && !isCollabDisabled && <Collab … />`), collaboration UI is off (`isCollabEnabled={!isCollabDisabled}`), and pointer sync for collab is not wired the same way. |
| **What docs imply** | The npm package README explains embedding the **`<Excalidraw />` library** in your page (CSS, height, SSR). It does **not** state that loading the **full Excalidraw web app** (this Vite app) inside an `<iframe>` disables the **hosted** collaboration feature. Readers can wrongly assume “embed = still collaborative” for the excalidraw.com-style app. |
| **Practical takeaway** | Treat “app in iframe” as **local-only / no live room** for the official app shell unless you change this guard. |

---

### UB-002 — Sentry is initialized only on **allowlisted host substrings**

| | Detail |
|---|--------|
| **What the code does** | `excalidraw-app/sentry.ts` sets `Sentry.init({ dsn: onlineEnv ? "…" : undefined })` where `onlineEnv` is truthy only if `VITE_APP_DISABLE_SENTRY` is not `"true"` **and** `window.location.hostname` **contains** one of: `excalidraw.com`, `staging.excalidraw.com`, or `vercel.app`. Otherwise `dsn` is **`undefined`** and Sentry does not send events. Comments note intent: avoid noise locally / in Docker and respect privacy. |
| **What docs imply** | `excalidraw-app/package.json` lists `@sentry/browser`, which suggests error reporting to integrators. There is **no** `excalidraw-app/*.md` explaining that a **self-hosted** build on `localhost` or a custom domain **silently skips** Sentry unless you patch this logic or match the hostname heuristic. |
| **Practical takeaway** | Self-hosted deployments should not expect Sentry dashboards to populate without code or env changes; this is **by design** in the snippet above. |

---

### UB-003 — The production app sets `detectScroll={false}` while the library default is `true`

| | Detail |
|---|--------|
| **What the code does** | `ExcalidrawBase` defaults `detectScroll` to **`true`** (`packages/excalidraw/index.tsx`). The excalidraw web app passes **`detectScroll={false}`** (`excalidraw-app/App.tsx`). When `detectScroll` is false, `App` does **not** attach a `scroll` listener on the nearest scrollable container (`packages/excalidraw/components/App.tsx`), so canvas offset recomputation on **ancestor scroll** does not run through that path. |
| **What docs imply** | The public package README in this repo does **not** document `detectScroll` (CHANGELOG references an older README path). Nothing explains **why** the first-party app disables it—e.g. full-viewport layout vs nested scroll containers—so developers copying props from `excalidraw-app` may break **scrollable embed** scenarios without understanding the tradeoff. |
| **Practical takeaway** | If Excalidraw sits inside a **scrollable panel**, you usually want **`detectScroll: true`** (default). The hosted app’s `false` is an implementation choice, not a universal recommendation. |

---

## How to add a new entry

1. Copy the ADR template block above.
2. Use the next id: **ADR-00N**.
3. Keep **Context / Decision / Consequences / Status** filled; avoid empty placeholders.
4. For “code vs docs” gaps, add a **UB-00N** block under **Undocumented behaviors** with the table format used above.
