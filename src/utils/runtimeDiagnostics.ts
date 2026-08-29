export type RuntimeEventName =
  | 'application_ready'
  | 'scan_started'
  | 'scan_cancelled'
  | 'scan_completed'
  | 'scan_reset'
  | 'scan_step_changed';

/**
 * Creates an opaque identifier used to correlate one scan lifecycle in browser
 * console output. It deliberately contains no user or credential information.
 */
export function createRuntimeCorrelationId(): string {
  const randomPart = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

  return `scan-${Date.now()}-${randomPart}`;
}

/**
 * Writes a structured, secret-safe lifecycle event to the browser console.
 * Keeping logs JSON-shaped lets CI and browser automation retain searchable
 * context without changing the application UI or network behavior.
 */
export function logRuntimeEvent(
  event: RuntimeEventName,
  correlationId: string,
  context: Record<string, string | number | boolean | null> = {},
): void {
  const currentUrl = typeof window === 'undefined' ? null : window.location.href;

  console.info('[aura-runtime]', {
    timestamp: new Date().toISOString(),
    event,
    correlationId,
    url: currentUrl,
    ...context,
  });
}
