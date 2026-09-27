import React, { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { interviewApi } from '../services/api';
import { InterviewHistoryItem } from '../types';
import {
  History, Calendar, Trophy, ChevronRight,
  Mic, Play
} from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';

interface InterviewHistoryPageProps {
  onNavigate: (tab: string, contextId?: any) => void;
}

export const InterviewHistoryPage: React.FC<InterviewHistoryPageProps> = ({ onNavigate }) => {
  const { showToast } = useNotifications();
  const [history, setHistory] = useState<InterviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await interviewApi.list();
      setHistory(data);
    } catch (err) {
      showToast('Error', 'Failed to load interview history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Interview History & Reports</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review past mock interview sessions, question transcripts, and scoring rubrics
          </p>
        </div>

        <button
          onClick={() => onNavigate('interview')}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/20"
        >
          + Practice New Mock Interview
        </button>
      </div>

      {loading ? (
        <div className="py-16">
          <LoadingState title="Loading interview records..." />
        </div>
      ) : history.length === 0 ? (
        <EmptyState
          icon={<Mic className="w-6 h-6" />}
          title="No Mock Interviews Practiced Yet"
          description="Ready to sharpen your interview delivery? Practice with role-specific questions and get instant AI scoring."
          actionLabel="Start First Mock Interview"
          onAction={() => onNavigate('interview')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.map((it) => {
            const score = it.overall_score || 80;
            const isCompleted = it.status === 'completed';

            return (
              <div
                key={it.id}
                onClick={() => onNavigate('interview', it.id)}
                className="glass-card glass-card-hover p-5 rounded-3xl border border-slate-800 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                        {it.interview_type} • {it.difficulty}
                      </span>
                      <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors mt-0.5">
                        {it.role}
                      </h3>
                    </div>

                    <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                      score >= 85 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {score} / 100
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 my-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(it.created_at).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>{it.answered_count} / {it.questions_count} Questions Completed</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className={`text-[10px] font-semibold ${isCompleted ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isCompleted ? '✓ Completed Scorecard' : '○ In Progress'}
                  </span>
                  <span className="text-blue-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Score Report <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
