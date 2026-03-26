# Active context (фокус роботи)

Цей файл **не генерується автоматично** з репозиторію. Нижче — структура для ручного оновлення + факти про те, де в коді зосереджена логіка за типом задачі.

## Поточний фокус (оновлювати під час сесії)

| Поле | Значення |
|------|----------|
| **Активна задача** | _заповнити вручну_ |
| **Гілка / PR** | _за потреби_ |
| **Обмеження** | _дедлайн, scope, out-of-scope_ |

## Типові зони коду за типом змін

- **Поведінка редактора, стейт сцени, історія** — `packages/excalidraw/components/App.tsx`, `packages/excalidraw/actions/`, `packages/element/src/Scene.ts`, `packages/element/src/store.ts`, `packages/excalidraw/history.ts`.
- **Рендеринг canvas** — `packages/excalidraw/renderer/staticScene.ts`, `interactiveScene.ts`, `packages/excalidraw/components/canvases/`, `packages/excalidraw/scene/Renderer.ts`; малювання елемента — `@excalidraw/element` (`renderElement`).
- **Публічний API вбудовування** — `packages/excalidraw/index.tsx`, `packages/excalidraw/types.ts`.
- **Хост-застосунок (продакшен-клієнт)** — `excalidraw-app/` (Vite, колаб, Firebase тощо за `excalidraw-app/package.json`).
- **Приклади інтеграції** — `examples/*` (workspaces у кореневому `package.json`).
- **Тести** — `vitest.config.mts`, `yarn test` / `yarn test:all` (скрипти кореневого `package.json`).

## Документація в цьому клоні

- Memory Bank: `docs/memory/` (`projectbrief`, `techContext`, `systemPatterns`, `productContext`, цей файл, `progress`, `decisionLog`).

**Technical** (`docs/technical/`):

- [architecture.md](../technical/architecture.md)
- [dev-setup.md](../technical/dev-setup.md)
- [undocumented-behavior.md](../technical/undocumented-behavior.md)

**Product** (`docs/product/`):

- [PRD.md](../product/PRD.md)
- [domain-glossary.md](../product/domain-glossary.md)

## Примітка щодо «поточного фокусу» репозиторію

У корені **немає** `README` / `CONTRIBUTING` / backlog-файлу з описом активного спринту — **пріоритети команди з коду не відновлюються**. Для навчального клону (назва папки `2026-fwdays-agentic-large-day01-hw`) фокус визначається вимогами викладача або власним планом; зафіксуйте його в таблиці вище.
