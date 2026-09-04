# Runtime Maintenance Playbook

## Purpose and verified scope

This playbook covers the Aura-3D Medical Checkup Portal as implemented in this repository. It is a client-side Vite, React, TypeScript, and Three.js application.

The current repository has **no** Playwright configuration or E2E scripts, authentication or organization selection, credential files, upload controls, network streaming, approval/apply loop, screenshots, traces, or runtime-generated download artifacts. Consequently, the common failure modes listed for those systems cannot be diagnosed or fixed here until the corresponding automation or backend is added.

The production-like runtime concerns that are present are:

- scan timer lifecycle and completion transitions;
- React component cleanup;
- WebGL renderer, geometry, material, and texture disposal;
- browser-console observability for scan and canvas events.

## Run locally

From the `medical-checkup-3d` directory:

```bash
npm install
npm run dev
```

Open the local Vite URL printed by the command. The application is a browser-only simulation and needs no environment variables or credential file.

To produce the same optimized output used by CI:

```bash
npm run build
```

The project has no configured E2E command. Do not invent a Playwright command or expect test artifacts until an E2E suite is introduced.

## Evidence to gather first

Within 15 minutes of an incident:

1. Record the current browser URL and viewport size.
2. Open the browser developer console and preserve all JSON log lines emitted by the application.
3. Note the latest `event`, `timestamp`, and `phase` values.
4. For rendering issues, capture the browser's WebGL-related console warnings and whether the canvas was visible.
5. For scan issues, record the displayed percentage, current target, and whether the report appeared.

Runtime events intentionally contain operational metadata only. Do not add credentials, personal health details, tokens, or other sensitive values to logs.

### Key checkpoints

| Event | Meaning | Primary triage value |
| --- | --- | --- |
| `canvas.renderer_initialized` | A Three.js renderer was created. | Includes canvas dimensions and device pixel ratio. |
| `scan.start_requested` / `scan.started` | User initiated a new simulated scan. | Confirms scan lifecycle began and reports the prior progress. |
| `scan.step_changed` | The scan entered one of four phases. | Includes phase, step identifier, progress, and displayed-log count. |
| `scan.completion_scheduled` | Progress reached 100%; the one-second report transition was scheduled. | Confirms completion is bounded and idempotent. |
| `scan.completed` | The report view was requested. | Confirms the parent state transition occurred. |
| `scan.cancelled` / `scan.reset` | A user ended or cleared a scan. | Includes the state at the transition. |
| `canvas.renderer_disposed` | Canvas resources were released during unmount. | Useful for route/unmount and resource-leak investigations. |

Each event also includes `timestamp` and `url`, allowing CI or browser logs to be correlated without secrets.

## Troubleshooting decision trees

### Scan does not show a report

1. Is there a `scan.started` event?
   - **No:** verify that **Initialize Diagnostic Scan** was clicked and the scanner panel is visible.
   - **Yes:** continue.
2. Does progress reach 100% and emit `scan.completion_scheduled`?
   - **No:** capture the latest `scan.step_changed` event and UI percentage; investigate a browser timer pause or inactive tab.
   - **Yes:** continue.
3. Is `scan.completed` logged about one second later?
   - **No:** capture console errors occurring after `scan.completion_scheduled`.
   - **Yes:** the report state was requested; inspect React rendering errors and current URL.

### Canvas is blank or browser reports WebGL warnings

1. Is `canvas.renderer_initialized` present?
   - **No:** confirm the center panel has non-zero dimensions and inspect JavaScript errors before application mount.
   - **Yes:** check its `width`, `height`, and `pixelRatio`.
2. Did the issue follow repeated scan starts or navigation/unmount?
   - **Yes:** look for matching `canvas.renderer_disposed` events. The renderer is intentionally initialized once per mounted canvas and cleaned up on unmount.
   - **No:** collect GPU/browser version, console warnings, and a screenshot. This repository has no renderer fallback.

### A requested runtime-automation symptom is reported

- **Missing send button, streaming response, hidden file input, route 404 from a click, organization-selection differences, approvals, or uploads:** these features are not part of this application. Confirm the affected repository or branch before modifying this project.
- **“No E2E artifact” request:** no Playwright suite currently creates screenshots, traces, or downloads. Preserve browser-console output and screenshots manually until automation is added.

## Maintenance changes and CI validation

The current maintenance hardening is intentionally low risk:

- Scan progress is capped at 100 and interval cleanup occurs when scanning stops or the component unmounts.
- Completion scheduling is guarded so repeated renders cannot queue duplicate report transitions.
- WebGL scan state is read from refs, avoiding renderer recreation at each 100 ms progress update.
- Canvas cleanup cancels animation frames and disposes scene resources, including materials and textures.

Validate in CI with `npm run build`. For browser-level validation, run the app, start a scan, let it complete, start another scan, abort a scan, and inspect the ordered runtime events above. The expected behavior remains unchanged for users: a scan progresses over approximately twelve seconds and displays the report shortly after reaching 100%.
