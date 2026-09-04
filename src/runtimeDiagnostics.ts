export type RuntimeDiagnosticContext = Record<string, string | number | boolean | null | undefined>;

/**
 * Creates a timestamped, structured browser log entry for UI maintenance triage.
 * Values are intentionally restricted to primitive, non-sensitive context.
 */
function emitRuntimeDiagnostic(
  event: string,
  context: RuntimeDiagnosticContext = {},
): void {
  const payload = {
    timestamp: new Date().toISOString(),
    event,
    url: window.location.href,
    ...context,
  };

  console.info('[aura-runtime]', payload);
}

// PUBLIC_INTERFACE
/**
 * Records a UI lifecycle checkpoint with URL and safe contextual metadata.
 *
 * @param event - Stable lifecycle/checkpoint label used when reviewing browser or CI logs.
 * @param context - Primitive context that must not include credentials or other sensitive values.
 */
export function logRuntimeDiagnostic(
  event: string,
  context: RuntimeDiagnosticContext = {},
): void {
  emitRuntimeDiagnostic(event, context);
}
