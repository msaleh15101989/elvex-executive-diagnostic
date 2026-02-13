
import { GoogleGenAI, Type } from "@google/genai";
import { AssessmentState, AIInsights, CategoryScore } from "../types";

export async function generateExecutiveInsights(
  state: AssessmentState,
  scores: CategoryScore[]
): Promise<AIInsights> {
  // Use the API key from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const scoreSummary = scores.map(s => `${s.title}: ${s.score.toFixed(1)}`).join(", ");
  
  const systemInstruction = `
Your purpose is to act as a Senior Partner at a top-tier management consulting firm (MBB). 
You are interpreting an ELVEX Strategy & Execution Alignment Assessment.

CORE ANALYTIC PHILOSOPHY:
- Organizations fail when structure, behavior, and governance cannot carry the new way of working.
- Focus on the "Operating Pattern" the organization naturally falls back to under pressure.
- Distinguish between execution depending on INDIVIDUALS (effort-based) vs. STRUCTURE (system-based).

REPORT MANDATE (STRICT LANGUAGE RULES):
1. NO JARGON: Avoid "structural disparity", "positive deviation", "shadow model", "governance mechanism".
2. PLAIN LEADERSHIP LANGUAGE: Use "teams compensate manually", "decisions unclear", "coordination depends on relationships".
3. EXPERIENTIAL: Describe what leaders actually experience day-to-day.
4. OUTCOME-FIRST: For all recommendations, start with what will improve, then explain the business effect, then the method.

MANDATORY REPORT SECTIONS:
1. EXECUTIVE SNAPSHOT: 4 lines (Organizational Condition, Practical Meaning, Leadership Risk, Primary Focus).
2. OPERATIONAL REALITY: Describe how work progresses and where decisions concentrate.
3. LEADERSHIP SYMPTOMS: Bulleted list of observable signs (e.g. escalations increasing, parallel trackers).
4. ROOT CAUSE: Simple explanation of why this is happening.
5. PRIORITY ACTIONS: Ranked by outcome.
6. FUTURE STATE: Describe what changes after fixing the issue (execution stabilizes, effort reduces).

Maintain executive credibility through detached, authoritative analysis.
`;

  const prompt = `
Context:
Entity: ${state.meta.companyName}
Industry: ${state.meta.industry}
Key Initiative: ${state.meta.initiative}
Audit Scores: ${scoreSummary}

Required Diagnostic Detail:
- Executive Snapshot (4 lines)
- List of observable leadership symptoms
- Behavioral interpretation (Plain English)
- Root cause hypothesis (Plain English)
- Future state visualization
- Prioritized structural roadmap (Outcome-First)

Output must be strictly valid JSON according to the provided schema.
`;

  try {
    const response = await ai.models.generateContent({
      // Switching to Flash for higher quota/availability while maintaining performance
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executive_snapshot: {
              type: Type.OBJECT,
              properties: {
                organizational_condition: { type: Type.STRING },
                practical_meaning: { type: Type.STRING },
                leadership_risk: { type: Type.STRING },
                primary_focus: { type: Type.STRING }
              },
              required: ["organizational_condition", "practical_meaning", "leadership_risk", "primary_focus"]
            },
            client_summary: {
              type: Type.OBJECT,
              properties: {
                readiness_index: { type: Type.NUMBER },
                dominant_pattern: { type: Type.STRING },
                technology_position: { type: Type.STRING },
                impact_statement: { type: Type.STRING },
                discussion_message: { type: Type.STRING }
              },
              required: ["readiness_index", "dominant_pattern", "technology_position", "impact_statement", "discussion_message"]
            },
            symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
            future_state: {
              type: Type.OBJECT,
              properties: {
                outcome: { type: Type.STRING },
                observable_changes: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["outcome", "observable_changes"]
            },
            consultant_report: {
              type: Type.OBJECT,
              properties: {
                layer_scores: {
                  type: Type.OBJECT,
                  properties: {
                    corporate_strategy: { type: Type.NUMBER },
                    business_strategy: { type: Type.NUMBER },
                    operating_model: { type: Type.NUMBER },
                    execution_behavior: { type: Type.NUMBER },
                    technology_integration: { type: Type.NUMBER }
                  }
                },
                execution_dependency: { type: Type.STRING },
                behavior_vs_system_gap: { type: Type.STRING },
                behavioral_interpretation: { type: Type.STRING },
                root_cause_hypothesis: { type: Type.ARRAY, items: { type: Type.STRING } },
                risk_level: { type: Type.STRING },
                intervention_focus: { type: Type.STRING },
                structure_vs_effort: { type: Type.STRING },
                scaling_stall_risk: { type: Type.STRING }
              },
              required: ["root_cause_hypothesis", "risk_level", "structure_vs_effort", "scaling_stall_risk", "behavioral_interpretation", "execution_dependency", "behavior_vs_system_gap"]
            },
            strategic_roadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  rank: { type: Type.NUMBER },
                  impact_area: { type: Type.STRING },
                  executive_summary: { type: Type.STRING },
                  success_requirements: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["title", "priority", "rank", "impact_area", "executive_summary", "success_requirements"]
              }
            }
          },
          required: ["executive_snapshot", "client_summary", "symptoms", "future_state", "consultant_report", "strategic_roadmap"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from AI engine");
    }

    return JSON.parse(response.text) as AIInsights;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes("429") || error.message?.toLowerCase().includes("quota")) {
      throw new Error("QUOTA_EXCEEDED");
    }
    throw error;
  }
}
