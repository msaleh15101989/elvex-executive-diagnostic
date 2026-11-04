# ELVEX Executive Diagnostic

A ten minute assessment of how well an organization is set up to deliver its strategy, built around the ELVEX layers:

- **Elevate**: strategic direction, business alignment
- **Execute**: operating model and governance, technology, data and AI
- **Evolve**: leadership, people and adoption

31 statements, answered on a five point agreement scale with a "Not sure" option (excluded from scores). Items that describe a problem are reverse scored. Each area, layer and the overall result are shown as an index out of 100, with a band (Fragile, Developing, Established, Leading), a pattern, the area to focus on first with ELVEX recommendations, and the biggest gaps and strengths.

## How data flows

1. When the respondent finishes, the site sends **one complete submission** to the Make webhook `ELVEX Diagnostic Intake` (`INTAKE_WEBHOOK` in `constants.tsx`). It includes contact details, every answer, and all scores as flat fields.
2. Make emails the full submission to moataz.saleh@elvexpartners.com and replies to the site with `{"ok": true, "insights": ...}`.
3. If the webhook can't be reached, the submission is kept in the browser and retried automatically on the next visit.
4. "Request a debrief" on the results page posts to the `ELVEX Assessment Intake` webhook (`DEBRIEF_WEBHOOK`), which emails the request.

No API keys are stored in the site. The optional AI narrative runs inside Make (Gemini), and the results page shows it when Make returns an `insights` object with `headline`, `what_it_means`, `leadership_risk`, `symptoms` and `priorities`.

## Run locally

Prerequisites: Node.js (LTS)

```
npm install
npm run dev
```

## Build

```
npm run build
```

The output is in `dist/`. Deploy it as a static site. No environment variables are needed.

## Editing questions

Questions, areas, industries, initiatives and the recommendation playbook are all in `constants.tsx`. Scoring rules are in `services/scoring.ts`.
