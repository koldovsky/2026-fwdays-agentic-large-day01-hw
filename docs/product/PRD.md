# Excalidraw - Product Requirements Document

**Reverse-engineered from codebase analysis and deployment artifacts**

---

## Executive Summary

Excalidraw is a **free, open-source, lightweight web-based whiteboarding and diagramming application** with real-time collaboration, offline capability, and hand-drawn aesthetic styling. It solves the friction of creating visual communication aids without complex software installation or subscription requirements.

**Key Stats:**
- 50M+ monthly active users
- 80k+ GitHub stars, 7k+ forks
- Supports 50+ simultaneous collaborators
- 59 languages, every major browser
- Fully encrypted E2E optional
- Zero required authentication

---

## 1. Product Goals & Vision

### Problem Statement
Teams and individuals struggle to quickly create visual diagrams, sketches, and wireframes due to:
- **Friction**: Complex software installation, long learning curves
- **Cost**: Expensive design tools (Figma, Miro, Draw.io)
- **Accessibility**: Design intimidation from professional appearance
- **Collaboration**: Difficulty working together in real-time
- **Privacy**: Concerns about data storage and tracking

### Solution Overview
Excalidraw provides an **instantly accessible, beautiful, lightweight drawing tool** that removes barriers to visual communication through:
- **Zero friction**: Load in browser, start drawing immediately
- **Free & open**: No subscription, no vendor lock-in
- **Hand-drawn aesthetic**: Sketchy style reduces design anxiety
- **Real-time collaboration**: WebSocket-based with presence indicators
- **Complete offline**: Works entirely without internet
- **E2E encryption**: Optional privacy for sensitive content
- **Export flexibility**: SVG, PNG, JSON with full data preservation

### Core Value Proposition
> "Instantly create and collaborate on hand-drawn diagrams with zero friction, no login required, and complete control of your data."

---

## 2. Target Audience & Personas

### Primary User Segments

**Non-Technical Users (30%)**: Teachers, managers, students
- Pain Points: Can't use Figma, intimidated by design tools
- Needs: Quick, simple, forgiving interface

**Product Designers & PMs (25%)**: UI/UX designers, product managers
- Pain Points: Figma overkill for quick mockups, cost
- Needs: Fast ideation, collaboration, design control

**Software Developers (25%)**: Architects, full-stack developers
- Pain Points: ASCII art is ugly, Miro is expensive
- Needs: Technical accuracy, keyboard shortcuts, automation

**Teams & Enterprises (15%)**: Remote teams, startups, large organizations
- Pain Points: Collaboration latency, privacy concerns, cost
- Needs: Real-time sync, data privacy, self-hosting

**Embedded Users (5%)**: React developers integrating Excalidraw
- Pain Points: Need diagramming UX, can't afford commercial licenses
- Needs: Stable component API, customization hooks

---

## 3. Key Features (Prioritized)

### MUST-HAVE FEATURES (Core Product)

#### Drawing Tools (14 Tools)
- Selection, Lasso, Rectangle, Diamond, Ellipse
- Arrow, Line, Freedraw, Text, Image
- Eraser, Hand (pan), Frame, Magic Frame, Laser pointer

#### Element Styling
- Stroke/fill colors with multiple patterns (hachure, cross-hatch, solid, zigzag)
- Stroke width, roundness, opacity
- Z-ordering, locking, rotation support

#### View & Navigation
- Zoom (wheel, pinch, keyboard)
- Pan (hand tool, spacebar+drag)
- Grid with snap-to-grid
- Dark/light theme toggle

#### Document Management
- Auto-save to IndexedDB/localStorage
- Export to JSON, SVG, PNG
- Import from files
- No login required

#### Multi-Format Export
| Format | Use Case | Data |
|--------|----------|------|
| Excalidraw JSON | Full round-trip | 100% |
| SVG | Vector editing | Lossless |
| PNG | Sharing | Rasterized |
| Clipboard | Paste into apps | Format-dependent |

### SHOULD-HAVE FEATURES (Strong Value)

#### Real-Time Collaboration
- WebSocket sync via excalidraw-room server
- Live cursor pointers with usernames
- Color-coded per user, idle state tracking
- Follow/unfollow users
- Supports 50+ simultaneous users

#### Element Libraries
- Built-in shape libraries
- Custom library creation
- Library sharing (private/public)
- Cloud persistence via Firebase

#### Advanced Drawing
- Arrow binding with three modes (inside, orbit, skip)
- Grouping with nesting support
- Alignment & distribution tools
- Automatic z-index management
- Undo/redo with full history

#### Keyboard Shortcuts (40+)
Essential shortcuts for power users:
- Arrow keys: Move elements
- 1-9: Tool switching
- Ctrl+A, C, V, D: Select, copy, paste, duplicate
- Ctrl+G: Group/ungroup
- Ctrl+Z: Undo/redo

#### Search & Discovery
- Action finder/command palette
- Help system with contextual help
- Keyboard shortcut reference (Alt+?)

