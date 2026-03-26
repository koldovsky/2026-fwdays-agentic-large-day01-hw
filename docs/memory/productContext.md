# Product Context

## Details

### Technical Docs
For architecture, APIs, setup and infrastructure:
- ../technical/architecture.md
- ../technical/api-reference.md
- ../technical/dev-setup.md
- ../technical/infrastructure.md

Use when:
- modifying system structure
- adding or integrating services
- checking setup, contracts, or dependencies

---

### Product Docs
For domain concepts, features and UX behavior:
- ../product/domain-glossary.md
- ../product/feature-catalog.md
- ../product/ux-patterns.md

Use when:
- working with business logic
- naming entities
- validating product/UX rules

Memory Bank slice for **who** uses Excalidraw and **what outcomes** matter. Interaction mechanics and implementation mapping live in [`docs/product/ux-patterns.md`](../product/ux-patterns.md) and [`systemPatterns.md`](systemPatterns.md).

## Product shape

- **Standalone app** â€” browser editor for direct use (`excalidraw-app`).
- **Library** â€” embed `<Excalidraw />` and APIs from `@excalidraw/excalidraw` (`packages/excalidraw`).

## Primary user scenarios

- **Create & edit** â€” sketch diagrams, annotate, use tools (shapes, text, arrows, frames) on an infinite canvas.
- **Navigate & manage** â€” pan/zoom, select, reorder, group, align; use menus, command palette, and side UI.
- **Persist & share** â€” export (e.g. image), save/load scenes; optional **collaboration** and cloud hooks in the app shell (see `excalidraw-app`).
- **Embed** â€” developers integrate the editor in React apps and react to changes via the public API.

## UX goals (high level)

- **Low friction drawing** â€” fast tool access, predictable selection and editing, clear canvas vs chrome separation (see layered UI in [`ux-patterns.md`](../product/ux-patterns.md)).
- **Consistent commands** â€” keyboard, menu, context menu, and API paths converge on the same action pipeline for predictable updates and undo/redo ([`systemPatterns.md`](systemPatterns.md)).
- **Readable UI** â€” theming, localization, and accessible controls where the product provides them (details in app and library components).

## Audience

| Audience | Need |
|----------|------|
| End users | Draw and share without reading code. |
| Integrators | Stable embed, documented props/API, examples under `examples/`. |

## Related docs (avoid duplicating)

- **Feature-level catalog & glossary** â€” [`docs/product/feature-catalog.md`](../product/feature-catalog.md), [`docs/product/domain-glossary.md`](../product/domain-glossary.md).
- **How UX maps to layers and actions** â€” [`docs/product/ux-patterns.md`](../product/ux-patterns.md).
- **Code structure** (where UI vs core logic lives) â€” [`systemPatterns.md`](systemPatterns.md), [`techContext.md`](techContext.md) (workspace layout).


