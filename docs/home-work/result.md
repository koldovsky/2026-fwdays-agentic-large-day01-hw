# Порівняння `start.md` і `finish.md`

## Оцінка

- `docs/home-work/start.md` — 7/10
- `docs/home-work/finish.md` — 9/10

## Висновок

Більш точний контекст про проект дає `finish.md`.

## Чому `finish.md` кращий

- Точніше описує межі репозиторію: publishable editor package, standalone/reference app, examples, internal packages.
- Правильно відділяє те, що є в репозиторії, від того, чого тут немає: backend implementations для share/websocket/Firebase/AI винесені за межі repo.
- Краще передає продуктову суть: browser-first whiteboard/diagramming для кінцевих користувачів і для React-інтеграцій.
- Дає важливий архітектурний контекст: layered monorepo, local-first baseline, app-specific integrations.

## Чому `start.md` слабший

- Більше схожий на технічний огляд стеку, ніж на точний проектний контекст.
- Не так чітко формулює межі repo і ролі його частин.
- Містить менш важливі для загального контексту акценти, зокрема на кшталт `Vercel`, що не є однією з головних характеристик проекту.

## Підсумок

`start.md` кращий як швидкий технічний огляд, а `finish.md` кращий як точний контекст проекту.
