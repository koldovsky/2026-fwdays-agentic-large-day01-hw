# Product Requirements Document — Excalidraw

> **Type:** Reverse-engineered PRD  
> **Source:** Excalidraw monorepo codebase, `docs/memory/`, `docs/technical/`, `docs/product/domain-glossary.md`  
> **Date:** 2026-03-29

---

## 1. Product Goal

Excalidraw is an **open-source, hand-drawn-style virtual whiteboard** that lets individuals and teams sketch diagrams, wireframes, and ideas with minimal friction — in a browser, with zero installation required.

The product ships in two complementary forms:

| Artifact | Goal |
|---|---|
| **`@excalidraw/excalidraw`** (npm library) | Give any web product a fully functional whiteboard by dropping in a single React component. |
| **`excalidraw-app`** (hosted web app at excalidraw.com) | Provide an instant, no-signup drawing surface with optional real-time collaboration and cloud persistence. |

The overarching goal is to make **collaborative visual thinking as effortless as picking up a pen**.

---

## 2. Target Audience

### 2.1 End Users (excalidraw-app)

| Segment | Primary Jobs to Be Done |
|---|---|
| **Developers / engineers** | Sketch architecture diagrams, data-flow charts, API contracts, system designs. |
| **Product managers / designers** | Create quick wireframes, user journey maps, flowcharts. |
| **Educators / students** | Explain concepts visually, annotate ideas in lectures or study sessions. |
| **Remote / distributed teams** | Brainstorm and diagram together in real time without installing dedicated software. |
| **Individual note-takers** | Maintain a personal visual notepad that auto-saves locally. |

**Entry points inferred from code:**
- Direct URL visit → blank canvas with Welcome Screen onboarding (`AppWelcomeScreen.tsx`).
- `#json=id,key` link → opens a shared scene from the backend (`initializeScene`).
- Collaboration room URL → joins a live session (`getCollaborationLinkData`).
- `#url=...` → loads a scene from an arbitrary URL (`loadFromBlob`).

### 2.2 Integrators (library consumers)

| Segment | Use Case |
|---|---|
| **SaaS platforms** | Embed a whiteboard inside their own product (e.g. project management, LMS, documentation tools). |
| **Developer tools** | Add diagramming to IDEs, notebooks, or API clients. |
| **Next.js / SSR apps** | Integrate via the `examples/with-nextjs` pattern (lazy-loaded to avoid SSR issues). |
| **Browser-only apps** | Minimal embed via `examples/with-script-in-browser` (Vite + React, no server). |

---

## 3. Key Features

### 3.1 Core Drawing

| Feature | Details |
|---|---|
| **Element palette** | Rectangle, diamond, ellipse, line, arrow, freehand draw, text, image, frame, magic frame, embeddable widget, eraser, laser pointer. All map to `ToolType` values in `AppState.activeTool`. |
| **Hand-drawn rendering** | RoughJS renders shapes with a natural, sketchy stroke; `perfect-freehand` smooths freehand paths. |
| **Infinite canvas** | Pan (`hand` tool) and zoom with scroll/pinch; viewport stored as `scrollX`, `scrollY`, `zoom` in `AppState`. |
| **Text editing** | Inline text on canvas via a native `<textarea>` overlay (`wysiwyg/textWysiwyg.tsx`). CodeMirror 6 is used only in the TTD (Text-to-Diagram) dialog, not for canvas text. |
| **Undo / redo** | Full history stack (`HistoryDelta`, `Store`, `ElementsDelta`, `AppStateDelta`); committed via `CaptureUpdateAction`. |
| **Snap & grid** | Snap-to-grid and snap-to-object helpers controlled by `AppState` flags. |
| **Lasso selection** | Polygon-based multi-element selection (`lasso` tool). |
| **Frames** | Group elements into named frames (`ExcalidrawFrameElement`); magic frames enable AI-assisted content. |
| **Embeddable widgets** | Embed iframes on the canvas (`ExcalidrawEmbeddableElement`, `ExcalidrawIframeElement`). |
| **Dark / light theme** | Theme toggle stored as `AppState.theme` (`THEME.LIGHT` / `THEME.DARK`); affects canvas background, UI chrome, and element rendering. |
| **Element type conversion** | Convert an element from one type to another in-place (`ConvertElementTypePopup`, backed by `convertElementTypePopupAtom`). |
| **Search** | Searchable element finder within the canvas (`SearchMenu`, `searchItemInFocusAtom`). |

### 3.2 Collaboration

