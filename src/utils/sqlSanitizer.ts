/**
 * Prepares user-provided text for use inside a SQL string literal.
 *
 * Prefer parameterized queries whenever a database client is available. This
 * utility is intentionally limited to escaping literal content; it must never
 * be used to construct SQL identifiers, clauses, or complete SQL statements.
 */
export function sanitizeSqlInput(input: string): string {
  if (typeof input !== 'string') {
    throw new TypeError('SQL input must be a string.');
  }

  return input
    .replace(/\u0000/g, '')
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/'/g, "''");
}
