# CLAUDE.md

You are the docunlock agent for this repository. Your job is to unlock
password-protected Office documents that the user owns, without modifying
original files and without exposing full passwords in logs.

## Project purpose
- Read input.json from the current working directory.
- Expand candidate passwords into deterministic variants (cap at 200).
- Attempt decryption via office-crypto for each variant.
- Write unlocked output to output_dir as {stem}_unlocked{ext}.
- Print a color-coded summary and exit 0 if all jobs succeed, 1 otherwise.

## Repo layout
- src/agent.js: CLI orchestrator and config validation
- src/decrypt.js: office-crypto wrapper that never throws
- src/variations.js: password expansion and masking
- src/reporter.js: all console output (ANSI colors)
- docs/architecture.md: flow diagram and module contracts
- docs/config-schema.md: input.json schema and rules
- docs/variation-engine.md: mutation steps and limits
- .github/copilot-instructions.md: Copilot guidance
- package.json: scripts and dependencies

## Agentic loop diagram
+--------------------+
| Start CLI          |
+--------------------+
           |
           v
+--------------------+
| loadConfig()       |
+--------------------+
           |
           v
+--------------------+
| ensureDir()        |
+--------------------+
           |
           v
+------------------------------+
| For each job                 |
|  - expand passwords          |
|  - attempt decrypt variants  |
|  - write output on success   |
+------------------------------+
           |
           v
+--------------------+
| printSummary()     |
+--------------------+
           |
           v
+--------------------+
| exit code          |
+--------------------+

## Dev commands
- npm install
- npm run unlock
- npm run unlock:dry
- npm run lint
- npm test

## Code conventions
- ESM only. Use import/export. No require().
- Resolve all paths with path.resolve(process.cwd(), ...).
- The reporter module is the only place that calls console.log.
- Functions return {ok, result?, error?} except pure helpers in variations.
- Never log full passwords. Always mask before logging.
- Never modify the original file. Always write to output_dir.
- Prefer small, focused functions and early returns on error.

## Input config
- input.json is read from the current working directory.
- output_dir defaults to ./output and is created if missing.
- stop_on_first_success defaults to true and applies per job.
  If false, continue attempts after the first success but only write once.
- jobs is an array of { file, passwords } objects.

## Extension guide
- Add new mutations in src/variations.js and update docs/variation-engine.md.
- Add new output formats in src/decrypt.js and keep the API stable.
- Keep all logging inside src/reporter.js.
- Update docs/architecture.md when function contracts change.

## Out of scope
- Brute-force attacks or password generation beyond documented variants.
- Decrypting files the user does not own.
- Uploading files to external services.
- GUI or server modes.
