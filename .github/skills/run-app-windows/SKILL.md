---
name: Run app on Windows
description: Start the Excalidraw app from this monorepo on Windows 10 using PowerShell.
---

# Run app on Windows

Use this skill when you need to launch the main app locally from this repository on Windows.

## Preconditions

- Run commands from the repository root: `C:\Users\MTsybulskyi\IdeaProjects\2026-fwdays-agentic-large-day01-hw`
- Use Windows PowerShell 5.1+
- Use Node.js `>=18`; CI uses Node `20.x`
- Prefer Yarn `1.22.22` from the root `package.json`

## Why these commands

- Root `package.json` defines `start` as `yarn --cwd ./excalidraw-app start`
- `excalidraw-app/package.json` defines `start` as `yarn && vite`
- `excalidraw-app/vite.config.mts` reads env from the repository root and uses `VITE_APP_PORT`
- `excalidraw-app/vite.config.mts` sets `server.open: true`
- `.env.development` sets `VITE_APP_PORT=3001`

## Install dependencies

Optional but recommended before the first run:

```powershell
Set-Location "C:\Users\MTsybulskyi\IdeaProjects\2026-fwdays-agentic-large-day01-hw"
corepack yarn@1.22.22 install
```

If `yarn` is already installed globally, this also works:

```powershell
Set-Location "C:\Users\MTsybulskyi\IdeaProjects\2026-fwdays-agentic-large-day01-hw"
yarn install
```

Notes:

- You do not need `corepack enable`; use `corepack yarn@1.22.22 ...` directly if Windows blocks global activation in `C:\Program Files\nodejs`
- The app `start` script runs `yarn` inside `excalidraw-app` before `vite`, so a separate install step is mostly to fail earlier and more clearly

## Start the app

Preferred:

```powershell
Set-Location "C:\Users\MTsybulskyi\IdeaProjects\2026-fwdays-agentic-large-day01-hw"
corepack yarn@1.22.22 start
```

If `yarn` is already installed globally:

```powershell
Set-Location "C:\Users\MTsybulskyi\IdeaProjects\2026-fwdays-agentic-large-day01-hw"
yarn start
```

Notes:

- Run the command from the repo root, not from `excalidraw-app`
- The `&&` inside the package script is handled by Yarn/npm; do not paste `yarn && vite` manually into Windows PowerShell 5.1
- Vite is configured to auto-open the browser, but on Windows this can still fail depending on the shell/session/browser association or when the process is started non-interactively

## Expected URL

- Default dev URL: `http://localhost:3001`
- Vite may automatically switch to another free port if `3001` is already occupied
- The authoritative URL is the `Local:` address printed by Vite

If the browser does not open automatically, open the `Local:` URL printed by Vite manually. If Vite stayed on the default port, this is:

```powershell
Start-Process "http://localhost:3001"
```

To verify the current port:

```powershell
Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing
cmd /c "netstat -ano | findstr :3001"
```

If `3001` is busy and Vite switched ports, check the terminal output for the actual `Local:` URL instead of probing a fixed port.

## Optional feature caveats

The main editor should start without extra services, but some features depend on local endpoints from `.env.development`:

- collaboration server (Socket.IO endpoint): `http://localhost:3002`
- AI backend: `http://localhost:3016`
- plus app URL: `http://localhost:3000`

## Stop the app

If the app is running in the current PowerShell window, press `Ctrl+C`.

If it was started as a background Node process, stop it by PID:

```powershell
Get-Process node
Stop-Process -Id <PID> -Force
```

If it was started via the root `start` script, Windows may show several related processes for the `corepack -> yarn -> vite` chain.

After stopping the process or processes, verify the dev ports are no longer listening:

```powershell
cmd /c "netstat -ano | findstr :3001"
```

