import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Mail, Send } from 'lucide-react';
import { LAYERS } from '../constants';
import { Contact, LayerKey, Results as R } from '../types';
import { Bar, LAYER_ICON, PulseLine, ScoreRing } from './ui';

interface Props {
  contact: Contact; results: R; delivered: boolean; reference: string;
  sent: 'sending' | 'sent' | 'resent' | 'error'; onResend: (email: string) => void;
  note: string; onNote: (s: string) => void; debrief: 'idle' | 'sending' | 'sent' | 'error'; onDebrief: () => void;
}

const BANDS = [
  { name: 'Fragile', range: '0 to 39' }, { name: 'Developing', range: '40 to 59' },
  { name: 'Established', range: '60 to 79' }, { name: 'Leading', range: '80 to 100' },
];

export const Results: React.FC<Props> = ({ contact: c, results: r, delivered, reference, sent, onResend, note, onNote, debrief, onDebrief }) => {
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(c.email);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const focusLayer = r.weakest.layer;
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <article>
      {!delivered && (
        <div className="wrap pt-6 no-print">
          <div className="rounded-2xl border border-[#6B5420] bg-[#211A0C] text-[#F2D58A] p-4 text-sm flex gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>We couldn’t reach our server just now, so your report hasn’t been emailed yet. Your answers are kept on this device and will be sent automatically the next time you open this page.</span>
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

        {/* Full report by email */}
        <section className="panel-violet p-7 sm:p-10 grid lg:grid-cols-[1fr,1.1fr] gap-8 lg:gap-12">
          <div>
            <div className="tile"><Mail className="w-5 h-5" /></div>
            <p className="kicker mt-5">Your full report</p>
            <h2 className="display mt-2 text-[clamp(1.7rem,3.2vw,2.4rem)]">{sent === 'error' ? 'We couldn’t send your report yet' : 'Your full report is on its way to your inbox'}</h2>
            <p className="mt-4 text-[var(--lav)] text-lg leading-relaxed">
              {sent === 'error'
                ? 'Please check your email address below and try again.'
                : <>We’ve emailed the complete report for {c.company} to <b className="text-[var(--text)] break-all">{c.email}</b>. It usually arrives within a few minutes. If you can’t see it, check your junk folder.</>}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">What’s inside</p>
            <ul className="mt-3 space-y-3">
              {[
                'Your scores for all five areas, from weakest to strongest',
                'Your organization’s pattern and what it means day to day',
                `Where to focus first, with three ELVEX actions for ${r.weakest.title.toLowerCase()}`,
                'The biggest gaps and strengths in your answers',
              ].map(t => <li key={t} className="flex gap-3 text-[var(--lav)]"><CheckCircle2 className="w-5 h-5 shrink-0 text-[var(--icon)] mt-0.5" />{t}</li>)}
            </ul>
            <div className="rule my-6" />
            {editing ? (
              <form onSubmit={e => { e.preventDefault(); if (emailOk) { onResend(email.trim()); setEditing(false); } }} className="space-y-3">
                <label htmlFor="f-resend" className="field-label">Correct email address</label>
                <input id="f-resend" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={`field ${email && !emailOk ? 'invalid' : ''}`} />
                <div className="flex flex-wrap gap-3">
                  <button type="submit" disabled={!emailOk} className="btn btn-primary"><Send className="w-4 h-4" />Send my report</button>
                  <button type="button" onClick={() => setEditing(false)} className="btn btn-quiet">Cancel</button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-[var(--body)]">
                {sent === 'sending' ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Sending your report</span>
                  : sent === 'resent' ? <span className="text-[var(--good)]">Sent again to {c.email}.</span> : 'Wrong address? '}
                {sent !== 'sending' && <button onClick={() => { setEmail(c.email); setEditing(true); }} className="underline underline-offset-4 text-[var(--text)] hover:text-[var(--icon)]">Correct it and resend</button>}
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Call to action */}
      <section className="cover-bg border-t border-[var(--line)] no-print">
        <div className="wrap py-14 grid lg:grid-cols-[1fr,1fr] gap-10 items-start">
          <div>
            <h2 className="display text-[clamp(1.9rem,3.6vw,2.7rem)]">Talk through your results</h2>
            <p className="lede mt-4">In a 30 minute debrief, an ELVEX partner walks you through your report and agrees the first moves for {c.company}. It is a paid advisory session, and we’ll confirm the fee before anything is booked.</p>
            <p className="mt-6 text-sm text-[var(--body)]">These scores reflect your own view of how the organization works today. They are a starting point for discussion, not an audit.</p>
          </div>
          <div className="panel p-6 sm:p-7">
            {debrief === 'sent' ? (
              <div className="flex gap-3 text-[var(--good)]"><CheckCircle2 className="w-6 h-6 shrink-0" /><p><b className="block text-[var(--text)]">Debrief requested</b>We’ll contact you at {c.email} within one working day with times and the fee.</p></div>
            ) : (
              <>
                <label htmlFor="f-debrief" className="field-label">What would you like the debrief to focus on? (optional)</label>
                <textarea id="f-debrief" rows={4} value={note} onChange={e => onNote(e.target.value)} placeholder="For example, how to sequence our AI initiatives"
                  className="field resize-y" />
                <div className="mt-5 flex flex-wrap gap-3">
                  <button onClick={onDebrief} disabled={debrief === 'sending'} className="btn btn-primary">
                    {debrief === 'sending' ? <><Loader2 className="w-5 h-5 animate-spin" />Sending request</> : <><Send className="w-5 h-5" />Request a paid debrief</>}
                  </button>
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
