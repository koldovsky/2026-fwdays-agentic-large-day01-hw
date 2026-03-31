Прийняв задачу — коротко і по коду розкладаю: що це за проєкт, для чого він, який стек і як влаштований репозиторій.

- [x] Визначити призначення проєкту
- [x] Витягнути основний стек із конфігів і package manifests
- [x] Пояснити структуру монорепозиторію по директоріях

## Що це за проєкт

Це **монорепозиторій Excalidraw**: одночасно
1. **готовий вебзастосунок** для малювання/скетчингу діаграм у стилі “hand-drawn”,
2. **React-бібліотека** `@excalidraw/excalidraw`, яку можна вбудовувати в інші застосунки,
3. набір **внутрішніх пакетів** із загальними утилітами, геометрією, логікою елементів та експортом.

Підтвердження з коду:
- корінь репо прямо названий `excalidraw-monorepo` і використовує workspaces: [`package.json`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/package.json)
- пакет `@excalidraw/excalidraw` описаний як **“Excalidraw as a React component”**: [`packages/excalidraw/package.json`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/packages/excalidraw/package.json)
- вебапка піднімає `ExcalidrawApp` як основний UI: [`excalidraw-app/index.tsx`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/excalidraw-app/index.tsx)
- PWA-маніфест прямо каже: “**Excalidraw is a whiteboard tool** ...”: [`excalidraw-app/vite.config.mts`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/excalidraw-app/vite.config.mts)

### По суті
Проєкт дає:
- редактор схем/діаграм,
- імпорт/експорт,
- колаборацію в реальному часі,
- бібліотеку для embeddable-сценаріїв,
- приклади інтеграції у звичайний browser script і Next.js.

---

## Основний стек технологій

## 1) Базовий стек
- **TypeScript** — у всьому монорепо: [`package.json`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/package.json)
- **React 19** + **react-dom 19** — і в апці, і в прикладах:
  [`excalidraw-app/package.json`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/excalidraw-app/package.json),
  [`examples/with-script-in-browser/package.json`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/examples/with-script-in-browser/package.json),
  [`examples/with-nextjs/package.json`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/examples/with-nextjs/package.json)
- **Node.js >= 18**
- **Yarn 1 workspaces** — менеджмент монорепи: [`package.json`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/package.json)

## 2) Build / tooling
- **Vite 5** — основний dev/build інструмент:
  - root devDependency: [`package.json`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/package.json)
  - app config: [`excalidraw-app/vite.config.mts`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/excalidraw-app/vite.config.mts)
- **Vitest** + **jsdom** — тести: [`vitest.config.mts`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/vitest.config.mts)
- **ESLint** + **Prettier**
- **Sass** — стилі в бібліотеці: [`packages/excalidraw/package.json`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/packages/excalidraw/package.json)

## 3) App/runtime стек
- **PWA** через `vite-plugin-pwa`: [`excalidraw-app/vite.config.mts`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/excalidraw-app/vite.config.mts)
- **Sentry** для error tracking:
  import у [`excalidraw-app/index.tsx`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/excalidraw-app/index.tsx), залежність у [`excalidraw-app/package.json`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/excalidraw-app/package.json)
- **Jotai** — state management: [`excalidraw-app/App.tsx`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/excalidraw-app/App.tsx)
- **Firebase** (Firestore + Storage) — збереження/сцени/файли: [`excalidraw-app/data/firebase.ts`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/excalidraw-app/data/firebase.ts)
- **Socket.IO client** — realtime collaboration: [`excalidraw-app/collab/Portal.tsx`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/excalidraw-app/collab/Portal.tsx)
- **Шифрування даних сцен** при колаборації/збереженні:
  [`excalidraw-app/collab/Portal.tsx`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/excalidraw-app/collab/Portal.tsx),
  [`excalidraw-app/data/firebase.ts`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/excalidraw-app/data/firebase.ts)

## 4) Доменно-специфічні бібліотеки
У самому `@excalidraw/excalidraw` видно, що це досить “важка” UI/graphics-бібліотека:
- **roughjs** — hand-drawn rendering
- **perfect-freehand**
- **radix-ui**
- **CodeMirror**
- **mermaid-to-excalidraw**
- **browser-fs-access**
- **pica**, **pako**, png tools тощо
  Джерело: [`packages/excalidraw/package.json`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/packages/excalidraw/package.json)

---

## Яке призначення окремих пакетів

### `@excalidraw/excalidraw`
Головний пакет — React-компонент редактора та пов’язаний UI/API.
Файл: [`packages/excalidraw/package.json`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/packages/excalidraw/package.json)

