# Product Requirements Document — Excalidraw (reverse-engineered)

**Document type:** Reverse-engineered PRD from the public monorepo behavior, packages, and app shell.  
**Scope:** Describes the product as implemented in this tree, not a forward roadmap.

---

## 1. Product purpose

Excalidraw is an **open-source, browser-based virtual whiteboard** for informal diagrams, UI sketches, and collaborative drawing. It emphasizes a **hand-drawn (“rough”) look**, fast iteration, and **portable output** (image, vector, and structured scene JSON). The same core ships as:

- A **full web application** (`excalidraw-app/`) with hosting-oriented features (e.g. share links, collaboration hooks, PWA-related tooling in the Vite stack).
- An **embeddable React library** (`@excalidraw/excalidraw` in `packages/excalidraw/`) for third-party products.

**Primary outcome for users:** express ideas visually in minutes, share them with a link or export, or embed the editor inside another product with a documented React API.

---

## 2. Target audience

### 2.1 Primary

- **Knowledge workers and engineers** who need quick diagrams for docs, chats, tickets, and presentations without opening a heavyweight design suite.
- **Facilitators and small teams** who run brainstorming or architecture discussions in the browser and may use **live collaboration** when the deployment provides a WebSocket backend and related services.

### 2.2 Secondary

- **Product and design collaborators** who want sketch-level fidelity rather than pixel-perfect mockups.
- **Developers integrating Excalidraw** who need a React component, export hooks (`exportToSvg`, `exportToCanvas`, JSON data APIs), and theming/persistence patterns (see package README and examples under `examples/`).

### 2.3 Out of audience (by design)

- Users seeking **print/PDF layout**, **CAD-level precision**, or **GIS/mapping** workflows—the tool is optimized for speed and clarity on a 2D canvas, not domain-specific drafting.

---

## 3. Key capabilities (functions)

The following are **observable capabilities** supported by this repository’s architecture and dependencies.

1. **Drawing and editing on a 2D canvas**  
   Standard whiteboard tools (selection, shapes, connectors, text, freedraw, images, etc.) with undo/redo and scene history patterns implemented in the element and editor layers (`packages/element`, `packages/excalidraw`).

2. **“Rough” stroke rendering**  
   Visual style driven by **Rough.js** (`roughjs` in `packages/excalidraw/package.json`), giving the signature sketch appearance.

3. **Export and interchange**  
   Export paths include **SVG** and **canvas/PNG-style** rendering via utilities (`exportToSvg`, `exportToCanvas` in tests and public APIs), plus **JSON** scene serialization for save/load and embedding workflows.

4. **Embeddable React component**  
   `@excalidraw/excalidraw` is documented as a React component requiring **bundled CSS** and a **non-zero height container**; the package README covers Next.js/SSR constraints (`dynamic` import, `ssr: false`).

5. **Shape / diagram assistance**  
   Integration with **Mermaid → Excalidraw** (`@excalidraw/mermaid-to-excalidraw` dependency) for importing diagram text into the canvas ecosystem.

6. **Reusable element library**  
   Library UI and persistence patterns (e.g. IndexedDB adapter usage in `excalidraw-app/App.tsx` with `useHandleLibrary`) for storing and reusing saved shapes across sessions.

7. **Localization**  
   Extensive locale JSON under `packages/excalidraw/locales/` for in-app language switching aligned with i18n-style workflows.

8. **Real-time collaboration (hosted app)**  
   The app integrates **Socket.IO** (`socket.io-client` in `excalidraw-app/package.json`) with room-based flows (`excalidraw-app/collab/`), including fallbacks and file handling via Firebase APIs where configured—**subject to environment** (`VITE_APP_WS_SERVER_URL` and related setup).

9. **Progressive Web App–oriented build**  
   Vite PWA plugin usage in `excalidraw-app/vite.config.mts` supports install/offline-style deployment scenarios when enabled.

10. **Observability and error reporting (app)**  
    Optional **Sentry** integration (`@sentry/browser` in `excalidraw-app/package.json`) for client error telemetry in deployments that configure it.

---

## 4. User journeys (condensed)

- **Sketch & export:** Open app → draw → export PNG/SVG or copy for paste into other tools.  
- **Share live session:** Start collaboration → share URL with room parameters → concurrent editing when backend services are available.  
- **Embed in product:** Install npm package → render `<Excalidraw />` → wire `initialData` / change handlers per API docs.  
- **Reuse assets:** Save frequently used shapes to the library → insert into new scenes.

---

## 5. Technical constraints and limitations

Constraints below are **inherent to the architecture** or explicitly documented in-repo—not bugs.

### 5.1 Platform and runtime

- **Modern browsers with Canvas** support; primary rendering uses HTML Canvas, not DOM layout for strokes.
- **Node.js ≥ 18** for tooling (`engines` in root `package.json`); CI uses **Node 20.x** (`.github/workflows/lint.yml`).

### 5.2 Embedding and SSR

- The editor expects a **client-side React runtime**. SSR frameworks must **disable SSR** for the component or load it dynamically; otherwise hydration/`window` issues occur (documented in `packages/excalidraw/README.md`).

### 5.3 Layout integration

- The component fills its parent; **parent height must be defined** or the canvas may not appear (documented “two easy-to-miss requirements” in package README).

### 5.4 Collaboration scope

- Collaboration is **wired in the app layer** and depends on **network services** (WebSocket URL, optional Firebase for files). It is **not a guarantee** in arbitrary embeds; the app also **disables collaboration UX in iframes** (`isRunningInIframe()` gate in `excalidraw-app/App.tsx`).

### 5.5 Assets and fonts

- Default font delivery may use **CDN-style loading**; self-hosting requires copying font assets and setting `window.EXCALIDRAW_ASSET_PATH` (package README). Export pipelines must load fonts for accurate SVG/canvas output—edge cases exist for complex text (see changelog themes around export).

### 5.6 Build toolchain

- Monorepo expects **Yarn Classic 1.22.x** workspaces; mixing package managers risks inconsistent installs.

---

## 6. Non-goals (what the product does not promise)

- **Not an AI illustration or generative drawing product**—no requirement for ML-generated artwork as a core feature.
- **Not a replacement for Figma/Sketch** for component libraries, design tokens, or developer handoff beyond diagram export.
- **Not offline-first by default** for every deployment—behavior depends on PWA configuration and caching.
- **Not server-rendered whiteboard markup**—the canonical experience is interactive client rendering.

---

## 7. Success criteria (product engineering)

- Users can complete **draw → export/share** without training on a proprietary file format (JSON scene remains portable).
- Integrators can follow published **React + CSS + height** guidance and reach a working embed quickly.
- Hosted deployments can enable **collaboration and persistence** only where backend and env vars are correctly provisioned—failure modes degrade gracefully (socket errors, fallbacks in collab code paths).

---

## 8. Related documentation in this repo

- Memory Bank overview: `docs/memory/projectbrief.md`, `docs/memory/techContext.md`, `docs/memory/systemPatterns.md`.  
- Developer onboarding: `docs/technical/dev-setup.md`.  
- Deeper architecture (when present): `docs/technical/architecture.md`.  
- Domain language: `docs/product/domain-glossary.md` (when present).
