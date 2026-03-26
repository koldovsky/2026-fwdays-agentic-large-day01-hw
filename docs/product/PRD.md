# Product Requirements Document — Excalidraw

--

## 1. Product Goal

Excalidraw exists to eliminate the friction between having an idea and getting
it onto a shared canvas.

Most diagramming tools default to precision: grids that snap aggressively,
polished output that looks "finished," and onboarding flows that demand accounts
before a single line is drawn. This creates a psychological barrier — users
hesitate to start, avoid iteration, and treat diagrams as deliverables rather
than thinking tools.

Excalidraw's answer is a **hand-drawn aesthetic that signals impermanence**.
Because every output looks like a sketch, there is no pressure to make it
perfect. The roughness is not a limitation — it is the product's core value
proposition.

**Primary goal**: Provide the fastest possible path from a blank browser tab to
a shared, collaborative, exportable sketch — with zero sign-up required.

**Secondary goal**: Offer the same canvas as an embeddable React library
(`@excalidraw/excalidraw`) so that third-party products can add whiteboarding to
their own apps without building rendering, undo, collaboration, or export from
scratch.

---

## 2. Target Audience

Excalidraw serves five distinct personas. All are equal first-class users; none
should be sacrificed for another.

| Persona                     | Core Job-to-be-Done                                             | Primary Entry Point                            | Key Frustrations to Avoid                                  |
| --------------------------- | --------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------- |
| **Solo ideator**            | Capture and communicate a quick idea visually                   | excalidraw.com, direct URL                     | Forced sign-up, slow initial load, modal interruptions     |
| **Team collaborator**       | Co-edit a diagram in real time during a meeting or async review | Share link from a session                      | Join friction, sync lag >500 ms, lost edits on reconnect   |
| **Presenter**               | Walk an audience through a diagram step-by-step                 | Follow mode activated from an existing session | Awkward multi-window sharing, cursor confusion             |
| **Developer (embedder)**    | Embed a full-featured whiteboard inside their own React app     | `npm install @excalidraw/excalidraw`           | API instability, SSR crashes, global CSS side-effects      |
| **Open-source contributor** | Add a feature or fix a bug without breaking existing behavior   | GitHub fork → local dev server                 | Undocumented implicit contracts, circular dependency traps |

### Market positioning

Excalidraw occupies the **low-fidelity / high-speed** quadrant: faster to start
than Figma or Miro, friendlier to non-designers than draw.io, and uniquely
suitable for ephemeral ideation over polished deliverables.

---

## 3. Key Features

### F1 — Instant Canvas (Zero Onboarding)

- The canvas is available immediately at page load — no account, no install, no
  onboarding wizard.
- Page load targets: first meaningful paint < 1 s; canvas interactive < 2 s.
- The blank canvas defaults to the **selection** tool; a single keypress (`R`,
  `E`, `D`, `A`, `P`, `T`) switches to any drawing tool.
- Local work is autosaved to **IndexedDB** on every meaningful change; data
  survives page refresh with no user action required.

**Success criteria**: A new visitor can draw a labeled rectangle and copy it to
the clipboard in ≤3 interactions and 0 dialog dismissals.

---

### F2 — Hand-Drawn Aesthetic Rendering

- All strokes, fills, arcs, and shapes are rendered with controlled roughness
  via **roughjs** (v4.6.4).
- Freehand pencil strokes use **perfect-freehand** (v1.2.0) for
  pressure-sensitive stroke simulation.
- The level of roughness, stroke width, fill style (hachure, cross-hatch, solid,
  zigzag), stroke color, and background color are all user-configurable without
  leaving the canvas.
- The aesthetic is preserved end-to-end: what users see on screen is what they
  export.

**Style properties exposed per element**: `strokeColor`, `backgroundColor`,
`fillStyle`, `strokeWidth`, `strokeStyle`, `roughness`, `opacity`, `roundness`.

---

### F3 — Full Drawing Toolkit

The canvas supports 13 element types across 3 categories:

**Shapes**: `rectangle`, `diamond`, `ellipse`

**Connectors & strokes**: `arrow` (directed, bindable), `line` (undirected
polyline/polygon), `freedraw`

**Content**: `text` (standalone or container-bound), `image` (raster, linked via
`fileId`), `frame` (named viewport clip), `magicframe` (AI generation target),
`embeddable` (live website preview via URL)

Additional capabilities:

- **Arrows** auto-bind to shape anchor points and re-route when shapes move
  (including elbow/orthogonal routing).
- **Text labels** can be embedded inside shapes via double-click — the text
  grows with the container.
- **Frames** act as named sections that clip their children and can be
  independently exported.
- **Groups** allow nested editing: double-click drills into a group; Escape
  exits.
- **Lasso selection** enables free-form multi-element selection.

---

### F4 — Real-Time Collaboration

