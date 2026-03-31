# Developer Setup Guide: From Clone to First PR

Complete step-by-step guide for setting up Excalidraw development environment and making your first contribution.

---

## Prerequisites

### System Requirements

- **OS**: macOS, Linux, or Windows (with WSL2)
- **Node.js**: >= 18.0.0
- **Package Manager**: Yarn 1.22.22 (project uses workspaces)
- **Git**: Latest version
- **RAM**: Minimum 4GB (8GB recommended for smooth compilation)
- **Disk Space**: ~2GB for monorepo + dependencies

### Check Your Setup

```bash
node --version          # Should be v18+ (e.g., v20.11.0)
npm --version           # Will be included with Node
git --version           # Should be recent (e.g., 2.43.0)
```

If Node < 18, install a newer version:

```bash
# Using Homebrew (macOS)
brew install node@20

# Using nvm (all platforms)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

---

## Step 1: Clone the Repository

### Clone from GitHub

```bash
git clone https://github.com/excalidraw/excalidraw.git
cd excalidraw
```

### Or clone your fork (if contributing)

```bash
# First fork: https://github.com/excalidraw/excalidraw/fork
git clone https://github.com/YOUR_USERNAME/excalidraw.git
cd excalidraw

# Add upstream remote for syncing
git remote add upstream https://github.com/excalidraw/excalidraw.git
git remote -v  # Verify both origin and upstream
```

### Verify Clone

```bash
ls -la
# Should show:
# .git/
# .github/
# .husky/
# packages/
# excalidraw-app/
# examples/
# scripts/
# ... and other root files
```

---

## Step 2: Install Dependencies

### Install Yarn (if needed)

```bash
npm install -g yarn@1.22.22
yarn --version  # Should show 1.22.22
```

### Install Project Dependencies

```bash
# From project root
yarn install

# This will:
# - Install dependencies for all workspaces
# - Create node_modules in root and each package
# - Install pre-commit hooks via Husky
# - Take 3-5 minutes

# Verify installation
yarn workspaces info  # Should list all packages
```

### Troubleshooting Installation

**Issue**: Yarn install fails with permission errors
```bash
# Solution: Clear cache and retry
yarn cache clean
rm -rf node_modules
yarn install
```

**Issue**: Pre-commit hooks not installing
```bash
# Solution: Manually install Husky
yarn run prepare
```

**Issue**: Different Node versions between machines
```bash
# Solution: Use nvm or node version manager
cat .nvmrc  # Shows target version
nvm use  # Uses version from .nvmrc
```

---

## Step 3: Understand Project Structure

### Monorepo Layout

```text
excalidraw/
├── excalidraw-app/           # Main web application
│   ├── src/                  # Application source code
│   ├── public/               # Static assets
│   ├── package.json
│   └── vite.config.mts       # Vite configuration
│
├── packages/                 # Reusable libraries
│   ├── common/               # Shared constants and utilities
│   ├── element/              # Element types and operations
│   ├── excalidraw/           # Core React component library
│   ├── math/                 # Math utilities
│   └── utils/                # Export utilities
│
├── examples/                 # Integration examples
│   ├── with-nextjs/          # Next.js example
│   └── with-script-in-browser/  # Vanilla JS example
│
├── scripts/                  # Build scripts
├── .husky/                   # Pre-commit hooks
├── package.json              # Root workspace config
├── tsconfig.json             # TypeScript config
└── README.md
```

### Key Files to Know

- **package.json** (root): Workspace configuration, build scripts
- **tsconfig.json**: TypeScript configuration
- **.cursorignore**: Files ignored by Cursor AI (build outputs)
- **.gitignore**: Git ignore patterns
- **.husky/pre-commit**: Pre-commit hook (runs linting)

### Read Documentation

```bash
# In project root
cat docs/memory/README.md          # Memory Bank navigation
cat docs/technical/architecture.md # System architecture
cat docs/product/domain-glossary.md  # Domain terminology
```

---

## Step 4: Set Up Your IDE

### Visual Studio Code

#### Install Recommended Extensions

```bash
# From project root
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension charliermarsh.ruff
```

#### Configure Settings

Create `.vscode/settings.json` in project root:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "files.exclude": {
    "**/node_modules": true,
    "**/.git": true,
    "**/dist": true,
    "**/build": true
  }
}
```

