/**
 * Removes control characters and escapes SQL string-literal delimiters in
 * untrusted text. This utility is intended only for protecting a value when a
 * database driver's parameter-binding API is unavailable.
 *
 * Prefer parameterized queries over string interpolation. This function does
 * not validate or authorize arbitrary SQL statements.
 */

// PUBLIC_INTERFACE
export function sanitizeSqlInput(input: string): string {
  /**
   * Sanitizes untrusted text for inclusion in a SQL string literal.
   *
   * @param input - The untrusted user-provided value to sanitize.
   * @returns The normalized value with control characters removed and single
   * quotes escaped according to standard SQL string-literal rules.
   */
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/'/g, "''");
}
