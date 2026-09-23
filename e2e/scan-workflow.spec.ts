import { expect, test, type Page } from '@playwright/test';

/**
 * Logs concise, actionable page state before an assertion or action can fail.
 * The output is safe for CI because it contains route and UI metadata only.
 */
async function logPageDiagnostics(page: Page, checkpoint: string): Promise<void> {
  const [title, startCount, abortCount, progressCount, progressValue] = await Promise.all([
    page.title(),
    page.getByTestId('start-diagnostic-scan').count(),
    page.getByTestId('abort-diagnostics').count(),
    page.getByTestId('scan-progress').count(),
    page.getByTestId('scan-progress').getAttribute('aria-valuenow').catch(() => null),
  ]);

  console.info(JSON.stringify({
    checkpoint,
    timestamp: new Date().toISOString(),
    url: page.url(),
    title,
    selectors: {
      startDiagnosticScan: startCount,
      abortDiagnostics: abortCount,
      scanProgress: progressCount,
    },
    scanProgress: progressValue,
  }));
}

test('scan can be cancelled and then completed into a report', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Checkup Scanner' })).toBeVisible();
  await logPageDiagnostics(page, 'scanner-ready');

  const startScan = page.getByTestId('start-diagnostic-scan');
  await expect(startScan).toBeEnabled();
  await startScan.click();

  const progress = page.getByTestId('scan-progress');
  await expect(progress).toBeVisible();
  await expect(progress).toHaveAttribute('aria-valuenow', /[1-9]\d*/);
  await logPageDiagnostics(page, 'scan-started');

  await page.getByTestId('abort-diagnostics').click();
  await expect(startScan).toBeVisible();
  await expect(progress).toHaveCount(0);
  await logPageDiagnostics(page, 'scan-cancelled');

  await startScan.click();
  await expect(progress).toHaveAttribute('aria-valuenow', '100', { timeout: 18_000 });
  await expect(page.getByRole('heading', { name: 'Health Assessment' })).toBeVisible({
    timeout: 5_000,
  });
  await logPageDiagnostics(page, 'report-ready');

  await page.getByTestId('reset-telemetry').click();
  await expect(page.getByRole('heading', { name: 'Checkup Scanner' })).toBeVisible();
});
