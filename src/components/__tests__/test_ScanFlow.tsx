import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ScanFlow } from '../ScanFlow';

describe('ScanFlow', () => {
  const onStartScan = vi.fn();
  const onCancelScan = vi.fn();
  const onStepChange = vi.fn();
  const onScanComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // JSDOM does not implement scrolling; the component's log effect relies on it.
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('starts a scan and resets the diagnostic console when initialized', () => {
    render(
      <ScanFlow
        isScanning={false}
        scanProgress={0}
        onStartScan={onStartScan}
        onCancelScan={onCancelScan}
        onStepChange={onStepChange}
        onScanComplete={onScanComplete}
      />,
    );

    expect(screen.getByText('System Status: Standby')).toBeInTheDocument();
    expect(screen.getByText('Cranial Cortex Scan')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /initialize diagnostic scan/i }));

    expect(onStartScan).toHaveBeenCalledTimes(1);
  });

  it('announces the current target and emits scan logs as progress crosses a step boundary', () => {
    const { rerender } = render(
      <ScanFlow
        isScanning
        scanProgress={0}
        onStartScan={onStartScan}
        onCancelScan={onCancelScan}
        onStepChange={onStepChange}
        onScanComplete={onScanComplete}
      />,
    );

    expect(onStepChange).toHaveBeenCalledWith('brain');
    expect(screen.getByText('Target:')).toBeInTheDocument();
    expect(screen.getByText('Cranial Cortex Scan')).toBeInTheDocument();
    expect(screen.getByText(/beginning cranial cortex scan/i)).toBeInTheDocument();
    expect(screen.getByText(/calibrating neural sensors/i)).toBeInTheDocument();

    rerender(
      <ScanFlow
        isScanning
        scanProgress={25}
        onStartScan={onStartScan}
        onCancelScan={onCancelScan}
        onStepChange={onStepChange}
        onScanComplete={onScanComplete}
      />,
    );

    expect(onStepChange).toHaveBeenLastCalledWith('heart');
    expect(screen.getByText('Cardio System Scan')).toBeInTheDocument();
    expect(screen.getByText(/establishing cardiac pulse sync/i)).toBeInTheDocument();
  });

  it('aborts an active diagnostic scan', () => {
    render(
      <ScanFlow
        isScanning
        scanProgress={42}
        onStartScan={onStartScan}
        onCancelScan={onCancelScan}
        onStepChange={onStepChange}
        onScanComplete={onScanComplete}
      />,
    );

    expect(screen.getByText('42%')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /abort diagnostics/i }));

    expect(onCancelScan).toHaveBeenCalledTimes(1);
  });

  it('completes the scan one second after progress reaches 100 percent', () => {
    render(
      <ScanFlow
        isScanning
        scanProgress={100}
        onStartScan={onStartScan}
        onCancelScan={onCancelScan}
        onStepChange={onStepChange}
        onScanComplete={onScanComplete}
      />,
    );

    expect(screen.getByText(/all diagnostic checks complete/i)).toBeInTheDocument();
    expect(onScanComplete).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onScanComplete).toHaveBeenCalledTimes(1);
  });
});
