# Decision Log: Undocumented Behavior & Problematic Patterns

A comprehensive analysis of implicit behavior, state machines, side effects, and initialization order dependencies in Excalidraw.

---

## Summary

The Excalidraw codebase contains significant undocumented patterns that create fragility:
- **8+ implicit state machines** with complex transitions
- **40+ warning comments** (HACK, FIXME, TODO, WORKAROUND)
- **Multiple magic timing constants** (100ms, 500ms) for browser quirks
- **Race conditions** in library sync, font loading, and clipboard operations
- **Initialization order dependencies** with fragile constructor sequences

---

## 1. Critical Warning Comments

### 1.1 State Update Order Fragility
**File**: `/packages/excalidraw/components/App.tsx:3503`

```typescript
// failsafe in case the state is being updated in incorrect order
// resulting in the editingTextElement being now a deleted element
```

**Issue**: The code defensively checks if state is inconsistent after updates, revealing fundamental race conditions in state transitions. Developers must add defensive checks or risk silent failures.

---

### 1.2 Mutation Method Fragmentation
**File**: `/packages/element/src/mutateElement.ts:29-36`

```typescript
/**
 * WARNING: this won't trigger the component to update, so if you need to
 * trigger component update, use scene.mutateElement or
 * ExcalidrawImperativeAPI.mutateElement instead.
 */
```

**Issue**: THREE different ways to mutate elements with different side effects:
1. Direct `mutateElement()` - no component update
2. `scene.mutateElement()` - updates scene, notifies observers
3. `ExcalidrawImperativeAPI.mutateElement()` - full update propagation

Developers must know which to use or mutations won't propagate correctly.

---

### 1.3 Hardcoded Binding Gap Constraint
**File**: `/packages/element/src/binding.ts:107-112`

```typescript
// IMPORTANT: currently must be > 0 (this also applies to the computed gap)
const BASE_BINDING_GAP = 4;
```

**Issue**: A runtime constraint with no validation. If changed to 0, behavior changes silently without errors.

---

### 1.4 Point Translation Safety Trap
**File**: `/packages/math/src/point.ts:157-163`

```typescript
// WARNING: This is not for translating Excalidraw element points!
// Element points need to be rotated around the element center first.
// CONSIDER USING AN APPROPRIATE ELEMENT-AWARE TRANSLATE!
```

**Issue**: The API allows "wrong usage" that appears correct syntactically but produces incorrect results for rotated elements.

---

### 1.5 Deprecated Test File Still in Use
**File**: `/packages/excalidraw/tests/regressionTests.test.tsx:1199-1200`

```typescript
// DEPRECATED: DO NOT ADD TESTS HERE
```

**Issue**: Deprecated file still exists. New contributors might add tests to the wrong location.

---

## 2. Implicit State Machines

### 2.1 BindMode State Machine (Complex, Undocumented)
**Files**: `/packages/excalidraw/components/App.tsx:965-1024, 1078-1097, 1213-1222`

**States**: `"orbit"` | `"skip"` | `"inside"` | `undefined`

**Implicit Transitions**:
1. Start: `"skip"` (if binding enabled) or `undefined`
2. On hover element: → `"inside"`
3. After timeout (`BIND_MODE_TIMEOUT`): `"orbit"` → `"skip"`

**Problems**:
- Line 972 admits performance issue: "check will not pass the second time"
- No documentation on state transitions
- Multiple conditions control transitions (hoveredElement, timeout)

---

### 2.2 ActiveEmbeddable State Machine (iframe/Video)
**Files**: `/packages/excalidraw/components/App.tsx:1387-1406`

**Implicit Transitions**:
```typescript
setTimeout(() => {
  // Delay serves TWO purposes:
  // 1. Prevent click propagating to iframe on mobile
  // 2. Prevent YouTube from opening in fullscreen
  this.setState({ activeEmbeddable: { state: "active", ... } });
}, 100);
```

**Problems**:
- 100ms magic timing constant for browser quirks
- Mobile-specific workaround without feature detection
- Global `YOUTUBE_VIDEO_STATES` Map shared across instances (multi-instance bug risk)

---

### 2.3 Tool Auto-Activation State Machine
**File**: `/packages/excalidraw/components/App.tsx:3424-3450`

**Issue**: Automatic tool changes triggered by combination of flags with no explicit state machine documentation.

---

## 3. Non-Obvious Side Effects

### 3.1 Deferred State Updates with Race Condition Handling
**File**: `/packages/excalidraw/components/App.tsx:3490-3501`

```typescript
setTimeout(() => {
  // execute only if the condition still holds when the deferred callback
  // executes (it can be scheduled multiple times depending on how
  // many times the component renders)
  this.state.selectedLinearElement?.isEditing &&
    this.actionManager.executeAction(actionFinalize);
});
```

