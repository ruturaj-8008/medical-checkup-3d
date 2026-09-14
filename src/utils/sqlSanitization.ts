/**
 * Sanitizes untrusted text when it must be represented as a SQL string literal.
 *
 * Prefer parameterized queries for all database access. This helper is intended
 * only to normalize a string value before it is passed to a database adapter or
 * embedded in a SQL literal by legacy code; it must never be used to validate
 * SQL identifiers, clauses, or complete SQL statements.
 *
 * @param input - The untrusted value to prepare for SQL string-literal contexts.
 * @returns The normalized value with single quotes escaped using SQL syntax.
 * @throws {TypeError} When the provided value is not a string.
 */
// PUBLIC_INTERFACE
export function sanitizeSqlInput(input: string): string {
  if (typeof input !== 'string') {
    throw new TypeError('SQL input must be a string.');
  }

  return input
    .replace(/\0/g, '')
    .replace(/[\u0008\u0009\u001a\n\r]/g, ' ')
    .replace(/'/g, "''");
}
