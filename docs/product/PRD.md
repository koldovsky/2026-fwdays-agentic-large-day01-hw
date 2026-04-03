# Product Requirements Document (Reverse-Engineered)

## 1. Product purpose
- Excalidraw provides a fast browser-based whiteboard for creating and sharing diagrams/sketches.
- Product should support both direct app usage and embedding as a React component.

## 2. Target audience
- Individual engineers/designers/educators who need quick visual communication.
- Teams that need collaborative whiteboarding sessions.
- Developers integrating drawing surfaces into their own products.

## 3. Core use cases
- Create/edit diagram elements on an infinite canvas-like workspace.
- Save and reopen drawings via local or shared flows.
- Collaborate with other users in shared sessions.
- Export diagrams for sharing and downstream use.
- Integrate editor component into third-party React applications.

## 4. Key functional requirements
- Interactive element manipulation (create/select/move/resize/transform).
- Scene persistence and restore pipeline.
- Import/export and share-link workflows.
- Optional live collaboration path.
- Internationalization and multi-locale support.
- Stable package API for embedders.

## 5. Non-goals (inferred)
- Not a full document/project management platform.
- Not intended as a replacement for general-purpose design suites.
- Not focused on backend-heavy multi-tenant business workflows in this repo.

## 6. Technical constraints
- Node runtime requirement `>=18.0.0`.
- Yarn workspace monorepo with package boundaries.
- Context-heavy codebase requires scoped AI workflows for safe changes.

## 7. UX constraints
- Must feel immediate and low-friction for first-time users.
- Startup/import flows should avoid accidental data loss.
- Export behavior should avoid incomplete outputs when assets are still loading.

## 8. Success criteria (reverse-engineered)
- Users can reliably create, edit, and export scenes.
- Collaboration sessions can start/stop without corrupting local state.
- Embedding via package docs works with minimal setup (CSS import + non-zero container height).
- Core quality gates (`test`, `build`) remain operational in normal environments.

## 9. Risks and assumptions
- Inferred from source; some business intent is not explicitly documented in repo docs.
- Runtime behavior contains implicit safeguards (visibility/focus sync, export wait loops) that should be preserved unless replaced intentionally.

## Related Docs
- [Domain Glossary](./domain-glossary.md)
- [Architecture](../technical/architecture.md)
- [Memory Product Context](../memory/productContext.md)
- [Memory Decision Log](../memory/decisionLog.md)
