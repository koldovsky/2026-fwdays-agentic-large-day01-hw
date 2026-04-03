# Project Brief — Excalidraw

## Що це за проект

**Excalidraw** — відкритий веб-застосунок для створення діаграм і схем у стилі "намальовано від руки".
Репозиторій містить як повноцінний веб-сайт (`excalidraw-app`), так і npm-бібліотеку (`@excalidraw/excalidraw`), яку можна вбудувати у будь-який React-проект.

- Версія пакету: `0.18.0` (`packages/excalidraw/package.json`)
- Ліцензія: MIT

---

## Основна мета

- Надати **вбудовуваний React-компонент** для малювання схем у власних застосунках
- Підтримка **real-time колаборації** (Socket.io + Firebase)
- Робота як **PWA** з offline-режимом (`public/service-worker.js`)
- **Експорт** у SVG / PNG / Blob (`packages/utils/src/export.ts`)
- Підтримка **мобільних пристроїв** та **стилусів**

---

## Ключові можливості

- Фігури: rectangle, diamond, ellipse, arrow, line, freedraw, text, image, frame
- Стиль "від руки" через RoughJS + perfect-freehand
- Undo/redo з `HistoryDelta` (`packages/excalidraw/history.ts`)
- Бібліотека елементів (Library) для повторного використання
- Frames — контейнери для групування елементів
- Lasso selection (`packages/excalidraw/lasso/`)
- Magic frame (AI-based автовставка)
- Підтримка CJK та кастомних шрифтів (lazy-loading)
- Локалізація: 60+ мов (`packages/excalidraw/locales/`)

---

## Структура монорепо

```
excalidraw-app/          # Веб-застосунок (vite dev server, firebase, socket.io)
packages/
  common/                # @excalidraw/common — константи, кольорові палітри, utils
  math/                  # @excalidraw/math — геометрія, вектори, криві
  element/               # @excalidraw/element — логіка елементів, сцена, store
  excalidraw/            # @excalidraw/excalidraw — головна React-бібліотека
  utils/                 # @excalidraw/utils — публічні утиліти (export, bbox)
examples/
  with-nextjs/           # Приклад інтеграції з Next.js
```

---

## Публічне API (`packages/excalidraw/index.tsx`)

**Компонент:**
```typescript
export const Excalidraw = React.memo(ExcalidrawBase);
```

**Утиліти:**
```typescript
export { exportToCanvas, exportToBlob, exportToSvg, exportToClipboard }
export { serializeAsJSON, loadFromBlob, restoreElements }
export { convertToExcalidrawElements }
```

**UI-компоненти для кастомізації:**
```typescript
export { Sidebar, Button, Footer, MainMenu, WelcomeScreen }
```

**Imperative API** (через `onExcalidrawAPI` prop):
`getElements()`, `setElements()`, `getAppState()`, `setState()`, `exportToBlob()` та ~15 інших методів.

---

## Цільова аудиторія

1. **End-users** — використовують `excalidraw.com` для малювання
2. **Розробники** — інтегрують `@excalidraw/excalidraw` в свої React-застосунки
3. **Контриб'ютори** — розширюють функціонал через packages

---

## Пов'язані файли

- `projectbrief.md` (root) — оригінальний brief завдання
- `systemPatterns.md` (root) — архітектурні патерни
- `packages/excalidraw/types.ts` — публічні типи
- `packages/excalidraw/index.tsx` — точка входу

---

## See also

| Документ | Що містить |
|---|---|
| [`docs/memory/techContext.md`](./techContext.md) | Стек, версії, команди, конфіги |
| [`docs/memory/systemPatterns.md`](./systemPatterns.md) | Архітектура, патерни, component tree |
| [`docs/technical/architecture.md`](../technical/architecture.md) | Детальна архітектура з mermaid-діаграмами, data flow, rendering pipeline |
| [`docs/product/domain-glossary.md`](../product/domain-glossary.md) | Словник термінів (ExcalidrawElement, Scene, AppState, Action, ...) |
