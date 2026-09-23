# Runtime Maintenance Playbook

## Scope and risk assessment

Aura-3D is a client-only Vite/React application. Its production-like asynchronous path is the 12-second diagnostic scan: users start a scan, it advances through four scan phases, and a report appears one second after 100% progress. The repository currently has no authentication, organization selection, uploads, streamed backend responses, approval dialogs, credential files, or server-side runtime artifacts.

The primary E2E reliability risks are therefore client-side actionability and timer-driven state transitions:

- A test may click before the scanner is rendered or enabled.
- A test may assert report content before scan completion.
- Selectors based on decorative text or CSS can change during UI work.
- A failed CI run can otherwise lack enough UI state to distinguish a routing issue from a scan-state failure.

The Playwright suite uses stable `data-testid` selectors and the accessible scan-progress value instead of arbitrary sleeps. Playwright automatically retains a trace, screenshot, and video only when a test fails, preventing successful runs from accumulating large artifacts.

## Run locally

From the application directory:

```bash
cd medical-checkup-3d
npm install
npm run test:e2e:install
npm run test:e2e
```

`test:e2e` starts Vite on `http://127.0.0.1:4173` unless a local server is already running. In CI, Playwright always starts a fresh server and retries a failing test once to distinguish an intermittent browser/environment failure from a reproducible regression.

For a headed local investigation:

```bash
npx playwright test --headed
```

No application credentials or credential files are required. Do not add tokens, personal health data, or real patient information to browser-console diagnostics.

## CI evidence and artifact cleanup

On every test checkpoint, the test prints a JSON line containing:

- `checkpoint` and ISO `timestamp`
- current `url` and document title
- counts for the start, abort, and progress selectors
- the current `aria-valuenow` scan progress, when present

The application also emits JSON lifecycle events in the browser console for scan start, cancellation, completion, report reset, and node selection. These include a timestamp, checkpoint, current URL, and non-sensitive UI state only.

For failed tests, inspect these generated Playwright outputs:

1. `test-results/` for failure-specific trace, screenshot, and video.
2. Playwright's HTML report, emitted in CI.
3. CI console lines immediately before the failure, especially the final checkpoint and selector counts.

Successful runs do not retain screenshots, videos, or traces. This is intentional artifact cleanup. Failure artifacts are managed by Playwright per run, so no temporary files are created by the test itself.

## Troubleshooting within 15 minutes

### Start button is missing

1. Inspect the latest checkpoint's URL.
2. If it is not `http://127.0.0.1:4173/`, verify the Vite server command and CI base URL.
3. If the URL is correct but `startDiagnosticScan` is `0`, inspect the retained screenshot and browser console for a React render error.
4. If the selector count is `1` but the button is not actionable, inspect the trace for an overlay or page-load failure. Do not add a fixed sleep; wait for the accessible heading or button state.

### Scan never reaches 100%

1. Check `scanProgress` in the final test checkpoint.
2. If it stays at `0`, confirm the start click occurred and the abort control became visible.
3. If it advances but stops, inspect browser-console `scan.started` and `scan.completed` events and the retained trace.
4. If CI is under sustained load, review the configured 30-second test timeout before adjusting it. Preserve the progress-based readiness gate.

### Report is missing after progress reaches 100%

1. Verify the trace shows `aria-valuenow="100"`.
2. Look for the `scan.completed` browser diagnostic event.
3. Confirm the report heading is `Health Assessment`; tests should not rely on visual animation completion.
4. If the event is absent, investigate the scan completion callback rather than adding retries around the report assertion.

### Unexpected 404 or wrong page

This application does not contain upload, organization-selection, approval, or generation routes. A 404 indicates an incorrect test base URL, an external navigation, or deployment routing configuration. Capture the checkpoint URL and correct the route/configuration before changing selectors.

### Hidden input, upload, approval, or credential failures

These flows do not exist in this repository. Do not add file-input interactions, credential handling, or approval-loop retries to this test suite unless the product introduces the associated UI and backend contract. Any future upload test must first assert its route and visible UI state before accessing a file input.

## Change validation checklist

For maintenance changes:

1. Run `npm run build` to validate TypeScript and the production bundle.
2. Run `npm run test:e2e` to verify the cancel and complete scan paths.
3. If E2E fails, preserve the CI console checkpoint and failure artifact path in the incident ticket.
4. Confirm successful runs leave no screenshots, videos, or traces in `test-results/`.
5. Keep lifecycle logs structured and non-sensitive; never log environment variables, credentials, or user-supplied health data.