#### Launch Configuration

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/excalidraw-app",
      "runtimeArgs": ["--user-data-dir=/tmp/chrome"]
    }
  ]
}
```

### Cursor (Recommended)

```bash
# Open project in Cursor
cursor .

# Cursor automatically:
# - Reads .cursorignore (AI won't analyze build outputs)
# - Uses TypeScript from node_modules
# - Reads project structure
```

---

## Step 5: Start Development Server

### First Time Setup

```bash
# Verify everything is working
yarn test:typecheck    # TypeScript check (2-3 seconds)
yarn test:code         # Linting (30 seconds)
yarn test              # Run unit tests (may take a minute)
```

### Start Dev Server

```bash
# From project root, starts excalidraw-app dev server
yarn start

# Opens in browser: http://localhost:5173
# Hot module replacement enabled (changes reflect instantly)
```

### What to Expect

```console
✔ Vite dev server started
✔ Browser opens to http://localhost:5173
✔ App fully functional
✔ Changes save and reload immediately
✔ Keep terminal open while developing
```

### Verify It Works

1. Open http://localhost:5173 in browser
2. Draw a rectangle on the canvas
3. Modify a file: `excalidraw-app/App.tsx`
4. Save - page should refresh (HMR)
5. Your drawing should still be there (state preserved)

### Stop Dev Server

```bash
# In terminal with running server
Ctrl+C  # or Cmd+C on macOS
```

---

## Step 6: Make Your First Edit

### Pick an Easy Task

Start with something simple:
- Fix a typo
- Add/update a comment
- Update documentation
- Change a color constant

**Example**: Update a UI string

```bash
# Search for a string to change
rg "Export as PNG" --type tsx
# Result: excalidraw-app/components/ExportButton.tsx:45

# Open and edit the file
code excalidraw-app/components/ExportButton.tsx
```

### Make Changes and Test

```bash
# Dev server should automatically reload
# Verify your change appears in browser

# Run linting to check for errors
yarn test:code

# If linting fails, fix issues
yarn fix:code  # Auto-fixes many issues
yarn fix:other  # Auto-fixes formatting

# Run tests related to your change
yarn test -- ExportButton
```

---

## Step 7: Run Tests Locally

### Test Suite

```bash
# Run all tests
yarn test

# Run specific test file
yarn test -- ExportButton

# Run tests in watch mode (re-runs on file changes)
yarn test --watch

# Run tests with coverage report
yarn test:coverage

# Run all checks (typecheck + lint + format + tests)
yarn test:all
```

### Understand Test Output

```console
PASS excalidraw-app/components/__tests__/ExportButton.test.tsx
  ExportButton
    ✓ renders export button (25 ms)
    ✓ exports PNG with correct settings (105 ms)
  
Tests: 2 passed, 2 total
Time: 1.234 s
```

### Fix Common Test Errors

**Error**: "Cannot find module @excalidraw/element"
```bash
# Solution: Rebuild packages
yarn build:packages

# Then retry test
yarn test
```

**Error**: "TypeScript compilation error"
```bash
# Solution: Check TypeScript
yarn test:typecheck

# Fix errors and retry
yarn test
```

---

## Step 8: Create a Feature Branch

### Branch Naming Convention

```bash
# Format: [type]/[description]
# Types: feature, fix, refactor, docs, style

git checkout -b feature/add-export-button
git checkout -b fix/canvas-performance
git checkout -b docs/update-readme
```

### Sync with Upstream (if forked)

```bash
# Fetch latest from main repository
git fetch upstream

# Rebase your branch on upstream main
git rebase upstream/main

# Or merge if conflicts exist
git merge upstream/main
```

### Make Commits

```bash
# Check what changed
git status

# Stage your changes
git add packages/excalidraw/components/ExportButton.tsx

# Or stage all changes
git add .

# Commit with clear message
git commit -m "Add PNG export button to toolbar"

# Pre-commit hooks automatically run:
# - ESLint (fixes auto-fixable issues)
# - Prettier (formats code)
# - If issues remain, commit fails and shows errors
# - Fix errors and retry: git commit -m "..."
```

### Commit Message Format

```text
# Good commit messages:
"Add PNG export button to toolbar"
"Fix arrow binding when element resized"
"Update documentation for new API"

