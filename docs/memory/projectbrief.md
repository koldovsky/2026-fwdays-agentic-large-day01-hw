# Project Brief

## Що це за проєкт

**Excalidraw** — відкритий (MIT) онлайн-редактор векторних схем із візуальним стилем «від руки».
Основний репозиторій — монорепо, яке містить як публічну веб-застосунок (`excalidraw-app`), так і бібліотечні пакети (`packages/*`).

## Основна мета

- Надати простий whiteboard-інструмент для швидкого скетчингу діаграм, схем та ідей
- Опублікувати перевикористовувану React-бібліотеку `@excalidraw/excalidraw` для вбудовування у сторонні проєкти
- Підтримувати реальну колаборацію декількох користувачів з end-to-end шифруванням

## Аудиторія

- Кінцеві користувачі → `excalidraw.com` (веб-застосунок)
- Розробники → npm-пакет `@excalidraw/excalidraw`
- Самостійне хостування → Docker-образ + Firebase

## Ключові можливості

- Малювання з імітацією «від руки» (Rough.js + Perfect-freehand)
- Реальна колаборація через WebSocket (Socket.IO)
- PWA — офлайн-режим, встановлення на пристрій
- Експорт у PNG, SVG, JSON
- Імпорт Mermaid-діаграм
- Кастомні шрифти: Virgil, Cascadia, Assistant
- Мультимовний інтерфейс (i18next, 80+ локалей)
- End-to-end шифрування сесій

## Структура монорепо

```text
/
├── excalidraw-app/          # Веб-застосунок (SPA на React + Vite)
├── packages/
│   ├── common/              # @excalidraw/common  — спільні утиліти
│   ├── element/             # @excalidraw/element — логіка елементів
│   ├── excalidraw/          # @excalidraw/excalidraw — публічна бібліотека
│   ├── math/                # @excalidraw/math    — 2D геометрія
│   └── utils/               # @excalidraw/utils   — загальні хелпери
├── examples/
│   ├── with-nextjs/         # Приклад інтеграції з Next.js
│   └── with-script-in-browser/
├── scripts/                 # Build/release утиліти
└── firebase-project/        # Firebase конфігурація
```

## Ліцензія та версія

- Ліцензія: **MIT**
- Версія app: `1.0.0`
- Версія packages: `0.18.0`
- Node.js: `>= 18.0.0`
- Package manager: **Yarn** 1.22.22 (Yarn Workspaces)

## Деплоймент

- **Vercel** — основний хостинг (`vercel.json` сконфігуровано)
- **Docker** — `Dockerfile` + `docker-compose.yml` для self-hosting
- **Firebase** — Firestore для зберігання сесій + бекенд колаборації
- Окремі Firebase-проєкти для `development` та `production`

## Details

For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)
For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
