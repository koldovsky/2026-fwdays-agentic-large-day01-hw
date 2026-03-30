# Product Context

## Who this project is for

- Developers who want to embed Excalidraw into React applications.
- Teams needing collaborative whiteboard/diagram capabilities in web products.
- End users who need quick sketching, diagramming, and visual communication in browser.

## Why this project exists

- To provide a high-quality drawing editor that works both:
  - as a standalone app,
  - as an embeddable component (`@excalidraw/excalidraw`).
- To reduce integration friction via clear package exports, CSS entrypoint, and examples.

## UX purposes

- Fast first render and immediate drawing readiness.
- Predictable embedding UX:
  - container must have height,
  - CSS import required for correct appearance.
- Cross-framework usability (including SSR ecosystems like Next.js with client-only rendering).
- Configurable host integration through callbacks and imperative API.

## Product-level capabilities visible in code

- Extensible UI options (`UIOptions`) and host callbacks in `index.tsx`.
- API lifecycle hooks: `onMount`, `onInitialize`, `onUnmount`, `onExcalidrawAPI`.
- Collaboration-related hooks/events (`onIncrement`, `onUserFollow`, collaborators in app state).
- Multi-surface usage:
  - full app (`excalidraw-app`),
  - package consumption (README quick-start),
  - examples (`examples/with-nextjs`, `examples/with-script-in-browser`).

## UX constraints for integrators

- Must import `@excalidraw/excalidraw/index.css`.
- Must mount editor in a non-zero-height container.
- For SSR frameworks: render client-side, often with dynamic import and `ssr: false`.

## Source verification

- `packages/excalidraw/README.md`: target audience and integration constraints.
- `packages/excalidraw/index.tsx`: integration props and UI option plumbing.
- `packages/excalidraw/components/App.tsx`: API/event surface and editor lifecycle hooks.
- `examples/with-nextjs/README.md`: Next.js integration guidance.

---

## Related documentation

**Technical** (`docs/technical/`)

- [Architecture](../technical/architecture.md)
- [Developer setup](../technical/dev-setup.md)

**Product** (`docs/product/`)

- [PRD](../product/PRD.md)
- [Domain glossary](../product/domain-glossary.md)
