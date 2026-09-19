const UNSAFE_SQL_TOKEN = /(?:--|\/\*|\*\/|;)/;

/**
 * Sanitizes a user-provided value before it is supplied as a SQL query parameter.
 *
 * This function is intentionally limited to input validation and normalization.
 * It does not make string interpolation safe: callers must always pass the
 * returned value as a bound parameter supported by their database driver.
 *
 * @param input - The user-provided text to validate.
 * @returns A normalized, trimmed value that is safe to pass as a SQL parameter.
 * @throws {TypeError} When input is not a string.
 * @throws {Error} When input contains null bytes, control characters, or SQL syntax tokens.
 */
// PUBLIC_INTERFACE
export function sanitizeSqlInput(input: unknown): string {
  if (typeof input !== 'string') {
    throw new TypeError('SQL input must be a string.');
  }

  const sanitizedInput = input.normalize('NFKC').replace(/\0/g, '').trim();

  if (/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(sanitizedInput)) {
    throw new Error('SQL input cannot contain control characters.');
  }

  if (UNSAFE_SQL_TOKEN.test(sanitizedInput)) {
    throw new Error('SQL input cannot contain statement delimiters or comments.');
  }

  return sanitizedInput;
}