# Bad commit messages:
"update stuff"
"fixes"
"WIP"
```

---

## Step 9: Push and Create Pull Request

### Push to GitHub

```bash
# If on fork
git push origin feature/add-export-button

# If on main repo (maintainers only)
git push upstream feature/add-export-button

# First push might need -u flag
git push -u origin feature/add-export-button
```

### Create Pull Request

```bash
# Option 1: Via GitHub web interface
# 1. Go to https://github.com/excalidraw/excalidraw
# 2. Click "Compare & pull request" button
# 3. Fill in title and description
# 4. Click "Create pull request"

# Option 2: Via GitHub CLI
gh pr create --title "Add PNG export button" --body "This PR adds..."
```

### PR Template

Fill in the PR description:

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (fixes issue #123)
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How to Test
Steps to test the change:
1. Open the app
2. Try the new export button
3. Verify PNG exports correctly

## Screenshots (if UI change)
[Add screenshot of before/after if applicable]

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective
- [ ] New and existing tests pass locally
```

---

## Step 10: Review Process & Iteration

### Watch for Feedback

- Project maintainers review your PR
- You'll get comments/suggestions on GitHub
- Email notifications when someone comments

### Respond to Feedback

```bash
# 1. Read the feedback on GitHub
# 2. Make requested changes locally
git add .
git commit -m "Address review feedback"

# 3. Push - PR automatically updates
git push

# 4. Reply to reviewer confirming changes
# (Optional but good etiquette)
```

### Common Feedback

**"Can you add a test for this?"**
```bash
# Add test file next to your code
# Example: components/ExportButton.test.tsx
# Run tests to verify: yarn test -- ExportButton
```

**"This doesn't follow the style"**
```bash
# Let Prettier and ESLint auto-fix
yarn fix

# Or manually fix issues shown in errors
yarn test:code
```

**"Can you rebase on main?"**
```bash
# Fetch latest main
git fetch upstream main

# Rebase your branch
git rebase upstream/main

# If conflicts, resolve and continue
# git rebase --continue
```

---

## Step 11: Merge & Celebrate

### PR Approval

When maintainers approve:
- Green checkmarks appear on PR
- "Merge" button becomes available

### Merge

```bash
# Maintainers merge via GitHub UI
# Or you might have merge permissions:
gh pr merge 123 --squash  # Squash commits into one
```

### After Merge

```bash
# Sync your local repo
git fetch upstream
git checkout main
git rebase upstream/main

# Delete old branch locally
git branch -d feature/add-export-button

# Delete on GitHub if needed
git push origin --delete feature/add-export-button
```

### Celebrate! 🎉

You've successfully contributed to Excalidraw!

---

## Helpful Commands Reference

### Development

```bash
# Start dev server
yarn start

# Build for production
yarn build

# Build specific package
yarn build:excalidraw

# Build all packages
yarn build:packages
```

### Testing & Quality

```bash
# Run all tests
yarn test

# Run specific test file
yarn test -- ExportButton

# Lint code
yarn test:code

# Format code
yarn fix

# Type check
yarn test:typecheck

# All checks
yarn test:all
```

### Git Workflow

```bash
# Create branch
git checkout -b feature/name

# Check status
git status

# See changes
git diff

# Stage changes
git add .

# Commit
git commit -m "message"

# Push
git push -u origin feature/name

# Update from upstream
git fetch upstream
git rebase upstream/main
```

### Debugging

```bash
# Check dependencies
yarn workspaces info

# Clear cache
yarn cache clean

# Reinstall
rm -rf node_modules && yarn install

# Check TypeScript errors
yarn test:typecheck

# Check linting
yarn test:code

# Check formatting
yarn prettier --list-different
```

---

## Common Issues & Solutions

### Dev Server Won't Start

```bash
# Problem: Port 5173 already in use
# Solution: Kill process or use different port
lsof -i :5173
kill -9 [PID]

# Or check Vite config for different port
```

### Changes Not Reflecting

```bash
# Problem: Hot module replacement not working
# Solution: Hard refresh browser
Cmd+Shift+R (macOS)
Ctrl+Shift+R (Windows/Linux)

# Or clear cache:
rm -rf .vite
yarn start
```

