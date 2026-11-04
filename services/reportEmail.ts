import { LAYERS, PLAYBOOK } from '../constants';
import { Contact, LayerKey, Results } from '../types';

// Builds the respondent's report as email-safe HTML (tables and inline styles only),
// so the copy ELVEX receives matches what the respondent saw on screen.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const V = '#7B2CFF', V2 = '#5A1FC4', INK = '#16131F', BODY = '#4A4658', MUTED = '#8B8597', LINE = '#E7E3F2', SOFT = '#F6F3FF';

const bar = (value: number | null, strong: boolean) => {
  const v = Math.round(Math.max(0, Math.min(100, value ?? 0)));
  // Email clients stretch a 0% cell, so an empty bar is drawn as a single grey track.
  if (v <= 0) return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr><td style="background:#ECE8F6;height:8px;border-radius:4px;font-size:0;line-height:0">&nbsp;</td></tr></table>`;
  if (v >= 100) return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr><td style="background:${strong ? V : '#B9A3EE'};height:8px;border-radius:4px;font-size:0;line-height:0">&nbsp;</td></tr></table>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr>
    <td width="${v}%" style="background:${strong ? V : '#B9A3EE'};height:8px;border-radius:4px;font-size:0;line-height:0">&nbsp;</td>
    <td style="background:#ECE8F6;height:8px;font-size:0;line-height:0">&nbsp;</td></tr></table>`;
};
const label = (t: string) => `<p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;color:${V}">${t}</p>`;
const h2 = (t: string) => `<h2 style="margin:0 0 12px;font-family:Montserrat,Arial,sans-serif;font-size:18px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:${INK}">${t}</h2>`;
const section = (inner: string, bg = '#FFFFFF') => `<tr><td style="padding:24px 28px;background:${bg};border-top:1px solid ${LINE}">${inner}</td></tr>`;

export function buildReportHtml(c: Contact, r: Results, reference: string) {
  const play = PLAYBOOK[r.weakest.key];
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const layerKeys = Object.keys(LAYERS) as LayerKey[];
  const domainsSorted = [...r.domains].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  const layers = layerKeys.map(k => {
    const focus = r.weakest.layer === k;
    return `<td width="33%" valign="top" style="padding:14px;border:1px solid ${focus ? V : LINE};border-radius:10px;background:${focus ? SOFT : '#FFFFFF'}">
      <p style="margin:0;font-size:14px;font-weight:bold;color:${INK}">${LAYERS[k].title}${focus ? ` <span style="font-size:10px;color:${V};letter-spacing:1px">FOCUS FIRST</span>` : ''}</p>
      <p style="margin:2px 0 8px;font-size:12px;color:${MUTED}">${esc(LAYERS[k].tagline)}</p>
      <p style="margin:0 0 8px;font-size:28px;font-weight:bold;color:${V}">${r.layers[k] ?? 'n/a'}</p>${bar(r.layers[k], focus)}</td>`;
  }).join('<td width="8" style="font-size:0">&nbsp;</td>');

  const areas = domainsSorted.map(d => `<tr>
      <td style="padding:7px 0;font-size:14px;color:${INK}">${esc(d.title)} <span style="color:${MUTED};font-size:12px">${LAYERS[d.layer].title}</span></td>
      <td width="40" align="right" style="padding:7px 0;font-size:14px;font-weight:bold;color:${INK}">${d.index ?? 'n/a'}</td></tr>
      <tr><td colspan="2" style="padding:0 0 6px">${bar(d.index, d.key === r.weakest.key)}</td></tr>`).join('');

  const list = (items: string[], empty: string, color: string) => items.length
    ? items.map(t => `<p style="margin:0 0 10px;padding-left:10px;border-left:3px solid ${color};font-size:14px;color:${BODY};line-height:1.5">${esc(t)}</p>`).join('')
    : `<p style="margin:0;font-size:14px;color:${MUTED}">${empty}</p>`;

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;border:1px solid ${LINE};border-radius:12px;overflow:hidden">
  <tr><td style="padding:28px;background:#07070A;background-image:linear-gradient(135deg,#07070A 0%,#140B2A 100%)">
    <p style="margin:0 0 18px;font-size:15px;font-weight:bold;color:#F4F6FF">ELVEX Partners</p>
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;color:#A97BFF">Executive Diagnostic report</p>
    <h1 style="margin:0 0 6px;font-family:Montserrat,Arial,sans-serif;font-size:26px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#F4F6FF">${esc(c.company)}</h1>
    <p style="margin:0 0 20px;font-size:13px;color:#D5D7E2">Prepared for ${esc(c.fullName)}, ${esc(c.role)} · ${esc(c.industry)}, ${esc(c.country)} · ${date} · Ref ${esc(reference)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td valign="middle" style="padding-right:20px;white-space:nowrap"><span style="font-size:56px;font-weight:bold;color:#9457FF;line-height:1">${r.overall}</span><span style="font-size:14px;color:#A7A9B5"> / 100</span></td>
      <td valign="middle"><span style="display:inline-block;padding:4px 10px;border:1px solid #9457FF;border-radius:999px;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#ECE6FF">${r.band.name}</span>
        <p style="margin:8px 0 0;font-size:14px;color:#F4F6FF;line-height:1.5">${esc(r.band.summary)}</p></td></tr></table>
  </td></tr>
  ${section(`${label('Your three layers')}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate"><tr>${layers}</tr></table>`)}
  ${section(`${label('Five areas in detail')}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${areas}</table>
    <div style="margin-top:14px;padding:14px;background:${SOFT};border-radius:10px">${label('Pattern')}<p style="margin:0 0 4px;font-size:16px;font-weight:bold;color:${INK}">${esc(r.pattern.name)}</p><p style="margin:0;font-size:14px;color:${BODY};line-height:1.5">${esc(r.pattern.description)}</p></div>`)}
  ${section(`${label(`Where to focus first · ${LAYERS[r.weakest.layer].title}`)}${h2(esc(r.weakest.title))}
    <p style="margin:0 0 14px;font-size:14px;color:${BODY};line-height:1.5">${esc(play.outcome)}</p>
    ${play.actions.map((a, i) => `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 10px"><tr>
      <td valign="top" style="padding-right:10px"><span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;border-radius:12px;background:${V};color:#fff;font-size:12px;font-weight:bold">${i + 1}</span></td>
      <td style="font-size:14px;color:${INK};line-height:1.5">${esc(a)}</td></tr></table>`).join('')}`, SOFT)}
  ${section(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td width="50%" valign="top" style="padding-right:12px">${label('Biggest gaps reported')}${list(r.gaps.map(g => g.text), 'No major gaps stood out.', '#F2B880')}</td>
    <td width="50%" valign="top" style="padding-left:12px">${label('Strengths to build on')}${list(r.strengths.map(g => g.text), 'No clear strengths yet.', V2)}</td></tr></table>`)}
  <tr><td style="padding:16px 28px;background:#07070A;font-size:12px;color:#A7A9B5">Scores reflect the respondent’s own view of how the organization works today. We elevate clarity, execute change, and evolve organizations. · elvexpartners.com</td></tr>
</table>`;
}
