#!/usr/bin/env node
// Reads a failed test's trace.zip, finds the real data-test value in the recorded
// DOM snapshot, and patches the broken value in a locator file if exactly one
// unambiguous candidate is found. Ambiguous/no matches are left for manual review.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [, , tracePath, locatorFilePath, locatorKey, searchPattern, keywordHint] = process.argv;

if (!tracePath || !locatorFilePath || !locatorKey || !searchPattern) {
  console.error(
    'Usage: node scripts/heal-locator.mjs <trace.zip> <locatorFile> <locatorKey> <searchPatternRegex> [keywordHint]'
  );
  console.error(
    'Example: node scripts/heal-locator.mjs test-results/.../trace.zip locators/locator.cart.ts addBackpackToCart "add-to-cart-[a-zA-Z0-9-]*" backpack'
  );
  process.exit(1);
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'trace-heal-'));
execSync(`unzip -o "${tracePath}" -d "${tmpDir}"`, { stdio: 'ignore' });

const locatorContent = fs.readFileSync(locatorFilePath, 'utf8');
const currentMatch = locatorContent.match(new RegExp(`${locatorKey}:\\s*'([^']+)'`));
if (!currentMatch) {
  console.error(`Could not find key "${locatorKey}" in ${locatorFilePath}`);
  process.exit(1);
}
const currentValue = currentMatch[1];

const pattern = new RegExp(searchPattern, 'g');
const candidates = new Set();

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (/\.(jpe?g|png|woff2?|ttf)$/i.test(entry.name)) continue;
    let text;
    try {
      text = fs.readFileSync(full, 'utf8');
    } catch {
      continue;
    }
    const matches = text.match(pattern);
    if (matches) matches.forEach((m) => candidates.add(m));
  }
}
walk(tmpDir);
fs.rmSync(tmpDir, { recursive: true, force: true });

candidates.delete(currentValue);

console.log(`Current (broken) value : ${currentValue}`);
console.log(`Candidates from trace  : ${[...candidates].join(', ') || '(none)'}`);

if (keywordHint) {
  const hint = keywordHint.toLowerCase();
  for (const c of [...candidates]) {
    if (!c.toLowerCase().includes(hint)) candidates.delete(c);
  }
  console.log(`After "${keywordHint}" filter : ${[...candidates].join(', ') || '(none)'}`);
}

if (candidates.size === 1) {
  const fixed = [...candidates][0];
  const updated = locatorContent.replace(
    new RegExp(`(${locatorKey}:\\s*')[^']+(')`),
    `$1${fixed}$2`
  );
  fs.writeFileSync(locatorFilePath, updated);
  console.log(`Patched ${locatorFilePath}: ${locatorKey} -> '${fixed}'`);
  process.exit(0);
}

console.log('Ambiguous or no candidate found — review manually before patching.');
process.exit(2);
