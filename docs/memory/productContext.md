# Product context — UX goals and scenarios

## Main UX goals (inferred from implementation)

- **Fast start without training:** an empty canvas shows a **welcome screen** with hints (center, menu, toolbar, help) to lower the barrier for new users.
- **Comfortable drawing and editing:** tools, sidebars, footer, mobile bar (`LayerUI`, `MobileMenu`) — different **form factors** (desktop / phone) with distinct UI composition.
- **Collaboration:** **Live collaboration** / “Share” control with participant count; sharing and collab dialogs in `excalidraw-app`.
- **Clarity and feedback:** toasts, **scroll back to content** when panned away from the canvas, collaboration error handling (`CollabError` + tooltip).
- **Export and distribution:** image export from the editor; app-level flows such as **Excalidraw Plus** (`ExportToExcalidrawPlus`, dedicated route `ExcalidrawPlusIframeExport`).
- **Offline and installability:** **PWA** (`registerSW` in `excalidraw-app/index.tsx`), split locale chunks for caching and first load (`vite.config.mts`).
- **Internationalization:** many locales plus language detection in the app (`i18next-browser-languagedetector` in `excalidraw-app` dependencies).

## Key user scenarios

| Scenario | What happens in the product (code) |
|----------|-----------------------------------|
| First open | `showWelcomeScreen` + empty canvas → `WelcomeScreen` hints / tunnels in `LayerUI` |
| Drawing a diagram | Canvas editor `App` in `packages/excalidraw`, shape library, undo/redo (via action manager) |
| Share / collab | `ShareDialog`, `Collab.tsx`, `socket.io-client`; in an **iframe**, collab is off (`isCollabDisabled = isRunningInIframe()`) |
| Export | `onExportImage` in the UI layer; plus custom exports in `excalidraw-app` |
| Shape library | `useHandleLibrary` + IndexedDB in shell `App.tsx` |
| Theme / viewing comfort | `useHandleAppTheme`, zen mode, view mode (flags on `ExcalidrawProps` / editor state) |
| Text to diagram (Mermaid, etc.) | **TTD** module (`TTDDialog`, dependency `@excalidraw/mermaid-to-excalidraw`) |

## UX constraints encoded in code

- **Embedded iframe:** collaboration disabled by design (`App.tsx` → `isRunningInIframe()`).
- **Phone:** welcome center renders in a different container (`MobileMenu` vs `LayerUI`) to align with the bottom bar.

## Sources in code

- `packages/excalidraw/components/App.tsx` — `renderWelcomeScreen` condition, `onExportImage`.
- `packages/excalidraw/components/welcome-screen/WelcomeScreen.tsx`, `LayerUI.tsx`, `MobileMenu.tsx`.
- `packages/excalidraw/components/live-collaboration/LiveCollaborationTrigger.tsx`.
- `excalidraw-app/App.tsx` — theme, library, iframe / collab.
- `excalidraw-app/share/ShareDialog.tsx`, `excalidraw-app/collab/Collab.tsx`.
- `excalidraw-app/index.tsx` — PWA.
- `excalidraw-app/vite.config.mts` — locale chunking strategy.
