import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DiagnosticReport } from '../components/DiagnosticReport';

describe('DiagnosticReport', () => {
  it('renders the composite score, detailed category scores, and clinical directives', () => {
    render(<DiagnosticReport onReset={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Health Assessment' })).toBeInTheDocument();
    expect(screen.getByText('93')).toBeInTheDocument();

    expect(screen.getByText('Neurological Index')).toBeInTheDocument();
    expect(screen.getByText('Cardio Efficiency')).toBeInTheDocument();
    expect(screen.getByText('Pulmonary Capacity')).toBeInTheDocument();
    expect(screen.getByText('Metabolic Balance')).toBeInTheDocument();

    expect(screen.getByText('96%')).toBeInTheDocument();
    expect(screen.getByText('89%')).toBeInTheDocument();
    expect(screen.getByText('94%')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();

    expect(screen.getByText(/Hydration Optimization:/)).toBeInTheDocument();
    expect(screen.getByText(/Cardio Recovery:/)).toBeInTheDocument();
    expect(screen.getByText(/Melatonin Regulation:/)).toBeInTheDocument();
  });

  it('invokes onReset when the telemetry reset action is selected', () => {
    const onReset = vi.fn();
    render(<DiagnosticReport onReset={onReset} />);

    fireEvent.click(screen.getByRole('button', { name: /Reset Telemetry & Rescan/i }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
