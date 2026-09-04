import { useState, useEffect } from 'react';
import { MedicalCanvas } from './components/MedicalCanvas';
import { VitalsPanel } from './components/VitalsPanel';
import { ScanFlow } from './components/ScanFlow';
import { DiagnosticReport } from './components/DiagnosticReport';
import { Activity, Cpu, Database, ShieldCheck } from 'lucide-react';

function App() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [showReport, setShowReport] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // 1. Digital HUD clock updating every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
      const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');
      setCurrentTime(`${dateStr} // ${timeStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Scan progress simulator
  useEffect(() => {
    let timer: number;
    if (isScanning) {
      const duration = 12000; // 12 seconds checkup scan
      const intervalTime = 100;
      const step = (100 / (duration / intervalTime));

      timer = window.setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + step;
        });
      }, intervalTime);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
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
    if (isScanning) return; // ignore during scanning sequence
    setActiveNode(prev => (prev === node ? null : node));
  };

  return (
    <div className="app-container">
      <header className="dashboard-header">
        <div className="brand-cluster">
          <div className="brand-mark" aria-hidden="true">
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div className="brand-title-row">
              <h1 className="brand-title">AURA</h1>
              <span className="version-badge">3D</span>
            </div>
            <p className="brand-subtitle">Advanced wellness intelligence</p>
          </div>
        </div>

        <div className="system-statuses" aria-label="System status">
          <div className="system-status secure-status">
            <ShieldCheck size={14} aria-hidden="true" />
            <span>Secure session</span>
          </div>
          <div className="system-status core-status">
            <Cpu size={14} aria-hidden="true" />
            <span>Analysis engine active</span>
          </div>
          <div className="system-status storage-status">
            <Database size={14} aria-hidden="true" />
            <span>Private workspace</span>
          </div>
        </div>

        <div className="session-clock">
          <span className="session-clock-label">Local time</span>
          <span className="session-clock-value">
            {currentTime || 'LOADING...'}
          </span>
        </div>
      </header>

      <aside className="dashboard-sidebar telemetry-sidebar" aria-label="Live vital signs">
        <VitalsPanel />
      </aside>

      <main className="visualization-workspace">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">Live visualization</p>
            <h2>Whole-body health map</h2>
          </div>
          <div className="workspace-live-state">
            <span className="live-indicator" />
            {isScanning ? `Scan in progress · ${Math.round(scanProgress)}%` : 'Ready for assessment'}
          </div>
        </div>
        <div className="canvas-frame">
          <MedicalCanvas
            activeNode={activeNode}
            onSelectNode={handleSelectNode}
            scanProgress={scanProgress}
            isScanning={isScanning}
          />
        </div>
      </main>

      <aside className="dashboard-sidebar control-sidebar" aria-label="Diagnostic controls">
        {!showReport ? (
          <ScanFlow
            isScanning={isScanning}
            scanProgress={scanProgress}
            onStartScan={handleStartScan}
            onCancelScan={handleCancelScan}
            onStepChange={setActiveNode}
            onScanComplete={handleScanComplete}
          />
        ) : (
          <DiagnosticReport onReset={handleReset} />
        )}
      </aside>
    </div>
  );
}

export default App;
