import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, RotateCcw } from 'lucide-react';
import { DOMAINS } from './constants';
import { AIInsights, Contact, SavedState } from './types';
import { computeResults } from './services/scoring';
import { buildPayload, requestDebrief, retryPendingSubmission, submitDiagnostic } from './services/submit';
import { Stepper, Wordmark } from './components/ui';
import { Intro } from './components/Intro';
import { Details } from './components/Details';
import { Questions } from './components/Questions';
import { Results } from './components/Results';

const STORE_KEY = 'elvex_diag_state_v2';
type Phase = 'intro' | 'details' | 'questions' | 'submitting' | 'results';

const newId = () => `EXD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
const emptyContact: Contact = { fullName: '', role: '', company: '', email: '', mobile: '', country: '', industry: '', initiative: '', consent: false };

const load = (): SavedState => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) { const s = JSON.parse(raw); if (s && s.contact && s.answers) return s; }
  } catch { /* storage unavailable */ }
  return { submissionId: newId(), contact: emptyContact, answers: {} };
};

const App: React.FC = () => {
  const [state, setState] = useState<SavedState>(load);
  const [phase, setPhase] = useState<Phase>('intro');
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState(false);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [delivered, setDelivered] = useState(true);
  const [note, setNote] = useState('');
  const [debrief, setDebrief] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [sent, setSent] = useState<'sending' | 'sent' | 'resent' | 'error'>('sending');

  useEffect(() => { retryPendingSubmission(); }, []);
  useEffect(() => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* ignore */ } }, [state]);
  useEffect(() => { if (phase !== 'questions') window.scrollTo({ top: 0 }); }, [phase]);

  const c = state.contact;
  const valid = useMemo(() => ({
    fullName: c.fullName.trim().length >= 2,
    role: c.role.trim().length >= 2,
    company: c.company.trim().length >= 2,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email.trim()),
    mobile: /^\+?[0-9\s()]{8,}$/.test(c.mobile.trim()) && c.mobile.replace(/\D/g, '').length >= 8,
    country: !!c.country, industry: !!c.industry, initiative: !!c.initiative, consent: c.consent,
  }), [c]);
  const detailsValid = Object.values(valid).every(Boolean);
  const total = DOMAINS.reduce((n, d) => n + d.questions.length, 0);
  const answered = Object.keys(state.answers).length;
  const results = useMemo(() => computeResults(state.answers), [state.answers]);

  const start = () => {
    if (answered > 0 && detailsValid) {
      const firstOpen = DOMAINS.findIndex(d => d.questions.some(q => state.answers[q.id] === undefined));
      setStep(firstOpen === -1 ? DOMAINS.length - 1 : firstOpen);
      setPhase('questions');
    } else setPhase('details');
  };

  const finish = async () => {
    setPhase('submitting');
    const res = await submitDiagnostic(buildPayload(state, results));
    setDelivered(res.delivered);
    setInsights(res.insights);
    setSent(res.delivered ? 'sent' : 'error');
    setPhase('results');
  };

  // Respondent corrected their email: update it and send the report again (ELVEX is not emailed twice).
  const resend = async (email: string) => {
    const next = { ...state, contact: { ...state.contact, email } };
    setState(next);
    setSent('sending');
    const res = await submitDiagnostic({ ...buildPayload(next, results), resend: true } as ReturnType<typeof buildPayload>);
    if (res.delivered) setDelivered(true);
    setSent(res.delivered ? 'resent' : 'error');
  };

  const sendDebrief = async () => {
    setDebrief('sending');
    try { await requestDebrief(buildPayload(state, results), note); setDebrief('sent'); }
    catch { setDebrief('error'); }
  };

  const restart = () => {
    if (!window.confirm('Start a new diagnostic? Your answers on this device will be cleared.')) return;
    setState({ submissionId: newId(), contact: emptyContact, answers: {} });
    setInsights(null); setDebrief('idle'); setNote(''); setTouched(false); setStep(0); setPhase('intro');
  };

  const stepKey = phase === 'details' ? 'details' : phase === 'results' ? 'results' : 'questions';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="no-print sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(12,11,17,.92)] backdrop-blur-md">
        <div className="wrap h-16 flex items-center justify-between gap-4">
          <button onClick={() => phase !== 'submitting' && setPhase(phase === 'results' ? 'results' : 'intro')} aria-label="ELVEX Partners, diagnostic home"><Wordmark /></button>
          {phase !== 'intro' && phase !== 'submitting' && <Stepper current={stepKey} />}
          {phase === 'results'
            ? <button onClick={restart} className="hidden sm:flex items-center gap-2 text-sm text-[var(--body)] hover:text-[var(--text)]"><RotateCcw className="w-4 h-4" />New diagnostic</button>
            : <span className="hidden sm:block w-28" />}
        </div>
      </header>

      <main className="flex-1">
        {phase === 'intro' && <Intro resume={answered > 0} total={total} onStart={start} />}
        {phase === 'details' && (
          <Details contact={c} valid={valid} touched={touched}
            onChange={(k, v) => setState(s => ({ ...s, contact: { ...s.contact, [k]: v } }))}
            onBack={() => setPhase('intro')}
            onNext={() => { setTouched(true); if (detailsValid) { setStep(0); setPhase('questions'); } }} />
        )}
        {phase === 'questions' && (
          <Questions step={step} answers={state.answers}
            onAnswer={(id, v) => setState(s => ({ ...s, answers: { ...s.answers, [id]: v } }))}
            onGoTo={setStep}
            onBack={() => (step === 0 ? setPhase('details') : setStep(step - 1))}
            onFinish={finish} />
        )}
        {phase === 'submitting' && (
          <section className="wrap py-40 text-center">
            <Loader2 className="w-10 h-10 mx-auto text-[var(--violet-hi)] animate-spin" />
            <h1 className="h2 mt-6">Preparing your report</h1>
            <p className="mt-2 text-[var(--body)]">This usually takes a few seconds.</p>
          </section>
        )}
        {phase === 'results' && (
          <Results contact={c} results={results} delivered={delivered} reference={state.submissionId} sent={sent} onResend={resend}
            note={note} onNote={setNote} debrief={debrief} onDebrief={sendDebrief} />
        )}
      </main>

      <footer className="border-t border-[var(--line)]">
        <div className="wrap py-7 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--muted)]">
          <span>We elevate clarity, execute change, and evolve organizations.</span>
          <span>elvexpartners.com</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
