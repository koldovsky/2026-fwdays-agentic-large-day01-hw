# Domain glossary — Excalidraw monorepo

Словник доменних термінів **цього** репозиторію (`excalidraw-monorepo`): як вони означаються в коді та як їх не змішувати з повсякденними або загальними значеннями.

---

## Element

- **Визначення (у проєкті):** абстрактна одиниця вмісту полотна — запис про фігуру, текст, зображення тощо, з полями позиції, стилю, версійності та зв’язків. У розмовній мові часто кажуть «елемент сцени»; у TypeScript домінує тип **`ExcalidrawElement`**.
- **Де використовується:** `packages/element/src/types.ts` (база `_ExcalidrawElementBase`, union `ExcalidrawElement`), мутації `packages/element/src/mutateElement.ts`, тести `packages/element/tests/`, пакет `@excalidraw/element`.
- **Не плутати з:** DOM **Element** у браузері (`HTMLElement`); React **element** (вузол дерева React). У цьому проєкті «element» майже завжди стосується моделі Excalidraw, не DOM.

---

## ExcalidrawElement

- **Визначення (у проєкті):** головний union-тип усіх **логічних** типів елементів полотна (`rectangle`, `text`, `arrow`, `image`, `frame`, `iframe`, `embeddable` тощо). Екземпляр може мати `isDeleted: true` (сміттєзбір / історія); для елементів, які вважаються «живими» на полотні, використовують **`NonDeletedExcalidrawElement`**. За задумом тип має бути **JSON-серіалізованим**, без обчислюваних полів, щоб список можна було ділити між пірами та зберігати.
- **Де використовується:** `packages/element/src/types.ts` (коментар і `export type ExcalidrawElement`), імпорти в `packages/excalidraw/types.ts`, `packages/excalidraw/actions/types.ts`, `excalidraw-app/collab/Collab.tsx`.
- **Не плутати з:** назвою продукту **Excalidraw** або React-компонентом **`<Excalidraw>`**; з окремим підтипом (наприклад, лише `ExcalidrawTextElement`). `ExcalidrawElement` — це саме «будь-який елемент сцени» в одному типі, а не синонім «тільки видимі / не видалені».

---

## Scene

- **Визначення (у проєкті):** клас **`Scene`** у пакеті `@excalidraw/element`, який тримає колекцію елементів (масив + мапа), похідні списки **не видалених** (`nonDeletedElements`, `nonDeletedElementsMap`), кеш результатів **`getSelectedElements`** (`selectedElementsCache`) і **`sceneNonce`** — випадкове число для інвалідації кешу рендера (див. коментар у коді: не пов’язане з `version` елементів). **Видимість у вікні перегляду** зазвичай обчислює **`Renderer`**, а не `Scene`. Це не лише «картинка на екрані», а **об’єкт життєвого циклу та запитів** до елементів сцени.
- **Де використовується:** `packages/element/src/Scene.ts`, ініціалізація в `packages/excalidraw/components/App.tsx`, `packages/excalidraw/scene/Renderer.ts`.
- **Не плутати з:** словом **scene** у Three.js / ігрових рушіях (3D-сцена); з **static scene** як функцією рендера (`renderStaticScene` у `packages/excalidraw/renderer/staticScene.ts`) — це процедура/шар малювання, а не клас `Scene`.

---

## AppState

- **Визначення (у проєкті):** великий інтерфейс **`AppState`** у пакеті `excalidraw` — **стан редактора**, який не дублює повну модель кожного елемента, але містить UI й взаємодію: активний інструмент, зум, скрол, виділення, діалоги, колабораторів, тимчасові об’єкти під час drag/resize (`newElement`, `selectionElement`), налаштування експорту тощо.
- **Де використовується:** `packages/excalidraw/types.ts` (`export interface AppState`), `packages/excalidraw/data/restore.ts`, `packages/excalidraw/history.ts`, `packages/element/src/store.ts`, дії в `packages/excalidraw/actions/types.ts` (`ActionResult.appState`).
- **Не плутати з:** глобальним станом іншого застосунку-обгортки (наприклад **Redux**); у пакеті редактора ядро — React-клас **`App`** + `this.state` типу `AppState`. Окремо **Jotai** тримає частину UI-стану бібліотеки (`packages/excalidraw/editor-jotai.ts`, `EditorJotaiProvider` у `packages/excalidraw/index.tsx`) — це не те саме, що `AppState`. У `excalidraw-app` окремий спільний store **`appJotaiStore`** у **`excalidraw-app/app-jotai.ts`**; конкретні атоми (у т.ч. колаборації) оголошені в модулях застосунку, наприклад **`excalidraw-app/collab/Collab.tsx`**.

---

## Tool (`ToolType`, `ActiveTool`)

