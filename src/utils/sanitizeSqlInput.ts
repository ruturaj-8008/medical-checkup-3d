/**
 * Sanitizes a user-supplied scalar value before it is displayed or passed
 * through an SQL-adjacent workflow.
 *
 * This utility deliberately removes characters that can alter SQL structure,
 * including quotes, identifier delimiters, statement terminators, and SQL
 * comment delimiters. It is not a substitute for parameterized queries:
 * database code must always bind user values rather than interpolate them
 * into SQL strings.
 *
 * @param input - The untrusted value supplied by a user.
 * @returns A trimmed, normalized string with SQL-control characters removed.
 */
// PUBLIC_INTERFACE
export function sanitizeSqlInput(input: unknown): string {
  if (input === null || input === undefined) {
    return '';
  }

  return String(input)
    // Remove null bytes and other non-printable control characters.
    .replace(/[\u0000-\u001F\u007F]/g, '')
    // Remove SQL block comments and line-comment introducers.
    .replace(/\/\*|\*\/|--|#/g, '')
    // Remove common SQL string and identifier delimiters.
    .replace(/['"`;]/g, '')
    // Collapse repeated whitespace after removing unsafe characters.
    .replace(/\s+/g, ' ')
    .trim();
}
