# Project brief

## Що це за репозиторій

- **Назва в корені:** `excalidraw-monorepo` (див. `package.json`: поле `name`).
- Це **монорепозиторій Excalidraw**: веб-додаток для малювання діаграм і дошки, плюс набір npm-пакетів `@excalidraw/*` для вбудовування редактора як React-компонента.
- Робоча копія лежить у каталозі курсового/домашнього завдання (`2026-fwdays-agentic-large-day01-hw`); у самому репозиторії **немає окремого кореневого README** — контекст задається кодом і `package.json`.

## Основна мета продукту

- Надати **інтерактивний редактор креслень** (елементи, експорт, бібліотека, колаборація тощо).
- Опублікувати **бібліотеку `@excalidraw/excalidraw`** з описом *«Excalidraw as a React component»* (`packages/excalidraw/package.json`).
- Розділити код на шари:
  - **`packages/common`** — спільні константи й утиліти (`description` у `packages/common/package.json`).
  - **`packages/element`** — модель і операції над елементами.
  - **`packages/math`** — математика для геометрії (`packages/math/package.json`).
  - **`packages/utils`** — додаткові утиліти (`packages/utils/package.json`).
  - **`packages/excalidraw`** — UI редактора, дані, i18n, головний публічний API.
  - **`excalidraw-app`** — оболонка застосунку (деплой, колаборація, інтеграції), точка входу `excalidraw-app/index.tsx` рендерить `ExcalidrawApp` з `./App`.

## Приклади для інтеграторів

- `examples/with-nextjs` та `examples/with-script-in-browser` — окремі workspace-пакети (`package.json` workspaces: `examples/*`).

## Обмеження документа

- Версії залежностей і команди зібрані в `techContext.md`.
- Архітектурні рішення — у `systemPatterns.md`.
