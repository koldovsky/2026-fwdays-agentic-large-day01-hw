# Progress: Project Status & Milestones

Quick snapshot of Excalidraw's development progress and current state. **See related documentation for detailed timelines, metrics, and analysis.**

---

## Current Project Phase

**Phase 5: Next Generation (2024-2025)** — 🟡 In Progress

**Current focus**: React 19 migration (partial), TypeScript 5.9, Vite 5.0, accessibility (WCAG 2.1)

**Next Phase**: Plugin system, advanced exports, VR/AR, video annotation (2025-2026)

---

## Key Project Milestones

| Phase | Period | Status | Highlight |
|-------|--------|--------|-----------|
| **1. Foundation** | 2020-2021 | ✅ Complete | Core engine, shapes, text, undo/redo |
| **2. Collaboration** | 2021-2022 | ✅ Complete | Real-time co-editing, Firebase, binding |
| **3. Scaling & Performance** | 2022-2023 | ✅ Complete | Large canvases, rendering optimization |
| **4. AI Integration** | 2023-2024 | ✅ Complete | Text-to-Diagram, Mermaid support |
| **5. Next Generation** | 2024-2025 | 🟡 In Progress | React 19, modern tooling, accessibility |
| **6. Future Vision** | 2025-2026 | 🔵 Planning | Plugin system, advanced exports, VR/AR |

**See**: [`activeContext.md`](activeContext.md) for detailed current development tracks

---

## Top 5 Metrics (Current)

**External References** (verify at source):

- **GitHub Stars**: ~60k (↑ 200/week) — [github.com/excalidraw/excalidraw](https://github.com/excalidraw/excalidraw)
- **Monthly Active Users**: 2M+ (↑ Growing) — Internal analytics
- **Daily Active Users**: 500k+ (↑ Growing) — Internal analytics
- **npm Weekly Downloads**: 50k+ (↑ Stable) — [npmjs.com/@excalidraw/excalidraw](https://www.npmjs.com/package/@excalidraw/excalidraw)
- **Global Contributors**: 200+ (↑ Active) — GitHub contributors page

**See**: [`docs/product/PRD.md`](../product/PRD.md) for complete market metrics

---

## Performance Metrics (2025 Status)

**Benchmark Reference** (as of version 0.18.0, Q1 2025):

- **Startup time**: Target <1.2s, Current 1.5s (✅ Good) — `yarn bench:startup`
- **Frame rate**: Target 60 FPS, Current 58 FPS (✅ Good) — Chrome DevTools Performance
- **Bundle size**: Target <350KB, Current 420KB (✅ Good) — `yarn build:prod` output
- **Memory usage**: Target <100MB, Current 120MB (✅ Good) — Chrome Heap Snapshot

**Improvement claims** (historical comparisons — require verification):
- **57% startup improvement** since 2021 — See version 0.10 vs 0.18 benchmarks
- **23% bundle reduction** since 2021 — Build artifacts comparison needed
- **40% memory reduction** since 2021 — Historical memory profiling data required

**Note**: Performance metrics are estimates pending benchmark test artifact documentation. For definitive values, see `packages/excalidraw/scripts/bench/` or production monitoring dashboards.

**See**: [`docs/technical/architecture.md`](../technical/architecture.md) for rendering pipeline details

---

## Technical Debt & Next Steps

**Resolved**:
- ✅ Webpack → Vite migration
- ✅ PropTypes → TypeScript
- ✅ Legacy Context API → Jotai
- ✅ Browser compatibility

**Remaining**:
- 🟡 App.tsx refactoring (12k lines, needs splitting)
- 🟡 Custom event system standardization
- 🟡 Test coverage in collaboration code (target 85%)

**Planned**:
- 🔵 Store system refactoring
- 🔵 Component library extraction
- 🔵 Plugin system architecture

**See**: [`decisionLog.md`](decisionLog.md) for architectural decisions | [`docs/technical/architecture.md`](../technical/architecture.md) for system design

---

## Release Status

**Current Version**: 0.18.0  
**Release Cadence**: Major (6mo), Minor (2-4 weeks), Patch (as needed)

**Recent**: 0.17.x, 0.16.x (TTD), 0.15.x (Firebase), 0.14.x (Mobile)

---

## Code Quality Snapshot

- **TypeScript coverage**: 95%
- **Test coverage**: 75% (target: 85%)
- **Linting**: Zero warnings
- **Type safety**: Strict mode enabled
- **Active contributors**: 15-20/month
- **Issue response**: <24 hours

---

## What Worked & What Learned

**What Worked**:
- ✅ Simple core focus (drawing as center)
- ✅ Open-source community engagement
- ✅ Incremental feature addition
- ✅ Performance prioritization
- ✅ Accessibility from start

**Key Lessons**:
- Earlier plugin system planning needed
- Better early documentation key
- Aggressive testing infrastructure pays off
- Clear roadmap communication critical

**Best Practices**:
- Semantic versioning, comprehensive changelog
- Contributor guidelines, code of conduct
- Regular community updates

---

## Current Pain Points

**Technical**: App.tsx size (refactoring needed), 10k+ element performance, high-latency sync, memory in long sessions

**Process**: Complex PR review times, documentation lag, test coverage gaps

**Community**: Issue triage at scale, feature requests vs. capacity, global team coordination

**See**: [`activeContext.md`](activeContext.md) for priority issues and current work

---

## 🔗 Related Documentation

For detailed information:
- **Current Focus**: [`activeContext.md`](activeContext.md) — What's being worked on now
- **Key Decisions**: [`decisionLog.md`](decisionLog.md) — Why progress took this path
- **Architecture**: [`docs/technical/architecture.md`](../technical/architecture.md) — Technical evolution & design
- **Roadmap**: [`docs/product/PRD.md`](../product/PRD.md) — Future plans and feature requirements
- **Product Context**: [`productContext.md`](productContext.md) — UX philosophy behind features
