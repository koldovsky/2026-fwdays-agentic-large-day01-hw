# System patterns

## Високорівнева архітектура

```mermaid
flowchart TB
  subgraph app [excalidraw-app]
    Index[index.tsx]
    App[App.tsx]
    Vite[Vite + aliases]
  end
  subgraph pkg [packages]
    Ex[@excalidraw/excalidraw]
    El[@excalidraw/element]
    Math[@excalidraw/math]
    Com[@excalidraw/common]
    Ut[@excalidraw/utils]
  end
  Index --> App
  App --> Ex
  Ex --> El
  Ex --> Math
  Ex --> Com
  El --> Com
  El --> Math
  Ut --> Com
```

- **`excalidraw-app`** — точка входу продукту: `index.tsx` монтує React через `createRoot`, підключає PWA (`virtual:pwa-register`), опційно Sentry (`./sentry`), рендерить `ExcalidrawApp`.
- **`@excalidraw/excalidraw`** — публічний фасад: експорт з `packages/excalidraw/index.tsx` обгортає `App`, меню, welcome screen, i18n, стилі; описує контракт `ExcalidrawProps` / imperative API (типи в `./types`).

## Шари пакетів (залежності)

- **`@excalidraw/common`** — спільні константи та утиліти; залежить від `tinycolor2` (`packages/common/package.json`).
- **`@excalidraw/math`** — математика/геометрія; залежить від `@excalidraw/common`.
- **`@excalidraw/element`** — логіка елементів креслення; залежить від `common` + `math`.
- **`@excalidraw/utils`** — експорт/файли, roughjs, pako тощо; збірка через окремий `buildUtils.js`.
- **`@excalidraw/excalidraw`** — UI React, CodeMirror, Radix, jotai, mermaid-to-excalidraw, roughjs, perfect-freehand тощо — агрегує найбільшу частину продуктової логіки.

## Патерн резолву модулів у dev/test

- Єдиний підхід: **TypeScript `paths`** (`tsconfig.json`) + **Vite `resolve.alias`** (`excalidraw-app/vite.config.mts`) + **Vitest `resolve.alias`** (`vitest.config.mts`) — усі вказують на **вихідні** `packages/.../src` або `packages/excalidraw/index.tsx`, а не лише на `dist`. Це пришвидшує розробку без постійної збірки пакетів для локального застосунку.

## Стан додатка: Jotai

- У `packages/excalidraw/editor-jotai.ts`: **`jotai-scope`** (`createIsolation`) — окремий провайдер/ізоляція для редактора; експортуються `EditorJotaiProvider`, `editorJotaiStore` (`createStore`), обгортки `useAtom` / `useAtomValue` тощо.
- У `index.tsx` бібліотеки: `EditorJotaiProvider` + `editorJotaiStore` інтегровані в дерево `Excalidraw`.
- Додатково: **`ExcalidrawAPIProvider`** — React Context для imperative API (`ExcalidrawAPIContext` / `ExcalidrawAPISetContext`), щоб хуки на кшталт `useAppStateValue` працювали поза піддеревом `<Excalidraw>`.

## UI та стилі

- Компоненти React **функціональні** з хуками (узгоджено з `.github/copilot-instructions.md`).
- Стилі: **SCSS** у пакеті excalidraw (`*.scss` імпорти в `index.tsx`); збірка пакета через esbuild + sass plugin.
- Для вбудовування: окремий артефакт **`index.css`** у exports `@excalidraw/excalidraw` (`development` / `production` умовні шляхи в `package.json`).

## Збірка та артефакти пакетів

- Публікаційний вихід: **`dist/dev`**, **`dist/prod`**, типи в **`dist/types/...`** (поле `exports` у `packages/excalidraw/package.json`).
- Застосунок у проді збирається **Vite** з тими ж alias на сорси в конфігурації (поточна гілка розробки спирається на монорепо layout, а не на опубліковані tarball-и).

## Якість коду

- **Строгий TypeScript** (`strict: true` у `tsconfig.json`).
- **Перевірки:** ESLint (`test:code`), Prettier (`test:other`), `tsc` (`test:typecheck`), Vitest.
- **Git hooks:** Husky (`prepare` у корені).

## Тестування

- Vitest із **jsdom**, глобальні матчери, **parallel hooks** у sequence (`vitest.config.mts` коментар про поведінку v2).
- Пакет `excalidraw` тягне **Testing Library** (`@testing-library/react` тощо) для компонентних тестів.
