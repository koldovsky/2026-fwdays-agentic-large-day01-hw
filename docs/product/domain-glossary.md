# Domain Glossary — Excalidraw

## Core Drawing Concepts

| Term | Definition |
| ---- | ---------- |
| **Element** | The fundamental drawing unit. Every shape, line, text block, or image on the canvas is an element with properties like position, size, color, and style. |
| **Scene** | The container holding all elements in the current drawing. Manages element ordering (z-index) and provides query/update methods. |
| **Canvas** | The HTML5 Canvas surface where elements are rendered. All visual output is drawn here using the Canvas 2D API. |
| **Viewport** | The visible portion of the infinite canvas, determined by the current zoom level and scroll position. |
| **Zoom** | The scale factor controlling magnification of the viewport. Values > 1 zoom in, < 1 zoom out. |
| **Scroll / Pan** | The X and Y offset of the viewport within the infinite canvas. Users pan by dragging or scrolling. |
| **AppState** | The global application state object: current tool, selection, zoom, scroll, theme, UI mode, and collaboration status. |

## Element Types

| Term | Definition |
| ---- | ---------- |
| **Rectangle** | A rectangular shape element. Can have rounded corners, fill, and stroke. |
| **Ellipse** | A circular or oval shape element. |
| **Diamond** | A rotated square (rhombus) shape element. |
| **Arrow** | A directional line element that can bind to other elements at its endpoints. |
| **Line** | A non-directional path element, optionally with multiple points. |
| **Text** | A text block element with font, size, and alignment properties. |
| **Image** | A raster image element embedded in the canvas. |
| **Frame** | A container element that groups and clips child elements within its bounds. |
| **Embeddable** | An iframe-based element for embedding external content (websites, videos). |
| **Freedraw** | A freehand drawing path created with the pencil tool. |

## Interaction Concepts

| Term | Definition |
| ---- | ---------- |
| **Selection** | The set of currently selected elements, tracked in AppState. Users select by clicking or drag-selecting. |
| **Lasso Selection** | A free-form selection tool that selects elements enclosed by or intersecting with a hand-drawn path. |
| **Binding** | The connection between an arrow/line endpoint and a target element. When the target moves, the arrow follows. |
| **Grouping** | Combining multiple elements into a logical group that can be selected and moved as one unit. |
| **Hit Testing** | Determining which element (if any) is under the cursor at a given point. Used for selection, hover, and context menus. |
| **Drag / Resize** | Moving or scaling elements by dragging handles. Resize handles appear at element corners and edges. |
| **Rotation** | Rotating an element around its center point using the rotation handle. |
| **Snapping** | Automatic alignment of elements to grid lines or other elements during move/resize. |

## Rendering Concepts

| Term | Definition |
| ---- | ---------- |
| **rough.js** | The rendering library that gives Excalidraw its signature hand-drawn, sketchy appearance. |
| **Stroke** | The outline/border of a shape element, defined by color, width, and style (solid, dashed, dotted). |
| **Fill** | The interior color of a shape. Styles include solid, hatch, cross-hatch, and none. |
| **Opacity** | The transparency level of an element (0–100). |
| **Z-Index** | The stacking order of elements. Higher z-index elements render on top of lower ones. |

## Collaboration Concepts

| Term | Definition |
| ---- | ---------- |
| **Collaboration Room** | A shared session where multiple users edit the same drawing in real time via WebSocket connections. |
| **Reconciliation** | The process of merging concurrent element changes from multiple collaborators into a consistent state. |
| **Pointer Update** | Broadcasting cursor position and selected tool to other collaborators for presence awareness. |
| **Laser Pointer** | An ephemeral trail drawn during presentations, visible to all collaborators but not persisted as an element. |

## UI Modes

| Term | Definition |
| ---- | ---------- |
| **Zen Mode** | A distraction-free mode that hides most UI chrome, leaving only the canvas. |
| **View Mode** | A read-only mode where users can pan and zoom but cannot edit elements. |
| **Grid Mode** | Displays a grid overlay and snaps element positions to grid intersections. |

## Export & Persistence

| Term | Definition |
| ---- | ---------- |
| **Scene Export** | Saving the entire drawing as a `.excalidraw` JSON file containing all elements and state. |
| **PNG Export** | Rasterizing the canvas to a PNG image file. |
| **SVG Export** | Converting elements to SVG markup for vector output. |
| **Library** | A collection of reusable element groups that users can save and insert into drawings. |
| **Blob** | A binary large object used as an intermediate format when exporting images. |

## AI / Advanced Features

| Term | Definition |
| ---- | ---------- |
| **Text-To-Diagram (TTD)** | An AI-powered feature that converts natural language descriptions into Excalidraw diagrams. |
| **Magic Frame** | An AI-powered frame that generates diagram content based on a text prompt. |
| **Mermaid-to-Excalidraw** | A converter that transforms Mermaid diagram syntax into native Excalidraw elements. |

## Development Terms

| Term | Definition |
| ---- | ---------- |
| **Workspace** | A Yarn workspace package within the monorepo (e.g., `@excalidraw/excalidraw`). |
| **Action** | A discrete user operation (align, delete, export) with associated keyboard shortcut, icon, and state transformation logic. |
| **Atom** | A Jotai state primitive — the smallest unit of reactive state. Components subscribe to atoms and re-render only when subscribed atoms change. |
| **Animated Trail** | A smooth, interpolated rendering of drawing paths used for the laser pointer and freedraw tools. |

## Related Documentation

- [Project Brief](memory/projectbrief.md) — project overview
- [Product Context](memory/productContext.md) — audience and workflows
- [System Patterns](memory/systemPatterns.md) — architectural patterns
- [Architecture](technical/architecture.md) — system diagrams
- [PRD](product/PRD.md) — full product requirements
