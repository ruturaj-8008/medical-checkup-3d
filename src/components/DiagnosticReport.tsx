import React from 'react';
import { Award, BrainCircuit, HeartHandshake, CheckSquare, RefreshCw } from 'lucide-react';

interface DiagnosticReportProps {
  onReset: () => void;
}

interface DiagnosisItem {
  name: string;
  score: number;
  status: 'excellent' | 'optimal' | 'moderate';
  icon: React.ReactNode;
  color: string;
}

export const DiagnosticReport: React.FC<DiagnosticReportProps> = ({ onReset }) => {
  const scoreData: DiagnosisItem[] = [
    {
      name: 'Neurological Index',
      score: 96,
      status: 'excellent',
      icon: <BrainCircuit size={16} className="text-cyan" />,
      color: 'var(--color-cyan)',
    },
    {
      name: 'Cardio Efficiency',
      score: 89,
      status: 'optimal',
      icon: <Award size={16} className="text-magenta" />,
      color: 'var(--color-magenta)',
    },
    {
      name: 'Pulmonary Capacity',
      score: 94,
      status: 'excellent',
      icon: <HeartHandshake size={16} className="text-emerald" />,
      color: 'var(--color-emerald)',
    },
    {
      name: 'Metabolic Balance',
      score: 92,
      status: 'optimal',
      icon: <CheckSquare size={16} className="text-violet" />,
      color: 'var(--color-violet)',
    },
  ];

  const overallScore = 93;
  // Calculate SVG circle dash offsets
  const circleRadius = 52;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="flex flex-col h-full gap-4 p-4 select-none overflow-y-auto">
      {/* HUD Header */}
      <div className="flex flex-col gap-1 border-b border-white/5 pb-3">
        <span className="text-[10px] text-magenta hud-font font-bold tracking-widest uppercase">
          // Diagnostic Output
        </span>
        <h2 className="hud-title text-xl">Health Assessment</h2>
      </div>

      {/* Circular Progress Score Card */}
      <div className="glass-panel p-4 flex items-center justify-between bg-black/45 border-magenta/20 pulsing-hud-magenta relative overflow-hidden">
        <div className="flex flex-col gap-1.5 z-10">
          <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest">Composite Index</span>
          <h3 className="hud-font text-lg font-bold text-text-primary">Bio-Safety Rating</h3>
          <p className="text-[10px] text-emerald font-semibold uppercase tracking-wider mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-ping" />
            CLASS-A HEALTH STATUS
          </p>
        </div>

        {/* Circular SVG Ring */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Ring */}
            <circle
              cx="56"
              cy="56"
              r={circleRadius}
              className="stroke-white/5"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Foreground Ring */}
            <circle
              cx="56"
              cy="56"
              r={circleRadius}
              className="stroke-magenta transition-all duration-1000 ease-out"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="hud-font text-2xl font-extrabold text-text-primary leading-none">
              {overallScore}
            </span>
            <span className="text-[8px] text-text-secondary uppercase tracking-widest mt-0.5">
              SCORE
            </span>
          </div>
        </div>
      </div>

      {/* Diagnosis Categories */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest px-1">Detailed Parameter Scores</span>
        {scoreData.map((item, idx) => {
          const isExc = item.status === 'excellent';
          return (
            <div key={idx} className="glass-panel p-3 flex flex-col gap-2 hover:bg-white/[0.01]">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-text-primary flex items-center gap-2">
                  {item.icon}
                  {item.name}
                </span>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  isExc ? 'bg-cyan/10 text-cyan border border-cyan/20' : 'bg-violet/10 text-violet border border-violet/20'
                }`}>
                  {item.status}
                </span>
              </div>
              
              {/* Micro Progress Bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${item.score}%`,
                      backgroundColor: item.color 
                    }}
                  />
                </div>
                <span className="hud-font text-xs font-bold text-text-primary min-w-[28px] text-right">
                  {item.score}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendations & Actionable Insights */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest px-1">Physiological Directives</span>
        <div className="glass-panel p-3.5 bg-black/35 flex flex-col gap-2.5">
          <div className="flex gap-2 text-[10px] leading-relaxed text-text-secondary align-top">
            <span className="text-cyan font-bold text-xs mt-0.5">01/</span>
            <p>
              <strong>Hydration Optimization:</strong> Intake levels fall slightly below optimal base levels. Increase mineral water consumption by <strong>+0.5L/day</strong>.
            </p>
          </div>
          <div className="flex gap-2 text-[10px] leading-relaxed text-text-secondary align-top border-t border-white/5 pt-2.5">
            <span className="text-magenta font-bold text-xs mt-0.5">02/</span>
            <p>
              <strong>Cardio Recovery:</strong> Resting pulse is healthy but active recovery is slightly sluggish. Introduce <strong>10 minutes</strong> of breathing exercises daily.
            </p>
          </div>
          <div className="flex gap-2 text-[10px] leading-relaxed text-text-secondary align-top border-t border-white/5 pt-2.5">
            <span className="text-emerald font-bold text-xs mt-0.5">03/</span>
            <p>
              <strong>Melatonin Regulation:</strong> Core temperature patterns suggest minor fatigue markers. Target sleep alignment around <strong>22:30 hours</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Action Trigger - Reset & Rescan */}
      <button
        type="button"
        onClick={onReset}
        className="btn-neon btn-neon-magenta mt-2 py-3.5 font-bold text-xs w-full flex items-center justify-center gap-2"
        aria-label="Reset telemetry and begin another diagnostic scan"
      >
        <RefreshCw size={13} className="animate-spin-slow" aria-hidden="true" />
        Reset Telemetry & Rescan
      </button>
    </div>
  );
};
