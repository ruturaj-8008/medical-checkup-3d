import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ScanFlow } from '../ScanFlow'

interface ScanFlowTestProps {
  isScanning?: boolean
  scanProgress?: number
}

const renderScanFlow = ({
  isScanning = false,
  scanProgress = 0,
}: ScanFlowTestProps = {}) => {
  const callbacks = {
    onStartScan: vi.fn(),
    onCancelScan: vi.fn(),
    onStepChange: vi.fn(),
    onScanComplete: vi.fn(),
  }

  const view = render(
    <ScanFlow
      isScanning={isScanning}
      scanProgress={scanProgress}
      {...callbacks}
    />,
  )

  return { ...view, callbacks }
}

describe('ScanFlow', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders the standby scan sequence and starts a scan when requested', () => {
    const { callbacks } = renderScanFlow()

    expect(screen.getByText('System Status: Standby')).toBeInTheDocument()
    expect(screen.getByText('Cranial Cortex Scan')).toBeInTheDocument()
    expect(screen.getByText('Cardio System Scan')).toBeInTheDocument()
    expect(screen.getByText('Pulmonary Tract Scan')).toBeInTheDocument()
    expect(screen.getByText('Metabolic Matrix Scan')).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: /initialize diagnostic scan/i }),
    )

    expect(callbacks.onStartScan).toHaveBeenCalledTimes(1)
    expect(callbacks.onCancelScan).not.toHaveBeenCalled()
  })

  it.each([
    {
      progress: 0,
      node: 'brain',
      target: 'Cranial Cortex Scan',
      diagnosticLog: 'Calibrating neural sensors...',
    },
    {
      progress: 25,
      node: 'heart',
      target: 'Cardio System Scan',
      diagnosticLog: 'Establishing cardiac pulse sync...',
    },
    {
      progress: 50,
      node: 'lungs',
      target: 'Pulmonary Tract Scan',
      diagnosticLog: 'Activating respiratory rhythm tracker...',
    },
    {
      progress: 75,
      node: 'abdomen',
      target: 'Metabolic Matrix Scan',
      diagnosticLog: 'Initiating gastro-abdominal ultrasound sweep...',
    },
  ])(
    'selects the $node diagnostic node at $progress% progress',
    ({ progress, node, target, diagnosticLog }) => {
      const { callbacks } = renderScanFlow({
        isScanning: true,
        scanProgress: progress,
      })

      expect(callbacks.onStepChange).toHaveBeenCalledWith(node)
      expect(screen.getByText(target)).toBeInTheDocument()
      expect(screen.getByText(diagnosticLog)).toBeInTheDocument()
      expect(screen.getByText(`${progress}%`)).toBeInTheDocument()
    },
  )

  it('changes the active target when scan progress crosses a stage threshold', () => {
    const { callbacks, rerender } = renderScanFlow({
      isScanning: true,
      scanProgress: 24,
    })

    expect(callbacks.onStepChange).toHaveBeenLastCalledWith('brain')

    rerender(
      <ScanFlow
        isScanning
        scanProgress={25}
        onStartScan={callbacks.onStartScan}
        onCancelScan={callbacks.onCancelScan}
        onStepChange={callbacks.onStepChange}
        onScanComplete={callbacks.onScanComplete}
      />,
    )

    expect(callbacks.onStepChange).toHaveBeenLastCalledWith('heart')
    expect(screen.getByText('Cardio System Scan')).toBeInTheDocument()
  })

  it('calls the cancellation callback when diagnostics are aborted', () => {
    const { callbacks } = renderScanFlow({
      isScanning: true,
      scanProgress: 40,
    })

    fireEvent.click(screen.getByRole('button', { name: /abort diagnostics/i }))

    expect(callbacks.onCancelScan).toHaveBeenCalledTimes(1)
    expect(callbacks.onScanComplete).not.toHaveBeenCalled()
  })

  it('logs scan completion and completes diagnostics after the report delay', () => {
    vi.useFakeTimers()

    const { callbacks } = renderScanFlow({
      isScanning: true,
      scanProgress: 100,
    })

    expect(
      screen.getByText(
        '[SYS] ALL DIAGNOSTIC CHECKS COMPLETE. COMPILING REPORT...',
      ),
    ).toBeInTheDocument()
    expect(callbacks.onScanComplete).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1_000)
    })

    expect(callbacks.onScanComplete).toHaveBeenCalledTimes(1)
  })
})
