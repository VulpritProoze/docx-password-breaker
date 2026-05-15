const SYMBOL_SUFFIXES = ["!", "@", "#", "$", "!@"];
const SYMBOL_PREFIXES = ["!", "@"];
const DIGIT_SUFFIXES = ["1", "123", "1234", "0", "99", "01"];
const MAX_VARIANTS = 200;

function titleCase(value) {
  return value.replace(/\b([A-Za-z])([A-Za-z]*)/g, (_, first, rest) => {
    return `${first.toUpperCase()}${rest.toLowerCase()}`;
  });
}

function leet(value) {
  const map = { a: "@", e: "3", o: "0", i: "1", s: "$" };
  return value.replace(/[aeois]/gi, (char) => map[char.toLowerCase()] || char);
}

function yearSuffixes() {
  const current = new Date().getFullYear();
  const years = [];
  for (let offset = 0; offset <= 5; offset += 1) {
    years.push(String(current - offset));
  }
  return years;
}

export function expand(passwords) {
  const unique = new Set();
  const output = [];
  const digits = [...DIGIT_SUFFIXES, ...yearSuffixes()];

  const push = (value) => {
    if (output.length >= MAX_VARIANTS) {
      return false;
    }
    if (typeof value !== "string" || !value.length) {
      return true;
    }
    if (!unique.has(value)) {
      unique.add(value);
      output.push(value);
    }
    return output.length < MAX_VARIANTS;
  };

  for (const raw of passwords || []) {
    if (output.length >= MAX_VARIANTS) {
      break;
    }
    if (typeof raw !== "string" || !raw.length) {
      continue;
    }

    const lower = raw.toLowerCase();
    const upper = raw.toUpperCase();
    const title = titleCase(raw);
    const baseVariants = [raw, lower, upper, title];

    for (const value of baseVariants) {
      if (!push(value)) {
        return output;
      }
    }

    if (!push(leet(raw))) {
      return output;
    }

    for (const value of baseVariants) {
      for (const suffix of digits) {
        if (!push(`${value}${suffix}`)) {
          return output;
        }
      }
    }

    for (const value of baseVariants) {
      for (const suffix of SYMBOL_SUFFIXES) {
        if (!push(`${value}${suffix}`)) {
          return output;
        }
      }
    }

    for (const value of baseVariants) {
      for (const prefix of SYMBOL_PREFIXES) {
        if (!push(`${prefix}${value}`)) {
          return output;
        }
      }
    }

    const crossVariants = [lower, upper];
    for (const value of crossVariants) {
      for (const prefix of SYMBOL_PREFIXES) {
        if (!push(`${prefix}${value}`)) {
          return output;
        }
      }
      for (const suffix of SYMBOL_SUFFIXES) {
        if (!push(`${value}${suffix}`)) {
          return output;
        }
      }
    }
  }

  return output;
}

export function mask(pwd) {
  const value = String(pwd ?? "");
  if (value.length <= 3) {
    return "*".repeat(value.length || 1);
  }
  return `${value.slice(0, 3)}${"*".repeat(value.length - 3)}`;
}