**Issue**: State update intentionally deferred. Guard condition suggests multiple timers can queue simultaneously. Potential for action execution multiple times.

---

### 3.2 AppStateObserver Implicit Tracking
**File**: `/packages/excalidraw/components/AppStateObserver.ts:62-121`

Called from: `/packages/excalidraw/components/App.tsx:3366` in `componentDidUpdate`

**Side Effects**:
- Each listener applies independent selectors
- Multiple listeners can cascade effects
- No clear documentation of listener lifecycle

---

### 3.3 Global Event Emitters with Implicit Cleanup
**File**: `/packages/excalidraw/components/App.tsx:708-738`

```typescript
onChangeEmitter = new ObservablesEmitter<ObserverUpdate>();
onPointerDownEmitter = new ObservablesEmitter<PointerState>();
// ... more emitters
```

**Issue**: Emitter state persists across renders. No clear documentation on listener accumulation or cleanup.

---

### 3.4 Clipboard State with Platform Quirks
**File**: `/packages/excalidraw/clipboard.ts:641`

```typescript
// clearing clipboard using this API, we must copy at least an empty char
navigator.clipboard.writeText("");
```

**Issue**: Browser API quirk. Behavior may vary by browser version. Silent failure if behavior changes.

---

## 4. Initialization Order Dependencies

### 4.1 Constructor Initialization Sequence
**File**: `/packages/excalidraw/components/App.tsx:787-852`

**Critical Sequence**:
1. Line 799: AppState created
2. Line 814-815: Functions depend on state
3. Line 818-845: Internal objects created
4. **BUG**: Line 833 AND 841 both create history (overwrites!)
5. Line 851: API created

**Problems**:
- Constructor creates API/History twice
- If internal code needs API, it fails
- Line 848-849 comment admits StrictMode fragility

---

### 4.2 ComponentDidMount Re-initialization
**File**: `/packages/excalidraw/components/App.tsx:3057-3200`

```typescript
// API recreated in componentDidMount
this.createAPI();
```

**Issue**: API created twice (constructor + componentDidMount). Suggests creation has side effects that only work post-mount.

---

### 4.3 Font Loading Race Condition
**File**: `/packages/excalidraw/components/App.tsx:2972-2975`

```typescript
this.fonts.loadSceneFonts().then((fontFaces) => {
  this.fonts.onLoaded(fontFaces);
});
```

**Issue**: Async font loading after scene setup. Any render before fonts load uses fallback metrics. Text element metrics may be incorrect initially.

---

## 5. Browser Quirks & Magic Timing Constants

### 5.1 Canvas Context Loss on Tab Switch
**File**: `/packages/excalidraw/components/App.tsx:3294-3298`

```typescript
// browsers (chrome?) tend to free up memory a lot, which results
// in canvas context being cleared. Thus re-render on focus.
this.triggerRender(true);
```

**Issue**: Chrome clears canvas when tab loses focus. App explicitly detects and re-renders. Behavior may not be consistent across versions.

---

### 5.2 Touch vs Pointer Event Double-Click Detection
**File**: `/packages/excalidraw/components/App.tsx:689-693`

```typescript
const TAP_TWICE_TIMEOUT = 300;
// Custom tracking because "browser doubleClick sucks to begin with"
```

**Issue**: Browser `dblclick` event unreliable. Custom detection uses magic 300ms constant. Timing varies by OS.

---

### 5.3 YouTube/Vimeo Embed Fullscreen Workaround
**File**: `/packages/excalidraw/components/App.tsx:1393-1406`

```typescript
setTimeout(() => {
  // Prevents YouTube from immediately opening video in fullscreen
}, 100);

const YOUTUBE_VIDEO_STATES = new Map();  // Global, shared across instances!
```

**Issues**:
- 100ms magic delay
- Global Map shared across Excalidraw instances (bug: deleting one drawing affects another)

---

### 5.4 Plain Paste Detection with Timer Exploit
**File**: `/packages/excalidraw/components/App.tsx:4926-4929`

```typescript
IS_PLAIN_PASTE_TIMER = window.setTimeout(() => {
  // Detect paste type by setTimeout timing
}, 100); // magic number, reset (100ms to be safe)
```

**Issue**: Detects paste type exploiting event loop timing. Comment admits uncertainty. May fail on slow devices.

---

### 5.5 Snap Cache Synchronous Population Requirement
**File**: `/packages/excalidraw/components/App.tsx:9924-9925`

```typescript
// Snap cache *must* be synchronously popuplated before initial drag,
// otherwise the first drag event will not snap
```

**Issue**: Critical timing requirement. Any async code in initialization breaks snapping. Silent failure.

---

## 6. Memory Leaks & Resource Management

### 6.1 Memory Leaks in Tests
**File**: `/packages/excalidraw/tests/selection.test.tsx:250, 273`

```typescript
// TODO: There is a memory leak if pointer up is not triggered
```

