#!/usr/bin/env node
/**
 * Перевіряє об’єктивні твердження з docs/memory/projectbrief.md та progress.md
 * (версії, workspaces, наявність файлів, ключові скрипти). Не замінює yarn test:all.
 *
 * Запуск з кореня: node scripts/verify-memory-facts.js
 * або: yarn verify:memory-facts
 */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
let failures = 0;

function fail(msg) {
  console.error("FAIL:", msg);
  failures += 1;
}

function ok(msg) {
  console.log("OK:", msg);
}

function readJson(rel) {
  const p = path.join(root, rel);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function readText(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

try {
  const pkg = readJson("package.json");
  if (pkg.name !== "excalidraw-monorepo") {
    fail(`root package.json name: expected excalidraw-monorepo, got ${pkg.name}`);
  } else {
    ok("root package.json name === excalidraw-monorepo");
  }

  const ws = pkg.workspaces || [];
  const need = ["excalidraw-app", "packages/*", "examples/*"];
  for (const w of need) {
    if (!ws.includes(w)) {
      fail(`workspaces missing entry: ${w}`);
    } else {
      ok(`workspaces includes ${w}`);
    }
  }

  const scripts = pkg.scripts || {};
  for (const s of ["build", "build:packages", "test", "test:all", "test:typecheck", "test:code", "test:other"]) {
    if (typeof scripts[s] !== "string" || !scripts[s].length) {
      fail(`root scripts.${s} missing or empty`);
    } else {
      ok(`root scripts.${s} present`);
    }
  }

  const core = ["common", "element", "excalidraw", "math"];
  for (const name of core) {
    const j = readJson(`packages/${name}/package.json`);
    if (j.version !== "0.18.0") {
      fail(`packages/${name} version: expected 0.18.0, got ${j.version}`);
    } else {
      ok(`packages/${name} version 0.18.0`);
    }
  }

  const utilsPkg = readJson("packages/utils/package.json");
  if (utilsPkg.version !== "0.1.2") {
    fail(`packages/utils version: expected 0.1.2, got ${utilsPkg.version}`);
  } else {
    ok("packages/utils version 0.1.2");
  }

  const excalidrawPkg = readJson("packages/excalidraw/package.json");
  if (!String(excalidrawPkg.description || "").includes("React component")) {
    fail("packages/excalidraw description should mention React component");
  } else {
    ok("packages/excalidraw description (React component)");
  }

  const peer = excalidrawPkg.peerDependencies || {};
  if (!peer.react || !peer["react-dom"]) {
    fail("packages/excalidraw peerDependencies should include react and react-dom");
  } else {
    ok("packages/excalidraw peerDependencies react / react-dom");
  }

  const lic = readText("LICENSE");
  if (!lic.includes("MIT License")) {
    fail("LICENSE should contain MIT License");
  } else {
    ok("LICENSE MIT");
  }

  if (!exists("examples/with-nextjs/README.md")) {
    fail("examples/with-nextjs/README.md should exist");
  } else {
    ok("examples/with-nextjs/README.md exists");
  }

  const appTsx = readText("excalidraw-app/App.tsx");
  if (!appTsx.includes('from "@excalidraw/excalidraw"') || !appTsx.includes("Excalidraw")) {
    fail("excalidraw-app/App.tsx should import Excalidraw from @excalidraw/excalidraw");
  } else {
    ok("excalidraw-app/App.tsx imports Excalidraw");
  }

  if (!exists("excalidraw-app/collab/Collab.tsx")) {
    fail("excalidraw-app/collab/Collab.tsx should exist (project brief: collaboration)");
  } else {
    ok("excalidraw-app/collab/Collab.tsx exists");
  }
} catch (e) {
  fail(e.message || String(e));
}

if (failures) {
  console.error(`\nverify-memory-facts: ${failures} check(s) failed.`);
  process.exit(1);
}
console.log("\nverify-memory-facts: all checks passed.");
