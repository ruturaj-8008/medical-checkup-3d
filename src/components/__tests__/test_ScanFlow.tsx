import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScanFlow } from '../ScanFlow';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('ScanFlow', () => {
  const createProps = (overrides = {}) => ({
    isScanning: false,
    scanProgress: 0,
    onStartScan: vi.fn(),
    onCancelScan: vi.fn(),
    onStepChange: vi.fn(),
    onScanComplete: vi.fn(),
    ...overrides,
  });

  it('renders the standby sequence and starts a scan after user confirmation', async () => {
    const user = userEvent.setup();
    const props = createProps();

    render(<ScanFlow {...props} />);

    expect(screen.getByText('System Status: Standby')).toBeInTheDocument();
    expect(screen.getByText('Cranial Cortex Scan')).toBeInTheDocument();
    expect(screen.getByText('Cardio System Scan')).toBeInTheDocument();
    expect(screen.getByText('Pulmonary Tract Scan')).toBeInTheDocument();
    expect(screen.getByText('Metabolic Matrix Scan')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /initialize diagnostic scan/i }),
    );

    expect(props.onStartScan).toHaveBeenCalledTimes(1);
  });

  it('shows the current scan target, emits its node key, and records step logs', () => {
    const props = createProps({
      isScanning: true,
      scanProgress: 50,
    });

    render(<ScanFlow {...props} />);

    expect(props.onStepChange).toHaveBeenCalledWith('lungs');
    expect(screen.getByText('SCANNING IN PROGRESS')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Pulmonary Tract Scan')).toBeInTheDocument();
    expect(
      screen.getByText('[SYS] Beginning PULMONARY TRACT SCAN...'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('[SCAN] Activating respiratory rhythm tracker...'),
    ).toBeInTheDocument();
  });

  it('cancels an active scan when the abort control is selected', async () => {
    const user = userEvent.setup();
    const props = createProps({
      isScanning: true,
      scanProgress: 25,
    });

    render(<ScanFlow {...props} />);

    await user.click(
      screen.getByRole('button', { name: /abort diagnostics/i }),
    );

    expect(props.onCancelScan).toHaveBeenCalledTimes(1);
  });

  it('completes the scan one second after progress reaches 100 percent', () => {
    vi.useFakeTimers();
    const props = createProps({
      isScanning: true,
      scanProgress: 100,
    });

    render(<ScanFlow {...props} />);

    expect(
      screen.getByText(
        '[SYS] ALL DIAGNOSTIC CHECKS COMPLETE. COMPILING REPORT...',
      ),
    ).toBeInTheDocument();
    expect(props.onScanComplete).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1_000);

    expect(props.onScanComplete).toHaveBeenCalledTimes(1);
  });
});
