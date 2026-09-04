# Runtime Maintenance Playbook

This guide covers on-call maintenance for the Aura-3D Medical Checkup Portal. It reflects the current repository: a client-only Vite/React application with no authentication flow, credential file, uploads, downloads, Playwright suite, or server-side streaming endpoint.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`. For a production-equivalent compilation check, use:

```bash
npm run build
```

The project currently has no required runtime environment variables and no credential-file format. Do not create placeholder credentials or add secrets to client-side code.

## Deterministic interaction checkpoints

Use the following UI contracts for a manual check or a future browser test:

| User action | Readiness gate | Selector / state |
| --- | --- | --- |
| Application loaded | Root is mounted and ready | `[data-testid="medical-checkup-app"][data-runtime-state="ready"]` |
| Start scan | Start control is visible and enabled | `[data-testid="start-diagnostic-scan"]` |
| Scan running | Progress panel is present | `[data-testid="scan-progress"]`; `data-runtime-state="scanning"` |
| Scan log inspection | Log output is mounted | `[data-testid="scan-log"]` |
| Report transition | Scan reaches 100%, then report mounts after the existing one-second transition | `[data-testid="diagnostic-report"]`; `data-runtime-state="report"` |
| Start over | Reset control is available | `[data-testid="reset-telemetry-rescan"]` |

Do not use fixed sleeps as a primary readiness strategy. Wait for the appropriate visible selector or state attribute. The scan intentionally takes approximately 12 seconds plus the one-second report transition, so an E2E timeout must allow for that designed duration.

## Evidence to collect within 15 minutes

1. Capture the browser console output and preserve entries beginning with `[aura-runtime]`.
2. Record the current URL, root `data-runtime-state`, and the visible test IDs in the table above.
3. Capture a screenshot showing the scan progress or report state.
4. If a browser automation run is used, retain its trace and screenshot according to that runner's artifact configuration; this repository does not configure those artifacts itself.
5. Include the last scan-log lines from `[data-testid="scan-log"]`.

Structured diagnostic events include an ISO timestamp, current URL, checkpoint label, scan progress where applicable, and selector/count context. They deliberately contain no credentials, tokens, or patient data.

## Troubleshooting decision trees

### The start button is missing

1. Check `[data-testid="medical-checkup-app"]`.
2. If it is absent, inspect Vite startup/build errors and verify the URL served by Vite.
3. If `data-runtime-state="report"`, use **Reset Telemetry & Rescan** first; the start control is intentionally replaced by the report.
4. If the root is `ready` but the control is absent, capture the console and screenshot before retrying.

### A click navigated to a 404 or unexpected page

The current application is a single client-side dashboard and does not intentionally navigate during scan interactions.

1. Record `window.location.href` and the browser history action that preceded it.
2. Verify the click targeted one of the documented `data-testid` selectors rather than a decorative element.
3. Review `[aura-runtime]` events for the last checkpoint.
4. Treat an unexpected route as an automation-targeting or hosting configuration issue; do not add retry loops that mask it.

### The scan does not reach the report

1. Confirm the root state is `scanning` and `[data-testid="scan-progress"]` is visible.
2. Verify progress is advancing and inspect `[data-testid="scan-log"]`.
3. Look for `scan.step.changed`, `scan.completion.queued`, and `scan.completed` in console output.
4. If progress remains unchanged, gather the console and screenshot. Do not refresh repeatedly; that destroys the current evidence.
5. If progress reaches 100%, wait for the documented one-second compilation transition and then wait for `[data-testid="diagnostic-report"]`.

### Hidden file input, upload, organization selection, or credentials are expected

These flows do not exist in the current application. A test or runbook referring to them targets a different runtime. Stop and confirm the intended repository before adding upload interaction, credential handling, or organization-selection retries.

## CI validation guidance

A future E2E job should start the Vite application non-interactively, wait for the root readiness selector, and follow the checkpoints above. On failure, publish the browser console, screenshot, trace (if configured by the runner), URL, root runtime state, and scan log excerpt. This provides actionable evidence without relying on a local rerun.
