# Decision log — ключові рішення

## Пов’язана документація

- **Технічна** ([`docs/technical/`](../technical/)): [architecture.md](../technical/architecture.md) · [dev-setup.md](../technical/dev-setup.md)
- **Продуктова** ([`docs/product/`](../product/)): [PRD.md](../product/PRD.md) · [domain-glossary.md](../product/domain-glossary.md)

Короткий журнал архітектурних і інженерних рішень, **узгоджений з поточним кодом** (шляхи до файлів — для верифікації). Це не історія комітів, а зафіксований стан репозиторію.

---

## Монорепозиторій і пакетний менеджер

- **Yarn 1 + workspaces** — приватний монорепо `excalidraw-monorepo`; робочі простори: `excalidraw-app`, `packages/*`, `examples/*` (`package.json`: `name`, `private`, `workspaces`, `packageManager`).
- **Фіксація версії Yarn** — `packageManager: "yarn@1.22.22"` для відтворюваних інсталяцій (`package.json`).
- **Node** — мінімум `>=18.0.0` (`package.json`: `engines`).
- **Resolutions** — примусове узгодження `strip-ansi` (`package.json`: `resolutions`).

---

## Збірка додатку та локальна розробка

- **Vite як бандлер** для `excalidraw-app` — плагіни та аліаси в `excalidraw-app/vite.config.mts`.
- **Спільні `.env` з кореня** — `envDir: "../"` і `loadEnv(mode, "../")`, щоб змінні не лежали лише поруч із конфігом (`excalidraw-app/vite.config.mts`).
- **Порт dev-сервера** — `Number(envVars.VITE_APP_PORT || 3000)` (`excalidraw-app/vite.config.mts`).
- **Вихід збірки** — `build.outDir: "build"` відносно `excalidraw-app` → артефакт `excalidraw-app/build` (`excalidraw-app/vite.config.mts`).
- **Шрифти не інлайняться** — `assetsInlineLimit: 0` (`excalidraw-app/vite.config.mts`).
- **Source maps у production build** — `build.sourcemap: true` (`excalidraw-app/vite.config.mts`).
- **Ручне розбиття чанків** — окремі чанки для локалей (крім `en.json` / `percentages.json`), `mermaid-to-excalidraw`, CodeMirror/Lezer — коментар у коді пояснює кешування та офлайн-перше завантаження (`excalidraw-app/vite.config.mts`: `manualChunks`).
- **Аліаси `@excalidraw/*` на вихідні `.ts`/`.tsx` у `packages/*`** — і в Vite додатку, і в Vitest (`excalidraw-app/vite.config.mts`, `vitest.config.mts`, `tsconfig.json`: `paths`).

---

## Деплой і інтеграція з хостингом

- **Vercel** — `outputDirectory: "excalidraw-app/build"`, `installCommand: "yarn install"` (`vercel.json`).
- **Заголовки та редіректи** — CORS/кеш для `.woff2`, host-based redirect для `vscode.excalidraw.com` тощо (`vercel.json`).

---

## Публікація бібліотеки `@excalidraw/excalidraw`

- **Dual build у `exports`** — умовні `development` / `production` для entry та `index.css`; `default` → prod (`packages/excalidraw/package.json`: `exports`).
- **ESM + `type: "module"`** — `main`/`module` вказують на `./dist/prod/index.js` (`packages/excalidraw/package.json`).
- **Peer React** — діапазон `^17.0.2 || ^18.2.0 || ^19.0.0` для `react` і `react-dom` (`packages/excalidraw/package.json`: `peerDependencies`).
- **Порядок збірки пакетів** — `common` → `math` → `element` → `excalidraw` (`package.json`: скрипт `build:packages`).

---

## TypeScript і межі компіляції

- **Strict mode** — `strict: true`, `jsx: "react-jsx"`, `module`/`target` ESNext (`tsconfig.json`).
- **Включення** — `packages`, `excalidraw-app`; **виключення** — `examples`, `dist`, `types`, `tests` (`tsconfig.json`: `include`, `exclude`).
- **`noEmit: true` на корені** — перевірка типів без емісії з root (`tsconfig.json`).

---

## Архітектура редактора (пакети)

- **Розділення шарів** — `@excalidraw/common`, `math`, `element`, `excalidraw`, окремо `utils` (залежності та ролі в `packages/*/package.json`; узгоджено з `docs/memory/systemPatterns.md` і кодом імпортів).
- **Заміна семантики історії** — замість старого `commitToHistory` у публічному потоці оновлень використовується **`CaptureUpdateAction`** з трьома режимами:
  - `IMMEDIATELY` — одразу в undo/redo;
  - `NEVER` — віддалені оновлення / ініціалізація;
  - `EVENTUALLY` — багатокрокові async-операції (`packages/element/src/store.ts`: константа та JSDoc).
