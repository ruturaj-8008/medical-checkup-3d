/**
 * Converts untrusted input into a conservative SQL literal value fragment.
 *
 * This helper is intended for legacy boundaries that cannot yet use bound
 * parameters. Database calls must still use parameterized queries whenever
 * possible; sanitization alone cannot make dynamically constructed SQL safe.
 */
const SQL_CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/g;
const SQL_COMMENT_OR_STATEMENT_MARKERS = /--|\/\*|\*\/|;/g;

/**
 * Sanitizes an untrusted value before it is used as SQL data.
 *
 * The function removes control characters, SQL statement separators, and SQL
 * comment delimiters. It also doubles single and double quotes so the result
 * cannot terminate a quoted literal when used by legacy code.
 *
 * @param input - The untrusted value supplied by a user.
 * @returns A normalized, escaped SQL literal value fragment.
 */
// PUBLIC_INTERFACE
export function sanitizeSqlInput(input: unknown): string {
  if (input === null || input === undefined) {
    return '';
  }

  return String(input)
    .replace(SQL_CONTROL_CHARACTERS, '')
    .replace(SQL_COMMENT_OR_STATEMENT_MARKERS, '')
    .replace(/'/g, "''")
    .replace(/"/g, '""')
    .trim();
}
