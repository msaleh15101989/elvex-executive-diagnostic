import React from 'react';
import { Compass, Settings2, Users, Check } from 'lucide-react';
import { LayerKey } from '../types';

export const LAYER_ICON: Record<LayerKey, React.ReactNode> = {
  elevate: <Compass />,
  execute: <Settings2 />,
  evolve: <Users />,
};

export const Wordmark: React.FC<{ size?: string }> = ({ size = 'text-lg' }) => (
  <span className={`font-[800] tracking-[.04em] text-[var(--text)] ${size}`} style={{ fontFamily: 'var(--font-head)' }}>ELVEX Partners</span>
);

export const Bar: React.FC<{ value: number | null; dim?: boolean; bands?: boolean; label?: string }> = ({ value, dim, bands, label }) => (
  <div className={`bar ${dim ? 'dim' : ''}`} role="img" aria-label={label ?? `${value ?? 0} out of 100`}>
    {bands && <div className="bands"><span /><span /><span /><span /></div>}
    <i style={{ width: `${Math.max(0, Math.min(100, value ?? 0))}%` }} />
  </div>
);

// Circular score gauge: the main number of the report.
export const ScoreRing: React.FC<{ value: number; size?: number }> = ({ value, size = 220 }) => {
  const r = 46, c = 2 * Math.PI * r, pct = Math.max(0, Math.min(100, value)) / 100;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" aria-hidden="true">
        <defs><linearGradient id="ring" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#9457FF" /><stop offset="1" stopColor="#5A1FC4" /></linearGradient></defs>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#17171F" strokeWidth="7" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="url(#ring)" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`} style={{ transition: 'stroke-dasharray 1.1s cubic-bezier(.2,.7,.2,1)' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="num font-bold text-[var(--text)] leading-none" style={{ fontSize: size * 0.3 }}>{value}</div>
          <div className="text-[var(--muted)] text-sm mt-1">out of 100</div>
        </div>
      </div>
    </div>
  );
};

export const PulseLine: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={`pulse-line w-full ${className ?? ''}`} viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="pl" x1="0" x2="1"><stop offset="0" stopColor="#5A1FC4" stopOpacity=".15" /><stop offset=".3" stopColor="#9457FF" /><stop offset=".8" stopColor="#9457FF" /><stop offset="1" stopColor="#5A1FC4" stopOpacity=".15" /></linearGradient></defs>
    <path pathLength={1} d="M0 80 H220 L238 80 L254 18 L272 112 L288 80 H520 L536 80 L552 34 L570 104 L586 80 H790 L806 80 L822 10 L842 116 L858 80 H1000"
      fill="none" stroke="url(#pl)" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
  </svg>
);

export type StepKey = 'details' | 'questions' | 'results';
const STEPS: { key: StepKey; label: string }[] = [
  { key: 'details', label: 'About you' },
  { key: 'questions', label: 'Statements' },
  { key: 'results', label: 'Your report' },
];

export const Stepper: React.FC<{ current: StepKey }> = ({ current }) => {
  const idx = STEPS.findIndex(s => s.key === current);
  return (
    <ol className="flex items-center gap-2 sm:gap-3 text-sm" aria-label="Progress">
      {STEPS.map((s, i) => {
        const done = i < idx, on = i === idx;
        return (
          <li key={s.key} className="flex items-center gap-2 sm:gap-3">
            <span className={`flex items-center gap-2 ${on ? 'text-[var(--text)]' : done ? 'text-[var(--lav)]' : 'text-[var(--muted)]'}`} aria-current={on ? 'step' : undefined}>
              <span className={`w-6 h-6 rounded-full grid place-items-center text-xs font-semibold num ${on ? 'bg-[var(--violet)] text-white' : done ? 'bg-[var(--tile)] text-[var(--icon)] border border-[var(--tile-line)]' : 'border border-[var(--line3)]'}`}>
                {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span className={on ? 'inline' : 'hidden md:inline'}>{s.label}</span>
            </span>
            {i < STEPS.length - 1 && <span className="w-6 sm:w-10 h-px bg-[var(--line3)]" />}
          </li>
        );
      })}
    </ol>
  );
};