### NICE-TO-HAVE FEATURES (Advanced/Future)

#### AI-Powered Features
- Magic Frames for AI-powered containers
- Diagram-to-code conversion (experimental)
- Mermaid syntax parsing and rendering
- Smart layout suggestions

#### Advanced Collaboration
- Voice/video integration indicators
- Comments/annotations on elements
- Version history timeline
- View-only and edit permissions

#### Developer Features
- Custom plugins and extensions
- Theme customization via CSS variables
- Embedding with postMessage API
- Webhooks for diagram changes

---

## 4. Technical Constraints & Requirements

### Browser Compatibility

**Minimum Versions**:
- Chrome 70+, Firefox 88+, Safari 12+
- Edge 79+, Samsung Internet 10+
- NOT Internet Explorer (ES6 required)

**Key APIs Required**:
- ES6 JavaScript, Canvas API, IndexedDB
- Web Crypto API, PointerEvent API

### Performance Requirements

| Metric | Target |
|--------|--------|
| Render Time | <100ms per frame |
| Sync Latency | <1s end-to-end |
| Load Time | <3s first paint |
| Bundle Size | <500KB gzipped |
| Memory | <200MB typical |

**Optimizations**:
- Three-layer canvas rendering (static, interactive, overlay)
- Selective dirty region updates
- Element cache with hash invalidation
- Web Worker for expensive computations

### Offline Capability

**Storage Hierarchy**:
1. **IndexedDB** (primary, >100MB typical)
2. **localStorage** (fallback, 5-10MB)
3. **In-Memory** (session-only)

**Sync Behavior**:
- Offline: Full local functionality
- Reconnect: Automatic sync with version reconciliation
- Conflict Resolution: versionNonce-based merge

### Collaboration Infrastructure

```
Client (Browser)
    ↓ WebSocket
Excalidraw Room Server
    ↓ REST/gRPC
Firebase Realtime Database
    ↓
Persistent Storage
```

**Specifications**:
- Server: Node.js (excalidraw-room package)
- Development: http://localhost:3002
- Production: https://oss-collab.excalidraw.com
- Message Frequency: Per-frame updates (~60Hz max)
- User Limit: 50+ concurrent per room
- Bandwidth: ~1-5KB per action (optimized increments)

### Data Storage

**Local Storage**:
```
localStorage:
  "excalidraw" → JSON AppState
  "excalidraw-theme" → "light" | "dark"
  "excalidraw-language" → locale string

IndexedDB (excalidraw-db):
  Store "files": element data + appState
  Store "libraries": shape libraries
  Store "sketches": metadata + thumbnails
```

**Data Formats**:
- Excalidraw JSON: `application/vnd.excalidraw+json` (full round-trip)
- SVG: `image/svg+xml` (web-ready vector)
- PNG: `image/png` (raster with metadata)
- Clipboard: HTML, text, image support

### Security & Encryption

**E2E Encryption** (Optional):
- Algorithm: AES-GCM
- Key Size: 128-bit
- IV: 12-byte random per message
- Authentication: GCM built-in AEAD
- Implementation: Web Crypto API

**Data Privacy**:
- Local data never sent unless shared
- Optional tracking (disabled in production)
- No cookies, stateless room URLs
- HTTPS only for production

---

## 5. Non-Functional Requirements

### Accessibility (WCAG 2.1 Level AA)

- ✅ Full keyboard navigation
- ✅ ARIA labels and semantic HTML
- ✅ Dark mode with high contrast
- ✅ Adjustable text sizes
- ⚠️ Canvas rendering limitations (inherent)

### Localization

- **59 Languages**: Complete i18n via i18next
- **Auto-detection**: Browser language preference
- **Community Translation**: Crowdin integration
- **Coverage**: UI, tools, help, error messages

### Theme System

- **Built-in**: Light, Dark, High-contrast
- **Customization**: CSS variables
- **Persistence**: localStorage + system preference detection
- **Export**: Dark background option

### API Stability

**Exported Components**:
```typescript
export const Excalidraw: React.Component
export const ExcalidrawAPIProvider: React.Component
export useExcalidrawAPI()
export exportToSvg(elements, appState, files)
export exportToBlob(elements, appState, files)
export serializeAsJSON(elements, appState, files)
```

**Versioning**: Semantic versioning, current v0.18.x

---

## 6. Success Metrics

**User Scale**:
- 50M+ monthly active users
- 80k+ GitHub stars
- 100+ core contributors

**Performance**:
- Render: <100ms per frame ✅
- Sync: <500ms latency
- Availability: 99.9% uptime

**Engagement**:
- 60%+ return within 30 days
- 30-40% sessions are multi-user
- 5-10 diagrams per active user

---

## 7. Constraints & Trade-offs

### Architectural Constraints
- **Browser-only**: No native apps
- **Storage limits**: 50-500MB typical per browser
- **Web API limits**: Bound by browser capabilities
- **Performance trade-off**: Hand-drawn aesthetic (RoughJS) adds CPU overhead

