# Product Context

## UX Goals
- Make first interaction productive without a setup wizard or account requirement.
- Preserve the distinct Excalidraw visual feel while supporting serious workflows such as architecture diagrams, wireframes, and collaboration.
- Keep sharing simple:
  - one flow for static encrypted link export
  - one flow for live collaboration
- Fail softly when network features are unavailable by preserving local editing.

## Primary Scenarios

### Solo Sketching
- User wants instant canvas access.
- Success looks like restoring recent work and allowing uninterrupted editing.

### Team Collaboration
- User wants a shareable room link and visible collaborator state.
- Success looks like low-latency scene updates plus clear session start/stop actions.

### Cross-Device Sharing
- User wants to send a URL and recover the same scene elsewhere.
- Success looks like link generation that includes scene state and related files.

### Embedded Usage
- Developer wants to render `<Excalidraw />` inside a React app with minimal ceremony.
- Success looks like a documented package entry point, CSS import, and example apps.

### AI-Assisted Creation
- User wants to convert text into diagrams or frames into code.
- Success looks like optional, clearly scoped tools that do not interfere with base editing.

## User Pain Points The Product Explicitly Addresses
- Traditional diagram tools are too slow for brainstorming.
- Collaboration tools often require account setup before value is visible.
- Losing work on refresh or offline periods is unacceptable.
- Sharing drawings often leaks more server-side context than users expect.
- Embedding a whiteboard editor into another product is usually harder than it should be.

## Expected Outcomes
- Users can begin drawing in seconds.
- Work survives refreshes and temporary connectivity loss.
- Teams can collaborate live without provisioning a heavy project workspace.
- Shared scenes are easy to recover from URLs.
- Package consumers can get a working embed from the repo examples.

## UX Decisions Visible In Code
- Share dialog separates collaboration and static link export instead of collapsing them into one ambiguous action.
- The app asks for overwrite confirmation before replacing non-empty local scenes from external links.
- Theme follows stored preference and system preference.
- PWA install prompt is captured early to avoid missing browser timing windows.
- Error handling is explicit for clipboard failures, invalid external scenes, and share/export failures.

## Product Risks
- Storage quota failures can degrade persistence for heavy scenes.
- External AI or collab service issues can create partial-feature failures.
- URL-hash-based encryption key handling is powerful but easy to mishandle in surrounding integrations.

## Related Docs
- Full product requirements and user flows: [../product/PRD.md](../product/PRD.md)
- Shared product terminology for scenes, rooms, links, and AI features: [../product/domain-glossary.md](../product/domain-glossary.md)
- Technical realization of these UX goals and flows: [../technical/architecture.md](../technical/architecture.md)
- Important edge cases behind the UX failure modes above: [decisionLog.md](decisionLog.md)