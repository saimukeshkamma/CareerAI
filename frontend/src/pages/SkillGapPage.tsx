import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { skillApi } from '../services/api';
import { SkillGapItem } from '../types';
import {
  Target, CheckCircle2, AlertTriangle, BookOpen,
  ExternalLink, Sparkles, Clock, Compass, ChevronRight, Tv
} from 'lucide-react';
import { LoadingState } from '../components/common/LoadingState';

interface SkillGapPageProps {
  onNavigate?: (tab: string, contextId?: any) => void;
}

export const SkillGapPage: React.FC<SkillGapPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [selectedRole, setSelectedRole] = useState(user?.target_role || 'AI Engineer');
  const [identifiedSkills, setIdentifiedSkills] = useState<string[]>([]);
  const [gaps, setGaps] = useState<SkillGapItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkillGaps();
  }, [selectedRole]);

  const fetchSkillGaps = async () => {
    try {
      setLoading(true);
      const res = await skillApi.getGaps(selectedRole);
      setIdentifiedSkills(res.user_skills_identified);
      setGaps(res.gaps);
    } catch (err) {
      showToast('Error', 'Failed to calculate skill gaps.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const roles = ["AI Engineer", "ML Engineer", "Software Engineer", "Data Scientist"];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header & Target Role Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Skill Gap Analysis & Roadmaps</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify exact missing technical requirements and follow curated learning paths
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline">Target Track:</span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs font-bold text-white rounded-xl px-3.5 py-2 outline-none focus:border-blue-500"
          >
            {roles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Comparison Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
          Competency Matrix for {selectedRole}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Skills */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Your Verified Skills ({identifiedSkills.length})
              </span>
              <span className="text-[10px] text-slate-400">Extracted from Active Resume</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {identifiedSkills.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No resume uploaded yet. Upload a resume to automatically verify skills.</p>
              ) : (
                identifiedSkills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-950/60 border border-emerald-500/30 text-emerald-200"
                  >
                    ✓ {s}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Skills to Learn ({gaps.length})
              </span>
              <span className="text-[10px] text-slate-400">High-ROI Market Demand</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {gaps.map((g, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-950/60 border border-amber-500/30 text-amber-200"
                >
                  ○ {g.skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Learning Roadmaps for Each Missing Skill */}
      {loading ? (
        <div className="py-12">
          <LoadingState title="Analyzing curriculum requirements..." />
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Structured Upskilling Roadmaps ({gaps.length})
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {gaps.map((item, idx) => {
              const badgeColors = {
                Critical: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                High: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                Medium: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              };

              return (
                <div
                  key={idx}
                  className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">{item.skill}</h4>
                        <p className="text-xs text-slate-400">{item.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase border ${
                        badgeColors[item.importance as keyof typeof badgeColors] || badgeColors.High
                      }`}>
                        {item.importance} Priority
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-800 text-slate-300">
                        {item.difficulty} Level
                      </span>

                      <button
                        onClick={() => onNavigate && onNavigate('learning-hub', item.skill)}
                        className="px-3 py-1 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 flex items-center gap-1.5 transition-all hover:scale-105 ml-1"
                      >
                        <Tv className="w-3.5 h-3.5" />
                        <span>Improve Skill →</span>
                      </button>
                    </div>
                  </div>

                  {/* Why it matters */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Why This Matters for {selectedRole}:
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {item.why_it_matters}
                    </p>
                  </div>

                  {/* Recommended Learning Path */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 mb-1.5">
                      <Compass className="w-3.5 h-3.5" />
                      Recommended Learning Path:
                    </span>
                    <p className="text-xs text-slate-300 font-mono leading-relaxed">
                      {item.learning_path}
                    </p>
                  </div>

                  {/* Curated Resources */}
                  {item.resources && item.resources.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Free High-Quality Learning Resources:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {item.resources.map((res, rIdx) => (
                          <a
                            key={rIdx}
                            href={res.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-all hover:scale-105"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{res.title}</span>
                            <ExternalLink className="w-3 h-3 text-blue-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
