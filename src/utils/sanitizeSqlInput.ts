const SQL_CONTROL_CHARACTERS = /[\u0000\u0008\u0009\u001a\n\r]/g;

/**
 * Sanitizes a user-supplied value for use inside a SQL string literal.
 *
 * This function removes control characters and escapes SQL literal delimiters,
 * wildcard characters, and backslashes. It does not make dynamically composed
 * SQL safe; database callers must use parameterized queries for all values.
 *
 * @param value - The user-provided string to sanitize.
 * @returns A normalized value with SQL string-literal metacharacters escaped.
 * @throws {TypeError} If the supplied value is not a string.
 */
// PUBLIC_INTERFACE
export function sanitizeSqlInput(value: string): string {
  if (typeof value !== 'string') {
    throw new TypeError('SQL input must be a string.');
  }

  return value
    .trim()
    .replace(SQL_CONTROL_CHARACTERS, '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}
