# Active context

## Поточний фокус

Кодова база — повноцінний **інтерактивний whiteboard-редактор** з монорепо-структурою. Три найактивніші фронти розвитку (за ознаками beta-міток, feature-флагів і відкритих TODO):

- **AI-поверхня (TTD + Diagram-to-Code)** — Text-to-Diagram позначений як **beta** (`chat.aiBeta`), працює через streaming до зовнішнього AI-бекенду (`VITE_APP_AI_BACKEND`); Diagram-to-Code перетворює frame+елементи → код. Обидва шляхи інтеграційно завершені, але залежать від серверної частини, яка в репо відсутня.
- **Complex Bindings** — єдиний runtime feature-flag (`COMPLEX_BINDINGS`, дефолт **off**). Розширена модель привʼязки стрілок/елементів; гілки в `binding.ts`, `linearElementEditor.ts`, `interactiveScene.ts`. Найбільша зона незавершеної роботи.
- **Arrow/Binding + History** — численні TODO навколо undo/redo при rebinding (issue #7348), двонаправлений binding в історії ще не реалізований.

## Нещодавні зміни

_(висновки з коду, а не з git)_

- **Lasso-виділення** — окремий tool type `lasso` з утилітами в `lasso/`, інтегрований зі snap.
- **Cropping зображень** — повний цикл: `crop` rect в типах елемента, drag-handles, mask/clip у рендерері, crop-aware Stats.
- **Multi-lock** — `lockedMultiSelections` + `activeLockedId` + `UnlockPopup` для блокування груп незвʼязаних елементів.
- **Нативний Flowchart** — `FlowChartCreator` з `pendingNodes`, клавіатурна навігація по напрямках, ghost-рендеринг pending-вузлів.
- **Search** — пошук по текстових елементах і frame-іменах з debounce, scroll-to-match, Jotai-атоми.
- **Mermaid → Excalidraw** — ліниве завантаження `@excalidraw/mermaid-to-excalidraw`, auto-fix, paste-детекція.

## Активні рішення

- **`COMPLEX_BINDINGS` off за замовчуванням** — нова модель привʼязки готова частково; потрібно вирішити, коли вмикати глобально.
- **AI бекенд тільки зовнішній** — в репо немає серверної частини; TTD/Diagram-to-Code працюють лише з `VITE_APP_AI_BACKEND`. Trade-off: залежність від зовнішнього сервісу vs складність локального розгортання.
- **Binding + History consistency** — undo/redo при перепривʼязці стрілок має відомі баги (#7348); TODO в тестах вказують на незакриті edge-case-и.
- **Mobile interaction** — transform handles для лінійних елементів відключені на мобільних як workaround; повноцінне рішення відкладено.
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
