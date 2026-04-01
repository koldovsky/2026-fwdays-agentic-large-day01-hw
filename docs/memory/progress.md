# Прогрес проєкту

Короткий зріз стану репозиторію `2026-fwdays-agentic-large-day01-hw` (форк монорепи Excalidraw). Детальніше: `projectbrief.md`, `activeContext.md`, `docs/technical/architecture.md`.

---

## Поточний прогрес проєкту

- **База:** монорепозиторій Yarn — `excalidraw-app` (Vite SPA), пакети `packages/*` (`@excalidraw/excalidraw`, `element`, `common`, `math`, `utils`), приклади `examples/*`. Стек: React 19, TypeScript 5.9, Vite 5, Vitest; колаборація в клієнті через Firebase та socket.io.
- **Історія форку:** активні коміти з **2026-03-23**; розвиток Memory Bank і технічної документації (березень — початок квітня 2026).
- **Готовність:** зібраний SPA і SDK очікуються як у `projectbrief.md` — `yarn start` для деву, `vite build` + Nginx/Docker для продакшену.
- **У роботі / локально:** незакомічені зміни в Docker, Vite, залежностях і `architecture.md`; частина файлів у `docs/` потребує узгодження з git (див. `activeContext.md`).

---

## Кількість відкритих issues (GitHub)

**0** відкритих issues — за метаданими репозиторію `eonishchenko/2026-fwdays-agentic-large-day01-hw` (поле `open_issues_count`, станом на **2026-04-01**).

> Якщо потрібен актуальний лічильник пізніше: [Issues на GitHub](https://github.com/eonishchenko/2026-fwdays-agentic-large-day01-hw/issues?q=is%3Aissue+is%3Aopen).

---

## Критичні issues (зафіксовані в репозиторії)

На GitHub відкритих issues немає; нижче — **критичні архітектурні ризики**, описані в `docs/memory/decisionLog.md` і `activeContext.md` (короткий зміст **5–10 слів** кожен).

| # | Джерело | Короткий зміст (5–10 слів) |
|---|---------|----------------|
| 1 | `excalidraw-app/data/FileManager.ts` | Помилка збереження блокує повторні спроби; полотно розходиться з файлами. |
| 2 | `packages/excalidraw/index.tsx` | Нормалізація `UIOptions` в рендері ламає передбачуваність `React.memo`. |
| 3 | `excalidraw-app/collab/Collab.tsx` | Старт колаборації залежить від порядку подій socket і реконектів. |

---

*Оновлено: 2026-04-01.*
