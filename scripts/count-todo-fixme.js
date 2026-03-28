#!/usr/bin/env node
/**
 * Count TODO/FIXME substring occurrences in *.ts / *.tsx under cwd.
 * Skips any directory named node_modules (any depth).
 * Run from repository root: node scripts/count-todo-fixme.js
 */
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const pattern = /TODO|FIXME/g;

function walkDir(dir, onFile) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules") {
        continue;
      }
      walkDir(full, onFile);
    } else if (
      ent.isFile() &&
      (full.endsWith(".ts") || full.endsWith(".tsx"))
    ) {
      onFile(full);
    }
  }
}

let matches = 0;
let filesWithMatch = 0;

walkDir(root, (filePath) => {
  let text;
  try {
    text = fs.readFileSync(filePath, "utf8");
  } catch {
    return;
  }
  const found = text.match(pattern);
  if (found && found.length > 0) {
    filesWithMatch += 1;
    matches += found.length;
  }
});

console.log(`matches=${matches} files_with_match=${filesWithMatch}`);
