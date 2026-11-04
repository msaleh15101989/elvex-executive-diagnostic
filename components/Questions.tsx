import React, { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { DOMAINS, LAYERS, NOT_SURE, SCALE } from '../constants';
import { LayerKey } from '../types';
import { LAYER_ICON } from './ui';

interface Props {
  step: number;
  answers: Record<string, number>;
  onAnswer: (id: string, v: number) => void;
  onGoTo: (i: number) => void;
  onBack: () => void;
  onFinish: () => void;
}

const labelOf = (v: number | undefined) => v === undefined ? '' : v === NOT_SURE ? 'Not sure' : SCALE.find(s => s.value === v)?.label ?? '';

export const Questions: React.FC<Props> = ({ step, answers, onAnswer, onGoTo, onBack, onFinish }) => {
  const domain = DOMAINS[step];
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const total = DOMAINS.reduce((n, d) => n + d.questions.length, 0);
  const done = Object.keys(answers).length;
  const areaDone = (i: number) => DOMAINS[i].questions.filter(q => answers[q.id] !== undefined).length;
  const complete = domain.questions.every(q => answers[q.id] !== undefined);
  const firstOpen = domain.questions.find(q => answers[q.id] === undefined)?.id;
  const last = step === DOMAINS.length - 1;

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [step]);

  const answer = (id: string, v: number) => {
    const wasOpen = answers[id] === undefined;
    onAnswer(id, v);
    if (!wasOpen) return;
    const qs = domain.questions;
    const next = qs.slice(qs.findIndex(q => q.id === id) + 1).find(q => answers[q.id] === undefined);
    if (next) setTimeout(() => refs.current[next.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 160);
  };

  return (
    <section className="wrap py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-8 lg:gap-14 items-start">
      {/* Area navigation */}
      <aside className="min-w-0 lg:sticky lg:top-28" aria-label="Areas">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-[var(--lav)]">Your progress</span>
          <span className="num text-sm text-[var(--muted)]">{done} of {total}</span>
        </div>
        <div className="bar mt-2"><i style={{ width: `${(done / total) * 100}%` }} /></div>

        <nav className="mt-6 hidden lg:block space-y-6">
          {(Object.keys(LAYERS) as LayerKey[]).map(k => (
            <div key={k}>
              <p className="text-xs font-semibold text-[var(--muted)] mb-2">{LAYERS[k].title}</p>
              <ul className="space-y-1">
                {DOMAINS.map((d, i) => d.layer !== k ? null : (
                  <li key={d.key}>
                    <button onClick={() => onGoTo(i)} aria-current={i === step ? 'step' : undefined}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${i === step ? 'bg-[var(--close)] border border-[rgba(123,44,255,.5)] text-[var(--text)]' : 'border border-transparent text-[var(--lav)] hover:bg-[var(--panel)]'}`}>
                      <span className={`w-5 h-5 rounded-full grid place-items-center shrink-0 ${areaDone(i) === d.questions.length ? 'bg-[var(--violet)] text-white' : 'border border-[var(--line3)]'}`}>
                        {areaDone(i) === d.questions.length && <Check className="w-3 h-3" />}
                      </span>
                      <span className="flex-1">{d.title}</span>
                      <span className="num text-xs text-[var(--muted)]">{areaDone(i)}/{d.questions.length}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Compact area tabs on smaller screens */}
        <div className="lg:hidden mt-4 flex gap-2 overflow-x-auto pb-1" role="tablist">
          {DOMAINS.map((d, i) => (
            <button key={d.key} role="tab" aria-selected={i === step} onClick={() => onGoTo(i)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs border ${i === step ? 'bg-[var(--violet)] border-[var(--violet-hi)] text-white' : areaDone(i) === d.questions.length ? 'border-[var(--tile-line)] text-[var(--lav)]' : 'border-[var(--line2)] text-[var(--muted)]'}`}>
              {d.title}
            </button>
          ))}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex items-start gap-4">
          <div className="tile hidden sm:grid">{LAYER_ICON[domain.layer]}</div>
          <div>
            <p className="kicker">Area {step + 1} of {DOMAINS.length}, part of {LAYERS[domain.layer].title}</p>
            <h1 className="display mt-2 text-[clamp(1.9rem,3.6vw,2.6rem)]">{domain.title}</h1>
            <p className="mt-2 text-[var(--body)] max-w-2xl">{domain.description} Rate how true each statement is today, from 1 (strongly disagree) to 5 (strongly agree).</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {domain.questions.map((q, i) => {
            const v = answers[q.id];
            return (
              <div key={q.id} ref={el => { refs.current[q.id] = el; }}
                className={`statement ${v !== undefined ? 'answered' : ''} ${q.id === firstOpen ? 'current' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <p className="text-[var(--text)] text-[1.04rem] leading-relaxed"><span className="num text-[var(--icon)] font-semibold mr-2">{i + 1}</span>{q.text}</p>
                  {v !== undefined && <span className="shrink-0 text-xs text-[var(--icon)] mt-1.5 hidden sm:inline">{labelOf(v)}</span>}
                </div>
                <div className="mt-4 grid sm:grid-cols-[1fr,auto] gap-3 items-start">
                  <div>
                    <div className="scale" role="radiogroup" aria-label={q.text}>
                      {SCALE.map(s => (
                        <button key={s.value} type="button" role="radio" aria-checked={v === s.value} aria-label={`${s.value}, ${s.label}`} onClick={() => answer(q.id, s.value)}>
                          {s.value}
                        </button>
                      ))}
                    </div>
                    <div className="scale-ends"><span>Strongly disagree</span><span>Strongly agree</span></div>
                  </div>
                  <button type="button" role="radio" aria-checked={v === NOT_SURE} onClick={() => answer(q.id, NOT_SURE)}
                    className={`h-12 px-4 rounded-xl border text-sm transition ${v === NOT_SURE ? 'bg-[var(--tile)] border-[var(--tile-line)] text-[var(--text)]' : 'border-dashed border-[var(--line3)] text-[var(--body)] hover:text-[var(--text)] hover:border-[var(--violet)]'}`}>
                    Not sure
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <button onClick={onBack} className="btn btn-quiet"><ArrowLeft className="w-4 h-4" />{step === 0 ? 'Your details' : 'Previous area'}</button>
          <div className="flex items-center gap-4">
            {!complete && <span className="text-sm text-[var(--body)]">{domain.questions.length - areaDone(step)} left in this area</span>}
            {last
              ? <button disabled={!complete || done < total} onClick={onFinish} className="btn btn-primary">See my report<ArrowRight className="w-5 h-5" /></button>
              : <button disabled={!complete} onClick={() => onGoTo(step + 1)} className="btn btn-primary">Next: {DOMAINS[step + 1].title}<ArrowRight className="w-5 h-5" /></button>}
          </div>
        </div>
        {last && complete && done < total && <p className="mt-3 text-sm text-[var(--warn)] text-right">Some earlier areas still have unanswered statements. Use the list to finish them.</p>}
      </div>
    </section>
  );
};
