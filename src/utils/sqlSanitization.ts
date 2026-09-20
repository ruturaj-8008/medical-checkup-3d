/**
 * Safely escapes user-controlled text when it must be placed in a SQL string
 * literal. Prefer parameterized queries instead of string interpolation.
 */
export function sanitizeSqlInput(input: string): string {
  // NUL bytes can be interpreted inconsistently by database drivers.
  const withoutNullBytes = input.replace(/\0/g, '');

  // ANSI SQL represents a literal apostrophe as two consecutive apostrophes.
  return withoutNullBytes.replace(/'/g, "''");
}
