import { DEBRIEF_WEBHOOK, DOMAINS, INTAKE_WEBHOOK, SCALE } from '../constants';
import { AIInsights, Results, SavedState } from '../types';
import { buildReportHtml } from './reportEmail';

const PENDING_KEY = 'elvex_diag_pending_v2';

function labelFor(v: number) {
  return v === 0 ? 'Not sure' : SCALE.find(s => s.value === v)?.label ?? '';
}

// One flat, complete payload. Every field Make maps is at the top level, so nothing arrives blank.
export function buildPayload(state: SavedState, r: Results) {
  const c = state.contact;
  const answers = DOMAINS.flatMap(d =>
    d.questions.map(q => ({
      id: q.id,
      domain: d.title,
      layer: d.layer,
      statement: q.text,
      value: state.answers[q.id] ?? null,
      label: state.answers[q.id] !== undefined ? labelFor(state.answers[q.id]) : 'Not answered',
      reverse: !!q.reverse,
    })),
  );
  const domainScores = r.domains.map(d => ({ domain: d.title, layer: d.layer, index: d.index }));
  const answersText = DOMAINS.map(d =>
    `${d.title}\n` + d.questions.map(q => `  ${q.id}. ${q.text}\n     Answer: ${state.answers[q.id] !== undefined ? labelFor(state.answers[q.id]) : 'Not answered'}${q.reverse ? ' (reverse scored)' : ''}`).join('\n'),
  ).join('\n\n');
  const [firstName, ...rest] = c.fullName.trim().split(/\s+/);

  return {
    source: 'ELVEX Executive Diagnostic',
    submissionId: state.submissionId,
    submittedAt: new Date().toISOString(),
    fullName: c.fullName.trim(),
    firstName: rest.length ? firstName : '',
    lastName: rest.length ? rest.join(' ') : firstName,
    role: c.role.trim(),
    company: c.company.trim(),
    email: c.email.trim(),
    mobile: c.mobile.trim(),
    country: c.country,
    industry: c.industry,
    initiative: c.initiative,
    consent: c.consent,
    overallIndex: r.overall,
    band: r.band.name,
    pattern: r.pattern.name,
    elevateIndex: r.layers.elevate,
    executeIndex: r.layers.execute,
    evolveIndex: r.layers.evolve,
    weakestDomain: r.weakest.title,
    strongestDomain: r.strongest.title,
    domainScoresText: domainScores.map(d => `${d.domain}: ${d.index ?? 'n/a'}/100`).join('\n'),
    gapsText: r.gaps.map(g => `- ${g.text}`).join('\n'),
    answersText,
    reportHtml: buildReportHtml(c, r, state.submissionId),
    domainScores,
    answers,
  };
}

async function post(url: string, body: unknown, timeoutMs: number): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

function savePending(payload: unknown) {
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(payload)); } catch { /* storage unavailable */ }
}
function clearPending() {
  try { localStorage.removeItem(PENDING_KEY); } catch { /* storage unavailable */ }
}

// Sends the submission once. Returns AI insights if Make sends them back, otherwise null.
// The submission is kept locally until Make confirms receipt, and retried on the next visit.
export async function submitDiagnostic(payload: ReturnType<typeof buildPayload>): Promise<{ delivered: boolean; insights: AIInsights | null }> {
  savePending(payload);
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const text = await post(INTAKE_WEBHOOK, payload, 45000);
      clearPending();
      try {
        const parsed = JSON.parse(text);
        return { delivered: true, insights: parsed && parsed.insights ? (parsed.insights as AIInsights) : null };
      } catch {
        return { delivered: true, insights: null }; // Make replied "Accepted" without a body
      }
    } catch {
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  return { delivered: false, insights: null };
}

export async function retryPendingSubmission() {
  let raw: string | null = null;
  try { raw = localStorage.getItem(PENDING_KEY); } catch { return; }
  if (!raw) return;
  try {
    await post(INTAKE_WEBHOOK, { ...JSON.parse(raw), retried: true }, 20000);
    clearPending();
  } catch { /* try again next visit */ }
}

export async function requestDebrief(payload: ReturnType<typeof buildPayload>, note: string) {
  await post(DEBRIEF_WEBHOOK, { ...payload, debriefRequested: true, debriefNote: note.trim() }, 20000);
}
