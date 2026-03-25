# Progress: Excalidraw

> Оновлено: 2026-03-25

## Загальна зрілість проєкту

| Аспект           | Статус              | Деталі                          |
| ---------------- | ------------------- | ------------------------------- |
| Функціональність | ✅ Production-ready | v0.18.0, excalidraw.com         |
| npm пакет        | ✅ Stable           | `@excalidraw/excalidraw@0.18.x` |
| Collab           | ✅ Production       | Firebase + WebSocket            |
| PWA              | ✅ Production       | Service Worker, offline         |
| TypeScript       | ✅ Strict           | `5.9.x`, strict mode            |
| Test coverage    | ⚠️ Partial          | Vitest, не всі файли покриті    |
| Documentation    | ⚠️ External         | `docs.excalidraw.com`           |

## Версійна історія (major milestones)

| Версія | Дата | Ключові фічі |
| --- | --- | --- |
| 0.18.0 | 2025-03-11 | Elbow arrows, Flowcharts, Multiplayer undo, Command palette, Image crop, Scene search |
| 0.17.x | — | Fractional indexing, mermaid integration |
| 0.16.x | — | LinearElementEditor, LaserPointer |
| Unreleased | поточний | Lifecycle events API, `ExcalidrawAPIProvider` |

## Що реалізовано (core features)

### Drawing Tools ✅

- [x] Rectangle, Ellipse, Diamond, Line, Arrow (straight + elbow)
- [x] FreeDraw, Text (WYSIWYG)
- [x] Image embed (drag&drop, clipboard)
- [x] Embed (YouTube, Vimeo, Gist та ін.)
- [x] Frame (grouping region)
- [x] Laser pointer, Eraser, Lasso select

### Canvas UX ✅

- [x] Infinite scroll + zoom
- [x] Snap to grid / snap to objects
- [x] Element alignment + distribution
- [x] Group / Ungroup
- [x] Element locking
- [x] Z-index (front/back)
- [x] Flip horizontal/vertical
- [x] Copy/Paste styles
- [x] Flowchart navigation (⌘+arrow)
- [x] Element linking (hyperlinks between elements)

### Collaboration ✅

- [x] Shareable link (encrypted, Firebase)
- [x] Real-time room (WebSocket)
- [x] Multiplayer cursors + usernames
- [x] Follow mode (view through another user's viewport)
- [x] Multiplayer undo/redo

### Data & Persistence ✅

- [x] LocalStorage autosave
- [x] IndexedDB для files (images) і library
- [x] Export: JSON `.excalidraw`, PNG, SVG, clipboard
- [x] Import: drag&drop, URL, File API, Web Share Target
- [x] Library (custom elements): IndexedDB + LocalStorage migration

### AI / Advanced ✅

- [x] Text-to-diagram (Mermaid auto-detect on paste)
- [x] TTD Dialog (AI stream backend)
- [x] DiagramToCode plugin

### Accessibility ⚠️

- [ ] Повноцінна клавіатурна навігація для complex interactions
- [ ] ARIA labels — частково

### Testing ⚠️

- [x] Unit тести для утиліт, scene, дій
- [x] Snapshot тести для rendering
- [ ] E2E тести відсутні у цьому репо
- [ ] Low coverage для `App.tsx` та collab

### Internalization ✅

- [x] 30+ мов через Crowdin
- [x] Lazy-loaded locale chunks
- [x] Смарт-детектування мови браузера

## Tech debt / Known Issues

| Проблема | Файл | PR/Issue |
| --- | --- | --- |
| `App.tsx` God Object ~12 800 рядків | `components/App.tsx` | Ongoing refactor |
| Touch + pointer events (змішані) | `App.tsx:L689` | TODO comment |
| Bounding box math накопичує edge cases | `renderer/` | Multiple fixes |
| Elbow arrow routing — складна логіка | `@excalidraw/element` | Known quirks |

## Деплой статус

- ✅ `excalidraw.com` — Vercel, auto-deploy з main
- ✅ npm `@excalidraw/excalidraw` — manual release via `yarn release`
- ✅ Docker образ — `yarn build:app:docker`
