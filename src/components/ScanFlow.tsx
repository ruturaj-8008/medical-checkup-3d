import React, { useEffect, useState, useRef } from 'react';
import { Scan, ShieldAlert, Cpu, Play } from 'lucide-react';

interface ScanFlowProps {
  isScanning: boolean;
  scanProgress: number;
  onStartScan: () => void;
  onCancelScan: () => void;
  onStepChange: (node: string | null) => void;
  onScanComplete: () => void;
}

interface ScanStep {
  id: string;
  name: string;
  nodeKey: string;
  range: [number, number]; // start/end percentage
  logs: string[];
}

export const ScanFlow: React.FC<ScanFlowProps> = ({
  isScanning,
  scanProgress,
  onStartScan,
  onCancelScan,
  onStepChange,
  onScanComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [logConsole, setLogConsole] = useState<string[]>(['[SYS] Biometric System initialized. Ready to scan...']);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const steps: ScanStep[] = [
    {
      id: 'step1',
      name: 'Cranial Cortex Scan',
      nodeKey: 'brain',
      range: [0, 25],
      logs: [
        'Calibrating neural sensors...',
        'Mapping EEG waves: Alpha & Beta check...',
        'Cognitive load: 38% (Normal)...',
        'Cranial scan complete. Node healthy.'
      ]
    },
    {
      id: 'step2',
      name: 'Cardio System Scan',
      nodeKey: 'heart',
      range: [25, 50],
      logs: [
        'Establishing cardiac pulse sync...',
        'Reading EKG metrics: ST segment check...',
        'Heart rate: 71 bpm... Rhythm: Regular...',
        'Cardiovascular diagnostics complete.'
      ]
    },
    {
      id: 'step3',
      name: 'Pulmonary Tract Scan',
      nodeKey: 'lungs',
      range: [50, 75],
      logs: [
        'Activating respiratory rhythm tracker...',
        'Assessing SpO2 level: 98% (Optimal)...',
        'Lung capacity evaluation: 4.8L...',
        'Pulmonary diagnostics complete.'
      ]
    },
    {
      id: 'step4',
      name: 'Metabolic Matrix Scan',
      nodeKey: 'abdomen',
      range: [75, 100],
      logs: [
        'Initiating gastro-abdominal ultrasound sweep...',
        'Calibrating metabolic index markers...',
        'Renal filtration rate: 104 ml/min (Optimal)...',
        'System diagnostic analysis completed.'
      ]
    }
  ];

  // Auto-scroll logs terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logConsole]);

  // Handle active nodes and logs during scan progression
  useEffect(() => {
    if (!isScanning) {
      setCurrentStepIndex(-1);
      return;
    }

    // Determine current step index based on scan progress (0-100)
    let newStepIdx = 0;
    if (scanProgress >= 25 && scanProgress < 50) newStepIdx = 1;
    else if (scanProgress >= 50 && scanProgress < 75) newStepIdx = 2;
    else if (scanProgress >= 75) newStepIdx = 3;

    if (newStepIdx !== currentStepIndex) {
      setCurrentStepIndex(newStepIdx);
      const step = steps[newStepIdx];
      
      // Update active 3D node callback
      onStepChange(step.nodeKey);
      
      // Post system announcement log
      setLogConsole(prev => [
        ...prev,
        `[SYS] Beginning ${step.name.toUpperCase()}...`
      ]);
    }

    // Periodically post incremental diagnostic logs within the active step
    const currentStep = steps[newStepIdx];
    if (currentStep) {
      const stepProgress = scanProgress - currentStep.range[0]; // progress in this step (0-25)
      const logIdx = Math.floor((stepProgress / 25) * currentStep.logs.length);
      
      const targetLog = currentStep.logs[logIdx];
      if (targetLog && !logConsole.includes(`[SCAN] ${targetLog}`)) {
        setLogConsole(prev => [...prev, `[SCAN] ${targetLog}`]);
      }
    }

    // Trigger complete
    if (scanProgress >= 100) {
      setLogConsole(prev => [...prev, '[SYS] ALL DIAGNOSTIC CHECKS COMPLETE. COMPILING REPORT...']);
      const timer = setTimeout(() => {
        onScanComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }

  }, [scanProgress, isScanning, currentStepIndex]);

  const handleStart = () => {
    setLogConsole(['[SYS] Core initialized.', '[SYS] Aligning 3D scanning lasers...']);
    onStartScan();
  };

  return (
    <section className="flex flex-col h-full gap-4 p-4" aria-labelledby="scan-flow-title">
      {/* HUD Header */}
      <div className="flex flex-col gap-1 border-b border-white/5 pb-3">
        <span className="text-[10px] text-cyan hud-font font-bold tracking-widest uppercase">
          // Diagnostic Controller
        </span>
        <h2 id="scan-flow-title" className="hud-title text-xl">Checkup Scanner</h2>
      </div>

      {/* Controller Body */}
      {!isScanning ? (
        // System Standby UI
        <div className="flex flex-col flex-1 gap-4 justify-between">
          <div className="flex flex-col gap-4">
            {/* System Status Banner */}
            <div className="glass-panel p-4 flex items-center gap-3 border-l-4 border-cyan bg-cyan/5">
              <div className="p-2 bg-cyan/10 rounded-lg text-cyan animate-pulse">
                <Cpu size={24} />
              </div>
              <div>
                <h4 className="hud-font text-xs font-bold text-cyan tracking-wider uppercase">System Status: Standby</h4>
                <p className="text-[10px] text-text-secondary leading-tight mt-0.5">3D Holographic lasers ready. Diagnostic nodes online.</p>
              </div>
            </div>

            {/* Checklist of Organs */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest px-1">Scan Sequence Breakdown</span>
              {steps.map((step, idx) => (
                <div key={step.id} className="glass-panel px-3 py-2 flex items-center justify-between hover:bg-white/[0.01]">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold hud-font text-cyan border border-cyan/30 px-1.5 py-0.5 rounded">
                      0{idx + 1}
                    </span>
                    <span className="text-xs font-medium text-text-primary">{step.name}</span>
                  </div>
                  <span className="text-[9px] font-bold text-text-secondary uppercase">
                    Ready
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Trigger */}
          <button
            type="button"
            onClick={handleStart}
            className="btn-neon btn-neon-cyan pulsing-hud-cyan py-4 font-bold text-sm w-full"
          >
            <Play size={16} />
            Initialize Diagnostic Scan
          </button>
        </div>
      ) : (
        // Scanning in Progress UI
        <div className="flex flex-col flex-1 gap-4 justify-between">
          <div className="flex flex-col gap-3">
            {/* Scanning Indicator Panel */}
            <div className="glass-panel p-4 flex flex-col gap-3 pulsing-hud-cyan bg-black/35 relative overflow-hidden">
              <div className="scan-line" />
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Scan size={18} className="text-cyan animate-spin" />
                  <span className="hud-font text-xs font-bold text-cyan uppercase tracking-wider">
                    SCANNING IN PROGRESS
                  </span>
                </div>
                <span className="hud-font text-xs font-bold text-magenta">
                  {Math.round(scanProgress)}%
                </span>
              </div>

              {/* Progress Slider Bar */}
                <div
                  className="w-full h-1.5 bg-white/5 border border-white/5 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-label="Diagnostic scan progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(scanProgress)}
                  aria-valuetext={`${Math.round(scanProgress)} percent complete`}
                >
                <div 
                  className="h-full bg-gradient-to-r from-cyan to-magenta transition-all duration-100" 
                  style={{ width: `${scanProgress}%` }}
                />
              </div>

              {/* Current Scan Target */}
              {currentStepIndex !== -1 && (
                <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-2 rounded text-[10px]">
                  <span className="text-text-secondary font-medium">Target:</span>
                  <span className="text-cyan font-bold uppercase hud-font">
                    {steps[currentStepIndex].name}
                  </span>
                </div>
              )}
            </div>

            {/* Diagnostic Console Terminal Output */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest px-1">Diagnostic Log Output</span>
              <div className="h-44 bg-black/60 border border-white/5 rounded-lg p-3 font-mono text-[9px] text-emerald leading-relaxed overflow-y-auto flex flex-col gap-1.5 shadow-inner" role="log" aria-label="Diagnostic log output" aria-live="polite" aria-relevant="additions">
                {logConsole.map((log, index) => {
                  const isSys = log.startsWith('[SYS]');
                  return (
                    <div key={index} className={isSys ? 'text-cyan font-semibold' : 'text-emerald/85'}>
                      {log}
                    </div>
                  );
                })}
                <div ref={terminalEndRef} />
              </div>
            </div>
          </div>

          {/* Cancel Action */}
          <button
            type="button"
            onClick={onCancelScan}
            className="btn-neon btn-neon-magenta py-3 font-semibold text-xs w-full"
          >
            <ShieldAlert size={14} />
            Abort Diagnostics
          </button>
        </div>
      )}
    </section>
  );
};
