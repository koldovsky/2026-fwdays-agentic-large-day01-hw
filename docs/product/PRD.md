# Product Requirements Document: Excalidraw

**Status**: Production | **Last Updated**: March 2026 | **Version**: 1.0

---

## Executive Summary

Excalidraw is an open-source, web-based drawing application that prioritizes instant expressiveness and intuitive interaction over precision. It enables anyone to quickly sketch diagrams—from wireframes to flowcharts to system architecture—with a hand-drawn aesthetic that feels natural and informal. Built for real-time collaboration, it combines ease of use with powerful sharing features, making it ideal for individual sketching, team whiteboarding, and embedding in other applications.

---

## Product Vision & Purpose

**Core Mission**: Enable anyone to quickly sketch ideas visually with minimal learning curve.

**Strategic Goals**:
1. **Accessibility**: Lower barrier than professional design software
2. **Collaboration**: Real-time multi-user editing with instant sync
3. **Persistence**: Save locally, to cloud, or export as files
4. **Extensibility**: Serve as embeddable React component
5. **Community**: Sustainable open-source project with active contributions

**Unique Value Proposition**: Hand-drawn aesthetic (RoughJS), zero-friction startup (no account), multiplayer by default, web-native, open source, embeddable, freemium model.

---

## Target Audience

- **Individual Sketchers (40%)**: Personal notes, quick wireframes, brainstorming
- **Collaborative Teams (35%)**: Real-time whiteboarding, architecture discussions
- **Educators & Presenters (15%)**: Live drawing, concept explanation, easy sharing
- **Developers (10%)**: Building drawing features into applications

---

## Key Features & Functions

**Core Drawing**: 9 tools (selection, rectangle, diamond, ellipse, arrow, line, freedraw, text, eraser) with full styling (color, fill patterns, opacity, stroke, font, alignment).

**Organization**: Selection, grouping, frames, alignment, distribution, z-ordering, lock/hide.

**Real-time Collaboration**: Multi-user editing, cursor presence, live sync (<500ms), conflict auto-merge, follow mode.

**Persistence**: Local storage (IndexedDB), cloud storage (Firebase), PNG/SVG/JSON exports, share links, 50+ undo levels.

**Advanced**: Element binding (arrows attach to shapes), images/embeds, flowcharts, AI-assisted diagram generation, 60+ languages, dark/light themes.

**See**: [`docs/product/domain-glossary.md`](domain-glossary.md) for complete feature definitions.

---

## Technical Specifications

**Frontend Stack**: React 19, TypeScript 5.9, Vite 5, Canvas API (not SVG), Jotai 2.11 for UI state.

**State Management**: React AppState (100+ properties), Jotai atoms (UI toggles), custom Store (delta tracking), AppStateObserver (subscriptions).

**Real-time & Persistence**: Socket.io 4.7 (WebSocket), Firebase 11.3 (cloud), IndexedDB (local).

**Rendering**: RoughJS 4.6 (hand-drawn style), Perfect Freehand 1.2 (curves), Canvas Roundrect Polyfill.

**Quality**: Vitest 3.0 (tests), ESLint (linting), Prettier (formatting), TypeScript strict mode.

**Architecture**: Monolithic App class component, layered rendering (static/interactive scenes), modular packages (@excalidraw/element, @excalidraw/math, @excalidraw/common).

**See**: [`docs/technical/architecture.md`](../technical/architecture.md) for detailed system design.

---

## Success Metrics (Targets)

**Engagement**: 2M+ monthly active users, 500k+ daily active, 15+ min avg session, 1+ drawing/user/week.

**Feature Adoption**: 30%+ collaboration usage, 40%+ exports, 20%+ cloud adoption, 35%+ mobile usage.

**Community**: 60k+ GitHub stars, 50k+/week npm downloads, 15-20 active contributors/month, <48hr issue response.

**Performance**: <2s load, <100ms first draw, 58-60 FPS, <150MB memory, <500KB bundle (gzipped).

---

## Product Roadmap (Summary)

- **Completed**: Core drawing (2020-2021), Collaboration (2021-2022), Scale/Performance (2022-2023), AI Integration (2023-2024)
- **In Progress**: React 19 migration, accessibility (WCAG 2.1), performance optimization (2024-2025)
- **Planned**: Plugin system, advanced exports, VR/AR, video annotation (2025-2026)

**See**: [`docs/memory/activeContext.md`](../memory/activeContext.md) for detailed development tracks.

---

## Business Model

**Freemium Model**: Core drawing free, Excalidraw Plus premium tier (advanced collaboration, extended storage, priority support).

**Revenue Streams**: Plus subscriptions, enterprise licensing, sponsorships, community donations.

**Sustainability**: Small core team + community, vendor-neutral, self-hosted capable, no venture pressure.

---

## Technical Limitations

**Performance**: 10k+ elements slow; workaround: split into multiple drawings or use frames.

**Precision**: Hand-drawn aesthetic trades precision; limited precise mode available.

**Collaboration**: Offline limited to local storage; last-write-wins conflict resolution; ~500ms min latency.

**Browser**: Modern browsers only (Chrome 70+, Safari 12+); no IE support; mobile touch less precise than desktop.

**See**: [`docs/product/domain-glossary.md`](domain-glossary.md) for known issues and detailed term definitions.

---

## 🔗 Related Documentation

**For Detailed Information**:
- **Memory Bank** ([`docs/memory/`](../memory/)): Strategic context, architecture patterns, decisions, progress
- **Technical Architecture** ([`docs/technical/architecture.md`](../technical/architecture.md)): Data flow, rendering pipeline, package dependencies
- **Domain Glossary** ([`docs/product/domain-glossary.md`](domain-glossary.md)): 50+ term definitions
- **Developer Setup** ([`docs/technical/dev-setup.md`](../technical/dev-setup.md)): Onboarding and development guide

---

**End of Product Requirements Document**
