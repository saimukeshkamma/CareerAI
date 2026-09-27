import React, { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { jobApi } from '../services/api';
import { Job, MatchBreakdown } from '../types';
import {
  Search, Filter, Briefcase, Bookmark, CheckCircle2,
  AlertCircle, ChevronRight, Sparkles, MapPin, DollarSign,
  Building, ExternalLink
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { LoadingState } from '../components/common/LoadingState';

export const JobsPage: React.FC = () => {
  const { showToast } = useNotifications();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');

  // Match Modal State
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchBreakdown | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [searchQuery, selectedWorkType, selectedExperience]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await jobApi.list({
        q: searchQuery || undefined,
        work_type: selectedWorkType !== 'All' ? selectedWorkType : undefined,
        experience_level: selectedExperience !== 'All' ? selectedExperience : undefined
      });
      setJobs(data);
    } catch (err) {
      showToast('Error', 'Unable to fetch job opportunities.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (jobId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await jobApi.toggleSave(jobId);
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, is_saved: res.saved } : j));
      showToast(res.saved ? 'Job Saved' : 'Removed', res.message, 'info');
    } catch (err) {
      showToast('Error', 'Failed to update saved job.', 'error');
    }
  };

  const handleOpenMatchDetails = async (jobId: number) => {
    try {
      setMatchLoading(true);
      setMatchModalOpen(true);
      const breakdown = await jobApi.getMatch(jobId);
      setSelectedMatch(breakdown);
    } catch (err) {
      showToast('Error', 'Failed to calculate match breakdown.', 'error');
    } finally {
      setMatchLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Smart Job Matcher</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          AI-ranked positions evaluated against your active resume skills and experience level
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role title, company, or tech skill (e.g. PyTorch, Scale AI)..."
            className="w-full bg-slate-900/80 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Work Type */}
          <select
            value={selectedWorkType}
            onChange={(e) => setSelectedWorkType(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
          >
            <option value="All">All Locations</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>

          {/* Experience Level */}
          <select
            value={selectedExperience}
            onChange={(e) => setSelectedExperience(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500"
          >
            <option value="All">All Levels</option>
            <option value="Internship">Internship</option>
            <option value="Entry-level">Entry-level</option>
            <option value="Mid-level">Mid-level</option>
          </select>
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="py-16">
          <LoadingState title="Matching jobs against your active resume..." />
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-slate-800">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No positions match your search</h3>
          <p className="text-xs text-slate-400">Try clearing your filters or broadening your search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => {
            const matchScore = job.match_percentage || 70;
            const isHighMatch = matchScore >= 85;

            return (
              <div
                key={job.id}
                onClick={() => handleOpenMatchDetails(job.id)}
                className="glass-card glass-card-hover p-5 rounded-3xl border border-slate-800/80 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-white text-xs overflow-hidden shrink-0">
                        {job.logo_url ? (
                          <img src={job.logo_url} alt={job.company} className="w-full h-full object-cover" />
                        ) : (
                          <Building className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-xs text-slate-400">{job.company}</p>
                      </div>
                    </div>

                    {/* Match Badge & Save */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                        isHighMatch
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {matchScore}% Fit
                      </span>

                      <button
                        onClick={(e) => handleToggleSave(job.id, e)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          job.is_saved
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                        }`}
                        title={job.is_saved ? "Remove Bookmark" : "Save Job"}
                      >
                        <Bookmark className="w-4 h-4" fill={job.is_saved ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </div>

                  {/* Metadata pills */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-3 mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {job.location}
                    </span>
                    {job.salary_min && (
                      <span className="flex items-center gap-1 text-slate-300 font-semibold">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        {job.salary_currency === 'USD/hr'
                          ? `$${job.salary_min}-${job.salary_max}/hr`
                          : `$${Math.round(job.salary_min / 1000)}k-$${Math.round(job.salary_max! / 1000)}k/yr`}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {job.work_type}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {job.experience_level}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                    {job.description}
                  </p>

                  {/* Skills preview */}
                  <div className="space-y-1.5 pt-3 border-t border-slate-800/60">
                    <div className="flex flex-wrap gap-1">
                      {job.matched_skills?.slice(0, 4).map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-medium">
                          ✓ {s}
                        </span>
                      ))}
                      {job.missing_skills?.slice(0, 2).map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-amber-950/60 border border-amber-500/30 text-amber-300 font-medium">
                          ○ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action footer */}
                <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[10px]">Explainable AI Match</span>
                  <span className="text-blue-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Compatibility Report <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Match Details Modal */}
      <Modal
        isOpen={matchModalOpen}
        onClose={() => setMatchModalOpen(false)}
        title="Explainable Job Match Breakdown"
        maxWidth="2xl"
      >
        {matchLoading || !selectedMatch ? (
          <div className="py-12">
            <LoadingState title="Analyzing compatibility factors..." />
          </div>
        ) : (
          <div className="space-y-6 text-left">
            {/* Header info */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedMatch.job_title}</h3>
                <p className="text-xs text-slate-400">{selectedMatch.company}</p>
                <p className="text-[11px] text-blue-400 mt-1">
                  Compared with active resume: <span className="font-semibold">{selectedMatch.active_resume_title}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-black text-emerald-400">{selectedMatch.overall_match}%</span>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Overall Fit</p>
              </div>
            </div>

            {/* AI Fit Summary */}
            <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 text-xs text-slate-200">
              <span className="font-bold text-blue-300 block mb-1">AI Fit Synthesis:</span>
              <p>{selectedMatch.fit_summary}</p>
              <p className="text-emerald-300 font-medium mt-2">
                💡 <span className="font-bold">Next step: </span>{selectedMatch.recommendation}
              </p>
            </div>

            {/* 6-Factor Weights */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Factor Weighting & Confidence Breakdown
              </h4>
              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                    <span>Skills Match (40% Weight)</span>
                    <span className="font-bold text-emerald-400">{selectedMatch.breakdown.skills_score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${selectedMatch.breakdown.skills_score}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                    <span>Experience Fit (20% Weight)</span>
                    <span className="font-bold text-blue-400">{selectedMatch.breakdown.experience_score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${selectedMatch.breakdown.experience_score}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                    <span>Project Alignment (15% Weight)</span>
                    <span className="font-bold text-indigo-400">{selectedMatch.breakdown.project_score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${selectedMatch.breakdown.project_score}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                    <span>Education Fit (10% Weight)</span>
                    <span className="font-bold text-purple-400">{selectedMatch.breakdown.education_score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: `${selectedMatch.breakdown.education_score}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                    <span>Keyword Density (10% Weight)</span>
                    <span className="font-bold text-cyan-400">{selectedMatch.breakdown.keyword_score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${selectedMatch.breakdown.keyword_score}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Matched vs Missing Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/30">
                <span className="text-[11px] font-bold text-emerald-400 block mb-2">
                  ✓ Matched Skills ({selectedMatch.matched_skills.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedMatch.matched_skills.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/30">
                <span className="text-[11px] font-bold text-amber-400 block mb-2">
                  ○ Missing Requirements ({selectedMatch.missing_skills.length})
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedMatch.missing_skills.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-amber-950/60 text-amber-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setMatchModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
