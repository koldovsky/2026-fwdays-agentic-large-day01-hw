# Active context

## Поточний фокус

Кодова база — повноцінний **інтерактивний whiteboard-редактор** з монорепо-структурою. Три найактивніші фронти розвитку (за ознаками beta-міток, feature-флагів і відкритих TODO):

- **AI-поверхня (TTD + Diagram-to-Code)** — Text-to-Diagram позначений як **beta** (мітка `chat.aiBeta` — `packages/excalidraw/locales/en.json:654`, рендер у `packages/excalidraw/components/TTDDialog/TTDDialog.tsx:104`). Streaming до зовнішнього AI-бекенду через `VITE_APP_AI_BACKEND` (`excalidraw-app/components/AI.tsx:45,110`; env — `.env.production:12`, `.env.development:15`). Diagram-to-Code відправляє frame-children + dataURL на `/v1/ai/diagram-to-code/generate` (`excalidraw-app/components/AI.tsx:43-58`); plugin API — `packages/excalidraw/components/DiagramToCodePlugin/DiagramToCodePlugin.tsx`. Серверна частина в репо відсутня.
- **Complex Bindings** — єдиний runtime feature-flag `COMPLEX_BINDINGS` (тип і дефолт `false` — `packages/common/src/utils.ts:1282-1289`). Гілки використання: `packages/element/src/binding.ts:598`, `packages/element/src/linearElementEditor.ts:2285,2324,2405,2432,2436,2454`, `packages/excalidraw/renderer/interactiveScene.ts:903`, `packages/excalidraw/components/App.tsx:4993,5077,5332,7033,7927,9272,9666,9675,10453`. Sentry-інтеграція — `excalidraw-app/sentry.ts:91-92`. Найбільша зона незавершеної роботи.
- **Arrow/Binding + History** — численні TODO з позначкою `#7348` навколо undo/redo при rebinding: `packages/excalidraw/tests/history.test.tsx:2369,3596,3699,4372`, `packages/excalidraw/actions/actionFinalize.tsx:142,232,346`, `packages/element/src/delta.ts:726,1422,1882`. PR/issue: [excalidraw#7348](https://github.com/excalidraw/excalidraw/pull/7348) (також CHANGELOG `packages/excalidraw/CHANGELOG.md:103,252`). Двонаправлений binding в історії ще не реалізований.

## Нещодавні зміни

_(висновки з коду, а не з git)_

- **Lasso-виділення** — окремий tool type `lasso` з утилітами в `lasso/`, інтегрований зі snap.
- **Cropping зображень** — повний цикл: `crop` rect в типах елемента, drag-handles, mask/clip у рендерері, crop-aware Stats.
- **Multi-lock** — `lockedMultiSelections` + `activeLockedId` + `UnlockPopup` для блокування груп незвʼязаних елементів.
- **Нативний Flowchart** — `FlowChartCreator` з `pendingNodes`, клавіатурна навігація по напрямках, ghost-рендеринг pending-вузлів.
- **Search** — пошук по текстових елементах і frame-іменах з debounce, scroll-to-match, Jotai-атоми.
- **Mermaid → Excalidraw** — ліниве завантаження `@excalidraw/mermaid-to-excalidraw`, auto-fix, paste-детекція.

## Активні рішення

- **`COMPLEX_BINDINGS` off за замовчуванням** — дефолт `false` (`packages/common/src/utils.ts:1288`); нова модель привʼязки готова частково; потрібно вирішити, коли вмикати глобально (див. ADR-008 у `docs/memory/decisionLog.md`).
- **AI бекенд тільки зовнішній** — env `VITE_APP_AI_BACKEND` (`.env.production:12`); в репо немає серверної частини. Trade-off: залежність від зовнішнього сервісу vs складність локального розгортання.
- **Binding + History consistency** — TODO `#7348` у `packages/excalidraw/tests/history.test.tsx:2369,3596,3699,4372`, `packages/excalidraw/actions/actionFinalize.tsx:142,232,346`, `packages/element/src/delta.ts:726,1422,1882`.
- **Mobile interaction** — transform handles для лінійних елементів відключені на мобільних як workaround (`packages/excalidraw/components/App.tsx` — `isMobile` guard); повноцінне рішення відкладено.
- **Frame align/distribute** — дії вирівнювання для frame-ів позначені TODO «when implemented properly».
- **`ExcalidrawProps.name` API** — коментар «come with better API before v0.18.0» (поточна версія — 0.18.0).

## Наступні кроки

- Обрати конкретну задачу для реалізації в рамках homework (fwdays agentic large — day 01).
- Запустити dev-сервер (`yarn start`) і перевірити, що редактор стартує коректно.
- Прогнати тести (`yarn test:all`) для фіксації baseline.
- Потенційні напрямки для задачі:
  - Доопрацювання `COMPLEX_BINDINGS` і вмикання за замовчуванням.
  - Покращення mobile UX (transform handles для лінійних елементів).
  - Розширення Search (пошук по кастомних властивостях, regex).
  - Виправлення binding/history edge-case-ів (#7348).