- **Короткоживучі воркери** — `WorkerPool` з TTL за замовчуванням **1000 ms** і перевіркою, що worker не змерджений у main chunk (`packages/excalidraw/workers.ts`).

---

## Додаток `excalidraw-app`

- **PWA** — `registerSW()` на старті (`excalidraw-app/index.tsx`).
- **Sentry** — side-effect import до рендеру (`excalidraw-app/index.tsx`: `../excalidraw-app/sentry`).
- **React StrictMode** — обгортка кореня (`excalidraw-app/index.tsx`).

---

## Тестування і якість

- **Vitest** — `environment: "jsdom"`, `globals: true`, `setupFiles: ["./setupTests.ts"]` (`vitest.config.mts`).
- **Паралельні hooks** — `sequence.hooks: "parallel"` з поясненням відмінності від v2 (`vitest.config.mts`).
- **Пороги coverage** — `lines` 60, `branches` 70, `functions` 63, `statements` 60; `ignoreEmptyLines: false` (свідомо після змін Vitest) (`vitest.config.mts`).
- **`test:all`** — послідовно typecheck, eslint (0 warnings), prettier list-different, vitest без watch (`package.json`: `scripts`).
- **Глобальний setup** — canvas mock, jest-dom, мок `throttleRAF`, `fake-indexeddb`, polyfill Excalidraw (`setupTests.ts`).

---

## Git hooks і форматування

- **Husky** — `prepare`: `husky install` (`package.json`: `scripts`).
- **Prettier** — спільний конфіг `@excalidraw/prettier-config` (`package.json`: `prettier`).

---

## Навчальний контекст (цей клон)

- **Memory Bank як артефакт воркшопу** — чеклист PR очікує `docs/memory/*.md`, зокрема `decisionLog.md` (бонус) (`.github/PULL_REQUEST_TEMPLATE.md`).

---

## Незадокументована поведінка (код vs документація)

Нижче — випадки, коли фактична логіка або неявні залежності **не відображені** в `docs/technical/architecture.md` чи публічних контрактах API; корисно для агентів і рев’ю, щоб не «оптимізувати» або не змінювати порядок ініціалізації всліпу.

### Undocumented Behavior #1

- **Файл**: `packages/excalidraw/components/App.tsx`
- **Що відбувається**: під час наведення на вибраний лінійний елемент **ручки трансформації (resize/rotate) взагалі не обчислюються**, якщо пристрій визначено як mobile **або** у елемента рівно дві точки (`points.length === 2`). Для інших лінійних елементів на desktop спочатку перевіряється drag точки (`handleHoverSelectedLinearElement`), і лише якщо немає hover по точці — показуються transform handles.
- **Де задокументовано**: лише коментар `HACK` у коді; у `architecture.md` про цю гілку UX нічого немає.
- **Ризик**: зміна умов показу handles / уніфікація touch–pointer може зламати пріоритет «point drag vs edge resize» на мобільних або для відрізків із двома точками.

### Undocumented Behavior #2

- **Файл**: `packages/excalidraw/components/App.tsx`
- **Що відбувається**: прапорець `lastPointerUpIsDoubleClick` виставляється через **`isDoubleClick(lastPointerUpEvent, event)`** — порівняння **timestamp двох pointer up** з порогом `TAP_TWICE_TIMEOUT`, а не через нативну подію `dblclick`. Коментар `TODO` біля поля згадує змішування touch і pointer і бажання уніфікувати подвійне натискання end-to-end (окремо від цієї часової перевірки).
- **Де задокументовано**: ніде в технічних документах; лише `TODO` у полі класу.
- **Ризик**: зміна інтервалу/порядку `pointerup`, об’єднання шляхів touch–mouse або прибирання прапорця може зламати сценарії, де очікується «подвійне» на основі цього стану (наприклад, початкова позиція каретки при подвійному відкритті тексту).

### Undocumented Behavior #3

- **Файл**: `packages/excalidraw/index.tsx`
- **Що відбувається**: `ExcalidrawBase` на кожен рендер зливає `props.UIOptions` з `DEFAULT_UI_OPTIONS` і передає в `App` уже **змерджений** об’єкт. Водночас `React.memo(..., areEqual)` порівнює **`UIOptions` з сирих пропів** (`prevProps` / `nextProps`) за ключами та вкладеними `canvasActions`, а не фінальний об’єкт після merge. Коментар `FIXME` вказує на цей розрив: батько має передавати нормалізовані значення, щоб **критерій мемо збігався з тим, що реально отримує `App`**.
- **Де задокументовано**: `architecture.md` згадує `UIOptions` лише як фільтр дій, без опису custom `areEqual` і merge у wrapper.
- **Ризик**: різні форми «рівних за змістом» часткових `UIOptions` дають різні результати `areEqual`; зміна дефолтів у `DEFAULT_UI_OPTIONS` може змінити поведінку `App` без зміни пропів батька — мемо цього не відстежує.

### Undocumented Behavior #4

