# Product Context

## UX Summary
- Excalidraw is a browser-based whiteboard and diagramming tool with a low-friction canvas-first experience
- The product combines:
- Instant sketching and editing
- Local persistence
- Sharing and collaboration
- Export and publish flows
- Optional paths into Excalidraw+

## Primary User Experience Goals
- Let users start drawing immediately with minimal setup
- Keep the editor responsive and locally resilient
- Make collaboration easy to start from inside the canvas
- Support both solo work and lightweight shared workflows
- Provide familiar productivity affordances like search, help, command palette, theme switching, and file export

## Main User Scenarios
- Solo sketching:
- A user opens the app and starts drawing on the canvas right away
- The scene auto-persists locally through browser storage

- Load and continue work:
- A user loads an existing scene from disk or browser state
- The app restores scene data, app state, files, and library items when available

- Share a static snapshot:
- A user creates a shareable link for the current scene
- The app exports encrypted data to the backend and returns a URL for distribution

- Start live collaboration:
- A user creates a collaboration session and shares the room link or QR code
- Teammates join the same room and see synchronized edits and cursor presence

- Export work:
- A user saves to disk, exports as image, or uses product-specific export flows such as Excalidraw+

- Install as an app:
- A user on a supported browser can install the PWA from inside the app

## Key UX Entry Points
- Welcome screen:
- Promotes immediate action with load, help, and collaboration entry points
- Adapts messaging for signed-in vs guest users

- Main menu:
- Exposes load, save, export, collaboration, help, search, preferences, theme, language, and background options

- Top-right collaboration area:
- Shows collaboration trigger and collaboration error state
- On desktop, also shows Excalidraw+ promotion

- Share dialog:
- Lets users choose between live collaboration and a static shareable link
- During active collaboration, shows editable username, copy/share link actions, QR code, privacy messaging, and stop-session action

- Command palette:
- Surfaces power-user shortcuts for collaboration, share, theme toggle, install, social links, and Excalidraw+ actions

## Collaboration UX
- Collaboration is treated as a first-class in-editor workflow
- Users can:
- Start a session from the welcome screen, main menu, or command palette
- Copy or system-share the active room link
- Scan/share a QR code
- Set a display name
- Stop the session from the dialog or command palette
- The app also communicates important edge states such as offline collaboration warnings

## Persistence And Trust UX
- The app is designed to feel local-first
- Users benefit from:
- Automatic local saving
- Restoration of prior browser state
- Warnings when browser quota is exceeded
- Unload protection when file work is still pending

## Cross-Platform UX Notes
- Sharing adapts iconography for Apple, Windows, and generic browsers
- The app supports mobile/desktop form factors, with some UI differences such as top-right collaboration UI being hidden on mobile
- The product supports installability through PWA prompts when available

## Product Positioning Signals In UI
- Excalidraw is positioned as both:
- A standalone drawing/collaboration app
- A funnel into Excalidraw+ via welcome screen, menu, export actions, promo banner, and command palette links

## Source Verification
- This summary was verified against:
- `excalidraw-app/App.tsx`
- `excalidraw-app/components/AppWelcomeScreen.tsx`
- `excalidraw-app/components/AppMainMenu.tsx`
- `excalidraw-app/share/ShareDialog.tsx`
- `excalidraw-app/index.tsx`
- `excalidraw-app/vite.config.mts`
