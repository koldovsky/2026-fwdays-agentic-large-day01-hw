# Project brief

## Суть продукту

- **Excalidraw** — відкритий whiteboard-інструмент для швидких діаграм і схем у hand-drawn стилі та **npm-монорепозиторій** з пакетами `@excalidraw/*`.
- **Кореневе ім’я workspace** у `package.json`: `excalidraw-monorepo`.
- Два основні способи використання: повноцінний веб-застосунок (`excalidraw-app`) і **вбудовування редактора як React-компонента** через пакет `@excalidraw/excalidraw` (опис у `packages/excalidraw/package.json`: *«Excalidraw as a React component»*).

## Основна мета

- Надати **інтерактивний редактор креслень** (елементи на canvas, експорт, бібліотека, колаборація тощо).
- Розділити код на шари:
  - **`packages/common`** — спільні константи й утиліти.
  - **`packages/element`** — модель і операції над елементами.
  - **`packages/math`** — геометрія для canvas.
  - **`packages/utils`** — додаткові утиліти.
  - **`packages/excalidraw`** — UI редактора, дані, i18n, публічний API.
  - **`excalidraw-app`** — оболонка продукту (деплой, колаборація, інтеграції); точка входу `excalidraw-app/index.tsx` рендерить `ExcalidrawApp` з `./App`.

## Приклади для інтеграторів

- `examples/with-nextjs` та `examples/with-script-in-browser` — workspace-пакети в кореневому `package.json` (`workspaces`: `examples/*`).

## Де деталі

- Версії залежностей і команди — у [techContext.md](techContext.md).
- Архітектурні патерни — у [systemPatterns.md](systemPatterns.md).
