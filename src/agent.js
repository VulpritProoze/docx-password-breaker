#!/usr/bin/env node
import path from "node:path";
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { decrypt } from "./decrypt.js";
import { expand, mask } from "./variations.js";
import * as reporter from "./reporter.js";

const CONFIG_NAME = "input.json";
const ARGS = new Set(process.argv.slice(2));
const IS_DRY_RUN = ARGS.has("--dry-run");

async function loadConfig() {
  const configPath = path.resolve(process.cwd(), CONFIG_NAME);
  let raw;
  try {
    raw = await readFile(configPath, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: `Failed to read ${CONFIG_NAME}: ${message}` };
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: `Invalid JSON in ${CONFIG_NAME}: ${message}` };
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, error: "Config must be a JSON object." };
  }

  const outputDir =
    typeof data.output_dir === "string" && data.output_dir.trim()
      ? data.output_dir
      : "./output";
  const outputDirPath = path.resolve(process.cwd(), outputDir);
  const stopOnFirstSuccess =
    typeof data.stop_on_first_success === "boolean"
      ? data.stop_on_first_success
      : true;

  if (!Array.isArray(data.jobs) || data.jobs.length === 0) {
    return { ok: false, error: "jobs must be a non-empty array." };
  }

  const jobs = [];
  for (let i = 0; i < data.jobs.length; i += 1) {
    const job = data.jobs[i];
    if (!job || typeof job !== "object" || Array.isArray(job)) {
      return { ok: false, error: `jobs[${i}] must be an object.` };
    }
    if (typeof job.file !== "string" || !job.file.trim()) {
      return { ok: false, error: `jobs[${i}].file must be a non-empty string.` };
    }
    if (!Array.isArray(job.passwords) || job.passwords.length === 0) {
      return {
        ok: false,
        error: `jobs[${i}].passwords must be a non-empty array of strings.`,
      };
    }
    const passwords = [];
    for (let p = 0; p < job.passwords.length; p += 1) {
      const pwd = job.passwords[p];
      if (typeof pwd !== "string" || !pwd.trim()) {
        return {
          ok: false,
          error: `jobs[${i}].passwords[${p}] must be a non-empty string.`,
        };
      }
      passwords.push(pwd);
    }

    jobs.push({
      file: job.file,
      filePath: path.resolve(process.cwd(), job.file),
      passwords,
    });
  }

  return {
    ok: true,
    result: {
      configPath,
      outputDir,
      outputDirPath,
      stopOnFirstSuccess,
      jobs,
    },
  };
}

async function ensureDir(dirPath) {
  try {
    await mkdir(dirPath, { recursive: true });
    return { ok: true, result: dirPath };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: `Failed to create output_dir: ${message}` };
  }
}

async function checkFileExists(filePath) {
  try {
    await stat(filePath);
    return { ok: true, result: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: `File not found: ${filePath} (${message})` };
  }
}

async function runJob(job, options) {
  const result = {
    file: job.filePath,
    ok: false,
    attempts: 0,
    outputFile: undefined,
    passwordFound: undefined,
    error: undefined,
  };

  const exists = await checkFileExists(job.filePath);
  if (!exists.ok) {
    result.error = exists.error;
    return { ok: false, result, error: exists.error };
  }

  const variants = expand(job.passwords);
  if (variants.length === 0) {
    result.error = "No password variants generated.";
    return { ok: false, result, error: result.error };
  }

  const parsed = path.parse(job.filePath);
  const outputName = `${parsed.name}_unlocked${parsed.ext}`;
  const outputPath = path.resolve(process.cwd(), options.outputDir, outputName);

  let wroteOutput = false;
  for (const variant of variants) {
    result.attempts += 1;
    const masked = mask(variant);
    const attempt = await decrypt(job.filePath, variant);
    reporter.logAttempt(job.filePath, masked, attempt.ok);

    if (attempt.ok && !wroteOutput) {
      try {
        await writeFile(outputPath, attempt.result);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        result.error = `Failed to write output: ${message}`;
        reporter.reportFailure(job.filePath, result.attempts);
        return { ok: false, result, error: result.error };
      }
      wroteOutput = true;
      result.ok = true;
      result.outputFile = outputPath;
      result.passwordFound = masked;

      if (options.stopOnFirstSuccess) {
        break;
      }
    }
  }

  if (!result.ok) {
    reporter.reportFailure(job.filePath, result.attempts);
  }

  return { ok: result.ok, result, error: result.error };
}

async function main() {
  const configResult = await loadConfig();
  if (!configResult.ok) {
    reporter.printSummary([
      {
        file: path.resolve(process.cwd(), CONFIG_NAME),
        ok: false,
        attempts: 0,
        error: configResult.error,
      },
    ]);
    process.exitCode = 1;
    return { ok: false, error: configResult.error };
  }

  const { jobs, outputDir, outputDirPath, stopOnFirstSuccess } =
    configResult.result;

  if (IS_DRY_RUN) {
    reporter.logDryRun(jobs);
    process.exitCode = 0;
    return { ok: true, result: { dryRun: true } };
  }

  const dirResult = await ensureDir(outputDirPath);
  if (!dirResult.ok) {
    reporter.printSummary([
      {
        file: outputDirPath,
        ok: false,
        attempts: 0,
        error: dirResult.error,
      },
    ]);
    process.exitCode = 1;
    return { ok: false, error: dirResult.error };
  }

  reporter.logStart(jobs.length);

  const results = [];
  for (const job of jobs) {
    const jobResult = await runJob(job, {
      outputDir,
      outputDirPath,
      stopOnFirstSuccess,
    });

    if (jobResult.result) {
      results.push(jobResult.result);
    } else {
      results.push({
        file: job.filePath,
        ok: false,
        attempts: 0,
        error: jobResult.error || "Unknown error.",
      });
    }
  }

  reporter.printSummary(results);
  const anyFailed = results.some((item) => !item.ok);
  process.exitCode = anyFailed ? 1 : 0;

  return { ok: !anyFailed, result: { results } };
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  reporter.printSummary([
    {
      file: "agent",
      ok: false,
      attempts: 0,
      error: message,
    },
  ]);
  process.exitCode = 1;
});
