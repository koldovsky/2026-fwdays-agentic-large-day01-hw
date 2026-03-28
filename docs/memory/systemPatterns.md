# System patterns

> Файл названо **`systemPaterns.md`** відповідно до вимоги; зміст описує архітектурні патерни з коду.

## Монорепозиторій (Yarn Workspaces)

- **Патерн**: один репозиторій, кілька пакетів із спільним lockfile (`yarn.lock`) і workspace-політикою (кореневий `package.json`, `workspaces`).
- **Наслідок**: залежності й скрипти оркеструються з кореня (`build:packages`, `test:all`), а застосунок живе окремим пакетом `excalidraw-app`.

## Шаруваті пакети (package boundaries)

- **`@excalidraw/common`**: «common functions, constants» (`packages/common/package.json`, `description`).
- **`@excalidraw/math`**: математика/геометрія для редактора (окремий пакет; збірка `build:math` у корені).
- **`@excalidraw/element`**: логіка елементів canvas (`packages/element/package.json`: *elements-related logic*), залежить від `common` + `math`.
- **`@excalidraw/utils`**: утиліти (окремий пакет у `packages/utils`).
- **`@excalidraw/excalidraw`**: React-компонент/обвʼязка редактора, агрегує залежності (див. `dependencies` у `packages/excalidraw/package.json`: `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, UI-бібліотеки тощо).

## Застосунок як композиція shell + бібліотеки

- **Точка входу**: `excalidraw-app/index.tsx` — `createRoot`, реєстрація PWA service worker (`virtual:pwa-register`), рендер `<ExcalidrawApp />`.
- **Кореневий layout**: `excalidraw-app/App.tsx` — обгортки `TopErrorBoundary`, Jotai `Provider`, `ExcalidrawAPIProvider`, далі основний wrapper.
- **Патерн**: *application shell* (`excalidraw-app`) імпортує/налаштовує інтеграції (за залежностями: Firebase, Socket.IO, Sentry), а доменна логіка малювання зосереджена в пакетах `@excalidraw/*`.

## Керування станом: Jotai atoms

- У `excalidraw-app/App.tsx` використовуються `useAtom`, `useAtomValue`, `atom`-сумісні хелпери (наприклад, `shareDialogStateAtom`, `collabAPIAtom`, `isCollaboratingAtom`).
- **Патерн**: дрібнозернистий глобальний стан через atoms + React hooks (залежність `jotai` у `excalidraw-app/package.json` і `packages/excalidraw/package.json`).

## Збірка та dev: Vite + alias до сорців

- **Патерн**: у dev збірка йде напряму на TypeScript/TSX сорці через `resolve.alias` у `excalidraw-app/vite.config.mts` для `@excalidraw/common|element|excalidraw|math|utils`.
- **Паралельно**: кореневий `tsconfig.json` містить `paths` для тих самих імпортів — зручність для IDE/typecheck.

## PWA та офлайн/кешування

- `excalidraw-app/index.tsx` імпортує `registerSW` з `virtual:pwa-register` (генерується Vite PWA плагіном; плагіни підключені в `vite.config.mts`).
- **Патерн**: Progressive Web App (service worker) для оновлення клієнтського бандла.

## Спостереження щодо DDD

- У репозиторії **немає** явних каталогів на кшталт `domain/`, `application/`, `infrastructure/` як у класичному DDD-скелетоні.
- Натомість видно **практичне розділення за пакетами** (`common` / `math` / `element` / `excalidraw`) і **окремий застосунковий шар** `excalidraw-app` — це ближче до *modular monolith + shared libraries*, ніж до формального DDD.
