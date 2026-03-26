# API Reference (Internal Mapping)

## Public Package Entry
- `packages/excalidraw/index.tsx`

## Key Public Exports (groups)
- React component and provider:
  - `Excalidraw`
  - `ExcalidrawAPIProvider`
- Hooks/context:
  - `useExcalidrawAPI`
  - `useExcalidrawStateValue`
  - `useOnExcalidrawStateChange`
- Data helpers:
  - `restore*`, `reconcileElements`, `serializeAsJSON`, `loadFromBlob`
- Export helpers:
  - `exportToCanvas`, `exportToBlob`, `exportToSvg`, `exportToClipboard`
- Scene helpers:
  - `zoomToFitBounds`, `getCommonBounds`, `getVisibleSceneBounds`

## Internal Orchestrator API Surface
`components/App.tsx` creates an imperative API with methods such as:
- `updateScene`, `applyDeltas`, `mutateElement`
- `getSceneElements*`, `getAppState`, `getFiles`
- subscriptions: `onChange`, `onIncrement`, `onStateChange`, `onEvent`
