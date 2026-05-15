docunlock — unlock password-protected Office files

Quick start

1. Prerequisites: Node.js 18+ installed.

2. Install dependencies:
```bash
npm install
```

3. Create `input.json` in the project root. Minimal example:
```json
{
  "jobs": [
    { "file": "./Security-Keys-II.docx", "passwords": ["TestPassword", "PizzaOrderBonanza", "OtherPasswords"] }
  ]
}
```

4. Dry run (validates config, prints jobs, writes nothing):
```bash
npm run unlock:dry
```

5. Run unlock (attempts decryption and writes outputs to `./output`):
```bash
npm run unlock
```

What to expect
- Unlocked files are written as `{stem}_unlocked{ext}` inside `./output`.
- The terminal prints a summary with masked passwords and OK/FAIL per file.
- Exit code: `0` = all jobs succeeded, `1` = at least one failed.

Security & notes
- Full passwords are never printed by default; logs show masked versions.
- `input.json` and `output/` are in `.gitignore` by default — do not commit them.
- If you need the exact plaintext that succeeded, request a temporary local change (not enabled by default) to write the password to a local file; remember to delete it afterwards.

Further reading
- `CLAUDE.md` — project purpose and conventions
- `docs/config-schema.md` — input.json schema and examples
- `docs/variation-engine.md` — how password variants are generated

Support
- If something fails, check file paths in `input.json`, rerun `npm run unlock:dry`, and share the printed summary.
