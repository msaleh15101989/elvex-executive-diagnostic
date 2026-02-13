
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';
import { 
  TrendingUp, ShieldAlert, RefreshCcw, Send, Globe,
  ArrowRight, Phone, Mail, Building2, UserCircle2, Loader2, BarChart3, Layers, Target, CheckCircle2, ListFilter, Info, Scale, Gavel, UserCheck, HelpCircle, Activity, Zap, SlidersHorizontal, Settings2, Database, AlertOctagon, ClipboardCheck, ArrowUpRight, Gauge, Briefcase, Eye, Target as TargetIcon, AlertCircle, ArrowRightCircle
} from 'lucide-react';
import { ASSESSMENT_STRUCTURE, INDUSTRIES, INITIATIVES } from './constants';
import { AssessmentState, RiskLevel, CategoryScore, AIInsights } from './types';
import { generateExecutiveInsights } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AssessmentState>(() => {
    const saved = localStorage.getItem('elvex_partners_v11');
    if (saved) return JSON.parse(saved);
    return {
      meta: {
        companyName: "",
        industry: "",
        initiative: "",
        respondentRole: "",
        email: "",
        mobile: "",
        date: new Date().toISOString().split('T')[0]
      },
      answers: {}
    };
  });

  const [activeTab, setActiveTab] = useState<'assess' | 'report'>('assess');
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('elvex_partners_v11', JSON.stringify(state));
  }, [state]);

  const getRiskLevel = (score: number): RiskLevel => {
    if (score >= 4.2) return RiskLevel.READY;
    if (score >= 3.4) return RiskLevel.MINOR;
    if (score >= 2.6) return RiskLevel.MODERATE;
    if (score >= 1.8) return RiskLevel.HIGH;
    return RiskLevel.CRITICAL;
  };

  const scores: CategoryScore[] = useMemo(() => {
    return ASSESSMENT_STRUCTURE.map(sec => {
      const qIds = sec.questions.map(q => q.id);
      const answers = qIds.map(id => state.answers[id]).filter((v): v is number => v !== undefined);
      const avg = answers.length > 0 ? answers.reduce((a, b) => a + b, 0) / answers.length : 0;
      return {
        key: sec.key,
        title: sec.title,
        score: avg,
        riskLevel: getRiskLevel(avg),
        description: sec.description
      };
    });
  }, [state.answers]);

  const sectionStatus = useMemo(() => {
    return ASSESSMENT_STRUCTURE.reduce((acc, sec) => {
      const answered = sec.questions.filter(q => state.answers[q.id] !== undefined).length;
      acc[sec.key] = {
        total: sec.questions.length,
        answered,
        remaining: sec.questions.length - answered,
        isComplete: answered === sec.questions.length
      };
      return acc;
    }, {} as Record<string, { total: number, answered: number, remaining: number, isComplete: boolean }>);
  }, [state.answers]);

  const progress = useMemo(() => {
    const total = ASSESSMENT_STRUCTURE.reduce((acc, s) => acc + s.questions.length, 0);
    const answered = Object.keys(state.answers).length;
    return Math.round((answered / total) * 100);
  }, [state.answers]);

  const handleAnswer = (qId: string, value: number) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [qId]: value }
    }));
  };

  const fieldValidation = useMemo(() => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return {
      companyName: state.meta.companyName.trim() !== "",
      respondentRole: state.meta.respondentRole.trim() !== "",
      email: emailRegex.test(state.meta.email.trim()),
      mobile: state.meta.mobile.trim().startsWith('+') && state.meta.mobile.trim().length >= 10,
      industry: state.meta.industry !== "",
      initiative: state.meta.initiative !== ""
    };
  }, [state.meta]);

  const isMetaValid = () => Object.values(fieldValidation).every(v => v === true);

  const generateReport = async () => {
    setShowValidation(true);
    setErrorMessage(null);

    if (!isMetaValid()) {
      alert("Strategic Framework Incomplete. Please ensure all corporate parameters are populated correctly.");
      const metaSection = document.getElementById('metadata-section');
      metaSection?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    
    const incompleteSections = Object.values(sectionStatus).filter((s: any) => s.answered === 0);
    if (incompleteSections.length > 0) {
      alert("Minimum audit threshold not met. Please provide diagnostic input for every assessment domain.");
      return;
    }

    setIsGenerating(true);
    try {
     const insights = await generateExecutiveInsights(state, scores);

// send data to Make in background (non-blocking)
fetch("https://hook.us2.make.com/qreddyfw8kcs3xsy1ksoqiwhiuamtj0h", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    company: state.companyName,
    role: state.respondentRole,
    email: state.email,
    initiative: state.primaryInitiative,
    industry: state.industry,
    scores: scores,
    report: insights
  })
}).catch(() => {}); // prevents UI failure if Make is slow


      setAiInsights(insights);
      fetch("https://hook.us2.make.com/qreddyfw8kcs3xsy1ksoqiwhiuamtj0h", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    company: state.companyName,
    role: state.respondentRole,
    email: state.email,
    initiative: state.primaryInitiative,
    industry: state.industry,
    scores: scores,
    report: insights
  })
}).catch(() => {});
      setActiveTab('report');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      if (e.message === "QUOTA_EXCEEDED") {
        setErrorMessage("Diagnostic Engine Busy: Executive quota reached for this minute. Please wait 60 seconds and try again.");
      } else {
        setErrorMessage("Diagnostic engine unavailable. Verify configuration and network connection.");
      }
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const submitFinalDiagnostic = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await fetch("https://hook.us2.make.com/104fjxk55vbs3gb23feh1c8py457hlvv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...state, insights: aiInsights })
      });
      alert("Strategic audit archived successfully.");
    } catch (error) {
      alert("Transmission failure.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-black text-white px-8 py-5 sticky top-0 z-50 flex items-center justify-between border-b border-white/10 shadow-2xl">
        <div className="flex items-center space-x-10">
          <div className="flex items-center space-x-4 group cursor-pointer">
            <div className="w-10 h-10 bg-white flex items-center justify-center rounded-sm transition-all group-hover:bg-slate-100">
              <TrendingUp className="text-black w-6 h-6" />
            </div>
            <div className="border-l border-white/20 pl-6">
              <h1 className="text-xl font-black tracking-tighter uppercase leading-none">ELVEX <span className="font-light text-slate-400 italic lowercase tracking-tight">Partners</span></h1>
              <p className="text-[9px] text-slate-500 uppercase tracking-[0.5em] mt-2 font-black">Diagnostic Analysis Framework</p>
            </div>
          </div>
        </div>

        <nav className="hidden lg:flex items-center space-x-2 bg-white/5 p-1 rounded-sm border border-white/10">
          <button onClick={() => setActiveTab('assess')} className={`px-10 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'assess' ? 'bg-white text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Engagement Intake</button>
          <button onClick={() => { if (aiInsights) setActiveTab('report'); else generateReport(); }} className={`px-10 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'report' ? 'bg-white text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Executive Findings</button>
        </nav>

        <div className="flex items-center space-x-10">
          <div className="hidden xl:block text-right">
            <div className="w-40 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white transition-all duration-1000 ease-in-out" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-[9px] font-black text-slate-500 uppercase mt-2 tracking-tighter">DATA ANALYZED: {progress}%</p>
          </div>
          <button onClick={() => { if(confirm("Discard all diagnostic data?")) { localStorage.clear(); window.location.reload(); } }} className="p-3 text-slate-500 hover:text-red-500 transition-colors border border-white/10 rounded-sm hover:bg-white/10" title="Purge Session"><RefreshCcw className="w-4 h-4" /></button>
        </div>
      </header>

      {activeTab === 'assess' ? (
        <main className="flex-1 max-w-[1440px] mx-auto w-full p-8 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-24">
          <div className="lg:col-span-8 space-y-20">
            
            <div className="space-y-12 border-b-2 border-black pb-16">
              <div className="space-y-10">
                <div className="inline-flex items-center space-x-4 px-6 py-2 bg-slate-50 border border-slate-200 text-[10px] font-black uppercase tracking-[0.4em]">
                  <Gauge className="w-4 h-4 text-black" />
                  <span>Engagement Diagnostic Baseline</span>
                </div>
                <h2 className="text-5xl lg:text-7xl font-serif text-black leading-[1.1] tracking-tight max-w-5xl">
                  A quick diagnostic to understand your organization’s current state and identify its main execution challenges.
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 border-l-4 border-black pl-6 py-1">
                      <Zap className="w-5 h-5 text-black" />
                      <p className="text-[11px] font-black text-black uppercase tracking-widest">Executive Focus</p>
                    </div>
                    <p className="text-base text-slate-600 font-medium font-calibri leading-relaxed pl-10">
                      Rapidly establishes a baseline for organizational readiness, identifying hidden friction points that hinder C-suite initiatives.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 border-l-4 border-slate-300 pl-6 py-1">
                      <Target className="w-5 h-5 text-black" />
                      <p className="text-[11px] font-black text-black uppercase tracking-widest">Strategic Outcome</p>
                    </div>
                    <p className="text-base text-slate-600 font-medium font-calibri leading-relaxed pl-10">
                      Provides immediate clarity on structural bottlenecks, allowing leaders to prioritize intervention before capital deployment.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div id="metadata-section" className={`bg-white border-2 p-12 lg:p-16 shadow-mbb transition-colors duration-300 ${showValidation && !isMetaValid() ? 'border-red-600' : 'border-black'}`}>
              <div className="flex items-center justify-between mb-14 border-b border-slate-100 pb-8">
                <div className="flex items-center space-x-4">
                  <Globe className={`w-5 h-5 ${showValidation && !isMetaValid() ? 'text-red-600' : 'text-black'}`} />
                  <h2 className={`text-sm font-black uppercase tracking-[0.3em] ${showValidation && !isMetaValid() ? 'text-red-600' : 'text-black'}`}>00. Engagement Context & Stakeholder Registry</h2>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {[
                  { label: "Company / Organization", key: "companyName" as const, icon: <Building2 className="w-4 h-4"/>, placeholder: "e.g. Acme Corp" },
                  { label: "Lead Executive Title", key: "respondentRole" as const, icon: <UserCircle2 className="w-4 h-4"/>, placeholder: "e.g. CEO / Managing Director" },
                  { label: "Corporate Business Email", key: "email" as const, icon: <Mail className="w-4 h-4"/>, placeholder: "executive@domain.com" },
                  { label: "Mobile (Incl. + Country Code)", key: "mobile" as const, icon: <Phone className="w-4 h-4"/>, placeholder: "+[Code] [Number]" },
                ].map((field) => (
                  <div key={field.key} className="space-y-4">
                    <label className={`text-[10px] font-black uppercase tracking-widest flex items-center transition-colors ${showValidation && !fieldValidation[field.key] ? 'text-red-600' : 'text-black opacity-60'}`}>
                      {field.icon}<span className="ml-3">{field.label}</span>
                    </label>
                    <input 
                      type={field.key === 'email' ? 'email' : 'text'}
                      value={state.meta[field.key]} 
                      onChange={(e) => setState(prev => ({ ...prev, meta: { ...prev.meta, [field.key]: e.target.value }}))}
                      placeholder={field.placeholder}
                      className={`w-full px-0 py-4 border-b-2 transition-all outline-none text-black font-black placeholder:font-normal placeholder:text-slate-300 bg-transparent text-xl ${showValidation && !fieldValidation[field.key] ? 'border-red-600 bg-red-50/10' : 'border-slate-100 focus:border-black'}`}
                    />
                  </div>
                ))}
                
                <div className="space-y-4">
                  <label className={`text-[10px] font-black uppercase tracking-widest flex items-center transition-colors ${showValidation && !fieldValidation.industry ? 'text-red-600' : 'text-black opacity-60'}`}>
                    <Briefcase className="w-4 h-4"/><span className="ml-3">Industry Vertical</span>
                  </label>
                  <select 
                    value={state.meta.industry}
                    onChange={(e) => setState(prev => ({ ...prev, meta: { ...prev.meta, industry: e.target.value }}))}
                    className={`w-full px-0 py-4 border-b-2 transition-all outline-none text-black font-black bg-transparent text-xl appearance-none cursor-pointer ${showValidation && !fieldValidation.industry ? 'border-red-600 bg-red-50/10' : 'border-slate-100 focus:border-black'}`}
                  >
                    <option value="" disabled>Select Industry...</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className={`text-[10px] font-black uppercase tracking-widest flex items-center transition-colors ${showValidation && !fieldValidation.initiative ? 'text-red-600' : 'text-black opacity-60'}`}>
                    <Target className="w-4 h-4"/><span className="ml-3">Strategic Initiative</span>
                  </label>
                  <select 
                    value={state.meta.initiative}
                    onChange={(e) => setState(prev => ({ ...prev, meta: { ...prev.meta, initiative: e.target.value }}))}
                    className={`w-full px-0 py-4 border-b-2 transition-all outline-none text-black font-black bg-transparent text-xl appearance-none cursor-pointer ${showValidation && !fieldValidation.initiative ? 'border-red-600 bg-red-50/10' : 'border-slate-100 focus:border-black'}`}
                  >
                    <option value="" disabled>Select Initiative...</option>
                    {INITIATIVES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-2 border-slate-200 p-10 space-y-8">
              <div className="flex items-center space-x-4">
                <HelpCircle className="w-5 h-5 text-black" />
                <h3 className="text-[10px] font-black text-black uppercase tracking-[0.3em]">Diagnostic Scale Orientation</h3>
              </div>
              <div className="grid grid-cols-5 gap-4">
                {[
                  { val: 1, label: "Strongly Disagree", desc: "Systemic Absence" },
                  { val: 2, label: "Disagree", desc: "Inconsistent" },
                  { val: 3, label: "Neutral", desc: "Emerging" },
                  { val: 4, label: "Agree", desc: "Aligned" },
                  { val: 5, label: "Strongly Agree", desc: "Enterprise Standard" },
                ].map((item) => (
                  <div key={item.val} className="space-y-3">
                    <div className="h-10 border-2 border-slate-200 flex items-center justify-center font-black bg-white text-black">{item.val}</div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-black text-center">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-24">
              {ASSESSMENT_STRUCTURE.map((section) => (
                <div key={section.key} className="space-y-12">
                  <div className="flex items-center justify-between border-b-2 border-black pb-8">
                    <div>
                      <div className="flex items-center space-x-4 mb-3">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">{section.badge}. Assessment Domain</h3>
                        {!sectionStatus[section.key].isComplete && <span className="px-3 py-1 bg-red-50 text-red-600 text-[8px] font-black uppercase tracking-widest border border-red-200">{sectionStatus[section.key].remaining} Items Pending</span>}
                      </div>
                      <h4 className="text-3xl font-black text-black uppercase tracking-tighter leading-tight">{section.title}</h4>
                      <p className="text-sm text-slate-500 mt-2 font-medium max-w-xl">{section.description}</p>
                    </div>
                    <div className={`w-16 h-16 flex items-center justify-center font-black text-xl shadow-lg transition-colors ${sectionStatus[section.key].isComplete ? 'bg-black text-white' : 'bg-slate-100 text-slate-400'}`}>{section.badge}</div>
                  </div>
                  <div className="space-y-20">
                    {section.questions.map((q) => (
                      <div key={q.id} className={`space-y-8 p-10 border transition-all ${state.answers[q.id] === undefined ? 'bg-slate-50/30 border-transparent hover:border-slate-100' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <p className="text-black font-black text-xl leading-tight max-w-3xl">{q.text}</p>
                        <div className="flex items-center gap-3 max-w-2xl px-4">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button key={val} onClick={() => handleAnswer(q.id, val)} className={`flex-1 h-16 border-2 font-black transition-all flex items-center justify-center text-xl ${state.answers[q.id] === val ? 'bg-black border-black text-white shadow-xl scale-110 z-10' : 'bg-white border-slate-100 text-slate-200 hover:border-slate-300 hover:text-black'}`}>{val}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-24 flex flex-col items-center justify-center pb-48">
              {errorMessage && (
                <div className="mb-12 p-8 border-2 border-red-600 bg-red-50 text-red-600 flex items-start space-x-6 max-w-2xl">
                  <AlertOctagon className="w-8 h-8 flex-shrink-0" />
                  <div>
                    <h5 className="font-black uppercase tracking-widest mb-2">Technical Intervention Required</h5>
                    <p className="font-medium font-calibri leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
              )}
              
              <button 
                onClick={generateReport} 
                disabled={isGenerating} 
                className={`group flex items-center px-24 py-10 font-black text-2xl transition-all shadow-mbb-dark hover:-translate-y-2 active:translate-y-0 uppercase tracking-tighter ${isGenerating ? 'bg-slate-800 text-slate-400' : 'bg-black text-white hover:bg-slate-900'}`}
              >
                {isGenerating ? <><Loader2 className="w-8 h-8 mr-6 animate-spin" /> Synthesizing Analysis...</> : <>Synthesize Executive Report <ArrowRight className="ml-8 w-8 h-8 group-hover:translate-x-4 transition-transform" /></>}
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-40 space-y-12">
              <div className="bg-black text-white p-14 border border-white/5 shadow-mbb-dark">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-12 flex items-center border-b border-white/10 pb-6"><BarChart3 className="w-4 h-4 mr-4 text-white" /> Execution Telemetry</h3>
                <div className="space-y-16">
                  {scores.map(s => (
                    <div key={s.key} className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500">{s.title}</span>
                        <span className="text-white">{s.score > 0 ? `${(s.score / 5 * 100).toFixed(0)}%` : '—'}</span>
                      </div>
                      <div className="h-0.5 w-full bg-white/5 overflow-hidden"><div className="h-full bg-white transition-all duration-1000 ease-out" style={{ width: `${(s.score / 5) * 100}%` }}></div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 bg-white">
          <div className="max-w-[1200px] mx-auto bg-white min-h-screen border-x border-slate-100 shadow-2xl">
            <div className="p-16 lg:p-24 space-y-24">
              
              <div className="text-center space-y-12 mb-24">
                <div className="inline-flex items-center space-x-5 px-10 py-4 bg-black text-white text-[11px] font-black uppercase tracking-[0.6em] shadow-2xl">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>Confidential Engagement Diagnostic</span>
                </div>
                <h2 className="text-[60px] lg:text-[80px] font-black text-black font-calibri leading-[0.85] tracking-tighter py-6">Structural Alignment Briefing</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pt-12 border-t-2 border-black mt-12">
                  <div className="text-left"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity</p><p className="text-lg font-black text-black uppercase">{state.meta.companyName || '—'}</p></div>
                  <div className="text-left"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vertical</p><p className="text-lg font-black text-black uppercase">{state.meta.industry || '—'}</p></div>
                  <div className="text-left"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Principal</p><p className="text-lg font-black text-black italic font-calibri">{state.meta.respondentRole || '—'}</p></div>
                  <div className="text-left"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Readiness Index</p><p className="text-lg font-black text-black">{aiInsights?.client_summary?.readiness_index || '—'}</p></div>
                </div>
              </div>

              {aiInsights && (
                <div className="space-y-32">
                  
                  {/* 1. EXECUTIVE SNAPSHOT */}
                  <section className="bg-black text-white p-16 shadow-mbb-dark relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <TargetIcon className="w-48 h-48" />
                    </div>
                    <div className="relative z-10 space-y-16">
                      <div className="flex items-center space-x-4 border-b border-white/20 pb-6">
                        <Gauge className="w-6 h-6 text-slate-400" />
                        <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.5em]">Executive Snapshot</h3>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Organizational Condition</p>
                          <p className="text-2xl font-light italic font-calibri text-white">{aiInsights.executive_snapshot?.organizational_condition || '—'}</p>
                        </div>
                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Practical Meaning</p>
                          <p className="text-2xl font-light italic font-calibri text-white">{aiInsights.executive_snapshot?.practical_meaning || '—'}</p>
                        </div>
                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-red-700 uppercase tracking-widest">Immediate Leadership Risk</p>
                          <p className="text-2xl font-light italic font-calibri text-white">{aiInsights.executive_snapshot?.leadership_risk || '—'}</p>
                        </div>
                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-white uppercase tracking-widest">Primary Focus Area</p>
                          <p className="text-2xl font-black font-calibri text-white uppercase tracking-tighter">{aiInsights.executive_snapshot?.primary_focus || '—'}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 2. INTERPRETATION NOTICE */}
                  <div className="bg-slate-50 p-8 border border-slate-200 flex items-start">
                    <Info className="w-5 h-5 text-black mr-6 flex-shrink-0 mt-1" />
                    <p className="text-sm text-slate-600 font-medium font-calibri leading-relaxed">This briefing reflects structural patterns inferred from participant responses and organizational consistency indicators. The analysis identifies probable operating mechanisms and constraints rather than verifying specific operational events.</p>
                  </div>

                  {/* 3. OPERATIONAL REALITY & SYMPTOMS */}
                  <section className="grid grid-cols-1 lg:grid-cols-12 gap-24">
                    <div className="lg:col-span-7 space-y-12">
                      <div className="flex items-center space-x-4 border-b-4 border-black pb-4">
                        <Eye className="w-6 h-6 text-black" />
                        <h4 className="text-lg font-black text-black uppercase tracking-widest font-calibri">Operational Reality</h4>
                      </div>
                      <div className="p-10 bg-white border-2 border-slate-100 shadow-mbb">
                        <p className="text-2xl text-black leading-snug font-medium font-calibri italic">
                          {aiInsights.client_summary?.impact_statement || 'No direct impact identified in baseline.'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="lg:col-span-5 space-y-12">
                      <div className="flex items-center space-x-4 border-b-4 border-slate-200 pb-4">
                        <AlertCircle className="w-6 h-6 text-black" />
                        <h4 className="text-lg font-black text-black uppercase tracking-widest font-calibri">Leadership Symptoms</h4>
                      </div>
                      <ul className="space-y-6">
                        {(aiInsights.symptoms || []).map((sym, idx) => (
                          <li key={idx} className="flex items-start group">
                            <div className="w-1.5 h-1.5 bg-black rounded-full mt-2.5 mr-6 flex-shrink-0 transition-transform group-hover:scale-150"></div>
                            <span className="text-lg font-black text-black uppercase tracking-tighter font-calibri leading-tight">{sym}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>

                  {/* 4. ROOT CAUSE EXPLANATION */}
                  <section className="space-y-12 bg-slate-50 p-16 border border-slate-200 shadow-mbb">
                    <div className="flex items-center space-x-4">
                      <Layers className="w-6 h-6 text-black" />
                      <h4 className="text-lg font-black text-black uppercase tracking-widest font-calibri">Root Cause Interpretation</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                      {(aiInsights.consultant_report?.root_cause_hypothesis || []).map((hyp, i) => (
                        <div key={i} className="space-y-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hypothesis {i+1}</p>
                          <p className="text-xl text-black font-medium font-calibri leading-relaxed">{hyp}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* 5. PRIORITY ACTIONS (ROADMAP) */}
                  <section className="space-y-16 pt-16 border-t-8 border-black">
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center space-x-4">
                        <ListFilter className="w-10 h-10 text-black" />
                        <h3 className="text-4xl font-black text-black uppercase tracking-tighter font-calibri">Priority Structural Roadmap</h3>
                      </div>
                      <p className="text-slate-500 font-medium max-w-3xl text-lg font-calibri">
                        Outcome-first interventions identified to stabilize execution and enable reliable scaling.
                      </p>
                    </div>

                    <div className="space-y-20">
                      {(aiInsights.strategic_roadmap || []).sort((a,b) => a.rank - b.rank).map((init, idx) => (
                        <div key={idx} className="border-l-8 border-black pl-12 py-4 relative group">
                          <div className="absolute -left-6 top-0 w-12 h-12 bg-black text-white flex items-center justify-center font-black text-xl shadow-2xl">
                            {init.rank}
                          </div>

                          <div className="space-y-10">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                              <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Outcome</p>
                                <h4 className="text-3xl font-black text-black uppercase tracking-tight font-calibri">{init.title}</h4>
                              </div>
                              <div className="flex items-center space-x-6">
                                <span className={`px-6 py-2 text-[11px] font-black uppercase tracking-widest border-2 ${init.priority === 'Critical' ? 'bg-red-700 border-red-700 text-white' : 'bg-black border-black text-white'}`}>
                                  {init.priority} Priority
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                              <div className="lg:col-span-2 space-y-4">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Impact & Business Effect</p>
                                <p className="text-xl text-black font-medium leading-relaxed font-calibri">
                                  {init.executive_summary}
                                </p>
                              </div>
                              <div className="bg-slate-50 p-10 border border-slate-100 space-y-6">
                                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center">
                                  <ArrowRightCircle className="w-5 h-5 mr-3 text-black" /> Method & Requirements
                                </h5>
                                <div className="space-y-4">
                                  {(init.success_requirements || []).map((req, rIdx) => (
                                    <div key={rIdx} className="flex items-start">
                                      <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 mr-4 flex-shrink-0"></div>
                                      <span className="text-sm font-black text-black uppercase tracking-tighter leading-tight font-calibri">{req}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* 6. EXPECTED ORGANIZATIONAL SHIFT */}
                  <section className="bg-slate-900 text-white p-16 shadow-mbb-dark">
                    <div className="space-y-12">
                      <div className="flex items-center space-x-4 border-b border-white/10 pb-6">
                        <TrendingUp className="w-6 h-6 text-slate-400" />
                        <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.5em]">Future State: The Shift</h3>
                      </div>
                      <div className="space-y-12">
                        <p className="text-3xl font-light italic font-calibri leading-snug">"{aiInsights.future_state?.outcome || '—'}"</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          {(aiInsights.future_state?.observable_changes || []).map((change, i) => (
                            <div key={i} className="flex items-center space-x-6 p-6 bg-white/5 border border-white/10">
                              <CheckCircle2 className="w-6 h-6 text-white flex-shrink-0" />
                              <span className="text-lg font-black uppercase tracking-tighter font-calibri leading-none">{change}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 7. ADVISORY NOTE */}
                  <div className="bg-slate-50 p-8 border border-slate-200 flex items-start">
                    <UserCheck className="w-5 h-5 text-black mr-6 flex-shrink-0 mt-1" />
                    <p className="text-sm text-slate-600 font-medium font-calibri leading-relaxed">Elvex Partners identifies intervention priorities and decision considerations. Execution approach, sequencing, and adoption remain under the authority of the organization's leadership.</p>
                  </div>

                  <div className="pt-24 pb-48 flex justify-between items-end border-t border-slate-100">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em]">Engagement Principal Certification</p>
                      <p className="text-4xl font-black text-black tracking-tighter uppercase font-calibri">ELVEX Partners</p>
                    </div>
                    <button onClick={submitFinalDiagnostic} disabled={isSubmitting} className="px-16 py-8 bg-black text-white font-black uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center text-lg disabled:opacity-50">
                      {isSubmitting ? <><Loader2 className="w-6 h-6 mr-4 animate-spin" /> Archiving...</> : <><Send className="w-6 h-6 mr-4" /> Finalize Engagement</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default App;