### 6.2 Font Face Loading Memory
**File**: `/packages/excalidraw/subset/subset-shared.chunk.ts:49`

```typescript
// IMPORTANT: could be expensive, as each new worker instance lazy loads
// these to their own memory ~ keep the # of workers small!
```

### 6.3 Global ImageCache Cleanup
**File**: `/packages/excalidraw/components/App.tsx:3047-3055`

**Issue**: Must be called explicitly. Scene reset without calling leaves cache dirty.

---

## 7. Complex Interdependencies

### 7.1 Store Commitment Ordering
**File**: `/packages/excalidraw/components/App.tsx:3509`

```typescript
this.appStateObserver.flush(prevState);      // FIRST
this.store.commit(elementsMap, this.state);  // AFTER
```

**Issue**: Observers flush before store commits. If observers trigger async actions, they see stale store state.

---

### 7.2 Selection Tool Restoration Logic
**File**: `/packages/excalidraw/components/App.tsx:2917-2941`

**Issue**: "Preference" concept is implicit. Multiple conditions govern restoration. No documentation on when preference is saved/restored.

---

### 7.3 Export Theme Override
**File**: `/packages/excalidraw/components/App.tsx:3372-3377`

**Issue**: Session-level theme override with unclear lifecycle. When is it set/cleared? Side-effect setState updates export theme implicitly.

---

## 8. Race Conditions & Stale State

### 8.1 Font Loading Out-of-Order
**File**: `/packages/excalidraw/actions/actionProperties.tsx:1086`

**Issue**: User rapidly switches fonts while previous fonts still loading. Font loads complete out-of-order. Text measurements may be incorrect.

---

### 8.2 Library Item Sync Race Conditions
**File**: `/packages/excalidraw/data/library.ts:633-635`

**Issue**: Explicit acknowledgment of race conditions during library sync and initialization. No clear synchronization mechanism documented.

---

### 8.3 Library Menu Stale State
**File**: `/packages/excalidraw/components/LibraryMenu.tsx:214, 240`

**Issue**: Effect captures stale state. Effect not fully reactive to dependency changes.

---

## 9. Summary Table

| Category | Count | Severity | Impact |
|----------|-------|----------|---------|
| Warning Comments (HACK/FIXME/TODO) | 40+ | Medium | Technical debt, potential bugs |
| State Machine Patterns (Undocumented) | 3+ | High | Silent failures, unexpected behavior |
| Deferred State Updates | 5+ | High | Race conditions, timing bugs |
| Browser Quirks/Magic Timings | 8+ | Medium | Platform-specific failures |
| Initialization Order Dependencies | 5+ | High | Constructor order fragility |
| Memory Leaks/Resource Issues | 4+ | Medium | Performance degradation |
| Implicit Global State | 3+ | High | Multi-instance conflicts |
| Race Conditions | 6+ | High | Intermittent bugs, hard to reproduce |

---

## 10. Recommendations

### High Priority (Refactor)
1. **Consolidate Element Mutation Methods**: Unify the three mutation patterns into one consistent API
2. **Document State Machines**: Create explicit state machine specifications for BindMode, ActiveEmbeddable, Tool Selection
3. **Fix Constructor Order**: Document or refactor; remove duplicate API creation
4. **Remove Magic Constants**: Replace 100ms, 300ms with named constants with clear rationales

### Medium Priority (Document)
5. **Add Lifecycle Documentation**: When is `sessionExportThemeOverride` set/cleared?
6. **Comment Race Conditions**: Explain library sync and font loading races
7. **Clarify Observer Pattern**: Document AppStateObserver listener lifecycle
8. **Snap Cache Documentation**: Explain synchronous population requirement

### Low Priority (Monitor)
9. **Test Memory Leaks**: Fix test suite (missing pointer up events)
10. **Worker Pool Size**: Add explicit limit enforcement
11. **Browser Quirk Tests**: Add tests for canvas, clipboard, timing behavior

---

## 11. Most Critical Files

| File | Issues | Complexity |
|------|--------|-----------|
| `/packages/excalidraw/components/App.tsx` | 15+ | Very High |
| `/packages/excalidraw/components/AppStateObserver.ts` | 3+ | High |
| `/packages/element/src/Scene.ts` | 4+ | High |
| `/packages/excalidraw/data/library.ts` | 3+ | High |
| `/packages/excalidraw/handlers/` | 6+ | Medium |

---

## Conclusion

The Excalidraw codebase is mature but contains significant undocumented behavior:
- Critical state machines are implicit rather than explicit
- Multiple magic timing constants depend on browser behavior
- Race conditions are acknowledged but not systematized
- Initialization order is fragile and poorly documented

New contributors and maintainers should be aware of these patterns when making changes, as seemingly small modifications can have subtle cascading effects due to implicit dependencies.
