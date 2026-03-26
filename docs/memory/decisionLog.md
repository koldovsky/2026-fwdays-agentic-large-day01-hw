# Decision Log

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

Lightweight **chronological** notes. Authoritative rationale for behavior changes belongs in **`docs/decisions/`** (ADRs); log entries should **link** there when an ADR exists.

## How to record

- **ADR present:** one bullet here + link to `docs/decisions/<file>.md`.
- **No ADR (docs/meta only):** log here with **Context â†’ Decision â†’ Consequence** in the bullet.

---

## 2026-03-25 â€” Documentation structure

- **Context:** Single oversized tech context file was hard to navigate.  
- **Decision:** Keep [`techContext.md`](techContext.md) for stack, versions, and commands; use [`systemPatterns.md`](systemPatterns.md) for architecture; split other material across `docs/technical/`, `docs/product/`, `docs/reference/`, `docs/operations/`.  
- **Consequence:** Memory Bank files have distinct roles; see [`README.md`](README.md).

## 2026-03-25 â€” Placeholders

- **Decision:** Keep `openapi.yaml`, `graphql-schema.graphql`, and thin ADR stubs until factual/generated content exists.  
- **Consequence:** `progress.md` tracks filling them; prefer ADRs in `docs/decisions/` when real decisions are written (e.g. [`adr-001-auth.md`](../decisions/adr-001-auth.md), [`migration-legacy-cache.md`](../decisions/migration-legacy-cache.md)).


