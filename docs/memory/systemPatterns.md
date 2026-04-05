# Excalidraw: System Patterns

## Архітектурний зріз

- Архітектура поділена на:
  - reusable editor library (`packages/excalidraw`),
  - модель елементів/сцени (`packages/element`),
  - shared utility/math шари (`packages/common`, `packages/math`, `packages/utils`),
  - product shell (`excalidraw-app`) для app-інтеграцій.
- `excalidraw-app` монтує app-компонент, а сам редактор приходить із `@excalidraw/excalidraw`.
- Патерн: "core editor + app composition", де app додає інфраструктуру навколо core.

## Ключовий патерн стану

- У core редакторі головний контейнер — `class App extends React.Component<AppProps, AppState>`.
- `AppState` роздається через React context:
  - `ExcalidrawAppStateContext`,
  - `ExcalidrawSetAppStateContext`.
- Модель сцени винесена в окремий `Scene` клас (`packages/element/src/Scene.ts`):
  - тримає елементи (включно/без видалених),
  - індекси/мапи елементів,
  - кеші (наприклад для selection),
  - callbacks/subscriptions на зміни.
- Jotai використовується як допоміжний шар:
  - `editor-jotai` у бібліотеці,
  - `app-jotai` у `excalidraw-app` (зокрема для collab atoms).

## Патерн рендерингу

- `Renderer` отримує `Scene` і рахує renderable + visible елементи для viewport.
- Важливе розділення:
  - static scene rendering (`renderer/staticScene.ts`),
  - interactive UI rendering (`renderer/interactiveScene.ts`).
- Патерн оптимізації:
  - memoization,
  - throttling (`renderStaticSceneThrottled`),
  - пропуск елементів, які тимчасово редагуються, з конкретних шарів рендера.

## Патерн action system

- У `packages/excalidraw/actions/*` дії винесені в окремий шар команд.
- Центральний оркестратор — `ActionManager`:
  - реєструє actions через `registerAction()` / `registerAll()`,
  - виконує їх у відповідь на UI events та keyboard shortcuts,
  - перевіряє доступність дій залежно від `AppState` і UI options.
- Патерн корисний тим, що відділяє:
  - intent користувача ("zoom", "delete", "toggle grid"),
  - правила доступності дії,
  - зміну `elements` / `appState`,
  - повторне використання дій з різних UI-точок.
- Це одна з ключових Excalidraw-специфічних абстракцій, а не просто загальний React event handling.

## Патерн history / undo-redo

- Історія винесена в окремий модуль `history.ts`, а не захардкоджена в React state.
- `History` зберігає `undoStack` і `redoStack`, а записи будуються як deltas (`HistoryDelta`) поверх store snapshot.
- Undo/redo застосовує зміни до `elements` і `appState`, але спеціально не переносить `version` / `versionNonce`, щоб історичні дії залишалися сумісними з collaboration-моделлю.
- Окреме правило: redo stack не скидається на чисто appState-змінах без змін елементів.

## Патерн restore / reconcile pipeline

- Вхідні дані не вважаються валідними "як є"; Excalidraw проганяє їх через шар нормалізації.
- `restore.ts`:
  - відновлює `elements` і `appState`,
  - нормалізує legacy/часткові дані,
  - відсікає непідтримувані або невалідні стани.
- `reconcile.ts`:
  - зводить local і remote elements,
  - не дає remote-версії перетерти елемент, який локально редагується,
  - детерміністично вирішує конфлікти через `version` / `versionNonce`,
  - після merge перевпорядковує і валідовує fractional indices.
- Це критичний шар для import/export, collaboration і backward compatibility.

## Патерн експорту

- Вхідна точка експорту: `packages/excalidraw/data/index.ts`.
- Послідовність:
  - `prepareElementsForExport` (відбір/нормалізація елементів, selection/frame логіка),
  - `exportToSvg` або `exportToCanvas`,
  - опційно вбудовування scene metadata в PNG (`serializeAsJSON` + PNG metadata).
- Підтримуються сценарії:
  - save to file (PNG/SVG),
  - copy to clipboard (PNG/SVG),
  - експорт лише selection або повного canvas.

## Патерн персистентності (app-рівень)

- `LocalData` відповідає за локальне збереження DataState.
- Розподіл стореджів:
  - `localStorage` для елементів + app state,
  - IndexedDB (`idb-keyval`) для binary files.
- Запис виконується через debounce (`LocalData.save`) і може pause/resume залежно від стану вкладки/блокувань.
- Є окреме очищення застарілих файлів за евристикою `lastRetrieved`.

## Патерн binary files lifecycle

- Бінарні файли (здебільшого image assets) існують окремо від масиву `elements` як `BinaryFiles`.
- `FileManager` управляє їхнім життєвим циклом:
  - відстежує fetching / saving / saved / error стани,
  - вантажить файли за `fileId`,
  - зберігає лише ті файли, які реально прив'язані до елементів сцени,
  - оновлює статуси для UI та захищає від unload під час активного save.
- Це окремий системний патерн, бо файлова модель у Excalidraw не зводиться до одного JSON payload.

## Патерн collaboration (app-рівень)

- `Collab` (class component) інкапсулює lifecycle колаборації.
- Основні блоки:
  - синхронізація елементів (`reconcileElements`, версії сцени),
  - мережевий канал через `Portal` + `socket.io-client`,
  - робота з файлами/сценою у Firebase,
  - трекінг collaborator state (карта користувачів, presence/cursor signals).
- Отже, collaboration не "зашитий" у базовий npm API як обов'язкова частина, а реалізований на app-шарі.

## Архітектурні наслідки для розробки

- Зміни, що стосуються геометрії/елементів/сцени, зазвичай починаються в `packages/element` + `packages/excalidraw`.
- Product-features (Firebase/collab/persistence policy) природно вносяться у `excalidraw-app`.
- При інтеграційному тестуванні важливо розуміти межу "core behavior" vs "app behavior".

## Верифіковано по source code

- `packages/excalidraw/components/App.tsx` — core state container + contexts.
- `packages/element/src/Scene.ts` — scene model/cache/callbacks.
- `packages/excalidraw/scene/Renderer.ts`, `packages/excalidraw/renderer/staticScene.ts`, `packages/excalidraw/renderer/interactiveScene.ts` — rendering pipeline.
- `packages/excalidraw/actions/manager.tsx`, `packages/excalidraw/actions/*`, `packages/excalidraw/types.ts` — action system і API hooks.
- `packages/excalidraw/history.ts` — history / undo-redo stack model.
- `packages/excalidraw/data/restore.ts`, `packages/excalidraw/data/reconcile.ts` — restore / reconcile pipeline.
- `packages/excalidraw/data/index.ts`, `packages/excalidraw/scene/export.ts` — export flow.
- `excalidraw-app/data/LocalData.ts` — local persistence split.
- `excalidraw-app/data/FileManager.ts`, `packages/excalidraw/types.ts` — binary files lifecycle.
- `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/Portal.tsx`, `excalidraw-app/data/firebase.ts` — collaboration/network/cloud.
