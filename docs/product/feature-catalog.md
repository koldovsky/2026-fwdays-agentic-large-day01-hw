# Feature Catalog

> All implemented features, organized by category. Evidence-based: each entry links to the source file or constant where it was found.

---

## Drawing Tools

| Feature | Description | Source |
|---------|-------------|--------|
| Rectangle | Draw rectangles with optional rounded corners | `TOOL_TYPE.rectangle` |
| Diamond | Draw diamond shapes | `TOOL_TYPE.diamond` |
| Ellipse | Draw circles and ellipses | `TOOL_TYPE.ellipse` |
| Arrow | Directional arrows with configurable heads (sharp, round, elbow) | `TOOL_TYPE.arrow`, `ARROW_TYPE` |
| Line | Non-directional line segments | `TOOL_TYPE.line` |
| Freedraw | Smooth freehand strokes via `perfect-freehand` | `TOOL_TYPE.freedraw` |
| Text | Click-to-place text with full font/size/alignment control | `TOOL_TYPE.text` |
| Image | Insert raster images (PNG, JPEG, GIF, WEBP, BMP, ICO, AVIF) | `TOOL_TYPE.image`, `MIME_TYPES` |
| Eraser | Paint-erase elements | `TOOL_TYPE.eraser` |
| Frame | Named container for grouping elements | `TOOL_TYPE.frame` |
| Magic Frame | AI-powered frame for generating content | `TOOL_TYPE.magicframe` |
| Embeddable | Embed external URLs as iframes on canvas | `TOOL_TYPE.embeddable` |
| Laser Pointer | Fading laser trail for presentations | `TOOL_TYPE.laser` |
| Hand / Pan | Pan canvas without element interaction | `TOOL_TYPE.hand` |
| Lasso Select | Freehand selection by enclosing area | `TOOL_TYPE.lasso` |

---

## Element Manipulation

| Feature | Description | Source |
|---------|-------------|--------|
| Select | Click or drag-box to select elements | `TOOL_TYPE.selection` |
| Move | Drag selected elements | `dragElements/` |
| Resize | 8-handle resize with shift-lock proportional | `resizeElements/` |
| Rotate | Angle handle rotation | `transform/` |
| Flip (H/V) | Mirror elements horizontally or vertically | `actionFlip.ts` |
| Duplicate | Copy in place with offset | `actionDuplicateSelection.tsx` |
| Delete | Remove selected elements | `actionDeleteSelected.tsx` |
| Group / Ungroup | Combine elements into a single selectable unit | `actionGroup.tsx` |
| Lock / Unlock | Prevent element from being moved or edited | `actionElementLock.ts` |
| Copy / Cut / Paste | Clipboard operations including paste from system clipboard | `actionClipboard.tsx` |
| Select All | `Ctrl+A` to select all elements | `actionSelectAll.ts` |
| Undo / Redo | Full history stack | `actionHistory.tsx` |
| Z-index (layer order) | Bring to front, send to back, move forward/backward | `actionZindex.tsx` |
| Align | Align selected elements (left, center, right, top, middle, bottom) | `actionAlign.tsx` |
| Distribute | Even spacing between elements (horizontal, vertical) | `actionDistribute.tsx` |
| Snap to Grid | Optional grid snapping (default 20px) | `actionToggleGridMode.tsx` |
| Object Snap | Snap to element edges and centers | `actionToggleObjectsSnapMode.tsx` |
| Midpoint Snap | Snap arrows to element midpoints | `actionToggleMidpointSnapping.tsx` |
| Crop Image | Crop inserted images | `actionCropEditor.tsx` |
| Bound Text | Attach text inside a container shape | `actionBoundText.tsx` |
| Element Link | Link elements to URLs or other elements | `actionElementLink.ts` |
| Hyperlink | Add clickable URL to any element | `actionLink.tsx` |
| Convert Element Type | Change e.g. rectangle → diamond in-place | `ConvertElementTypePopup.tsx` |
| Shape Switch | Toggle between shape types | `actionToggleShapeSwitch.tsx` |
| Text Auto-resize | Text container auto-expands to fit content | `actionTextAutoResize.ts` |
| Position on Grid | Snap to grid position | `positionElementsOnGrid/` |

