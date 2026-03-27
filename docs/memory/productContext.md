# Product Context

## Why Excalidraw Exists

Most diagramming tools produce polished, corporate-looking output that
discourages iteration. Excalidraw's hand-drawn aesthetic intentionally signals
"this is a draft" — lowering the psychological barrier to starting, changing,
and throwing away ideas. The rough style is a deliberate product decision, not a
limitation.

---

## UX Goals

### 1. Zero Friction to First Sketch

- No account, no install, no onboarding wizard — the canvas is immediately
  ready.
- Default tool is the selection arrow; switching to draw takes one keypress or
  one click.
- The blank canvas must feel inviting, not overwhelming.

### 2. Hand-Drawn Aesthetic as a Feature

- All strokes, fills, and arcs render with controlled roughness (via roughjs).
- Users should feel the output looks "human" — enabling low-stakes ideation.
- Aesthetic options (roughness, stroke width, fill style) are surfaced without
  cluttering the default view.

### 3. Speed Over Precision

- Keyboard shortcuts cover every major action; mouse-only use is always
  optional.
- Snapping, guides, and grid assist alignment without requiring pixel-perfect
  input.
- Undo/redo must feel instantaneous and reliable — no loss of work.

### 4. Collaboration Without Ceremony

- Share a link → others join the same canvas immediately (no login required for
  guests).
- Live cursors and element updates propagate in real time with minimal perceived
  latency.
- Follow mode lets one user broadcast their viewport to others (useful for
  presentations).

### 5. Portable and Ownable Output

- Drawings export to PNG, SVG, and `.excalidraw` JSON — no lock-in.
- SVG exports embed the source JSON, allowing round-trip editing.
- Local autosave (IndexedDB) ensures no work is lost on page refresh.

### 6. Embeddable with Full Fidelity

- The `@excalidraw/excalidraw` library must behave identically whether hosted on
  excalidraw.com or embedded inside a third-party app.
- Host apps control persistence, theming, and toolbar visibility via props — the
  component has no hidden global side-effects.

---

## User Personas

| Persona                     | Primary Need                       | Key Friction to Avoid                   |
| --------------------------- | ---------------------------------- | --------------------------------------- |
| **Solo ideator**            | Quick sketch, no setup             | Forced sign-up, slow load               |
| **Team collaborator**       | Real-time co-editing               | Join friction, sync lag                 |
| **Presenter**               | Walk audience through a diagram    | Awkward multi-window sharing            |
| **Developer (embedder)**    | Drop Excalidraw into their own app | API instability, SSR crashes            |
| **Open-source contributor** | Extend without breaking core UX    | Undocumented conventions, circular deps |

---

## Core UX Scenarios

### Scenario 1 — Instant Whiteboard

**User**: Solo ideator opens excalidraw.com for the first time. **Flow**:

1. Page loads; blank canvas fills the viewport within ~1 s.
2. User presses `R` and drags to draw a rectangle.
3. User double-clicks to add a text label inside.
4. User presses `Ctrl+Shift+E` to export PNG and pastes it into a doc.

**Success criteria**: Zero dialogs before first stroke; export reachable in ≤3
interactions.

---

### Scenario 2 — Remote Collaboration

**User**: A team of 3 needs to sketch an architecture diagram together.
**Flow**:

1. One user opens excalidraw.com, draws initial boxes, clicks **Share → Copy
   link**.
2. Two teammates open the link; their cursors appear within 2 s.
3. All three edit simultaneously; changes are visible to others within 500 ms.
4. One user activates **Follow mode** to walk the team through the diagram.

**Success criteria**: No login required for guests; visible latency under 1 s on
a typical connection.

---

### Scenario 3 — Embedded Diagram in a Product

**User**: Developer adds Excalidraw to a Next.js knowledge-base app. **Flow**:

1. Developer installs `@excalidraw/excalidraw`, wraps it in a
   `dynamic(() => import(...), { ssr: false })`.
2. Passes `initialData` from their own persistence layer via props.
3. Subscribes to `onChange` to save updates back to their database.
4. Uses `ExcalidrawImperativeAPI.exportToBlob()` to generate preview thumbnails
   on demand.

**Success criteria**: Component renders with zero global side-effects;
`onChange` fires reliably on every meaningful edit.

---

### Scenario 4 — Library Reuse Across Sessions

**User**: Designer maintains a team component library (icons, wireframe
elements). **Flow**:

1. Designer creates elements, selects them, clicks **Add to Library**.
2. Library is saved to the cloud and a shareable link is generated.
3. Teammates open the link to install the library into their own sessions.
4. Dragging a library item onto the canvas places an editable copy.

**Success criteria**: Library items survive page refresh; shared link installs
in one click.

---

### Scenario 5 — Offline / Low-Connectivity Use

**User**: User is on a plane and wants to keep sketching. **Flow**:

1. Service worker serves the app shell from cache.
2. User draws; changes persist to IndexedDB every few seconds.
3. On reconnect, cloud sync resumes from the last local state.

**Success criteria**: App loads and saves locally with no network; no data loss
on reconnect.

---

## UX Anti-Patterns to Avoid

- **Blocking modals** before the user can start drawing.
- **Irreversible destructive actions** without undo (clearing canvas, deleting
  library).
- **Tool state that persists unexpectedly** — e.g., lock tool stays active after
  placing one element.
- **Precision-first defaults** — snapping/grid should assist, never fight,
  freehand intent.
- **Prop side-effects in the library** — embedding must not pollute `window`,
  `document`, or global CSS.
