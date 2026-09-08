import { useEffect, useState } from 'react';
import { Activity, BrainCircuit, Clock3, Database, ShieldCheck } from 'lucide-react';
import { MedicalCanvas } from './components/MedicalCanvas';
import { VitalsPanel } from './components/VitalsPanel';
import { ScanFlow } from './components/ScanFlow';
import { DiagnosticReport } from './components/DiagnosticReport';

function App() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const date = now.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });
      const time = now.toLocaleTimeString('en-US', { hour12: false });
      setCurrentTime(`${date} · ${time}`);
    };

    updateTime();
    const interval = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isScanning) {
      return;
    }

    const duration = 12000;
    const intervalTime = 100;
    const step = 100 / (duration / intervalTime);

    const timer = window.setInterval(() => {
      setScanProgress((progress) => {
        if (progress >= 100) {
          window.clearInterval(timer);
          return 100;
        }

        return Math.min(progress + step, 100);
      });
    }, intervalTime);

    return () => window.clearInterval(timer);
  }, [isScanning]);

  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setShowReport(false);
  };

  const handleCancelScan = () => {
    setIsScanning(false);
    setScanProgress(0);
    setActiveNode(null);
  };

  const handleScanComplete = () => {
    setIsScanning(false);
    setShowReport(true);
    setActiveNode(null);
  };

  const handleReset = () => {
    setShowReport(false);
    setScanProgress(0);
    setActiveNode(null);
  };

  const handleSelectNode = (node: string) => {
    if (!isScanning) {
      setActiveNode((previousNode) => (previousNode === node ? null : node));
    }
  };

  return (
    <div className="app-container">
      <header className="dashboard-header">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true">
            <BrainCircuit size={21} />
          </div>
          <div className="brand-copy">
            <span className="brand-label">Precision health workspace</span>
            <span className="brand-title">AURA / 3D Diagnostics</span>
          </div>
        </div>

        <div className="header-status" aria-label="System status">
          <span className="status-item">
            <ShieldCheck size={14} />
            Secure session
          </span>
          <span className="status-item">
            <Activity size={14} />
            Live telemetry
          </span>
          <span className="status-item">
            <Database size={14} />
            Local profile
          </span>
        </div>

        <div className="header-actions">
          <div className="header-clock" aria-live="polite">
            <Clock3 size={14} />
            {currentTime || 'Synchronizing'}
          </div>
        </div>
      </header>

      <aside className="dashboard-panel dashboard-panel--left" aria-label="Live biometric telemetry">
        <VitalsPanel />
      </aside>

      <main className="dashboard-main" aria-label="Interactive diagnostic visualization">
        <MedicalCanvas
          activeNode={activeNode}
          onSelectNode={handleSelectNode}
          scanProgress={scanProgress}
          isScanning={isScanning}
        />
      </main>

      <aside className="dashboard-panel dashboard-panel--right" aria-label="Diagnostic scan controls">
        {showReport ? (
          <DiagnosticReport onReset={handleReset} />
        ) : (
          <ScanFlow
            isScanning={isScanning}
            scanProgress={scanProgress}
            onStartScan={handleStartScan}
            onCancelScan={handleCancelScan}
            onStepChange={setActiveNode}
            onScanComplete={handleScanComplete}
          />
        )}
      </aside>
    </div>
  );
}

export default App;
