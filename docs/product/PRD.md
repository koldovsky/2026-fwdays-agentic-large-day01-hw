# Product Requirements Document

## Document Status

- Reverse-engineered from the repository state on 2026-03-25.
- This document is descriptive of the current implementation, not an original business source of truth.

## Project Goal

- Provide a fast, approachable whiteboard and diagramming tool for solo ideation, realtime collaboration, and embeddable use cases.
- Keep the core drawing experience local-first so the product remains useful when network-backed features are unavailable.
- Serve both direct product users on excalidraw.com and integrators embedding the editor as a React package.

## Target Audience

- Individual creators sketching diagrams and notes quickly.
- Teams collaborating live in a shared room.
- Developers embedding Excalidraw into another React application.
- Power users experimenting with AI-assisted diagram generation and diagram-to-code conversion.
- Educators, facilitators, and workshop participants using a lightweight collaborative whiteboard.

## Core Jobs To Be Done

- Create and edit diagrams with minimal setup.
- Resume work after refresh, reconnect, or offline periods.
- Share a diagram either as a static link or a live collaborative room.
- Import and export drawings plus associated assets.
- Reuse the editor as a package inside another product.

## Key Functions

### Core Canvas Editing

- Rich element editing via the Excalidraw editor component.
- Theme and language persistence.
- Welcome screen, menu, sidebar, and command palette surfaces.

### Local Persistence

- Autosave scene state to browser storage.
- Persist binary files separately from lightweight scene and app state.
- Recover state across reloads when possible.

### Realtime Collaboration

- Start a live room from the app.
- Join a room from a room URL.
- Sync scene updates, cursor state, idle state, and viewport bounds.
- Persist collaborative room state to Firebase for resilience.

### Shareable Links

- Export the current scene to a share backend.
- Generate a recoverable URL with a client-held decryption key.
- Upload image files related to the shared scene.

### AI Features

- Diagram-to-Code from frame content.
- Text-to-Diagram chat workflow with persisted chat history.

### Embedding And Distribution

- Publish `@excalidraw/excalidraw` as a reusable package.
- Provide example integrations for Next.js and plain browser usage.

## Key Features

- Local drawing with autosave: the editor restores existing browser state on load and keeps scene/app state plus files persisted locally so refreshes and offline sessions remain useful.
- Realtime collaboration with external room infrastructure: the app can start or join a `#room=` session, sync scene/cursor/viewport updates over Socket.IO, and persist recovery state to Firebase.
- Encrypted share links: the app exports compressed encrypted scene payloads, uploads related assets separately, and keeps the decryption key client-side in the URL hash.
- AI-assisted workflows: users can trigger Text-to-Diagram and Diagram-to-Code flows, but both depend on an external AI backend and must fail without blocking core editing.
- Embeddable package integration: the repository ships `@excalidraw/excalidraw` plus example apps so the same editor runtime can be reused outside the hosted product.
- Browser-first resilience: the product prioritizes local-first behavior, approximate cross-tab freshness checks, and recoverable room state over strict server-authoritative orchestration.

## Main User Flows

### Flow: Local Drawing

1. User opens the app.
2. Existing local scene is restored if present.
3. User edits the canvas.
4. App autosaves elements, app state, and files in browser storage.

### Flow: Start Collaboration

1. User opens the Share dialog.
2. User starts a live session.
3. App generates room credentials and joins a Socket.IO room.
4. User copies or system-shares the room link.
5. Scene continues syncing while also saving recovery state to Firebase.

### Flow: Open Shared Scene

1. User opens a `#json=` link.
2. App fetches the encrypted payload from the share backend.
3. App decrypts and restores the scene locally.
4. User may be prompted before overwriting non-empty local content.

### Flow: AI Diagram-to-Code

1. User selects or works inside a frame.
2. App exports frame content to an image plus extracted text.
3. Payload is sent to the AI backend.
4. Generated HTML or code is returned for display or follow-up use.

## Non-goals

- No legacy-browser compatibility goal beyond the modern browsers supported by the repo's browserslist and package targets.
- No server-side decryption of shared scenes or collaboration room payloads; secrets stay client-side.
- No guarantee that AI features are always available; core editing must still work when the AI backend is unavailable.
- No built-in persistent collaboration server implementation in this repository; the client integrates with an external Socket.IO-compatible service.
- No mobile-native application target in this repository; the product is a browser app and a React package.

## Technical Limitations

- The hosted app must work as a static frontend bundle with external services.
- Collaboration depends on an external Socket.IO-compatible server that is not implemented in this repository.
- Share-link import/export depends on a separate backend that stores encrypted payloads.
- Remote scene and file persistence relies on Firebase services and corresponding project configuration.
- Local-first behavior introduces browser quota, recovery, and synchronization complexity.
- Privacy for shared scenes relies on correct client-side encryption and URL-fragment handling.

## Product Constraints

- Core editing must remain useful even if collaboration or AI services are unavailable.
- Decryption keys for shared scenes and rooms must stay client-side.
- Hosted-app integrations such as collaboration, share dialogs, AI, and Plus flows should not leak into the generic package API by default.

## Non-Functional Requirements

- Fast editing and acceptable network use for multi-user sessions.
- Reasonable offline resilience.
- Safe failure behavior when storage quotas, stale chunks, or clipboard restrictions occur.
- The published package must remain consumable as a React dependency with CSS import.

## Assumptions

- Assumption: the collaboration server is operated outside this repo and matches the event contract used by `Portal.tsx` and `Collab.tsx`.
- Assumption: the share-link backend stores encrypted opaque payloads only.
- Assumption: AI features are optional and non-blocking to the core editor experience.
- Assumption: Excalidraw+ links are intentional commercial funnel surfaces, not accidental references.

## Explicitly Observed Trade-Offs

- Local-first storage improves resilience but adds browser quota and sync complexity.
- Client-side encryption improves privacy posture but makes URL handling and key management critical.
- Collaboration prioritizes practical reconciliation over strict server authority.
- AI is integrated as a feature extension rather than a core dependency.