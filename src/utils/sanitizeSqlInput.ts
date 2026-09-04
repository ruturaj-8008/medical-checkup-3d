/**
 * Sanitizes text intended for interpolation inside a single-quoted SQL string
 * literal. Parameterized queries should always be preferred when a database
 * driver is available, because sanitization cannot make arbitrary SQL syntax
 * safe to execute.
 *
 * The returned value does not include surrounding single quotes.
 *
 * @param input - User-provided text to use as SQL string-literal content.
 * @returns Text with NUL characters removed and apostrophes SQL-escaped.
 */
// PUBLIC_INTERFACE
export function sanitizeSqlInput(input: string): string {
  // NUL bytes are not valid in SQL text literals for many database engines.
  return input.replace(/\0/g, "").replace(/'/g, "''");
}
