# Decision Log

## Scope

- Цей файл фіксує ключові рішення, які можна прямо вивести з поточного source code/configs.
- Це не історія обговорень, а стислий log поточної форми системи.

## Architecture decisions

### 1. Репозиторій організовано як Yarn monorepo

- Root package оголошує workspace-структуру:
  - `excalidraw-app`
  - `packages/*`
  - `examples/*`
- З цього випливає рішення тримати app, reusable packages і integration examples в одному репозиторії.

### 2. Локальна розробка й тести працюють напряму по source packages

- `tsconfig.json`, `vitest.config.mts` і `excalidraw-app/vite.config.mts` всі маплять `@excalidraw/*` imports на локальні `src`/`index.tsx` файли.
- Отже рішення: не покладатися на попередньо зібрані артефакти для dev/test loop.

### 3. Hosted app будується як integration layer над reusable editor package

- `excalidraw-app/App.tsx` вбудовує `<Excalidraw>` і навішує app-specific UI (`AppMainMenu`, `ShareDialog`, `AppSidebar`, `Collab`, `AIComponents`).
- `packages/excalidraw/index.tsx` окремо експортує reusable editor component і host-facing helpers.
- Отже рішення: editor core і product shell розділені.

### 4. Public package shape — ширший за один компонент

- `@excalidraw/excalidraw` exports включають не лише `Excalidraw`, а й hooks, menu/footer/sidebar компоненти, export helpers, library helpers, AI/TTD pieces, chart helpers.
- Отже рішення: package designed as extensible platform API, а не як single-widget black box.

## State / runtime decisions

### 5. Для app shell і editor internals використано окремі Jotai stores

- `excalidraw-app/app-jotai.ts` створює `appJotaiStore`.
- `packages/excalidraw/editor-jotai.ts` створює ізольований `editorJotaiStore` через `jotai-scope`.
- `packages/excalidraw/index.tsx` обгортає editor в `EditorJotaiProvider`, а `excalidraw-app/App.tsx` — app у власний `Provider`.
- Отже рішення: ізолювати app-level state від editor-level state.

### 6. API editor instance навмисно доступний і всередині, і поза tree

- `ExcalidrawAPIProvider` створений саме для того, щоб `useExcalidrawAPI()` працював поза `<Excalidraw>` tree.
- `excalidraw-app/App.tsx` використовує цей provider на верхньому рівні app shell.
- Отже рішення: imperative/editor API — first-class integration mechanism.

## Collaboration / persistence decisions

### 7. Collaboration побудовано як hybrid model: sockets для realtime + Firebase для durable state/files

- `Portal.tsx` тримає socket session і broadcast logic.
- `Collab.tsx` зберігає room/files через Firebase helpers (`saveToFirebase`, `loadFilesFromFirebase`, `saveFilesToFirebase`).
- Отже рішення: розділити low-latency transport і durable persistence.

### 8. Room links містять client-side room key у hash

- `data/index.ts` формує links у форматі `#room=<roomId>,<roomKey>`.
- `getCollaborationLinkData()` валідує довжину key з URL hash.
- Отже рішення: ключ шифрування живе в URL fragment, а не в server-side route params.

### 9. Socket payloads шифруються перед відправкою

- `Portal._broadcastSocketData()` серіалізує payload, кодує його і викликає `encryptData()` перед `socket.emit()`.
- Отже рішення: collaboration transport не надсилає scene updates у plaintext.

### 10. Sync оптимізовано інкрементально, але з повним resync як safety net

- `Portal.broadcastScene()` надсилає лише `syncableElements`, яких бракує або чия `version` виросла.
- Коментар у коді прямо пояснює periodic/full resync як захист від divergence.
- Отже рішення: bandwidth optimization + consistency fallback.

### 11. Local persistence поділено між `localStorage` та `indexedDB`

- `LocalData.ts` прямо документує, що full data state зберігається локально в різних storage.
- Elements/appState йдуть у `localStorage`, files/library — у `indexedDB` через `idb-keyval`.
- Отже рішення: cheap synchronous state окремо від heavier binary/library storage.

### 12. Local saves debounced і можуть блокуватися lock-механізмом

