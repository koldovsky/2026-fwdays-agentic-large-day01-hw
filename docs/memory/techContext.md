# Tech Context

## Main Technology Stack

**Language & Framework:**
- TypeScript 5.9.3, React 19.0.0, Node.js >=18.0.0

**Build & Tools:**
- Yarn 1.22.22 (workspaces), Vite 5.0.12, Vitest 3.0.6

**State Management:**
- Jotai 2.11.0, React Context, Custom Store (@excalidraw/element)

**Key Dependencies:**
| Package | Version | Purpose |
|---------|---------|---------|
| Firebase | 11.3.1 | Backend & collaboration |
| Socket.IO | 4.7.2 | WebSocket communication |
| Sentry | 9.0.1 | Error tracking |
| i18next-browser-languagedetector | 6.1.4 | Language detection |
| ESLint | 7.0.1 | Code linting |
| Prettier | 2.6.2 | Code formatting |

**Deployment:**
- Docker (Node 18 → Nginx 1.27 Alpine), Vercel optional, Firebase backend

---

## TypeScript Config

```typescript
{
  "target": "ESNext",
  "module": "ESNext",
  "jsx": "react-jsx",
  "strict": true
}
```

**Path Aliases:**
- `@excalidraw/common/*` → `./packages/common/src/*`
- `@excalidraw/element/*` → `./packages/element/src/*`
- `@excalidraw/excalidraw/*` → `./packages/excalidraw/*`
- `@excalidraw/math/*` → `./packages/math/src/*`
- `@excalidraw/utils/*` → `./packages/utils/src/*`

---

## Monorepo Structure

```
excalidraw-monorepo/
├── excalidraw-app/      # Main web app
├── packages/
│   ├── common/          # Shared utilities
│   ├── element/         # Element types & store
│   ├── excalidraw/      # Core editor (npm package v0.18.0)
│   ├── math/            # Math utilities
│   └── utils/           # General utilities
├── examples/            # Integration examples
├── firebase-project/    # Firebase config
└── scripts/             # Build automation
```

---

## Core Commands

**Setup:**
```bash
yarn install              # Install dependencies
yarn clean-install        # Full clean install
```

**Development:**
```bash
yarn start                # Dev server (excalidraw-app)
yarn build                # Production build
yarn build:packages       # Build all package libraries
```

**Testing:**
```bash
yarn test:all             # Full: typecheck + lint + tests
yarn test                 # Tests only (Vitest)
yarn test:code            # ESLint
yarn test:coverage        # With coverage report
```

**Quality:**
```bash
yarn fix                  # Auto-fix code + formatting
yarn fix:code             # ESLint fix
yarn fix:other            # Prettier format
```

**Release:**
```bash
yarn release              # Create release
yarn release:test         # Test release
yarn release:next         # Pre-release
```

---

## Environment Variables

- `VITE_APP_GIT_SHA` — Git commit SHA (Vercel)
- `VITE_APP_ENABLE_TRACKING` — Enable analytics
- `VITE_APP_DISABLE_SENTRY` — Disable error tracking (Docker)
- `NODE_ENV` — Node environment

---

## Browser Support

**Production:** Chrome 70+, Safari 12+, Firefox (latest), Edge 79+, Samsung 10+

## Details
For detailed architecture → see docs/technical/architecture.md
For domain glossary → see docs/product/domain-glossary.md
