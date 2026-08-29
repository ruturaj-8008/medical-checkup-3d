# Runtime Maintenance Playbook

## Scope and current risk assessment

Aura-3D is a client-only Vite/React application. It has no authentication, organization selection, upload route, backend streaming response, approval loop, credential file, or checked-in Playwright suite at the time of writing. Consequently, failures involving hidden file inputs, 404 navigation, missing generation send buttons, or “Approve & Apply Changes” are not produced by this repository and should be triaged in the invoking platform rather than patched into this UI.

The most relevant runtime risks in this repository are animation timing, a scan completion timeout firing after cancellation, and browser automation attempting to interact with transitional UI. The scan flow now exposes explicit readiness markers and emits structured browser-console events so these issues can be diagnosed without rerunning locally.

## Run locally

```bash
cd medical-checkup-3d
npm install
npm run dev
```

Vite prints the local URL, normally `http://localhost:5173`. This project currently requires no runtime environment variables and no credential files.

For a production-equivalent build check:

```bash
npm run build
```

## Deterministic E2E interaction contract

There is no E2E script yet. When adding Playwright coverage, use the stable state gates below rather than fixed delays:

1. Navigate to the Vite URL and wait for `[data-testid="start-diagnostic-scan"]` to be visible and enabled.
2. Click the start control, then wait for `[data-testid="scan-progress"]`.
3. Assert that `data-scan-progress` progresses from `0`; use bounded Playwright expectation polling rather than retry-until-success loops.
4. Wait for `[data-testid="diagnostic-report"]` before asserting report content.
5. Use `[data-testid="reset-diagnostic-scan"]` to return to the ready state, or `[data-testid="abort-diagnostic-scan"]` while scanning.

Recommended bounded assertion:

```ts
await expect(page.getByTestId('scan-progress')).toHaveAttribute(
  'data-scan-progress',
  /^(?:[1-9]\d?|100)$/,
  { timeout: 5_000 },
);
```

On failure, log the URL, the target selector, the selector count, the current `data-scan-progress` value, and the final console diagnostics. Do not add arbitrary sleeps.

## Console diagnostics

Browser lifecycle events are logged with the `[aura-runtime]` prefix. Each event includes:

- `timestamp`: ISO-8601 event time.
- `correlationId`: a generated identifier shared by one scan lifecycle.
- `url`: current browser URL.
- `checkpoint`: the lifecycle location that produced the event.
- Action context such as progress and a stable selector.

Key checkpoints:

| Event | Checkpoint | Meaning |
| --- | --- | --- |
| `application_ready` | `app-mounted` | React application mounted and is ready for interaction. |
| `scan_started` | `scan-start` | The start control was invoked. |
| `scan_cancelled` | `scan-cancel` | The active scan was aborted before completion. |
| `scan_completed` | `report-ready` | Completion timeout finished and the report is rendered. |
| `scan_reset` | `report-reset` | The report reset control was invoked. |
| `scan_step_changed` | `manual-node-selection` | A user selected a 3D diagnostic node. |

These logs intentionally exclude credentials, request payloads, and personal data.

## Fifteen-minute troubleshooting

### The scan start button is missing

1. Check browser console for `application_ready`.
2. If it is missing, inspect Vite build/runtime errors before testing interaction.
3. If it is present, check the count of `[data-testid="start-diagnostic-scan"]`. A count other than one indicates an unexpected rendering state.
4. Do not apply “send button generation” remediation: this application has a scan start button, not an AI prompt send control.

### The test navigated to a 404 page

1. Record the URL from the last `[aura-runtime]` event.
2. Confirm the test navigates only to the Vite base URL; the app declares no application routes.
3. Remove platform-specific navigation assumptions or mis-clicks from the test.

### The test is attempting a hidden file upload

1. Stop the interaction and confirm the expected page state using the test IDs above.
2. This repository has no upload control, temporary requirements document, or attachment pipeline.
3. Move upload diagnostics to the external platform test that owns that workflow.

### The report did not appear

1. Confirm `scan_started` exists for the same `correlationId`.
2. Confirm the scan progress marker reaches `100`.
3. Wait for `scan_completed` / `report-ready`; the UI retains a one-second report compilation transition.
4. If cancellation occurred, use the reset/start flow instead of waiting for a report.

## Artifact and cleanup policy

The application itself creates no files, downloads, screenshots, traces, or temporary requirements documents. Browser-test artifacts should be configured in the future Playwright project outside source control and retained only on failure. Use unique run-scoped paths, attach failure screenshots/traces to CI output, and clean temporary directories in `finally` blocks.

The UI's only asynchronous completion resource is the scan compilation timeout. It is cleared on cancellation, scan-state transition, and component unmount, preventing a stale completion callback from changing state after a test or user aborts the flow.

## CI validation

Validate this maintenance work by:

1. Running `npm run build`.
2. Starting the app and confirming one `application_ready` log is emitted per mount.
3. Starting, aborting, restarting, completing, and resetting a scan while confirming the matching structured lifecycle events and test IDs.
4. When Playwright is introduced, retain console logs, URL, selector counts, screenshots, and traces on failure only.
