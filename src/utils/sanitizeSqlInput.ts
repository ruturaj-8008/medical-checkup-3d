const SQL_CONTROL_TOKENS = /(?:--|\/\*|\*\/|;)/;
const UNSAFE_CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/;

/**
 * Error raised when input contains characters or tokens that are unsafe to
 * accept as a single SQL parameter value.
 */
export class SqlInputValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SqlInputValidationError";
  }
}

/**
 * Validates and normalizes text that will be supplied as a single SQL value.
 *
 * This is defense-in-depth only: callers must still pass the returned value
 * through a parameterized query or prepared statement. Never concatenate this
 * value into SQL syntax, table names, column names, or query fragments.
 *
 * @param input - The untrusted text supplied by a user.
 * @returns The trimmed, whitespace-normalized value.
 * @throws {SqlInputValidationError} When the value includes SQL control tokens
 * or non-printable control characters.
 */
// PUBLIC_INTERFACE
export function sanitizeSqlInput(input: string): string {
  if (typeof input !== "string") {
    throw new SqlInputValidationError("SQL input must be a string.");
  }

  const sanitizedInput = input.normalize("NFKC").trim().replace(/\s+/g, " ");

  if (UNSAFE_CONTROL_CHARACTERS.test(sanitizedInput)) {
    throw new SqlInputValidationError(
      "SQL input contains unsupported control characters.",
    );
  }

  if (SQL_CONTROL_TOKENS.test(sanitizedInput)) {
    throw new SqlInputValidationError(
      "SQL input cannot contain statement delimiters or SQL comments.",
    );
  }

  return sanitizedInput;
}
