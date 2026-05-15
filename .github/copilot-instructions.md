# Copilot instructions

## What this repo does
- Build a Node.js CLI that unlocks password-protected Office files the user owns.
- Read input.json, expand password variants (cap 200), attempt decrypt, write output.
- Print a color-coded summary and set exit code 0 (all ok) or 1 (any failed).

## Stack and conventions
- Node.js >= 18, ESM only (import/export).
- office-crypto for decryption.
- Reporter is the only module that uses console.log.
- All paths resolved with path.resolve(process.cwd(), ...).
- ASCII-only docs and examples. Use OK/NO markers for examples.

## Folder responsibilities
- src/agent.js: CLI orchestration, config validation, job loop
- src/decrypt.js: office-crypto wrapper, never throws
- src/variations.js: password variants and masking
- src/reporter.js: console output only
- docs/: architecture, config schema, and variation engine

## Code patterns (OK / NO)
OK
```js
import * as reporter from "./reporter.js";
reporter.logStart(jobs.length);
```
NO
```js
console.log("Starting...");
```

OK
```js
const filePath = path.resolve(process.cwd(), job.file);
```
NO
```js
const filePath = "./" + job.file;
```

OK
```js
const masked = mask(password);
reporter.logAttempt(filePath, masked, attempt.ok);
```
NO
```js
reporter.logAttempt(filePath, password, attempt.ok);
```

OK
```js
import { OfficeFile } from "office-crypto";
```
NO
```js
const { OfficeFile } = require("office-crypto");
```

## Variation rules summary
- Base variants: original, lowercase, UPPERCASE, Title Case.
- Leet substitution: a->@ e->3 o->0 i->1 s->$ (single pass).
- Append digits: 1, 123, 1234, 0, 99, 01, current year and previous five years.
- Append symbols: ! @ # $ !@
- Prepend symbols: ! @
- Cross: lowercase and UPPERCASE with symbol prefixes/suffixes (deduped).
- Deduplicate in order and cap at 200 per job.

## Dev commands
- npm install
- npm run unlock
- npm run unlock:dry
- npm run lint
- npm test

## Do-not-suggest list
- Brute-force password guessing beyond documented variants.
- Logging full passwords or writing to the original file.
- require() or CommonJS conversion.
- Adding chalk or other logging dependencies (use ANSI codes only).
- Uploading user files or passwords to external services.
