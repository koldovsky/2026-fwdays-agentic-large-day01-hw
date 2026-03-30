## Currently active modules (signals from centrality/repo structure)
- **Web app root**: `excalidraw-app/App.tsx` (imports most top-level app concerns: collab, sharing, theme, dialogs, debug)
- **Collaboration**: `excalidraw-app/collab/Collab.tsx` (socket + Firebase + sync logic)
- **Sharing / backend integration**: `excalidraw-app/data/index.ts` (`exportToBackend`, `importFromBackend`, link parsing)
- **Firebase persistence**: `excalidraw-app/data/firebase.ts` (Firestore/Storage operations + encryption)
- **Core editor package**:
  - Main entry and provider: `packages/excalidraw/index.tsx`
  - Element store/deltas: `packages/element/src/store.ts`

## TODO / FIXME (sampled; not exhaustive)
- **Store capture risk**: “Suspicious that this is called so many places. Seems error-prone.” (packages/element/src/store.ts)
- **Theme updates**: “FIXME after we start emitting updates from Store for appState.theme” (packages/excalidraw/wysiwyg/textWysiwyg.tsx)
- **Flaky test**: “FIXME too flaky. No one knows why.” (packages/excalidraw/wysiwyg/textWysiwyg.test.tsx)
- **App import normalization**: “FIXME normalize/set defaults in parent component…” (packages/excalidraw/index.tsx)
- **Index.html legacy note**: “FIXME: remove this when we update CRA (fix SW caching)” (excalidraw-app/index.html)
- **Collab typing**: “TODO: `ImportedDataState` type here seems abused” (excalidraw-app/collab/Collab.tsx)
- **Vibe-coded note**: “TODO rewrite (mostly vibe-coded)” (packages/element/src/positionElementsOnGrid.ts)

## Recently changed areas (if visible)
- **Working tree**: untracked `.cursorignore`, `repomix-output.xml` (git status)
- **Recent commits**: `4451b1e updates`, `da795d2 check-instructions`, `5247322 initial` (git log)
- **File-level “recent edits”**: Not found in code (no per-file change metadata in repo snapshot)

## Known issues (from code/comments)
- **Potential memory leak** if pointer-up not triggered (packages/excalidraw/tests/selection.test.tsx)
- **Test flakiness** explicitly noted (packages/excalidraw/wysiwyg/textWysiwyg.test.tsx)

## Areas of complexity / risk
- **Collaboration correctness**:
  - Syncable element filtering and deleted element timeout (excalidraw-app/data/index.ts, excalidraw-app/app_constants.ts)
  - Reconciliation and versioning with durable vs ephemeral updates (packages/element/src/store.ts)
- **Crypto + link handling**:
  - Encryption key stored in hash, legacy decode fallback (excalidraw-app/data/index.ts)
- **Firebase rules**:
  - Firestore rules allow `get, write` for all documents; list disabled (firebase-project/firestore.rules)
  - Storage rules allow `get, write` for room/shareLink paths (firebase-project/storage.rules)

## Documentation references

**Product**

- [PRD](../product/PRD.md)
- [Domain glossary](../product/domain-glossary.md)

**Technical**

- [Architecture](../technical/architecture.md)
- [Developer setup](../technical/dev-setup.md)
- [Technical decision log](../technical/decisionlog.md)
