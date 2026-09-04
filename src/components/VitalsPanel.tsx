import React, { useEffect, useState, useRef } from 'react';
import { Activity, Heart, Thermometer, Wind, Eye } from 'lucide-react';

interface VitalMetric {
  name: string;
  value: number;
  secondaryVal?: string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  icon: React.ReactNode;
  color: string;
}

export const VitalsPanel: React.FC = () => {
  const [heartRate, setHeartRate] = useState(72);
  const [temp, setTemp] = useState(36.6);
  const [spo2, setSpo2] = useState(98);
  const [resp, setResp] = useState(14);
  const [bp, setBp] = useState({ sys: 120, dia: 80 });

  // History buffer for drawing the rolling EKG chart
  const [ekgData, setEkgData] = useState<number[]>(Array(40).fill(25));
  const tickRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Oscillate Vitals slightly
      setHeartRate(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const next = prev + change;
        return Math.min(Math.max(next, 65), 85);
      });

      setTemp(prev => {
        const change = (Math.random() - 0.5) * 0.1;
        const next = prev + change;
        return parseFloat(Math.min(Math.max(next, 36.2), 37.1).toFixed(1));
      });

      setSpo2(prev => {
        if (Math.random() > 0.85) {
          const next = prev + (Math.random() > 0.5 ? 1 : -1);
          return Math.min(Math.max(next, 96), 100);
        }
        return prev;
      });

      setResp(prev => {
        if (Math.random() > 0.7) {
          const change = Math.random() > 0.5 ? 1 : -1;
          const next = prev + change;
          return Math.min(Math.max(next, 12), 18);
        }
        return prev;
      });

      setBp(prev => {
        if (Math.random() > 0.8) {
          const sysChange = Math.random() > 0.5 ? 1 : -1;
          const diaChange = Math.random() > 0.5 ? 0.5 : -0.5;
          return {
            sys: Math.min(Math.max(prev.sys + sysChange, 115), 125),
            dia: Math.min(Math.max(Math.round(prev.dia + diaChange), 75), 85)
          };
        }
        return prev;
      });

      // 2. Generate Next EKG waveform value
      tickRef.current += 1;
      const t = tickRef.current % 12;
      let nextY = 25; // baseline y-coord (middle of 50px height)

      // Simulate EKG PQRST complex
      if (t === 2) nextY = 22; // P wave
      else if (t === 4) nextY = 5;  // QRS peak (high spike)
      else if (t === 5) nextY = 45; // QRS dip
      else if (t === 7) nextY = 18; // T wave
      else {
        // baseline noise
        nextY = 25 + (Math.random() - 0.5) * 1.5;
      }

      setEkgData(prev => {
        const nextData = [...prev.slice(1), nextY];
        return nextData;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const metrics: VitalMetric[] = [
    {
      name: 'Heart Rate',
      value: heartRate,
      unit: 'bpm',
      status: heartRate > 80 ? 'warning' : 'normal',
      icon: <Heart size={18} className="text-magenta" />,
      color: 'var(--color-magenta)',
    },
    {
      name: 'Blood Pressure',
      value: bp.sys,
      secondaryVal: `/${bp.dia}`,
      unit: 'mmHg',
      status: 'normal',
      icon: <Activity size={18} className="text-cyan" />,
      color: 'var(--color-cyan)',
    },
    {
      name: 'Oxygen Saturation',
      value: spo2,
      unit: '%',
      status: spo2 < 97 ? 'warning' : 'normal',
      icon: <Eye size={18} className="text-emerald" />,
      color: 'var(--color-emerald)',
    },
    {
      name: 'Respiratory Rate',
      value: resp,
      unit: 'rpm',
      status: 'normal',
      icon: <Wind size={18} className="text-violet" />,
      color: 'var(--color-violet)',
    },
    {
      name: 'Body Temperature',
      value: temp,
      unit: '°C',
      status: temp > 37.0 ? 'warning' : 'normal',
      icon: <Thermometer size={18} className="text-amber" />,
      color: 'var(--color-amber)',
    },
  ];

  // Helper to compile SVG polyline points string from EKG data array
  const generateEkgPath = () => {
    const spacing = 7.5; // width spacing
    return ekgData.map((val, idx) => `${idx * spacing},${val}`).join(' ');
  };

  return (
    <section className="flex flex-col h-full gap-4 p-4 select-none" aria-labelledby="vitals-heading">
      {/* HUD Header */}
      <div className="flex flex-col gap-1 border-b border-white/5 pb-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-cyan hud-font font-bold tracking-widest uppercase">
            // Biometric Telemetry
          </span>
          <span className="text-[9px] text-emerald bg-emerald/10 border border-emerald/20 px-2 py-0.5 rounded-full uppercase font-bold animate-pulse">
            Active
          </span>
        </div>
        <h2 id="vitals-heading" className="hud-title text-xl">Vitals Monitor</h2>
      </div>

      {/* Real-time EKG Oscilloscope View */}
      <div className="glass-panel glass-panel-glow-cyan p-4 flex flex-col gap-2 bg-black/45 relative overflow-hidden">
        <div className="flex justify-between items-center text-[10px] text-text-secondary hud-font font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-magenta rounded-full animate-ping" />
            EKG OSCILLOSCOPE (LEAD II)
          </span>
          <span className="text-cyan font-bold">{heartRate} BPM</span>
        </div>
        
        {/* Dynamic SVG Waveform */}
        <div className="w-full h-14 bg-[#05070e]/80 border border-cyan/10 rounded-md relative overflow-hidden flex items-center">
          <svg className="w-full h-full" viewBox="0 0 300 50" preserveAspectRatio="none" aria-hidden="true">
            {/* Grid background lines */}
            <line x1="0" y1="12.5" x2="300" y2="12.5" stroke="rgba(0, 240, 255, 0.05)" strokeDasharray="3 3" />
            <line x1="0" y1="25" x2="300" y2="25" stroke="rgba(0, 240, 255, 0.1)" />
            <line x1="0" y1="37.5" x2="300" y2="37.5" stroke="rgba(0, 240, 255, 0.05)" strokeDasharray="3 3" />
            
            <polyline
              fill="none"
              stroke="var(--color-cyan)"
              strokeWidth="1.5"
              points={generateEkgPath()}
              className="transition-all duration-75"
            />
          </svg>
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#05070e] to-transparent pointer-events-none" />
        </div>
        
        <div className="flex justify-between items-center text-[8px] text-text-muted hud-font">
          <span>SPEED: 25mm/s</span>
          <span>RANGE: AUTO</span>
          <span>FILTER: DIAGNOSTIC</span>
        </div>
      </div>

      {/* Metrics List */}
      <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1">
        {metrics.map((metric, i) => {
          const statusClass = 
            metric.status === 'normal' 
              ? 'status-normal' 
              : metric.status === 'warning'
              ? 'status-warning'
              : 'status-critical';

          return (
            <article
              key={i} 
              className="glass-panel metric-card hover:bg-white/[0.02] hover:-translate-y-0.5 transition-all duration-300"
              style={{ borderLeft: `3px solid ${metric.color}` }}
              aria-label={`${metric.name}: ${metric.value}${metric.secondaryVal ?? ''} ${metric.unit}, ${metric.status}`}
            >
              <div className="metric-header">
                <span className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                  {metric.icon}
                  {metric.name}
                </span>
                <span className={`metric-status ${statusClass}`}>
                  {metric.status}
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <div>
                  <span className="metric-value text-text-primary" aria-live="polite" aria-atomic="true">
                    {metric.value}
                  </span>
                  {metric.secondaryVal && (
                    <span className="text-lg font-semibold text-text-secondary hud-font">
                      {metric.secondaryVal}
                    </span>
                  )}
                  <span className="metric-unit text-text-secondary">
                    {metric.unit}
                  </span>
                </div>
                {/* Micro Mini wave chart */}
                <div className="w-16 h-6 opacity-60">
                  <svg className="w-full h-full" viewBox="0 0 50 20" aria-hidden="true">
                    <path
                      d={
                        i % 2 === 0
                          ? "M0,10 Q12,2 25,10 T50,10"
                          : "M0,15 C10,5 20,5 30,15 S40,5 50,15"
                      }
                      fill="none"
                      stroke={metric.color}
                      strokeWidth="1"
                    />
                  </svg>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
