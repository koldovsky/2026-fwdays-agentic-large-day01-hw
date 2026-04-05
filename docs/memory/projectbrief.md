# Excalidraw: Project Brief

## Details

For detailed architecture -> see `docs/technical/architecture.md`  
For technical setup -> see `docs/technical/dev-setup.md`  
For product requirements -> see `docs/product/PRD.md`  
For domain glossary -> see `docs/product/domain-glossary.md`

## Що це за проєкт

- `excalidraw` — це monorepo, де є:
  - бібліотека `@excalidraw/excalidraw` (вбудований React-компонент редактора),
  - окремий вебзастосунок `excalidraw-app`,
  - внутрішні пакети `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/utils`,
  - приклади інтеграції в `examples/*`.
- Репозиторій орієнтований і на продукт (app), і на embeddable SDK (npm-пакет).
- Ліцензія бібліотеки: MIT.

## Основна мета

- Дати інтеграторам готовий React-редактор (`<Excalidraw />`), який можна швидко вбудувати у власний застосунок.
- Підтримувати повноцінний вебклієнт (`excalidraw-app`) для сценаріїв використання "з коробки".
- Забезпечити єдине ядро рендерингу/моделі сцени, яке перевикористовується у бібліотеці та app.

## Головна цінність для користувача та інтегратора

- Для інтегратора:
  - простий вхід: встановити пакет, підключити CSS, відрендерити компонент в контейнері з висотою;
  - сумісність із React 17/18/19 через peer dependencies;
  - API для інтеграції з експортом, подіями, ініціалізацією.
- Для кінцевого користувача app:
  - браузерна дошка з малюванням/редагуванням;
  - локальне збереження стану;
  - колаборація через socket/Firebase в app-рівні.

## Межі між бібліотекою і вебапкою

- `@excalidraw/excalidraw`:
  - постачається як npm-пакет,
  - містить UI/рендеринг/експорт/типи/API для вбудовування.
- `excalidraw-app`:
  - окрема збірка на Vite,
  - додає інфраструктурні речі (Sentry, Firebase, collab portal, app-специфічні стани).
- Висновок: app використовує бібліотеку як core-редактор, але додає продуктову обв'язку.

## Не-цілі (щоб уникати помилкових очікувань)

- Це не лише "сайт Excalidraw"; у репозиторії одночасно розвивається і reusable бібліотека.
- Не всі можливості app є частиною публічного npm API.

## Як новому розробнику використовувати docs у workflow

1) Старт онбордингу
- Пройди `docs/technical/dev-setup.md` (clone -> install -> run -> pre-PR checks).
- Перед першим PR звір чеклист у `.github/PULL_REQUEST_TEMPLATE.md`.

2) Швидке розуміння контексту перед задачею
- Прочитай `docs/memory/projectbrief.md` (цей файл), `docs/memory/techContext.md` і `docs/memory/systemPatterns.md`.
- Для поточного стану гілки/контексту звір `docs/memory/activeContext.md` і `docs/memory/progress.md`.

3) Вибір документів за типом зміни (практичні приклади)
- Якщо змінюєш core editor behavior (`packages/excalidraw`, `packages/element`) -> спочатку `docs/memory/decisionLog.md` + `docs/memory/systemPatterns.md`.
- Якщо змінюєш app-level фічі (`excalidraw-app`, collab/persistence/infra) -> спочатку `docs/product/PRD.md` + `docs/memory/productContext.md`.
- Якщо працюєш із setup/CI/tooling -> спочатку `docs/technical/dev-setup.md` + `.github/workflows/*`.

4) Мінімальний doc-check перед комітом
- Переконайся, що зміна не суперечить `docs/memory/decisionLog.md` (ADR/Undocumented behavior constraints).
- Якщо поведінка або процес змінились суттєво, онови відповідний документ у `docs/memory/*`, `docs/product/*` або `docs/technical/*`.

## Верифіковано по source code

- Monorepo/workspaces/scripts: `package.json` (repo root).
- Позиціонування бібліотеки: `packages/excalidraw/README.md`, `packages/excalidraw/package.json`.
- Межа app vs library: `excalidraw-app/package.json`, `excalidraw-app/index.tsx`, `packages/excalidraw/index.tsx`.
- Ліцензія: `packages/excalidraw/package.json` (`license: MIT`).
