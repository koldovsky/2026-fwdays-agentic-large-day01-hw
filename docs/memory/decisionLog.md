# Decision Log

## 2026-03-26 — Additional undocumented behavior findings

### 1) Save pipeline has sticky error state (implicit state machine)
- **File:** `excalidraw-app/data/FileManager.ts`
- **Marker:** `NOTE if errored during save, won't retry due to this check`
- **What is implicit:** file lifecycle is tracked via in-memory maps (`savingFiles`, `savedFiles`, `erroredFiles_save`), but retry semantics are encoded indirectly by map membership/version checks.
- **Risk:** once a file hits save error, subsequent saves may silently skip retry, causing persistent divergence between canvas state and persisted files.

### 2) UI defaults normalization mutates memo comparison contract (non-obvious side effect)
- **File:** `packages/excalidraw/index.tsx`
- **Marker:** `FIXME normalize/set defaults in parent component so that the memo resolver compares the same values`
- **What is implicit:** component locally rewrites/normalizes `UIOptions` during render before downstream use.
- **Risk:** referential and semantic equality can change unexpectedly, producing hard-to-predict rerenders/behavior differences depending on prop shape and initialization order.

### 3) Collaboration startup has fallback-driven init ordering dependency
- **File:** `excalidraw-app/collab/Collab.tsx`
- **Marker:** fallback init path around `connect_error` (`fallbackInitializationHandler`)
- **What is implicit:** collaboration startup is controlled by event timing (`socket.open` + `connect_error` + fallback room initialization), while save is paused before socket setup.
- **Risk:** if event order differs (late error, reconnect edge, partial init), scene bootstrap and persistence lock lifecycle can diverge, causing hard-to-reproduce startup inconsistencies.
