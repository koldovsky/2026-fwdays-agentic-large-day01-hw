# Excalidraw — Project Brief

## Назва та опис

- **Назва**: Excalidraw
- **Опис**: Відкрита колаборативна дошка для малювання у стилі "від руки" (hand-drawn). Основний продукт — React-компонент (`@excalidraw/excalidraw`), який можна вбудовувати у будь-який React-додаток.
- **Ліцензія**: MIT (Copyright 2020 Excalidraw)
- **Репозиторій**: https://github.com/excalidraw/excalidraw
- **Версія пакетів**: 0.18.0 (`@excalidraw/common`, `@excalidraw/element`, `@excalidraw/excalidraw`, `@excalidraw/math`)

## Основна мета

Надати простий, інтуїтивний інструмент для створення діаграм та ескізів з підтримкою реального часу (collaboration), який можна як використовувати як самостійний додаток, так і вбудовувати у сторонні проєкти.

## Ключові фічі

1. **Hand-drawn стиль рендерингу** — використання roughjs для візуалів "від руки"
2. **Realtime collaboration** — спільне редагування через WebSocket (Socket.io)
3. **Вбудовуваний React-компонент** — NPM-пакет для інтеграції в інші додатки
4. **Офлайн-підтримка** — IndexedDB та localStorage для локального збереження
5. **Експорт** — SVG, PNG, JSON формати
6. **Бібліотеки елементів** — система спільних бібліотек (`libraries.excalidraw.com`)
7. **AI-інтеграція** — окремий AI-бекенд для генерації
8. **Інтернаціоналізація (i18n)** — підтримка багатьох мов
9. **PWA** — Progressive Web App режим (опціональний)
10. **Undo/Redo** — дельта-базована система історії з підтримкою колаборації

## Цільова аудиторія / Use Cases

- **Кінцеві користувачі**: дизайнери, розробники, менеджери — для швидких діаграм, ескізів, wireframes
- **Розробники**: інтеграція компонента Excalidraw у свої React-додатки (документація, інструменти, редактори)
- **Команди**: спільне малювання в реальному часі для мозкових штурмів та планування

## Структура репозиторію

```
excalidraw/
├── excalidraw-app/              # Головний додаток (React + Vite)
│   ├── App.tsx                  # Основний компонент
│   ├── components/              # AI, Footer, MainMenu, Sidebar
│   ├── data/                    # Firebase, localStorage, tabSync
│   ├── collab/                  # Логіка колаборації
│   ├── share/                   # Функціонал шерінгу
│   └── tests/                   # Інтеграційні тести
├── packages/
│   ├── common/                  # @excalidraw/common — утиліти, константи
│   ├── element/                 # @excalidraw/element — елементи, Scene, Store
│   ├── excalidraw/              # @excalidraw/excalidraw — React-компонент
│   │   ├── actions/             # action-файли (command pattern)
│   │   ├── components/          # UI-компоненти
│   │   ├── renderer/            # Canvas рендерер (static, interactive, SVG)
│   │   ├── data/                # Серіалізація, імпорт/експорт
│   │   ├── fonts/               # Шрифти
│   │   └── tests/               # Тести компонентів
│   ├── math/                    # @excalidraw/math — геометрія, вектори
│   └── utils/                   # @excalidraw/utils — загальні утиліти
├── examples/
│   ├── with-nextjs/             # Приклад з Next.js
│   └── with-script-in-browser/  # Приклад через <script> тег
├── scripts/                     # Скрипти збірки та релізу
├── firebase-project/            # Конфігурація Firebase
├── public/                      # Статичні ресурси
├── .github/workflows/           # CI/CD workflows
├── docs/                        # Документація
├── package.json                 # Корінь монорепо (Yarn Workspaces)
├── tsconfig.json                # TypeScript конфігурація
├── vitest.config.mts            # Конфігурація тестів
├── Dockerfile                   # Docker (Node.js 18 → Nginx)
├── docker-compose.yml           # Docker Compose для розробки
├── vercel.json                  # Деплой на Vercel
└── .env.development / .env.production  # Змінні середовища
```

## Ключові посилання

- **Документація компонента**: `/packages/excalidraw/README.md`
- **Приклади інтеграції**: `/examples/`
- **Бібліотеки**: https://libraries.excalidraw.com
- **Продакшн**: https://excalidraw.com
