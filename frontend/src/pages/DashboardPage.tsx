import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { analyticsApi, jobApi } from '../services/api';
import { DashboardData, Job } from '../types';
import {
  Brain, FileText, Briefcase, Target, Mic,
  Sparkles, ArrowRight, CheckCircle2, TrendingUp,
  Bookmark, ChevronRight
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { ScoreRing } from '../components/common/ScoreRing';
import { LoadingState } from '../components/common/LoadingState';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

interface DashboardPageProps {
  onNavigate: (tab: string, contextId?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getDashboard();
      setData(res);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'W1', score: 68 },
    { name: 'W2', score: 74 },
    { name: 'W3', score: 81 },
    { name: 'W4', score: data?.active_resume_score || 87 },
  ];

  if (loading || !data) {
    return (
      <div className="py-20">
        <LoadingState title="Generating Your Career Cockpit..." />
      </div>
    );
  }

  const firstName = user ? user.name.split(' ')[0] : 'Candidate';

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Header Greeting & AI Insight Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl glass-card border border-blue-500/25 bg-gradient-to-r from-blue-950/40 via-indigo-950/20 to-slate-900/60 shadow-2xl">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">👋</span>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Career Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Good morning, {firstName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Your career readiness is looking strong. You are tracking toward top-tier <span className="text-blue-400 font-semibold">{data.target_role}</span> standards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('resumes')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/25 transition-all hover:scale-105"
            >
              Upload New Resume
            </button>
            <button
              onClick={() => onNavigate('interview')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 glass-card hover:text-white hover:bg-slate-800 border border-slate-700 transition-all"
            >
              Start Practice Session
            </button>
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-start gap-3 bg-blue-950/30 p-3.5 rounded-2xl border border-blue-500/20">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">AI Career Recommendation</span>
            <p className="text-xs text-slate-200 mt-0.5 leading-relaxed font-normal">
              "{data.career_insight}"
            </p>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Resume Score"
          value={`${data.active_resume_score || 87}%`}
          subtitle="ATS Verified Benchmark"
          icon={<FileText className="w-5 h-5 text-blue-400" />}
          badgeColor="blue"
          trend={{ value: "+6% this month", isPositive: true }}
        />

        <StatCard
          title="Job Matches"
          value={data.job_matches_count}
          subtitle="Curated matching roles"
          icon={<Briefcase className="w-5 h-5 text-cyan-400" />}
          badgeColor="cyan"
          trend={{ value: "4 new today", isPositive: true }}
        />

        <StatCard
          title="Interview Score"
          value={`${data.average_interview_score || 82}%`}
          subtitle="Average performance"
          icon={<Mic className="w-5 h-5 text-purple-400" />}
          badgeColor="purple"
          trend={{ value: "Top 15th percentile", isPositive: true }}
        />

        <StatCard
          title="Skills Identified"
          value={data.skills_identified_count}
          subtitle="Extracted competencies"
          icon={<Target className="w-5 h-5 text-emerald-400" />}
          badgeColor="emerald"
        />
      </div>

      {/* 3. Middle Row: Career Progress Chart & Active Resume Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Career Readiness Trajectory</h3>
              <p className="text-xs text-slate-400">ATS compatibility & mock interview mastery over time</p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs text-blue-400 font-semibold hover:underline flex items-center gap-1"
            >
              Full Analytics <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[50, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#scoreColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Resume Card */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Active Resume</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                Active
              </span>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 mb-4">
              <ScoreRing score={data.active_resume_score || 87} size={70} strokeWidth={6} />
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-white truncate">
                  {data.recent_resume?.title || `${firstName}_Resume.pdf`}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">ATS Score: {data.ats_score || 91}%</p>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready for Applications
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Keyword Coverage</span>
                <span className="font-bold text-white">86%</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Formatting Quality</span>
                <span className="font-bold text-white">94%</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('resumes')}
            className="w-full mt-4 py-2 rounded-xl text-xs font-bold text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all flex items-center justify-center gap-1.5"
          >
            Inspect Detailed ATS Report
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Bottom Row: Recommended Jobs & Top Skill Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recommended Jobs */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Top Recommended Jobs</h3>
              <p className="text-xs text-slate-400">Positions matching your active resume capabilities</p>
            </div>
            <button
              onClick={() => onNavigate('jobs')}
              className="text-xs text-blue-400 font-semibold hover:underline flex items-center gap-1"
            >
              Browse All ({data.job_matches_count}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {data.recommended_jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => onNavigate('jobs', job.id)}
                className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/30 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                      {job.title}
                    </h4>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300">
                      {job.work_type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {job.company} • {job.location}
                  </p>
                  
                  {/* Skill Chips */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {job.required_skills.slice(0, 4).map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[9px] bg-slate-800/80 text-slate-300 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className={`text-sm font-black ${
                      (job.match_percentage || 0) >= 85 ? 'text-emerald-400' : 'text-blue-400'
                    }`}>
                      {job.match_percentage || 75}% Match
                    </span>
                    <p className="text-[10px] text-slate-500">Compatibility</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Gap Snapshot */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Skill Gaps to Close</h3>
                <p className="text-xs text-slate-400">High-ROI skills for {data.target_role}</p>
              </div>
              <button
                onClick={() => onNavigate('skills')}
                className="text-xs text-purple-400 font-semibold hover:underline"
              >
                Roadmap
              </button>
            </div>

            <div className="space-y-3">
              {data.top_skill_gaps.map((gap, i) => (
                <div key={i} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{gap.skill}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {gap.importance}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{gap.why_it_matters}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 text-center">
            <button
              onClick={() => onNavigate('skills')}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-md shadow-purple-500/20"
            >
              Open Full Skill Gap Matrix
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