| Feature | Details |
|---|---|
| **Real-time multi-user editing** | Socket.IO rooms managed in `excalidraw-app/collab/`; the library itself is sync-agnostic and renders any collaborator data pushed via `updateScene`. |
| **Live cursors & selections** | Remote users' cursors and selected element highlights rendered in `InteractiveCanvas` using `AppState.collaborators`. |
| **Laser pointer sync** | Collaborator laser trails broadcast and rendered via `laser-trails.ts`. |
| **Offline warning** | Banner displayed when the user is collaborating but loses network (`alerts.collabOfflineWarning`). |
| **Collaboration disabled in iframes** | `isCollabDisabled = isRunningInIframe()` prevents nested collab sessions. |
| **Follow mode** | Follow another collaborator's viewport in real time (`FollowMode` component, `onUserFollow` callback). |
| **User list** | Live avatar/name list of all collaborators in the session (`UserList.tsx`). |

### 3.3 Sharing & Persistence

| Feature | Details |
|---|---|
| **Auto-save to localStorage** | Scene elements and app state persisted locally on every change (`STORAGE_KEYS` in `app_constants.ts`). |
| **Cloud export / shareable link** | `onExportToBackend` uploads the scene; `ShareableLinkDialog` generates a read-only URL. |
| **`#json=id,key` deep links** | Encoded scene payload in URL hash; decrypted client-side. |
| **Firebase backend** | Firebase **11.3.1** provides cloud storage (and potentially auth) for the hosted app; `socket.io-client` **4.7.2** handles real-time collaboration transport. |
| **File export** | Export to `.excalidraw` (JSON), PNG, SVG; async export waits for all embedded images to finish loading via `FileStatusStore`. |
| **Library (sticker sheet)** | Save reusable element groups to the `Library` class, backed by IndexedDB with a localStorage migration adapter. |
| **Library from URL** | `parseLibraryTokensFromUrl` loads a community library directly from a link. |

### 3.4 Embedding & Extensibility (Library API)

| Feature | Details |
|---|---|
| **`<Excalidraw />` React component** | Single entry point (`packages/excalidraw/index.tsx`) for embedding the editor in any React app. |
| **`updateScene` API** | Host app pushes `SceneData` (elements, appState, collaborators) from outside. |
| **Custom tools** | `ActiveTool` supports `{ type: "custom"; customType: string }` for third-party tool extensions. |
| **Callbacks** | `onChange`, `onPointerUpdate`, `onUserFollow`, `onExportToBackend`, `onLibraryChange`, etc. |
| **`UIOptions`** | Fine-grained control over which UI panels and buttons are visible to the integrator. |
| **AI / Text-to-Diagram (TTD)** | `AIComponents` and `TTDDialogTrigger` shipped as optional children in the hosted app. The TTD dialog uses a **CodeMirror 6** code editor for structured input (`TTDDialog/CodeMirrorEditor.tsx`). |
| **Mermaid diagram import** | `@excalidraw/mermaid-to-excalidraw` (v2.1.1) converts Mermaid syntax into Excalidraw elements, integrated into the TTD flow. |
| **Command palette** | Extensible command palette with app-specific and custom entries. |

### 3.5 Onboarding & Discoverability

| Feature | Details |
|---|---|
| **Welcome screen** | Empty-canvas guide explaining toolbar, menu, help, and collaboration entry points (`AppWelcomeScreen.tsx`). |
| **Keyboard shortcuts** | Global keyboard handling (`handleKeyboardGlobally={true}`, `autoFocus={true}`); all shortcuts registered via the `Action` / `ActionManager` system. |
| **Command palette** | Searchable command list for all major actions (share, collab, social links). |
| **Excalidraw+** | Optional cloud product promoted via banner and command-palette entries (`VITE_APP_PLUS_*` env vars). |

### 3.6 Progressive Web App

| Feature | Details |
|---|---|
| **PWA / offline support** | Service worker registered via `vite-plugin-pwa`; `beforeinstallprompt` cached for "Add to Home Screen" UX. |
| **Install prompt** | Stored in `App.tsx` and shown to the user at the right moment. |

---

## 4. Technical Constraints

### 4.1 Runtime & Environment

| Constraint | Value / Source |
|---|---|
| **Node.js minimum** | >= 18.0.0 (enforced in `engines` of root and `excalidraw-app/package.json`). |
| **Browser** | Modern evergreen browsers with Canvas API and WebSocket support. |
| **No server-side rendering of the editor** | The `<Excalidraw />` component must be lazy-loaded in SSR contexts (see `examples/with-nextjs`). |
| **Collaboration unavailable in iframes** | Hard-coded: `isCollabDisabled = isRunningInIframe()`. |
| **Self-embedding guard** | Same-origin iframes show a fallback message instead of the full app. |

### 4.2 Data & Storage

