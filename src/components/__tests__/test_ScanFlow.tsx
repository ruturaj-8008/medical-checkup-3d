import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScanFlow } from '../ScanFlow';

describe('ScanFlow', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('starts a scan and replaces the standby console entries', () => {
    const onStartScan = vi.fn();

    const { rerender } = render(
      <ScanFlow
        isScanning={false}
        scanProgress={0}
        onStartScan={onStartScan}
        onCancelScan={vi.fn()}
        onStepChange={vi.fn()}
        onScanComplete={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /initialize diagnostic scan/i }));

    expect(onStartScan).toHaveBeenCalledTimes(1);

    rerender(
      <ScanFlow
        isScanning
        scanProgress={0}
        onStartScan={onStartScan}
        onCancelScan={vi.fn()}
        onStepChange={vi.fn()}
        onScanComplete={vi.fn()}
      />,
    );

    expect(screen.getByText('[SYS] Core initialized.')).toBeInTheDocument();
    expect(screen.getByText('[SYS] Aligning 3D scanning lasers...')).toBeInTheDocument();
  });

  it.each([
    [0, 'brain', 'Cranial Cortex Scan'],
    [25, 'heart', 'Cardio System Scan'],
    [50, 'lungs', 'Pulmonary Tract Scan'],
    [75, 'abdomen', 'Metabolic Matrix Scan'],
  ])(
    'selects the %s%% scan target and reports its active node',
    (scanProgress, expectedNode, expectedTarget) => {
      const onStepChange = vi.fn();

      render(
        <ScanFlow
          isScanning
          scanProgress={scanProgress}
          onStartScan={vi.fn()}
          onCancelScan={vi.fn()}
          onStepChange={onStepChange}
          onScanComplete={vi.fn()}
        />,
      );

      expect(onStepChange).toHaveBeenCalledWith(expectedNode);
      expect(screen.getByText(expectedTarget)).toBeInTheDocument();
    },
  );

  it('delays completion notification until report compilation finishes', () => {
    vi.useFakeTimers();
    const onScanComplete = vi.fn();

    render(
      <ScanFlow
        isScanning
        scanProgress={100}
        onStartScan={vi.fn()}
        onCancelScan={vi.fn()}
        onStepChange={vi.fn()}
        onScanComplete={onScanComplete}
      />,
    );

    expect(
      screen.getByText('[SYS] ALL DIAGNOSTIC CHECKS COMPLETE. COMPILING REPORT...'),
    ).toBeInTheDocument();
    expect(onScanComplete).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(onScanComplete).toHaveBeenCalledTimes(1);
  });

  it('forwards an abort request while scanning', () => {
    const onCancelScan = vi.fn();

    render(
      <ScanFlow
        isScanning
        scanProgress={42}
        onStartScan={vi.fn()}
        onCancelScan={onCancelScan}
        onStepChange={vi.fn()}
        onScanComplete={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /abort diagnostics/i }));

    expect(onCancelScan).toHaveBeenCalledTimes(1);
  });
});
