# Product Context

> Sources: `excalidraw-app/App.tsx`, `excalidraw-app/components/AppMainMenu.tsx`,
> `excalidraw-app/components/AppWelcomeScreen.tsx`, `excalidraw-app/share/ShareDialog.tsx`,
> `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/data/index.ts`,
> `excalidraw-app/components/AI.tsx`, `packages/excalidraw/actions/index.ts`

---

## Product Goals

1. **Expressive, zero-friction whiteboarding** — provide a hand-drawn-style canvas that
   feels immediate and informal, lowering the barrier to sketching ideas.
2. **Real-time collaboration** — let distributed teams co-edit the same canvas live via
   encrypted share links and Socket.io rooms backed by Firebase.
3. **Offline-first reliability** — persist scenes locally (IndexedDB via `idb-keyval`) and
   serve as a PWA so the tool works without a network connection.
4. **Embeddable whiteboard library** — expose `@excalidraw/excalidraw` on npm so
   third-party products can embed the full canvas with one React component.
5. **AI-assisted diagramming** — let users describe diagrams in natural language (text-to-diagram)
   or extract code from drawn diagrams (diagram-to-code) via the AI backend.

---

## User Personas

| Persona | Primary need | Entry point |
|---------|-------------|-------------|
| **Solo sketcher** | Quick visual note, no sign-in required | Open app, draw immediately |
| **Team lead / designer** | Live collaborative brainstorm with teammates | Start collab → share room link |
| **Developer / technical writer** | Embed whiteboard in a product or docs | npm `@excalidraw/excalidraw` |
| **Presenter** | Read-only share of a finished diagram | Export shareable link (encrypted JSON) |
| **Excalidraw+ subscriber** | Cloud storage, sign-in, persistence across devices | Excalidraw+ app URL |

---

## Core UX Scenarios

### 1. First-run / Welcome Screen
- App opens to a blank canvas with a **WelcomeScreen** overlay
  (`AppWelcomeScreen.tsx`).
- Hints point to the **hamburger menu**, **toolbar**, and **help** button.
- Center menu offers: **Load scene**, **Help**, **Start live collaboration**,
  and a **Sign up** link (Excalidraw+) for guests.
- Signed-in Excalidraw+ users see a personalised heading linking back to the Plus app.

### 2. Drawing and Editing
- **Toolbar** tools: rectangle, ellipse, diamond, arrow, line, freehand, text,
  image, eraser, frame, embeddable, laser pointer.
- **Selection mode**: multi-select, duplicate, delete, link, group/ungroup.
- **Arrange**: align (left/center/right/top/middle/bottom), distribute,
  z-order (bring to front/back/forward/backward), flip H/V.
- **Text binding**: attach labels to shapes; edit inline.
- **Crop** images directly on canvas.
- **Linear editor**: reshape arrows and lines via drag handles.

### 3. Canvas Navigation & View Modes
- **Zoom**: fit selection, fit page, zoom in/out, reset to 100%.
- **Grid** toggle for snapping.
- **Zen mode**: hides all UI chrome for distraction-free drawing.
- **Stats overlay**: element counts and canvas metrics.
- **Object snap** and **arrow binding** toggled from the main menu.
- **Theme**: light / dark / system (persisted per user).
- **Canvas background** color picker.

### 4. Undo / History
- Undo and redo via keyboard shortcuts or action registry
  (`packages/excalidraw/actions/`).
- History tracks element mutations; navigation actions (zoom/pan) are excluded.

### 5. File & Export Workflows
- **Save to file** / **Load scene** — local `.excalidraw` JSON files via
  `browser-fs-access`.
- **Export as image** — PNG or SVG with configurable background and scale.
- **Copy to clipboard** — copy canvas as PNG or SVG without saving.
- **Paste style** — copy/paste element visual properties across elements.
- **Shareable link**: scene is compressed, encrypted, and posted to the backend
  (`VITE_APP_BACKEND_V2_POST_URL`); the resulting ID + decryption key are embedded
  in the URL hash (`#json=id,key`). Recipients GET the scene with the same key.