### Test Failures

```bash
# Problem: Tests fail after install
# Solution: Rebuild packages and clear cache
yarn build:packages
yarn cache clean
yarn test

# If still failing, check if node_modules is corrupted
rm -rf node_modules
yarn install
yarn test
```

### TypeScript Errors

```bash
# Problem: "Cannot find module" errors
# Solution: Rebuild and restart
yarn build:packages
yarn test:typecheck

# Then restart IDE to reload TypeScript
```

### Git Merge Conflicts

```bash
# Problem: Merge conflicts on rebase
# Solution: Resolve conflicts
# 1. Open conflicted files
# 2. Keep correct versions (marked with <<<< ==== >>>>)
# 3. Stage resolved files
git add [file]
git rebase --continue
```

---

## Next Steps After First PR

### Explore More

- Read `/docs/memory/decisionLog.md` for architectural decisions
- Review `/docs/technical/architecture.md` for system design
- Study `/docs/product/domain-glossary.md` for terminology
- Check `/docs/memory/activeContext.md` for current focus areas

### Take Bigger Tasks

- Look for issues labeled `good first issue`
- Find issues labeled `help wanted`
- Pick something from the roadmap
- Chat with maintainers about what to work on

### Learn the Codebase

- Read `packages/excalidraw/components/App.tsx` (main component)
- Explore `packages/element/` for element operations
- Check `packages/excalidraw/actions/` for UI actions
- Study `packages/excalidraw/data/` for persistence

### Become a Contributor

- Keep contributing regularly
- Help review others' PRs
- Participate in discussions
- Mentor new contributors

---

## Resources

### Documentation
- [Main README](README.md) - Project overview
- [Memory Bank](docs/memory/README.md) - Project context
- [Architecture Guide](docs/technical/architecture.md) - System design
- [Domain Glossary](docs/product/domain-glossary.md) - Terminology

### External Links
- [GitHub Repository](https://github.com/excalidraw/excalidraw)
- [Live App](https://excalidraw.com)
- [Official Docs](https://docs.excalidraw.com)
- [Discord Community](https://discord.gg/UexuqDbtqs)

### Technologies
- [React 19 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Vite Docs](https://vitejs.dev)
- [Jotai Docs](https://jotai.org)

---

## Support

### Getting Help

- **GitHub Issues**: Check for similar problems
- **Discussions**: Ask questions on GitHub Discussions
- **Discord**: Join community for real-time chat
- **PRs**: Maintainers will help in code review

### Report Issues

If you find problems in this guide:
1. Create issue on GitHub
2. Or submit PR with corrections
3. Include: what you were trying to do, what went wrong, system info

---

## Checklist for First PR

Use this checklist to ensure everything is ready:

- [ ] Cloned repository and installed dependencies
- [ ] Ran `yarn test:typecheck` successfully
- [ ] Ran `yarn test:code` successfully
- [ ] Started dev server with `yarn start`
- [ ] Created feature branch
- [ ] Made meaningful changes
- [ ] Ran `yarn test` and tests pass
- [ ] Ran `yarn fix` to auto-format
- [ ] Committed with clear message
- [ ] Pushed to GitHub
- [ ] Created PR with description
- [ ] Responded to review feedback
- [ ] PR was merged
- [ ] Celebrated contribution! 🎉

---

**Welcome to the Excalidraw community! Happy coding!**

---

## 🔗 Related Documentation

**Additional context for your development:**
- **Memory Bank**: See [`docs/memory/`](../memory/) for foundational knowledge:
  - [`techContext.md`](../memory/techContext.md) - Technology stack and setup commands
  - [`systemPatterns.md`](../memory/systemPatterns.md) - Architecture patterns you'll encounter
  - [`activeContext.md`](../memory/activeContext.md) - Current development focus and priorities
  - [`decisionLog.md`](../memory/decisionLog.md) - Why architectural choices were made
- **Architecture Guide**: See [`architecture.md`](architecture.md) for detailed system design
- **Domain Glossary**: See [`docs/product/domain-glossary.md`](../product/domain-glossary.md) for terminology
- **Product Requirements**: See [`docs/product/PRD.md`](../product/PRD.md) for what you're building

