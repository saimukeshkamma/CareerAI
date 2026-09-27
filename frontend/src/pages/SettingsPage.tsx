import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { profileApi } from '../services/api';
import {
  Settings, Sun, Moon, Bell, Shield,
  Trash2, Download, AlertTriangle
} from 'lucide-react';

interface SettingsPageProps {
  onNavigate: (tab: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useNotifications();

  // Notification toggles
  const [jobAlerts, setJobAlerts] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState(true);

  const handleDownloadData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `careerai_candidate_data_${user?.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Data Exported', 'Your profile and application data has been downloaded.', 'success');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("WARNING: Are you sure you want to permanently delete your CareerAI account and all resume analyses? This action is irreversible.")) return;

    try {
      await profileApi.deleteAccount();
      logout();
      showToast('Account Deleted', 'Your account has been permanently removed.', 'info');
      onNavigate('landing');
    } catch (err) {
      showToast('Error', 'Failed to delete account.', 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in text-left">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Settings & Privacy</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage appearance themes, notification delivery, and data control
        </p>
      </div>

      {/* Appearance Section */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
          Appearance Theme
        </h3>
        <p className="text-xs text-slate-400">
          Customize your viewing experience with our dark glassmorphic palette or crisp light theme.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              theme === 'dark'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            Dark Mode (Default)
          </button>
          <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              theme === 'light'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            Light Mode
          </button>
        </div>
      </div>

      {/* Notifications Preferences */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-400" />
          Notification Alerts
        </h3>
        <p className="text-xs text-slate-400">
          Configure what system events trigger notifications.
        </p>

        <div className="space-y-3 pt-2">
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-white block">New Job Fit Alerts</span>
              <span className="text-[11px] text-slate-400">Notify when high-compatibility (85%+) jobs are indexed</span>
            </div>
            <input
              type="checkbox"
              checked={jobAlerts}
              onChange={(e) => setJobAlerts(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-white block">AI Interview Reminders</span>
              <span className="text-[11px] text-slate-400">Weekly practice prompts to maintain communication fluency</span>
            </div>
            <input
              type="checkbox"
              checked={interviewReminders}
              onChange={(e) => setInterviewReminders(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-white block">AI Upskilling Recommendations</span>
              <span className="text-[11px] text-slate-400">Curated roadmaps when high-ROI skill gaps are detected</span>
            </div>
            <input
              type="checkbox"
              checked={aiRecommendations}
              onChange={(e) => setAiRecommendations(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
          </label>
        </div>
      </div>

      {/* Privacy & Data Management */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          Privacy & Data Sovereignty
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your career data belongs strictly to you. Resumes uploaded to CareerAI are analyzed locally or via secure inference, never used for external ad tracking or third-party scraping.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadData}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-blue-400" />
            Download My Complete Data (JSON)
          </button>

          <button
            onClick={() => onNavigate('resumes')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4 text-amber-400" />
            Manage / Delete Resumes
          </button>
        </div>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="glass-card p-6 rounded-3xl border border-rose-500/30 bg-rose-950/10 space-y-3">
        <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Danger Zone
        </h3>
        <p className="text-xs text-slate-300">
          Permanently delete your user account, stored resumes, ATS analysis records, and mock interview transcripts.
        </p>
        <div className="pt-2">
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/20 transition-all"
          >
            Permanently Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
};