### `@excalidraw/common`
Спільні утиліти, константи, черги, event bus, helpers.
Експорти видно в: [`packages/common/src/index.ts`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/packages/common/src/index.ts)

### `@excalidraw/math`
2D-математика/геометрія: angle, curve, ellipse, line, point, polygon, rectangle, vector тощо.
Файл: [`packages/math/src/index.ts`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/packages/math/src/index.ts)

### `@excalidraw/element`
Логіка елементів редактора: bounds, collision, binding, frame, selection, resize, text, z-index, rendering helpers.
Файл: [`packages/element/src/index.ts`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/packages/element/src/index.ts)

### `@excalidraw/utils`
Додаткові утиліти поверх core/element, зокрема export/bounds helpers.
Файл: [`packages/utils/src/index.ts`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/packages/utils/src/index.ts)

---

## Структура репозиторію

## 1) Корінь репозиторію
Основні речі:
- [`package.json`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/package.json) — workspaces, загальні скрипти build/test/release
- [`vitest.config.mts`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/vitest.config.mts) — тестова конфігурація з alias на локальні пакети
- [`Dockerfile`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/Dockerfile), [`docker-compose.yml`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/docker-compose.yml), [`vercel.json`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/vercel.json) — деплой/інфраструктура
- [`scripts/`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/scripts) — build/release automation
- [`public/`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/public) — статичні assets

## 2) `excalidraw-app/`
Це **основний вебзастосунок**.

Ключові файли:
- entrypoint: [`excalidraw-app/index.tsx`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/excalidraw-app/index.tsx)
- головний UI-контейнер: [`excalidraw-app/App.tsx`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/excalidraw-app/App.tsx)
- Vite/PWA/build config: [`excalidraw-app/vite.config.mts`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/excalidraw-app/vite.config.mts)

Піддиректорії:
- `components/` — UI-компоненти апки
- `collab/` — realtime collaboration
- `data/` — завантаження/збереження сцен, файлів, Firebase
- `app-language/` — локалізація/мови
- `tests/` — тести апки

## 3) `packages/`
Це **ядро монорепозиторію**, розділене на окремі npm-пакети:
- [`packages/common/`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/packages/common)
- [`packages/math/`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/packages/math)
- [`packages/element/`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/packages/element)
- [`packages/excalidraw/`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/packages/excalidraw)
- [`packages/utils/`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/packages/utils)

Цікаво, що і app, і тести працюють через alias на **локальні вихідні файли пакетів**, тобто монорепо зручно розробляється “наживо”, без публікації пакетів:
- [`excalidraw-app/vite.config.mts`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/excalidraw-app/vite.config.mts)
- [`vitest.config.mts`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/vitest.config.mts)

## 4) `examples/`
Два приклади інтеграції:
- [`examples/with-script-in-browser/`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/examples/with-script-in-browser) — vanilla/browser сценарій з глобальним `window.ExcalidrawLib`
  див. [`index.html`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/examples/with-script-in-browser/index.html), [`index.tsx`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/examples/with-script-in-browser/index.tsx)
- [`examples/with-nextjs/`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/examples/with-nextjs) — приклад використання в Next.js
  див. [`src/excalidrawWrapper.tsx`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/examples/with-nextjs/src/excalidrawWrapper.tsx)

## 5) `firebase-project/`
Конфіги для Firebase:
- [`firebase-project/firebase.json`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/firebase-project/firebase.json)
- [`firestore.rules`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/firebase-project/firestore.rules)
- [`storage.rules`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/firebase-project/storage.rules)

## 6) `scripts/`
Автоматизація:
- build пакетів,
- build app,
- wasm/woff2 processing,
- release flow,
- changelog generation.
  Приклади: [`scripts/release.js`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/scripts/release.js), [`scripts/updateChangelog.js`](file:///C:/Users/MTsybulskyi/IdeaProjects/2026-fwdays-agentic-large-day01-hw/scripts/updateChangelog.js)

---

## Короткий висновок

Це не “просто фронтенд”, а **повноцінний TypeScript/React монорепозиторій** з трьома рівнями:

1. **Продукт** — `excalidraw-app`
2. **Публічна бібліотека** — `@excalidraw/excalidraw`
3. **Низькорівневі пакети** — `common`, `math`, `element`, `utils`

Тобто репозиторій одночасно підтримує:
- сам редактор,
- npm-пакети для повторного використання,
- приклади інтеграції,
- релізний pipeline,
- колаборацію, збереження, PWA і тестову інфраструктуру.

Якщо хочеш, я можу далі так само стисло розписати **архітектуру залежностей між пакетами** (`common -> math -> element -> excalidraw -> app`) або **пояснити, з чого краще починати читати код** в цьому репозиторії.