- One user starts a session and clicks **Share → Copy link**; teammates open the
  link and join immediately — no login required for guests.
- Live **cursor presence**: each collaborator's cursor and name are visible to
  all others within ~500 ms.
- **Element sync**: concurrent edits by multiple users are merged in real time
  via Socket.io (WebSocket) with element-level conflict resolution using
  `version` / `versionNonce` stamps.
- **Follow mode**: a presenter broadcasts their viewport to all followers —
  useful for walkthroughs and demos.
- **Offline resilience**: if connectivity drops, the app continues to work
  locally (IndexedDB) and syncs back to the cloud on reconnect.

**Backend**: Socket.io v4.7.2 + Firebase v11.3.1 (cloud persistence) — used only
in `excalidraw-app`, not bundled into the npm library.

---

### F5 — Export & Portability (No Lock-In)

Users can export their work in four formats, all reachable within ≤3
interactions:

| Format                 | Characteristics                                                     |
| ---------------------- | ------------------------------------------------------------------- |
| **PNG**                | Raster image; optional transparent background; configurable scale   |
| **SVG**                | Vector; embeds the source `.excalidraw` JSON for round-trip editing |
| **`.excalidraw` JSON** | Full scene file; re-importable; plain JSON, no binary blobs         |
| **Clipboard**          | Copy as PNG or SVG directly into other applications                 |

- SVG exports are self-contained: loading the SVG file back into Excalidraw
  restores the fully editable scene.
- The **File System Access API** (`browser-fs-access`) enables native
  save-dialog integration where browsers support it.
- Exports use **gzip compression** (pako v2.0.3) for `.excalidraw` files shared
  via URL (encoded in the fragment hash — never sent to the server).

---

### F6 — Element Library (Reusable Components)

- Users can select any set of elements and click **Add to Library** to save them
  as reusable items.
- Library items are stored locally (IndexedDB) and can be exported as
  `.excalidrawlib` files.
- A **shareable library URL** lets teams distribute a shared component set —
  teammates install it with one click.
- Dragging a library item onto the canvas places a fully editable, independent
  copy.
- Libraries from the community (Excalidraw Libraries portal) can be installed
  via URL.

---

### F7 — Embeddable React Library (`@excalidraw/excalidraw`)

The npm library ships the full canvas as a self-contained React component:

```tsx
import { Excalidraw } from "@excalidraw/excalidraw";

<Excalidraw
  initialData={sceneData}
  onChange={(elements, appState) => persist(elements)}
  onExcalidrawAPI={(api) => setApi(api)}
/>;
```

Key guarantees for embedders:

- **No SSR** — must be loaded client-side only (use
  `dynamic(() => import(...), { ssr: false })` in Next.js).
- **No global side-effects** — the component does not pollute `window`,
  `document`, or global CSS.
- **Stable imperative API** (`ExcalidrawImperativeAPI`): `updateScene`,
  `getSceneElements`, `exportToBlob`, `resetScene`, `scrollToContent`, and more.
- **Prop-driven customization**: theme, toolbar visibility, UI options, initial
  data, and custom actions are all controllable via props.
- **Multi-instance safe**: each `<Excalidraw />` runs an isolated Jotai store
  per instance (via `jotai-scope`).

---

### F8 — Accessibility & Internationalization

- **Keyboard shortcuts** cover every major action: tools (`R`, `E`, `D`, `A`,
  `P`, `T`, `F`, `H`), operations (`Ctrl+Z`, `Ctrl+Shift+Z`, `Ctrl+G`, `Ctrl+A`,
  `Ctrl+Shift+E`), and navigation (`+`/`-` zoom, `Space` pan).
- All major interactive elements have `aria` labels; dialog management uses
  Radix UI primitives for accessibility.
- **Dark mode** is a first-class theme option, togglable via the UI or host app
  prop.
- **i18n** is supported via locale JSON files in `packages/excalidraw/locales/`;
  translations are managed via Crowdin. New locales can be contributed without
  code changes.

---

### F9 — Offline / PWA Support

- A **service worker** (`vite-plugin-pwa`) caches the app shell so the
  whiteboard loads from cache on repeat visits — even without a network
  connection.
- The service worker handles app caching only; drawing data lives in IndexedDB
  (separate concern).
- On reconnect, cloud sync resumes automatically from the last local state.

---

## 4. Technical Constraints & Concerns

These are known limitations, design trade-offs, and areas of technical debt that
constrain what can be built or changed without risk of regression.

---

### TC1 — Client-Side Only; No SSR

The library (`@excalidraw/excalidraw`) is **strictly browser-only**. It reads
`window`, `document`, and HTMLCanvasElement APIs at module load time.
Server-side rendering will crash with "window is not defined." Embedders in
Next.js, Remix, or similar frameworks must always use dynamic imports with SSR
disabled.

---

### TC2 — Canvas Size & Large Scene Performance

