import { mask } from "./variations.js";

const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function colorize(color, text) {
  return `${color}${text}${COLORS.reset}`;
}

export function logStart(jobCount) {
  const label = jobCount === 1 ? "job" : "jobs";
  console.log(
    `${COLORS.bold}docunlock${COLORS.reset} starting with ${jobCount} ${label}.`
  );
  return { ok: true };
}

export function logDryRun(jobs) {
  console.log(`${COLORS.bold}Dry run${COLORS.reset} (no files written).`);
  jobs.forEach((job, index) => {
    const masked = job.passwords.map((pwd) => mask(pwd)).join(", ");
    const line = `${index + 1}. ${job.filePath} | passwords: ${masked}`;
    console.log(line);
  });
  return { ok: true, result: { jobCount: jobs.length } };
}

export function logAttempt(file, maskedPwd, ok) {
  const status = ok ? colorize(COLORS.green, "OK") : colorize(COLORS.red, "NO");
  console.log(`${status} ${file} | pwd: ${maskedPwd}`);
  return { ok: true, result: { file, ok } };
}

export function reportFailure(filePath, totalAttempts) {
  const status = colorize(COLORS.red, "FAIL");
  console.log(`${status} ${filePath} after ${totalAttempts} attempts.`);
  return { ok: true, result: { file: filePath, attempts: totalAttempts } };
}

export function printSummary(results) {
  console.log("");
  console.log(`${COLORS.bold}Summary${COLORS.reset}`);

  let okCount = 0;
  let failCount = 0;

  results.forEach((result) => {
    if (result.ok) {
      okCount += 1;
    } else {
      failCount += 1;
    }

    const status = result.ok
      ? colorize(COLORS.green, "OK")
      : colorize(COLORS.red, "FAIL");

    let line = `${status} ${result.file}`;

    if (result.ok) {
      if (result.outputFile) {
        line += ` -> ${result.outputFile}`;
      }
      if (result.passwordFound) {
        line += ` (pwd: ${result.passwordFound})`;
      }
      line += ` | attempts: ${result.attempts}`;
    } else {
      line += ` | attempts: ${result.attempts}`;
      if (result.error) {
        line += ` | error: ${result.error}`;
      }
    }

    console.log(line);
  });

  const okLabel = colorize(COLORS.green, "OK");
  const failLabel = colorize(COLORS.red, "FAIL");
  const total = okCount + failCount;
  console.log(`${okLabel}: ${okCount} | ${failLabel}: ${failCount} | total: ${total}`);
  return { ok: true, result: { okCount, failCount, total } };
}
