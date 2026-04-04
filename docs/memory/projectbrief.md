# Excalidraw — Project Brief

## Overview

Excalidraw is an open-source, browser-based collaborative whiteboard application that produces hand-drawn-style diagrams. It is published both as a standalone web app (excalidraw.com) and as an embeddable React component (`@excalidraw/excalidraw`).

## Core Purpose

Enable individuals and teams to create sketches, diagrams, wireframes, and visual explanations with a distinctive hand-drawn aesthetic — prioritizing speed, simplicity, and real-time collaboration.

## Key Capabilities

- Infinite canvas with zoom (10%–3000%) and pan
- Shape tools: rectangle, diamond, ellipse, arrow, line, freedraw, text, frame, embeddable
- Hand-drawn rendering via Rough.js for a sketch-like look
- Real-time multiplayer collaboration with live cursors and presence
- Export to PNG, SVG, JSON; import from JSON and clipboard
- Library system for reusable element templates
- Embeddable as a React component in third-party applications
- i18n support with 58 locales
- Progressive Web App (offline-capable)

## Target Users

- Developers creating architecture diagrams
- Designers sketching wireframes
- Teams collaborating on visual brainstorming
- Educators explaining concepts visually
- Anyone needing quick, informal drawings

## Repository Structure

Monorepo with Yarn workspaces containing five core packages (`common`, `element`, `excalidraw`, `math`, `utils`), a standalone web application (`excalidraw-app/`), and integration examples (`examples/`).

## License

MIT License — fully open source.
