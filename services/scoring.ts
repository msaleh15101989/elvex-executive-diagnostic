import { DOMAINS, LAYERS } from '../constants';
import { DomainScore, ItemScore, LayerKey, Results } from '../types';

const toIndex = (avg: number) => Math.round(((avg - 1) / 4) * 100);
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export function bandFor(index: number) {
  if (index >= 80) return { name: 'Leading', summary: 'Strategy, delivery and people are working as one system. The task is to protect it and scale it.' };
  if (index >= 60) return { name: 'Established', summary: 'The foundations are in place, but a few weak links still slow delivery and dilute value.' };
  if (index >= 40) return { name: 'Developing', summary: 'Ambition is ahead of the organization’s ability to deliver. Results depend heavily on individual effort.' };
  return { name: 'Fragile', summary: 'Execution is at risk. Priorities, decisions and adoption need to be stabilized before more change is added.' };
}

export function scoreItems(answers: Record<string, number>): ItemScore[] {
  const items: ItemScore[] = [];
  for (const d of DOMAINS) {
    for (const q of d.questions) {
      const raw = answers[q.id];
      if (!raw) continue; // unanswered or "not sure"
      items.push({ id: q.id, domain: d.key, text: q.text, raw, scored: q.reverse ? 6 - raw : raw });
    }
  }
  return items;
}

function patternFor(layers: Record<LayerKey, number | null>) {
  const e = layers.elevate ?? 0, x = layers.execute ?? 0, v = layers.evolve ?? 0;
  const spread = Math.max(e, x, v) - Math.min(e, x, v);
  if (spread < 12) {
    return e >= 60
      ? { name: 'Balanced and building', description: 'Strategy, delivery and people are moving at a similar pace. Gains will come from sharpening, not fixing.' }
      : { name: 'Broadly stretched', description: 'All three layers need attention at once, so sequencing matters more than starting everything.' };
  }
  if (e > x && e > v) return { name: 'Strategy ahead of delivery', description: 'Leaders are clear on direction, but the operating model and people side are not yet carrying it. Expect busy programs with slow results.' };
  if (x > e && x > v) return { name: 'Systems ahead of people', description: 'Processes and technology are in place, but behavior and capacity lag behind. Expect tools that go live without changing how people work.' };
  return { name: 'Effort without direction', description: 'People are committed and adaptable, but direction and governance are not giving them a clear lane. Expect energy spent on competing priorities.' };
}

export function computeResults(answers: Record<string, number>): Results {
  const items = scoreItems(answers);
  const domains: DomainScore[] = DOMAINS.map(d => {
    const ds = items.filter(i => i.domain === d.key).map(i => i.scored);
    const avg = mean(ds);
    return { key: d.key, title: d.title, layer: d.layer, index: avg === null ? null : toIndex(avg), answered: ds.length, total: d.questions.length };
  });

  const layers = (Object.keys(LAYERS) as LayerKey[]).reduce((acc, k) => {
    const vals = domains.filter(d => d.layer === k && d.index !== null).map(d => d.index as number);
    const m = mean(vals);
    acc[k] = m === null ? null : Math.round(m);
    return acc;
  }, {} as Record<LayerKey, number | null>);

  const scored = domains.filter(d => d.index !== null);
  const overall = Math.round(mean(scored.map(d => d.index as number)) ?? 0);
  const sorted = [...scored].sort((a, b) => (a.index as number) - (b.index as number));
  const byItem = [...items].sort((a, b) => a.scored - b.scored);

  return {
    overall,
    band: bandFor(overall),
    layers,
    domains,
    weakest: sorted[0] ?? domains[0],
    strongest: sorted[sorted.length - 1] ?? domains[0],
    pattern: patternFor(layers),
    gaps: byItem.filter(i => i.scored <= 3).slice(0, 4),
    strengths: [...byItem].reverse().filter(i => i.scored >= 4).slice(0, 3),
  };
}