---

## Visual Styling

| Feature | Description | Source |
|---------|-------------|--------|
| Stroke Color | Per-element stroke color | `actionProperties.tsx` |
| Fill Color | Per-element fill color | `actionProperties.tsx` |
| Background Color | Canvas background color | `actionCanvas.tsx` |
| Fill Style | Hachure, cross-hatch, solid, zigzag, dots | `actionProperties.tsx` |
| Stroke Width | Thin (1), Bold (2), Extra-bold (4) | `STROKE_WIDTH` |
| Stroke Style | Solid, dashed, dotted | `actionProperties.tsx` |
| Roughness | Architect / Artist / Cartoonist | `ROUGHNESS` |
| Opacity | Per-element opacity | `actionProperties.tsx` |
| Roundness | Corner rounding style | `ROUNDNESS` |
| Font Family | Excalifont, Virgil, Cascadia, Nunito, Liberation Sans, etc. | `FONT_FAMILY` |
| Font Size | sm (16), md (20), lg (28), xl (36) | `FONT_SIZES` |
| Text Alignment | Left, center, right | `actionProperties.tsx` |
| Vertical Alignment | Top, middle, bottom | `actionProperties.tsx` |
| Arrowhead Style | None, arrow, bar, dot, diamond, triangle | `arrowheads/` |
| Arrow Type | Sharp, round, elbow | `ARROW_TYPE` |
| EyeDropper | Sample color from canvas | `EyeDropper.tsx` |
| Dark Mode | Full dark/light theme switch | `DarkModeToggle.tsx`, `THEME` |
| Font Picker | Visual font selection UI | `components/FontPicker/` |
| Color Picker | Full-featured color picker with palettes | `components/ColorPicker/` |

---

## Canvas Navigation

| Feature | Description | Source |
|---------|-------------|--------|
| Zoom In / Out | Step: 0.1, range: 0.1–30x | `ZOOM_STEP`, `MIN_ZOOM`, `MAX_ZOOM` |
| Fit to Screen | Zoom to fit all elements | `actionNavigate.tsx` |
| Scroll | Pan by drag (hand tool) or scroll wheel | `AppState.scrollX/scrollY` |
| Reset View | Return to default zoom and position | `actionCanvas.tsx` |
| Viewport Bounds | Track visible scene area for collab sync | `WS_SUBTYPES.USER_VISIBLE_SCENE_BOUNDS` |

---

## Collaboration

| Feature | Description | Source |
|---------|-------------|--------|
| Real-time Co-editing | Multiple users edit the same scene live | `collab/Collab.tsx`, Socket.io |
| User Cursors | Remote users' pointers visible in real time | `Collaborator.pointer` |
| User Presence | Username, avatar color, idle state indicators | `UserList.tsx` |
| Follow Mode | Follow another user's viewport | `components/FollowMode/` |
| Idle Detection | Presence state: Active → Away → Idle | `IDLE_THRESHOLD`, `ACTIVE_THRESHOLD` |
| Room Generation | Auto-generate encrypted room link | `generateCollaborationLinkData()` |
| Cross-tab Sync | Changes propagate to other open tabs | `data/tabSync.ts` |

---

## Export & Import

| Feature | Description | Source |
|---------|-------------|--------|
| Save as PNG | Raster export with optional background | `exportToBlob()` |
| Save as SVG | Vector export with embedded fonts | `exportToSvg()` |
| Save as JSON | Native `.excalidraw` file format | `serializeAsJSON()` |
| Copy to Clipboard | Copy canvas as PNG to system clipboard | `exportToClipboard()` |
| Load from file | Import `.excalidraw`, `.excalidrawlib`, PNG | `loadFromBlob()` |
| Paste from clipboard | Paste images or JSON from clipboard | `actionClipboard.tsx` |
| Web Share API | Share via native OS share sheet | `ExportDialog.tsx` |
| Export to Excalidraw+ | Premium export flow | `ExportToExcalidrawPlus.tsx` |

