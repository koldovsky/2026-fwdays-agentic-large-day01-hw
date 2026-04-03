# Product Context

## Purpose

Excalidraw is positioned as a whiteboard-style drawing tool for creating diagrams with a hand-drawn feel, while also exposing the editor as an embeddable React component.

The product therefore serves two user groups:

- end users who open the hosted app and create or share diagrams;
- developers who embed `@excalidraw/excalidraw` into their own products.

## UX Targets

The current codebase suggests the following UX targets:

- Fast entry into a blank canvas with minimal setup.
- Strong discoverability for core actions such as load, export, share, help, and live collaboration.
- Browser-native behavior for installability, offline-friendly loading, clipboard, and sharing.
- Low-friction onboarding for new users through a welcome screen and menu hints.
- Reusable editor API for host applications without forcing app-shell behavior on library consumers.

## Primary User Scenarios

### 1. Start drawing immediately

The app starts at a full editor view and includes a dedicated welcome screen with load/help/collaboration actions. This indicates a primary scenario of opening the app and sketching immediately.

### 2. Share a scene with others

The app has a dedicated share dialog, collaboration link generation, QR code display, copy/share actions, and active room state. This indicates sharing is a primary product path, not an add-on.

### 3. Collaborate live in a room

The app exposes a live collaboration trigger in both the welcome screen and main menu. The collaboration layer tracks presence, user pointers, visible bounds, idle state, and room lifecycle.

### 4. Save, export, and reuse work

The main menu exposes load, save-to-file, export, and save-as-image flows. The editor package also exports import/export helpers for scenes and libraries.

### 5. Use the editor inside another app

The package README, examples, and public exports show a separate integration scenario: developers embed Excalidraw into React applications, including Next.js and plain browser-script cases.

## UX Characteristics Visible In Code

- Welcome-screen hints reduce first-use friction.
- Command palette and search are first-class menu actions.
- Theme and language switching are product-level controls.
- Collaboration uses human-readable room links and QR codes.
- PWA manifest, service-worker registration, and cache strategy indicate installable/offline-aware UX goals.

## Likely User Types

These are inferred from implemented flows, not from a formal product spec:

- individual users sketching diagrams quickly;
- small groups collaborating in real time;
- users sharing scenes by link;
- developers embedding the editor as a library;
- Excalidraw+ funnel users, based on explicit menu and welcome-screen links.

## Constraints That Shape UX

- The editor must work in the browser and degrade reasonably in test/dev environments.
- Collaboration depends on room links, encrypted payloads, sockets, and Firebase-backed persistence.
- The embeddable library must remain usable independently of the hosted app shell.
- Local persistence is important because the app stores scene state and files in browser storage.

## Notes On Evidence

There is no formal `README.md` at the repository root describing product goals. The scenarios above are derived from visible product flows and exported integration paths in the source code.

## Related Docs

- Reverse-engineered product requirements: `docs/product/PRD.md`
- Product/domain terminology: `docs/product/domain-glossary.md`
- Runtime architecture behind these scenarios: `docs/technical/architecture.md`

## Verified From Source

- `excalidraw-app/components/AppWelcomeScreen.tsx`
- `excalidraw-app/components/AppMainMenu.tsx`
- `excalidraw-app/share/ShareDialog.tsx`
- `excalidraw-app/App.tsx`
- `excalidraw-app/index.tsx`
- `excalidraw-app/vite.config.mts`
- `packages/excalidraw/README.md`
- `packages/excalidraw/index.tsx`
- `examples/with-nextjs`
- `examples/with-script-in-browser`
