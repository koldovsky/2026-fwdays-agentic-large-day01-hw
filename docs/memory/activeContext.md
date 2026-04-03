# Active Context

## Current Focus

Documentation archaeology sprint for the fwdays 2026 Agentic Large workshop homework. The goal is to create a complete Memory Bank + Technical/Product Docs layer that enables AI agents to answer accurate questions about the Excalidraw codebase from a fresh session.

## What Was Done at the Workshop

| Artifact | Status |
|----------|--------|
| Code Archaeology (Excalidraw exploration) | ✅ Complete |
| `.cursorignore` configuration | ✅ Complete |
| Repomix token measurement | ✅ Complete |
| Memory Bank (3 files) | ✅ Created at workshop |
| `docs/technical/architecture.md` | ✅ Created at workshop |
| `docs/product/domain-glossary.md` | ✅ Created at workshop |

## Homework Tasks Status

| # | Task | Status |
|---|------|--------|
| 1 | Complete Memory Bank (4 remaining files) | ✅ Done |
| 2 | Create `dev-setup.md` | ✅ Done |
| 3 | Create `docs/product/PRD.md` | ✅ Done |
| 4 | Find 3+ undocumented behaviors → `decisionLog.md` | ✅ Done |
| 5 | Add cross-references between doc levels | ✅ Done |
| 6 | Verify AI uses documentation (new session test) | ⏳ Pending |

## Open Questions

- What version of the Excalidraw codebase is this snapshot? (check git tags or package.json)
- Is the Firebase config for the homework repo pointing to a real project or a placeholder?
- Does the self-hosted Socket.io server need to be run separately for collab to work?

## Next Actions

1. Open a new Cursor session and ask: "What is the collaboration encryption mechanism in Excalidraw?" — verify the answer matches `systemPatterns.md`
2. Create a PR on the fork with branch `day1/<github-username>`
3. Wait for CodeRabbit review and address any comments

## Related Docs

- Progress tracker: [`progress.md`](progress.md)
- Decision log: [`decisionLog.md`](decisionLog.md)
