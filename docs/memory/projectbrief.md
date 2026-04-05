# Excalidraw: Project Brief

## Details

For detailed architecture -> see `docs/technical/architecture.md`  
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

## Верифіковано по source code

- Monorepo/workspaces/scripts: `package.json` (repo root).
- Позиціонування бібліотеки: `packages/excalidraw/README.md`, `packages/excalidraw/package.json`.
- Межа app vs library: `excalidraw-app/package.json`, `excalidraw-app/index.tsx`, `packages/excalidraw/index.tsx`.
- Ліцензія: `packages/excalidraw/package.json` (`license: MIT`).
