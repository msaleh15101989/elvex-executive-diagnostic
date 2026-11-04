import React from 'react';
import { ArrowRight, Clock3, Lock, FileText } from 'lucide-react';
import { DOMAINS, LAYERS } from '../constants';
import { LayerKey } from '../types';
import { Bar, LAYER_ICON, PulseLine, ScoreRing } from './ui';

const SAMPLE: Record<LayerKey, number> = { elevate: 71, execute: 54, evolve: 38 };

export const Intro: React.FC<{ resume: boolean; total: number; onStart: () => void }> = ({ resume, total, onStart }) => (
  <>
    <section className="cover-bg">
      <div className="wrap pt-14 pb-10 sm:pt-20 lg:pt-24 grid lg:grid-cols-[1.35fr,1fr] gap-12 lg:gap-16 items-center">
        <div>
          <p className="kicker">ELVEX Executive Diagnostic</p>
          <h1 className="display mt-4 text-[clamp(2.5rem,6vw,4.4rem)]">How ready is your organization to deliver its strategy?</h1>
          <p className="lede mt-6">Rate 31 statements about how your organization really works today. You get a report by email showing where strategy, operating model and people are helping or holding back your priorities, and what to fix first.</p>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <button onClick={onStart} className="btn btn-primary text-[1.02rem]">
              {resume ? 'Continue your diagnostic' : 'Start the diagnostic'}<ArrowRight className="w-5 h-5" />
            </button>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--body)]">
              <li className="flex items-center gap-2"><Clock3 className="w-4 h-4 text-[var(--icon)]" />About 10 minutes</li>
              <li className="flex items-center gap-2"><FileText className="w-4 h-4 text-[var(--icon)]" />Full report sent to your inbox</li>
              <li className="flex items-center gap-2"><Lock className="w-4 h-4 text-[var(--icon)]" />Answers stay confidential</li>
            </ul>
          </div>
        </div>

        {/* Preview of the report, so people know what they will get */}
        <figure className="panel p-6 sm:p-7 shadow-[0_30px_80px_-30px_rgba(123,44,255,.45)]" aria-label="Example of the report you will receive">
          <figcaption className="flex items-center justify-between text-sm">
            <span className="text-[var(--lav)] font-medium">What your report looks like</span>
            <span className="text-[var(--muted)]">Example</span>
          </figcaption>
          <div className="mt-5 flex items-center gap-6">
            <ScoreRing value={56} size={128} />
            <div>
              <span className="chip">Developing</span>
              <p className="mt-3 text-[var(--text)] text-[.95rem] leading-snug">Ambition is ahead of the organization’s ability to deliver.</p>
            </div>
          </div>
          <div className="rule my-5" />
          <div className="space-y-4">
            {(Object.keys(LAYERS) as LayerKey[]).map(k => (
              <div key={k} className="grid grid-cols-[88px,1fr,32px] items-center gap-3 text-sm">
                <span className="text-[var(--lav)]">{LAYERS[k].title}</span>
                <Bar value={SAMPLE[k]} dim={k !== 'evolve'} />
                <span className="num text-right text-[var(--text)] font-semibold">{SAMPLE[k]}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-[var(--body)]">Plus your pattern, the area to focus on first, three ELVEX actions, and your biggest gaps and strengths.</p>
        </figure>
      </div>
      <PulseLine className="h-[70px] sm:h-[90px]" />
    </section>

    <section className="wrap py-16 sm:py-20">
      <div className="grid lg:grid-cols-[1fr,2fr] gap-10 lg:gap-16">
        <div>
          <h2 className="h2">What the diagnostic measures</h2>
          <p className="mt-3 text-[var(--body)] max-w-sm">Five areas across the three layers ELVEX uses with every client. Most transformations stall in the third.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-px rounded-[22px] overflow-hidden border border-[var(--line2)] bg-[var(--line2)]">
          {(Object.keys(LAYERS) as LayerKey[]).map(k => (
            <div key={k} className="bg-[var(--panel)] p-6">
              <div className="tile">{LAYER_ICON[k]}</div>
              <h3 className="h3 mt-4">{LAYERS[k].title}</h3>
              <p className="text-sm text-[var(--body)] mt-1">{LAYERS[k].tagline}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {DOMAINS.filter(d => d.layer === k).map(d => (
                  <li key={d.key} className="flex justify-between gap-3 text-[var(--lav)]"><span>{d.title}</span><span className="num text-[var(--muted)]">{d.questions.length}</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 grid lg:grid-cols-[1fr,2fr] gap-10 lg:gap-16">
        <h2 className="h2">How it works</h2>
        <ol className="grid sm:grid-cols-3 gap-6">
          {[
            ['Tell us about your organization', 'Your role, sector and the initiative that matters most right now.'],
            ['Rate the statements', 'Answer for how things work today, not how they should. “Not sure” is always an option.'],
            ['Read your report', 'See your headline scores on screen, then get the full report by email.'],
          ].map(([t, d], i) => (
            <li key={t} className="border-t-2 border-[var(--violet)] pt-4">
              <span className="num text-[var(--icon)] font-semibold">Step {i + 1}</span>
              <h3 className="h3 mt-1">{t}</h3>
              <p className="text-sm text-[var(--body)] mt-2">{d}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 panel-violet p-7 sm:p-8">
        <div>
          <h2 className="h2">Ready when you are</h2>
          <p className="mt-2 text-[var(--lav)]">{total} statements. Your progress saves on this device as you go.</p>
        </div>
        <button onClick={onStart} className="btn btn-primary">{resume ? 'Continue your diagnostic' : 'Start the diagnostic'}<ArrowRight className="w-5 h-5" /></button>
      </div>
    </section>
  </>
);