- **Файл**: `packages/excalidraw/data/restore.ts`
- **Що відбувається**: при `opts.deleteInvisibleElements === true` порожній текстовий елемент **залишається в масиві**, але позначається `isDeleted: true` і отримує `bumpVersion`. Коментар `TODO` вказує, що це **ламає сценарії sync / versioning**, коли обмінюються лише дельтами й відновлюють елементи — **видалення як подія не потрапляє в історію змін так, як очікує колаб**.
- **Де задокументовано**: ніде в продуктовій/архітектурній документації; лише коментар у `restore`.
- **Ризик**: ввімкнення `deleteInvisibleElements` у нових шляхах (експорт, імпорт, API) без усвідомлення дасть «тихі» `isDeleted` + версії й роз’їзд з колаборацією або undo.

### Undocumented Behavior #5

- **Файл**: `packages/excalidraw/wysiwyg/textWysiwyg.tsx`
- **Що відбувається**: підписка на **`app.onChangeEmitter`**: колбек оголошений з аргументом `elements`, але всередині **аргумент ігнорується** — оновлення стилів робиться, лише якщо `app.state.theme !== LAST_THEME`. Еміттер викликається з `App.componentDidUpdate` разом із `props.onChange` (той самий момент після `store.commit`), тобто це **спільний канал «будь-яке оновлення редактора»**, а не семантика «змінились елементи». Коментар `FIXME` просить на майбутнє отримувати зміни теми з Store замість цього обходу.
- **Де задокументовано**: ніде; `architecture.md` не описує зв’язок theme ↔ wysiwyg через `onChangeEmitter`.
- **Ризик**: якщо хтось припустить, що `onChangeEmitter` лише про елементи, або вимкне/дебаунсить емісію при певних оновленнях `appState`, стилі WYSIWYG можуть розійтися з темою; залежність від порядку в `componentDidUpdate` лишається неявною.

### Undocumented Behavior #6

- **Файл**: `packages/utils/src/export.ts` та `packages/utils/tests/export.test.ts`
- **Що відбувається**: `exportToSvg` оголошує `elements` як `NonDeleted<...>` і викликає `restoreElements(..., { deleteInvisibleElements: true })`, але **не прибирає вже позначені `isDeleted`** на вході — `restoreElements` пропускає такі елементи крізь restore (див. `packages/excalidraw/data/restore.ts`). Тест `with deleted elements` **пропущений (`it.skip`)** з `FIXME`: очікувалося, що видалені не потраплять у SVG; контракт фактично покладається на коректність вхідних даних, а **рантайм-валідації немає** (тип допомагає лише в TypeScript без примусових assertion).
- **Де задокументовано**: публічна документація пакета не пояснює цей контракт; лише коментар у тесті.
- **Ризик**: виклик з JS або з масивом, де `isDeleted: true`, може змалювати видалені елементи в експорті; тест-регресія вимкнена.

### Undocumented Behavior #7

- **Файл**: `packages/excalidraw/clients.ts`
- **Що відбувається**: для колаборатора з `isSpeaking` перед основним намалюванням курсора малюється **товстий контур** (і `fill`, і `stroke`) кольором `IS_SPEAKING_COLOR`; у **темній темі** використовується `#2f6330` замість `COLOR_VOICE_CALL`. Коментар `TODO` пояснює це як компенсацію **CSS-фільтра теми** (`--theme-filter: invert(93%) hue-rotate(180deg)` у `packages/excalidraw/css/theme.scss`), який у `styles.scss` вішається на **інтерактивний canvas** (`.interactive`: `filter: var(--theme-filter)`), тобто пікселі, намальовані цим шляхом (у т.ч. віддалені курсори), проходять через інверсію.
- **Де задокументовано**: ніде в `architecture.md` / глосарії; зв’язок «константа в `clients.ts` ↔ `--theme-filter` на інтерактивному canvas» не описаний.
- **Ризик**: зміна або вимкнення `--theme-filter` / області застосування `filter` зробить індикатор «говоріння» візуально хибним, доки не підлаштують `IS_SPEAKING_COLOR` або рендер.

---

## Як верифікувати

- Оновіть цей файл після суттєвих змін у `package.json`, `tsconfig.json`, `vitest.config.mts`, `excalidraw-app/vite.config.mts`, `vercel.json`, `packages/excalidraw/package.json`, `packages/element/src/store.ts`, `packages/excalidraw/workers.ts`, `excalidraw-app/index.tsx`, `setupTests.ts`, а також після змін у шляхах з розділу «Незадокументована поведінка» (наприклад `packages/excalidraw/components/App.tsx`, `packages/excalidraw/index.tsx`, `packages/excalidraw/data/restore.ts`, `packages/excalidraw/wysiwyg/textWysiwyg.tsx`, `packages/utils/src/export.ts`, `packages/excalidraw/clients.ts`, `packages/excalidraw/css/theme.scss`).
