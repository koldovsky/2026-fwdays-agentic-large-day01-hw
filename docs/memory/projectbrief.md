# Project Brief: Excalidraw

## Що це?

**Excalidraw** — відкритий інструмент для малювання діаграм і схем з рукописним (hand-drawn) стилем прямо у браузері.

> "Excalidraw is a whiteboard tool that lets you easily sketch diagrams that have a hand-drawn feel to them." — `vite.config.mts`, PWA manifest description

## Основна мета

- Надати **простий, інтуїтивний** інструмент без кривої навчання
- Підтримати **реальний час** (collab): спільна робота кількох користувачів
- Публікуватися як **npm-пакет** `@excalidraw/excalidraw` для вбудовування у будь-який застосунок
- Бути **PWA**: працювати офлайн, встановлюватися як додаток

## Два продукти в одному репо

| Продукт | Директорія | Опис |
| --- | --- | --- |
| **excalidraw.com** | `excalidraw-app/` | Повноцінний standalone веб-застосунок |
| **npm пакет** | `packages/excalidraw/` | React-компонент для інтеграції |

## Монорепо

**Yarn Workspaces** + 4 публічних npm-пакети:

| Пакет | Npm | Роль |
| --- | --- | --- |
| `packages/excalidraw` | `@excalidraw/excalidraw` | Основний пакет (React-компонент) |
| `packages/element` | `@excalidraw/element` | Логіка елементів, типи |
| `packages/common` | `@excalidraw/common` | Спільні утиліти, константи |
| `packages/math` | `@excalidraw/math` | Математика (точки, вектори) |

## Поточна версія

- Пакет: `0.18.0` (released 2025-03-11), `Unreleased` у підготовці
- React: `19.0.x`
- TypeScript: `5.9.x`

## Основні можливості (user-facing)

- Малювання: прямокутники, еліпси, стрілки, лінії, текст, freehand
- Infinite canvas з zoom/scroll
- Вбудовані iframe/embeds (YouTube, Vimeo)
- Спільна робота через shareable link або room
- Бібліотека елементів (Library)
- Експорт: PNG, SVG, JSON (`.excalidraw`)
- Flowcharts, elbow arrows, frames
- Text-to-diagram (AI, Mermaid)
- Command palette (⌘K)
- Темна та світла теми
- 30+ мов (Crowdin)

## Ключові зовнішні залежності

- **Firebase** — зберігання shared scenes та файлів зображень
- **WebSocket server** — collab room (`excalidraw-room`, окремий проєкт)
- **Excalidraw Plus** — комерційний SaaS tier (`plus.excalidraw.com`)
- **CDN** (esm.run) — шрифти за замовчуванням

## Деплой

- **Vercel** — основний хостинг (`vercel.json`)
- **Firebase Hosting** — альтернативний
- **Docker** — `Dockerfile`, `docker-compose.yml` для self-hosting
- **GitHub Actions** — CI/CD pipeline

## Details

- For detailed architecture → see docs/technical/architecture.md
- For domain glossary → see docs/product/domain-glossary.md

## Ліцензія

MIT (permissive open-source)