### 6. Live Collaboration
- User opens **Share dialog** (`share/ShareDialog.tsx`, `collab/Collab.tsx`).
- A **room** is created: a random ID + encryption key are appended to the URL
  (`#room=id,key`).
- The dialog shows the **room link**, a **QR code**, and a native-share button
  (iOS / Windows / generic icon selected at runtime).
- Collaborators who open the link join the same Socket.io room; all changes are
  broadcast via encrypted payloads (`Portal.tsx`).
- Large binary assets (images) are stored in **Firebase Storage**; scene state is
  synced through **Firestore**.
- The host can **stop collaboration**, reverting the URL to a plain canvas.
- Collaborator **cursors** and usernames (from `@excalidraw/random-username`)
  are visible in real time.

### 7. Shareable Read-Only Link
- Distinct from collaboration rooms — produces a static encrypted snapshot.
- Accessed via **Main Menu → Export → Shareable link** or the Share dialog
  (type `"share"`) when no room is active.
- Recipients see the scene as read-only; they can clone it to their own canvas.

### 8. Library
- Users add frequently-used shapes to a personal **library**.
- Libraries can be exported/imported as `.excalidrawlib` files.
- URL tokens allow library items to be shared via link.

### 9. AI Features (optional, requires `VITE_APP_AI_BACKEND`)
- **Text-to-diagram** (`TTDDialog`): user types a natural-language description;
  streaming response converts it to Excalidraw elements via Mermaid bridge
  (`POST .../v1/ai/text-to-diagram/chat-streaming`).
- **Diagram-to-code** (`DiagramToCodePlugin`): selected elements are sent to the
  AI backend and returned as code (`POST .../v1/ai/diagram-to-code/generate`).
- Both features render inline in the canvas with a CodeMirror editor for review.

### 10. Command Palette & Search
- **Command palette** (`⌘/Ctrl + K`) surfaces all registered actions by name.
- **Search** panel finds and highlights matching elements on canvas.

### 11. Localisation
- Language auto-detected via `i18next-browser-languagedetector`.
- User can override from **Main Menu → Language**.
- Translations sourced from `packages/excalidraw/locales/` via Crowdin pipeline.

---

## UX Principles (inferred from implementation)

- **No sign-in required** for core drawing — the app is fully functional as a guest.
- **Encryption by default** for collaboration and share links; keys never leave
  the client in plaintext.
- **Local-first** — every scene is auto-saved to IndexedDB; network is enhancement,
  not dependency.
- **Progressive disclosure** — advanced features (AI, Excalidraw+, collab) surface
  only when relevant, not cluttering the default canvas.
- **Cross-platform parity** — PWA install, platform-aware share icons, and
  `browser-fs-access` polyfill ensure consistent behaviour across desktop and mobile.

---

## Key UI Entry Points

| Surface | File | Purpose |
|---------|------|---------|
| Welcome screen | `excalidraw-app/components/AppWelcomeScreen.tsx` | First-run onboarding, quick actions |
| Main menu (hamburger) | `excalidraw-app/components/AppMainMenu.tsx` | File, export, collab, settings, theme |
| Share dialog | `excalidraw-app/share/ShareDialog.tsx` | Room link, QR code, read-only link |
| Toolbar | `packages/excalidraw/components/` | Drawing tools |
| AI dialogs | `excalidraw-app/components/AI.tsx` | TTD + diagram-to-code |
| Command palette | `packages/excalidraw/actions/` | Keyboard-accessible action search |
| App footer | `excalidraw-app/components/AppFooter.tsx` | Zoom controls, theme toggle |
| App sidebar | `excalidraw-app/components/AppSidebar.tsx` | Library panel |

## Details

- **Product:** [PRD](../product/PRD.md), [Domain glossary](../product/domain-glossary.md)
- **Technical:** [Architecture](../technical/architecture.md), [Dev setup](../technical/dev-setup.md)
