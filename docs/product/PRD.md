# Product Requirements Document

## Document status

- Type: reverse-engineered PRD
- Product: Excalidraw
- Source of truth: current repository code, configs, and internal docs
- Scope: hosted web app `excalidraw-app` plus embeddable React library `@excalidraw/excalidraw`

## 1. Product overview

### 1.1 Product goal

Excalidraw is a free collaborative whiteboard and diagramming product with a hand-drawn visual style. Its core product promise is fast visual thinking: users should be able to open the canvas, sketch diagrams immediately, share the result, and collaborate live without setup-heavy flows.

At the repository level, the product exists in two tightly related forms:

- a hosted browser app for end users
- an embeddable React editor for integration into other products

### 1.2 Product mission

Provide the fastest path from idea to sketch for diagrams, flows, whiteboard communication, and lightweight visual collaboration, while keeping the editor portable enough to be embedded into third-party applications.

### 1.3 Product positioning

Visible product positioning in the repository consistently describes Excalidraw as:

- `Excalidraw Whiteboard`
- `Free, collaborative whiteboard`
- `virtual collaborative whiteboard tool that lets you easily sketch diagrams that have a hand-drawn feel to them`
- `Excalidraw as a React component`

### 1.4 Product variants in scope

#### Hosted app

The hosted app is the full product shell around the editor core. It adds:

- welcome screen and app navigation
- file and scene flows
- sharing and live collaboration
- local persistence
- PWA installability and offline-friendly behavior
- product-specific integrations such as Excalidraw+ promotion and AI entry points

#### Embeddable library

The published package exposes Excalidraw as a reusable React component and integration surface for host applications. The minimal supported integration path is intentionally simple: import the CSS and render `<Excalidraw />` inside a container with non-zero height.

## 2. Product objectives

### 2.1 Primary objectives

- Minimize time to first sketch
- Make collaboration and sharing first-class flows, not secondary utilities
- Preserve the recognizable hand-drawn Excalidraw visual language
- Support both direct end-user usage and developer embedding without maintaining separate editor cores
- Keep user data portable via file export/import and share-link flows

### 2.2 Secondary objectives

- Support reliable local-first usage for single-user work
- Support installable app behavior on supported browsers
- Support extensibility via reusable library items, integrations, and host APIs
- Create upgrade paths into Excalidraw+ and AI-assisted workflows

## 3. Target audience

### 3.1 End users of the hosted app

#### Individual knowledge workers

Users who need to quickly express ideas visually without opening heavyweight diagramming tools:

- engineers
- architects
- product managers
- designers
- technical writers
- educators
- students

Typical jobs:

- sketch flows and architectures
- communicate ideas in meetings
- annotate concepts visually
- export diagrams as images or shareable scenes

#### Small collaborative groups

Users who need ad hoc real-time whiteboarding:

- remote teams
- workshop participants
- interviewers/interviewees
- pair-design and pair-engineering sessions

Typical jobs:

- collaborate in a shared room
- see remote cursors and selections
- exchange room links quickly
- use encrypted session links for temporary collaboration

### 3.2 Integrators and developers

Developers embedding Excalidraw into their own products.

Typical jobs:

- mount the editor as a React component
- initialize scenes programmatically
- connect the editor to host-side persistence or workflows
- reuse Excalidraw export helpers and UI building blocks
- run Excalidraw in client-only SSR setups such as Next.js

### 3.3 Expansion audience

Users with more advanced needs who may convert into adjacent offerings:

- users interested in comments or presentation workflows via Excalidraw+
- users interested in AI-assisted text-to-diagram or diagram-to-code capabilities

## 4. User problems

Excalidraw appears designed to solve these problems:

- Traditional diagramming tools are too slow for early-stage thinking
- Whiteboarding often requires sign-in, setup, or rigid structure before value is delivered
- Sharing diagrams often creates friction between local files, screenshots, and collaborative sessions
- Lightweight drawing tools often lack persistence, export quality, or reusable integration APIs
- Teams need a browser-based collaboration surface with low ceremony and privacy-oriented messaging

## 5. Core product requirements

### 5.1 Fast canvas entry

The product must let users start drawing immediately after opening the app.

Requirements inferred from the app shell:

- The editor loads directly on app entry
- The welcome screen provides immediate guidance instead of blocking the canvas
- The welcome screen highlights key actions:
  - menu
  - toolbar
  - help
  - load scene
  - live collaboration
