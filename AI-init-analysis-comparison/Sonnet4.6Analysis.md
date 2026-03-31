

## Про проєкт

### Призначення
Це **монорепозиторій Excalidraw** — відкрита інтерактивна whiteboard-дошка для малювання схем і діаграм у стилі "від руки". Репозиторій є домашнім завданням до воркшопу **fwdays 2026 "Agentic Large"** (день 1), побудованим на базі офіційного Excalidraw-монорепо.

---

### Основний стек технологій

| Шар | Технологія |
|---|---|
| Мова | **TypeScript** |
| UI | **React 19** (функціональні компоненти + хуки) |
| Збірка | **Vite** (app + пакети) |
| Тести | **Vitest** + jsdom |
| Пакетний менеджер | **Yarn 1 (Workspaces)** |
| Стан | **Jotai** (atom-based) |
| Реалтайм-колаб | **Firebase** + WebSocket (Socket.IO) |
| CSS | CSS Modules / SCSS |
| PWA | `vite-plugin-pwa` |
| Деплой | **Vercel** + Docker |
| Linting | ESLint + Prettier |

---

### Структура репозиторію

```text
/
├── excalidraw-app/        # Основний React-застосунок (excalidraw.com)
│   ├── App.tsx            # Кореневий компонент
│   ├── collab/            # Логіка реального колаборування
│   ├── components/        # App-специфічні компоненти (AI, Footer, Menu…)
│   └── data/              # Firebase, FileManager, синхронізація
│
├── packages/              # Yarn Workspaces — публічні npm-пакети
│   ├── common/            # @excalidraw/common — утиліти, константи, типи
│   ├── math/              # @excalidraw/math — геометрія (Point, Vector, Curve…)
│   ├── element/           # @excalidraw/element — типи і логіка елементів
│   ├── excalidraw/        # @excalidraw/excalidraw — React-компонент (головний)
│   └── utils/             # @excalidraw/utils — утиліти для зовнішнього вжитку
│
├── examples/
│   ├── with-nextjs/       # Приклад інтеграції з Next.js
│   └── with-script-in-browser/ # CDN/браузерний приклад (Vite)
│
├── scripts/               # Release, build, changelog-скрипти
├── public/                # Статичні ресурси (шрифти, іконки, PWA-маніфест)
├── AI/                    # Аналітичні нотатки й порівняння моделей
├── vitest.config.mts      # Конфіг тестів з path-aliases
└── package.json           # Кореневий workspace + спільні devDeps
```

---

### Ключові деталі
- **`packages/excalidraw`** — серцевина: React-компонент `<Excalidraw />`, який публікується на npm і може бути вбудований у будь-який застосунок.
- **`packages/math`** містить власну геометричну бібліотеку (`Point`, `Vector`, `Curve`, `Ellipse`, `Polygon` тощо) без зовнішніх залежностей.
- **`excalidraw-app`** — повноцінний продакшн-застосунок з PWA, колаборацією, AI-інтеграцією та Firebase-бекендом.
- Всі пакети будуються у ESM-форматі і зв'язані між собою через Vite-аліаси під час розробки.

