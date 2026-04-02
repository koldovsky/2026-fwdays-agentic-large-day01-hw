# Decision Log

Журнал ключових архітектурних рішень і пов’язаних з ними наслідків для цього репозиторію (монорепа Excalidraw: `packages/*` + `excalidraw-app`). Детальніший потік даних — у `docs/technical/architecture.md`.

---

## Ключові рішення (3–5)

1. **Монорепозиторій і розділення «бібліотека ↔ хост»**  
   Yarn workspaces об’єднують `@excalidraw/excalidraw`, `@excalidraw/element` тощо та окремий SPA `excalidraw-app`. Колаборація, Firebase, локальні сховища й мережеві інтеграції живуть у додатку; публічний React-компонент і ядро редактора — у пакетах. Це дозволяє вбудовувати редактор у сторонні продукти без залежності від конкретного бекенду застосунку.

2. **Єдиний шлях застосування змін: `ActionManager` → `syncActionResult`**  
   Дії з UI, клавіатури, API проходять через `ActionManager.executeAction`; результат (`elements`, `appState`, `files`, `captureUpdate`) централізовано застосовується в `App.syncActionResult`. Це стабілізує undo/redo, оновлення сцени та React-стану й уникає роз’їзду джерел правди.

3. **`CaptureUpdateAction` + `Store.commit` для історії**  
   Режими `IMMEDIATELY` / `NEVER` / `EVENTUALLY` визначають, чи потрапляє зміна в локальний undo/redo (наприклад ініціалізація та віддалені оновлення — `NEVER`). Після оновлення React викликається `store.commit` з актуальними елементами та `appState`, що узгоджує дельти з історією.

4. **Подвійний canvas і поділ рендеру**  
   Статичний шар (`renderStaticScene`, з тротлінгом через RAF за прапорцем) і інтерактивний (`renderInteractiveScene`, анімаційний контролер) розведені по різних компонентах canvas. Rough.js використовується для «sketch»-вигляду. Це рішення про продуктивність і зручність інвалідації лише потрібного шару.

5. **Dev-збірка через Vite-аліаси на вихідні `.ts`**  
   У `excalidraw-app` імпорти `@excalidraw/*` резолвляться на сорси в `packages/`, без обов’язкового попереднього `build:packages` для локальної розробки. Продакшн-збірка пакетів залишається окремим шляхом (`build:common` → … → `build:excalidraw`).

---

## Side effects

**У ядрі редактора (`App`, `Scene`, `Store`)**

- **`syncActionResult`:** планує дію в `store.scheduleAction`, за потреби замінює всі елементи сцени, додає/оновлює бінарні файли в кеші, викликає `setState` для фрагментів `appState`, при відсутності змін може форсувати `scene.triggerUpdate()`.
- **`componentDidUpdate`:** зчитує елементи зі сцени, викликає `store.commit`, за незавантаженого стану — `props.onChange` та `onChangeEmitter`, щоб хости й підписники отримали узгоджений знімок.
- **`Scene.triggerUpdate`:** змінює `sceneNonce` і викликає зареєстровані колбеки — наслідок для рендеру та кешів, що залежать від nonce.
- **Еміттери на `App`:** `onChangeEmitter`, `onPointerDownEmitter`, `onScrollChangeEmitter` тощо — дублюють/розширюють колбеки пропсів для імперативного API.
- **`Store`:** `onDurableIncrementEmitter` (історія), `onStoreIncrementEmitter` (публічний `onIncrement` у API).
- **Jotai (`editorJotaiStore`):** оновлення атомів UI (бібліотека, мова тощо) через `updateEditorAtom` з подальшим `triggerRender()`.

**У хост-додатку та персистенції**

- **Фільтрація `AppState`:** `clearAppStateForLocalStorage` / `cleanAppStateForExport` / `clearAppStateForDatabase` відсікають поля за `APP_STATE_STORAGE_CONF` — побічний ефект «різні зрізи стану» для браузера, файлу й сервера.
- **Колаборація (`excalidraw-app`):** шифрування payload перед `socket.emit`, запис у Firebase — мережеві та зовнішні побічні ефекти поза React-деревом редактора.
- **Відомі ризики з коду (див. також `decisionLog.bak.md`):** у `FileManager` помилка збереження може «залипати» в in-memory картах і блокувати повторні спроби; нормалізація `UIOptions` у `ExcalidrawBase` під час рендеру може змінювати очікувану семантику `React.memo` порівняння пропсів.

---

## Lifecycles

**React: клас `App` (`packages/excalidraw/components/App.tsx`)**

| Фаза | Що відбувається (скорочено) |
|------|-----------------------------|
| **Mount** | Підписка `scene.onUpdate` → `triggerRender`; підписка на durable/store інкременти для історії; за наявності — `onIncrement`; `addEventListeners` (у view mode — ранній вихід для edit-only слухачів); ініціалізація сцени після `updateDOMRect` / `initializeScene`. |
| **Update** | Після рендеру — `componentDidUpdate`: `store.commit`, колбеки `onChange`, оновлення споживачів залежно від стану завантаження. |
| **Unmount** | Скидання `renderer`, очищення сцени/шрифтів, відписки та еміттерів `store`, `removeEventListeners`, очищення кешів (`ShapeCache`, `SnapCache` тощо); імперативний API переводиться в «знищений» стан з безпечними помилками на виклики. |

**Модель змін сцени та історії**

- Дія користувача/API → `ActionManager` → `syncActionResult` → `Store.scheduleAction` / оновлення `Scene` / `setState`.
- Після коміту React → `store.commit(elementsMap, appState)` узгоджує знімок для undo та емісії інкрементів.
- **`CaptureUpdateAction`** задає, чи ця хвиля змін потрапить у стек undo негайно, ніколи або «згодом» (багатокрокові асинхронні сценарії).

**Життєвий цикл сцени (`Scene`)**

- Канонічні елементи й мапи; оновлення через `replaceAllElements` / мутації та `triggerUpdate` для підписників і нового `sceneNonce`.

**Хост: колаборація та файли (`excalidraw-app`)**

- **Socket.IO:** підключення до кімнати, події `join-room` / broadcast; порядок подій (`open`, `connect_error`, fallback-ініціалізація) впливає на те, коли сцена стає узгодженою з сервером і коли знімається блокування збереження.
- **Firebase:** довготривале зберігання сцен і файлів — окремий асинхронний цикл відносно React.
- **Файли на диску (File System Access тощо):** цикли save/load через `FileManager` з внутрішніми станами «зберігається / збережено / помилка».

**Збірка та деплой**

- `build:packages` — послідовна збірка ESM пакетів; `excalidraw-app build` — Vite → статичні артефакти; Docker-образ може обслуговувати лише статику через Nginx (`Dockerfile` у репозиторії).

---

## Де глибше

- Архітектура й потік даних: `docs/technical/architecture.md`
- Патерни системи: `docs/memory/systemPatterns.md`
- Домен і глосарій: `docs/product/domain-glossary.md`
