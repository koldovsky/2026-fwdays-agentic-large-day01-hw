## Details
For detailed architecture → see docs/technical/architecture.md
For domain glossary → see docs/product/domain-glossary.md

# Active Context

## What The Project Appears Focused On Now
- This repository looks focused on evolving Excalidraw as both:
- A polished standalone web app
- A reusable embeddable editor package

- Based on the current checked-in code, the strongest active emphasis areas are:
- Collaboration and share workflows
- Local-first persistence and recovery
- Public package/API surface for embedders
- Product polish around PWA, export, and app shell UX
- Emerging AI and TTD-related editor capabilities

## Strongest Current Focus Signals
- `excalidraw-app/App.tsx` spends substantial orchestration effort on:
- scene initialization and restoration
- collaboration session startup/stop
- share-link import/export
- local file loading and persistence
- app theme/language integration
- PWA install flow

- `excalidraw-app/collab/Collab.tsx` is a large, dedicated app module, which suggests live collaboration remains a major product concern
- `excalidraw-app/data/LocalData.ts` and related data modules show ongoing emphasis on local saving, file persistence, browser-tab sync, and recovery behavior
- `packages/excalidraw/index.tsx` exports a broad host-facing API, indicating active support for library consumers, not just the first-party app
- The examples in `examples/` show that integration and external adoption are still important

## Product-Level Focus Areas
- Collaboration:
- Start session, share room link, QR-based sharing, user presence, offline warnings, and stop-session flows are first-class UX paths

- Sharing and publishing:
- Static shareable links and backend export remain prominent alongside live collaboration

- Reliability and trust:
- The app preserves local state, reloads files, guards against unload, and handles quota/offline edge cases

- App polish:
- Theme switching, language selection, command palette actions, welcome screen flows, and PWA install support are all surfaced in the main app shell

- Excalidraw+ integration:
- The app contains multiple UX entry points into Excalidraw+, suggesting continued product coupling between the free app and paid/cloud offering

## Platform And Package Focus Areas
- Public API maturity:
- The library exports hooks, UI components, utilities, export helpers, collaboration triggers, TTD primitives, spreadsheet/chart helpers, and plugin-style surfaces

- Integration readiness:
- The repo still maintains consumer examples and package build flows, so the reusable-editor story is actively supported

- Package layering:
- The codebase continues to invest in clear boundaries between common utilities, math, element/domain logic, and the editor runtime

## Feature Signals Worth Noting
- AI-related UI exists in `excalidraw-app/components/AI`
- TTD-related exports are present in `packages/excalidraw/index.tsx`
- Diagram/code-oriented plugin exports exist via `DiagramToCodePlugin`
- These signals suggest active experimentation or expansion beyond core drawing-only workflows

## Caveats
- No explicit public roadmap, milestone file, or checked-in planning board was found during this review
- Because of that, this document describes the project's current visible emphasis in source code, not guaranteed future priorities

## Practical Working Assumption
- If contributing or extending this repo, the safest assumption is that the project currently cares most about:
- keeping the core editor stable
- maintaining strong embedding APIs
- preserving collaboration/share quality
- protecting local-first behavior and recovery
- layering on product features without breaking the main canvas workflow

## Source Verification
- This summary was verified against:
- `excalidraw-app/App.tsx`
- `excalidraw-app/collab/Collab.tsx`
- `excalidraw-app/data/LocalData.ts`
- `packages/excalidraw/index.tsx`
- `examples/with-nextjs/package.json`
- `examples/with-script-in-browser/package.json`
- `docs/memory/projectbrief.md`
- `docs/decisionLog.md`
- `docs/memory/systemPatterns.md`