- `LocalData._save` загорнутий у `debounce`.
- `LocalData` має `pauseSave`, `resumeSave`, `isSavePaused`, які враховують `document.hidden` і `Locker`.
- Отже рішення: зменшити churn і уникати небажаних local writes у певних режимах.

## Product / UX decisions

### 13. Sharing і collaboration винесені в основний app chrome

- `ShareDialog`, `LiveCollaborationTrigger` і custom command palette items підключені прямо в `excalidraw-app/App.tsx`.
- Отже рішення: share/collab — core product flow, а не secondary plugin.

### 14. Hosted app додає product-specific shell, не форкаючи editor core

- Main menu, welcome screen, sidebar, footer, promo banner, AI components підключаються як children/adjacent UI до `<Excalidraw>`.
- Отже рішення: кастомізація через composition, а не через копіювання editor implementation.

### 15. PWA/offline support — explicit product choice

- App entrypoint викликає `registerSW()`.
- `VitePWA` налаштований з runtime caching для fonts, locales і lazy chunks.
- Manifest містить standalone display, file handlers і share target.
- Отже рішення: app optimized for installability/offline-ish usage, не лише для ephemeral web page.

### 16. Інтеграція в host apps має бути client-first і мінімалістичною

- README вимагає CSS import і parent container з ненульовою висотою.
- README та `examples/with-nextjs/src/excalidrawWrapper.tsx` показують client-only usage для SSR frameworks.
- `examples/with-script-in-browser/index.tsx` показує окремий browser-script embed path.
- Отже рішення: підтримувати кілька verified host integration patterns, але тримати базовий setup простим.

## Implementation constraints visible in code

### 17. Частина API/architecture ще не вважається остаточно закритою

- У `packages/excalidraw/index.tsx` є `FIXME` про normalization defaults для `UIOptions` memo comparison.
- У `packages/excalidraw/types.ts` є `TODO` про move частини app state до interactive canvas.
- Це означає, що навколо editor API/state все ще допускається еволюція.

### 18. У runtime є behavior, який код реалізує детальніше, ніж це наразі відбито в docs

- Collaboration / bootstrap / persistence / editor readiness у коді реалізовані як orchestration contracts, а не лише як static module boundaries.
- Що робить код:
  - `excalidraw-app/collab/Collab.tsx` + `Portal.tsx` реалізують collaboration як implicit state machine з кількох прапорів і фаз (`isCollaboratingAtom`, `socket`, `socketInitialized`, room identity, timers, version tracking).
  - `excalidraw-app/App.tsx` реалізує bootstrap/re-bootstrap сцени як order-sensitive flow, що залежить від URL/hash, local state, collab link, confirm dialog, `document.hidden`, `focus` і browser history mutations.
  - `excalidraw-app/data/LocalData.ts`, `data/firebase.ts`, `data/fileStatusStore.ts` і `App.tsx` разом утворюють distributed persistence model з pause/resume local save, tab sync і окремим file readiness channel.
  - `packages/excalidraw/components/App.tsx` розводить `onMount` і `onInitialize`: editor API доступний раніше, ніж editor доходить до fully initialized state.
- Що задокументовано:
  - `docs/technical/architecture.md` добре покриває workspace structure, runtime layers, основні data flows і ownership boundaries.
  - Поточний `decisionLog.md` уже фіксує high-level рішення про hybrid collab model, local persistence split, Jotai stores, host integration shape і PWA support.
- Розрив:
  - documentation описує architecture і high-level flows, але не фіксує явно runtime contracts: collaboration state transitions, bootstrap decision table, local-vs-collab persistence semantics, readiness contract `onMount` vs `onInitialize`, import-time side effects.
- Отже рішення:
  - вважати `docs/technical/undocumented-behavior-audit.md` деталізованим джерелом для цього розриву;
  - трактувати undocumented behavior як documentation gap на рівні runtime orchestration, а не як відсутність architecture docs взагалі;
  - наступними цільовими docs вважати `collaboration-lifecycle`, `scene-bootstrap-flow`, `persistence-ownership`, `editor-lifecycle-contract`.

## Details
For detailed architecture → see docs/technical/architecture.md
For domain glossary → see docs/product/domain-glossary.md
