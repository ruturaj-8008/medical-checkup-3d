import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ScanFlow } from '../ScanFlow';

describe('ScanFlow', () => {
  const onStartScan = vi.fn();
  const onCancelScan = vi.fn();
  const onStepChange = vi.fn();
  const onScanComplete = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('scrollIntoView', vi.fn());
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function renderScanFlow(isScanning = false, scanProgress = 0) {
    return render(
      <ScanFlow
        isScanning={isScanning}
        scanProgress={scanProgress}
        onStartScan={onStartScan}
        onCancelScan={onCancelScan}
        onStepChange={onStepChange}
        onScanComplete={onScanComplete}
      />,
    );
  }

  it('renders the standby scan sequence and starts a scan with reset logs', () => {
    renderScanFlow();

    expect(screen.getByText('System Status: Standby')).toBeInTheDocument();
    expect(screen.getByText('Cranial Cortex Scan')).toBeInTheDocument();
    expect(screen.getByText('Cardio System Scan')).toBeInTheDocument();
    expect(screen.getByText('Pulmonary Tract Scan')).toBeInTheDocument();
    expect(screen.getByText('Metabolic Matrix Scan')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /initialize diagnostic scan/i }));

    expect(onStartScan).toHaveBeenCalledTimes(1);
  });

  it.each([
    [0, 'brain', 'Cranial Cortex Scan'],
    [25, 'heart', 'Cardio System Scan'],
    [50, 'lungs', 'Pulmonary Tract Scan'],
    [75, 'abdomen', 'Metabolic Matrix Scan'],
  ])(
    'activates the correct node at %i percent progress',
    (scanProgress, expectedNode, expectedStepName) => {
      renderScanFlow(true, scanProgress);

      expect(onStepChange).toHaveBeenCalledWith(expectedNode);
      expect(screen.getByText(expectedStepName)).toBeInTheDocument();
      expect(
        screen.getByText(`[SYS] Beginning ${expectedStepName.toUpperCase()}...`),
      ).toBeInTheDocument();
    },
  );

  it('shows rounded progress and delegates abort requests', () => {
    renderScanFlow(true, 42.6);

    expect(screen.getByText('43%')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /abort diagnostics/i }));

    expect(onCancelScan).toHaveBeenCalledTimes(1);
  });

  it('announces completion and waits one second before completing the scan', () => {
    renderScanFlow(true, 100);

    expect(
      screen.getByText('[SYS] ALL DIAGNOSTIC CHECKS COMPLETE. COMPILING REPORT...'),
    ).toBeInTheDocument();
    expect(onScanComplete).not.toHaveBeenCalled();

    vi.advanceTimersByTime(999);
    expect(onScanComplete).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onScanComplete).toHaveBeenCalledTimes(1);
  });
});
