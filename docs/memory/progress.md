# Progress

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

## Current status

- **Last reviewed:** 2026-03-25  
- **Memory Bank:** roles clarified (`README.md`); `projectbrief` / `productContext` / `activeContext` / `progress` / `decisionLog` updated; duplication reduced (`techContext` owns versions).  
- **Behavior docs:** snapshot update semantics verified and recorded across `docs/technical/undocumented-behaviors.md`, `docs/memory/systemPatterns.md`, and `docs/technical/code-archaeology-patterns.md`.  
- **Open:** placeholder reference files (`openapi.yaml`, `graphql-schema.graphql`) and ADR bodies in `docs/decisions/*` still optional until real content is produced.

## Completed (historical)

- Created docs structure under `docs/`.
- Established `docs/memory/techContext.md` as the stack/commands snapshot (versions from `package.json`).
- Distributed content into domain docs:
  - `docs/memory/projectbrief.md`, `productContext.md`, `systemPatterns.md`
  - `docs/technical/architecture.md`, `api-reference.md`, `dev-setup.md`, `infrastructure.md`
  - `docs/reference/dependency-map.md`
  - `docs/product/*`, `docs/operations/*`

## Pending

- Populate generated reference artifacts when available:
  - `docs/reference/openapi.yaml`
  - `docs/reference/graphql-schema.graphql`
- Flesh out ADRs in `docs/decisions/*` where decisions are finalized.
