/**
 * sqlSanitizer.ts
 *
 * Utility functions for sanitizing user-provided input to reduce the risk
 * of SQL injection when that input may eventually be used to build or
 * pass values into SQL queries (e.g., via a backend API call).
 *
 * IMPORTANT: This module provides defense-in-depth input sanitization for
 * client-side use (e.g., before submitting form data). It is NOT a
 * replacement for parameterized queries / prepared statements on the
 * backend, which remain the primary defense against SQL injection.
 * Always use parameterized queries or ORM-level escaping server-side.
 */

/**
 * Common SQL keywords and tokens frequently used in injection attacks.
 * Used for detection/flagging purposes (not for blind stripping, since
 * some of these words could legitimately appear in free text).
 */
const SQL_INJECTION_PATTERNS: RegExp[] = [
  /(\b(select|insert|update|delete|drop|alter|create|truncate|exec|execute|union|grant|revoke)\b)/i,
  /(--|#|\/\*|\*\/)/, // SQL comment sequences
  /(;)/, // statement terminator often used to chain queries
  /(\bor\b\s+\d+\s*=\s*\d+)/i, // classic "OR 1=1"
  /(\band\b\s+\d+\s*=\s*\d+)/i,
  /('\s*or\s*')/i,
  /(\bxp_cmdshell\b)/i,
  /(\bwaitfor\s+delay\b)/i,
];

/**
 * Characters that are escaped when sanitizing free-text input intended
 * for use in SQL string literals (in case parameterization is not
 * available in some legacy path).
 */
const CHARACTERS_TO_ESCAPE: Record<string, string> = {
  "'": "''", // escape single quotes by doubling them (standard SQL escaping)
  "\\": "\\\\",
  "\0": "\\0",
  "\n": "\\n",
  "\r": "\\r",
  '"': '\\"',
  "\x1a": "\\Z",
};

// PUBLIC_INTERFACE
export function escapeSqlString(input: string): string {
  /**
   * Escapes characters in a string that have special meaning in SQL
   * string literals (quotes, backslashes, control characters).
   *
   * This should be used as a defense-in-depth measure only when the
   * value must be embedded directly into a SQL string; prefer
   * parameterized queries wherever possible.
   *
   * @param input - The raw user-provided string.
   * @returns The escaped string, safe for inclusion within a SQL string literal.
   */
  if (typeof input !== "string") {
    return "";
  }

  return input.replace(/['"\\\0\n\r\x1a]/g, (char) => CHARACTERS_TO_ESCAPE[char] ?? char);
}

// PUBLIC_INTERFACE
export function stripSqlMetaCharacters(input: string): string {
  /**
   * Removes characters and sequences commonly used to break out of a SQL
   * string context or terminate/chain SQL statements (quotes, semicolons,
   * comment markers, backslashes).
   *
   * Use this when you want to aggressively strip potentially dangerous
   * characters rather than escape them (e.g., for search terms, usernames).
   *
   * @param input - The raw user-provided string.
   * @returns A sanitized string with SQL meta-characters removed.
   */
  if (typeof input !== "string") {
    return "";
  }

  return input
    .replace(/(--|#|\/\*|\*\/)/g, "") // remove comment sequences
    .replace(/[;'"\\]/g, "") // remove quotes, semicolons, backslashes
    .trim();
}

// PUBLIC_INTERFACE
export function containsSqlInjectionPattern(input: string): boolean {
  /**
   * Checks whether the given input contains patterns commonly associated
   * with SQL injection attempts (keywords, comment markers, tautologies,
   * statement terminators, etc.).
   *
   * @param input - The raw user-provided string to inspect.
   * @returns true if a suspicious pattern is detected, false otherwise.
   */
  if (typeof input !== "string" || input.length === 0) {
    return false;
  }

  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

// PUBLIC_INTERFACE
export function sanitizeSqlInput(
  input: unknown,
  options: { mode?: "escape" | "strip"; maxLength?: number } = {}
): string {
  /**
   * Primary entry point for sanitizing user input that may be used in a
   * SQL context. Normalizes the input to a string, trims it, enforces an
   * optional max length, and then either escapes or strips SQL
   * meta-characters depending on the selected mode.
   *
   * @param input - The raw user-provided value (any type; non-strings are
   *   coerced to an empty string to avoid unexpected behavior).
   * @param options.mode - "escape" (default) to escape special characters
   *   for safe inclusion in a SQL string literal, or "strip" to remove
   *   dangerous characters entirely.
   * @param options.maxLength - Optional maximum length to truncate the
   *   input to before sanitizing (helps mitigate abuse via extremely long
   *   payloads).
   * @returns The sanitized string.
   */
  const { mode = "escape", maxLength } = options;

  let value = typeof input === "string" ? input : String(input ?? "");
  value = value.trim();

  if (typeof maxLength === "number" && maxLength >= 0) {
    value = value.slice(0, maxLength);
  }

  return mode === "strip" ? stripSqlMetaCharacters(value) : escapeSqlString(value);
}

// PUBLIC_INTERFACE
export function validateAndSanitizeSqlInput(
  input: unknown,
  options: { mode?: "escape" | "strip"; maxLength?: number } = {}
): { sanitized: string; isSuspicious: boolean } {
  /**
   * Convenience helper that both flags potentially malicious input and
   * returns a sanitized version of it, so callers can decide whether to
   * reject the input outright (isSuspicious === true) or proceed with the
   * sanitized value.
   *
   * @param input - The raw user-provided value.
   * @param options - See {@link sanitizeSqlInput} for available options.
   * @returns An object containing the sanitized string and a flag
   *   indicating whether the original input matched a known SQL
   *   injection pattern.
   */
  const original = typeof input === "string" ? input : String(input ?? "");
  const isSuspicious = containsSqlInjectionPattern(original);
  const sanitized = sanitizeSqlInput(input, options);

  return { sanitized, isSuspicious };
}
