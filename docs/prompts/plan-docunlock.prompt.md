## Plan: docunlock CLI scaffolding

Build a fresh Node.js ESM CLI that reads input.json, expands password variants deterministically with a 200-cap, attempts decrypt via office-crypto, writes unlocked files to output_dir, and reports via a single reporter module. Align docs and instructions with the same mental model, capture judgement calls in docs, and keep logging safe by masking passwords.

**Steps**
1. Confirm workspace is empty and initialize project skeleton: create package.json with ESM, scripts (unlock, unlock:dry, test, lint), deps (office-crypto, eslint), engines node >=18, and add .gitignore. Decide on a minimal ESLint flat config file so npm run lint works. *Depends on nothing*
2. Create CLAUDE.md narrative prompt with required sections (purpose, layout, loop diagram, dev commands, conventions, config, extension guide, out of scope), mirroring the same behavior model as Copilot instructions. *Parallel with step 3*
3. Create .github/copilot-instructions.md in imperative style with ✅/❌ examples, variation rules summary, and do-not-suggest list. *Parallel with step 2*
4. Create docs/architecture.md with ASCII loop diagram, module contracts for each src file (functions + return types), and key constraints including no console logging outside reporter, path resolution rules, and no original file modification. Document the signature exception decision for variations if needed. *Depends on steps 2-3 for shared mental model*
5. Create docs/config-schema.md with full field table, path resolution and output_dir auto-creation rules, and minimal + multi-file examples. Include the interpretation of stop_on_first_success (per-job; if false, continue attempts after success but only write once). *Depends on step 1*
6. Create docs/variation-engine.md with numbered mutation order, hard limits (max 200, deduped, stable order), and explicit non-goals (no brute force, no permutations beyond listed, no multi-step leet combos). Record any judgement calls such as leet strategy and cross behavior. *Depends on step 1*
7. Implement src/variations.js with expand(passwords)->string[] and mask(pwd)->string. Expand preserves input order, dedupes with stable Set, caps to 200 overall, and uses the documented mutation order. Mask keeps first 3 chars and masks the rest; for <=3 chars, mask all. *Depends on step 6*
8. Implement src/decrypt.js with decrypt(filePath, password)->Promise<{ok,result,error}> that wraps office-crypto, catches all errors, and never throws. *Depends on step 1*
9. Implement src/reporter.js with ANSI color helpers and exports logAttempt, reportFailure, printSummary, logDryRun, logStart. Ensure every log path masks passwords and only reporter uses console.log. *Depends on steps 7-8*
10. Implement src/agent.js as the CLI entrypoint with shebang, no direct console logging, loadConfig() validation, ensureDir(), dry-run handling, job loop with runJob(), per-job early stop, output writing, summary printing, and exit code rules. Resolve all paths with path.resolve(process.cwd(), ...). *Depends on steps 7-9*
11. Verification: run npm install, create a minimal input.json, run npm run unlock:dry to validate config output, then run npm run unlock against a known password-protected file to confirm unlock + output naming. *Depends on steps 1-10*

**Relevant files**
- `d:/Ram Alin/src/Misc/old-docx-breaker/package.json` — ESM config, scripts, deps, engines, and optional bin entry
- `d:/Ram Alin/src/Misc/old-docx-breaker/.gitignore` — ignore node_modules, output, input.json, logs, OS files
- `d:/Ram Alin/src/Misc/old-docx-breaker/eslint.config.js` — minimal flat config for lint script (judgement call)
- `d:/Ram Alin/src/Misc/old-docx-breaker/CLAUDE.md` — Claude prompt with loop diagram and conventions
- `d:/Ram Alin/src/Misc/old-docx-breaker/.github/copilot-instructions.md` — Copilot instructions with examples
- `d:/Ram Alin/src/Misc/old-docx-breaker/docs/architecture.md` — flow diagram, contracts, constraints
- `d:/Ram Alin/src/Misc/old-docx-breaker/docs/config-schema.md` — schema table and examples
- `d:/Ram Alin/src/Misc/old-docx-breaker/docs/variation-engine.md` — mutation steps and limits
- `d:/Ram Alin/src/Misc/old-docx-breaker/src/agent.js` — orchestrator, config, job loop, summary
- `d:/Ram Alin/src/Misc/old-docx-breaker/src/decrypt.js` — office-crypto wrapper
- `d:/Ram Alin/src/Misc/old-docx-breaker/src/variations.js` — expansion + masking
- `d:/Ram Alin/src/Misc/old-docx-breaker/src/reporter.js` — all console logging

**Verification**
1. npm install
2. npm run unlock:dry (with a minimal input.json in cwd)
3. npm run unlock (with a known protected Office file)
4. Confirm output file naming and summary exit code behavior

**Decisions**
- Interpret stop_on_first_success as per-job early-stop; if false, continue attempts after success but only write output once; document in docs/config-schema.md.
- Leet substitution will be a single-pass global replace on each base candidate (not combinatorial); document in docs/variation-engine.md.
- Cross step will explicitly generate symbol combinations for lowercase and uppercase variants even if duplicates result; dedupe preserves order.
- Add eslint.config.js to make npm run lint operational; document in CLAUDE.md and Copilot instructions under dev commands.
- Apply {ok,result,error} returns to IO/async functions; keep expand/mask signatures as specified and document contracts in docs/architecture.md.

**Further Considerations**
1. If you want a configurable input.json path via CLI args, add a --config option and reflect it in docs/config-schema.md (currently defaulting to ./input.json).
2. If unlock attempts are too verbose, consider a summary-only mode that logs per-file counts instead of per-attempt lines, while still masking passwords.