| Constraint | Value / Source |
|---|---|
| **File upload cap** | 4 MiB (`FILE_UPLOAD_MAX_BYTES` in `excalidraw-app/app_constants.ts`). |
| **localStorage quota** | App displays a banner when quota is exceeded (`localStorageQuotaExceededAtom`). |
| **Scene format** | JSON-serializable `ExcalidrawElement[]`; all elements must be pure data objects (no DOM references). |
| **Collaboration element fields** | `version` and `versionNonce` on every element are required for CRDT-style conflict resolution during real-time sync. |
| **Library storage** | IndexedDB (primary) with localStorage migration adapter; no server persistence for personal libraries unless Excalidraw+ is used. |

### 4.3 Build & Packaging

| Constraint | Value / Source |
|---|---|
| **Package manager** | Yarn 1.22.22 (Yarn Classic); npm is not supported. |
| **Library build** | ESM output only, via `scripts/buildPackage.js` + esbuild + TypeScript declarations. |
| **Build order** | `common → math → element → excalidraw`; `utils` built separately. |
| **Deployment targets** | Vercel (static, `excalidraw-app/build/`) or Docker (nginx:1.27-alpine). |
| **Env files location** | `.env*` files are loaded from the **repository root**, not from `excalidraw-app/` (`envDir: "../"` in Vite config). |

### 4.4 Quality Gates

| Constraint | Tooling |
|---|---|
| **TypeScript strict mode** | `"strict": true` in root `tsconfig.json`; checked by `yarn test:typecheck`. |
| **Zero ESLint warnings** | `eslint --max-warnings=0` in `yarn test:code`. |
| **Prettier formatting** | Enforced for `css`, `scss`, `json`, `md`, `html`, `yml`; checked by `yarn test:other`. |
| **Husky pre-commit hooks** | `husky install` wires Git hooks, but the checked-in `.husky/pre-commit` has `lint-staged` **commented out** — it does not run automatically on commit in the default setup. Rely on `yarn test:all` before pushing. |
| **Test coverage thresholds** | Lines, branches, functions, statements thresholds defined in `vitest.config.mts`. |

### 4.5 Localization

| Constraint | Details |
|---|---|
| **i18n** | `i18next-browser-languagedetector` for runtime language detection. |
| **Crowdin workflow** | `crowdin.yml` manages translation file sync; `scripts/build-locales-coverage.js` tracks coverage. |

### 4.6 Observability

| Constraint | Details |
|---|---|
| **Error reporting** | `@sentry/browser` 9.0.1 in the hosted app; Docker builds disable Sentry (`VITE_APP_DISABLE_SENTRY=true`). |
| **Dev server port** | `VITE_APP_PORT` from `.env.development` (currently **3001**); fallback **3000** in `excalidraw-app/vite.config.mts`. |

---

## 5. Out of Scope / Non-Goals

- **Server-side whiteboard logic** — the library is intentionally sync-agnostic; networking is the host app's responsibility.
- **Mobile native apps** — the product is web-first; mobile browser support is best-effort via PWA.
- **Vector export beyond SVG** — no PDF, EPS, or other vector formats are supported out of the box.
- **Private real-time backend for self-hosting** — `excalidraw-app` provides Firebase + Socket.IO wiring, but the library itself ships no backend.
- **Offline collaboration** — collab sessions require network; an offline warning is shown when connectivity is lost.

---

## 6. Success Metrics (inferred from product behavior)

| Metric | Signal in Code |
|---|---|
| **Retention (local saves)** | Auto-save to localStorage on every change — users return to their work. |
| **Viral sharing** | `#json=` shareable links drive new user acquisition. |
| **Collaboration adoption** | Live collaboration session count (Socket.IO room events). |
| **Library / ecosystem growth** | Library import from URL, `onLibraryChange` callback usage by integrators. |
| **Embedding reach** | `@excalidraw/excalidraw` npm download count; `examples/` patterns. |
| **Excalidraw+ conversion** | Promo banner clicks and `VITE_APP_PLUS_*` link activations. |

---

## 7. Related Documentation

| Document | Location |
|---|---|
| Domain glossary | `docs/product/domain-glossary.md` |
| System architecture | `docs/technical/architecture.md` |
| Dev setup | `docs/technical/dev-setup.md` |
| Project brief | `docs/memory/projectbrief.md` |
| Technical context | `docs/memory/techContext.md` |
| Product context | `docs/memory/productContext.md` |
| Decision log | `docs/memory/decisionLog.md` |

---

## 8. Revision History

| Date | Changes |
|---|---|
| **2026-03-29** | Initial reverse-engineered PRD. |
| **2026-03-29** | Corrections: CodeMirror 6 usage clarified (TTD dialog, not canvas text); lint-staged status corrected (commented out in pre-commit hook). Additions: dark/light theme, element conversion, search, follow mode, Mermaid import, Sentry observability, dev server port detail. Firebase version pinned to 11.3.1. |
