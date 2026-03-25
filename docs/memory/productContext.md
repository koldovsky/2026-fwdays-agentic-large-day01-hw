# Product Context

## Target Audience

| Segment | Use Case |
|---------|---------|
| **Software engineers** | Architecture diagrams, system design sketches |
| **Product managers** | Wireframes, flow diagrams, user journey maps |
| **Educators / students** | Quick visual explanations, note-taking |
| **Teams in meetings** | Real-time brainstorming and whiteboarding |
| **Developers (embedding)** | Integrate Excalidraw canvas into their own apps (Notion, Obsidian, etc.) |

## Problems Being Solved

### 1. Friction of Traditional Diagramming Tools
Polished tools (Figma, Lucidchart) require onboarding, accounts, and produce overly formal outputs. Excalidraw's hand-drawn style reduces perfectionism anxiety and speeds up ideation.

### 2. Privacy in Collaboration
Most collaboration tools store drawings on servers in plaintext. Excalidraw uses end-to-end encryption — the server never sees the content of shared drawings.

### 3. Embeddability Gap
There was no high-quality, open-source React whiteboard component developers could drop into their apps. `@excalidraw/excalidraw` fills this gap.

### 4. Text-to-Diagram Slowness
Manually converting textual descriptions into diagrams is tedious. The AI backend (`oss-ai.excalidraw.com`) converts natural language or structured text into Excalidraw elements.

## Key User Journeys

### Anonymous Quick-Start
```
Open excalidraw.com → Draw immediately → Share via encrypted link
```

### Collaborative Session
```
Open room → Share URL → Others join → Real-time sync via Socket.io
```

### Embedded Integration
```
npm install @excalidraw/excalidraw → <Excalidraw /> in React tree → Custom toolbar/sidebar
```

### AI-Assisted Diagram
```
Open TTD Dialog → Describe diagram in text → AI generates Excalidraw JSON → Insert into canvas
```

## Differentiators
- Hand-drawn visual style via Rough.js
- No login required for basic use
- E2E encrypted sharing
- Fully open-source and self-hostable
- First-class React library with rich API
