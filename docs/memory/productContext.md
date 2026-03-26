# Product context — Excalidraw (Memory Bank)

Product-oriented view: **first-party app** (`excalidraw-app`) + **embeddable editor** (`@excalidraw/excalidraw`). This file keeps **personas, principles, and journey-shaped behavior**; **prioritized requirements, metrics, and roadmap-level spec** → [docs/product/PRD.md](../product/PRD.md). **Named features, acronyms, and glossary-style definitions** → [docs/product/domain-glossary.md](../product/domain-glossary.md).

---

## Why this project exists?

* **Problem statement**
  * People need a **fast, lightweight, browser-based canvas** to sketch diagrams and ideas with a **hand-drawn** look—without heavy design suites—and to **share or embed** that experience elsewhere.
  * Teams need **optional live collaboration** and **read-only share links** when a backend/socket stack is configured, without forcing every user through account walls for basic drawing.

* **Vision**
  * Default to **privacy-friendly, local-first editing** (autosave to browser storage) while scaling up to **multiplayer sessions**, **cloud file/room flows** (Firebase-backed assets in app code), and **Excalidraw+** upsell where the product line extends paid features.

---

## User personas

* **Primary user — visual thinker & knowledge worker**
  * Uses the **standalone app** (full-height `Excalidraw` surface) to draw, annotate, present rough diagrams, and export or share output.
  * May open a **collaboration or share URL** (app detects collaboration links and initializes `Collab` accordingly).

* **Secondary user — teammate / viewer**
  * Joins via **shared room link** (`ShareDialog`, copy/QR/`navigator.share` where available) or opens a **shareable link** after **export to backend** (`ShareableLinkDialog`).

* **Integrator — developer**
  * Embeds **`Excalidraw` as a React component** (`packages/excalidraw`) in their app; may follow **`examples/with-nextjs`** or script-based examples—not the same chrome as `excalidraw-app`, but the same core editor patterns.

* **Pain points addressed**
  * Friction of “install a design tool” → **instant web canvas**.
  * Losing work → **debounced local persistence** (`LocalData`, `importFromLocalStorage`, IndexedDB for library via `LibraryIndexedDBAdapter`).
  * Hard to co-edit → **Live collaboration** (`LiveCollaborationTrigger`, `Collab`, `socket.io-client` in stack).
  * Diagrams from text → **Text to diagram** + **Mermaid** in **`TTDDialog`** (tabs `text-to-diagram` and `mermaid`).

---

## User experience (UX) goals

* **Core principles**
  * **Canvas-first**: primary focus is the infinite board; chrome stays secondary (`LayerUI`, `DefaultSidebar`, top menu).
  * **Progressive depth**: empty board shows **`WelcomeScreen`** hints (`MenuHint`, `ToolbarHint`, `HelpHint`); power users rely on **`CommandPalette`** and **`SearchMenu`**.
  * **Honest system status**: collaboration offline banner, `CollabError`, `localStorageQuotaExceeded` alert, `ErrorDialog` for failures—surface problems instead of silent loss.
  * **Cross-form-factor**: **`useEditorInterface` / formFactor** gates some UI (e.g. desktop `ExcalidrawPlusPromoBanner`, mobile paths via library `MobileToolBar` patterns).

* **User journeys**
  1. **Onboarding**
     * Land on app → **`WelcomeScreen`** with center actions: load scene, help, optional **live collaboration** entry, Excalidraw+ **Sign up** link when not a Plus user (`AppWelcomeScreen`).
     * Discover **hamburger `MainMenu`**: load/save file, export, save as image, optional collaboration trigger, command palette, search, help, clear canvas (`AppMainMenu` extends library defaults).
  2. **Main task**
     * Draw and edit on **canvas**; use **toolbar** and **shape library** via **`DefaultSidebar`**; open **Text to diagram** from **`TTDDialogTrigger`** (dropdown item with AI badge → opens **`TTDDialog`**).
     * **Share**: **`LiveCollaborationTrigger`** (top-right on desktop when collab enabled) opens **`ShareDialog`**; **export** flow can yield **`ShareableLinkDialog`** after `exportToBackend`.
     * **Persist**: continuous **`onChange`** → local save; **hash change** re-initializes scene when not a library URL (`HASHCHANGE` handler in `App.tsx`).
  3. **Retention**
     * **Autosave + tab sync** reduces fear of losing boards.
     * **Library** persistence (IndexedDB) brings back custom shapes.
     * **Collaboration** and **share links** bring users back to the same room or snapshot.
     * **AI / diagram generation** (`AIComponents`, TTD) encourages repeat use for faster drafts.