- The rendering pipeline uses two HTML canvas layers. For large scenes
  (thousands of elements), rendering becomes a CPU bottleneck.
- `isElementInFrame()` is called on every pointer move and re-render — it is a
  **known performance bottleneck** (TODO in source: "this is a huge bottleneck
  for large scenes, optimise") with no memoization.
- Snapping computation is bounded at `VISIBLE_GAPS_LIMIT_PER_AXIS = 99,999` —
  scenes with more elements silently stop computing gap guides.
- There is no virtualization or incremental rendering; all non-deleted,
  viewport-visible elements are redrawn on every static canvas pass.

---

### TC3 — Collaboration Requires External Infrastructure

Real-time collaboration (Socket.io WebSocket server + Firebase) is an
`excalidraw-app`-level concern — it is **not included** in the
`@excalidraw/excalidraw` npm package. Embedders who want collaboration must
build or operate their own backend. The library only provides the `onChange`
hook and `updateScene` API as integration points.

---

### TC4 — Known Incorrect Bounding Boxes for Curved Elements

Bounding boxes for curved elements (arcs, beziers) are computed from point
extrema, not from actual curve extrema. When control points extend outside the
min/max envelope, the bounding box is **geometrically incorrect**. This affects
snapping, flip, rotate, resize, and any operation that reads `getBoundingBox()`.
Explicitly documented as a known bug in the test suite (multiple
`//TODO: elements with curve outside minMax points have a wrong bounding box!!!`
comments).

---

### TC5 — GroupId Ordering Not Preserved After Undo/Redo

The undo/redo history system (Store) does not post-process `groupIds` arrays.
Repeated undo/redo sequences can produce groups with the same IDs in a different
order, subtly breaking visual layering within groups. This is a known open issue
(`#7348` in comments) with no current fix.

---

### TC6 — Global Singletons Limit Multi-Instance Embedding

Several module-level singletons are shared across all `<Excalidraw />` instances
on the same page:

- `isSomeElementSelected` (in `selection.ts`) — a memoized closure with a global
  cache that must be manually cleared.
- `Scene.getScene()` — a global registry still depended on by elbow-arrow
  routing.
- `libraryItemsAtom` (Jotai) — shared across all instances; `Library.destroy()`
  intentionally does not reset it to avoid wiping sibling instances' libraries.

Multiple instances on one page are possible but require awareness of these
shared-state lifetimes.

---

### TC7 — React Class Component Constraint

The core `App` component is a React class component (not a functional component
with hooks). It holds 80+ fields in `AppState` and relies on
`unstable_batchedUpdates` and `flushSync` in 10+ places to control render
timing. Migrating to functional components or adding hooks to `App` directly is
a high-risk change. Jotai is used for cross-cutting UI atoms only; the canvas
and element state must remain in the class component for performance reasons.

---

### TC8 — Font Subsetting WASM Dependency

Custom font rendering uses **HarfBuzz compiled to WASM** (`harfbuzzjs` v0.3.6)
for font subsetting. WASM loading is asynchronous and may fail in restricted CSP
environments. The WASM binary is in `scripts/wasm/` and must not be modified or
replaced without a rebuild of the HarfBuzz bindings.

---

### TC9 — Collaboration Data Security Model

Collaboration sessions encode the full scene in the URL fragment hash
(everything after `#`). This means:

- Scene data is **never sent to the Excalidraw server** — only to the room's
  Socket.io channel.
- The server acts as a relay; it cannot read drawing content.
- However, **anyone with the link can join and edit** — there is no
  authentication, authorization, or room password in the default implementation.

---

### TC10 — `flushSync` Usage Is Load-Bearing

`App.tsx` uses `flushSync` in 10+ places to force synchronous React state
flushing before the next pointer event reads `this.state`. These calls are not
optimization choices — they are correctness requirements. Removing or reordering
any `flushSync` call causes handlers to observe stale state, producing silent
bugs in arrow binding, keyboard finalization, and selection state.

---

## 5. Non-Goals

The following are explicitly outside Excalidraw's scope at the library level
(v0.18.0):

- **Authentication / authorization**: The library has no concept of users,
  permissions, or access control.
- **Backend / API**: No server-side component; persistence is delegated to the
  host app via `onChange` + `initialData`.
- **Pixel-perfect / precision-first diagramming**: Excalidraw is a sketching
  tool. Production-quality technical diagrams belong in Lucidchart, draw.io, or
  similar tools.
- **Mobile-native experience**: The app works on mobile browsers but some
  features (e.g., linear element transform handles) are intentionally disabled
  on touch devices pending a proper mobile UI design.
- **Print-optimized output**: PDF export is not supported; PNG/SVG are the
  intended print-friendly formats.
- **Multiplayer conflict resolution with operational transforms**: Conflict
  resolution is last-write-wins at the element level (version stamps), not OT or
  CRDT.
