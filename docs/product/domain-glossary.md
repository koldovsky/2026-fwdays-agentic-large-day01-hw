# Domain Glossary

Canonical product/domain terms used in this repository.

| Term | Definition in this project | Where used (key files) | Do not confuse with |
| --- | --- | --- | --- |
| `Element` | Product-level unit a user draws/edits on canvas (shape, text, arrow, frame, image, etc.). | `packages/excalidraw/components/App.tsx`<br>`packages/element/src/selection.ts`<br>`packages/element/src/mutateElement.ts` | Generic UI "element" in HTML/DOM; here it means a scene object in Excalidraw data model. |
| `ExcalidrawElement` | Canonical serializable element union type used for scene storage/sync/import-export. | `packages/element/src/types.ts`<br>`packages/excalidraw/types.ts`<br>`packages/excalidraw/data/restore.ts` | React component instances or DOM nodes. |
| `Scene` | In-memory container of ordered elements (including deleted) with caches and render invalidation nonce. | `packages/element/src/Scene.ts`<br>`packages/excalidraw/data/restore.ts`<br>`packages/excalidraw/data/reconcile.ts` | A static exported PNG/SVG or a single element. |
| `AppState` | Runtime editor UI/interaction state (active tool, selection, zoom, dialogs, export flags, etc.). | `packages/excalidraw/types.ts`<br>`packages/excalidraw/appState.ts`<br>`packages/excalidraw/components/App.tsx` | Persisted scene elements; `AppState` is not the full scene data by itself. |
| `Tool` (`ToolType`, `activeTool`) | Current drawing/interaction mode chosen by user (selection, arrow, text, eraser, hand, etc.). | `packages/excalidraw/types.ts`<br>`packages/excalidraw/appState.ts`<br>`packages/excalidraw/components/MobileToolBar.tsx` | `Action`; tools represent mode, actions represent commands/events. |
| `Action` | Command abstraction for editor operations with keyboard bindings, predicates, and `perform` handler. | `packages/excalidraw/actions/types.ts`<br>`packages/excalidraw/actions/manager.tsx`<br>`packages/excalidraw/actions/register.ts` | Tool mode or arbitrary callback; action is a registered command contract. |
| `Collaboration` (`Collab`) | Live multi-user editing flow: room transport, presence, sync, and remote update application. | `excalidraw-app/collab/Collab.tsx`<br>`excalidraw-app/collab/Portal.tsx`<br>`packages/excalidraw/data/reconcile.ts` | One-time share/import link flow without active co-editing. |
| `Library` | Reusable user-managed collection of items inserted into scenes and persisted via adapters/storage. | `packages/excalidraw/data/library.ts`<br>`packages/excalidraw/components/LibraryMenu.tsx`<br>`packages/excalidraw/types.ts` | Scene content itself; library is a separate reusable inventory. |
| `LibraryItem` | Typed reusable entry in library storage (metadata + non-deleted element payload). | `packages/excalidraw/types.ts`<br>`packages/excalidraw/data/library.ts`<br>`packages/excalidraw/components/LibraryMenuSection.tsx` | Runtime selection state of currently selected canvas elements. |
| `CaptureUpdateAction` | Store/history capture mode controlling whether update is undoable now, later, or never. | `packages/excalidraw/types.ts`<br>`packages/element/src/store.ts`<br>`packages/excalidraw/history.ts` | User-facing tool/action names; this is internal state-history semantics. |
| `Restore` | Normalization/migration step for incoming scene/app payloads before runtime use. | `packages/excalidraw/data/restore.ts`<br>`packages/excalidraw/data/json.ts`<br>`packages/excalidraw/data/blob.ts` | `Reconcile`, which resolves local-vs-remote merge outcomes after restore. |
| `Reconcile` | Merge policy deciding how incoming and local elements/app state converge. | `packages/excalidraw/data/reconcile.ts`<br>`packages/excalidraw/components/App.tsx`<br>`excalidraw-app/collab/Collab.tsx` | Generic schema migration/validation without conflict resolution. |

## Notes
- If a term is changed or overloaded in new product work, update this glossary first and then align related product docs.
