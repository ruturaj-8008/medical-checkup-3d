import { useEffect, useState } from 'react';
import { Cpu, Database, LogOut, ShieldCheck } from 'lucide-react';
import type { SessionUser } from '../auth/types';
import { useAuth } from '../auth/AuthProvider';
import { MedicalCanvas } from './MedicalCanvas';
import { VitalsPanel } from './VitalsPanel';
import { ScanFlow } from './ScanFlow';
import { DiagnosticReport } from './DiagnosticReport';

interface AuthenticatedDashboardProps {
  user: SessionUser;
}

/** Renders the existing medical dashboard after full server-side authentication. */
export function AuthenticatedDashboard({ user }: AuthenticatedDashboardProps) {
  const { logout } = useAuth();
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', { hour12: false });
      const date = now
        .toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
        .replace(/\//g, '.');
      setCurrentTime(`${date} // ${time}`);
    };

    updateTime();
    const interval = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isScanning) {
      return undefined;
    }

    const duration = 12_000;
    const intervalTime = 100;
    const step = 100 / (duration / intervalTime);
    const timer = window.setInterval(() => {
      setScanProgress((progress) => {
        if (progress >= 100) {
          window.clearInterval(timer);
          return 100;
        }
        return progress + step;
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
      setActiveNode((selectedNode) => (selectedNode === node ? null : node));
    }
  };

  return (
    <div className="app-container">
      <header className="col-span-3 border-b border-white/5 bg-black/45 backdrop-blur-md px-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-cyan rounded-full animate-pulse shadow-[0_0_8px_#00f0ff]" />
            <h1 className="hud-title text-lg tracking-wider font-extrabold flex items-center gap-2">
              AURA-3D <span className="text-xs font-semibold text-cyan hud-font bg-cyan/10 border border-cyan/25 px-2 py-0.5 rounded">V.6</span>
            </h1>
          </div>
          <span className="text-[10px] text-text-muted font-mono tracking-widest hidden md:inline">
            // HOLOGRAPHIC BIOSCAN PROTOCOL
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-6 text-[10px] hud-font">
          <div className="flex items-center gap-2 text-emerald"><ShieldCheck size={14} /><span>SECURE LINK</span></div>
          <div className="flex items-center gap-2 text-cyan"><Cpu size={14} className="animate-spin-slow" /><span>AI CORE: ACTIVE</span></div>
          <div className="flex items-center gap-2 text-text-secondary"><Database size={14} /><span>LOCAL MEMORY</span></div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-[10px] text-text-muted">{user.displayName ?? user.email}</span>
          <span className="text-[11px] hud-font text-cyan bg-cyan/5 border border-cyan/10 px-3.5 py-1 rounded font-bold">
            {currentTime || 'LOADING...'}
          </span>
          <button className="auth-logout-button" type="button" onClick={() => void logout()} aria-label="Sign out">
            <LogOut size={15} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <aside className="border-r border-white/5 bg-black/25 backdrop-blur-sm z-10 overflow-hidden"><VitalsPanel /></aside>
      <main className="relative flex items-center justify-center overflow-hidden">
        <MedicalCanvas activeNode={activeNode} onSelectNode={handleSelectNode} scanProgress={scanProgress} isScanning={isScanning} />
      </main>
      <aside className="border-l border-white/5 bg-black/25 backdrop-blur-sm z-10 overflow-hidden">
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
