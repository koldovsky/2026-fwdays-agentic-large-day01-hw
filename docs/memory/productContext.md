# Product context

- Browser-based whiteboard/diagramming with a hand-drawn sketch aesthetic; the same editor powers both a full web product and third-party embeds.
- **Hosted app** (`excalidraw-app`): end users get the “full stack” experience—editor plus sharing, collaboration, and persistence wired to this deployment’s backends (see `excalidraw-app/share`, `excalidraw-app/collab`, `excalidraw-app/data`).
- **Embeddable library** (`@excalidraw/excalidraw`): product teams embed the editor inside their own apps; they supply hosting, persistence, and any real-time layer—the package focuses on the canvas, UI, and a stable imperative API (`packages/excalidraw`, `packages/excalidraw/README.md`).
- Problem solved: fast, approachable diagramming without rigid “CAD” formality, with optional multiplayer and link-based sharing where the hosted app is deployed.
- **Inferred:** Many users treat the hosted app as a quick scratch space and the library as “whiteboard infrastructure” inside SaaS products; exact positioning copy is not asserted from code alone.

## Primary users & contexts

### End users (hosted app)

- Draw and edit diagrams with standard editor tools, menus, and export flows implemented in `@excalidraw/excalidraw` and orchestrated from `excalidraw-app/App.tsx`.
- **Collaboration:** Shared sessions with synced elements and presence (`Collab`, collaborators on canvas—see [domain glossary](../product/domain-glossary.md) entries `Collab` / `Collaborator`).
- **Sharing:** Generate shareable links that bundle scene data client-side and use app-specific backend upload paths (`excalidraw-app/data/index.ts`, `excalidraw-app/share/ShareDialog.tsx`); copying and system share UI patterns appear in the share dialog.
- **Persistence expectations (behavioral):** Local-first initialization and recovery are part of the app integration story ([`systemPatterns.md`](./systemPatterns.md), `excalidraw-app` data layer); cloud persistence and encryption are app concerns, not something the bare library promises out of the box.

### Developers embedding `@excalidraw/excalidraw`

- **Control:** `onChange`, `onExcalidrawAPI` / `onInitialize`, `initialData`, and `ExcalidrawImperativeAPI` (`packages/excalidraw/types.ts`) for reading/updating scene, app state, and files.
- **Theming & layout:** `theme`, `langCode`, `UIOptions`, optional `renderTopRightUI` / `renderTopLeftUI`, view/zen/grid modes—documented props in `ExcalidrawProps` (`packages/excalidraw/types.ts`); package README stresses CSS import and non-zero parent height.
- **Data in/out:** Serialization, restore, and export helpers live under `packages/excalidraw/data/*`; hosts choose storage and transport.
- **Collaboration hook:** `isCollaborating`, `onPointerUpdate`, and updating `collaborators` via the API let hosts implement their own sync; the hosted app’s Firebase/socket stack is not the default for npm consumers.

### Maintainers (monorepo)

- **Product-complete** in-repo means: the hosted app remains shippable (PWA shell, share/collab, app-specific dialogs), the published package API stays coherent with `packages/excalidraw/package.json` exports, examples still reflect recommended integration (`examples/*`), and collaboration infrastructure config remains aligned (`firebase-project/`). **Inferred:** “Complete” is repository health plus parity with documented embed and app flows, not a separate product roadmap doc in this tree.

## Core product capabilities

Capabilities are **outcome-oriented**; implementation detail stays at package/directory granularity.

### Hosted app only (or primarily app-wired)

| User outcome | Where it roughly lives |
| --- | --- |
| Start/stop live collaboration and see others’ pointers | `excalidraw-app/collab/` (`Collab.tsx`, `Portal.tsx`) |
| Create a shareable URL (encrypted payload, optional file uploads) | `excalidraw-app/data/index.ts` (`exportToBackend`), `excalidraw-app/share/` |
| Firebase-backed persistence and related rules | `excalidraw-app/data/firebase.ts`, `firebase-project/` |
| App-specific chrome: footer, optional AI/TTD triggers, Excalidraw Plus export hooks | `excalidraw-app/App.tsx`, `excalidraw-app/components/` |
| Offline banner while collaborating when the browser reports offline | `excalidraw-app/App.tsx` (uses `isOfflineAtom` from `excalidraw-app/collab/Collab.tsx`) |
| PWA installability, file handlers, share target | `excalidraw-app/vite.config.mts` (manifest), `excalidraw-app/index.tsx` (service worker registration; see [`systemPatterns.md`](./systemPatterns.md)) |

### Embeddable library (shared with app, consumable standalone)

| User outcome | Where it roughly lives |
| --- | --- |
| Draw, select, edit elements; undo/redo; library of shapes | `packages/excalidraw/components/App.tsx`, `packages/excalidraw/actions/`, `packages/element/` |
| Export image / clipboard / file from the editor UI | Built into editor UI; data helpers in `packages/excalidraw/data/` |
| Localized UI | `packages/excalidraw/locales/*.json`, `langCode` on `Excalidraw` |
| Host-customizable shell (menus, stats, optional children) | `ExcalidrawProps` / `UIOptions` in `packages/excalidraw/types.ts` |

## Key user journeys

