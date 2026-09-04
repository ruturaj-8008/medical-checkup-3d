import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DiagnosticReport } from '../DiagnosticReport';

describe('DiagnosticReport', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the overall assessment and every detailed parameter score', () => {
    render(<DiagnosticReport onReset={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Health Assessment' })).toBeInTheDocument();
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
  });

  it('renders actionable health directives', () => {
    render(<DiagnosticReport onReset={vi.fn()} />);

    expect(screen.getByText('Hydration Optimization:')).toBeInTheDocument();
    expect(screen.getByText('Cardio Recovery:')).toBeInTheDocument();
    expect(screen.getByText('Melatonin Regulation:')).toBeInTheDocument();
  });

  it('calls onReset when the rescan action is selected', () => {
    const onReset = vi.fn();
    render(<DiagnosticReport onReset={onReset} />);

    fireEvent.click(screen.getByRole('button', { name: /reset telemetry & rescan/i }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
