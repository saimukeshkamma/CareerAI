import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, FileText, Briefcase, Bookmark,
  Target, Mic, History, BarChart3, User, Settings, Tv,
  ChevronLeft, ChevronRight, LogOut, Sparkles, Quote
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onNavigate }) => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuSections = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 shrink-0" /> },
        { id: 'jobs', label: 'Job Matcher', icon: <Briefcase className="w-4 h-4 shrink-0" /> },
        { id: 'saved-jobs', label: 'Saved Matches', icon: <Bookmark className="w-4 h-4 shrink-0" /> }
      ]
    },
    {
      title: 'Preparation Center',
      items: [
        { id: 'interview', label: 'AI Mock Interview', icon: <Mic className="w-4 h-4 shrink-0" />, badge: 'Live AI', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
        { id: 'learning-hub', label: 'Learning Hub', icon: <Tv className="w-4 h-4 shrink-0 text-rose-400" />, badge: '15+ Videos', badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
        { id: 'skills', label: 'Skill Gap Analyzer', icon: <Target className="w-4 h-4 shrink-0" /> },
        { id: 'resumes', label: 'Resumes & ATS', icon: <FileText className="w-4 h-4 shrink-0" /> },
        { id: 'interview-history', label: 'Interview Reports', icon: <History className="w-4 h-4 shrink-0" /> }
      ]
    },
    {
      title: 'Account',
      items: [
        { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4 shrink-0" /> },
        { id: 'profile', label: 'My Profile', icon: <User className="w-4 h-4 shrink-0" /> },
        { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4 shrink-0" /> }
      ]
    }
  ];

  return (
    <aside
      className={`shrink-0 hidden lg:flex flex-col border-r border-slate-800/80 bg-[#0b132b] text-slate-200 transition-all duration-300 min-h-[calc(100vh-61px)] ${
        isCollapsed ? 'w-[74px] p-3' : 'w-[260px] p-4'
      }`}
    >
      {/* Top Branding & Collapse Button (JobMatch AI Reference Design) */}
      <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-800/70">
        <div
          onClick={() => onNavigate('dashboard')}
          className={`flex items-center gap-2.5 cursor-pointer overflow-hidden transition-all ${
            isCollapsed ? 'justify-center w-full' : ''
          }`}
        >
          {/* Logo Mark: Gradient Icon */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 p-0.5 shadow-md shadow-indigo-600/30 shrink-0">
            <div className="w-full h-full bg-[#0b132b] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white font-heading">
                  JobMatch
                </span>
                <span className="px-1.5 py-0.2 text-[10px] font-extrabold rounded bg-[#f43f5e] text-white tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                Agent 50 • Placement Intelligence
              </p>
            </div>
          )}
        </div>

        {/* Toggle Collapse */}
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="mx-auto mb-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 space-y-5 overflow-y-auto pr-1">
        {menuSections.map((section) => (
          <div key={section.title}>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all ${
                      isCollapsed
                        ? 'justify-center p-2.5'
                        : 'justify-between px-3 py-2.5'
                    } ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.icon}
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-md border ${
                          item.badgeColor || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                        }`}
                      >
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

      {/* Reference Inspiration Quote Card (Visible when expanded) */}
      {!isCollapsed && (
        <div className="my-3 p-3.5 rounded-2xl bg-[#1c2541] border border-[#3a4e7a]/40 shadow-inner">
          <div className="flex items-center gap-1.5 text-indigo-400 mb-1">
            <Quote className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
              Daily Motivation
            </span>
          </div>
          <p className="font-script text-base text-indigo-100 font-semibold leading-tight">
            "Consistent Learning Leads to Greater Opportunities."
          </p>
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-700/40 text-[11px] text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="truncate">Active Track: {user?.target_role || 'AI Engineer'}</span>
          </div>
        </div>
      )}

      {/* User Footer Profile & Red Logout (JobMatch AI Design) */}
      {user && (
        <div className="pt-3 border-t border-slate-800/70 flex items-center justify-between">
          <div
            onClick={() => onNavigate('profile')}
            className={`flex items-center gap-2.5 cursor-pointer min-w-0 ${
              isCollapsed ? 'justify-center w-full' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold shadow shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.target_role || 'Candidate'}</p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </aside>
  );
};
