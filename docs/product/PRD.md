# PRD — Excalidraw

> **Reverse-engineered Product Requirements Document.**
> Джерело: вихідний код репозиторію, конфігураційні файли, наявна документація.
> Версія продукту: `@excalidraw/excalidraw 0.18.0`, `excalidraw-app 1.0.0`.

---

## Table of Contents

1. [Мета продукту](#1-мета-продукту)
2. [Цільова аудиторія](#2-цільова-аудиторія)
3. [Рівні продукту](#3-рівні-продукту)
4. [Ключові функції](#4-ключові-функції)
5. [UX-принципи](#5-ux-принципи)
6. [Технічні обмеження](#6-технічні-обмеження)
7. [Non-goals](#7-non-goals)
8. [Метрики успіху та залежності](#8-метрики-успіху-та-залежності)

---

## 1. Мета продукту

**Excalidraw** — відкритий веб-інструмент для малювання діаграм і схем у стилі "від руки" (hand-drawn whiteboard).

### Проблема, яку вирішує

Традиційні інструменти для діаграм (Lucidchart, draw.io, Figma) вимагають реєстрації, мають складний UI і створюють «тиск перфекціонізму» — виглядаючи надто акуратно, вони спонукають витрачати час на форматування замість мислення. Excalidraw навмисно зберігає «нечіткий», ескізний вигляд через [Rough.js](https://roughjs.com/), що знижує когнітивний бар'єр і прискорює виразну комунікацію ідей.

### Продуктова обіцянка

> *Відкрив → одразу малюєш. Без реєстрації, без налаштувань, без friction.*

---

## 2. Цільова аудиторія

### Первинна аудиторія

| Сегмент | Потреба | Сценарій використання |
|---------|---------|----------------------|
| **Розробники ПЗ** | Швидкі архітектурні схеми, технічні діаграми | Накидати систему мікросервісів перед тим, як писати код |
| **Технічні дизайнери / PM** | Вайрфрейми, флоучарти, user journey | Прототипування екранів без Figma |
| **Команди** | Спільна робота на «дошці» в реальному часі | Дистанційний мозковий штурм |

### Вторинна аудиторія

| Сегмент | Потреба |
|---------|---------|
| **Інтегратори (розробники)** | Вбудовування whiteboard-редактора у власний продукт (нотатники, IDE, LMS, SaaS) |
| **Викладачі / студенти** | Пояснення концепцій через малюнки |
| **Технічні автори** | Ілюстрації до документації у hand-drawn стилі |

### Технічний профіль кінцевого користувача

- Комфортно працює у браузері, вміє користуватись Ctrl+Z / Ctrl+C / Ctrl+V
- Не потребує досвіду з векторними редакторами
- Для collab-сценарію: знає, що таке «поділитись посиланням»

---

## 3. Рівні продукту

| Рівень | Опис |
|--------|------|
| **excalidraw.com** | Повний Vite-застосунок (`excalidraw-app/`): Firebase persistence, Socket.io collab, Sentry, PWA, i18n (80+ мов), AI text-to-diagram |
| **@excalidraw/excalidraw** | NPM-пакет v0.18.0 — embeddable React-компонент; peerDeps: React 17–19 |

---

## 4. Ключові функції

### 4.1 Малювання та редагування елементів

**Інструменти** (`ToolType` у `packages/excalidraw/types.ts`): `rectangle`, `diamond`, `ellipse`, `arrow`, `line`, `freedraw`, `text`, `image`, `frame`, `magicframe`, `embeddable`, `hand`, `eraser`, `laser`, `selection`, `lasso`.

**~80 actions** (`packages/excalidraw/actions/`): align, distribute, flip, resize, rotate, z-order, group/ungroup, lock, duplicate, delete, crop, stroke/fill/opacity/font styles, delta-based undo/redo.

**Стилістика:** Rough.js (hand-drawn обриси), `fillStyle` (hachure/solid/cross-hatch), 4 шрифти (Excalidraw, Nunito, Comic Shanns, Code).

### 4.2 Колаборація в реальному часі

Socket.io-client 4.7.2 + Firebase 11. Link-based кімнати без реєстрації, видимі курсори (`Collaborator`), follow-mode, laser pointer, аудіо-індикатори (`isInCall`/`isSpeaking`). Remote-зміни не потрапляють в undo-стек (`CaptureUpdateAction.NEVER`).

### 4.3 Sharing та Export

**Export:** PNG (з прозорістю/темою), SVG (з вбудованою сценою), `.excalidraw` JSON, clipboard. **Sharing:** Firebase Storage → shareable URL, QR-код. **Import:** `.excalidraw` JSON, Mermaid (TTD-діалог), зображення (PNG/JPEG/SVG/WebP).

### 4.4 Бібліотека елементів

`LibraryMenu` — IndexedDB-based каталог шаблонів. `actionAddToLibrary` зберігає виділення. Browse публічних бібліотек з `libraries.excalidraw.com`. Import/Export у `.excalidrawlib`.

### 4.5 AI та Text-to-Diagram

Text-to-Diagram (`TTDDialogTrigger`), Magic Frame (`magicframe` tool), AI backend (`VITE_APP_AI_BACKEND`).

### 4.6 Режими роботи

View Mode, Zen Mode, Grid Mode, Pen Mode (стилус), Dark Theme — кожен контролюється полем `AppState`.

### 4.7 Доступність та i18n

Keyboard shortcuts, Command Palette (`⌘K`), Search Menu (`Ctrl+F`), Radix UI, 80+ мов (Crowdin).

### 4.8 Imperative API

`ExcalidrawImperativeAPI` (через `ref`): `updateScene`, `getSceneElements`, `setActiveTool`, `addFiles`, `resetScene`, `onChange`, `onIncrement`, `scrollToContent`, `history.clear`.

---

## 5. UX-принципи

- **Zero-Friction Entry** — повний функціонал без реєстрації; автозбереження в IndexedDB
- **Hand-Drawn Feel** — Rough.js навмисно створює ескізний вигляд, знижуючи тиск перфекціонізму
- **Canvas-First** — Zen mode, мінімалістичний toolbar, keyboard shortcuts для всього
- **Collaboration без Accounts** — посилання = запрошення; ephemeral стан колаборантів

---

## 6. Технічні обмеження

| Категорія | Деталі |
|-----------|--------|
| **Runtime** | Browser-only (Canvas API); Node ≥ 18; React 17–19; Chrome 70+, Safari 12+, Edge 79+ |
| **Persistence** | localStorage (AppState), IndexedDB (Library, files), Firebase (shared scenes), URL hash (collab key). Немає серверного persistence для не-shared сцен |
| **Мережа** | Socket.io 4.7.2 (collab), Firebase 11.3.1, PWA offline, E2E encryption (ключ у URL hash) |
| **Canvas perf** | Viewport culling, dual canvas (Static+Interactive), memoisation за `sceneNonce`, `throttleRAF` |
| **Розмір сцени** | JSON без ліміту; base64 images збільшують файл; Firebase ≤1 МБ/doc; тисячі елементів сповільнюють culling |
| **Build** | TypeScript `strict: true`; `@excalidraw/*` path aliases; Yarn 1.22 Workspaces; `size-limit` CI; coverage ≥ 60/70% |
| **Безпека** | `sanitize-url` (XSS), iframe domain whitelist, E2E collab, CSP у `vercel.json` |

---

## 7. Non-goals

Наступне свідомо **поза scope** продукту:

| Що | Чому |
|----|------|
| Повноцінний векторний редактор | Не Figma, не Illustrator; precision tools навмисно відсутні |
| Version history документів | Немає хмарного сховища версій; undo лише в рамках поточної сесії |
| Растрове редагування | Зображення вставляються as-is, без pixel-level editing |
| Вбудований відеодзвінок | `isInCall`/`isSpeaking` — лише UI-індикатори стану зовнішнього дзвінка |
| Серверний rendering контенту | Canvas API потребує браузер; SSR тільки для shell |
| Offline-first collab | При втраті мережі collab недоступний; offline = single-user |
| Авторизація / User accounts | На excalidraw.com — без accounts; Plus — окремий продукт |
| Мобільний нативний застосунок | Web-first; мобільний браузер підтримується, але без нативного UX |

---

## 8. Метрики успіху та залежності

**CI метрики:** coverage branches ≥ 70%, lines ≥ 60%; `size-limit` на кожен PR; `tsc --noEmit` = 0 помилок; `eslint --max-warnings=0`.

**Продуктові індикатори:** `action.trackEvent` (ActionSource analytics), Sentry error rate, Library publish engagement, locale coverage (Crowdin).

**Зовнішні сервіси:** Firebase (persistence/collab), Socket.io server (realtime), AI backend (`VITE_APP_AI_BACKEND`), Sentry, Vercel, Libraries CDN.

**Ключові npm deps:** `roughjs`, `jotai` 2.11, `firebase` 11.3, `socket.io-client` 4.7, `@radix-ui/*`, `idb-keyval`, `i18next`, `@codemirror/*`, `tinycolor2`.

---

## Суміжна документація

- [Architecture](../technical/architecture.md) — data flow, rendering pipeline
- [Domain Glossary](./domain-glossary.md) — термінологія проєкту
- [Dev Setup](../technical/dev-setup.md) — онбординг розробника
- [Tech Context](../memory/techContext.md) — технічний стек, версії
- [System Patterns](../memory/systemPatterns.md) — архітектурні патерни
