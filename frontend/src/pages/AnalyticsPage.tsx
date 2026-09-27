import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import { AnalyticsData } from '../types';
import {
  BarChart3, TrendingUp, Sparkles, Target,
  Compass, ShieldCheck, Zap
} from 'lucide-react';
import { LoadingState } from '../components/common/LoadingState';
import {
  LineChart, Line, BarChart, Bar, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getAnalytics();
      setData(res);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="py-20">
        <LoadingState title="Computing career analytics benchmarks..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Career Analytics & Market Readiness</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Quantitative evaluation across ATS scoring, mock interviews, and industry market demands
          </p>
        </div>

        {/* Readiness Badge */}
        <div className="flex items-center gap-3 glass-card px-4 py-2 rounded-2xl border border-emerald-500/30">
          <Zap className="w-5 h-5 text-emerald-400" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Readiness Index</span>
            <span className="text-base font-black text-emerald-300">{data.overall_readiness_index} / 100</span>
          </div>
        </div>
      </div>

      {/* Grid: Trajectory Trend (Left) & Competency Radar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Line Chart: Trajectory over time */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white">Score Progression Curve</h3>
            <p className="text-xs text-slate-400">Weekly trajectory across ATS audit and interview practice</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.score_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[50, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="resume_score" name="Resume ATS" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="interview_score" name="Interview AI" stroke="#a855f7" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="readiness" name="Overall Index" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart: Multidimensional competency */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white">Multi-Dimensional Competency Radar</h3>
            <p className="text-xs text-slate-400">Balanced evaluation across 6 core technical & soft disciplines</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data.category_radar}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis domain={[0, 100]} stroke="#475569" fontSize={9} />
                <Radar name="Candidate Competency" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Grid: Skill Market Demand & Acquisition Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bar Chart: Market Demand vs Possession */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white">Market Demand vs Your Competencies</h3>
            <p className="text-xs text-slate-400">Comparison of employer demand against your resume keywords</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.job_market_demand} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="skill" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="demand" name="Market Hiring Demand" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="candidatePossession" name="Your Resume Depth" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interview Performance Rubric Breakdown */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Mock Interview Category Benchmarks</h3>
            <p className="text-xs text-slate-400">Detailed performance metrics across practice answers</p>
          </div>

          <div className="space-y-3">
            {Object.entries(data.interview_performance).map(([cat, val]) => (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 capitalize">{cat.replace('_', ' ')}</span>
                  <span className="font-bold text-white">{val}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-200 mt-4">
            <span className="font-bold">Insight: </span>
            Your highest scoring dimensions are <span className="text-white font-semibold">Relevance (90%)</span> and <span className="text-white font-semibold">Technical Knowledge (88%)</span>. Practicing structured delivery frameworks will raise communication to matching levels.
          </div>
        </div>

      </div>
    </div>
  );
};
