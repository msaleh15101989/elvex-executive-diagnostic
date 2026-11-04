import React from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Printer, Send, Sparkles, TriangleAlert } from 'lucide-react';
import { LAYERS, PLAYBOOK } from '../constants';
import { AIInsights, Contact, LayerKey, Results as R } from '../types';
import { Bar, LAYER_ICON, PulseLine, ScoreRing } from './ui';

interface Props {
  contact: Contact; results: R; insights: AIInsights | null; delivered: boolean; reference: string;
  note: string; onNote: (s: string) => void; debrief: 'idle' | 'sending' | 'sent' | 'error'; onDebrief: () => void;
}

const BANDS = [
  { name: 'Fragile', range: '0 to 39' }, { name: 'Developing', range: '40 to 59' },
  { name: 'Established', range: '60 to 79' }, { name: 'Leading', range: '80 to 100' },
];

export const Results: React.FC<Props> = ({ contact: c, results: r, insights, delivered, reference, note, onNote, debrief, onDebrief }) => {
  const focusLayer = r.weakest.layer;
  const play = PLAYBOOK[r.weakest.key];
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <article>
      {!delivered && (
        <div className="wrap pt-6 no-print">
          <div className="rounded-2xl border border-[#6B5420] bg-[#211A0C] text-[#F2D58A] p-4 text-sm flex gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Your report is ready, but it couldn’t be saved to ELVEX just now. It is kept on this device and will be sent automatically the next time you open this page.</span>
          </div>
        </div>
      )}

      {/* Report cover */}
      <header className="cover-bg">
        <div className="wrap pt-12 pb-8 sm:pt-16 grid lg:grid-cols-[1.4fr,1fr] gap-10 items-center">
          <div>
            <p className="kicker">Executive Diagnostic report</p>
            <h1 className="display mt-3 text-[clamp(2.4rem,6vw,4.2rem)]">{c.company}</h1>
            <p className="mt-4 text-[var(--lav)]">Prepared for {c.fullName}, {c.role}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{c.industry}, {c.country}. {today}. Reference {reference}</p>
          </div>
          <div className="flex items-center gap-6 lg:justify-end">
            <ScoreRing value={r.overall} size={190} />
            <div className="max-w-[15rem]">
              <span className="chip">{r.band.name}</span>
              <p className="mt-3 text-[var(--text)] leading-snug">{r.band.summary}</p>
            </div>
          </div>
        </div>
        <div className="wrap pb-8">
          <ol className="grid grid-cols-4 gap-1.5" aria-label="Readiness bands">
            {BANDS.map(b => (
              <li key={b.name} className={`rounded-lg px-3 py-2 text-xs sm:text-sm border ${b.name === r.band.name ? 'bg-[var(--violet)] border-[var(--violet-hi)] text-white' : 'border-[var(--line2)] text-[var(--muted)]'}`}>
                <span className="font-semibold block">{b.name}</span><span className="num opacity-80 hidden sm:inline">{b.range}</span>
              </li>
            ))}
          </ol>
        </div>
        <PulseLine className="h-[60px]" />
      </header>

      <div className="wrap py-14 space-y-16">
        {/* Layers */}
        <section className="print-break">
          <h2 className="h2">Your three layers</h2>
          <p className="mt-2 text-[var(--body)] max-w-2xl">How well strategy, delivery and people are each set up to carry your priorities.</p>
          <div className="mt-6 grid md:grid-cols-3 gap-px rounded-[22px] overflow-hidden border border-[var(--line2)] bg-[var(--line2)]">
            {(Object.keys(LAYERS) as LayerKey[]).map(k => {
              const focus = k === focusLayer;
              return (
                <div key={k} className={`p-6 sm:p-7 ${focus ? 'bg-[var(--close)]' : 'bg-[var(--panel)]'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="tile">{LAYER_ICON[k]}</div>
                    {focus && <span className="chip">Focus first</span>}
                  </div>
                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div><h3 className="h3">{LAYERS[k].title}</h3><p className="text-sm text-[var(--body)]">{LAYERS[k].tagline}</p></div>
                    <span className="num text-4xl font-bold text-[var(--text)] leading-none">{r.layers[k] ?? 'n/a'}</span>
                  </div>
                  <div className="mt-4"><Bar value={r.layers[k]} dim={!focus} /></div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Areas */}
        <section className="grid lg:grid-cols-[1.4fr,1fr] gap-10 lg:gap-14 print-break">
          <div>
            <h2 className="h2">Five areas in detail</h2>
            <p className="mt-2 text-[var(--body)]">Dashed lines mark the band thresholds at 40, 60 and 80.</p>
            <ul className="mt-7 space-y-6">
              {[...r.domains].sort((a, b) => (a.index ?? 0) - (b.index ?? 0)).map(d => (
                <li key={d.key}>
                  <div className="flex items-baseline justify-between gap-4 mb-2">
                    <span className="text-[var(--text)]">{d.title} <span className="text-sm text-[var(--muted)]">{LAYERS[d.layer].title}</span></span>
                    <span className="num font-semibold text-[var(--text)]">{d.index ?? 'n/a'}</span>
                  </div>
                  <Bar value={d.index} bands dim={d.key !== r.weakest.key} />
                  {d.answered < d.total && <p className="text-xs text-[var(--muted)] mt-1.5">{d.total - d.answered} answered “Not sure”, not included in the score</p>}
                </li>
              ))}
            </ul>
          </div>
          <div className="panel p-6 sm:p-7 self-start">
            <p className="kicker">Your pattern</p>
            <h3 className="mt-2 text-[var(--text)] text-2xl font-bold leading-tight">{r.pattern.name}</h3>
            <p className="mt-3 text-[var(--lav)] leading-relaxed">{r.pattern.description}</p>
            <div className="rule my-6" />
            <dl className="grid grid-cols-2 gap-5 text-sm">
              <div><dt className="text-[var(--muted)]">Strongest area</dt><dd className="mt-1 text-[var(--text)] font-medium">{r.strongest.title}</dd></div>
              <div><dt className="text-[var(--muted)]">Weakest area</dt><dd className="mt-1 text-[var(--text)] font-medium">{r.weakest.title}</dd></div>
            </dl>
          </div>
        </section>

        {/* Focus */}
        <section className="panel-violet p-7 sm:p-10 grid lg:grid-cols-[1fr,1.3fr] gap-8 lg:gap-12 print-break">
          <div>
            <p className="kicker">Where to focus first</p>
            <h2 className="display mt-2 text-[clamp(1.8rem,3.4vw,2.5rem)]">{r.weakest.title}</h2>
            <p className="mt-4 text-[var(--lav)] text-lg leading-relaxed">{play.outcome}</p>
          </div>
          <ol className="space-y-5">
            {play.actions.map((a, i) => (
              <li key={i} className="flex gap-4">
                <span className="num w-9 h-9 shrink-0 rounded-full bg-[var(--violet)] text-white font-semibold grid place-items-center">{i + 1}</span>
                <p className="text-[var(--text)] leading-relaxed pt-1">{a}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Gaps and strengths */}
        <section className="grid md:grid-cols-2 gap-10 print-break">
          <div>
            <h2 className="h3 flex items-center gap-2"><TriangleAlert className="w-5 h-5 text-[var(--warn)]" />Biggest gaps you reported</h2>
            <ul className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {r.gaps.length ? r.gaps.map(g => <li key={g.id} className="py-3.5 text-[var(--lav)] leading-relaxed">{g.text}</li>)
                : <li className="py-3.5 text-[var(--body)]">No major gaps stood out in your answers.</li>}
            </ul>
          </div>
          <div>
            <h2 className="h3 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-[var(--good)]" />Strengths to build on</h2>
            <ul className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {r.strengths.length ? r.strengths.map(g => <li key={g.id} className="py-3.5 text-[var(--lav)] leading-relaxed">{g.text}</li>)
                : <li className="py-3.5 text-[var(--body)]">No clear strengths yet, which is common during heavy change.</li>}
            </ul>
          </div>
        </section>

        {insights && (
          <section className="panel p-7 sm:p-9 print-break">
            <p className="kicker flex items-center gap-2"><Sparkles className="w-4 h-4" />What this means for {c.company}</p>
            {insights.headline && <h2 className="h2 mt-2">{insights.headline}</h2>}
            {insights.what_it_means && <p className="mt-3 text-[var(--lav)] leading-relaxed max-w-3xl">{insights.what_it_means}</p>}
            {insights.leadership_risk && <p className="mt-3 text-[var(--text)] max-w-3xl"><b className="text-[var(--icon)]">Leadership risk:</b> {insights.leadership_risk}</p>}
            {!!insights.symptoms?.length && (
              <ul className="mt-5 grid sm:grid-cols-2 gap-2 text-sm text-[var(--lav)]">
                {insights.symptoms.map((s, i) => <li key={i} className="rounded-xl bg-[var(--panel2)] border border-[var(--line)] px-4 py-3">{s}</li>)}
              </ul>
            )}
            {!!insights.priorities?.length && (
              <ol className="mt-6 grid md:grid-cols-3 gap-4">
                {insights.priorities.slice(0, 3).map((p, i) => (
                  <li key={i} className="rounded-2xl border border-[var(--tile-line)] bg-[var(--panel2)] p-5">
                    <span className="num text-[var(--icon)] text-sm font-semibold">Priority {i + 1}</span>
                    <h3 className="h3 mt-1">{p.title}</h3>
                    <p className="text-sm text-[var(--body)] mt-2">{p.why}</p>
                    <p className="text-sm text-[var(--lav)] mt-3"><b>First step:</b> {p.first_step}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}
      </div>

      {/* Call to action */}
      <section className="cover-bg border-t border-[var(--line)] no-print">
        <div className="wrap py-14 grid lg:grid-cols-[1fr,1fr] gap-10 items-start">
          <div>
            <h2 className="display text-[clamp(1.9rem,3.6vw,2.7rem)]">Turn these results into a plan</h2>
            <p className="lede mt-4">In a 30 minute debrief, an ELVEX partner walks you through your report and agrees the first moves for {c.company}. No cost and no obligation.</p>
            <p className="mt-6 text-sm text-[var(--body)]">These scores reflect your own view of how the organization works today. They are a starting point for discussion, not an audit.</p>
          </div>
          <div className="panel p-6 sm:p-7">
            {debrief === 'sent' ? (
              <div className="flex gap-3 text-[var(--good)]"><CheckCircle2 className="w-6 h-6 shrink-0" /><p><b className="block text-[var(--text)]">Debrief requested</b>We’ll contact you at {c.email} within one working day.</p></div>
            ) : (
              <>
                <label htmlFor="f-debrief" className="field-label">What would you like the debrief to focus on? (optional)</label>
                <textarea id="f-debrief" rows={4} value={note} onChange={e => onNote(e.target.value)} placeholder="For example, how to sequence our AI initiatives"
                  className="field resize-y" />
                <div className="mt-5 flex flex-wrap gap-3">
                  <button onClick={onDebrief} disabled={debrief === 'sending'} className="btn btn-primary">
                    {debrief === 'sending' ? <><Loader2 className="w-5 h-5 animate-spin" />Sending request</> : <><Send className="w-5 h-5" />Request a debrief</>}
                  </button>
                  <button onClick={() => window.print()} className="btn btn-quiet"><Printer className="w-4 h-4" />Save as PDF</button>
                </div>
                {debrief === 'error' && <p className="field-error mt-3">The request didn’t go through. Try again, or email contact@elvexpartners.com.</p>}
              </>
            )}
          </div>
        </div>
      </section>
    </article>
  );
};
