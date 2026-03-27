# Reverse-Engineered PRD

## Product Purpose

Provide a fast, zero-setup, browser-based collaborative whiteboard for creating informal hand-drawn-style diagrams, wireframes, and sketches — embeddable as a React component for third-party applications.

## Problem Statement

Teams and individuals need a fast, low-friction way to create informal diagrams, wireframes, and sketches collaboratively. Existing tools are either too heavyweight (Figma, Visio) or lack real-time collaboration (pen and paper). Excalidraw fills the gap with a browser-based whiteboard that feels like drawing on paper.

## Target Audience

- **Solo Developer** — quick architecture diagrams, flowcharts, wireframes for personal use
- **Remote Team Member** — real-time collaborative system design during video calls
- **Technical Writer / Blogger** — hand-drawn-style diagrams for articles and docs
- **Embedded App Developer** — integrates `@excalidraw/excalidraw` as a whiteboard component

## User Personas

- **Solo Developer**: Quickly sketches architecture diagrams, flowcharts, or UI wireframes for personal reference or documentation
- **Remote Team Member**: Collaborates in real-time with teammates on system designs during video calls
- **Technical Writer / Blogger**: Creates hand-drawn-style diagrams for articles and documentation
- **Embedded App Developer**: Integrates a whiteboard component into their own web application using the `@excalidraw/excalidraw` npm package

## Core Use Cases

### Drawing

- Create shapes: rectangles, diamonds, ellipses, lines, arrows, freedraw, text
- Insert images (paste, drag-drop, or file picker)
- Embed external content (iframes, videos)
- Frame elements into logical groups
- Style elements: stroke color, fill, opacity, font, roughness, roundness
- Lock/unlock elements, group/ungroup
- Align and distribute elements
- Z-index ordering (bring to front, send to back)
- Snap to grid and object snapping

### Collaboration

- Share via link with end-to-end encryption (see `excalidraw-app/data/encryption.ts`)
- Real-time cursor and pointer syncing
- Follow mode: follow a collaborator's viewport
- Idle status detection (active → idle → away)
- Conflict-free reconciliation via version-based merging

### Sharing & Exporting

- Export to PNG, SVG, clipboard, or JSON file
- Share as encrypted link (room-based collaboration)
- Export to Excalidraw+ (premium hosted service)
- QR code generation for share links (see `excalidraw-app/share/qrcode.chunk.ts`)

### Embedding

- `<Excalidraw>` React component with extensive props API
- Imperative API for programmatic control
- Customizable UI: main menu, welcome screen, footer, sidebar
- Theme support (light/dark/system)
- Library management within embedded context

### Libraries

- Save element groups as reusable library items
- Import/export library files
- Load libraries from URL
- Persistent storage in IndexedDB

### Text-to-Diagram

- Mermaid syntax to Excalidraw conversion (see `@excalidraw/mermaid-to-excalidraw`)
- AI-powered text-to-diagram (TTD dialog)
- Command palette for keyboard-driven access

## Feature Inventory (by area)

### Canvas

- Infinite canvas with pan and zoom (see `AppState.scrollX/Y`, `AppState.zoom`)
- Grid mode with configurable size (see `AppState.gridSize`, `DEFAULT_GRID_SIZE`)
- View mode (read-only)
- Zen mode (distraction-free)
- Dark/light theme

### Tools (derived from `ToolType` in `packages/excalidraw/types.ts`)

- Selection, Lasso, Rectangle, Diamond, Ellipse, Arrow, Line, Freedraw, Text, Image, Eraser, Hand (pan), Frame, Magic Frame, Embeddable, Laser pointer

### Actions (derived from `ActionName` in `packages/excalidraw/actions/types.ts`)

- Clipboard: copy, cut, paste, copyAsPng, copyAsSvg, copyText, copyStyles, pasteStyles
- Z-index: sendBackward, bringForward, sendToBack, bringToFront
- Selection: selectAll, group, ungroup
- Transform: flipHorizontal, flipVertical, align, distribute
- History: undo, redo
- Canvas: clearCanvas, toggleGridMode, toggleZenMode, toggleViewMode, changeViewBackgroundColor
- UI: toggleStats, toggleSearchMenu, commandPalette

### Menus & Dialogs

- Main menu with file operations (see `excalidraw-app/components/AppMainMenu.tsx`)
- Welcome screen (see `excalidraw-app/components/AppWelcomeScreen.tsx`)
- Share dialog with link copy and QR code (see `excalidraw-app/share/ShareDialog.tsx`)
- Export dialog (image export, JSON export)
- TTD dialog (text-to-diagram, Mermaid)
- Help dialog, Settings, Command Palette

## Non-Goals / Constraints

- **Not a pixel-perfect design tool**: Excalidraw intentionally renders shapes with a hand-drawn aesthetic (Rough.js). It is not meant to compete with Figma, Sketch, or Illustrator for precise design work
- **Not a document editor**: No rich text formatting, tables, or page layout. Text elements are single-style blocks
- **No server-side rendering**: The canvas is entirely client-side; there is no server-side image generation or PDF export pipeline
- **No user accounts or auth**: The open-source version has no built-in user management. Collaboration rooms are anonymous; identity is handled only by Excalidraw+ (premium)
- **No native mobile app**: Browser-only (PWA for mobile, but no native iOS/Android application)
- **No version history / branching**: There is no built-in document versioning or branching. Undo/redo is session-scoped; once the page reloads, undo history is lost
- **No offline collaboration**: Collaboration requires a live Socket.IO connection. Offline mode supports local drawing only
- **No plugin/extension marketplace**: Tools are fixed at build time; there is no runtime plugin system for adding custom shapes or tools (though `customType` exists for embedding scenarios)

## Non-Functional Requirements

### Performance

- Canvas rendering throttled via `requestAnimationFrame` (`throttleRAF`)
- Element shape caching to avoid re-computation
- Memoized React components (`React.memo` on `Excalidraw`)
- Throttled collaboration updates: cursor sync at ~30fps (`CURSOR_SYNC_TIMEOUT = 33ms`)
- Image resizing via `pica` for performance

### Offline Support

- PWA with service worker (`public/service-worker.js`, `vite-plugin-pwa`)
- Local storage persistence for elements and appState
- IndexedDB for library storage
- Works without Firebase (collab features disabled)

### Internationalization

- 40+ locales managed via Crowdin (see `crowdin.yml`)
- i18next-browser-languagedetector for auto-detection (see `excalidraw-app/app-language/language-detector.ts`)
- Translation files in `packages/excalidraw/locales/`
- `t()` function for string translation (see `packages/excalidraw/i18n.ts`)

### Accessibility

- Keyboard shortcuts for all major operations (see `packages/excalidraw/actions/shortcuts.ts`)
- Command palette for discoverability
- Focus management for dialogs and menus

## Integration Points

- **Excalidraw+**: Premium hosted service — export via `ExportToExcalidrawPlus` component, auth cookie check (`isExcalidrawPlusSignedUser` in `excalidraw-app/app_constants.ts`)
- **Firebase**: Firestore for scene persistence, Storage for image files
- **Vercel**: Hosting with custom headers and redirects (see `vercel.json`)
- **Sentry**: Production error tracking (see `excalidraw-app/sentry.ts`)
- **Crowdin**: Localization pipeline

## Cross-References

- For architecture → see [`docs/technical/architecture.md`](../technical/architecture.md)
- For domain glossary → see [`docs/product/domain-glossary.md`](domain-glossary.md)
- For tech stack → see [`docs/memory/techContext.md`](../memory/techContext.md)
- For UX goals → see [`docs/memory/productContext.md`](../memory/productContext.md)
