/**
 * Sanitizes a user-provided value when it must be embedded in a SQL string
 * literal. Prefer parameterized queries instead of interpolating this output
 * into SQL statements; sanitization is only a defensive fallback.
 *
 * @param input - The user-provided text to prepare for a SQL string literal.
 * @returns The sanitized text with null bytes removed and single quotes escaped.
 */
// PUBLIC_INTERFACE
export function sanitizeSqlInput(input: string): string {
  if (typeof input !== 'string') {
    throw new TypeError('SQL input must be a string.');
  }

  // Null bytes can cause inconsistent handling between application and database layers.
  return input.replace(/\0/g, '').replace(/'/g, "''");
}
