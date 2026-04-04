# Project Brief — Excalidraw

## Що це за проєкт

Це **навчальний воркшоп «Agentic IDE, День 1»** від **fwdays** (2026).
Репозиторій є **форком офіційного монорепо [Excalidraw](https://github.com/excalidraw/excalidraw)**,
доповненим конфігурацією для **автоматичної перевірки (auto-grading) домашніх завдань**
учасників воркшопу через CodeRabbit AI.

---

## Призначення

- **Веб-редактор** діаграм у стилі скетчу (схеми, малюнки «від руки»).
- **Бібліотека** `@excalidraw/excalidraw` — React-компонент для вбудовування редактора в інші застосунки.
- **`excalidraw-app`** — повний продуктовий застосунок; **`examples/`** — приклади інтеграції.

Учасники форкають цей репозиторій і виконують завдання кроками, які перевіряє CodeRabbit у PR:

| Крок | Завдання |
|------|----------|
| **Крок 2** | Створити `.cursorignore` з патернами виключення для великого монорепо |
| **Крок 4** | **Memory Bank** — три файли в `docs/memory/`: `projectbrief.md`, `techContext.md`, `systemPatterns.md` |
| **Крок 5** | **Technical Docs** — `docs/technical/architecture.md` + **Product Docs** — `docs/product/domain-glossary.md` та `docs/product/PRD.md` |

Весь auto-grading описаний у `.coderabbit.yaml` в корені — мовою навчання: **Ukrainian** (`uk-UA`).

---

## Основний стек технологій

| Категорія | Технології |
|-----------|------------|
| **UI / Бібліотека** | **React 19**, **TypeScript 5.9** |
| **Збірка** | **Vite 5**, Yarn Workspaces (Yarn 1.22) |
| **Стан у застосунку** | **Jotai 2** |
| **Бекенд / реалтайм** | **Firebase 11**, **Socket.io-client 4** |
| **Моніторинг** | **Sentry** |
| **i18n** | i18next, Crowdin |
| **Тестування** | **Vitest 3**, jsdom, vitest-canvas-mock |
| **Якість коду** | ESLint, Prettier, Husky, lint-staged |
| **CI/CD** | GitHub Actions, Vercel, Docker |
| **Auto-review** | **CodeRabbit** (`assertive` profile, Ukrainian) |
| **Вимоги** | Node ≥ 18 |

---

## Структура репозиторію

```
.
├── excalidraw-app/          # Головний Vite-застосунок (excalidraw.com)
│   ├── App.tsx              # Кореневий React-компонент (~40 KB)
│   ├── collab/              # Логіка колаборації (Socket.io)
│   ├── components/          # UI-компоненти застосунку
│   ├── data/                # Серіалізація, persistence, Firebase
│   └── share/               # Функціональність "поділитись"
│
├── packages/                # Монорепо-пакети (Yarn workspaces)
│   ├── excalidraw/          # @excalidraw/excalidraw — публікуємий React-компонент
│   ├── element/             # Логіка елементів (фігури, трансформації)
│   ├── common/              # Спільні утиліти між пакетами
│   ├── math/                # Геометрія та математика
│   └── utils/               # Загальні утиліти
│
├── examples/
│   ├── with-nextjs/         # Інтеграція з Next.js
│   └── with-script-in-browser/  # Вбудовування через <script>
│
├── scripts/                 # Допоміжні скрипти (release, locales, build)
├── firebase-project/        # Firebase конфігурація
├── .github/workflows/       # CI: lint, test, docker, sentry, coverage
├── .coderabbit.yaml         # ← Конфігурація auto-grading воркшопу
├── vitest.config.mts        # Конфігурація тестів
└── package.json             # Корінь монорепо
```

---

## Підсумок

Це Excalidraw (відкритий whiteboard-редактор з collaborative малюванням) як навчальна
платформа для відпрацювання навичок роботи з Agentic IDE (Cursor) — учасники вивчають,
як AI-агент орієнтується у великій кодовій базі, налаштовують Memory Bank та документують
архітектуру проєкту.

---

## Додаткова документація

For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)
For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
