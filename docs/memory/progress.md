# Progress

## Project Maturity
Excalidraw is a **mature, production-ready** open-source project. This repository is a fork/copy used for educational purposes in the "Crash Course: Agentic IDE" course.

## What's Done (Excalidraw Core)
- [x] Core drawing engine with hand-drawn style (RoughJS)
- [x] Full shape toolkit (rectangle, ellipse, diamond, line, arrow, freehand, text)
- [x] Real-time collaboration via WebSocket (socket.io)
- [x] Firebase integration (Firestore + Storage)
- [x] Export/Import (PNG with metadata, SVG, JSON)
- [x] Library system for reusable elements
- [x] PWA support (offline capable, installable)
- [x] Internationalization (60+ languages via i18next)
- [x] Command palette with fuzzy search
- [x] Dark mode
- [x] Eraser and lasso selection tools
- [x] Conflict resolution for collaborative editing
- [x] Error tracking (Sentry)
- [x] Monorepo structure with shared packages
- [x] Integration examples (Next.js, browser)
- [x] AI diagram-to-code feature
- [x] Mermaid diagram conversion
- [x] CodeMirror integration for code editing

## What's Done (Course Setup)
- [x] Initial repository setup (commits: a345399, 5247322)
- [x] Added instructions check (commit: da795d2)
- [x] CodeRabbit CI configuration
- [x] PR template added
- [x] Memory Bank documentation generated

## Course Day 01 Homework

### 1. Завершити Memory Bank ✅
Створити 7 файлів: `projectbrief.md`, `techContext.md`, `systemPatterns.md`, `productContext.md`, `activeContext.md`, `progress.md`, `decisionLog.md`
- [x] Всі 7 файлів створено та заповнено
- [x] Покращено за фідбеком: mermaid-діаграми, quick start guide, cross-references, деталізація

### 2. Розширити Technical Docs ✅
Створити `docs/technical/dev-setup.md` — повний onboarding від clone до першого PR
- [x] `docs/technical/dev-setup.md` — prerequisites, install, env setup, commands, gotchas, PR workflow
- [x] `docs/technical/architecture.md` — system diagrams (mermaid), layer architecture, directory map

### 3. Згенерувати PRD проєкту ✅
Створити `docs/product/PRD.md` — reverse-engineered Product Requirements Document для Excalidraw
- [x] `docs/product/PRD.md` — vision, audience, features, constraints, analytics, competitive positioning
- [x] `docs/product/domain-glossary.md` — 80+ terms з source file references

### 4. Знайти 3+ прикладів "undocumented behavior" ✅
Задокументувати в `decisionLog.md` з описом: що робить код vs що задокументовано
- [x] UB-1: Silent pen mode auto-detection (`App.tsx`)
- [x] UB-2: Test env changes default roundness (`appState.ts`)
- [x] UB-3: Eraser/laser/magicframe can't be restored (`restore.ts`)
- [x] UB-4: Implicit export scale based on device pixel ratio (`appState.ts`)
- [x] UB-5: Silent arrow binding repair on file load (`restore.ts`)
- [x] UB-6: Magic timing constants without rationale (`app_constants.ts`)

### 5. Додати посилання між рівнями ✅
У Memory Bank файлах додати посилання на Technical та Product Docs
- [x] `projectbrief.md` → architecture.md, PRD.md, dev-setup.md
- [x] `techContext.md` → dev-setup.md, architecture.md, systemPatterns.md
- [x] `productContext.md` → PRD.md, domain-glossary.md, decisionLog.md
- [x] `systemPatterns.md` → architecture.md, dev-setup.md, domain-glossary.md
- [x] `docs/technical/*` → memory-bank cross-references
- [x] `docs/product/*` → memory-bank cross-references

### 6. Верифікувати, що AI використовує документацію
Розпочати нову сесію Cursor, запитати агента про проєкт — чи дає він точні відповіді на основі документації?
- [ ] Тест у Cursor (ручна перевірка)

## Known Issues / Technical Debt
- `App.tsx` is monolithic (~407KB) — would benefit from decomposition
- Legacy feature flagged for removal (shipped 2024-03-11, still present)
- `ImportedDataState` type usage in `Collab.tsx` noted as "abused"
- Test coverage thresholds are moderate (60-70%)
