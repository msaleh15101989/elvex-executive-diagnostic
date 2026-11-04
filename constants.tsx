import { Domain, LayerKey } from './types';

// Make webhook that receives every completed diagnostic (scenario: "ELVEX Diagnostic Intake").
export const INTAKE_WEBHOOK = 'https://hook.us2.make.com/qreddyfw8kcs3xsy1ksoqiwhiuamtj0h';
// Make webhook used when a respondent asks for a debrief call.
export const DEBRIEF_WEBHOOK = 'https://hook.us2.make.com/104fjxk55vbs3gb23feh1c8py457hlvv';

export const LAYERS: Record<LayerKey, { title: string; tagline: string; service: string }> = {
  elevate: { title: 'Elevate', tagline: 'Strategy and leadership clarity', service: 'Strategy and organizational clarity' },
  execute: { title: 'Execute', tagline: 'Operating model, governance and technology', service: 'Transformation and performance powered by AI' },
  evolve: { title: 'Evolve', tagline: 'People, behaviors and adoption', service: 'Leadership, people and culture' },
};

export const SCALE = [
  { value: 1, label: 'Strongly disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Partly' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly agree' },
];
export const NOT_SURE = 0;

// Statements are scored 1 to 5. Items marked reverse describe a problem, so agreement lowers the score.
export const DOMAINS: Domain[] = [
  {
    key: 'direction', layer: 'elevate', title: 'Strategic direction',
    description: 'How clear, stable and focused the organization’s direction is.',
    questions: [
      { id: 'c1', text: 'Our leadership team shares one clear view of where the organization must be in three to five years.' },
      { id: 'c2', text: 'Our top priorities have stayed stable for the past 12 months, even under short term pressure.' },
      { id: 'c3', text: 'If asked separately, our senior leaders would describe this year’s success in the same terms.' },
      { id: 'c4', text: 'We have deliberately stopped activities or initiatives to protect focus on our priorities.' },
      { id: 'c5', text: 'New investments are approved against clear strategic criteria, not by who argues hardest.' },
      { id: 'c6', text: 'Our strategy names the specific advantage we are building that competitors would struggle to copy.' },
    ],
  },
  {
    key: 'alignment', layer: 'elevate', title: 'Business alignment',
    description: 'Whether functions pull in the same direction behind the strategy.',
    questions: [
      { id: 'b1', text: 'Each department head can explain how their team’s work drives the organization’s top priorities.' },
      { id: 'b2', text: 'Functions are willing to trade off their own targets when it benefits the organization as a whole.' },
      { id: 'b3', text: 'Functional plans (technology, HR, finance, commercial) are built together rather than in separate silos.' },
      { id: 'b4', text: 'Cross functional initiatives have one accountable owner with authority across the departments involved.' },
      { id: 'b5', text: 'Our KPIs connect directly to strategic outcomes rather than measuring activity.' },
      { id: 'b6', text: 'We share a specific definition of the customers and markets we prioritize.' },
    ],
  },
  {
    key: 'operating', layer: 'execute', title: 'Operating model and governance',
    description: 'How decisions, priorities and benefits are managed in practice.',
    questions: [
      { id: 'o1', text: 'Decision rights are clear: people know which decisions they can make without escalating.' },
      { id: 'o2', text: 'Leadership meetings are used to make decisions, not just to review status updates.' },
      { id: 'o3', text: 'When an initiative is blocked, we can get a clear senior decision within a few days.' },
      { id: 'o4', text: 'We run more initiatives at the same time than we realistically have capacity to deliver.', reverse: true },
      { id: 'o5', text: 'We track the benefits of each major initiative after go live, not just delivery milestones.' },
      { id: 'o6', text: 'Our processes are designed around the full customer journey rather than departmental boundaries.' },
    ],
  },
  {
    key: 'technology', layer: 'execute', title: 'Technology, data and AI',
    description: 'Whether systems, data and AI actively drive the work.',
    questions: [
      { id: 't1', text: 'Our core systems guide how work is done, rather than only recording what was done.' },
      { id: 't2', text: 'Managers lead with reliable system dashboards instead of manual spreadsheets.' },
      { id: 't3', text: 'Teams keep parallel manual trackers because they do not fully trust system data.', reverse: true },
      { id: 't4', text: 'AI is built into specific business workflows with an owner and measurable targets, not only used for drafting text.' },
      { id: 't5', text: 'Our data is connected well enough to give a single, trusted view of customers and operations.' },
      { id: 't6', text: 'We have clear rules for how AI may be used, who checks its output and how risk is managed.' },
    ],
  },
  {
    key: 'people', layer: 'evolve', title: 'Leadership, people and adoption',
    description: 'Whether people have the clarity, capability and capacity to change.',
    questions: [
      { id: 'p1', text: 'Most employees could explain how their daily work connects to our strategic priorities.' },
      { id: 'p2', text: 'Senior leaders visibly use the new tools and processes they ask others to adopt.' },
      { id: 'p3', text: 'Line managers have the time and skills to coach their teams through change.' },
      { id: 'p4', text: 'When we introduce new ways of working, we formally retire the old tasks they replace.' },
      { id: 'p5', text: 'We measure success by whether people actually work differently, not only by whether a system went live.' },
      { id: 'p6', text: 'People feel safe to raise problems and disagree openly in meetings.' },
      { id: 'p7', text: 'Our people have the capacity to absorb the current level of change without burning out.' },
    ],
  },
];

export const INDUSTRIES = [
  'Government and public sector', 'Energy and utilities', 'Banking and financial services', 'Real estate and construction',
  'Telecom and digital', 'Aviation and transport', 'Healthcare and life sciences', 'Manufacturing and industrial',
  'Retail and consumer goods', 'Technology', 'Professional services', 'Other',
];

export const INITIATIVES = [
  'AI strategy and adoption', 'Operating model redesign', 'ERP or core system transformation', 'Digital customer experience',
  'Cost and performance improvement', 'Post merger integration', 'Organizational restructuring', 'Culture and leadership change', 'Other',
];

export const COUNTRIES = ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Egypt', 'Other'];

// ELVEX recommendations used when a domain is the weakest. Written as outcome, then action.
export const PLAYBOOK: Record<string, { outcome: string; actions: string[] }> = {
  direction: {
    outcome: 'Leaders steer by the same few priorities, so resources stop being spread thin.',
    actions: [
      'Agree the three to five outcomes that matter most for the next 12 months and what you will stop doing.',
      'Test every major initiative against those outcomes and pause the ones that do not fit.',
      'Turn the priorities into a one page scorecard reviewed by the leadership team every month.',
    ],
  },
  alignment: {
    outcome: 'Functions plan and trade off together, so cross functional work moves faster.',
    actions: [
      'Give each cross functional initiative one accountable owner with authority across departments.',
      'Build functional plans in one joint session against shared outcomes, not in parallel.',
      'Replace activity KPIs with a short set of outcome measures that every function can see.',
    ],
  },
  operating: {
    outcome: 'Decisions get made quickly and the portfolio matches real delivery capacity.',
    actions: [
      'Set up a transformation office that prioritizes the portfolio and tracks benefits after go live.',
      'Write down decision rights for the 10 decisions that cause most delay, and agree escalation times.',
      'Cut the number of concurrent initiatives to what leaders and teams can genuinely deliver.',
    ],
  },
  technology: {
    outcome: 'Systems, data and AI drive the work, so teams stop compensating manually.',
    actions: [
      'Pick two or three high value workflows and redesign them task by task around people and AI.',
      'Retire the manual trackers that duplicate system data, and fix the data issues behind them.',
      'Set simple AI rules: approved uses, who checks the output, and how value is measured.',
    ],
  },
  people: {
    outcome: 'People have the clarity and capacity to change, so new ways of working stick.',
    actions: [
      'Equip line managers to explain each change, coach their teams and report on adoption.',
      'Retire old tasks whenever new ones are introduced, so change does not simply add workload.',
      'Measure adoption in daily behavior, not go live dates, and act on what the data shows.',
    ],
  },
};
