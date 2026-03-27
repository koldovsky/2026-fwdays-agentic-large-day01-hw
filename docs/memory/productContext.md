# Product context

## Product identity

- **Name:** **Excalidraw** (`APP_NAME` in `packages/common/src/constants.ts`).
- **Positioning (web app metadata):** A **virtual collaborative whiteboard** for sketching diagrams with a **hand-drawn feel** (`excalidraw-app/index.html`, `name="description"` and `og:description`).
- **Headline-style promise:** “Free, collaborative whiteboard • Hand-drawn look & feel” and “Collaborative whiteboarding made easy” (same file: `name="title"`, `og:title`, `twitter:title`).

## Problems addressed

| Need | How the product addresses it (source-backed) |
|------|-----------------------------------------------|
| Sketch diagrams quickly without rigid CAD look | Hand-drawn / informal aesthetic (meta description). |
| Work with others | **Collaboration** called out in meta and OG copy (“collaborative whiteboard”). |
| Use on phones / as an app-like experience | `mobile-web-app-capable`, `viewport` tuned for touch scaling (`excalidraw-app/index.html`). |
| Embed in another product | **React component** + CSS; parent must set height (`packages/excalidraw/README.md` Quick start). |
| Comfortable viewing day/night | Early **theme** bootstrap (`localStorage` key `excalidraw-theme`, `light` / `dark` / `system`) in `excalidraw-app/index.html` inline script. |

## Audience (inferred from repo, not from a marketing brief)

- **End users:** People who want a browser-based whiteboard for diagrams and informal drawing (from public-facing meta).
- **Developers / integrators:** Teams embedding the editor via **`@excalidraw/excalidraw`** (`packages/excalidraw/README.md` — install + Quick start).

## UX / product principles (observable in repo)

- **Clarity on embed:** Embedding requires **CSS import** and a **non-zero-height** container — documented as easy-to-miss (`packages/excalidraw/README.md`).
- **SSR-aware embedding:** For Next.js and similar, client-only rendering is documented (same README).
- **Brand consistency:** Social/meta tags reference **excalidraw.com** assets and handles (`excalidraw-app/index.html` — `og:url`, `twitter:site`, image URLs).

## Out of scope for this document

- Roadmap or feature priorities not written in-repo.
- Course or homework requirements — add under `progress.md` / `activeContext.md` when documented in this repository.

## Details

For domain glossary (codebase-specific term definitions: Element, Scene, AppState, Action, Store, …) → see [`docs/product/domain-glossary.md`](../product/domain-glossary.md).

## Source verification

| Topic | Source |
|-------|--------|
| App name | `packages/common/src/constants.ts` (`APP_NAME`) |
| Marketing copy & collaboration | `excalidraw-app/index.html` (`<meta>`, OG, Twitter) |
| Embedder constraints | `packages/excalidraw/README.md` |
