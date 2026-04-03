# Project Brief: Excalidraw

## Призначення

Це форк **Excalidraw** — відкритого веб-застосунку для створення діаграм і схем у стилі "від руки".

Інтерактивна онлайн-дошка для малювання, з підтримкою:
- Фігур, ліній, тексту та вільного малювання
- Real-time колаборації (multiplayer)
- Експорту в SVG/PNG
- PWA-режиму (офлайн)
- Вбудовування як React-компонента в сторонні проєкти

## Стек технологій

| Категорія | Технологія |
|---|---|
| UI | React 19, TypeScript 5.9 |
| Збірка | Vite 5, Yarn (monorepo) |
| Стан | Jotai (atomic state) |
| Графіка | RoughJS, Perfect Freehand, Canvas |
| Колаборація | Socket.io, Firebase/Firestore |
| Тести | Vitest |
| Стиль | Sass/SCSS, CSS Modules |

## Структура репозиторію

```
├── excalidraw-app/        # Основний веб-застосунок (App.tsx, collab/, components/)
├── packages/
│   ├── excalidraw/        # Бібліотека @excalidraw/excalidraw (v0.18.0)
│   ├── common/            # Спільні утиліти та константи
│   ├── element/           # Типи та трансформації елементів
│   ├── math/              # Геометричні утиліти
│   └── utils/             # Експорт (SVG, PNG, Blob)
├── examples/              # Інтеграційні приклади (Next.js, browser)
├── firebase-project/      # Конфіг Firebase
└── scripts/               # Build-скрипти
```

Монорепозиторій Yarn Workspaces. Застосунок (`excalidraw-app`) споживає пакети з `packages/`, які також публікуються окремо на npm.
