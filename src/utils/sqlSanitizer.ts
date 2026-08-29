const NULL_BYTE_PATTERN = /\u0000/g;
const SINGLE_QUOTE_PATTERN = /'/g;

/**
 * Normalizes user-provided text for use inside a SQL string literal.
 *
 * This function removes null bytes and escapes single quotes according to the
 * SQL standard (`'` becomes `''`). Prefer parameterized queries whenever the
 * database client supports them; escaping alone should not be used to build
 * arbitrary SQL statements.
 *
 * @param input - The user-provided text to normalize and escape.
 * @returns Text that can be placed between SQL string-literal delimiters.
 */
// PUBLIC_INTERFACE
export function sanitizeSqlInput(input: string): string {
  return input.normalize().replace(NULL_BYTE_PATTERN, '').replace(SINGLE_QUOTE_PATTERN, "''");
}
