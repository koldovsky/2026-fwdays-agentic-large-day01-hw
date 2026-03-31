# Decision Log: Key Architectural Decisions

Quick reference of major decisions. **See related documentation for detailed rationale, alternatives, and trade-offs.**

---

## Core Architecture Decisions

### Decision 1: React Class Component for App
**Date**: 2020 Q1 | **Status**: ✅ Active | **Impact**: High  
**Decision**: Class component for main App with lifecycle hooks and performance control.  
**See**: [`systemPatterns.md`](systemPatterns.md) for implementation details

---

### Decision 2: Jotai for UI-Specific State
**Date**: 2023 Q2 | **Status**: ✅ Active | **Impact**: Medium  
**Decision**: Lightweight atoms for UI toggles (dialogs, sidebars) instead of AppState.  
**See**: [`systemPatterns.md`](systemPatterns.md) for state management patterns

---

### Decision 3: Socket.io for Real-time Collaboration
**Date**: 2021 Q1 | **Status**: ✅ Active | **Impact**: Very High  
**Decision**: Server-based real-time sync with single source of truth.  
**See**: [`architecture.md`](../technical/architecture.md) for real-time collaboration architecture

---

### Decision 4: Firebase for Cloud Persistence
**Date**: 2021 Q2 | **Status**: ✅ Active | **Impact**: High  
**Decision**: Firebase (Firestore + Storage) for cloud persistence and authentication.  
**See**: [`architecture.md`](../technical/architecture.md) for persistence layer design

---

### Decision 5: AppStateObserver Pattern for Subscriptions
**Date**: 2023 Q4 | **Status**: ✅ Active | **Impact**: Medium  
**Decision**: Custom observer pattern for precise subscription control.  
**See**: [`systemPatterns.md`](systemPatterns.md) for subscription patterns

---

### Decision 6: Canvas-based Rendering (vs SVG)
**Date**: 2020 Q1 | **Status**: ✅ Active | **Impact**: Very High  
**Decision**: HTML5 Canvas for performance, smoothness, and hand-drawn effects.  
**See**: [`architecture.md`](../technical/architecture.md) for rendering pipeline

---

### Decision 7: Monorepo Structure with Yarn Workspaces
**Date**: 2020 Q2 | **Status**: ✅ Active | **Impact**: High  
**Decision**: Split into monorepo with embeddable library and shared utilities.  
**See**: [`techContext.md`](techContext.md) for build structure

---

### Decision 8: Vite Over Webpack (2024)
**Date**: 2024 Q1 | **Status**: ✅ Active | **Impact**: High  
**Decision**: Migrate to Vite for 10x faster dev server and simpler config.  
**See**: [`techContext.md`](techContext.md) for build tooling details

---

### Decision 9: TypeScript Strict Mode
**Date**: 2022 Q1 | **Status**: ✅ Active | **Impact**: Medium-High  
**Decision**: Full TypeScript strict mode for type safety and refactoring confidence.  
**See**: [`techContext.md`](techContext.md) for type strategy

---

### Decision 10: Custom AppState over Redux/Zustand
**Date**: 2020 Q1 | **Status**: ✅ Active (Evolving) | **Impact**: Very High  
**Decision**: Custom AppState pattern with minimal boilerplate, domain-specific.  
**See**: [`systemPatterns.md`](systemPatterns.md) for state architecture

---

## Integration Decisions

### Decision 11: AI Integration via API (not local)
**Date**: 2023 Q2 | **Status**: ✅ Active | **Impact**: Medium  
**Decision**: Server-side AI models for smaller bundle and better cost control.

---

### Decision 12: Immutable Elements Pattern
**Date**: 2020 Q2 | **Status**: ✅ Active | **Impact**: High  
**Decision**: Elements immutable; mutations create new objects for undo/redo tracking.

---

## UX Decisions

### Decision 13: Whiteboard-Style Default Look
**Date**: 2020 Q1 | **Status**: ✅ Active | **Impact**: Very High  
**Decision**: Hand-drawn style via RoughJS as core brand identity.

---

### Decision 14: No Native App, Web-First
**Date**: 2020 Q1 | **Status**: ✅ Active | **Impact**: High  
**Decision**: Web-only strategy for faster iteration and automatic updates.

---

## Roadmap Decisions (Future)

**Plugin System** (2025 Q2-Q3): Extensible plugin architecture for domain-specific tools  
**Multi-Provider Backend** (2025 Q3-Q4): Support for alternative backends to reduce vendor lock-in

---

## Decision Review Process

**How decisions are made**: Issue/RFC → Analysis → Prototype → Decision → Implementation → Monitor → Review  
**Review cycle**: Quarterly assessment with metrics and community feedback

---

## Recent Decision Reviews (2025)

- ✅ **Vite migration**: Successful, keeping long-term
- ✅ **React 19**: Good, monitoring for issues
- 🔍 **Jotai vs custom atoms**: Evaluating for next phase
- 🔍 **Firebase scaling**: Assessing for growth

---

## 🔗 Related Documentation

For detailed rationale, alternatives, trade-offs, and implementation:
- **Architecture & Patterns**: [`docs/technical/architecture.md`](../technical/architecture.md), [`systemPatterns.md`](systemPatterns.md)
- **Tech Stack & Build**: [`techContext.md`](techContext.md)
- **Product Context**: [`docs/product/PRD.md`](../product/PRD.md)
- **Development Progress**: [`progress.md`](progress.md)
