import React from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, FileText, MessageSquare } from 'lucide-react';
import { COUNTRIES, INDUSTRIES, INITIATIVES } from '../constants';
import { Contact } from '../types';

type Valid = Record<keyof Contact, boolean>;
interface Props {
  contact: Contact; valid: Valid; touched: boolean;
  onChange: (k: keyof Contact, v: string | boolean) => void;
  onBack: () => void; onNext: () => void;
}

const ERR: Partial<Record<keyof Contact, string>> = {
  fullName: 'Enter your full name.', role: 'Enter your job title.', company: 'Enter your organization’s name.',
  email: 'Enter a valid email address, for example name@company.com.', mobile: 'Include your country code, for example +971 50 123 4567.',
  country: 'Choose a country.', industry: 'Choose an industry.', initiative: 'Choose the initiative that matters most.',
};

export const Details: React.FC<Props> = ({ contact: c, valid, touched, onChange, onBack, onNext }) => {
  const bad = (k: keyof Contact) => touched && !valid[k];
  const Text = (k: keyof Contact, label: string, ph: string, type = 'text', auto?: string) => (
    <div>
      <label htmlFor={`f-${k}`} className="field-label">{label}</label>
      <input id={`f-${k}`} type={type} autoComplete={auto} value={c[k] as string} placeholder={ph}
        onChange={e => onChange(k, e.target.value)} className={`field ${bad(k) ? 'invalid' : ''}`} aria-invalid={bad(k)} />
      {bad(k) && <p className="field-error">{ERR[k]}</p>}
    </div>
  );
  const Pick = (k: keyof Contact, label: string, opts: string[]) => (
    <div>
      <label htmlFor={`f-${k}`} className="field-label">{label}</label>
      <select id={`f-${k}`} value={c[k] as string} onChange={e => onChange(k, e.target.value)} className={`field ${bad(k) ? 'invalid' : ''}`} aria-invalid={bad(k)}>
        <option value="" disabled>Choose one</option>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      {bad(k) && <p className="field-error">{ERR[k]}</p>}
    </div>
  );
  const missing = touched ? Object.values(valid).filter(v => !v).length : 0;

  return (
    <section className="wrap py-12 sm:py-16 grid lg:grid-cols-[1.6fr,1fr] gap-10 lg:gap-14 items-start">
      <div>
        <h1 className="display text-[clamp(2rem,4vw,2.9rem)]">First, a little about you</h1>
        <p className="lede mt-3">This shapes your report and tells us where to send it.</p>

        <form className="mt-9 space-y-8" onSubmit={e => { e.preventDefault(); onNext(); }} noValidate>
          <fieldset className="panel p-6 sm:p-7">
            <legend className="h3 px-1">You</legend>
            <div className="mt-4 grid sm:grid-cols-2 gap-5">
              {Text('fullName', 'Full name', 'Sara Al Mansoori', 'text', 'name')}
              {Text('role', 'Job title', 'Chief Strategy Officer', 'text', 'organization-title')}
              {Text('email', 'Work email', 'name@company.com', 'email', 'email')}
              {Text('mobile', 'Mobile', '+971 50 123 4567', 'tel', 'tel')}
            </div>
          </fieldset>

          <fieldset className="panel p-6 sm:p-7">
            <legend className="h3 px-1">Your organization</legend>
            <div className="mt-4 grid sm:grid-cols-2 gap-5">
              {Text('company', 'Organization', 'Acme Group', 'text', 'organization')}
              {Pick('country', 'Country', COUNTRIES)}
              {Pick('industry', 'Industry', INDUSTRIES)}
              {Pick('initiative', 'Initiative that matters most right now', INITIATIVES)}
            </div>
          </fieldset>

          <label className={`flex items-start gap-3 text-sm cursor-pointer ${bad('consent') ? 'text-[var(--bad)]' : 'text-[var(--body)]'}`}>
            <input id="f-consent" type="checkbox" checked={c.consent} onChange={e => onChange('consent', e.target.checked)} className="mt-0.5 w-5 h-5 accent-[#833FFF] shrink-0" />
            <span>ELVEX Partners may store my answers and contact me about my results. My details are never shared with anyone else.</span>
          </label>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <button type="button" onClick={onBack} className="btn btn-quiet"><ArrowLeft className="w-4 h-4" />Back</button>
            <div className="flex items-center gap-4">
              {missing > 0 && <span className="text-sm text-[var(--bad)]">{missing === 1 ? '1 field needs attention' : `${missing} fields need attention`}</span>}
              <button type="submit" className="btn btn-primary">Continue to the statements<ArrowRight className="w-5 h-5" /></button>
            </div>
          </div>
        </form>
      </div>

      <aside className="lg:sticky lg:top-28 panel-violet p-6 sm:p-7 space-y-6">
        <h2 className="h3">What happens next</h2>
        <ul className="space-y-5 text-sm">
          <li className="flex gap-3"><span className="tile w-9 h-9 rounded-xl"><FileText /></span><span><b className="text-[var(--text)] font-semibold block">31 statements in five areas</b>About eight minutes. You can come back later; progress saves on this device.</span></li>
          <li className="flex gap-3"><span className="tile w-9 h-9 rounded-xl"><ShieldCheck /></span><span><b className="text-[var(--text)] font-semibold block">Your report, straight away</b>Scores, your pattern and the area to fix first appear on screen when you finish.</span></li>
          <li className="flex gap-3"><span className="tile w-9 h-9 rounded-xl"><MessageSquare /></span><span><b className="text-[var(--text)] font-semibold block">An optional debrief</b>If you’d like, an ELVEX partner will walk you through the results. No cost, no obligation.</span></li>
        </ul>
      </aside>
    </section>
  );
};
