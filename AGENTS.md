# AGENTS.md

## Purpose

This file is the entry point to the project memory bank.

Use it to bootstrap context before making changes, reviewing code, or updating documentation. The source of truth for project context lives under `docs/`.

## Recommended Read Order

1. `docs/memory/projectbrief.md`
2. `docs/memory/productContext.md`
3. `docs/memory/systemPatterns.md`
4. `docs/memory/techContext.md`
5. `docs/memory/activeContext.md`
6. `docs/memory/progress.md`
7. `docs/memory/decisionLog.md`
8. Relevant product and technical docs for the task at hand

## Memory Bank Index

### Core Memory

- [docs/memory/projectbrief.md](docs/memory/projectbrief.md) - High-level summary of the product, stakeholders, business value, and system boundaries.
- [docs/memory/productContext.md](docs/memory/productContext.md) - UX goals, primary scenarios, expected outcomes, and product risks.
- [docs/memory/systemPatterns.md](docs/memory/systemPatterns.md) - Core architectural and data-flow patterns used across the system.
- [docs/memory/techContext.md](docs/memory/techContext.md) - Stack, repo layout, services, commands, environment model, and deployment notes.
- [docs/memory/activeContext.md](docs/memory/activeContext.md) - Current priorities, blockers, open questions, assumptions, and immediate risks.
- [docs/memory/progress.md](docs/memory/progress.md) - Completed work, current work, next work, and overall progress assessment.
- [docs/memory/decisionLog.md](docs/memory/decisionLog.md) - ADR-style decisions plus undocumented behavior findings captured from the codebase.

### Product Docs

- [docs/product/PRD.md](docs/product/PRD.md) - Product requirements, target users, jobs to be done, features, and main user flows.
- [docs/product/domain-glossary.md](docs/product/domain-glossary.md) - Shared terminology, naming conventions, abbreviations, and ambiguity to avoid.

### Technical Docs

- [docs/technical/architecture.md](docs/technical/architecture.md) - System breakdown, runtime topology, infrastructure, storage design, and critical sequences.
- [docs/technical/dev-setup.md](docs/technical/dev-setup.md) - Local setup, build and test workflow, Docker flow, and common troubleshooting paths.

## How To Use This File

- For broad product understanding, start with the Core Memory section.
- For feature work, read the relevant Product Docs after the core memory files.
- For implementation work, debugging, or refactoring, read the relevant Technical Docs after the core memory files.
- For changes that might affect current priorities or assumptions, check `docs/memory/activeContext.md` and `docs/memory/progress.md` before editing.
- For changes that alter an architectural choice or reveal undocumented behavior, update `docs/memory/decisionLog.md`.

### Basic Commands & Conventions

- Common local commands:
	- `yarn start` - run the hosted SPA with `.env.development` defaults.
	- `yarn test:app --watch=false` - run the app test suite once before review.
	- `yarn build` - build the hosted application output.
	- `yarn build:packages` - rebuild publishable packages when shared APIs or package behavior changes.
- PR and CI conventions:
	- PR titles are validated by GitHub Actions; use a semantic title such as `docs: split undocumented behavior notes`, or the workshop format `Day 1: <participant-name> — Workshop Assignment` when working from the provided template.
	- PR bodies should follow [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md): participant name, checklist, optional bonus items, and reviewer notes.
	- Pull requests run lint, typecheck, coverage, and semantic-title checks; push-based app tests also run on `master`. See [docs/technical/dev-setup.md](docs/technical/dev-setup.md), [.github/workflows/lint.yml](.github/workflows/lint.yml), [.github/workflows/test-coverage-pr.yml](.github/workflows/test-coverage-pr.yml), [.github/workflows/semantic-pr-title.yml](.github/workflows/semantic-pr-title.yml), and [.github/workflows/test.yml](.github/workflows/test.yml).
- Working conventions:
	- Keep PRs narrow in scope and include repro/context notes when reviewers need local services such as collaboration or AI backends.
	- No separate commit-message policy is enforced in checked-in automation; use short semantic subjects consistent with the PR title style, for example `docs: update active context assumptions`.
	- Treat pull requests as the documented integration path for shared work, and verify branch-specific assumptions against the active branch and CI state instead of assuming release readiness.
	- If a change affects current priorities or assumptions, update `docs/memory/activeContext.md`; if it changes architecture or exposes hidden runtime behavior, update `docs/memory/decisionLog.md`.

## Maintenance Rule

When a new markdown file is added under `docs/`, add it to this index so AGENTS.md remains the single entry point to the memory bank.