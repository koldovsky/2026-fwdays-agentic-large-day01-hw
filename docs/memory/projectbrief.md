# Project Brief — Excalidraw

## Що це за продукт

**Excalidraw** — відкритий (open-source) веб-інструмент для створення діаграм, схем і ілюстрацій у стилі hand-drawn sketch. Ескізний, навмисно «нечіткий» стиль (через [Rough.js](https://roughjs.com/)) знижує когнітивний бар'єр: користувач фокусується на ідеї, а не на форматуванні.

**Ключова цінність:** *відкрив → одразу малюєш* — без реєстрації, без налаштувань, zero friction.

---

## Основні можливості

| Можливість | Деталі |
|------------|--------|
| **Whiteboard-редактор** | 16+ інструментів (прямокутники, стрілки, freehand, текст, зображення, фрейми тощо), ~80 дій (align, rotate, z-order, crop…) |
| **Realtime Collaboration** | Socket.io + Firebase; link-based кімнати без accounts; видимі курсори, follow-mode, laser pointer |
| **Export / Import** | PNG, SVG, `.excalidraw` JSON, Mermaid-імпорт, clipboard, shareable URL + QR |
| **Бібліотека шаблонів** | IndexedDB каталог, публічні бібліотеки з `libraries.excalidraw.com` |
| **AI (optional/experimental)** | Text-to-Diagram (`TTDDialog`), Magic Frame — потребують зовнішнього AI-бекенду (`VITE_APP_AI_BACKEND`) |
| **Embeddable компонент** | NPM-пакет `@excalidraw/excalidraw` — React-компонент для вбудовування в інші застосунки |

---

## Архітектура продукту

| Рівень | Опис |
|--------|------|
| **excalidraw.com** | Повний Vite-застосунок (`excalidraw-app/`): Firebase persistence, Socket.io collab, Sentry, PWA, i18n (80+ мов) |
| **@excalidraw/excalidraw** | NPM-пакет v0.18.0 — embeddable React-компонент; peerDeps: React 17–19 |

---

## Стек технологій

| Категорія | Технології |
|-----------|------------|
| **UI / Бібліотека** | React 19, TypeScript 5.9 |
| **Збірка** | Vite 5, Yarn Workspaces (Yarn 1.22) |
| **Стан** | Jotai 2 |
| **Бекенд / Realtime** | Firebase 11, Socket.io-client 4 |
| **Моніторинг** | Sentry |
| **i18n** | i18next, Crowdin |
| **Тестування** | Vitest 3, jsdom, vitest-canvas-mock |
| **Якість коду** | ESLint, Prettier, Husky, lint-staged |
| **CI/CD** | GitHub Actions, Vercel, Docker |
| **Вимоги** | Node ≥ 18 |

---

## Структура репозиторію

```text
.
├── excalidraw-app/          # Головний Vite-застосунок (excalidraw.com)
│   ├── App.tsx              # Кореневий React-компонент
│   ├── collab/              # Логіка колаборації (Socket.io)
│   ├── components/          # UI-компоненти застосунку
│   ├── data/                # Серіалізація, persistence, Firebase
│   └── share/               # Функціональність "поділитись"
│
├── packages/                # Монорепо-пакети (Yarn workspaces)
│   ├── excalidraw/          # @excalidraw/excalidraw — React-компонент
│   ├── element/             # Логіка елементів (фігури, трансформації)
│   ├── common/              # Спільні утиліти
│   ├── math/                # Геометрія та математика
│   └── utils/               # Загальні утиліти
│
├── examples/                # Приклади інтеграції (Next.js, browser script)
├── scripts/                 # Допоміжні скрипти (release, locales, build)
├── firebase-project/        # Firebase конфігурація
├── .github/workflows/       # CI: lint, test, docker, sentry, coverage
├── vitest.config.mts        # Конфігурація тестів
└── package.json             # Корінь монорепо
```

---

## Контекст воркшопу

Цей репозиторій також використовується як навчальна платформа **fwdays «Agentic IDE, День 1» (2026)**. Учасники форкають репо та виконують кроки, які автоматично перевіряє CodeRabbit AI (конфігурація у `.coderabbit.yaml`).

---

## Додаткова документація

- [Architecture](../technical/architecture.md) — data flow, rendering pipeline
- [Domain Glossary](../product/domain-glossary.md) — термінологія проєкту
- [Dev Setup](../technical/dev-setup.md) — онбординг розробника
- [PRD](../product/PRD.md) — Product Requirements Document
