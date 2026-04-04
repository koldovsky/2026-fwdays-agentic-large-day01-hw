# Excalidraw — Product Context

## Product Vision

Excalidraw aims to be the simplest way to create visual explanations. Its hand-drawn aesthetic deliberately reduces the pressure of "making things look perfect," encouraging rapid ideation and informal communication.

## User Personas

### Developer (Primary)

- Creates architecture diagrams, system designs, and flowcharts
- Values speed over pixel-perfect output
- Embeds Excalidraw in documentation tools (Notion, Obsidian, Docusaurus)
- Uses keyboard shortcuts and power-user features

### Designer / Product Manager

- Sketches wireframes and user flows during brainstorming
- Collaborates in real-time with remote team members
- Exports diagrams to PNG/SVG for presentations
- Uses the library feature to store reusable components

### Educator

- Creates visual explanations for students
- Uses presentation mode (Zen Mode) for live demonstrations
- Shares diagrams via link for collaborative exercises

## Key User Workflows

1. **Quick Sketch** — Open browser → draw → export PNG → share
2. **Collaborative Session** — Create room → share link → draw together with live cursors
3. **Embedded Diagram** — Import `@excalidraw/excalidraw` → render in React app → customize via props
4. **Library Reuse** — Save frequently used shapes to library → drag onto canvas
5. **File Workflow** — Open `.excalidraw` file → edit → save to local file system

## UX Principles

- **Sketch-first**: hand-drawn look reduces anxiety about visual perfection
- **Zero onboarding**: tools are discoverable via toolbar, no setup required
- **Keyboard-centric**: most operations have keyboard shortcuts
- **Non-destructive**: undo/redo stack preserves full history within a session
- **Collaborative by default**: sharing is a single click to create a live room

## Feature Areas

| Area | Description |
|------|-------------|
| Drawing Tools | Shapes, arrows, text, freedraw, frames |
| Styling | Colors, fill patterns, stroke styles, opacity, roughness |
| Collaboration | Live rooms, cursors, presence, conflict resolution |
| Export/Import | PNG, SVG, JSON, clipboard, embedded PNG metadata |
| Library | Reusable element collections, community libraries |
| Embedding | React component with full API for third-party integration |
| AI Features | Magic Frame for AI-generated content |