- On mobile and first-interaction flows, onboarding hints should disappear once the user engages with the canvas

### 5.2 Scene and document workflows

The product must support practical scene lifecycle operations for both casual and repeat use.

Required capabilities:

- load scene
- save to active file
- export
- save as image
- clear canvas
- search and command palette access to app-level actions
- import/export of Excalidraw scene formats
- file handling support for `.excalidraw` and JSON-based scene inputs

### 5.3 Live collaboration

The product must support real-time multi-user collaboration in browser-based rooms.

Required capabilities:

- start a collaboration session from multiple UI entry points
- join via room links
- sync scene changes in real time
- show collaborator presence signals
- support pointer and selection visibility
- allow session termination by the initiating user
- expose privacy-oriented collaboration messaging in the UI
- copy and optionally native-share room links
- render a QR code for easier room joining on secondary devices

### 5.4 Shareable scene links

The product must support non-live sharing through backend-generated links.

Required capabilities:

- generate a shareable link for a scene
- restore a shared scene from a URL
- keep the encryption key in the URL hash instead of sending it to the server
- upload associated binary files separately when needed
- handle oversized share payloads gracefully

### 5.5 Local-first reliability

The product must remain useful for single-user work without requiring collaboration infrastructure.

Required capabilities:

- persist scene data locally in the browser
- persist binary files locally
- synchronize browser tabs when local state changes
- warn when storage quota is exceeded
- avoid unsafe or wasteful local writes during certain runtime states such as hidden tabs or active collaboration modes

### 5.6 Library and reusable content

The product must support reusable drawing assets.

Required capabilities:

- maintain a user library of reusable items
- import library items
- merge and persist library data
- insert reusable drawing snippets into scenes

### 5.7 Personalization and accessibility-oriented UX basics

The product must support basic personalization and global usage needs.

Required capabilities:

- theme switching including system theme
- language switching
- help and discoverability entry points
- responsive/mobile-aware behavior

### 5.8 Export and portability

The product must support getting drawings out of the system.

Required capabilities:

- image export
- JSON serialization for scenes and libraries
- programmatic export helpers for host apps
- clipboard and SVG/canvas-related export helpers in the public package surface

### 5.9 Embeddable editor API

The product must expose a stable enough integration surface for host applications.

Required capabilities:

- React component embedding
- client-only rendering path for SSR frameworks
- host-facing imperative API
- host-controlled initialization and scene updates
- exported helpers for serialization, export, library handling, and selected editor utilities

### 5.10 Advanced and growth features

These appear as secondary but real product capabilities in the repo:

- AI text-to-diagram flow
- diagram-to-code generation
- Mermaid-related flows
- Excalidraw+ export and promotional entry points
- comments and presentations promos in the app sidebar

These should be treated as extensions of the core whiteboard product, not its primary value proposition.

## 6. UX requirements

### 6.1 Multiple entry points for important actions

Key intents should be reachable from more than one place.

Explicitly visible examples:

- collaboration from welcome screen, main menu, top-right trigger, and command palette
- help from hints and menu
- scene actions from both menus and command surfaces

### 6.2 Progressive enhancement

The app should use richer platform features only when supported.

Examples visible in code/config:

- native share API only when available
- PWA install behavior only when browser support exists
- AI capabilities depend on backend configuration

### 6.3 Trust and privacy cues

The product should visibly communicate privacy-oriented behavior in collaboration and sharing flows.

Observed UX cues:

- privacy copy in the share/collaboration dialog
- encrypted transport and encrypted share-link model reflected in the UX language
- link structure that keeps keys in URL hash fragments

## 7. Non-goals

The repository suggests these are not the primary goals of the core product:

- becoming a heavyweight enterprise diagram suite with rigid document modeling
- requiring account creation before first use
- coupling the editor only to the hosted web app
- making AI the primary entry point instead of drawing/collaboration
- limiting the product to a demo instead of a reusable integration platform

## 8. Technical constraints

### 8.1 Platform and runtime constraints

- The repository is a Yarn monorepo with separate app, packages, and examples
- The hosted app is browser-first and client-rendered
- The embeddable package is React-based and expects host-side CSS import plus a container with non-zero height
- SSR frameworks require client-only rendering patterns
- The workspace expects Node.js `>=18.0.0`

### 8.2 Architecture constraints

- The hosted product shell composes around a reusable editor core instead of forking it
- App-level state and editor-level state are intentionally isolated via separate Jotai stores
- The editor exposes an imperative API before full initialization, so host integrations must respect lifecycle ordering
- Core runtime responsibilities are split across scene management, rendering, store/delta capture, history, and action dispatch subsystems

