# Appendix B — Engineering Quality Gates

Repository-level quality gates that influence releasability:

- **Typecheck**: strict TypeScript (`tsconfig.json`, root scripts).
- **Unit tests**: Vitest-driven test suites (including canvas mocking setup).
- **Lint**: ESLint with CI warning policy.
- **Formatting**: Prettier across configured workspace globs.
- **Monorepo consistency**: shared package aliases and workspace dependency boundaries.
