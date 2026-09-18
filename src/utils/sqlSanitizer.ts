/**
 * Sanitizes untrusted text for use as a SQL string value.
 *
 * This helper is a defensive normalization layer, not a replacement for
 * parameterized queries. Database callers must bind the returned value as a
 * query parameter instead of concatenating it into SQL statements.
 */

/**
 * Converts untrusted input into a normalized SQL-safe string value.
 *
 * Null bytes and non-printable control characters are removed because they are
 * not meaningful in user-entered text and can be handled inconsistently by
 * database drivers. Single quotes are doubled to preserve SQL string-literal
 * compatibility for any legacy integration that requires escaped values.
 *
 * @param input - The untrusted value supplied by a user.
 * @returns A trimmed, normalized string with SQL single quotes escaped.
 */
// PUBLIC_INTERFACE
export function sanitizeSqlInput(input: unknown): string {
  if (input === null || input === undefined) {
    return '';
  }

  return String(input)
    .normalize('NFC')
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/'/g, "''");
}