| Journey | Plausibility |
| --- | --- |
| Open hosted app → sketch diagram → save/export locally or via editor export | Supported by editor in `packages/excalidraw` + app wrapper `excalidraw-app/App.tsx`. |
| Open share dialog → generate link → copy or share; recipient opens link with scene in URL hash | `excalidraw-app/share/ShareDialog.tsx`, `exportToBackend` in `excalidraw-app/data/index.ts`. |
| Start collaboration session → invite via room link → edit together with presence | `excalidraw-app/collab/`; reconciliation types in `packages/excalidraw/data/reconcile.ts`. |
| Lose network while in a collab session → see warning, understand sync may be affected | `excalidraw-app/App.tsx` + `isOfflineAtom`. |
| Install/use as PWA → open `.excalidraw` or shared content via OS hooks | Manifest `file_handlers` / `share_target` in `excalidraw-app/vite.config.mts`. |
| Embed `<Excalidraw />` in Next.js → client-only bundle, theme and `onChange` persistence in host | `packages/excalidraw/README.md`, `examples/with-nextjs/`. |
| Load script-tag example without a framework | `examples/with-script-in-browser/`. |
| Hit localStorage quota while using hosted app | User-visible alert path in `excalidraw-app/App.tsx` (`localStorageQuotaExceededAtom`). |

## Scope & non-goals (product lens)

- **`excalidraw-app`** owns the **product shell**: routing to the editor, collaboration orchestration, share-link and Firebase flows, PWA manifest behavior, and integrations that assume Excalidraw’s public deployment (e.g. dialogs and footers wired in `App.tsx`).
- **`packages/excalidraw`** owns the **editor product**: canvas, tools, dialogs for editor features, localization, and the documented React/imperative API. It deliberately does **not** ship the hosted app’s room server, share backend, or account system as part of the npm package.
- **Non-goals / boundaries (repo-grounded):**
  - **Full multiplayer as a turnkey npm feature:** Real-time room sync for the public product is implemented in `excalidraw-app`; embedders use props/APIs to plug in their own transport ([`Collab` vs library](../product/domain-glossary.md)).
  - **SSR-first rendering of the editor:** Package README documents client-only / dynamic import patterns for Next.js and similar—server rendering the canvas is not a supported embed path.
  - **Assumption:** The library does not promise a single universal persistence format beyond the serialized JSON and restore helpers hosts adopt; storage policies are embedder-specific.

## Quality bar & constraints (product/UX)

- **Internationalization:** Broad locale coverage under `packages/excalidraw/locales/`; changing copy should respect existing translation keys and patterns.
- **Accessibility signals:** Many controls use `aria-label` and test helpers query by label (`packages/excalidraw/components/main-menu/DefaultItems.tsx`, tests under `packages/excalidraw/tests/`); regressions in labeling or focus order affect real users and automation.
- **Performance:** Large diagrams and locale chunks are ongoing concerns reflected in build chunking patterns (see [`systemPatterns.md`](./systemPatterns.md), [`architecture.md`](../technical/architecture.md)); avoid UX regressions that block the main thread during typical edit flows.
- **Reliability:** Collaboration and restore paths carry versioning and reconciliation constraints; see `docs/technical/agent-sharp-edges.md` before altering sync-related behavior.
- **PWA / offline:** Service worker and runtime caching target installed-app and flaky-network use; collab explicitly warns when offline—do not assume seamless offline multiplayer without checking `excalidraw-app/collab` behavior.

## See also

- [`projectbrief.md`](./projectbrief.md) — monorepo scope and delivery shapes at a glance.
- [`../product/domain-glossary.md`](../product/domain-glossary.md) — precise terms (`Excalidraw`, `App`, `Collab`, `ExcalidrawElement`, etc.).
- [`../technical/architecture.md`](../technical/architecture.md) — editor data flow and component ownership.
- [`../technical/agent-sharp-edges.md`](../technical/agent-sharp-edges.md) — risky areas when changing editor or collab behavior.
- [`systemPatterns.md`](./systemPatterns.md) — collaboration/persistence patterns (cross-link only; no duplicate deep dive here).
- [`techContext.md`](./techContext.md) — tooling and commands.

## Source-verified references

- Hosted app entry and editor wiring: `excalidraw-app/index.tsx`, `excalidraw-app/App.tsx`.
- Share and collaboration UX: `excalidraw-app/share/ShareDialog.tsx`, `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/Portal.tsx`.
- Shareable link backend client: `excalidraw-app/data/index.ts` (`exportToBackend`).
- Firebase integration: `excalidraw-app/data/firebase.ts`.
- Embeddable API surface: `packages/excalidraw/types.ts` (`ExcalidrawProps`, `ExcalidrawImperativeAPI`), `packages/excalidraw/index.tsx`, `packages/excalidraw/package.json`.
- Embed documentation: `packages/excalidraw/README.md`.
- Integration examples: `examples/with-nextjs/`, `examples/with-script-in-browser/`.
- PWA manifest hooks: `excalidraw-app/vite.config.mts`.
- Locales: `packages/excalidraw/locales/*.json`.
- Monorepo layout: root `package.json` (workspaces), as summarized in `projectbrief.md`.
