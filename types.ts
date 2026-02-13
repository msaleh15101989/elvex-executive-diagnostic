
export enum RiskLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MODERATE = 'MODERATE',
  MINOR = 'MINOR',
  READY = 'READY'
}

export interface Question {
  id: string;
  text: string;
  category: string;
}

export interface Section {
  key: string;
  badge: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface AssessmentState {
  meta: {
    companyName: string;
    industry: string;
    initiative: string;
    respondentRole: string;
    email: string;
    mobile: string;
    date: string;
  };
  answers: Record<string, number>;
}

export interface CategoryScore {
  key: string;
  title: string;
  score: number;
  riskLevel: RiskLevel;
  description: string;
}

export interface StrategicInitiative {
  title: string;
  priority: 'Critical' | 'High' | 'Medium';
  rank: number;
  impact_area: string;
  executive_summary: string;
  success_requirements: string[];
}

export interface AIInsights {
  executive_snapshot: {
    organizational_condition: string;
    practical_meaning: string;
    leadership_risk: string;
    primary_focus: string;
  };
  client_summary: {
    readiness_index: number;
    dominant_pattern: string;
    technology_position: 'Enabler' | 'Support Tool' | 'Administrative Tool' | 'Unused Potential';
    impact_statement: string;
    discussion_message: string;
  };
  symptoms: string[];
  future_state: {
    outcome: string;
    observable_changes: string[];
  };
  consultant_report: {
    layer_scores: {
      corporate_strategy: number;
      business_strategy: number;
      operating_model: number;
      execution_behavior: number;
      technology_integration: number;
    };
    execution_dependency: string;
    behavior_vs_system_gap: string;
    behavioral_interpretation: string;
    root_cause_hypothesis: string[];
    risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
    intervention_focus: string;
    structure_vs_effort: string;
    scaling_stall_risk: string;
  };
  strategic_roadmap: StrategicInitiative[];
}
