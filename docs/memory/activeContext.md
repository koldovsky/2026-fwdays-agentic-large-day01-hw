# Active Context: Current Development Focus

## Current State (as of March 2026)

### Recent Activity
- **Yarn 1.22.22** dependency update completed
- **Husky pre-commit hooks** initialized
- **.cursorignore** configured for AI-assisted development
- **Memory Bank** created for project context

### Version Status
- React 19.0.0 (latest)
- TypeScript 5.9.3 (latest)
- Vite 5.0.12 (latest)
- Jotai 2.11.0 (stable)
- Firebase 11.3.1 (latest)

---

## Active Development Tracks

### 1. Core Drawing Engine
**Status**: Mature & Stable
- Freehand drawing, shape rendering, text editing, element binding, frame support
- **Focus**: Performance on large canvases, touch gestures, accessibility

### 2. Collaboration System
**Status**: Active Development
- Real-time cursor tracking, element sync via Socket.io, user presence, conflict resolution
- **Focus**: Sync reliability, network efficiency, offline support

### 3. UI/UX Enhancements
**Status**: Ongoing
- Welcome redesign, toolbar org, mobile experience, WCAG 2.1 compliance
- **Focus**: Light/dark themes, responsive sidebar, mobile optimization

### 4. AI Features (TTD)
**Status**: Advanced Development
- Text-to-Diagram, Mermaid conversion, natural language input, chat refinement
- **Focus**: Diagram quality, reducing hallucinations, error handling

### 5. Performance Optimization
**Status**: Continuous
- Canvas rendering, memory management, bundle size, responsiveness
- **Metrics**: <100ms first draw, 58 FPS (target 60), 420KB bundle

### 6. Quality Assurance
**Status**: Active
- Unit/integration/E2E tests, visual regression testing
- **Target**: >80% code coverage

---

## Priority Issues & Bugs

**High**: Mobile text UX, undo/redo on large drawings, sync latency, memory leaks  
**Medium**: Font loading, SVG export quality, theme consistency, error messages  
**Low**: Animation smoothness, UI refinements, documentation updates

---

## Performance Metrics (Current)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Startup | <2s | 1.5s | ✅ |
| First draw | <100ms | 85ms | ✅ |
| Frame rate | 60 FPS | 58 FPS | ✅ |
| Memory | <150MB | 120MB | ✅ |
| Bundle | <500KB | 420KB | ✅ |

---

## Active Features in Development

**Text-to-Diagram**: CodeMirror 6 integration, multi-provider AI, real-time preview  
**Embeddable Support**: Iframe embedding, auto-sizing, API stability, examples  
**Diagram-to-Code**: AST generation, code export, language templates

---

## Test Coverage Status

| Component | Coverage | Priority |
|-----------|----------|----------|
| Element operations | 85% | Medium |
| History/Undo | 90% | High |
| Collaboration | 60% | High |
| UI Components | 70% | Medium |
| Export utilities | 85% | Medium |
| Math utilities | 95% | Low |

---

## Documentation Status
- [x] API documentation
- [x] Integration guide for Next.js example
- [x] Keyboard shortcuts reference
- [ ] Advanced embedding patterns, plugin guide, contribution guidelines

---

## Known Limitations
- **Canvas**: Large drawings (10k+ elements) may degrade; complex curves need GPU
- **Collaboration**: Offline limited to local storage; sync lags on high-latency
- **Mobile**: Some shortcuts unavailable; touch precision needs calibration

---

## Upcoming Milestones
- **Next Sprint**: Mobile UX, collaboration tuning, test coverage to 85%
- **Next Release**: TTD stabilization, performance optimizations, docs completion
- **Q2 2026**: Plugin system, export formats, accessibility, benchmarking

---

## 🔗 Related Documentation

**Check these for context:**
- **Progress & History**: See [`progress.md`](progress.md) for project milestones and background
- **Architectural Decisions**: See [`decisionLog.md`](decisionLog.md) for decisions supporting current priorities
- **System Patterns**: See [`systemPatterns.md`](systemPatterns.md) for implementation patterns
- **Technical Setup**: See [`docs/technical/dev-setup.md`](../technical/dev-setup.md) for developer setup
- **Architecture Guide**: See [`docs/technical/architecture.md`](../technical/architecture.md) for system design details
