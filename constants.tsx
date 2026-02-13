
import { Section } from './types';

export const ASSESSMENT_STRUCTURE: Section[] = [
  {
    key: "corp",
    badge: "A",
    title: "Corporate Strategy",
    description: "Clarity of direction, priority stability, leadership interpretation, strategic tradeoffs.",
    questions: [
      { id: "q1", text: "Does the executive team have a unified, 5-year vision that goes beyond simple financial growth targets?", category: "corp" },
      { id: "q2", text: "Are your top strategic priorities stable for at least 12 months without being derailed by short-term crises?", category: "corp" },
      { id: "q3", text: "If you asked 5 different executives to define 'success' for this year, would their answers be identical?", category: "corp" },
      { id: "q4", text: "Can leadership clearly list activities or business lines the organization has intentionally stopped doing to save focus?", category: "corp" },
      { id: "q5", text: "Are new project investments strictly vetted against a strategic scorecard rather than 'who screams the loudest'?", category: "corp" },
      { id: "q6", text: "Does your strategy define a unique competitive advantage that competitors cannot easily copy?", category: "corp" }
    ]
  },
  {
    key: "biz",
    badge: "B",
    title: "Business Strategy",
    description: "Functional alignment, enterprise optimization, shared ownership, value proposition alignment.",
    questions: [
      { id: "q9", text: "Do department heads understand exactly how their specific team's work drives the CEO's top goals?", category: "biz" },
      { id: "q10", text: "Do departments frequently sacrifice their own 'local' budget or speed for the benefit of the whole company?", category: "biz" },
      { id: "q11", text: "Are the strategies for IT, HR, and Sales developed together in a single room rather than in silos?", category: "biz" },
      { id: "q12", text: "Are KPIs tailored to the unique nature of each business unit rather than being generic across the board?", category: "biz" },
      { id: "q13", text: "Do cross-functional projects have a single 'owner' who can make decisions across all involved departments?", category: "biz" },
      { id: "q14", text: "Is there absolute agreement across the board on who your 'ideal customer' actually is?", category: "biz" }
    ]
  },
  {
    key: "opmodel",
    badge: "C",
    title: "Operating Model",
    description: "Decision rights, governance forums, process design, escalation logic, ways of working.",
    questions: [
      { id: "q17", text: "Do individuals have the formal authority to approve spending and hire/fire within their own scope of responsibility?", category: "opmodel" },
      { id: "q18", text: "Are executive meetings focused on making hard decisions rather than just reviewing status update slides?", category: "opmodel" },
      { id: "q19", text: "Are your core business processes built around the 'customer journey' rather than 'departmental boundaries'?", category: "opmodel" },
      { id: "q20", text: "Do bonuses and performance reviews reward collaborative behavior across teams?", category: "opmodel" },
      { id: "q21", text: "Is there a documented 'Target Operating Model' that everyone refers to as the source of truth?", category: "opmodel" },
      { id: "q23", text: "When a project hits a wall, is there a 24-hour path to get a definitive 'Yes' or 'No' from a senior leader?", category: "opmodel" },
      { id: "q24", text: "Are there more active initiatives than the organization realistically has capacity to execute?", category: "opmodel" }
    ]
  },
  {
    key: "exec",
    badge: "D",
    title: "Execution Behavior",
    description: "Daily behavior, reinforcement routines, adoption measurement, resistance handling.",
    questions: [
      { id: "q25", text: "Could a front-line employee explain how their work today impacts the company's 5-year vision?", category: "exec" },
      { id: "q26", text: "Do senior leaders visibly use the new tools and follow the new processes they are asking others to use?", category: "exec" },
      { id: "q27", text: "Do middle managers spend at least 20% of their time coaching their teams on new behaviors?", category: "exec" },
      { id: "q28", text: "Has the company formally 'killed' old tasks to make room for new transformation activities?", category: "exec" },
      { id: "q30", text: "Do you measure success based on 'behavioral change' (adoption) rather than just 'going live'?", category: "exec" },
      { id: "q31", text: "Is 'healthy dissent' encouraged in meetings, or do people stay quiet when they see a problem?", category: "exec" },
      { id: "q32", text: "Do employees face negative consequences for not following the new way of working?", category: "exec" }
    ]
  },
  {
    key: "tech",
    badge: "E",
    title: "Technology & AI Integration",
    description: "Whether systems and AI actively drive work or only document activity.",
    questions: [
      { id: "q33", text: "Are your daily workflows hard-coded into your core systems, making it impossible to skip mandatory steps?", category: "tech" },
      { id: "q34", text: "Do managers rely on real-time system dashboards to lead teams rather than manual Excel trackers?", category: "tech" },
      { id: "q35", text: "Is AI used to automate decision-making logic rather than just being used for writing or summarizing text?", category: "tech" },
      { id: "q36", text: "Do systems automatically flag performance deviations without needing a human to find the error first?", category: "tech" },
      { id: "q37", text: "Are customer data and operational data connected in a single system that provides a 360-degree view?", category: "tech" },
      { id: "q38", text: "Has the organization retired legacy systems that no longer align with the modern operating model?", category: "tech" },
      { id: "q39", text: "Do employees maintain parallel manual trackers because they do not trust system data?", category: "tech" }
    ]
  }
];

export const INDUSTRIES = [
  "Government / Public Sector",
  "Energy / Utilities",
  "Telecom / Digital",
  "Banking / Financial Services",
  "Aviation / Transport",
  "Healthcare / Life Sciences",
  "Manufacturing / Industrial",
  "Retail / Consumer Goods",
  "Technology / SaaS",
  "Professional Services",
  "Other"
];

export const INITIATIVES = [
  "ERP Transformation (SAP/Oracle)",
  "AI Strategy & Implementation",
  "Global Shared Services",
  "Operating Model Redesign",
  "Digital Customer Experience",
  "Post-Merger Integration",
  "Organizational Restructuring",
  "Other"
];
