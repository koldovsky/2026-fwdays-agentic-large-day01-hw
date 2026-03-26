# Dependency Map

## Workspace-Level Structure
- Root workspace includes:
  - `excalidraw-app`
  - `packages/*`
  - `examples/*`

## Package Dependency Direction (simplified)
- `@excalidraw/excalidraw`
  - depends on: `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/utils`
- `@excalidraw/element`
  - depends on: `@excalidraw/common`, `@excalidraw/math`
- `@excalidraw/math`
  - depends on: `@excalidraw/common`
- `@excalidraw/utils`
  - utility package used by export and helper flows

## App-Level Integration
- `excalidraw-app` consumes `@excalidraw/excalidraw` and app-specific integrations
  (Firebase, collaboration, telemetry).

## Testing Alias Mapping
`vitest.config.mts` maps package imports to local source paths for workspace testing.
