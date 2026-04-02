# Active context

Короткий зріз «де ми зараз» для репозиторію `2026-fwdays-agentic-large-day01-hw` (форк монорепи Excalidraw). Детальніше: `projectbrief.md`, `productContext.md`, `techContext.md`, `docs/technical/architecture.md`.

---

## Поточний стан

- **Кодова база:** Yarn workspaces — `excalidraw-app` (Vite SPA), пакети `packages/*` (`@excalidraw/excalidraw`, `element`, `common`, `math`, `utils`), `examples/*`. Стек: React 19, TypeScript 5.9, Vite 5, Vitest, Firebase + socket.io для колаборації в клієнті (див. `techContext.md`).
- **Гілка:** `master`, відстежує `origin/master`.
- **Документація в `docs/memory/`:** є `projectbrief.md`, `productContext.md`, `techContext.md`, `systemPatterns.md`, `decisionLog.md`. Файли `progress.md` і `dev-setup.md` на момент останнього оновлення контексту фактично порожні або мінімальні — їх варто наповнити, якщо потрібен журнал прогресу / інструкції з налаштування.
- **Незакомічені зміни (робоче дерево):** змінені `Dockerfile`, `docs/technical/architecture.md` (велике оновлення), `excalidraw-app/vite.config.mts`, `package.json`, `yarn.lock`. Не відстежуються git: `docs/memory/productContext.md`, `docs/memory/progress.md`, `docs/technical/architecture_bak.md`, `docs/technical/dev-setup.md` — їх треба додати до індексу або прибрати з бекапів, залежно від наміру.

---

## Зміни за останні 2 місяці

У **git-історії цього репозиторію** коміти з’являються з **2026-03-23**; за **лютий 2026** записів у історії немає. Нижче — зміст змін за період, який реально видно в git (кінець березня — початок квітня 2026).

| Період | Що відбулося |
|--------|----------------|
| 2026-03-23–24 | Ініціалізація репозиторію, перші інструкції / check-in. |
| 2026-03-26 | Розширення **Memory Bank**: `projectbrief`, технічні нотатки, глосарій; оновлення `.cursorignore`; глибока перевірка з фіксацією висновків у `decisionLog.md` та `systemPatterns.md`. |
| 2026-03-26 → 2026-04-01 | Подальші оновлення Memory Bank. |
| Поза комітами (локально) | Правки Docker/Vite/залежностей, перепис `architecture.md`, нові/чернеткові файли в `docs/` (див. розділ «Поточний стан»). |

Якщо потрібна повна картина «два календарні місяці» включаючи апстрим Excalidraw, її треба дивитись в окремому клоні або за тегами оригінального проєкту — у **цьому** форку історія коротка.

---

## Відомі проблеми

### Зафіксовані в `docs/memory/decisionLog.md`

1. **Збереження файлів (`excalidraw-app/data/FileManager.ts`):** після помилки збереження логіка карт `savingFiles` / `erroredFiles_save` може **не давати повторних спроб** — ризик розсинхрону полотна й збережених файлів.
2. **Нормалізація `UIOptions` (`packages/excalidraw/index.tsx`):** є **FIXME** щодо мутації/нормалізації опцій під час рендеру та узгодження з `React.memo` — ризик неочікуваних ререндерів і відмінностей залежно від форми пропсів.
3. **Старт колаборації (`excalidraw-app/collab/Collab.tsx`):** залежність від порядку подій socket (`connect_error`, fallback), пауза збереження до ініціалізації — ризик **рідкісних** неконсистентностей при реконектах / нестандартному порядку подій.

### Технічний борг і тести в коді (вибірково)

- **Експорт SVG:** у тестах зазначено, що `exportToSvg` може **не відфільтровувати видалені елементи** (`packages/utils/tests/export.test.ts` — FIXME).
- **Текст WYSIWYG:** оновлення зі Store/theme (`textWysiwyg.tsx`); **flaky** тест у `textWysiwyg.test.tsx`.
- **Історія undo/redo / прив’язки:** кілька TODO навколо `#7348` та поведінки груп у `history.test.tsx`.
- **Геометрія / math:** TODO на міграцію до **Point tuples** по всьому коду (`packages/math`).
- **Інше:** обмеження snap-оптимізації, WASM-лоадери (TODO про завантаження з URL), тести flip з обмеженим покриттям bounding box для кривих.

### Процес і документація

- Велика локальна різниця в `yarn.lock` і `architecture.md` без коміту ускладнює відтворення стану між машинами.
- Дубль/бекап `architecture_bak.md` може розходитися з `architecture.md` — варто тримати одне джерело правди або явно позначити роль бекапу.

---

*Оновлено: 2026-04-01 (за станом репозиторію та git-історії).*