---

## Sharing & Privacy

| Feature | Description | Source |
|---------|-------------|--------|
| Encrypted Share Link | AES-GCM encrypted scene stored on backend; key in URL fragment | `data/index.ts: exportToBackend()` |
| Collaboration Link | `#room=[id],[key]` URL for real-time rooms | `getCollaborationLink()` |
| QR Code | Generate QR code for share links | `uqr` dependency |

---

## Library System

| Feature | Description | Source |
|---------|-------------|--------|
| Save to Library | Add selected elements as a library item | `actionAddToLibrary.ts` |
| Library Browser | Browse and insert saved items | `LibraryMenu.tsx` |
| Library from URL | Import library from remote URL | `useHandleLibrary()` |
| Publish Library | Share library publicly | `PublishLibrary.tsx` |
| Library Storage | Persisted in IndexedDB | `data/LocalData.ts` |

---

## AI Features

| Feature | Description | Source |
|---------|-------------|--------|
| Text-to-Diagram (TTD) | Convert text/Mermaid to Excalidraw elements | `TTDDialog/` |
| Mermaid Import | Parse Mermaid diagram syntax | `mermaid-to-excalidraw` chunk |
| Diagram-to-Code | Convert diagram to code representation | `DiagramToCodePlugin/` |
| Magic Frame | Generate elements from AI inside a frame | `TOOL_TYPE.magicframe` |

---

## Spreadsheet / Charts

| Feature | Description | Source |
|---------|-------------|--------|
| Spreadsheet Paste | Paste tabular data as a chart | `renderSpreadsheet()`, `tryParseSpreadsheet()` |
| Chart Rendering | Render bar/line charts from spreadsheet data | `packages/excalidraw/charts/` |

---

## Developer / Embedding

| Feature | Description | Source |
|---------|-------------|--------|
| React Component | `<Excalidraw />` embeddable in any React app | `packages/excalidraw/index.tsx` |
| Imperative API | Full programmatic control via `ExcalidrawImperativeAPI` | `types.ts` |
| Custom UI Slots | `renderTopLeftUI`, `renderTopRightUI` | `ExcalidrawProps` |
| Custom Actions | `registerAction()` to add custom canvas operations | `ExcalidrawImperativeAPI` |
| Event Subscriptions | `onChange`, `onPointerDown/Up`, `onScrollChange`, `onStateChange`, `onEvent` | `ExcalidrawImperativeAPI` |
| UIOptions | Toggle/configure built-in UI elements | `DEFAULT_UI_OPTIONS` |

---

## UI / UX Features

| Feature | Description | Source |
|---------|-------------|--------|
| Command Palette | Keyboard-driven command search | `CommandPalette/` |
| Zen Mode | Hide all UI for distraction-free drawing | `actionToggleZenMode.tsx` |
| View Mode | Read-only canvas | `actionToggleViewMode.tsx` |
| Search Elements | Find elements by text content | `SearchMenu.tsx` |
| Statistics Panel | Canvas metrics overlay | `components/Stats/` |
| PWA Installation | Install as desktop/mobile app | `vite-plugin-pwa` |
| Keyboard Shortcuts | Full shortcut system | `actions/shortcuts.ts` |
| i18n / 50+ Languages | Auto-detected browser language | `locales/`, `language-detector.ts` |
| Offline Support | Works without internet after first load | Service Worker + localStorage |
| Welcome Screen | First-run onboarding overlay | `AppWelcomeScreen.tsx` |
| Toast Notifications | Transient UI messages | `Toast.tsx` |
| Error Boundary | Graceful crash recovery | `TopErrorBoundary.tsx` |
| Sentry Integration | Error tracking in production | `sentry-production.yml` |
