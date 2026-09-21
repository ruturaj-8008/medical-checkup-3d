/**
 * Utilities for preparing untrusted text for SQL string-literal contexts.
 *
 * Prefer parameterized queries for every database operation. This helper only
 * normalizes text and escapes SQL single-quote delimiters; it must not be used
 * to construct SQL identifiers, clauses, or complete queries.
 */

/**
 * Sanitizes untrusted text before it is placed in a SQL string-literal context.
 *
 * The function removes ASCII control characters (except normal whitespace),
 * collapses whitespace, and doubles single quotes according to standard SQL
 * escaping rules. Database queries must still bind the returned value as a
 * parameter whenever the database driver supports parameterized queries.
 *
 * @param value - The untrusted text supplied by a user.
 * @returns A normalized value with SQL single quotes escaped.
 * @throws {TypeError} When the supplied value is not a string.
 */
// PUBLIC_INTERFACE
export function sanitizeSqlInput(value: string): string {
  if (typeof value !== 'string') {
    throw new TypeError('SQL input must be a string.');
  }

  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/'/g, "''");
}
