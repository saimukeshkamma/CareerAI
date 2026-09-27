import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Brain, Sparkles, ArrowRight, CheckCircle2,
  FileText, Briefcase, Target, Mic, BarChart3,
  Star, ShieldCheck, ChevronRight, Zap, Play
} from 'lucide-react';
import { ScoreRing } from '../components/common/ScoreRing';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { demoLogin, user } = useAuth();
  const [activePreviewTab, setActivePreviewTab] = useState<'resume' | 'job' | 'interview'>('resume');

  return (
    <div className="min-h-screen bg-[#080c17] text-slate-100 selection:bg-blue-600 selection:text-white overflow-hidden">
      
      {/* Glow Ambient Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[130px] pointer-events-none" />

      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Top Floating Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-blue-500/30 text-xs font-semibold text-blue-300 mb-8 animate-pulse-subtle shadow-lg shadow-blue-500/10">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Next-Generation Career Intelligence Platform</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.1] mb-6">
          From Resume to Interview — <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-300">
            Your AI Career Coach.
          </span>
        </h1>

        {/* Description */}
        <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
          CareerAI helps students, graduates, and tech job seekers instantly audit resume ATS compatibility, discover explainable job matches, bridge skill gaps, and practice realistic AI mock interviews with real-time feedback.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-14">
          <button
            onClick={() => {
              if (user) onNavigate('resumes');
              else demoLogin(1).then(() => onNavigate('resumes'));
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group"
          >
            <Sparkles className="w-4 h-4 text-blue-200 group-hover:rotate-12 transition-transform" />
            Analyze My Resume
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => {
              if (user) onNavigate('dashboard');
              else demoLogin(1).then(() => onNavigate('dashboard'));
            }}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl text-sm font-bold text-slate-200 glass-card hover:text-white hover:bg-slate-800/80 border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 text-indigo-400 fill-indigo-400" />
            Explore Live Demo
          </button>
        </div>

        {/* Visual Workflow Flowchart */}
        <div className="max-w-4xl mx-auto glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Autonomous Career Progression Pipeline</p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
            
            {/* Node 1 */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/30 flex flex-col items-center">
              <FileText className="w-6 h-6 text-blue-400 mb-2" />
              <h4 className="text-xs font-bold text-white">Your Resume</h4>
              <p className="text-[10px] text-slate-400 mt-1">PDF / DOCX</p>
            </div>

            <div className="hidden md:flex justify-center text-blue-400">➔</div>

            {/* Center Brain Node */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-900/40 via-indigo-900/40 to-slate-900 border border-indigo-500/50 flex flex-col items-center shadow-lg shadow-indigo-500/20">
              <Brain className="w-8 h-8 text-indigo-400 mb-2 animate-pulse" />
              <h4 className="text-xs font-extrabold text-white">CareerAI Core</h4>
              <p className="text-[10px] text-indigo-300 mt-0.5">NLP & Matching</p>
            </div>

            <div className="hidden md:flex justify-center text-blue-400">➔</div>

            {/* Triad Output */}
            <div className="flex flex-col gap-2">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-left">
                <span className="text-[11px] font-bold text-emerald-400">1. ATS Analysis</span>
                <span className="text-[9px] text-slate-400">87/100</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-left">
                <span className="text-[11px] font-bold text-blue-400">2. Job Match</span>
                <span className="text-[9px] text-slate-400">92% Fit</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-left">
                <span className="text-[11px] font-bold text-purple-400">3. AI Interview</span>
                <span className="text-[9px] text-slate-400">84% Score</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE PREVIEWS TABS */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Inspect the Platform in Action
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Click through our three core intelligent modules to preview the depth of automated evaluation.
          </p>

          {/* Tab Selector */}
          <div className="inline-flex p-1.5 rounded-2xl glass-card border border-slate-800 mt-6 gap-2">
            <button
              onClick={() => setActivePreviewTab('resume')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePreviewTab === 'resume'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📄 Resume Analysis
            </button>
            <button
              onClick={() => setActivePreviewTab('job')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePreviewTab === 'job'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              💼 Smart Job Matching
            </button>
            <button
              onClick={() => setActivePreviewTab('interview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePreviewTab === 'interview'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🎤 Mock Interview Evaluation
            </button>
          </div>
        </div>

        {/* Tab 1: Resume Analysis Preview */}
        {activePreviewTab === 'resume' && (
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-700/80 animate-fade-in shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
                <ScoreRing score={87} size={150} strokeWidth={12} label="Resume Score" subLabel="87 / 100 — High Compatibility" />
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ATS Verified Benchmark
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                    <span className="text-xl font-bold text-white">91%</span>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">ATS Score</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                    <span className="text-xl font-bold text-white">88%</span>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Skills Match</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                    <span className="text-xl font-bold text-white">82%</span>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Experience</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                    <span className="text-xl font-bold text-white">94%</span>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Formatting</p>
                  </div>
                </div>

                {/* AI Bullet Rewrite Highlight */}
                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">AI Bullet Point Enhancement</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <p className="text-rose-300 line-through">"Worked on machine learning project using Python and dataset to predict outcomes."</p>
                    <p className="text-emerald-300 font-medium">"Engineered an end-to-end ML prediction pipeline in Python with Scikit-learn, achieving 89% cross-validation accuracy and reducing inference latency by 28%."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Job Matching Preview */}
        {activePreviewTab === 'job' && (
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-700/80 animate-fade-in shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">AI Engineer Intern</h3>
                    <p className="text-xs text-slate-400">Scale AI • San Francisco, CA (Hybrid)</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-sm">
                    92% Match
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Matched Competencies
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {["Python", "PyTorch", "Machine Learning", "SQL", "FastAPI", "Git"].map((s, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-emerald-950/60 border border-emerald-500/30 text-emerald-200">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Identified Skill Gaps
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {["Docker", "AWS SageMaker", "Kubernetes"].map((s, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-amber-950/60 border border-amber-500/30 text-amber-200">
                          ○ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Explainable Weighting Breakdown */}
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3 text-left">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Explainable Fit Composition</h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                      <span>Skills Match (40% Weight)</span>
                      <span className="font-bold text-emerald-400">95%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: '95%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                      <span>Project Alignment (15% Weight)</span>
                      <span className="font-bold text-blue-400">90%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: '90%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                      <span>Experience Fit (20% Weight)</span>
                      <span className="font-bold text-indigo-400">88%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full" style={{ width: '88%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Interview AI Preview */}
        {activePreviewTab === 'interview' && (
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-700/80 animate-fade-in shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
                <ScoreRing score={84} size={150} strokeWidth={12} label="Interview Performance" subLabel="Strong Technical Competence" colorScheme="purple" />
                <p className="mt-3 text-xs text-slate-400 text-center">AI Mock Session • AI Engineer Track</p>
              </div>

              <div className="space-y-3 text-left">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Multi-Dimensional Evaluation</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">Technical Knowledge</span>
                    <span className="font-bold text-purple-400">88%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">Communication & Articulation</span>
                    <span className="font-bold text-blue-400">81%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">Problem Solving & Trade-offs</span>
                    <span className="font-bold text-emerald-400">86%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">Confidence & Delivery Clarity</span>
                    <span className="font-bold text-cyan-400">79%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. HOW CAREERAI WORKS (6-Step Path) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          How CareerAI Works
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mb-14">
          A seamless 6-step progression engineered to take you from initial application to offer letter.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {[
            { step: '01', title: 'Upload Resume', desc: 'Drag and drop your PDF or DOCX file. Our engine parses sections, projects, and contact info instantly.' },
            { step: '02', title: 'AI Analyzes', desc: 'Receive instant ATS scoring, keyword coverage audits, and sentence-by-sentence impact rewrites.' },
            { step: '03', title: 'Discover Jobs', desc: 'Explore curated tech positions with transparent matching percentages and explainable fit scores.' },
            { step: '04', title: 'Find Skill Gaps', desc: 'Identify exactly which critical tools and libraries you are missing, with structured learning roadmaps.' },
            { step: '05', title: 'Practice Interview', desc: 'Answer role-specific AI generated questions via voice or text with real-time scoring.' },
            { step: '06', title: 'Improve & Get Hired', desc: 'Track improvement metrics over time and enter live interviews with total confidence.' }
          ].map((s, idx) => (
            <div key={idx} className="glass-card glass-card-hover p-6 rounded-2xl relative overflow-hidden group">
              <span className="text-3xl font-black text-slate-700/60 group-hover:text-blue-500/40 transition-colors mb-3 block">
                {s.step}
              </span>
              <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. KEY FEATURES GRID */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Architected for Modern Tech Careers
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Everything you need to compete against thousands of applicants in the modern AI era.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <FileText className="w-5 h-5 text-blue-400" />,
              title: "AI Resume Analyzer",
              desc: "Complete ATS simulator checking section headers, quantified metrics, keyword density, and bullet rewrites."
            },
            {
              icon: <Briefcase className="w-5 h-5 text-cyan-400" />,
              title: "Smart Job Matcher",
              desc: "Configurable 6-factor explainable algorithm matching skills, experience, projects, education, and keywords."
            },
            {
              icon: <Target className="w-5 h-5 text-purple-400" />,
              title: "Skill Gap Detection",
              desc: "Clear comparison of your competencies against target roles, with estimated learning difficulty and free resources."
            },
            {
              icon: <Mic className="w-5 h-5 text-rose-400" />,
              title: "AI Interview Evaluator",
              desc: "Dynamic questions with voice recording, multi-dimensional scoring (Technical, Communication, Relevance, Clarity)."
            },
            {
              icon: <BarChart3 className="w-5 h-5 text-emerald-400" />,
              title: "Career Analytics",
              desc: "Visual progress tracking across mock interviews, resume ATS scores over time, and market skill demand."
            },
            {
              icon: <Sparkles className="w-5 h-5 text-amber-400" />,
              title: "Context-Aware Assistant",
              desc: "Floating AI career coach that references your active resume, skill gaps, and interview scores for instant personalized advice."
            }
          ].map((f, i) => (
            <div key={i} className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Trusted by Ambitious Candidates
          </h2>
          <p className="text-sm text-slate-400">See how CareerAI transforms the job search experience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {[
            {
              name: "Maya Lin",
              role: "Incoming AI Intern",
              school: "Stanford CS '26",
              comment: "The bullet rewrites alone took my resume from getting zero recruiter replies to 4 interview invitations within two weeks. The mock interview coach was spot on with transformer questions."
            },
            {
              name: "Marcus Vance",
              role: "Junior ML Engineer",
              school: "Career Switcher",
              comment: "The skill gap analyzer showed me exactly what was holding me back: Docker and FastAPI serving. Following the curated roadmap helped me bridge the gap and land an offer."
            },
            {
              name: "Sneha Patel",
              role: "Software Engineer",
              school: "UC Berkeley '25",
              comment: "Being able to practice interview questions with speech-to-text and getting immediate rubric scores gave me the communication confidence I desperately needed."
            }
          ].map((t, idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-6 italic">"{t.comment}"</p>
              </div>
              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold text-white">{t.name}</h4>
                <p className="text-[11px] text-slate-400">{t.role} • {t.school}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. BIG CTA SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="glass-card p-10 sm:p-14 rounded-3xl border border-indigo-500/40 relative overflow-hidden shadow-2xl bg-gradient-to-b from-blue-950/40 to-slate-950">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Build Your Career with AI
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8">
            Stop guessing why recruiters pass on your application. Get instant ATS scores, job matching, and interview practice today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-sm mx-auto">
            <button
              onClick={() => demoLogin(1).then(() => onNavigate('dashboard'))}
              className="px-8 py-3.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
            >
              Start Free Today
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="px-6 py-3.5 rounded-2xl text-xs font-semibold text-slate-300 hover:text-white glass-card hover:bg-slate-800/80 transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-slate-800/80 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-xs text-slate-400">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-blue-400" />
              <span className="font-extrabold text-sm text-white">CareerAI</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              From Resume to Interview — Your AI Career Coach. Built for ambitious students and tech job seekers.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[10px]">Platform</h4>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => onNavigate('resumes')} className="hover:text-blue-400">Resume Analyzer</button></li>
              <li><button onClick={() => onNavigate('jobs')} className="hover:text-blue-400">Job Matcher</button></li>
              <li><button onClick={() => onNavigate('skills')} className="hover:text-blue-400">Skill Gap Engine</button></li>
              <li><button onClick={() => onNavigate('interview')} className="hover:text-blue-400">AI Mock Interview</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[10px]">Privacy & Trust</h4>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => onNavigate('settings')} className="hover:text-blue-400">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('settings')} className="hover:text-blue-400">Data Management</button></li>
              <li><button onClick={() => onNavigate('settings')} className="hover:text-blue-400">Delete Account</button></li>
              <li><span className="text-slate-600">Zero Unconsented Sharing</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[10px]">Community</h4>
            <ul className="space-y-2 text-[11px]">
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-blue-400">GitHub Repository</a></li>
              <li><a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-blue-400">LinkedIn Community</a></li>
              <li><a href="https://discord.com" target="_blank" rel="noreferrer" className="hover:text-blue-400">Discord Forum</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 CareerAI Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Powered by FastAPI & React</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Systems Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
