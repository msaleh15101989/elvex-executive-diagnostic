import React, { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import {
  ArrowRight, ArrowLeft, Building2, UserCircle2, Mail, Phone, Briefcase, Target, Globe2, Loader2,
  CheckCircle2, AlertTriangle, Compass, Settings2, Users, Sparkles, Printer, Send, RotateCcw, ShieldCheck, Clock3,
} from 'lucide-react';
import { COUNTRIES, DOMAINS, INDUSTRIES, INITIATIVES, LAYERS, NOT_SURE, PLAYBOOK, SCALE } from './constants';
import { AIInsights, Contact, LayerKey, SavedState } from './types';
import { computeResults } from './services/scoring';
import { buildPayload, requestDebrief, retryPendingSubmission, submitDiagnostic } from './services/submit';

const STORE_KEY = 'elvex_diag_state_v2';
type Phase = 'intro' | 'details' | 'questions' | 'submitting' | 'results';

const newId = () => `EXD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
const emptyContact: Contact = { fullName: '', role: '', company: '', email: '', mobile: '', country: '', industry: '', initiative: '', consent: false };

const load = (): SavedState => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.contact && s.answers) return s;
    }
  } catch { /* storage unavailable */ }
  return { submissionId: newId(), contact: emptyContact, answers: {} };
};

const SHORT: Record<string, string> = { direction: 'Direction', alignment: 'Alignment', operating: 'Operating model', technology: 'Tech, data, AI', people: 'People' };

const LAYER_ICON: Record<LayerKey, React.ReactNode> = {
  elevate: <Compass className="w-5 h-5" />,
  execute: <Settings2 className="w-5 h-5" />,
  evolve: <Users className="w-5 h-5" />,
};

const Bar: React.FC<{ value: number | null; dim?: boolean }> = ({ value, dim }) => (
  <div className="h-2.5 w-full rounded-full bg-[#1C1926] overflow-hidden">
    <div className={`h-full rounded-full ${dim ? 'bg-[#5B3A8F]' : 'bg-gradient-to-r from-[#6B27D6] to-[#9B5BFF]'}`} style={{ width: `${value ?? 0}%`, transition: 'width .8s ease' }} />
  </div>
);

const App: React.FC = () => {
  const [state, setState] = useState<SavedState>(load);
  const [phase, setPhase] = useState<Phase>('intro');
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState(false);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [delivered, setDelivered] = useState(true);
  const [debriefNote, setDebriefNote] = useState('');
  const [debrief, setDebrief] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => { retryPendingSubmission(); }, []);
  useEffect(() => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* ignore */ } }, [state]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [phase, step]);

  const c = state.contact;
  const setContact = (k: keyof Contact, v: string | boolean) => setState(s => ({ ...s, contact: { ...s.contact, [k]: v } }));
  const setAnswer = (id: string, v: number) => setState(s => ({ ...s, answers: { ...s.answers, [id]: v } }));

  const valid = useMemo(() => ({
    fullName: c.fullName.trim().length >= 2,
    role: c.role.trim().length >= 2,
    company: c.company.trim().length >= 2,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email.trim()),
    mobile: /^\+?[0-9\s()]{8,}$/.test(c.mobile.trim()) && c.mobile.replace(/\D/g, '').length >= 8,
    country: !!c.country,
    industry: !!c.industry,
    initiative: !!c.initiative,
    consent: c.consent,
  }), [c]);
  const detailsValid = Object.values(valid).every(Boolean);

  const totalQ = DOMAINS.reduce((n, d) => n + d.questions.length, 0);
  const answeredQ = Object.keys(state.answers).length;
  const domain = DOMAINS[step];
  const domainDone = domain ? domain.questions.every(q => state.answers[q.id] !== undefined) : false;
  const results = useMemo(() => computeResults(state.answers), [state.answers]);

  const finish = async () => {
    setPhase('submitting');
    const payload = buildPayload(state, results);
    const res = await submitDiagnostic(payload);
    setDelivered(res.delivered);
    setInsights(res.insights);
    setPhase('results');
  };

  const sendDebrief = async () => {
    setDebrief('sending');
    try { await requestDebrief(buildPayload(state, results), debriefNote); setDebrief('sent'); }
    catch { setDebrief('error'); }
  };

  const restart = () => {
    if (!window.confirm('Start a new diagnostic? Your current answers on this device will be cleared.')) return;
    setState({ submissionId: newId(), contact: emptyContact, answers: {} });
    setInsights(null); setDebrief('idle'); setStep(0); setPhase('intro');
  };

  const field = (k: keyof Contact, label: string, icon: React.ReactNode, ph: string, type = 'text', hint?: string) => (
    <label className="block">
      <span className={`flex items-center gap-2 text-xs font-semibold tracking-[.14em] uppercase mb-2 ${touched && !valid[k] ? 'text-[#FF8FA3]' : 'text-[#9C97AB]'}`}>{icon}{label}</span>
      <input
        id={`f-${k}`} type={type} value={c[k] as string} placeholder={ph}
        onChange={e => setContact(k, e.target.value)}
        className={`w-full rounded-xl bg-[#15131C] border px-4 py-3 text-[#F4F2F8] placeholder:text-[#615C70] outline-none transition focus:border-[#9B5BFF] ${touched && !valid[k] ? 'border-[#FF8FA3]' : 'border-[#2A2733]'}`}
      />
      {touched && !valid[k] && hint && <span className="text-xs text-[#FF8FA3] mt-1 block">{hint}</span>}
    </label>
  );
  const select = (k: keyof Contact, label: string, icon: React.ReactNode, opts: string[]) => (
    <label className="block">
      <span className={`flex items-center gap-2 text-xs font-semibold tracking-[.14em] uppercase mb-2 ${touched && !valid[k] ? 'text-[#FF8FA3]' : 'text-[#9C97AB]'}`}>{icon}{label}</span>
      <select
        id={`f-${k}`} value={c[k] as string} onChange={e => setContact(k, e.target.value)}
        className={`w-full rounded-xl bg-[#15131C] border px-4 py-3 text-[#F4F2F8] outline-none transition focus:border-[#9B5BFF] ${touched && !valid[k] ? 'border-[#FF8FA3]' : 'border-[#2A2733]'}`}
      >
        <option value="" disabled>Select…</option>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="no-print sticky top-0 z-40 border-b border-[#26232F] bg-[#0C0B11]/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="font-bold text-lg text-[#F4F2F8]">ELVEX <span className="text-[#833FFF]">Partners</span></div>
          {phase === 'questions' && (
            <div className="flex items-center gap-3 w-48 sm:w-64">
              <div className="flex-1 h-1.5 rounded-full bg-[#26232F] overflow-hidden"><div className="h-full bg-[#9B5BFF] transition-all" style={{ width: `${(answeredQ / totalQ) * 100}%` }} /></div>
              <span className="text-xs text-[#9C97AB] tabular-nums">{answeredQ}/{totalQ}</span>
            </div>
          )}
          {phase === 'results' && (
            <button onClick={restart} className="text-xs text-[#9C97AB] hover:text-[#F4F2F8] flex items-center gap-2"><RotateCcw className="w-4 h-4" />New diagnostic</button>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* INTRO */}
        {phase === 'intro' && (
          <section className="hero relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative">
              <p className="text-xs font-semibold tracking-[.3em] uppercase text-[#9B5BFF] mb-5">Executive Diagnostic</p>
              <h1 className="text-4xl sm:text-6xl font-bold text-[#F4F2F8] leading-[1.05] max-w-3xl">Is your organization built to deliver its <span className="text-[#9B5BFF]">strategy</span>?</h1>
              <p className="mt-6 max-w-2xl text-lg text-[#CBC2F2]">In about ten minutes, see where strategy, operating model and people are helping or holding back your priorities, and where to focus first.</p>
              <div className="mt-10 grid sm:grid-cols-3 gap-4 max-w-4xl">
                {(Object.keys(LAYERS) as LayerKey[]).map(k => (
                  <div key={k} className="rounded-2xl border border-[#833FFF]/40 bg-[#15131C]/80 p-5">
                    <div className="w-10 h-10 rounded-xl bg-[#211A30] border border-[#3A2F52] grid place-items-center text-[#B98CFF] mb-3">{LAYER_ICON[k]}</div>
                    <div className="text-[#F4F2F8] font-semibold">{LAYERS[k].title}</div>
                    <div className="text-sm text-[#A39EB2]">{LAYERS[k].tagline}</div>
                  </div>
                ))}
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-5">
                <button onClick={() => setPhase(answeredQ > 0 && detailsValid ? 'questions' : 'details')} className="btn-primary">
                  {answeredQ > 0 ? 'Continue where you left off' : 'Start the diagnostic'} <ArrowRight className="w-5 h-5" />
                </button>
                <span className="flex items-center gap-2 text-sm text-[#9C97AB]"><Clock3 className="w-4 h-4" />{totalQ} statements, about 10 minutes</span>
              </div>
            </div>
          </section>
        )}

        {/* DETAILS */}
        {phase === 'details' && (
          <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
            <p className="text-xs font-semibold tracking-[.3em] uppercase text-[#9B5BFF] mb-3">Step 1 of 2</p>
            <h2 className="text-3xl font-bold text-[#F4F2F8]">About you and your organization</h2>
            <p className="mt-2 text-[#A39EB2]">We use this to tailor your results and to send you the report.</p>
            <div className="mt-8 grid sm:grid-cols-2 gap-5">
              {field('fullName', 'Full name', <UserCircle2 className="w-4 h-4" />, 'e.g. Sara Al Mansoori', 'text', 'Please enter your name.')}
              {field('role', 'Job title', <Briefcase className="w-4 h-4" />, 'e.g. Chief Strategy Officer', 'text', 'Please enter your title.')}
              {field('company', 'Organization', <Building2 className="w-4 h-4" />, 'e.g. Acme Group', 'text', 'Please enter your organization.')}
              {field('email', 'Business email', <Mail className="w-4 h-4" />, 'name@company.com', 'email', 'Please enter a valid email address.')}
              {field('mobile', 'Mobile', <Phone className="w-4 h-4" />, '+971 50 123 4567', 'tel', 'Please include your country code, for example +971.')}
              {select('country', 'Country', <Globe2 className="w-4 h-4" />, COUNTRIES)}
              {select('industry', 'Industry', <Briefcase className="w-4 h-4" />, INDUSTRIES)}
              {select('initiative', 'Main initiative right now', <Target className="w-4 h-4" />, INITIATIVES)}
            </div>
            <label className={`mt-6 flex items-start gap-3 text-sm ${touched && !valid.consent ? 'text-[#FF8FA3]' : 'text-[#A39EB2]'}`}>
              <input id="f-consent" type="checkbox" checked={c.consent} onChange={e => setContact('consent', e.target.checked)} className="mt-1 w-4 h-4 accent-[#833FFF]" />
              <span>I agree that ELVEX Partners may store my answers and contact me about my results. We do not share your data.</span>
            </label>
            <div className="mt-8 flex flex-wrap gap-4 justify-between">
              <button onClick={() => setPhase('intro')} className="btn-ghost"><ArrowLeft className="w-4 h-4" />Back</button>
              <button onClick={() => { setTouched(true); if (detailsValid) { setStep(0); setPhase('questions'); } }} className="btn-primary">Continue to the questions <ArrowRight className="w-5 h-5" /></button>
            </div>
            {touched && !detailsValid && <p className="mt-4 text-sm text-[#FF8FA3]">Please complete the highlighted fields.</p>}
          </section>
        )}

        {/* QUESTIONS */}
        {phase === 'questions' && domain && (
          <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
            <p className="text-xs font-semibold tracking-[.3em] uppercase text-[#9B5BFF] mb-3">Step 2 of 2 · Area {step + 1} of {DOMAINS.length} · {LAYERS[domain.layer].title}</p>
            <h2 className="text-3xl font-bold text-[#F4F2F8]">{domain.title}</h2>
            <p className="mt-2 text-[#A39EB2]">{domain.description} Answer for how things work today, not how they should work.</p>
            <div className="mt-8 space-y-5">
              {domain.questions.map((q, i) => {
                const v = state.answers[q.id];
                return (
                  <div key={q.id} className={`rounded-2xl border p-5 sm:p-6 transition ${v !== undefined ? 'border-[#3A2F52] bg-[#15131C]' : 'border-[#26232F] bg-[#120F19]'}`}>
                    <p className="text-[#F4F2F8] font-medium leading-relaxed"><span className="text-[#9B5BFF] font-semibold mr-2">{i + 1}.</span>{q.text}</p>
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-6 gap-2" role="radiogroup" aria-label={q.text}>
                      {SCALE.map(s => (
                        <button key={s.value} role="radio" aria-checked={v === s.value} onClick={() => setAnswer(q.id, s.value)}
                          className={`rounded-xl border px-2 py-2.5 text-sm transition ${v === s.value ? 'bg-[#833FFF] border-[#9B5BFF] text-white font-semibold' : 'border-[#2A2733] text-[#CBC2F2] hover:border-[#833FFF]'}`}>
                          {s.label}
                        </button>
                      ))}
                      <button role="radio" aria-checked={v === NOT_SURE} onClick={() => setAnswer(q.id, NOT_SURE)}
                        className={`rounded-xl border px-2 py-2.5 text-sm transition col-span-2 sm:col-span-1 ${v === NOT_SURE ? 'bg-[#3A2F52] border-[#5B3A8F] text-white' : 'border-dashed border-[#2A2733] text-[#9C97AB] hover:border-[#5B3A8F]'}`}>
                        Not sure
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 flex flex-wrap gap-4 justify-between items-center">
              <button onClick={() => (step === 0 ? setPhase('details') : setStep(step - 1))} className="btn-ghost"><ArrowLeft className="w-4 h-4" />Back</button>
              {!domainDone && <span className="text-sm text-[#9C97AB]">Answer every statement to continue.</span>}
              {step < DOMAINS.length - 1
                ? <button disabled={!domainDone} onClick={() => setStep(step + 1)} className="btn-primary">Next area <ArrowRight className="w-5 h-5" /></button>
                : <button disabled={!domainDone} onClick={finish} className="btn-primary">See my results <ArrowRight className="w-5 h-5" /></button>}
            </div>
          </section>
        )}

        {/* SUBMITTING */}
        {phase === 'submitting' && (
          <section className="max-w-xl mx-auto px-4 py-32 text-center">
            <Loader2 className="w-10 h-10 mx-auto text-[#9B5BFF] animate-spin" />
            <h2 className="mt-6 text-2xl font-bold text-[#F4F2F8]">Preparing your results</h2>
            <p className="mt-2 text-[#A39EB2]">This can take up to a minute while we write your summary.</p>
          </section>
        )}

        {/* RESULTS */}
        {phase === 'results' && (
          <article className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-10">
            {!delivered && (
              <div className="no-print rounded-xl border border-[#B08A2E] bg-[#2A2210] text-[#F2D58A] p-4 text-sm flex gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>Your results are ready, but we couldn’t reach our server to save them. They are kept on this device and will be sent automatically the next time you open this page.</span>
              </div>
            )}

            <header className="hero rounded-3xl border border-[#2A2733] p-6 sm:p-10 relative overflow-hidden">
              <p className="text-xs font-semibold tracking-[.3em] uppercase text-[#9B5BFF]">Executive Diagnostic results</p>
              <h1 className="mt-3 text-3xl sm:text-5xl font-bold text-[#F4F2F8]">{c.company}</h1>
              <p className="mt-2 text-[#A39EB2]">{c.fullName}, {c.role} · {c.industry} · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <div className="mt-8 grid md:grid-cols-[auto,1fr] gap-8 items-center">
                <div className="flex items-end gap-3">
                  <span className="text-7xl sm:text-8xl font-bold text-[#9B5BFF] leading-none tabular-nums">{results.overall}</span>
                  <span className="text-[#9C97AB] mb-2">/ 100</span>
                </div>
                <div>
                  <span className="inline-block rounded-full border border-[#9B5BFF] bg-[#833FFF]/20 px-3 py-1 text-xs font-semibold tracking-[.14em] uppercase text-[#E6DBFF]">{results.band.name}</span>
                  <p className="mt-3 text-lg text-[#F4F2F8] max-w-2xl">{results.band.summary}</p>
                  <div className="mt-4 max-w-xl"><Bar value={results.overall} /></div>
                  <div className="mt-1 max-w-xl flex justify-between text-[11px] text-[#7C7689]"><span>Fragile</span><span>Developing</span><span>Established</span><span>Leading</span></div>
                </div>
              </div>
            </header>

            <section>
              <h2 className="section-title">Your three layers</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {(Object.keys(LAYERS) as LayerKey[]).map(k => (
                  <div key={k} className={`rounded-2xl border p-5 ${results.weakest.layer === k ? 'border-[#833FFF]/70 bg-[#1A1230]' : 'border-[#2A2733] bg-[#15131C]'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#211A30] border border-[#3A2F52] grid place-items-center text-[#B98CFF]">{LAYER_ICON[k]}</div>
                        <div><div className="font-semibold text-[#F4F2F8]">{LAYERS[k].title}</div><div className="text-xs text-[#9C97AB]">{LAYERS[k].tagline}</div></div>
                      </div>
                      <div className="text-3xl font-bold text-[#9B5BFF] tabular-nums">{results.layers[k] ?? 'n/a'}</div>
                    </div>
                    <div className="mt-4"><Bar value={results.layers[k]} dim={results.weakest.layer !== k} /></div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-[#2A2733] bg-[#15131C] p-5">
                <h3 className="font-semibold text-[#F4F2F8]">Five areas at a glance</h3>
                <p className="text-xs text-[#9C97AB] mb-2">Scores out of 100</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={results.domains.map(d => ({ area: SHORT[d.key] ?? d.title, score: d.index ?? 0 }))} outerRadius="72%">
                      <PolarGrid stroke="#2A2733" />
                      <PolarAngleAxis dataKey="area" tick={{ fill: '#CBC2F2', fontSize: 11 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar dataKey="score" stroke="#9B5BFF" fill="#833FFF" fillOpacity={0.35} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-2xl border border-[#2A2733] bg-[#15131C] p-5 space-y-4">
                {results.domains.map(d => (
                  <div key={d.key}>
                    <div className="flex justify-between text-sm mb-1.5"><span className="text-[#CBC2F2]">{d.title} <span className="text-[#7C7689]">· {LAYERS[d.layer].title}</span></span><span className="font-semibold text-[#F4F2F8] tabular-nums">{d.index ?? 'n/a'}</span></div>
                    <Bar value={d.index} dim={d.key !== results.weakest.key} />
                  </div>
                ))}
                <div className="pt-3 border-t border-[#26232F]">
                  <p className="text-xs font-semibold tracking-[.14em] uppercase text-[#9B5BFF]">Your pattern</p>
                  <p className="mt-1 font-semibold text-[#F4F2F8]">{results.pattern.name}</p>
                  <p className="text-sm text-[#A39EB2]">{results.pattern.description}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#833FFF]/60 bg-[#1A1230] p-6 sm:p-8">
              <p className="text-xs font-semibold tracking-[.14em] uppercase text-[#9B5BFF]">Where to focus first · {LAYERS[results.weakest.layer].title}</p>
              <h2 className="mt-2 text-2xl font-bold text-[#F4F2F8]">{results.weakest.title}</h2>
              <p className="mt-2 text-[#CBC2F2]">{PLAYBOOK[results.weakest.key].outcome}</p>
              <ol className="mt-5 space-y-3">
                {PLAYBOOK[results.weakest.key].actions.map((a, i) => (
                  <li key={i} className="flex gap-3"><span className="w-7 h-7 shrink-0 rounded-full bg-[#833FFF] text-white text-sm font-semibold grid place-items-center">{i + 1}</span><span className="text-[#F4F2F8] pt-0.5">{a}</span></li>
                ))}
              </ol>
            </section>

            <section className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-[#2A2733] bg-[#15131C] p-5">
                <h3 className="flex items-center gap-2 font-semibold text-[#F4F2F8]"><AlertTriangle className="w-4 h-4 text-[#F2B880]" />Biggest gaps you reported</h3>
                <ul className="mt-3 space-y-3 text-sm text-[#CBC2F2]">
                  {results.gaps.length ? results.gaps.map(g => <li key={g.id} className="border-l-2 border-[#5B3A8F] pl-3">{g.text}</li>) : <li>No major gaps stood out in your answers.</li>}
                </ul>
              </div>
              <div className="rounded-2xl border border-[#2A2733] bg-[#15131C] p-5">
                <h3 className="flex items-center gap-2 font-semibold text-[#F4F2F8]"><CheckCircle2 className="w-4 h-4 text-[#8BD8A8]" />Strengths to build on</h3>
                <ul className="mt-3 space-y-3 text-sm text-[#CBC2F2]">
                  {results.strengths.length ? results.strengths.map(g => <li key={g.id} className="border-l-2 border-[#9B5BFF] pl-3">{g.text}</li>) : <li>No clear strengths yet. That is common when an organization is in heavy change.</li>}
                </ul>
              </div>
            </section>

            {insights && (
              <section className="rounded-2xl border border-[#2A2733] bg-[#15131C] p-6 sm:p-8">
                <p className="flex items-center gap-2 text-xs font-semibold tracking-[.14em] uppercase text-[#9B5BFF]"><Sparkles className="w-4 h-4" />What this means for {c.company}</p>
                {insights.headline && <h2 className="mt-2 text-2xl font-bold text-[#F4F2F8]">{insights.headline}</h2>}
                {insights.what_it_means && <p className="mt-3 text-[#CBC2F2]">{insights.what_it_means}</p>}
                {insights.leadership_risk && <p className="mt-3 text-[#F4F2F8]"><b className="text-[#9B5BFF]">Leadership risk: </b>{insights.leadership_risk}</p>}
                {!!insights.symptoms?.length && (
                  <div className="mt-5"><p className="text-sm font-semibold text-[#F4F2F8]">What leaders are likely to notice</p>
                    <ul className="mt-2 grid sm:grid-cols-2 gap-2 text-sm text-[#CBC2F2]">{insights.symptoms.map((s, i) => <li key={i} className="rounded-lg bg-[#120F19] border border-[#26232F] px-3 py-2">{s}</li>)}</ul></div>
                )}
                {!!insights.priorities?.length && (
                  <div className="mt-6 grid md:grid-cols-3 gap-4">{insights.priorities.slice(0, 3).map((p, i) => (
                    <div key={i} className="rounded-xl border border-[#3A2F52] bg-[#120F19] p-4">
                      <p className="text-xs text-[#9B5BFF] font-semibold">Priority {i + 1}</p>
                      <p className="font-semibold text-[#F4F2F8] mt-1">{p.title}</p>
                      <p className="text-sm text-[#A39EB2] mt-1">{p.why}</p>
                      <p className="text-sm text-[#CBC2F2] mt-2"><b>First step:</b> {p.first_step}</p>
                    </div>))}</div>
                )}
              </section>
            )}

            <section className="no-print rounded-2xl border border-[#2A2733] bg-[#15131C] p-6 sm:p-8 grid lg:grid-cols-[1.2fr,1fr] gap-8">
              <div>
                <h2 className="text-2xl font-bold text-[#F4F2F8]">Talk it through with ELVEX</h2>
                <p className="mt-2 text-[#A39EB2]">A 30 minute debrief with an ELVEX partner turns these results into a practical plan for {c.company}. There is no cost and no obligation.</p>
                {debrief === 'sent' ? (
                  <p className="mt-5 flex items-center gap-2 text-[#8BD8A8]"><CheckCircle2 className="w-5 h-5" />Thanks, we’ll be in touch at {c.email} within one working day.</p>
                ) : (
                  <>
                    <textarea id="f-debrief" value={debriefNote} onChange={e => setDebriefNote(e.target.value)} rows={3} placeholder="Anything you’d like us to focus on? (optional)"
                      className="mt-5 w-full rounded-xl bg-[#120F19] border border-[#2A2733] px-4 py-3 text-[#F4F2F8] placeholder:text-[#615C70] outline-none focus:border-[#9B5BFF]" />
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button onClick={sendDebrief} disabled={debrief === 'sending'} className="btn-primary">{debrief === 'sending' ? <><Loader2 className="w-5 h-5 animate-spin" />Sending</> : <><Send className="w-5 h-5" />Request a debrief</>}</button>
                      <button onClick={() => window.print()} className="btn-ghost"><Printer className="w-4 h-4" />Save as PDF</button>
                    </div>
                    {debrief === 'error' && <p className="mt-3 text-sm text-[#FF8FA3]">That didn’t go through. Please try again, or email contact@elvexpartners.com.</p>}
                  </>
                )}
              </div>
              <div className="rounded-xl border border-[#26232F] bg-[#120F19] p-5 text-sm text-[#A39EB2] space-y-2">
                <p className="flex items-center gap-2 text-[#F4F2F8] font-semibold"><ShieldCheck className="w-4 h-4 text-[#9B5BFF]" />About your results</p>
                <p>Scores reflect your own view of how the organization works today. They are a starting point for discussion, not an audit.</p>
                <p>Reference: <span className="text-[#CBC2F2] tabular-nums">{state.submissionId}</span></p>
              </div>
            </section>

            <p className="text-center text-sm text-[#7C7689]">We elevate clarity, execute change, and evolve organizations. · elvexpartners.com</p>
          </article>
        )}
      </main>
    </div>
  );
};

export default App;
