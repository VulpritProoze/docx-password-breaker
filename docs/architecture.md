# Architecture

## Agent flow (ASCII)
+-----------------------+
| Start CLI             |
+-----------------------+
            |
            v
+-----------------------+
| loadConfig()          |
+-----------------------+
            |
            v
+-----------------------+
| ensureDir()           |
+-----------------------+
            |
            v
+--------------------------------------+
| For each job                         |
|  - expand(passwords)                 |
|  - for each variant:                 |
|      decrypt(file, variant)          |
|      write {stem}_unlocked{ext}      |
|      stop_on_first_success? break    |
|  - report failure if none succeed    |
+--------------------------------------+
            |
            v
+-----------------------+
| printSummary()        |
+-----------------------+
            |
            v
+-----------------------+
| exit code (0 or 1)    |
+-----------------------+

## Module contracts

### src/agent.js
- loadConfig() -> Promise<{ ok: boolean, result?: Config, error?: string }>
- ensureDir(dirPath: string) -> Promise<{ ok: boolean, result?: string, error?: string }>
- runJob(job: Job, opts: RunOptions) -> Promise<{ ok: boolean, result?: JobResult, error?: string }>
- main() -> Promise<{ ok: boolean, result?: { results: JobResult[] }, error?: string }>

### src/decrypt.js
- decrypt(filePath: string, password: string) -> Promise<{ ok: boolean, result?: Buffer, error?: string }>

### src/variations.js
- expand(passwords: string[]) -> string[]
- mask(pwd: string) -> string

### src/reporter.js
- logAttempt(file: string, maskedPwd: string, ok: boolean) -> { ok: boolean, result?: object }
- reportFailure(filePath: string, totalAttempts: number) -> { ok: boolean, result?: object }
- printSummary(results: JobResult[]) -> { ok: boolean, result?: object }
- logDryRun(jobs: Job[]) -> { ok: boolean, result?: object }
- logStart(jobCount: number) -> { ok: boolean, result?: object }

### Shared data shapes
- Config: { outputDir: string, outputDirPath: string, stopOnFirstSuccess: boolean, jobs: Job[] }
- Job: { file: string, filePath: string, passwords: string[] }
- JobResult: { file: string, ok: boolean, attempts: number, outputFile?: string, passwordFound?: string, error?: string }
- RunOptions: { outputDir: string, outputDirPath: string, stopOnFirstSuccess: boolean }

## Key constraints
- ESM only. No require().
- All paths resolve with path.resolve(process.cwd(), ...).
- Reporter is the only module that calls console.log.
- No full passwords in logs; always mask before logging.
- Original files are never modified.
- Decrypt wrappers never throw; they return { ok, result?, error? }.
- Pure helpers (expand, mask) return raw values by design.
