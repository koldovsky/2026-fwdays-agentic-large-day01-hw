# Product Context

## Why this project exists

- Excalidraw exists to provide an open-source, accessible whiteboard for visual thinking in a hand-drawn style.
- It serves two complementary product surfaces:
  - a hosted app (`excalidraw.com`) for immediate use;
  - an embeddable React package (`@excalidraw/excalidraw`) for integration into other products.
- The project aims to make diagramming and ideation fast, low-friction, and broadly available without vendor lock-in.

## Problems it solves

- Teams and individuals need a lightweight way to sketch ideas, flows, wireframes, and diagrams quickly.
- Traditional diagram tools can feel heavy, rigid, or over-structured for early ideation.
- Collaboration on visual work often lacks privacy or offline resilience.
- Product teams integrating whiteboarding into their own apps need a customizable component, not only a standalone tool.

## How it should work

- Core editing should feel instant and intuitive on an infinite canvas with essential drawing tools.
- The editor should support local-first behavior:
  - autosave state in the browser;
  - recover work across sessions/tabs.
- Collaboration should work in real time with end-to-end encrypted communication and shared room links.
- Sharing should be simple via readonly links, and export should support common outputs (PNG, SVG, clipboard, `.excalidraw` JSON).
- The same core should power both:
  - the public app experience;
  - reusable integrations via npm package APIs.

## User experience goals

- **Fast start**: users can open and draw immediately, with minimal setup.
- **Low cognitive load**: clean UI, hand-drawn visual language, and predictable tools.
- **Trust and safety**: privacy-conscious collaboration (E2EE) and reliable autosave.
- **Flow preservation**: smooth pan/zoom, undo/redo, and minimal interruptions.
- **Flexible adoption**: works for solo brainstorming, team collaboration, and embedding into third-party products.
- **Inclusive/global use**: localization support and offline-capable PWA experience for broad accessibility.

## Product scope notes

- `excalidraw.com` is intentionally a minimal showcase of what can be built with the Excalidraw core.
- The npm package already provides rich editor capabilities; app-level features like collaboration/local-first/share links are implemented in the app layer and intended to become more plugin-like over time.

