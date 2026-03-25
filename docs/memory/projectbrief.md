# Project Brief

## Що це за проєкт

**Excalidraw** — open-source браузерний інструмент для малювання діаграм і схем у стилі "від руки".
Репозиторій є **монорепо** з двома продуктами в одному:

1. **Веб-застосунок** (`excalidraw-app/`) — повноцінний SPA за адресою excalidraw.com
2. **npm-пакет** (`packages/excalidraw/`) — React-компонент `@excalidraw/excalidraw` для вбудовування в сторонні застосунки

## Основна мета

- Надати **найпростіший** інструмент для швидкого малювання схем прямо в браузері
- Забезпечити **real-time колаборацію** — кілька користувачів на одній дошці
- Публікувати перевикористовуваний **npm-пакет** для вбудовування (Next.js, CRA, Vite тощо)
- Підтримувати **офлайн-режим** через PWA

## Ключові можливостіF 

- Infinite canvas з фігурами, стрілками, текстом, зображеннями, фреймами
- Hand-drawn стиль через RoughJS + perfect-freehand
- Undo/Redo через delta-based history
- Колаборація через WebSocket (excalidraw-room)
- AI-функції: Mermaid → діаграми, text-to-diagram (TTD)
- Бібліотека елементів (публічна + локальна)
- Експорт: PNG, SVG, JSON, `.excalidraw`
- i18n: 80+ мов через Crowdin
- Encrypt-then-share: URL зі вбудованою сценою (E2E шифрування)

## Межі системи

```
[Browser]
  ├── excalidraw-app (SPA)
  │     ├── Firebase (persistence колаб-сесій)
  │     ├── excalidraw-room (WebSocket, окремий сервіс)
  │     ├── AI backend (localhost:3016 в dev)
  │     └── Sentry (моніторинг помилок)
  └── @excalidraw/excalidraw (npm пакет)
        └── вбудовується в будь-який React-застосунок
```

## Аудиторія

- **Кінцеві користувачі** — excalidraw.com
- **Розробники** — вбудовують `@excalidraw/excalidraw` у власні продукти
- **Контрибʼютори** — open-source спільнота (MIT ліцензія)

## Структура монорепо

```
/
├── excalidraw-app/     # Веб-застосунок (Vite SPA)
├── packages/
│   ├── excalidraw/     # Головний npm-пакет (@excalidraw/excalidraw)
│   ├── element/        # Логіка елементів (@excalidraw/element)
│   ├── common/         # Спільні утиліти (@excalidraw/common)
│   ├── math/           # 2D математика (@excalidraw/math)
│   └── utils/          # Публічні утиліти (@excalidraw/utils)
└── examples/
    ├── with-nextjs/
    └── with-script-in-browser/
```

## Відповідальності пакетів

| Пакет | Відповідальність |
|---|---|
| `@excalidraw/excalidraw` | React UI, canvas рендеринг, state management, history |
| `@excalidraw/element` | Типи елементів, hit-testing, трансформації, Store, delta |
| `@excalidraw/common` | Константи, утиліти, кольори, event helpers |
| `@excalidraw/math` | Вектори, геометрія, 2D алгебра |
| `@excalidraw/utils` | Публічний API: export функції, bbox утиліти |
| `excalidraw-app` | Колаборація (Firebase + Socket.io), Sentry, share, AI |

---

## Дивись також

- [PRD](../product/PRD.md) — повні продуктові вимоги
- [Product Context](./productContext.md) — мета продукту та UX-принципи
- [Tech Context](./techContext.md) — стек, команди, CI/CD
- [System Patterns](./systemPatterns.md) — архітектурні патерни
- [Domain Glossary](../product/domain-glossary.md) — терміни: Scene, Store, Action...
