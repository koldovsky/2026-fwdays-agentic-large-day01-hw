# Active Context: Excalidraw

## Current Version

- **Packages**: v0.18.0 (`@excalidraw/excalidraw`, `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`)
- **Utils**: v0.1.2 (`@excalidraw/utils`)
- **App**: v1.0.0

## Recent Architectural Changes

### Package Extraction (Ongoing)
The codebase underwent a major refactoring to extract functionality into separate packages:
- `@excalidraw/common` — shared utilities extracted from main package
- `@excalidraw/element` — element logic separated from UI
- `@excalidraw/math` — math operations isolated

This enables better tree-shaking and independent versioning.

### React 19 Migration
Upgraded to React 19.0.0 with React DOM 19.0.0, taking advantage of:
- Improved concurrent features
- Better Suspense support
- New hooks API refinements

### TypeScript 5.9
Updated to TypeScript 5.9.3 for latest type system features.

## Current Development Focus

1. **Package ecosystem stabilization** — ensuring clean APIs between packages
2. **Performance optimization** — canvas rendering with large element counts
3. **AI integration** — text-to-diagram backend (`VITE_APP_AI_BACKEND`)
4. **Excalidraw Plus** — commercial offering with additional features

## Active Environment Endpoints

| Service | Dev | Production |
|---------|-----|------------|
| WebSocket (collab) | localhost:3002 | excalidraw-room server |
| AI Backend | localhost:3016 | cloud endpoint |
| JSON Storage | json-dev.excalidraw.com | json.excalidraw.com |
| Plus App | localhost:3000 | plus.excalidraw.com |

## Known Active Issues

- `FAST_REFRESH=false` in dev config (disabled, potentially for stability)
- PWA disabled in development (`VITE_APP_ENABLE_PWA=false`)
- Service Worker debugging requires `VITE_APP_DEV_DISABLE_LIVE_RELOAD`

## Next Steps

- Continue package API refinement
- Improve collaboration reliability
- Expand AI-powered features
- Enhance embeddable component documentation

## Related Documentation

- [Tech Context](techContext.md)
- [Progress](progress.md)
- [Architecture](../technical/architecture.md)
- [Development Setup](../technical/dev-setup.md)
- [Product Requirements](../product/PRD.md)
- [Domain Glossary](../product/domain-glossary.md)
