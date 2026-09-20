import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScanFlow } from '../components/ScanFlow';

interface RenderOptions {
  isScanning?: boolean;
  scanProgress?: number;
}

const renderScanFlow = ({
  isScanning = false,
  scanProgress = 0,
}: RenderOptions = {}) => {
  const callbacks = {
    onStartScan: vi.fn(),
    onCancelScan: vi.fn(),
    onStepChange: vi.fn(),
    onScanComplete: vi.fn(),
  };

  render(
    <ScanFlow
      isScanning={isScanning}
      scanProgress={scanProgress}
      {...callbacks}
    />,
  );

  return callbacks;
};

afterEach(() => {
  vi.useRealTimers();
});

describe('ScanFlow', () => {
  it('renders the standby sequence and initializes a scan with reset console output', () => {
    const { onStartScan } = renderScanFlow();

    expect(screen.getByText('System Status: Standby')).toBeInTheDocument();
    expect(screen.getByText('Cranial Cortex Scan')).toBeInTheDocument();
    expect(screen.getByText('Cardio System Scan')).toBeInTheDocument();
    expect(screen.getByText('Pulmonary Tract Scan')).toBeInTheDocument();
    expect(screen.getByText('Metabolic Matrix Scan')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Initialize Diagnostic Scan/i }));

    expect(onStartScan).toHaveBeenCalledTimes(1);
  });

  it.each([
    [0, 'brain', 'Cranial Cortex Scan'],
    [25, 'heart', 'Cardio System Scan'],
    [50, 'lungs', 'Pulmonary Tract Scan'],
    [75, 'abdomen', 'Metabolic Matrix Scan'],
  ])(
    'maps %i%% scan progress to the %s node',
    (scanProgress, expectedNode, expectedTarget) => {
      const { onStepChange } = renderScanFlow({ isScanning: true, scanProgress });

      expect(screen.getByText('SCANNING IN PROGRESS')).toBeInTheDocument();
      expect(screen.getByText(expectedTarget)).toBeInTheDocument();
      expect(onStepChange).toHaveBeenCalledWith(expectedNode);
    },
  );

  it('calls the cancellation callback from the in-progress view', () => {
    const { onCancelScan } = renderScanFlow({ isScanning: true, scanProgress: 40 });

    fireEvent.click(screen.getByRole('button', { name: /Abort Diagnostics/i }));

    expect(onCancelScan).toHaveBeenCalledTimes(1);
  });

  it('compiles the report one second after diagnostics reach 100 percent', () => {
    vi.useFakeTimers();
    const { onScanComplete } = renderScanFlow({ isScanning: true, scanProgress: 100 });

    expect(
      screen.getByText('[SYS] ALL DIAGNOSTIC CHECKS COMPLETE. COMPILING REPORT...'),
    ).toBeInTheDocument();

    vi.advanceTimersByTime(999);
    expect(onScanComplete).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onScanComplete).toHaveBeenCalledTimes(1);
  });
});
