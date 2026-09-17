/**
 * Sanitizes untrusted text before it is displayed or used as a SQL string value.
 *
 * This function is defense-in-depth only. Database queries must always use
 * parameterized statements; sanitizing strings cannot make dynamic SQL safe.
 */

// PUBLIC_INTERFACE
export function sanitizeSqlInput(input: unknown): string {
  /**
   * Normalizes untrusted user input and removes common SQL control characters.
   *
   * @param input - The value supplied by a user or external source.
   * @returns A normalized string suitable for use as a parameter value. Single
   * quotes are escaped for SQL string-literal contexts.
   */
  if (input === null || input === undefined) {
    return '';
  }

  return String(input)
    .normalize('NFKC')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/--|\/\*|\*\//g, '')
    .replace(/[;\\]/g, '')
    .replace(/'/g, "''")
    .replace(/\s+/g, ' ')
    .trim();
}
