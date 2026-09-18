import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ScanFlow } from '../ScanFlow';

describe('ScanFlow', () => {
  const onStartScan = vi.fn();
  const onCancelScan = vi.fn();
  const onStepChange = vi.fn();
  const onScanComplete = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'scrollIntoView',
      vi.fn(),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  const renderScanFlow = (
    isScanning = false,
    scanProgress = 0,
  ) =>
    render(
      <ScanFlow
        isScanning={isScanning}
        scanProgress={scanProgress}
        onStartScan={onStartScan}
        onCancelScan={onCancelScan}
        onStepChange={onStepChange}
        onScanComplete={onScanComplete}
      />,
    );

  it('renders the standby checklist and begins a scan on request', () => {
    renderScanFlow();

    expect(screen.getByText('System Status: Standby')).toBeTruthy();
    expect(screen.getByText('Cranial Cortex Scan')).toBeTruthy();
    expect(screen.getByText('Cardio System Scan')).toBeTruthy();
    expect(screen.getByText('Pulmonary Tract Scan')).toBeTruthy();
    expect(screen.getByText('Metabolic Matrix Scan')).toBeTruthy();

    fireEvent.click(
      screen.getByRole('button', { name: /initialize diagnostic scan/i }),
    );

    expect(onStartScan).toHaveBeenCalledTimes(1);
  });

  it('selects the matching node and writes diagnostic logs for active progress', () => {
    renderScanFlow(true, 50);

    expect(screen.getByText('SCANNING IN PROGRESS')).toBeTruthy();
    expect(screen.getByText('50%')).toBeTruthy();
    expect(screen.getByText('Target:')).toBeTruthy();
    expect(screen.getByText('Pulmonary Tract Scan')).toBeTruthy();
    expect(
      screen.getByText('[SYS] Beginning PULMONARY TRACT SCAN...'),
    ).toBeTruthy();
    expect(
      screen.getByText('[SCAN] Activating respiratory rhythm tracker...'),
    ).toBeTruthy();
    expect(onStepChange).toHaveBeenCalledWith('lungs');
  });

  it('requests cancellation from the active scan interface', () => {
    renderScanFlow(true, 25);

    fireEvent.click(
      screen.getByRole('button', { name: /abort diagnostics/i }),
    );

    expect(onCancelScan).toHaveBeenCalledTimes(1);
  });

  it('completes the scan after the report compilation delay at 100 percent', () => {
    renderScanFlow(true, 100);

    expect(
      screen.getByText(
        '[SYS] ALL DIAGNOSTIC CHECKS COMPLETE. COMPILING REPORT...',
      ),
    ).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onScanComplete).toHaveBeenCalledTimes(1);
  });
});
