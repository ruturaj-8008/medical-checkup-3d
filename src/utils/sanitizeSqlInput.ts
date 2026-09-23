/**
 * Sanitizes a user-provided value for inclusion in a SQL string literal.
 *
 * Prefer parameterized queries whenever a database client supports them. This
 * helper only provides defense in depth for code paths that must construct a
 * SQL literal, and it must not be used to sanitize SQL identifiers, clauses,
 * or arbitrary SQL statements.
 */

// PUBLIC_INTERFACE
export function sanitizeSqlInput(value: string): string {
  /**
   * Remove NUL and other ASCII control characters, then escape apostrophes
   * according to the ANSI SQL string-literal convention.
   */
  return value
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/'/g, "''");
}
