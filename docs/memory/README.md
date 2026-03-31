# Excalidraw Memory Bank

Complete project context and reference documentation for the Excalidraw drawing application.

---

## 📚 Memory Bank Files

| File | Purpose | Key Topics |
|------|---------|-----------|
| **projectbrief.md** | Project goals & overview | What is Excalidraw, main goals, target users |
| **techContext.md** | Technology stack | React 19, TypeScript 5.9, Vite 5, Jotai, Socket.io, Firebase |
| **systemPatterns.md** | Architecture & patterns | Class components, hybrid state, event-driven, collaboration |
| **productContext.md** | UX philosophy | UX goals, user journey, interaction patterns, design language |
| **activeContext.md** | Current development | Status, dev tracks, metrics, priority issues, next steps |
| **progress.md** | Project status & milestones | Phases, metrics, technical debt, lessons learned |
| **decisionLog.md** | Key decisions | 14 architectural decisions with rationale and links |

---

## 🎯 Quick Navigation

**Understanding the Project**  
projectbrief.md → techContext.md → systemPatterns.md

**For Contributing**  
activeContext.md → progress.md → decisionLog.md

**For Making Changes**  
systemPatterns.md + decisionLog.md

**For UX Work**  
productContext.md

---

## 🔑 Key Architecture Points

- **Class Component**: App.tsx with 100+ AppState properties, full lifecycle control
- **Hybrid State**: React state + Jotai atoms + AppStateObserver subscriptions
- **Event-Driven**: 8+ emitters coordinating different concerns
- **Scene-Based**: Elements managed separately from UI state
- **Canvas Rendering**: HTML5 Canvas via RoughJS for hand-drawn style
- **Real-Time**: Socket.io for collaboration, Firebase for persistence
- **Monorepo**: Yarn workspaces with separate library and app packages

---

## 📊 Stack & Metrics

**Stack**: React 19, TypeScript 5.9, Vite 5, Jotai 2.11, Socket.io 4.7, Firebase 11.3

**Performance (Current)**:
- Startup: 1.5s | Frame rate: 58 FPS | Bundle: 420KB | Memory: 120MB

**Community**:
- GitHub: 60k★ | npm: 50k+/week | Users: 2M MAU | Contributors: 200+

**Status**: Phase 5 (Next Generation) in progress — React 19 migration, accessibility (WCAG 2.1), performance optimization

---

## 🔗 Cross-Documentation Links

**Technical Deep Dives**:
- [`docs/technical/architecture.md`](../technical/architecture.md) - System design with diagrams
- [`docs/technical/dev-setup.md`](../technical/dev-setup.md) - Setup & onboarding

**Product Knowledge**:
- [`docs/product/PRD.md`](../product/PRD.md) - Complete feature requirements
- [`docs/product/domain-glossary.md`](../product/domain-glossary.md) - 50+ term definitions

---

## 🚀 Getting Started

```bash
yarn install          # Install dependencies
yarn start            # Start dev server
yarn test             # Run tests
yarn build            # Production build
```

**Key technologies**: Perfect Freehand, RoughJS (drawing) | React, Jotai, AppStateObserver (state) | Radix UI, SCSS (UI) | Vite, esbuild (build) | Vitest, @testing-library (testing)

---

## 📖 Quick References

- **GitHub**: https://github.com/excalidraw/excalidraw
- **Docs**: https://docs.excalidraw.com
- **Live**: https://excalidraw.com
- **npm**: @excalidraw/excalidraw

---

## 💡 For Contributors

1. Read **systemPatterns.md** for architecture before making changes
2. Check **decisionLog.md** to understand why things work this way
3. Reference **activeContext.md** for current priorities
4. Follow existing patterns — look at similar code first
5. Run tests before committing — all checks must pass

---

**Last Updated**: March 31, 2026 | **Version**: 1.0 | **All files included**
