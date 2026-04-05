# Excalidraw: Product Context

## Details

For detailed architecture -> see `docs/technical/architecture.md`  
For technical setup -> see `docs/technical/dev-setup.md`  
For reverse-engineered PRD -> see `docs/product/PRD.md`  
For domain glossary -> see `docs/product/domain-glossary.md`

## Роль цього документа в memory bank

- Це короткий продуктово-UX контекст для швидкого онбордингу.
- Документ фіксує "що" і "для кого" робить Excalidraw на базовому рівні.
- Деталізацію сценаріїв, термінів і продуктових рішень треба уточнювати в `docs/product/*`.

## Продуктова суть

- Excalidraw дає швидке, low-friction полотно для візуального мислення: схеми, діаграми, скетчі, пояснення ідей.
- Проєкт існує у двох формах:
  - як готовий вебпродукт (`excalidraw-app`),
  - як embeddable editor SDK (`@excalidraw/excalidraw`) для інтеграторів.
- Базовий UX-фокус: почати малювати за секунди, без складного налаштування.

## UX-цілі (операційні, за поточною реалізацією)

- Швидкий старт вбудованого редактора: мінімальний setup (`<Excalidraw />`, CSS, контейнер з висотою).
- Передбачуване редагування сцени: події взаємодії, історія змін та API-колбеки винесені в явні контракти.
- Експорт у стандартні формати: підтримка PNG/SVG/JSON-потоків для обміну результатами.
- Локальна персистентність у web app: збереження елементів/стану та окремий lifecycle для binary files.
- Колаборація в реальному часі на app-рівні: sync елементів + collaborator presence через мережевий шар.
- Інтегровуваність у сторонні React-застосунки: набір пропсів/хуків для host-app сценаріїв.

## Ключові користувацькі сценарії

- Швидко накидати діаграму/схему для пояснення ідеї.
- Створити і відредагувати базові графічні елементи (shape, line/arrow, text, image, frame).
- Експортувати результат у PNG/SVG або скопіювати у буфер обміну.
- Повернутися до незбереженої вручну роботи через локальне відновлення стану.
- Спільно редагувати сцену в кімнаті колаборації (для web app).
- Вбудувати редактор у власний продукт як React-компонент і керувати інтеграційними подіями/API.

## Primary audiences

- Кінцеві користувачі вебапки: хочуть швидко візуалізувати ідеї без складного інструментарію.
- Інтегратори/розробники: хочуть додати надійний whiteboard-редактор у свій продукт з мінімальним часом інтеграції.

## Межі та не-цілі

- Це не "лише сайт Excalidraw": важливо враховувати dual nature (app + embeddable library).
- Не всі app-можливості є частиною публічного npm API бібліотеки.
- Цей memory-документ не замінює повну продуктову специфікацію; це стислий контекст для старту.
- Частина формулювань у цьому файлі є reverse-engineered висновками з поточної реалізації і має уточнюватись у `docs/product/*`.

## Що уточнювати в `docs/product`

- Розгорнуті user journeys за ролями (end user, integrator, collaborator).
- UX-принципи та критерії якості взаємодії (успішність сценарію, помилки, recovery flow).
- Продуктові обмеження/компроміси для collaboration, persistence, export/import.
- Глосарій термінів і межі понять (розширення `domain-glossary.md`).

## Верифіковано по source code

- `packages/excalidraw/README.md` — вимоги до мінімального embedding setup (`<Excalidraw />`, CSS, container height).
- `packages/excalidraw/types.ts` — публічний контракт `ExcalidrawProps` (events/hooks/API integration points).
- `packages/excalidraw/scene/export.ts` — експортні потоки (`exportToCanvas`, SVG/canvas rendering path, metadata handling).
- `excalidraw-app/data/LocalData.ts` — локальне збереження DataState (`localStorage` + IndexedDB через `idb-keyval`).
- `excalidraw-app/collab/Collab.tsx` — app-рівневий lifecycle колаборації (sync/presence/files/network orchestration).
- `excalidraw-app/index.html` — публічне продуктове позиціонування (collaborative whiteboard messaging).
