import { useState, useEffect } from 'react';
import { MedicalCanvas } from './components/MedicalCanvas';
import { VitalsPanel } from './components/VitalsPanel';
import { ScanFlow } from './components/ScanFlow';
import { DiagnosticReport } from './components/DiagnosticReport';
import { ShieldCheck, Cpu, Database } from 'lucide-react';

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
      {/* 1. Header HUD */}
      <header
        className="col-span-3 border-b border-white/5 bg-black/45 backdrop-blur-md px-6 flex justify-between items-center z-20"
        aria-label="AURA-3D system status"
      >
        {/* Logo and system status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 bg-cyan rounded-full animate-pulse shadow-[0_0_8px_#00f0ff]"
              aria-hidden="true"
            />
            <h1 className="hud-title text-lg tracking-wider font-extrabold flex items-center gap-2">
              AURA-3D <span className="text-xs font-semibold text-cyan hud-font bg-cyan/10 border border-cyan/25 px-2 py-0.5 rounded">V.6</span>
            </h1>
          </div>
          <span className="text-[10px] text-text-muted font-mono tracking-widest hidden md:inline">
            // HOLOGRAPHIC BIOSCAN PROTOCOL
          </span>
        </div>

        {/* HUD Sub Stats Indicators */}
        <div className="hidden lg:flex items-center gap-6 text-[10px] hud-font">
          <div className="flex items-center gap-2 text-emerald">
            <ShieldCheck size={14} />
            <span>SECURE LINK</span>
          </div>
          <div className="flex items-center gap-2 text-cyan">
            <Cpu size={14} className="animate-spin-slow" />
            <span>AI CORE: ACTIVE</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <Database size={14} />
            <span>LOCAL MEMORY</span>
          </div>
        </div>

        {/* Realtime clock */}
        <div className="flex items-center gap-3">
          <span
            className="text-[11px] hud-font text-cyan bg-cyan/5 border border-cyan/10 px-3.5 py-1 rounded font-bold"
            aria-label={`Current system time: ${currentTime || 'loading'}`}
          >
            {currentTime || 'LOADING...'}
          </span>
        </div>
      </header>

      {/* 2. Left Side - Telemetry Vitals */}
      <aside className="border-r border-white/5 bg-black/25 backdrop-blur-sm z-10 overflow-hidden" aria-label="Live biometric telemetry">
        <VitalsPanel />
      </aside>

      {/* 3. Center - 3D Render Canvas */}
      <main className="relative flex items-center justify-center overflow-hidden" aria-label="Interactive diagnostic visualization">
        <MedicalCanvas
          activeNode={activeNode}
          onSelectNode={handleSelectNode}
          scanProgress={scanProgress}
          isScanning={isScanning}
        />
      </main>

      {/* 4. Right Side - Scan Flow Wizard / Diagnostic Report */}
      <aside className="border-l border-white/5 bg-black/25 backdrop-blur-sm z-10 overflow-hidden" aria-label="Diagnostic scan controls and results">
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
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {showReport
          ? 'Diagnostic report ready.'
          : isScanning
            ? `Diagnostic scan in progress: ${Math.round(scanProgress)} percent complete.`
            : 'Diagnostic scanner ready.'}
      </div>
    </div>
  );
}

export default App;
