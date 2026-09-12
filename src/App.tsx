import { useEffect, useState } from 'react';
import {
  Activity,
  Bell,
  Cpu,
  Database,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react';
import { DiagnosticReport } from './components/DiagnosticReport';
import { MedicalCanvas } from './components/MedicalCanvas';
import { ScanFlow } from './components/ScanFlow';
import { VitalsPanel } from './components/VitalsPanel';
import './App.css';

/** Formats the live status timestamp shown in the dashboard header. */
function getStatusTime(): string {
  const now = new Date();
  const date = now
    .toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    })
    .toUpperCase();

  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return `${date} · ${time}`;
}

// PUBLIC_INTERFACE
function App() {
  /** Renders the interactive diagnostic dashboard and manages the scan lifecycle. */
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [currentTime, setCurrentTime] = useState(getStatusTime);
  const [isVitalsOpen, setIsVitalsOpen] = useState(false);
  const [isControlOpen, setIsControlOpen] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(getStatusTime());
    }, 1_000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isScanning) {
      return undefined;
    }

    const scanDurationMilliseconds = 12_000;
    const tickMilliseconds = 100;
    const step = 100 / (scanDurationMilliseconds / tickMilliseconds);

    const timer = window.setInterval(() => {
      setScanProgress((progress) => Math.min(progress + step, 100));
    }, tickMilliseconds);

    return () => window.clearInterval(timer);
  }, [isScanning]);

  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setShowReport(false);
    setIsControlOpen(false);
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
      setActiveNode((currentNode) => (currentNode === node ? null : node));
    }
  };

  return (
    <div className="app-shell">
      <header className="dashboard-header">
        <div className="brand-lockup">
          <button
            type="button"
            className="mobile-menu-button"
            aria-label={isVitalsOpen ? 'Close telemetry panel' : 'Open telemetry panel'}
            aria-expanded={isVitalsOpen}
            onClick={() => setIsVitalsOpen((open) => !open)}
          >
            {isVitalsOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="brand-mark" aria-hidden="true">
            <Activity size={19} />
          </div>

          <div>
            <div className="brand-title-row">
              <h1>AURA</h1>
              <span className="version-chip">3D</span>
            </div>
            <p>Clinical intelligence workspace</p>
          </div>
        </div>

        <div className="header-statuses" aria-label="System status">
          <span className="header-status status-secure">
            <ShieldCheck size={14} />
            Secure link
          </span>
          <span className="header-status status-active">
            <Cpu size={14} />
            AI core active
          </span>
          <span className="header-status status-muted">
            <Database size={14} />
            Local session
          </span>
        </div>

        <div className="header-actions">
          <div className="live-clock" aria-label={`Current time: ${currentTime}`}>
            <span className="live-indicator" />
            {currentTime}
          </div>
          <button type="button" className="notification-button" aria-label="Notifications">
            <Bell size={17} />
            <span aria-hidden="true" />
          </button>
          <button
            type="button"
            className="control-menu-button"
            aria-label={isControlOpen ? 'Close diagnostic controls' : 'Open diagnostic controls'}
            aria-expanded={isControlOpen}
            onClick={() => setIsControlOpen((open) => !open)}
          >
            {isControlOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      <aside className={`dashboard-panel telemetry-panel ${isVitalsOpen ? 'is-open' : ''}`}>
        <VitalsPanel />
      </aside>

      <main className="workspace">
        <div className="workspace-heading">
          <div>
            <span className="eyebrow">Live diagnostic environment</span>
            <h2>Biometric visualization</h2>
          </div>
          <div className={`scan-status ${isScanning ? 'is-scanning' : ''}`}>
            <span />
            {isScanning ? `Scanning ${Math.round(scanProgress)}%` : 'System ready'}
          </div>
        </div>

        <section className="visualization-card" aria-label="Interactive biometric visualization">
          <MedicalCanvas
            activeNode={activeNode}
            isScanning={isScanning}
            scanProgress={scanProgress}
            onSelectNode={handleSelectNode}
          />
        </section>

        <div className="workspace-footer">
          <span>Hover or select a biometric node to inspect it</span>
          <span>{isScanning ? 'Automated sequence in progress' : 'Manual node selection enabled'}</span>
        </div>
      </main>

      <aside className={`dashboard-panel control-panel ${isControlOpen ? 'is-open' : ''}`}>
        {showReport ? (
          <DiagnosticReport onReset={handleReset} />
        ) : (
          <ScanFlow
            isScanning={isScanning}
            scanProgress={scanProgress}
            onCancelScan={handleCancelScan}
            onScanComplete={handleScanComplete}
            onStartScan={handleStartScan}
            onStepChange={setActiveNode}
          />
        )}
      </aside>
    </div>
  );
}

export default App;
