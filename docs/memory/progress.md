# Progress — fwdays 2026 Agentic IDE Workshop Day 1

**Учасник:** Anatoliy Huts
**Дата:** 2026-04-03

---

## Загальний прогрес

```
Required:  6 / 7  (86%)
Bonus:     4 / 6  (67%)
```

---

## Required завдання

### ✅ Крок 2 — `.cursorignore`
**Файл:** `.cursorignore`
**Зміст:**
- Build artifacts: `dist/`, `build/`, `.next/`, `dev-dist/`
- Dependencies: `node_modules/`
- Generated: `*.min.js`, `*.min.css`, `*.snap`
- Lock files: `yarn.lock`, `package-lock.json`
- Coverage: `coverage/`, `.nyc_output/`
- Специфічні для проєкту: `repomix-output.xml` (9.7 MB), `**/*.woff2`, `**/*.wasm`, `packages/excalidraw/types/`

---

### ✅ Крок 4 — Memory Bank (core)

| Файл | Рядків | Ключовий зміст |
|---|---|---|
| `docs/memory/projectbrief.md` | 101 | Мета, монорепо, публічне API, аудиторія |
| `docs/memory/techContext.md` | 167 | Стек з версіями, команди, конфіги |
| `docs/memory/systemPatterns.md` | 225 | Component tree, 3-рівневий state, rendering, Action pattern |

---

### ✅ Крок 5 — Technical Docs

**Файл:** `docs/technical/architecture.md` — 369 рядків

Секції:
1. High-level Architecture (mermaid граф: excalidraw-app → lib → packages)
2. Data Flow (sequence diagram: User → ActionManager → Store → History → Canvas)
3. State Management (AppState, Jotai isolation, Scene/Store, ActionManager API)
4. Rendering Pipeline (2 canvas-шари, memoized Renderer, SVG export)
5. Package Dependencies (bottom-up mermaid граф, заборонені imports, build order)

---

### ✅ Крок 5 — Product Docs

**Файл:** `docs/product/domain-glossary.md` — 464 рядки

11 термінів з source code:

| Термін | Ключова деталь |
|---|---|
| `ExcalidrawElement` | Ієрархія типів, `isDeleted` soft-delete, `version`/`versionNonce` |
| `Scene` | Клас-контейнер, callback-система, відмінність від Renderer |
| `AppState` | ~60 полів, конфіг browser/export/server збереження |
| `Tool` | 16 типів `TOOL_TYPE`, структура `activeTool` з `locked`/`lastActiveTool` |
| `Action` | `perform()`, `ActionResult`, `ActionSource`, 36 зареєстрованих дій |
| `Collaboration` | `Collaborator` type, `Map<SocketId, Collaborator>` |
| `Library` | v1 (deprecated) vs v2 (`status: "published"\|"unpublished"`) |
| `Frame` | `ExcalidrawFrameElement` vs `MagicFrame`, `frameRendering` конфіг |
| `Store/StoreDelta` | diff-based (не snapshot), `CaptureUpdateAction` |
| `BinaryFiles` | `Record<elementId, BinaryFileData>` — окремий registry |
| `Binding` | `FixedPointBinding` з `fixedPoint: [number, number]` |

---

### ❌ Крок 5 — `docs/product/PRD.md`

**Статус: не створено — наступний пріоритет**

Вимоги (з `.coderabbit.yaml`):
- Product Purpose (2–3 речення)
- Target Audience
- Key Features (≥5)
- Non-goals / Constraints
- 50–300 рядків

---

## Bonus завдання

### ✅ `docs/memory/productContext.md` — 191 рядок
- UX Philosophy ("sketchy by design")
- 5 UX Goals (zero-friction, adaptive formFactor, keyboard-first, PWA, collaboration)
- 7 User Scenarios (solo, collab, embedded SDK, презентація, mobile, export, library)
- Таблиця UI modes і їх ефектів
- Customization points для host-застосунків

### ✅ `docs/memory/activeContext.md` — 85 рядків
- Поточний фокус сесії
- Статус всіх завдань
- Умови грейдингу CodeRabbit

### ✅ `docs/technical/undocumented-behavior.md` — 280 рядків
- 4 implicit state machines (`activeTool`, `multiElement/newElement`, `penMode`, `isResizing`)
- 7 non-obvious side effects (`mutateElement`, `scheduleCapture`, soft-delete, WYSIWYG theme)
- 4 initialization order dependencies (App constructor, `polyfill()`, `UIOptions`, image)
- 13 known bugs з конкретними файлами та рядками

### ✅ `docs/memory/progress.md` — цей файл

### ❌ `docs/memory/decisionLog.md` — не створено
### ❌ `docs/technical/dev-setup.md` — не створено

---

## Статистика документації

| Категорія | Файлів | Рядків |
|---|---|---|
| Memory Bank | 5 | 769 |
| Technical Docs | 2 | 649 |
| Product Docs | 1 | 464 |
| **Всього** | **8** | **1 882** |

---

## See also

| Документ | Що містить |
|---|---|
| [`docs/technical/architecture.md`](../technical/architecture.md) | Детальна архітектура |
| [`docs/product/domain-glossary.md`](../product/domain-glossary.md) | Словник термінів |
