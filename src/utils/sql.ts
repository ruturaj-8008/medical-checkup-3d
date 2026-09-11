/**
 * Escapes an untrusted value for interpolation inside a single-quoted SQL
 * string literal. Prefer parameterized queries whenever a database client is
 * available; this helper is not suitable for SQL identifiers or SQL syntax.
 */

// PUBLIC_INTERFACE
export function sanitizeSqlInput(value: string): string {
  /**
   * Return a value safe to place between single quotes in a SQL literal.
   *
   * The result intentionally does not include surrounding quotes so callers
   * can pass it to query builders that add their own literal delimiters.
   * NUL bytes are removed because they are invalid in many SQL text values.
   */
  return value
    .replace(/\0/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''");
}
