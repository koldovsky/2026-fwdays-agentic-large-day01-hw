# Developer Setup Guide

Complete onboarding instructions for setting up Excalidraw development environment and creating your first PR.

---

## Prerequisites

Before starting, ensure you have:

### System Requirements
- **OS**: macOS, Linux, or Windows (WSL2 recommended)
- **RAM**: 8GB minimum (16GB recommended)
- **Disk Space**: 5GB minimum

### Required Software
- **Git**: [https://git-scm.com/downloads](https://git-scm.com/downloads)
- **Node.js**: 18.0.0+ ([https://nodejs.org/](https://nodejs.org/))
- **Yarn**: 1.22.22 (`npm install -g yarn@1.22.22`)

### Verify Installation
```bash
git --version        # git version 2.x.x
node --version       # v18.0.0 or higher
npm --version        # v8.0.0 or higher
yarn --version       # 1.22.22
```

---

## Step 1: Clone the Repository

### Option A: Clone and Enter Directory (Recommended for First-Time Setup)

```bash
# Clone the repository
git clone https://github.com/excalidraw/excalidraw.git
cd excalidraw

# Verify correct branch
git branch -a
# You should be on 'master' branch
```

### Option B: Fork First (Recommended if You Plan to Contribute)

1. Go to [https://github.com/excalidraw/excalidraw](https://github.com/excalidraw/excalidraw)
2. Click "Fork" button in top-right corner
3. Clone YOUR fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/excalidraw.git
   cd excalidraw
   ```
4. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/excalidraw/excalidraw.git
   git fetch upstream
   ```

### Verify Clone
```bash
git log --oneline -3
# Should show recent commits from the repository
```

---

## Step 2: Install Dependencies

### Install Node Modules
```bash
# From repository root, install all workspace dependencies
yarn install

# This installs:
# - Root dependencies (babel, typescript, vite, etc.)
# - Package dependencies (@excalidraw/*, examples/*)
# - Should complete without errors
```

**Expected Output:**
```
yarn install v1.22.22
[1/4] Resolving packages...
[2/4] Fetching packages...
[3/4] Linking dependencies...
[4/4] Building fresh packages...
✨ Done in X.XXs.
```

**Troubleshooting:**
- If you get permission errors, try `sudo chown -R $(whoami) node_modules`
- If packages fail: `yarn install --no-cache`
- On Windows, use `yarn install` from PowerShell (not WSL if you cloned in Windows filesystem)

---

## Step 3: Understand the Project Structure

```
excalidraw/
├── excalidraw-app/          # Web application (main interface)
│   ├── src/
│   │   ├── index.tsx        # Entry point
│   │   └── App.tsx          # Main app orchestration
│   └── vite.config.ts
│
├── packages/
│   ├── excalidraw/          # Core library (main package)
│   │   ├── components/      # React components
│   │   ├── actions/         # Editor actions (40+ files)
│   │   ├── renderer/        # Canvas rendering
│   │   └── types.ts         # Public API types
│   │
│   ├── element/             # Element types & utilities
│   ├── math/                # Math utilities
│   ├── common/              # Shared constants
│   └── utils/               # Export functions
│
├── examples/                # Integration examples
├── docs/                    # Documentation
└── scripts/                 # Build & release scripts

# Key files to explore:
- packages/excalidraw/components/App.tsx (core editor)
- packages/element/src/types.ts (element definitions)
- excalidraw-app/src/App.tsx (web app wrapper)
```

**Note**: Most changes happen in `packages/excalidraw/` (the library), not `excalidraw-app/` (the web app).

---

## Step 4: Run Development Server

### Start Development Server
```bash
# From repository root
yarn start

# This:
# 1. Starts Vite dev server at http://localhost:3000
# 2. Enables HMR (Hot Module Reload)
# 3. Watches files for changes
```

**Expected Output:**
```
excalidraw-app/vite.config.ts

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help

```

### Access the Application
- Open browser to [http://localhost:3000](http://localhost:3000)
- You should see the Excalidraw canvas
- Draw a shape to verify it's working
- Changes to files will auto-reload (HMR)

**Troubleshooting:**
- **Port 3000 in use**: Kill process with `lsof -i :3000` then `kill -9 <PID>` or use `PORT=3001 yarn start`
- **Module not found**: Run `yarn install` again
- **Black canvas**: Clear browser cache (Ctrl+Shift+Delete)
- **HMR not working**: Restart dev server (Ctrl+C then `yarn start`)

---

## Step 5: Make Your First Code Change

### Simple Test Change (Verify Setup Works)

**Change 1: Modify Welcome Text**

1. Open `excalidraw-app/src/App.tsx`
2. Look for welcome or initial text
3. Modify a string (example: change "Welcome" to "Hello Developer")
4. Save file (Ctrl+S)
5. Browser should auto-reload with your change

**Change 2: Modify Button Text (More Visible)**

1. Open `packages/excalidraw/components/TopRightMenu/TopRightMenu.tsx`
2. Find a button or text element
3. Change the text
4. File should auto-reload
5. Verify change appears in app

### Understanding the Change Flow

```
Your Edit
    ↓
File Save (Ctrl+S)
    ↓
HMR Detection (Vite watches files)
    ↓
Component Re-render (HMR update)
    ↓
Browser Display Updates
    ↓
≈500ms (hot reload time)
```

---

## Step 6: Run Tests

### Unit Tests
```bash
# Run all tests in watch mode
yarn test

# Run tests once (CI mode)
yarn test:app --watch=false

# Run specific test file
yarn test --watch -- selection.test.tsx

# Run with UI (interactive)
yarn test:ui
```

**Expected Behavior:**
- Test runner opens browser at [http://localhost:51204/](http://localhost:51204/)
- Shows test results with coverage
- Watch mode re-runs tests on file change

### Type Checking
```bash
# Check TypeScript compilation
yarn test:typecheck

# Should complete without errors (no output = success)
```

### Linting
```bash
# Check code style with ESLint
yarn test:code

# Check formatting with Prettier
yarn test:other

# Automatically fix issues
yarn fix
```

### Run All Checks (Full Suite)
```bash
# This is what CI/CD pipeline runs
yarn test:all

# Runs:
# 1. yarn test:typecheck (TypeScript)
# 2. yarn test:code (ESLint)
# 3. yarn test:other (Prettier)
# 4. yarn test:app --watch=false (Unit tests)
```

**Troubleshooting:**
- **Tests timeout**: Increase timeout with `--testTimeout=10000`
- **Tests fail on Windows**: Use Git Bash instead of PowerShell
- **jsdom errors**: Clear cache with `yarn clean-install`

---

## Step 7: Build for Production

### Build Web Application
```bash
# Build optimized production bundle
yarn build

# Creates:
# - excalidraw-app/build/ (optimized bundle)
# - excalidraw-app/dist/ (dev-dist)
```

**Expected Output:**
```
✓ 1234 modules transformed
vite v5.0.12 building for production...
✓ X files built in X.XXs
```

**Verify Build:**
```bash
# Serve production build locally
cd excalidraw-app/build
npx http-server
# Open http://localhost:8080
```

### Build Packages
```bash
# Build all library packages (for npm)
yarn build:packages

# Creates dist/ folders in each package:
# - packages/excalidraw/dist/
# - packages/element/dist/
# - etc.
```

---

## Step 8: Create Your First PR

### Setup Your Feature Branch

```bash
# Ensure you're on master with latest code
git checkout master
git pull upstream master  # or 'origin master' if not forked

# Create new feature branch
git checkout -b fix/my-first-fix

# Or for features:
git checkout -b feat/my-feature-name
```

**Branch Naming Convention:**
- `fix/description` - Bug fixes
- `feat/description` - New features
- `refactor/description` - Code refactoring
- `docs/description` - Documentation
- `test/description` - Tests

### Make Your Changes

1. **Make small, focused changes** (one feature/fix per PR)
2. **Run tests** after each change:
   ```bash
   yarn test:all
   ```
3. **Fix any failures**:
   ```bash
   yarn fix  # Auto-fix style issues
   ```

### Commit Your Work

```bash
# Check what changed
git status
git diff

# Stage specific files
git add packages/excalidraw/components/MyComponent.tsx
git add tests/myComponent.test.tsx

# Or stage all (if sure)
git add .

# Commit with clear message
git commit -m "feat: Add new feature description

Explain what changed and why. Link to issue if applicable.
Fixes #1234"
```

**Commit Message Guidelines:**
- Use imperative mood: "Add feature" not "Added feature"
- First line max 72 characters
- Explain "why" not just "what"
- Reference issues: "Fixes #123"

### Push to Your Fork

```bash
# Push branch to your fork
git push origin fix/my-first-fix

# Expected output:
# remote: Create a pull request for 'fix/my-first-fix' on GitHub by visiting:
# remote:      https://github.com/YOUR_USERNAME/excalidraw/pull/new/fix/my-first-fix
```

### Create Pull Request on GitHub

1. Go to [https://github.com/excalidraw/excalidraw](https://github.com/excalidraw/excalidraw)
2. Click "Pull requests" tab
3. Click "New pull request"
4. Click "compare across forks"
5. Select:
   - **Base**: `excalidraw/excalidraw` → `master`
   - **Compare**: `YOUR_USERNAME/excalidraw` → `fix/my-first-fix`
6. Review your changes
7. Click "Create pull request"

### Fill PR Template

```markdown
## Description
Brief explanation of what changed and why.

## Type of Change
- [x] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)

## How Has This Been Tested?
Describe the tests you ran:
- [ ] Unit tests pass
- [ ] Manual testing in browser
- [ ] No regression in existing features

## Checklist:
- [ ] My code follows the code style
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code where necessary
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective
- [ ] New and existing tests passed locally with my changes
```

### PR Review Process

**Automated Checks** (CI/CD):
- TypeScript compilation
- ESLint checks
- Prettier formatting
- Unit tests

**Manual Review**:
- Maintainers review code
- May request changes
- Discuss implementation

**Address Feedback**:
```bash
# Make requested changes
# Commit and push (no need for new PR)
git add .
git commit -m "fix: Address review feedback"
git push origin fix/my-first-fix

# PR automatically updates
```

**Merge**:
- When approved and all checks pass
- Maintainer clicks "Merge pull request"
- Your code is now part of Excalidraw!

---

## Step 9: Running Examples

### Web Component Example
```bash
# Run Next.js example
yarn start:example

# Or specifically:
yarn --cwd examples/with-nextjs start
```

### Browser Script Example
```bash
# Run vanilla JavaScript example
yarn --cwd examples/with-script-in-browser start

# Open http://localhost:8080
```

---

## Useful Commands Reference

| Command | Purpose |
|---------|---------|
| `yarn start` | Start dev server |
| `yarn test` | Run tests in watch mode |
| `yarn test:all` | Full test suite (typecheck, lint, format, tests) |
| `yarn test:ui` | Interactive test UI |
| `yarn fix` | Auto-fix code style |
| `yarn build` | Build production web app |
| `yarn build:packages` | Build npm packages |
| `yarn clean-install` | Clean reinstall dependencies |

---

## Debugging Tips

### Debug in VS Code

**Create `.vscode/launch.json`:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "attach",
      "name": "Attach Chrome",
      "port": 9222,
      "pathMapping": {
        "/": "${workspaceFolder}/",
        "/src/": "${workspaceFolder}/src/"
      }
    }
  ]
}
```

**Start Chrome in Debug Mode:**
```bash
# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222

# Linux
google-chrome --remote-debugging-port=9222

# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
```

**Set Breakpoints:**
1. F5 to start debugging
2. Click line numbers in VS Code editor to set breakpoints
3. Interact with app, execution pauses at breakpoints
4. Inspect variables in Debug panel

### Browser Console Debugging

```javascript
// In browser console, access Excalidraw API
window.ExcalidrawAPI.getAppState()  // View current state
window.ExcalidrawAPI.getElements()  // View all elements
```

### Add Debug Logging

```typescript
// In your code
console.log("Debug info:", value);

// In production, debug will be stripped
// Use named functions for stack traces
```

---

## Common Issues & Solutions

### Issue: Port 3000 Already in Use

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 yarn start
```

### Issue: Node Modules Corruption

**Solution:**
```bash
# Complete clean reinstall
rm -rf node_modules yarn.lock
yarn install

# Or use built-in script
yarn clean-install
```

### Issue: Git Merge Conflicts

**Solution:**
```bash
# Update master with latest
git fetch upstream
git rebase upstream/master

# Resolve conflicts in editor, then:
git add .
git rebase --continue
git push origin fix/my-fix --force-with-lease
```

### Issue: TypeScript Errors

**Solution:**
```bash
# Check types
yarn test:typecheck

# Auto-fix some errors
yarn fix:code

# Manual check
# Open files and hover over errors in VS Code
# Use "Quick Fix" (Ctrl+.)
```

### Issue: Tests Failing

**Solution:**
```bash
# Run single test file
yarn test selection.test.tsx

# Run with verbose output
yarn test --verbose

# Update snapshots
yarn test:update
```

### Issue: HMR Not Working (Changes Not Reflecting)

**Solution:**
```bash
# Stop dev server (Ctrl+C)
# Clear browser cache (Ctrl+Shift+Delete)
# Restart dev server
yarn start

# Hard refresh browser (Ctrl+Shift+R)
```

### Issue: Out of Memory

**Solution:**
```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 yarn test

# Or permanently in .env
export NODE_OPTIONS=--max-old-space-size=4096
```

---

## Next Steps After Setup

### 1. Explore the Codebase
- Read `docs/memory/projectbrief.md` - Understand project goals
- Read `docs/technical/architecture.md` - Learn system design
- Read `docs/product/domain-glossary.md` - Understand terminology
- Skim `packages/excalidraw/types.ts` - Core type definitions

### 2. Find Good First Issues
- Visit [GitHub Issues](https://github.com/excalidraw/excalidraw/issues)
- Filter by label "good first issue"
- Comment "I'd like to work on this"
- Start implementing!

### 3. Join the Community
- Join [Discord community](https://discord.gg/TCEjjKezUK)
- Ask questions in discussions
- Follow [@excalidraw](https://twitter.com/excalidraw) on Twitter

### 4. Setup IDE

**VS Code Extensions Recommended:**
- ESLint
- Prettier
- TypeScript Vue Plugin
- Thunder Client (for API testing)

**VS Code Settings:**
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true
  }
}
```

---

## Development Workflow Summary

```
1. Clone repo
   ↓
2. yarn install
   ↓
3. yarn start
   ↓
4. Make changes (auto-reload)
   ↓
5. Run yarn test:all (verify no regressions)
   ↓
6. git commit & git push
   ↓
7. Create PR on GitHub
   ↓
8. Respond to feedback
   ↓
9. Maintainer merges
   ↓
10. Celebrate! 🎉
```

---

## Getting Help

### Documentation
- [Architecture Guide](./architecture.md) - System design
- [Domain Glossary](../product/domain-glossary.md) - Terminology
- [Decision Log](./decisionLog.md) - Undocumented behavior
- [Memory Bank](../memory/) - Project overview

### External Resources
- [Excalidraw GitHub](https://github.com/excalidraw/excalidraw)
- [Discord Community](https://discord.gg/TCEjjKezUK)
- [Contributing Guide](https://github.com/excalidraw/excalidraw/blob/master/CONTRIBUTING.md)
- [Issues Tracker](https://github.com/excalidraw/excalidraw/issues)

### Quick Questions
- Post in GitHub Discussions
- Ask in Discord #development channel
- Comment on related issues

---

## Checklist for First PR

- [ ] Cloned repository and installed dependencies
- [ ] Dev server runs without errors
- [ ] Made test change and verified HMR works
- [ ] Read architecture and glossary documents
- [ ] Ran `yarn test:all` with no failures
- [ ] Created feature branch with proper naming
- [ ] Made focused, well-commented changes
- [ ] Wrote/updated tests for changes
- [ ] Committed with clear messages
- [ ] Pushed to fork/branch
- [ ] Created PR with description and checklist
- [ ] Addressed reviewer feedback
- [ ] PR merged successfully

---

**Welcome to Excalidraw development! 🎨 Happy coding!**
