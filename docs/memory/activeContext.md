# Active Context

## Що вважати `active context`

- Цей файл фіксує не roadmap, а поточні фокусні зони, які прямо видно в актуальному source tree:
  - app shell integration
  - collaboration/share flows
  - advanced editor capabilities
  - технічні обмеження, позначені в коді

## Поточний прикладний фокус

### 1. App shell навколо editor core

- Поточна hosted app збирає навколо `<Excalidraw>` кілька product-specific шарів:
  - `AppMainMenu`
  - `AppWelcomeScreen`
  - `AppFooter`
  - `ShareDialog`
  - `AppSidebar`
  - `AIComponents`
  - `Collab`
- Це означає, що основний фокус розробки зараз не лише в canvas core, а й у product shell навколо нього.

### 2. Collaboration та sharing як центральний user flow

- Collaboration має кілька UI entrypoints і окремий `Collab` runtime.
- `ShareDialog` поєднує два режими:
  - live collaboration session
  - backend-generated share link
- У command palette є окремі app-команди для:
  - start/live collaboration
  - stop session
  - share
  - install PWA
- `collab.test.tsx` перевіряє історію/undo-redo та remote update behavior, тобто цей потік є достатньо критичним, щоб мати спеціалізовані тести.

### 3. Advanced features уже інтегровані в app

- `AIComponents` підключає:
  - `DiagramToCodePlugin`
  - `TTDDialog`
- `packages/excalidraw/tests/MermaidToExcalidraw.test.tsx` підтверджує окремий Mermaid UX усередині TTD dialog.
- `packages/element/tests/flowchart.test.tsx` показує окремий flowchart keyboard workflow.
- `packages/excalidraw/tests/library.test.tsx` підтверджує library import/insert як окремий продуктний шар.

## Явні технічні сигнали поточного фокусу

### Open technical constraints

- `textWysiwyg.tsx` має `FIXME` про theme updates з Store для `appState.theme`.
- `types.ts` має `TODO` про перенесення частини canvas-related app state до interactive canvas.
- `types.ts` має `@TODO` про покращення public API around `name` prop.
- Це прямі індикатори того, де архітектура ще не вважається повністю завершеною.

### Quality focus visible in tests

- App-level UX перевіряється окремо для:
  - mobile form factor
  - welcome screen behavior
  - language rerender
  - collaboration history behavior
- Editor/library/export flows мають окремі тести в пакетах.
- Тобто поточний стан репозиторію показує одночасний фокус на feature breadth і regression safety.

## Що варто тримати в голові під час змін

- Hosted app — це integration layer над reusable package, тому зміни часто зачіпають і `excalidraw-app`, і `packages/excalidraw`.
- Collaboration/share flows є cross-cutting:
  - UI
  - state atoms
  - socket transport
  - Firebase persistence
  - export/import helpers
- Advanced UX already exists; нові зміни треба перевіряти не лише на plain canvas, а й на:
  - mobile
  - i18n
  - library
  - export/share
  - Mermaid / TTD

## Поточні орієнтири для найближчих змін

- Якщо зміна стосується app UX, першими дивитися:
  - `excalidraw-app/App.tsx`
  - `excalidraw-app/components/*`
  - `excalidraw-app/share/ShareDialog.tsx`
  - `excalidraw-app/collab/*`
- Якщо зміна стосується editor behavior або public API, першими дивитися:
  - `packages/excalidraw/index.tsx`
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/tests/*`
- Якщо зміна стосується domain logic elements/geometry:
  - `packages/element/*`
  - `packages/math/*`
  - відповідні tests

## Details
For detailed architecture → see docs/technical/architecture.md
For domain glossary → see docs/product/domain-glossary.md

