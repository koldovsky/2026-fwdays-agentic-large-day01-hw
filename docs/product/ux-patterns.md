# UX Patterns

See also: [`docs/memory/productContext.md`](../memory/productContext.md) (scenarios and UX goals), [`docs/memory/systemPatterns.md`](../memory/systemPatterns.md) (ActionManager, canvases, store).

## Layered Editor UI
- Main UX is split between canvas rendering and a separate UI shell (`LayerUI`).
- Toolbars, dialogs, sidebars, and menus are feature components over shared app state.

## Interaction Patterns
- Selection and editing overlays are rendered on interactive canvas layer.
- New element drawing uses a transient render layer before finalizing in scene.

## Command Patterns
- User actions from keyboard/menu/context/API converge into ActionManager.
- Consistent action result contract enables uniform state updates and undo/redo behavior.
