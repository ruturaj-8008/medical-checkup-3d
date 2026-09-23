import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DiagnosticReport } from '../DiagnosticReport';

describe('DiagnosticReport', () => {
  afterEach(cleanup);

  it('renders the overall rating, detailed scores, and actionable directives', () => {
    render(<DiagnosticReport onReset={vi.fn()} />);

    expect(screen.getByText('Bio-Safety Rating')).toBeInTheDocument();
    expect(screen.getByText('CLASS-A HEALTH STATUS')).toBeInTheDocument();
    expect(screen.getByText('93')).toBeInTheDocument();

    expect(screen.getByText('Neurological Index')).toBeInTheDocument();
    expect(screen.getByText('Cardio Efficiency')).toBeInTheDocument();
    expect(screen.getByText('Pulmonary Capacity')).toBeInTheDocument();
    expect(screen.getByText('Metabolic Balance')).toBeInTheDocument();

    expect(screen.getByText('Hydration Optimization:')).toBeInTheDocument();
    expect(screen.getByText('Cardio Recovery:')).toBeInTheDocument();
    expect(screen.getByText('Melatonin Regulation:')).toBeInTheDocument();
  });

  it('calculates the foreground score-ring offset from the 93 percent score', () => {
    const { container } = render(<DiagnosticReport onReset={vi.fn()} />);
    const circles = container.querySelectorAll('circle');

    const foregroundRing = circles[1];
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const expectedOffset = circumference - 0.93 * circumference;

    expect(foregroundRing).toHaveAttribute('stroke-dasharray', `${circumference}`);
    expect(foregroundRing).toHaveAttribute('stroke-dashoffset', `${expectedOffset}`);
  });

  it('calls onReset when the user starts a new telemetry scan', () => {
    const onReset = vi.fn();

    render(<DiagnosticReport onReset={onReset} />);

    fireEvent.click(screen.getByRole('button', { name: /reset telemetry & rescan/i }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
