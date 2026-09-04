export type RuntimeDiagnosticDetails = Record<string, string | number | boolean | null | undefined>;

/**
 * Emits a structured runtime event suitable for browser-console and CI capture.
 * Values are limited to operational context; callers must not include credentials or medical data.
 */
export function logRuntimeEvent(
  event: string,
  details: RuntimeDiagnosticDetails = {},
): void {
  const safeDetails = Object.fromEntries(
    Object.entries(details).filter(([, value]) => value !== undefined),
  );

  console.info(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      event,
      url: window.location.href,
      ...safeDetails,
    }),
  );
}