---

## How it works

* **Key workflows** (logical order as implemented)
  1. **Load context**: `initializeScene` resolves initial elements/app state (local, collab room, or remote share metadata); **`loadImages`** pulls binary assets from **local IDB**, **Firebase** (share/collab paths), or **`Collab`’s** file fetch.
  2. **Edit**: User manipulates elements; **`onChange`** persists via **`LocalData.save`** and, if collaborating, **`collabAPI.syncElements`**.
  3. **Share / collaborate**: User opens **`ShareDialog`** → start or copy **room link** (`activeRoomLinkAtom`); optional **export to backend** builds a **read-only link** shown in **`ShareableLinkDialog`**.
  4. **Export / save**: **`MainMenu`** / **`OverwriteConfirmDialog`** paths—**save to disk**, **export image**, optional **Export to Excalidraw+** UI in export dialog (`ExportToExcalidrawPlus`).
  5. **Diagram from text**: **`TTDDialog`**—**Text to diagram** conversation with insert/preview; **Mermaid** tab uses **`@excalidraw/mermaid-to-excalidraw`** (`MermaidToExcalidraw`).
  6. **Special shell route**: **`window.location.pathname === "/excalidraw-plus-export"`** renders **`ExcalidrawPlusIframeExport`** instead of the main wrapper (no generic client-side router; primary navigation is canvas + hash + this path).

* **Critical features** (must-haves for product value)
  * Interactive **rough-style** canvas (**`roughjs`**, **`perfect-freehand`**) with **undo/redo**, selection, text, images, bindings.
  * **File & library I/O**: load/save **`.excalidraw`** (and related flows), **library** sidebar, URL-driven **library tokens** (`parseLibraryTokensFromUrl`).
  * **Share surface**: **export**, **save as image**, backend **shareable link**, **live collaboration** when enabled (disabled in **iframe** via `isRunningInIframe`).
  * **Discoverability**: **`CommandPalette`**, **`SearchMenu`**, **`Help`**, theme and **canvas background** controls (`MainMenu` / `LayerUI`).
  * **Optional AI**: app-level **`AIComponents`**, library **TTD** stack with **CodeMirror**-backed editing where used.

---

## UX/UI design constraints

* **Design system**
  * **SCSS** (global and partials), **`clsx`**, **`radix-ui`** primitives; shared patterns under `packages/excalidraw/components` — **not** Tailwind-first.

* **Platforms**
  * **Responsive web**: desktop-first chrome with **mobile toolbars** and **editor interface** form factors; **PWA** tooling (**`pwacompat`**, Vite PWA plugin per project setup).
  * **Embed**: host apps consume **`index.css`** bundle with the **React** component; **iframe** embedding is constrained (collaboration off, self-embed guard with **“I'm not a pretzel!”** message in `App.tsx`).

* **Interactions**
  * **Pointer/canvas** manipulation as the core modality; **keyboard** handled globally in app config (`handleKeyboardGlobally`).
  * **Drag-and-drop / file pickers** via **`browser-fs-access`** and blob loading patterns (`loadFromBlob`).
  * **Real-time**: **WebSocket-style collaboration** via **`socket.io-client`** (when collab server available); not generic “WebSockets” naming in UI copy, but that’s the transport class.
  * **Theming**: **`THEME`** light/dark/system with **`ToggleTheme`** in menu and app-level **`useHandleAppTheme`**.

## Details

- For full product requirements and vision → see [docs/product/PRD.md](../product/PRD.md)
- For comprehensive domain-specific terminology → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
