interface RuntimeDiagnosticContext {
  checkpoint: string;
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Emits structured, non-sensitive lifecycle diagnostics for browser and CI console logs.
 * Diagnostic payloads intentionally contain only UI state and route metadata.
 */
function logRuntimeDiagnostic(
  event: string,
  context: RuntimeDiagnosticContext,
): void {
  const { checkpoint, ...details } = context;

  console.info(
    JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      checkpoint,
      url: window.location.href,
      ...details,
    }),
  );
}

export { logRuntimeDiagnostic };