### 8.3 Collaboration constraints

- Real-time collaboration uses a hybrid model:
  - socket-based transport for low-latency updates
  - Firebase-backed durable persistence for room state and files
- Collaboration links encode `roomId` and `roomKey` in the URL hash
- Socket payloads are encrypted before emission
- Collaboration behavior is implemented as an implicit runtime state machine spread across several flags and timers
- Collaboration correctness depends on room initialization ordering, reconciliation, and file-fetch flows

### 8.4 Persistence constraints

- Local persistence is split across `localStorage` and IndexedDB
- Elements and filtered app state are stored separately from heavier binary assets
- Save flows are debounced
- Saving may be paused when the document is hidden or when collaboration locks local save
- Persistence correctness depends on coordination between local save, tab sync, Firebase room save, and file-status tracking

### 8.5 Deployment and PWA constraints

- The hosted app is configured as a PWA with service worker registration and runtime caching
- The manifest includes standalone display behavior, file handlers, and a share target
- Build configuration explicitly chunks locales and some heavy dependencies for caching/runtime behavior
- Offline behavior is optimized but not equivalent to a fully disconnected collaboration stack

### 8.6 Backend and environment constraints

The hosted app depends on environment configuration for several capabilities:

- backend share-link endpoints
- collaboration WebSocket server
- collaboration portal URL
- Firebase configuration
- AI backend
- Excalidraw+ app and landing-page URLs
- optional Sentry and dev-mode flags

### 8.7 Browser support constraints

The package manifest explicitly excludes older browsers such as:

- IE 11 and below
- Safari below 12
- Edge below 79
- Chrome below 70
- selected low-capability mobile browsers

### 8.8 Known implementation risks and documentation gaps

Important runtime behavior is more complex than the public product surface suggests.

Current repo evidence shows risk around:

- collaboration lifecycle state handling
- scene bootstrap and URL/hash re-initialization order
- persistence ownership across local/browser/Firebase layers
- distinction between editor mount and editor initialization
- module-scope side effects during app startup

These are not necessarily product defects, but they are real implementation constraints for future roadmap work.

## 9. Success criteria

The repository implies the product is successful when:

- a user can open the app and begin drawing immediately
- a user can reliably save, export, or restore a scene
- multiple users can collaborate through a room link with visible live presence
- a user can create a shareable scene link without exposing the decryption key to the server
- the app remains usable across reloads, tabs, and installable-browser contexts
- developers can embed the same editor core in third-party React applications

## 10. Scope boundaries for future roadmap decisions

When evolving the product, the following boundary appears important:

- preserve a shared editor core for both hosted app and embeddable package
- keep collaboration and sharing prominent in the hosted UX
- avoid introducing features that materially slow first interaction with the canvas
- treat AI and Excalidraw+ upsell surfaces as additive layers over the core whiteboard value
- document runtime orchestration contracts before making large collaboration or bootstrap changes

## 11. Evidence base

This PRD was inferred from repository artifacts including:

- `excalidraw-app/index.html`
- `excalidraw-app/App.tsx`
- `excalidraw-app/components/AppWelcomeScreen.tsx`
- `excalidraw-app/components/AppMainMenu.tsx`
- `excalidraw-app/components/AppSidebar.tsx`
- `excalidraw-app/components/AI.tsx`
- `excalidraw-app/share/ShareDialog.tsx`
- `excalidraw-app/data/index.ts`
- `excalidraw-app/data/LocalData.ts`
- `excalidraw-app/vite.config.mts`
- `excalidraw-app/vite-env.d.ts`
- `packages/excalidraw/README.md`
- `packages/excalidraw/package.json`
- `docs/memory/projectbrief.md`
- `docs/memory/productContext.md`
- `docs/memory/decisionLog.md`
- `docs/technical/architecture.md`
- `docs/technical/undocumented-behavior-audit.md`

## 12. Open interpretation notes

Because this document is reverse-engineered from source code rather than product interviews, some items should be treated as inferred product intent rather than formally approved roadmap commitments.

Most notably:

- AI and Excalidraw+ features are clearly present, but appear secondary to the core whiteboard/editor proposition
- the repo supports both hosted usage and embedding, so product strategy spans both end-user and developer-facing value
- some runtime constraints are better documented by implementation evidence than by formal product documentation

