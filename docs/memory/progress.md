# Progress

## Статус на поточному source tree

- Проєкт уже не на стадії skeleton/prototype:
  - є production app
  - є reusable published packages
  - є examples
  - є collaboration/share/persistence flows
  - є широка test surface
- Водночас код містить кілька явних `TODO`/`FIXME`, тому архітектура ще не виглядає повністю «замороженою».

## Що вже явно реалізовано

### Core product

- `excalidraw-app` запускає повноцінний web app з service worker registration.
- `@excalidraw/excalidraw` публікує React component і великий public API.
- Monorepo already split into reusable packages: `common`, `math`, `element`, `utils`, `excalidraw`.

### Collaboration / sharing

- `Collab` реалізує collaboration API:
  - `startCollaboration`
  - `stopCollaboration`
  - `syncElements`
  - `fetchImageFilesFromFirebase`
- `Portal` реалізує socket session, encrypted payload broadcast і throttled file upload.
- `data/index.ts` already implements:
  - collaboration links
  - backend import/export
  - compression + encryption
- `ShareDialog` already supports both room-sharing and shareable-link flow.

### Persistence

- `LocalData` already persists:
  - elements/app state в `localStorage`
  - files/library data в `indexedDB`
- Firebase config/rules present in `firebase-project/`.
- Docker deploy path present via `Dockerfile` + `docker-compose.yml`.

### Product UX

- Welcome screen, main menu, command palette, share dialog, app sidebar, footer and error boundary are all wired into the hosted app.
- PWA install path is implemented.
- Language switching is implemented and tested.
- Mobile form-factor behavior is tested.

### Advanced capabilities

- Library import/insert flows are implemented and tested.
- Mermaid dialog flow is implemented and tested.
- Flowchart keyboard workflow is implemented and tested.
- AI-related UI is integrated for:
  - diagram-to-code
  - text-to-diagram

## Що підтверджує зрілість implementation

- Public API package exports many extension points beyond a single `<Excalidraw />` component.
- Tests exist across app and shared packages:
  - app UX
  - collaboration
  - export/import
  - library
  - Mermaid
  - element/geometry/math behavior
- Examples exist for:
  - browser-script usage
  - Next.js / SSR-safe usage

## Що ще явно не закрите повністю

- Theme propagation in WYSIWYG still has a `FIXME`.
- Частина canvas-related app state ще позначена як кандидат на переміщення в interactive canvas.
- Один із public props (`name`) має прямий `@TODO` на покращення API.
- Отже статус репозиторію: функціонально багатий і добре протестований, але не без технічних боргів.

## Practical progress summary

- **Foundation**: done
- **Hosted app shell**: done
- **Reusable package API**: done
- **Collaboration pipeline**: done
- **Share/export pipeline**: done
- **Local persistence**: done
- **PWA/offline support**: done
- **Examples for integrators**: done
- **Advanced editor features**: present
- **Technical debt cleanup**: ongoing

## Details
For detailed architecture → see docs/technical/architecture.md
For domain glossary → see docs/product/domain-glossary.md
