import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, FileText, Briefcase, Bookmark,
  Target, Mic, History, BarChart3, User, Settings
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onNavigate }) => {
  const { user } = useAuth();

  const menuSections = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'analytics', label: 'Career Analytics', icon: <BarChart3 className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Resume & Jobs',
      items: [
        { id: 'resumes', label: 'Resumes & ATS', icon: <FileText className="w-4 h-4" /> },
        { id: 'jobs', label: 'Job Matcher', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'saved-jobs', label: 'Saved Jobs', icon: <Bookmark className="w-4 h-4" /> },
        { id: 'skills', label: 'Skill Gap Analyzer', icon: <Target className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Interview Practice',
      items: [
        { id: 'interview', label: 'AI Mock Interview', icon: <Mic className="w-4 h-4" />, badge: 'Live AI' },
        { id: 'interview-history', label: 'Interview History', icon: <History className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Account',
      items: [
        { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
        { id: 'settings', label: 'Settings & Privacy', icon: <Settings className="w-4 h-4" /> }
      ]
    }
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block border-r border-slate-800/80 bg-slate-950/40 p-4 min-h-[calc(100vh-61px)]">
      {/* User Target Role Pill */}
      {user && (
        <div className="mb-6 p-3 rounded-xl bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-900/30">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Target Track</p>
          <h4 className="text-sm font-bold text-white mt-0.5 truncate">{user.target_role || 'AI Engineer'}</h4>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] text-slate-300">{user.experience_level || 'Entry-level'}</span>
          </div>
        </div>
      )}

      {/* Nav List */}
      <div className="space-y-6">
        {menuSections.map((section) => (
          <div key={section.title}>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600/90 text-white shadow-lg shadow-blue-600/20 border border-blue-500/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
