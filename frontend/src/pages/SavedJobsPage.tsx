import React, { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { jobApi } from '../services/api';
import { Job } from '../types';
import {
  Bookmark, MapPin, DollarSign, Building,
  Trash2, ExternalLink, Briefcase
} from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';

interface SavedJobsPageProps {
  onNavigate: (tab: string, contextId?: any) => void;
}

export const SavedJobsPage: React.FC<SavedJobsPageProps> = ({ onNavigate }) => {
  const { showToast } = useNotifications();
  const [savedList, setSavedList] = useState<{ saved_id: number; saved_at: string; job: Job }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = async () => {
    try {
      setLoading(true);
      const data = await jobApi.getSaved();
      setSavedList(data);
    } catch (err) {
      showToast('Error', 'Failed to fetch saved jobs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (jobId: number) => {
    try {
      await jobApi.toggleSave(jobId);
      setSavedList(prev => prev.filter(item => item.job.id !== jobId));
      showToast('Removed', 'Removed from saved jobs.', 'info');
    } catch (err) {
      showToast('Error', 'Failed to remove saved job.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Saved Jobs</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Review and prepare application materials for your bookmarked opportunities
        </p>
      </div>

      {loading ? (
        <div className="py-16">
          <LoadingState title="Loading saved positions..." />
        </div>
      ) : savedList.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-6 h-6" />}
          title="No Saved Jobs Yet"
          description="Browse matched opportunities and click the bookmark icon to save jobs here."
          actionLabel="Explore Job Matcher"
          onAction={() => onNavigate('jobs')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedList.map(({ job }) => (
            <div
              key={job.id}
              className="glass-card p-5 rounded-3xl border border-slate-800 flex flex-col justify-between"
            >
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
                      <h3 className="text-sm font-bold text-white">{job.title}</h3>
                      <p className="text-xs text-slate-400">{job.company}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(job.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 my-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> {job.location}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                    {job.work_type}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-emerald-500/20 text-emerald-300">
                    {job.match_percentage || 75}% Fit
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                  {job.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => onNavigate('interview')}
                  className="text-xs text-purple-400 font-bold hover:underline"
                >
                  Practice Interview for this Role ➔
                </button>
                <button
                  onClick={() => onNavigate('jobs', job.id)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