- **Визначення (у проєкті):** **`ToolType`** — union рядків режиму малювання/навігації (`selection`, `rectangle`, `arrow`, `hand`, `laser` тощо). **`ActiveTool`** — об’єкт з полем `type` (або `custom` + `customType`), який живе в **`AppState.activeTool`** разом з `locked`, `lastActiveTool`, `fromSelection`.
- **Де використовується:** `packages/excalidraw/types.ts` (`ToolType`, `ActiveTool`), обробники вводу в `packages/excalidraw/components/App.tsx`, тести `packages/excalidraw/tests/tool.test.tsx`, `packages/excalidraw/tests/queries/toolQueries.ts`.
- **Не плутати з:** **Action** (команда «зробити щось», наприклад undo); з **ExcalidrawElementType** (тип уже створеного елемента). Інструмент задає *режим користувача*, а не запис у масиві елементів.

---

## Action

- **Визначення (у проєкті):** тип **`Action`** — зареєстрована **команда редактора** з ім’ям (`ActionName`), функцією **`perform`**, що отримує елементи, `AppState`, форму та посилання на `App`, і повертає **`ActionResult`** (оновлення елементів, `appState`, `files`, **`captureUpdate`**) або `false`. **`ActionManager`** реєструє дії, викликає `perform` і зводить це з undo/redo.
- **Де використовується:** `packages/excalidraw/actions/types.ts`, `packages/excalidraw/actions/manager.tsx`, `packages/excalidraw/actions/register.ts`, реєстрація з `packages/excalidraw/components/App.tsx`.
- **Не плутати з:** **Redux action** / **flux action**; з browser **PointerEvent**; з **`CaptureUpdateAction`** у `@excalidraw/element` (це enum-подібний прапорець для історії, а не user-facing дія).

---

## Collaboration

- **Визначення (у проєкті):** спільне редагування однієї сцени в реальному часі: синхронізація елементів (у т.ч. **`reconcileElements`**), курсори/лазер, кімнати, таймаути завантаження. У веб-застосунку це головним чином компонент **`Collab`** і socket-шар; у типах — **`Collaborator`**, **`SocketId`**, мапа **`AppState.collaborators`**.
- **Де використовується:** `excalidraw-app/collab/Collab.tsx` (логіка кімнати, socket, Jotai-атоми на кшталт `collabAPIAtom`), `excalidraw-app/collab/CollabError.tsx`, `excalidraw-app/app-jotai.ts` (`appJotaiStore`), `packages/excalidraw/types.ts` (`Collaborator`, `CollaboratorPointer`), `packages/excalidraw/data/reconcile.ts`, `excalidraw-app/data/firebase.ts`, `excalidraw-app/App.tsx`, `excalidraw-app/tests/collab.test.tsx`.
- **Не плутати з:** наявністю лише пакета **`socket.io-client`** у залежностях — колаборація це доменна поведінка, а не назва бібліотеки; з **CRDT** як загальною теорією (тут своя модель версій/`versionNonce`/reconcile).

---

## Library

- **Визначення (у проєкті):** **бібліотека шаблонів** — збережені групи елементів (**`LibraryItem`**, масив **`LibraryItems`**, персистенція **`LibraryPersistedData`**), які користувач вставляє на полотно. Клас **`Library`** у `data/library.ts` керує завантаженням, чергою оновлень, адаптерами збереження та викликом колбека **`onLibraryChange`** з пропсів `<Excalidraw>` (не DOM-подія).
- **Де використовується:** `packages/excalidraw/data/library.ts`, типи `LibraryItems` / `LibraryItem` у `packages/excalidraw/types.ts`, UI на кшталт `packages/excalidraw/components/LibraryMenu.tsx` та пов’язаних `LibraryMenu*.tsx`, тест `packages/excalidraw/tests/library.test.tsx`.
- **Не плутати з:** **npm package** / workspace `packages/*`; з папкою **«library»** у сенсі node_modules. Тут **Library** — продуктова фіча «мої фігури».

---

## Додаткові терміни (коротко)

| Термін | У проєкті | Ключові файли |
|--------|-----------|----------------|
| **Store** | Знімки стану та еміти інкрементів для історії/зовнішніх спостерігачів (`StoreSnapshot`, константи **`CaptureUpdateAction`** для політики undo). | `packages/element/src/store.ts` |
| **History** | Локальні стеки дельт для undo/redo з особливою обробкою `version`/`versionNonce` під мережеві сценарії. | `packages/excalidraw/history.ts` |
| **Renderer** | Клас, що мемоізує видимі елементи та карту для рендера з урахуванням `Scene` + фрагментів `AppState`. | `packages/excalidraw/scene/Renderer.ts` |
| **ExcalidrawImperativeAPI** | Імперативний API інстанса редактора для хост-застосунку (оновлення сцени, файли, тощо). | `packages/excalidraw/types.ts`, `packages/excalidraw/components/App.tsx` (`createExcalidrawAPI`) |
| **reconcileElements** | Злиття/узгодження масивів елементів (локальні vs віддалені оновлення, Firebase тощо), з урахуванням `version` / `versionNonce`. | `packages/excalidraw/data/reconcile.ts`, `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/App.tsx`, `excalidraw-app/data/firebase.ts` |

---

## Джерела в репозиторії

Окрім файлів вище, узгоджені огляди: `docs/memory/projectbrief.md`, `docs/memory/systemPatterns.md`, `docs/technical/architecture.md`.
