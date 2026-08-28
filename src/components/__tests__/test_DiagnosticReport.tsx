import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { DiagnosticReport } from '../DiagnosticReport';

describe('DiagnosticReport', () => {
  it('renders the composite assessment, category scores, and health recommendations', () => {
    const onReset = vi.fn();
    const { container } = render(<DiagnosticReport onReset={onReset} />);

    expect(screen.getByRole('heading', { name: 'Health Assessment' })).toBeInTheDocument();
    expect(screen.getByText('Bio-Safety Rating')).toBeInTheDocument();
    expect(screen.getByText('93')).toBeInTheDocument();
    expect(screen.getByText('CLASS-A HEALTH STATUS')).toBeInTheDocument();

    expect(screen.getByText('Neurological Index')).toBeInTheDocument();
    expect(screen.getByText('Cardio Efficiency')).toBeInTheDocument();
    expect(screen.getByText('Pulmonary Capacity')).toBeInTheDocument();
    expect(screen.getByText('Metabolic Balance')).toBeInTheDocument();

    expect(screen.getByText('96%')).toBeInTheDocument();
    expect(screen.getByText('89%')).toBeInTheDocument();
    expect(screen.getByText('94%')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();

    expect(screen.getByText(/hydration optimization/i)).toBeInTheDocument();
    expect(screen.getByText(/cardio recovery/i)).toBeInTheDocument();
    expect(screen.getByText(/melatonin regulation/i)).toBeInTheDocument();

    // The foreground ring must represent a partially completed 93% score.
    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(2);
    expect(Number(circles[1].getAttribute('stroke-dashoffset'))).toBeGreaterThan(0);
  });

  it('requests a telemetry reset when the rescan action is selected', () => {
    const onReset = vi.fn();

    render(<DiagnosticReport onReset={onReset} />);

    fireEvent.click(screen.getByRole('button', { name: /reset telemetry & rescan/i }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
