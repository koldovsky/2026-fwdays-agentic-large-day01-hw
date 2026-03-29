# Прогрес по проєкту

## Стан Excalidraw (v0.18.0)

### Працює (стабільні фічі)
- Базові інструменти: `rectangle`, `ellipse`, `arrow`, `line`, `freedraw`, `text`, `image`, `frame`, `eraser`, `hand`, `laser`.
- Експорт у PNG/SVG/clipboard/JSON (`packages/utils/src/export.ts`).
- Реальтайм-колаборація через Socket.IO + Firebase (`excalidraw-app/collab/`).
- Share-link із шифруванням (`#json=id,key`).
- PWA з офлайн-доступом і автозбереженням у localStorage.
- Вбудовування як React-компонент (`<Excalidraw>`, `useExcalidrawAPI`).
- Lasso-виділення, cropping зображень, multi-lock, нативний flowchart, search по елементах.
- Mermaid → Excalidraw конвертація.

### В розробці / незавершене
- **AI (TTD + Diagram-to-Code)** — beta, залежить від зовнішнього `VITE_APP_AI_BACKEND`; серверна частина в репо відсутня.
- **Complex Bindings** — feature-flag `COMPLEX_BINDINGS` (off за замовчуванням), розширена модель привʼязки стрілок готова частково.
- **Binding + History** — undo/redo при rebinding має відомі баги (#7348), TODO в тестах.
- **Mobile UX** — transform handles для лінійних елементів вимкнені як workaround.
- **Frame align/distribute** — позначено TODO «when implemented properly».
- **`ExcalidrawProps.name` API** — коментар «come with better API before v0.18.0» (вже v0.18.0).


