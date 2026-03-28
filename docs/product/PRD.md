# Product Requirements Document — Excalidraw

**Version:** v1.0
**Date:** 2026-03-28
**Status:** Active
**Authors:** Reverse-engineered from codebase & architectural documentation

---

## Table of Contents

1. [Overview](#1-overview)
2. [Objectives & Goals](#2-objectives--goals)
3. [Features & Functionality](#3-features--functionality)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Data & State Management](#6-data--state-management)
7. [Integration Points](#7-integration-points)
8. [Assumptions & Constraints](#8-assumptions--constraints)
9. [Known Limitations](#9-known-limitations)
10. [Future Roadmap](#10-future-roadmap)
11. [Appendix](#11-appendix)

---

## 1. Overview

### Product Name

**Excalidraw**

### Purpose

Excalidraw is a browser-based virtual whiteboard that enables users to create beautiful, hand-drawn-style diagrams instantly — with zero sign-up and zero friction. It is simultaneously a production web application (`excalidraw.com`) and a reusable React component (`@excalidraw/excalidraw`) that third-party developers can embed in their own products.

The product's mission is to lower the barrier to visual thinking: any user, regardless of design skill, shall be able to open a blank canvas and communicate ideas clearly within seconds.

### Target Audience

| Persona | Description | Primary Goals |
|---|---|---|
| **Individual Creator** | Student, freelancer, or knowledge worker using excalidraw.com ad-hoc | Quickly sketch ideas, diagrams, or notes; export or share results |
| **Team Collaborator** | Team member in a live whiteboard session | Co-edit a diagram in real time with colleagues via a shared room link |
| **Technical / Engineering User** | Software engineer or architect creating system diagrams, flowcharts, or ERDs | Build structured technical diagrams; leverage AI-assisted Mermaid generation |
| **Third-Party Developer** | Engineer embedding `@excalidraw/excalidraw` in a product | Integrate the canvas component; control the scene programmatically via the imperative API |
| **Excalidraw Plus User** | Subscriber to the paid tier | Access advanced persistence, team workspaces, and cloud storage |
| **Open-Source Contributor** | Community member submitting code, translations, or library shapes | Fix bugs, add features, contribute translations |

### Core Problem Solved

Traditional diagramming tools impose high cognitive overhead (complex UIs, forced sign-up, steep learning curves) or produce sterile outputs that feel impersonal. Excalidraw solves this by providing an instantly available, sketch-aesthetic canvas that feels fast and natural, encouraging exploratory visual communication without ceremony.

---

## 2. Objectives & Goals

### Business Goals

1. **Grow embedded adoption:** The `@excalidraw/excalidraw` npm package shall achieve measurable growth in weekly downloads, targeting the top-tier position among open-source whiteboard component libraries.
2. **Drive Plus conversions:** The free web app shall convert individual users to Excalidraw Plus through in-product prompts, targeting a measurable percentage of active monthly users.
3. **Sustain community health:** The open-source repository shall maintain active contributor engagement (pull requests, translations via Crowdin, library contributions) as a distribution and feedback channel.

### User Goals

4. **Reduce time-to-first-drawing:** The user shall be able to open the app and place a first element on the canvas in under 5 seconds, with no registration required.
5. **Enable frictionless collaboration:** The user shall be able to invite a collaborator to a shared session and see both cursors moving in real time within 3 seconds of the collaborator joining the room link — all without exchanging credentials or creating accounts.

---

## 3. Features & Functionality

### 3.1 Core Canvas Drawing

**Description:** The primary drawing surface where users create, edit, and arrange visual elements in a hand-drawn sketch style.

**User Flow:**
1. The user opens `excalidraw.com` — the blank canvas renders immediately (no login required).
2. The user selects a drawing tool from the toolbar: rectangle, ellipse, diamond, arrow, line, free-draw, text, image, frame, or embeddable.
3. The user draws or places the element on the canvas via pointer events (mouse, touch, or stylus).
4. The user styles the element using the properties panel: stroke colour, fill colour, stroke width, opacity, font, and arrowhead type.
5. The user resizes, rotates, groups, or layers elements using handles and keyboard shortcuts.
6. Undo and redo are available at all times via `Ctrl/Cmd+Z` / `Ctrl/Cmd+Shift+Z`.

**Dependencies:** `@excalidraw/element`, `@excalidraw/math`, Rough.js (hand-drawn rendering), perfect-freehand (free-draw strokes), HTML5 Canvas API (dual-canvas pipeline).

---

### 3.2 Real-Time Collaboration

**Description:** Multiple users shall be able to co-edit the same canvas simultaneously through a shareable, end-to-end encrypted room link. No account is required to participate.

**User Flow:**
1. The user clicks **Live Collaboration** in the main menu.
2. The app generates a unique room ID and embeds an AES-256 encryption key in the URL fragment (`#room=<id>,<key>`).
3. The user shares the link with collaborators via any channel.
4. Each collaborator opens the link; the app joins the encrypted Socket.IO room and downloads the current scene from Firebase Firestore (decrypted client-side).
5. All element mutations and cursor movements are broadcast as encrypted deltas via WebSocket to all room participants.
6. The user may activate **Follow Mode** to lock their viewport to any collaborator's cursor.
7. Participants are shown as coloured avatars with cursor labels.
8. On leaving the session the scene is also saved to `localStorage` for later solo access.

**Dependencies:** Socket.IO client, Firebase Firestore, Firebase Storage, AES-GCM (Web Crypto API), `collab/Collab.tsx`, `collab/Portal.tsx`.

---

### 3.3 Export & Import

**Description:** The user shall be able to export the current scene in multiple formats and reimport files to resume or extend previous work.

**User Flow (Export):**
1. The user opens **Export** from the main menu or uses the keyboard shortcut.
2. The user chooses a format: PNG (raster), SVG (vector), or `.excalidraw` (JSON scene file).
3. For PNG/SVG the user configures options: background toggle, scale, embed scene data.
4. The file downloads to the user's local machine, or the image is copied to the clipboard.

**User Flow (Import):**
1. The user drags and drops a `.excalidraw` file onto the canvas, or uses **Open** from the main menu.
2. Excalidraw parses and restores the scene (elements + appState), migrating any legacy data format as needed.

**Dependencies:** `packages/excalidraw/data/` (JSON, blob, encode, restore modules), browser File System Access API.

---

### 3.4 AI-Assisted Diagramming (Text-to-Diagram)

**Description:** The user shall be able to describe a diagram in natural language or paste Mermaid syntax and have Excalidraw generate a ready-made diagram on the canvas.

**User Flow:**
1. The user opens the **TTD (Text-to-Diagram)** dialog via toolbar or command palette.
2. The dialog presents two tabs: **Text-to-Diagram** (natural language) and **Mermaid** (direct Mermaid syntax input).
3. In the Text-to-Diagram tab, the user types a description (e.g., "a flowchart showing user signup") and submits.
4. A streaming response from the external AI API returns a Mermaid-syntax diagram.
5. The app validates the Mermaid output and runs `mermaidAutoFix` to repair common syntax errors.
6. A live preview renders in the dialog's output panel.
7. The user clicks **Insert** to place the diagram as native Excalidraw elements on the canvas.
8. Chat history persists in IndexedDB across sessions for continuity.

**Dependencies:** External AI API (endpoint configured via `VITE_APP_AI_BACKEND`), `@excalidraw/mermaid-to-excalidraw`, CodeMirror 6, `TTDStreamFetch`, `mermaidAutoFix`, IndexedDB (`IDB_TTD_CHATS`).

---

### 3.5 Shape Library

**Description:** The user shall be able to build, import, export, and reuse a personal collection of element groups (shapes), and browse a community-contributed library portal.

**User Flow:**
1. The user selects one or more elements and clicks **Add to Library**.
2. The shape group appears in the Library sidebar panel.
3. The user may drag a library item onto the canvas to place a copy.
4. The user may export the library as a `.excalidrawlib` file and share it.
5. A **Browse libraries** button opens the external community library portal.

**Dependencies:** IndexedDB (library storage), `data/library.ts`, `components/LibraryMenu.tsx`.

---

### 3.6 Clipboard & Paste Interactions

**Description:** The user shall be able to copy/paste elements between sessions, paste external images, and paste tabular data that the app will offer to render as a chart.

**User Flow (Chart from Clipboard):**
1. The user copies a table of data from a spreadsheet or web page.
2. The user pastes onto the canvas (`Ctrl/Cmd+V`).
3. Excalidraw detects the tabular structure and presents a chart selection dialog.
4. The user chooses bar, line, or radar chart.
5. The chart renders as native Excalidraw elements (fully editable and exportable).

**Dependencies:** `clipboard.ts`, `charts/` module (bar, line, radar parsers and renderers), `PasteChartDialog.tsx`.

---

### 3.7 Command Palette

**Description:** A keyboard-driven command search surface that exposes all app actions by name, enabling power-user navigation without the mouse.

**User Flow:**
1. The user presses `Ctrl/Cmd+/` or the configured shortcut to open the command palette.
2. The user types to filter available commands (e.g., "align", "export", "dark mode").
3. The user selects a command with arrow keys and `Enter` — the action fires immediately.

**Dependencies:** `components/CommandPalette/`, `actions/manager.tsx`, `shortcuts.ts`.

---

### 3.8 Frames & Multi-Page Organisation

**Description:** The user shall be able to organise a large canvas into labelled rectangular frames, each representing a logical page or section of the diagram.

**User Flow:**
1. The user selects the **Frame** tool and draws a rectangle.
2. The frame receives an auto-incremented label (e.g., "Frame 1").
3. Elements placed inside the frame boundary are logically grouped within it.
4. The user can export individual frames or use frames as the unit for Diagram-to-Code extraction.
5. A Frames panel in the sidebar enables quick navigation across large canvases.

**Dependencies:** `element/src/frame.ts`, `actionFrame.ts`, `AppSidebar.tsx`.

---

### 3.9 Element Linking & Hyperlinks

**Description:** The user shall be able to attach URLs to elements and link elements together to create navigable diagrams.

**User Flow:**
1. The user right-clicks an element and selects **Edit link**.
2. The user enters a URL or selects another element on the canvas as the link target.
3. A link icon appears on the element.
4. Viewers (including in live collaboration) can click the icon to follow the link.

**Dependencies:** `actionLink.tsx`, `actionElementLink.ts`, `hyperlink/Hyperlink.tsx`.

---

### 3.10 Progressive Web App (PWA) & Offline Support

**Description:** Excalidraw shall be installable as a PWA on desktop and mobile and shall function fully offline, with all local data persisting between sessions.

**User Flow:**
1. The user visits `excalidraw.com` in a supported browser.
2. The browser offers the "Add to Home Screen" / "Install" prompt.
3. Once installed, the app launches from the home screen without a browser chrome.
4. With no network, the user opens a previous drawing from `localStorage` and continues editing.
5. On reconnection, any pending collaboration writes are flushed.

**Dependencies:** `vite-plugin-pwa` (Workbox service worker), `localStorage`, IndexedDB.

---

## 4. User Roles & Permissions

> Excalidraw uses a lightweight, link-based access model rather than a traditional role-based access control (RBAC) system. The table below describes effective access levels.

| Role | How Assigned | Canvas Edit | Export | Collaboration | Library | AI Features | Admin Controls |
|---|---|---|---|---|---|---|---|
| **Solo User** | Default; no login required | ✅ Full | ✅ Full | — | ✅ Personal | ✅ (if API configured) | — |
| **Collaboration Participant** | Possesses room link with encryption key | ✅ Full | ✅ Full | ✅ Full (cursor, follow) | ✅ Personal | ✅ (if API configured) | — |
| **Viewer (read-only link)** | Future; currently all link holders can edit | 🔲 Not yet supported | ✅ Full | ✅ Cursor visible | — | — | — |
| **Excalidraw Plus User** | Plus account cookie (`excplus-auth`) detected | ✅ Full | ✅ Full | ✅ Full | ✅ Cloud-backed | ✅ | ✅ Team management |
| **Embedded Consumer (Developer)** | Mounts `<Excalidraw />` component | ✅ Full (scoped) | ✅ Via API | ✅ (if configured) | ✅ | ✅ (if configured) | Via `ExcalidrawImperativeAPI` |
| **Self-Hosted Operator** | Deploys Docker image | ✅ Full | ✅ Full | ✅ (if collab server configured) | ✅ | ✅ (if AI endpoint configured) | Environment variables |

---

## 5. Non-Functional Requirements

### 5.1 Performance

- The canvas shall render 90% of interaction frames within **16 ms** (60 fps target) for scenes containing up to **500 elements**.
- The application shell shall reach **First Contentful Paint (FCP) in under 1.5 seconds** on a fast 3G connection (leveraging Vercel CDN edge delivery).
- Collaboration scene deltas shall be broadcast and applied to remote peers within **200 ms** under normal network conditions.
- Cursor position updates shall be sent at approximately **30 fps** (`CURSOR_SYNC_TIMEOUT = 33 ms`).

### 5.2 Scalability

- The static SPA shall support an unlimited number of concurrent solo users, constrained only by Vercel CDN capacity.
- Collaboration room capacity shall be limited by the external Socket.IO relay server configuration (not managed in this repository). The client design targets sessions of up to **50 concurrent collaborators per room** without degradation.
- The npm package (`@excalidraw/excalidraw`) shall support multiple simultaneous instances on the same page via `jotai-scope` isolation.

### 5.3 Availability

- The production deployment on Vercel shall target **99.9% uptime** for the static SPA (aligned with Vercel's SLA).
- The product shall function fully **offline** after the initial load (PWA service worker caches all static assets).
- Collaboration features require Firebase and the Socket.IO server; their availability SLAs are governed by those external providers.

### 5.4 Security

- All scene data transmitted during collaboration sessions shall be **end-to-end encrypted** using AES-256-GCM. The server (Firebase and Socket.IO relay) shall never receive plaintext diagram data.
- Encryption keys shall be embedded exclusively in the **URL fragment** (`#`), which is never transmitted to servers.
- The application shall use the browser's **Web Crypto API** for all cryptographic operations (no third-party crypto libraries for the core path).
- No user authentication is required for the free tier; identity is anonymous and ephemeral.
- Excalidraw Plus user authentication shall be handled via the Plus backend (detected via `excplus-auth` cookie); the open-source app shall not store credentials.

### 5.5 Reliability

- All drawing data shall be **auto-saved to `localStorage`** with a **300 ms debounce** on every change, ensuring minimal data loss in the event of a browser crash or navigation.
- Binary file assets (images) shall be stored in **IndexedDB** with no size cap imposed by the application.
- For collaboration rooms, a **full scene sync** shall be broadcast every **20 seconds** (`SYNC_FULL_SCENE_INTERVAL_MS`) as a safety net against missed delta updates.
- The application shall implement **cross-tab synchronisation** via the BroadcastChannel API (50 ms debounce) so that changes in one tab are reflected in other open instances.

### 5.6 Usability & Accessibility

- The application shall be **responsive** and usable on desktop (primary) and mobile (secondary) via Pointer Events API and the PEP polyfill.
- The application shall support **light and dark mode** with a manual toggle and automatic OS preference detection.
- The application shall be **internationalised (i18n)**, supporting community-contributed translations managed via Crowdin.
- The application shall provide **keyboard shortcuts** for all primary actions, discoverable via a help dialog and the command palette.

---

## 6. Data & State Management

### 6.1 Key Data Entities

| Entity | Description | Storage |
|---|---|---|
| **Element** | A single drawable object (rectangle, ellipse, arrow, text, image, frame, etc.). Has a stable `id`, type, geometry, and style properties. | Scene JSON → localStorage / Firebase |
| **AppState** | Transient UI state (selected tool, zoom, scroll, open panels). Separate from scene elements. | localStorage (filtered subset) |
| **Scene** | The complete set of elements and app state constituting a drawing. Serialised as `.excalidraw` JSON. | localStorage, Firebase Firestore, `.excalidraw` file |
| **FileId** | A content-addressable hash identifier for a binary file asset. Elements reference files by `FileId`; data stored separately. | IndexedDB (local), Firebase Storage (collab) |
| **Library Item** | A named, reusable group of elements. | IndexedDB, `.excalidrawlib` file |
| **Collaboration Room** | A temporary shared session with a random room ID and shared AES key. State stored in Firestore. | Firebase Firestore, runtime memory |
| **TTD Chat History** | AI chat exchanges (prompts and Mermaid responses) for the Text-to-Diagram feature. | IndexedDB (`IDB_TTD_CHATS`) |

### 6.2 Data Creation, Update, and Sharing

- **Creation:** User interaction (pointer/keyboard events) triggers element mutations via `App.mutateElement()`, which passes through the `Store` class to produce immutable `StoreSnapshot` updates.
- **Update:** All mutations generate `StoreDelta` objects (diffs between snapshots). Deltas feed the undo/redo history and collaboration broadcast pipeline.
- **Auto-save:** Scene is written to `localStorage` on a 300 ms debounce. Binary files are written to IndexedDB on import.
- **Collaboration sharing:** Deltas are AES-GCM encrypted and broadcast via `SCENE_UPDATE` Socket.IO events. Full scene is synced to Firebase Firestore every 20 seconds as a fallback.
- **Cross-tab sharing:** `BroadcastChannel` API propagates scene versions to other open tabs (50 ms debounce).

### 6.3 Data Retention & Privacy

- **Local data** (localStorage, IndexedDB) persists indefinitely until the user explicitly clears it or uninstalls the PWA.
- **Collaboration room data** in Firebase Firestore is stored encrypted; retention policy is determined by the Firebase project configuration (not enforced client-side).
- **Share link data** is permanently lost if the URL (containing the AES key in the fragment) is lost — this is a known, accepted trade-off of the encryption model.
- **No personal data** is collected by the open-source application. Sentry error reporting is opt-in and subject to Sentry's privacy policy.
- **AI/TTD prompts** are transmitted to the configured external AI API; self-hosted operators should review the privacy terms of their chosen AI provider.

---

## 7. Integration Points

### 7.1 External Services

| Service                            | Purpose                                                                       | Configuration                                                                           |
|------------------------------------|-------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| **Firebase Firestore**             | Persist encrypted collaboration room state and share-link scene data          | `VITE_APP_FIREBASE_CONFIG` environment variable                                         |
| **Firebase Storage**               | Store encrypted binary files (images) for collaboration rooms and share links | Same Firebase project; path prefixes `/files/rooms`, `/files/shareLinks`                |
| **Socket.IO Collaboration Server** | WebSocket relay for real-time scene delta and cursor updates                  | `VITE_APP_WS_SERVER_URL` environment variable (external server, not in this repository) |
| **External AI API**                | Text-to-Diagram and Diagram-to-Code generation via streaming Mermaid output   | `VITE_APP_AI_BACKEND` environment variable                                              |
| **Sentry**                         | Client-side error monitoring (opt-in)                                         | `VITE_APP_SENTRY_DSN` environment variable; disabled in Docker builds                   |
| **Excalidraw Plus Backend**        | Paid-tier account management, advanced persistence, team features             | Detected via `excplus-auth` cookie; UI redirects to Plus backend                        |
| **Community Library Portal**       | Browsable repository of shareable shape libraries                             | Opened via in-app "Browse libraries" button (external URL)                              |
| **Crowdin**                        | Community-driven internationalisation (i18n) translation management           | `crowdin.yml` in repository root; CI sync                                               |
| **Vercel**                         | Production hosting for `excalidraw.com`                                       | `vercel.json` in repository root                                                        |
| **Docker / Nginx**                 | Self-hosted deployment                                                        | `Dockerfile` + `docker-compose.yml` in repository root                                  |

### 7.2 APIs & Protocols

- **WebSocket (Socket.IO):** Used for real-time scene delta broadcasting and cursor position updates. Protocol: custom delta-diff messages (`SCENE_UPDATE`, cursor events). All payloads are AES-GCM encrypted before transmission.
- **Firebase REST/SDK:** Firestore JavaScript SDK for Firestore document reads/writes; Firebase Storage SDK for binary file upload/download.
- **Web Crypto API:** Browser-native AES-256-GCM encryption/decryption; no external crypto library in the critical path.
- **File System Access API:** Used for local file open/save operations in supported browsers.
- **BroadcastChannel API:** Cross-tab state synchronisation within the same browser origin.
- **ExcalidrawImperativeAPI:** Public JavaScript API surface exposed to host applications embedding the `<Excalidraw />` component (read/write scene, listen to events, customise UI).

### 7.3 Authentication Mechanisms

- **Anonymous use (default):** No authentication; access to any collaboration room is granted to any user possessing the room link (which contains the encryption key in the URL fragment).
- **Excalidraw Plus:** Session cookie (`excplus-auth`) issued by the Plus backend. The open-source app detects this cookie and unlocks Plus UI surfaces.
- **Self-hosted Firebase:** Firebase project credentials are supplied via `VITE_APP_FIREBASE_CONFIG`; Firebase's built-in anonymous authentication may be used.
- **AI API:** Authentication to the external AI endpoint is managed via the `VITE_APP_AI_BACKEND` configuration and any credentials set at the infrastructure level.

---

## 8. Assumptions & Constraints

### 8.1 Technical Constraints

- The application runs entirely **client-side in the browser**; no bespoke application server exists in this repository. All compute (rendering, encryption, reconciliation) executes on the user's device.
- Node.js ≥ 18.0.0 is required for the **build toolchain only** (Vite, TypeScript, Vitest), not for any runtime.
- The product is built with **React 19** (TypeScript, strict mode). Server-Side Rendering (SSR) is not supported — the Canvas API and Web Crypto API are browser-only.
- The build tool is **Vite 5**; feature flags are `VITE_APP_ENABLE_*` environment variables baked in at **build time** — runtime toggling requires a rebuild.
- Persistence is tightly coupled to **Firebase Firestore and Storage**. Migrating to an alternative backend requires changes to `excalidraw-app/data/firebase.ts`.
- The monorepo uses **Yarn 1 workspaces** with a strict build-order dependency chain: `common → math → element → excalidraw → excalidraw-app`.

### 8.2 Business Constraints

- The **core product is free and open-source** (MIT-licensed). Advanced features (cloud persistence, team workspaces) are gated behind the paid Excalidraw Plus tier.
- **No offline collaboration** is supported — collaboration requires an active connection to the Socket.IO server and Firebase.
- The **share link is the only access token**; there is no server-side session management or user account system in the open-source product.

### 8.3 Regulatory Constraints

- The application collects **no personal data** by default. Operators enabling Sentry error reporting or an external AI API must ensure compliance with applicable data protection regulations (e.g., GDPR, CCPA).
- **Encrypted data at rest** in Firebase is stored in Google's infrastructure; self-hosted operators are responsible for their own data residency requirements.
- The AI/TTD feature transmits user-supplied diagram descriptions to an external AI provider; operators must review that provider's data processing terms.

---

## 9. Known Limitations

- **No read-only share links (free tier):** Any user with a room link can edit the canvas. Viewer-only access is not currently supported in the open-source product.
- **Irreversible key loss:** Loss of a room/share-link URL (which embeds the AES key in the URL fragment) means permanent, unrecoverable data loss for that encrypted payload in Firebase.
- **Desktop-first experience:** The product is optimised for desktop browsers. Touch and pen input are supported via Pointer Events but the mobile experience lags behind desktop in ergonomics and performance.
- **No end-to-end test coverage:** Automated end-to-end (browser-level) tests using Playwright or Cypress do not exist. Coverage is provided by Vitest integration tests in jsdom.
- **Large-canvas performance degradation:** Rendering can noticeably degrade for scenes with significantly more than 500 elements. A hard element count limit is not enforced.
- **Main-thread bottleneck:** Heavy operations (AES-GCM encryption, Mermaid conversion, reconciliation) run on the browser main thread, which can cause frame drops during intensive sessions.
- **LWW collaboration conflicts:** The Last-Write-Wins conflict resolution with nonce tiebreaking is not a full CRDT. Brief inconsistencies during high-frequency concurrent edits are possible; the 20-second full-scene sync mitigates but does not eliminate this.
- **AI reliability:** AI-generated Mermaid output frequently contains syntax errors. The `mermaidAutoFix` utility repairs common issues but does not cover all failure modes, leading to occasional failed renders.
- **No offline collaboration:** Collaboration sessions require live network connectivity; there is no queue-and-flush mechanism for writes made while offline during a collaboration session.
- **No version history:** There is no server-side version history for scenes. The undo/redo history is session-local and is lost on page reload.

---

## 10. Future Roadmap

Based on observed technical debt and architectural patterns, the following features are candidates for future investment:

### 10.1 CRDT-Based Collaboration

Replace the current Last-Write-Wins reconciliation model with a full Conflict-free Replicated Data Type (CRDT) implementation (e.g., Yjs). This would eliminate the need for periodic full-scene syncs (currently every 20 seconds), reduce bandwidth usage in large rooms, and provide mathematically guaranteed convergence under concurrent edits.

### 10.2 Web Worker Offloading

Move computationally heavy operations — AES-GCM encryption/decryption, Mermaid-to-Excalidraw conversion, and scene reconciliation — to dedicated Web Worker threads. This would free the browser's main thread for uninterrupted canvas rendering, eliminating the frame-drop problem during collaboration or large diagram operations.

### 10.3 Read-Only Share Links & Viewer Role

Introduce a second URL format that grants view-only access to a scene, rendering the canvas in a non-interactive mode. This would support use cases such as presenting diagrams to external stakeholders without granting edit access.

---

## 11. Appendix

### 11.1 Technology Stack Summary

| Layer                  | Technology                          | Version                   |
|:-----------------------|:------------------------------------|:--------------------------|
| UI Framework           | React                               | 19.0.0                    |
| Language               | TypeScript                          | 5.9.3 (strict mode)       |
| Build Tool             | Vite                                | 5.0.12                    |
| State Management       | Jotai (atoms)                       | 2.11.0                    |
| Canvas Rendering       | HTML5 Canvas API (dual-canvas)      | Browser-native            |
| Hand-drawn Aesthetic   | Rough.js                            | 4.6.4                     |
| Free-draw Strokes      | perfect-freehand                    | 1.2.0                     |
| Mermaid Conversion     | @excalidraw/mermaid-to-excalidraw   | 2.1.1                     |
| TTD Code Editor        | CodeMirror                          | 6.x                       |
| UI Primitives          | Radix UI                            | 1.4.3                     |
| Encryption             | Web Crypto API (AES-256-GCM)        | Browser-native            |
| Real-time Transport    | Socket.IO client                    | 4.7.2                     |
| Cloud Persistence      | Firebase Firestore + Storage        | Firebase JS SDK           |
| Local Persistence (L1) | localStorage                        | Browser-native (~5–10 MB) |
| Local Persistence (L2) | IndexedDB (idb-keyval)              | Browser-native            |
| PWA                    | vite-plugin-pwa (Workbox)           | 0.21.1                    |
| Error Monitoring       | Sentry                              | @sentry/browser           |
| i18n                   | Custom `t()` + Crowdin-managed JSON | —                         |
| Testing                | Vitest + React Testing Library      | 3.0.6                     |
| Package Manager        | Yarn                                | 1.22.22                   |
| Hosting (production)   | Vercel (CDN)                        | —                         |
| Hosting (self-hosted)  | Docker + Nginx 1.27-alpine          | —                         |
