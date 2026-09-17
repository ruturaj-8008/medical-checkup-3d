import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiagnosticReport } from '../DiagnosticReport';

afterEach(() => {
  cleanup();
});

describe('DiagnosticReport', () => {
  it('renders the composite score, all parameter scores, and directives', () => {
    render(<DiagnosticReport onReset={vi.fn()} />);

    expect(screen.getByText('Health Assessment')).toBeInTheDocument();
    expect(screen.getByText('Bio-Safety Rating')).toBeInTheDocument();
    expect(screen.getByText('CLASS-A HEALTH STATUS')).toBeInTheDocument();
    expect(screen.getByText('93')).toBeInTheDocument();

    expect(screen.getByText('Neurological Index')).toBeInTheDocument();
    expect(screen.getByText('Cardio Efficiency')).toBeInTheDocument();
    expect(screen.getByText('Pulmonary Capacity')).toBeInTheDocument();
    expect(screen.getByText('Metabolic Balance')).toBeInTheDocument();

    expect(screen.getByText('96%')).toBeInTheDocument();
    expect(screen.getByText('89%')).toBeInTheDocument();
    expect(screen.getByText('94%')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('Hydration Optimization:')).toBeInTheDocument();
  });

  it('invokes the supplied reset callback when rescan is requested', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    render(<DiagnosticReport onReset={onReset} />);

    await user.click(
      screen.getByRole('button', { name: /reset telemetry & rescan/i }),
    );

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