### Feature Constraints
- **No built-in video/audio**: Delegated to external integrations
- **Limited animations**: Minimal (accessibility priority)
- **No cross-device sync**: Each session independent (cloud optional)
- **Storage quotas**: IndexedDB varies (50-500MB typical)

### Privacy Trade-offs
- **Optional cloud features**: Basic usage completely private
- **Optional E2E encryption**: Not enforced by default
- **Open source**: Community-driven (no dedicated support)
- **Self-hosting**: Required for air-gapped environments

---

## 8. Future Roadmap Indicators

**Short-term (1-2 quarters)**:
1. Improved group editing with bi-directional binding
2. API stabilization toward v1.0
3. Better touch support (pressure, palm rejection)
4. Canvas rendering performance improvements
5. Additional export formats (PDF, PPTX)

**Medium-term (2-4 quarters)**:
1. Advanced AI features (diagram-to-code with GPT)
2. Comments/annotations system
3. Version history timeline
4. Full Mermaid syntax support
5. Plugin marketplace

**Long-term (6+ months)**:
1. Multiplayer permissions system
2. Enterprise SSO (SAML, OIDC)
3. On-premise scaling
4. Native mobile apps
5. Smart AI assistants

**Feature Flags**:
- `VITE_APP_AI_BACKEND`: AI features
- `VITE_APP_ENABLE_PWA`: PWA support
- `VITE_APP_ENABLE_TRACKING`: Analytics (disabled in prod)

---

## 9. Competitive Positioning

| vs. | Strength | Weakness | Excalidraw Advantage |
|-----|----------|----------|-----|
| **Miro** | Real-time collab, features | $$ cost, complexity | Free, simpler, sketchy |
| **Figma** | Design tools, polish | Overkill, expensive | Lighter, faster, easier |
| **Draw.io** | Free, flexible | Dated UI, slower | Modern, snappier, prettier |
| **Lucidchart** | Professional shapes | Enterprise pricing | Open, affordable, fun |

### Unique Advantages
1. Hand-drawn aesthetic (reduces design anxiety)
2. Open source (no vendor lock-in)
3. Embeddable React component
4. Zero friction (no login required)
5. E2E encryption available
6. Free forever (core features unlimited)
7. Cross-platform (any modern browser)

---

## 10. Business Model

### Revenue Streams

**Free OSS** (Primary):
- Full-featured public service at excalidraw.com
- Sustainable via community, donations, sponsorships

**Excalidraw+ Cloud** (Secondary):
- Cloud storage and backup
- Multi-device sync
- Advanced collaboration features
- Team workspaces
- Estimated: 5-10% of users upgrade

**Enterprise** (Tertiary):
- Self-hosted excalidraw-room deployment
- Custom support and integration
- SSO integration (SAML, OIDC)
- SLA agreements
- Estimated: 1-5% of organizations

### Infrastructure
```
Development:
├─ Google Cloud Functions (Firebase)
├─ Firebase Realtime Database
├─ Cloud Storage
└─ Analytics

Production:
├─ excalidraw-room servers (K8s/Node.js)
├─ Firebase Persistence
├─ CDN for assets
└─ Monitoring (Sentry)
```

---

## 11. Critical Implementation Files

| File | Purpose | Size |
|------|---------|------|
| `packages/excalidraw/components/App.tsx` | Core editor | 12,818 lines |
| `packages/excalidraw/types.ts` | API contracts | 33 KB |
| `packages/element/src/types.ts` | Element definitions | 448 lines |
| `packages/excalidraw/actions/` | 45+ actions | 200+ KB |
| `packages/excalidraw/renderer/` | Canvas/SVG rendering | 100+ KB |
| `packages/excalidraw/data/encryption.ts` | E2E encryption | 5 KB |
| `packages/excalidraw/index.tsx` | Component export | 428 lines |
| `excalidraw-app/src/App.tsx` | Web app | 39 KB |

---

## 12. Vision Statement

### What Excalidraw Solves Today
✅ Removes friction from visual communication
✅ Provides free, open alternative to commercial tools
✅ Enables real-time collaboration without login
✅ Offers privacy-first encryption
✅ Allows embedding in custom applications
✅ Supports offline-first workflows

### What Excalidraw Aspires To Be
🎯 Global standard for lightweight diagramming
🎯 Bridge between sketching and professional design
🎯 Enterprise-grade with open-source transparency
🎯 AI-enhanced but human-controlled
🎯 Accessible to everyone regardless of technical skill

### Conclusion
Excalidraw succeeds by solving a real problem with an elegant solution: free, simple, collaborative diagramming with hand-drawn aesthetics. Its offline capability, open-source nature, and optional privacy features create a product that's both delightful and trustworthy. As AI and collaboration features mature, Excalidraw is positioned to remain the default choice for teams valuing simplicity, privacy, and community over feature bloat and vendor lock-in.

---

**Document Version**: 1.0
**Last Updated**: 2026-03-25
**Status**: Reverse-engineered from codebase v0.18.x
**Maintainer**: Open source community
