/**
 * sqlSanitize.ts
 *
 * Utilities for sanitizing user-supplied input before it is used in
 * SQL query construction. These helpers reduce the risk of SQL
 * injection when raw string interpolation cannot be avoided.
 *
 * IMPORTANT: The safest way to prevent SQL injection is to always use
 * parameterized queries / prepared statements provided by your database
 * driver (e.g. `?` or `$1` placeholders) instead of string concatenation.
 * The functions below are a defense-in-depth layer for situations where
 * raw values (such as identifiers) must be embedded directly into a
 * query string.
 */

// Characters and patterns commonly used in SQL injection attacks.
const SQL_DANGEROUS_CHARS_REGEX = /['";\\`]/g;
const SQL_COMMENT_REGEX = /(--|\/\*|\*\/|#)/g;
// Common SQL keywords that should not appear in plain user input fields.
const SQL_KEYWORDS_REGEX =
  /\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|EXECUTE|UNION|MERGE|TRUNCATE|GRANT|REVOKE)\b/gi;
// Valid SQL identifier pattern (letters, digits, underscore; must not start with a digit).
const VALID_IDENTIFIER_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;

// PUBLIC_INTERFACE
export function sanitizeSqlInput(input: unknown): string {
  /**
   * Sanitizes a raw value intended to be used inside a SQL query string.
   *
   * This function:
   *  - Coerces the input to a string.
   *  - Strips SQL comment sequences (`--`, `/* * /`, `#`).
   *  - Removes dangerous quoting/escaping characters (', ", ;, \, `).
   *  - Strips common SQL keywords that should not appear in normal
   *    user-supplied values (SELECT, DROP, UNION, etc.), guarding
   *    against keyword-based injection payloads.
   *  - Trims leading/trailing whitespace.
   *
   * NOTE: This is a defense-in-depth sanitizer, not a replacement for
   * parameterized queries. Always prefer prepared statements / bound
   * parameters when interacting with a real database.
   *
   * @param input - The raw, untrusted value to sanitize. Non-string
   *   values are converted to their string representation first.
   * @returns A sanitized string safe(r) for embedding in a SQL query,
   *   with dangerous characters, comments, and keywords removed.
   */
  if (input === null || input === undefined) {
    return '';
  }

  let value = String(input);

  // Remove SQL comment markers first, since they can be used to hide
  // the remainder of an injected statement.
  value = value.replace(SQL_COMMENT_REGEX, '');

  // Remove dangerous characters used for breaking out of string literals
  // or terminating statements.
  value = value.replace(SQL_DANGEROUS_CHARS_REGEX, '');

  // Strip common SQL keywords that indicate an attempted injection.
  value = value.replace(SQL_KEYWORDS_REGEX, '');

  // Collapse any resulting extra whitespace and trim.
  value = value.replace(/\s{2,}/g, ' ').trim();

  return value;
}

// PUBLIC_INTERFACE
export function isValidSqlIdentifier(identifier: string): boolean {
  /**
   * Validates that a string is safe to use as a SQL identifier
   * (e.g. table name or column name) by checking it against an
   * allow-list pattern.
   *
   * Identifiers must:
   *  - Contain only letters, digits, and underscores.
   *  - Not start with a digit.
   *  - Not be empty.
   *
   * @param identifier - The candidate SQL identifier to validate.
   * @returns `true` if the identifier matches the safe pattern,
   *   `false` otherwise.
   */
  if (typeof identifier !== 'string' || identifier.length === 0) {
    return false;
  }
  return VALID_IDENTIFIER_REGEX.test(identifier);
}

// PUBLIC_INTERFACE
export function sanitizeSqlIdentifier(identifier: string): string {
  /**
   * Sanitizes a value intended to be used as a SQL identifier
   * (table or column name) by stripping any character that is not
   * a letter, digit, or underscore, and ensuring the result does not
   * start with a digit (a leading underscore is prepended in that case).
   *
   * Prefer `isValidSqlIdentifier` to reject invalid input outright when
   * possible; use this function only when a best-effort sanitized
   * fallback is acceptable.
   *
   * @param identifier - The raw, untrusted identifier string.
   * @returns A sanitized identifier containing only safe characters.
   */
  if (typeof identifier !== 'string') {
    return '';
  }

  let sanitized = identifier.replace(/[^A-Za-z0-9_]/g, '');

  if (/^[0-9]/.test(sanitized)) {
    sanitized = `_${sanitized}`;
  }

  return sanitized;
}

// PUBLIC_INTERFACE
export function escapeSqlStringLiteral(value: unknown): string {
  /**
   * Escapes single quotes in a value so it can be more safely embedded
   * inside a single-quoted SQL string literal (e.g. `'...'`).
   *
   * This follows the standard SQL convention of doubling single quotes
   * (`'` -> `''`) and additionally removes backslashes and semicolons
   * to further reduce injection risk.
   *
   * NOTE: Prefer parameterized queries over manual escaping whenever
   * the database driver supports them.
   *
   * @param value - The raw, untrusted value to escape.
   * @returns The escaped string, safe(r) for inclusion within a
   *   single-quoted SQL string literal.
   */
  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .replace(/\\/g, '')
    .replace(/;/g, '')
    .replace(/'/g, "''");
}
