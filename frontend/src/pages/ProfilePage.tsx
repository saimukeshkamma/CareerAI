import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { profileApi } from '../services/api';
import { ProfileStats } from '../types';
import { ScoreRing } from '../components/common/ScoreRing';
import { Modal } from '../components/common/Modal';
import {
  User as UserIcon, Mail, Phone, MapPin, GraduationCap,
  Briefcase, Save, ShieldCheck, Globe,
  Sparkles, Award, CheckCircle2, AlertCircle,
  ExternalLink, Plus, X, Camera, RefreshCw, Eye, Star,
  Play, FileText, ChevronRight, DollarSign, Clock, ArrowRight,
  Share2, Copy, Check, TrendingUp, Target, Compass, Trash2,
  Shield, Laptop, BookOpen, Layers
} from 'lucide-react';

const GithubIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.3a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z" />
  </svg>
);

const TwitterIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface ProfilePageProps {
  onNavigate?: (tab: string, contextId?: any) => void;
}

const PRESET_AVATARS = [
  {
    id: 'ai-specialist',
    label: 'AI Specialist',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'systems-architect',
    label: 'Systems Architect',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'ml-researcher',
    label: 'ML Researcher',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'fullstack-dev',
    label: 'Fullstack Dev',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'data-scientist',
    label: 'Data Scientist',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
  },
  {
    id: 'cloud-engineer',
    label: 'Cloud Engineer',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'
  }
];

const SUGGESTED_SKILL_DOMAINS = [
  {
    category: '🤖 AI & Machine Learning',
    skills: ['PyTorch', 'TensorFlow', 'LangChain', 'HuggingFace', 'Transformers', 'Vector DBs', 'OpenCV', 'Scikit-Learn']
  },
  {
    category: '☁️ Cloud & Infrastructure',
    skills: ['Docker', 'Kubernetes', 'AWS', 'GCP', 'CI/CD', 'Linux', 'Terraform']
  },
  {
    category: '⚡ Backend & Systems',
    skills: ['FastAPI', 'Python', 'PostgreSQL', 'Redis', 'SQL', 'Kafka', 'GraphQL']
  },
  {
    category: '💻 Frontend & Web',
    skills: ['React', 'TypeScript', 'Next.js', 'TailwindCSS', 'Node.js']
  }
];

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, updateUserLocal } = useAuth();
  const { showToast } = useNotifications();

  // Active Tab: overview | personal | career | skills | security
  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'career' | 'skills' | 'security'>('overview');

  // Core candidate attributes
  const [name, setName] = useState(user?.name || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [college, setCollege] = useState(user?.college || '');
  const [degree, setDegree] = useState(user?.degree || '');
  const [branch, setBranch] = useState(user?.branch || '');
  const [gradYear, setGradYear] = useState<number | undefined>(user?.graduation_year || 2026);
  const [targetRole, setTargetRole] = useState(user?.target_role || 'AI Engineer');
  const [experienceLevel, setExperienceLevel] = useState(user?.experience_level || 'Entry-level');
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profile_photo || '');

  // Social & portfolio links
  const [githubUrl, setGithubUrl] = useState(user?.github_url || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin_url || '');
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolio_url || '');
  const [twitterUrl, setTwitterUrl] = useState(user?.twitter_url || '');

  // Career preferences
  const [preferredWorkType, setPreferredWorkType] = useState(user?.preferred_work_type || 'Remote');
  const [preferredJobType, setPreferredJobType] = useState(user?.preferred_job_type || 'Full-time');
  const [salaryExpectation, setSalaryExpectation] = useState(user?.salary_expectation || '$130k - $160k / yr');
  const [availability, setAvailability] = useState(user?.availability || 'Immediate');

  // Interactive skills tags
  const [skillsList, setSkillsList] = useState<string[]>(() => {
    if (!user?.skills) return ['Python', 'PyTorch', 'FastAPI', 'SQL', 'Docker'];
    return user.skills.split(',').map(s => s.trim()).filter(Boolean);
  });
  const [skillInput, setSkillInput] = useState('');

  // Modals & stats state
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customPhotoInput, setCustomPhotoInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync from user state
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setHeadline(user.headline || '');
      setPhone(user.phone || '');
      setLocation(user.location || '');
      setCollege(user.college || '');
      setDegree(user.degree || '');
      setBranch(user.branch || '');
      setGradYear(user.graduation_year || 2026);
      setTargetRole(user.target_role || 'AI Engineer');
      setExperienceLevel(user.experience_level || 'Entry-level');
      setBio(user.bio || '');
      setProfilePhoto(user.profile_photo || '');
      setGithubUrl(user.github_url || '');
      setLinkedinUrl(user.linkedin_url || '');
      setPortfolioUrl(user.portfolio_url || '');
      setTwitterUrl(user.twitter_url || '');
      setPreferredWorkType(user.preferred_work_type || 'Remote');
      setPreferredJobType(user.preferred_job_type || 'Full-time');
      setSalaryExpectation(user.salary_expectation || '$130k - $160k / yr');
      setAvailability(user.availability || 'Immediate');
      if (user.skills) {
        setSkillsList(user.skills.split(',').map(s => s.trim()).filter(Boolean));
      }
    }
  }, [user]);

  // Fetch real-time stats
  const fetchStats = async () => {
    try {
      const data = await profileApi.getStats();
      setStats(data);
    } catch {
      // Gracefully continue with calculated local score if server stats unavailable
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveProfile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    name, headline, phone, location, college, degree, branch, gradYear,
    targetRole, experienceLevel, bio, profilePhoto, githubUrl, linkedinUrl,
    portfolioUrl, twitterUrl, preferredWorkType, preferredJobType,
    salaryExpectation, availability, skillsList
  ]);

  // Calculate local profile strength
  const calculatedStrength = useMemo(() => {
    let score = 0;
    if (name && (phone || location)) score += 10;
    if (headline && headline.trim().length > 5) score += 10;
    if (bio && bio.trim().length > 15) score += 10;
    if (profilePhoto) score += 10;
    if (githubUrl || linkedinUrl || portfolioUrl) score += 10;
    if (college && degree) score += 10;
    if (targetRole && experienceLevel) score += 10;
    if (skillsList.length >= 3) score += 10;
    if (stats?.active_resume) score += 10;
    if (stats?.interview_summary && stats.interview_summary.total_completed > 0) score += 10;
    return Math.min(100, Math.max(score, stats?.profile_strength || 50));
  }, [name, headline, phone, location, bio, profilePhoto, githubUrl, linkedinUrl, portfolioUrl, college, degree, targetRole, experienceLevel, skillsList, stats]);

  // Skill management
  const handleAddSkill = (skillToAdd?: string) => {
    const s = (skillToAdd || skillInput).trim();
    if (!s) return;
    if (!skillsList.some(item => item.toLowerCase() === s.toLowerCase())) {
      setSkillsList(prev => [...prev, s]);
    }
    if (!skillToAdd) setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillsList(prev => prev.filter(s => s !== skillToRemove));
  };

  // Avatar select
  const handleSelectAvatar = async (url: string) => {
    setProfilePhoto(url);
    setShowAvatarModal(false);
    try {
      const updated = await profileApi.updateAvatar(url);
      updateUserLocal(updated);
      showToast('Avatar Updated', 'Your profile picture has been updated.', 'success');
      fetchStats();
    } catch {
      showToast('Avatar Saved Locally', 'Remember to click Save Profile to persist.', 'info');
    }
  };

  // Main save profile
  const saveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name,
        headline,
        phone,
        location,
        college,
        degree,
        branch,
        graduation_year: gradYear,
        target_role: targetRole,
        experience_level: experienceLevel,
        bio,
        profile_photo: profilePhoto,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        portfolio_url: portfolioUrl,
        twitter_url: twitterUrl,
        skills: skillsList.join(', '),
        preferred_work_type: preferredWorkType,
        preferred_job_type: preferredJobType,
        salary_expectation: salaryExpectation,
        availability
      };

      const updated = await profileApi.update(payload);
      updateUserLocal(updated);
      showToast('Profile Updated', 'Your candidate profile & preferences have been saved.', 'success');
      fetchStats();
    } catch {
      showToast('Save Failed', 'Unable to update profile. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Copy profile link
  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/candidate/' + (user?.id || 1));
    setCopiedLink(true);
    showToast('Link Copied', 'Candidate Passport profile link copied to clipboard.', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left pb-16">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Candidate Profile & Passport</h1>
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Synced
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Curate your candidate persona, configure skills matching preferences, and monitor recruiter readiness.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowPreviewModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02]"
            title="Preview how recruiters and tech hiring managers view your profile"
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" /> Recruiter Preview
          </button>

          <button
            onClick={handleCopyProfileLink}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02]"
            title="Copy shareable candidate link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-indigo-400" />}
            {copiedLink ? 'Copied!' : 'Share Profile'}
          </button>

          <button
            onClick={() => saveProfile()}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 hover:scale-[1.03] active:scale-[0.98]"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save Profile'}
            <span className="hidden sm:inline text-[9px] text-blue-200 opacity-60 ml-0.5">Ctrl+S</span>
          </button>
        </div>
      </div>

      {/* Hero Candidate Profile Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-[#0a0f1d] to-[#080c17] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Avatar and Primary Identity */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-xl shadow-blue-500/20 overflow-hidden">
                <div className="w-full h-full rounded-[22px] overflow-hidden bg-slate-900 flex items-center justify-center text-white text-2xl font-black">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>

              {/* Status pulse badge */}
              <div
                className="absolute -bottom-1 -right-1 bg-slate-900/95 border border-emerald-500/40 rounded-full px-2 py-0.5 flex items-center gap-1 shadow-md"
                title="Status: Actively Interviewing / Open to Roles"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Active</span>
              </div>

              {/* Avatar change overlay */}
              <button
                onClick={() => setShowAvatarModal(true)}
                className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-1 backdrop-blur-xs cursor-pointer"
              >
                <Camera className="w-4 h-4 text-blue-400" />
                Change
              </button>
            </div>

            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-1.5">
                  {name || 'Your Full Name'}
                  <span title="Verified Candidate">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 fill-blue-500/20" />
                  </span>
                </h2>
                <span className="text-[10px] font-extrabold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/25">
                  {targetRole} Track
                </span>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/25">
                  {experienceLevel}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-medium text-slate-300 line-clamp-2">
                {headline || 'Add a professional headline (e.g., Full-Stack AI Engineer | PyTorch & Distributed Systems)'}
              </p>

              <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap pt-0.5">
                {location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> {location}
                  </span>
                )}
                {college && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-500" /> {college} {gradYear ? `(${gradYear})` : ''}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Laptop className="w-3.5 h-3.5 text-slate-500" /> {preferredWorkType}
                </span>
              </div>

              {/* Social profile quick chips */}
              <div className="flex items-center gap-2 pt-2 flex-wrap">
                {githubUrl ? (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700/80 transition-all"
                  >
                    <GithubIcon className="w-3.5 h-3.5 text-slate-400" /> GitHub
                  </a>
                ) : (
                  <button
                    onClick={() => setActiveTab('personal')}
                    className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 bg-slate-900/60 px-2 py-0.5 rounded border border-dashed border-slate-800"
                  >
                    <Plus className="w-3 h-3" /> Add GitHub
                  </button>
                )}

                {linkedinUrl ? (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700/80 transition-all"
                  >
                    <LinkedinIcon className="w-3.5 h-3.5 text-blue-400" /> LinkedIn
                  </a>
                ) : (
                  <button
                    onClick={() => setActiveTab('personal')}
                    className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 bg-slate-900/60 px-2 py-0.5 rounded border border-dashed border-slate-800"
                  >
                    <Plus className="w-3 h-3" /> Add LinkedIn
                  </button>
                )}

                {portfolioUrl ? (
                  <a
                    href={portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700/80 transition-all"
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-400" /> Portfolio
                  </a>
                ) : null}

                {twitterUrl ? (
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700/80 transition-all"
                  >
                    <TwitterIcon className="w-3.5 h-3.5 text-sky-400" /> X
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          {/* Profile Strength Score Card */}
          <div className="w-full md:w-auto flex md:flex-col items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <ScoreRing
                score={calculatedStrength}
                size={70}
                strokeWidth={7}
                label=""
                colorScheme="auto"
              />
              <div className="text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Candidate Strength</span>
                <span className="text-base font-black text-white block">
                  {calculatedStrength}%
                </span>
                <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                  {stats?.strength_label || (calculatedStrength >= 85 ? 'All-Star Candidate' : 'Profile Active')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowChecklistModal(true)}
              className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors group"
            >
              Readiness Checklist <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: '🌟 Overview & Highlights', icon: Layers },
          { id: 'personal', label: '👤 Personal & Socials', icon: UserIcon },
          { id: 'career', label: '🎯 Career & Education Track', icon: Compass },
          { id: 'skills', label: '⚡ Technical Skills Tag Cloud', icon: Sparkles },
          { id: 'security', label: '🔒 Account & Security', icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & HIGHLIGHTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Integrated Career Readiness Radar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Active Resume Card */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/60 relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                  Active Resume
                </span>
              </div>
              <h4 className="text-xs font-bold text-white mb-1 truncate">
                {stats?.active_resume?.title || 'Alex_Rivera_AI_Resume.pdf'}
              </h4>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-xl font-black text-white">
                  {stats?.active_resume?.ats_score ?? 91}%
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">ATS Score</span>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('resumes')}
                  className="w-full py-1.5 rounded-lg text-[11px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 transition-all flex items-center justify-center gap-1"
                >
                  Analyze Resume <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Mock Interview Evaluation Card */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/60 relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Play className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                  Interview Coach
                </span>
              </div>
              <h4 className="text-xs font-bold text-white mb-1">
                {stats?.interview_summary?.latest_role || `${targetRole} Mock`}
              </h4>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-xl font-black text-white">
                  {stats?.interview_summary?.avg_score || 82}%
                </span>
                <span className="text-[10px] text-purple-400 font-semibold">
                  Avg Score ({stats?.interview_summary?.total_completed || 1} mock)
                </span>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('interview')}
                  className="w-full py-1.5 rounded-lg text-[11px] font-bold text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 transition-all flex items-center justify-center gap-1"
                >
                  Practice Interview <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* YouTube Learning Hub Card */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/60 relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md">
                  Learning Hub
                </span>
              </div>
              <h4 className="text-xs font-bold text-white mb-1">
                Curated YouTube Tracks
              </h4>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-xl font-black text-white">
                  {(stats?.learning_summary?.in_progress_count || 3) + (stats?.learning_summary?.saved_count || 4)}
                </span>
                <span className="text-[10px] text-red-400 font-semibold">
                  Topics Tracked
                </span>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('learning-hub')}
                  className="w-full py-1.5 rounded-lg text-[11px] font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 transition-all flex items-center justify-center gap-1"
                >
                  Open Learning Hub <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Job Match Radar Card */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/60 relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Target className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  Job Matcher
                </span>
              </div>
              <h4 className="text-xs font-bold text-white mb-1">
                Matched Tech Roles
              </h4>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-xl font-black text-white">
                  {stats?.job_matches_count || 15}+
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  Roles Ready
                </span>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('jobs')}
                  className="w-full py-1.5 rounded-lg text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-1"
                >
                  Browse Tech Jobs <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Elevator Pitch & Core Skills Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" /> Candidate Elevator Pitch & Bio
                </h3>
                <button
                  onClick={() => setActiveTab('personal')}
                  className="text-xs text-blue-400 hover:underline"
                >
                  Edit Bio
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 leading-relaxed italic">
                "{bio || 'Add a compelling bio summarizing your technical achievements, research focus, and career aspirations.'}"
              </div>

              {/* Career Preference Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Work Setting</span>
                  <span className="text-xs font-bold text-white">{preferredWorkType}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Role Type</span>
                  <span className="text-xs font-bold text-white">{preferredJobType}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Target Salary</span>
                  <span className="text-xs font-bold text-white">{salaryExpectation || 'Negotiable'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Availability</span>
                  <span className="text-xs font-bold text-white">{availability || 'Immediate'}</span>
                </div>
              </div>
            </div>

            {/* Quick Skills Cloud */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-400" /> Active Skills ({skillsList.length})
                </h3>
                <button
                  onClick={() => setActiveTab('skills')}
                  className="text-xs text-blue-400 hover:underline"
                >
                  Manage
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {skillsList.slice(0, 12).map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-semibold text-slate-200 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
                {skillsList.length > 12 && (
                  <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg">
                    +{skillsList.length - 12} more
                  </span>
                )}
              </div>

              {onNavigate && (
                <button
                  onClick={() => onNavigate('skills')}
                  className="w-full mt-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-blue-400" /> Run Skill Gap Analysis
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERSONAL & SOCIAL DETAILS */}
      {activeTab === 'personal' && (
        <form onSubmit={saveProfile} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Personal Identity & Social Profiles</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              These details form the foundation of your candidate dossier and are used for job matching algorithms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                placeholder="e.g. Alex Rivera"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Professional Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Aspiring AI Engineer | Generative AI & Systems"
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-slate-900/50 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 outline-none cursor-not-allowed"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 234-5678"
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Location / City & Country</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA, USA"
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Elevator Pitch / Bio
                <span className="text-slate-500 text-[10px] font-normal ml-2">
                  ({bio.length} characters)
                </span>
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write 2-3 sentences highlighting your passion for technology, standout projects, and technical ambitions..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Social & Portfolio Links Section */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-400" /> Social & Portfolio Links
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <GithubIcon className="w-3.5 h-3.5 text-slate-400" /> GitHub URL
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/your-username"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <LinkedinIcon className="w-3.5 h-3.5 text-blue-400" /> LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/your-profile"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" /> Personal Portfolio / Website
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://yourname.dev"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <TwitterIcon className="w-3.5 h-3.5 text-sky-400" /> Twitter / X Profile
                </label>
                <input
                  type="url"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  placeholder="https://x.com/your_handle"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving Changes...' : 'Save Personal Details'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: CAREER & EDUCATION TRACK */}
      {activeTab === 'career' && (
        <form onSubmit={saveProfile} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Target Career Track & Academic Background</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Specify your dream role, seniority level, work preferences, and university background.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Job Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              >
                <option value="AI Engineer">AI Engineer</option>
                <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                <option value="Deep Learning Specialist">Deep Learning Specialist</option>
                <option value="NLP Engineer">NLP Engineer</option>
                <option value="Computer Vision Engineer">Computer Vision Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Software Engineer">Software Engineer</option>
                <option value="Fullstack Developer">Fullstack Developer</option>
                <option value="Backend Engineer">Backend Engineer</option>
                <option value="Cloud / DevOps Architect">Cloud / DevOps Architect</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              >
                <option value="Student / Intern">Student / Intern</option>
                <option value="Entry-level">Entry-level (0-2 yrs)</option>
                <option value="Mid-level">Mid-level (3-5 yrs)</option>
                <option value="Senior">Senior (5+ yrs)</option>
                <option value="Staff / Lead">Staff / Principal (8+ yrs)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">College / University</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. Stanford University"
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Degree Title</label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. Bachelor of Science"
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Major / Branch</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. Computer Science (AI Track)"
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Graduation Year</label>
              <input
                type="number"
                value={gradYear || ''}
                onChange={(e) => setGradYear(parseInt(e.target.value) || undefined)}
                placeholder="2026"
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Job & Work Preferences */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-400" /> Work Preferences & Availability
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Work Setting</label>
                <select
                  value={preferredWorkType}
                  onChange={(e) => setPreferredWorkType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                  <option value="Open to Any">Open to Any</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Job Commitment</label>
                <select
                  value={preferredJobType}
                  onChange={(e) => setPreferredJobType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract / Part-time">Contract / Part-time</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Salary Expectation</label>
                <input
                  type="text"
                  value={salaryExpectation}
                  onChange={(e) => setSalaryExpectation(e.target.value)}
                  placeholder="e.g. $130,000 - $160,000 / yr"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Availability</label>
                <input
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g. Immediate / June 2026"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving Changes...' : 'Save Career Preferences'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: TECHNICAL SKILLS TAG CLOUD */}
      {activeTab === 'skills' && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" /> Technical Skills & Competencies ({skillsList.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                These tags directly power the AI Job Matcher and Skill Gap Analyzer to match you with top tech roles.
              </p>
            </div>

            <button
              onClick={() => saveProfile()}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
            >
              <Save className="w-3.5 h-3.5" /> Save Skills
            </button>
          </div>

          {/* Add skill input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="Type a technical skill or framework (e.g., PyTorch, Docker, Kubernetes) and press Enter..."
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
            />
            <button
              type="button"
              onClick={() => handleAddSkill()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {/* Active Skills Tag Cloud */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 min-h-[120px] flex flex-wrap gap-2 items-start content-start">
            {skillsList.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No skills added yet. Use the input above or select from recommended skills below.</p>
            ) : (
              skillsList.map((skill, idx) => (
                <span
                  key={idx}
                  className="group inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-xl hover:border-slate-600 transition-all shadow-xs"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-red-400 transition-colors ml-0.5"
                    title={`Remove ${skill}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Suggested Skills by Category */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400" /> One-Click Recommended Skills
            </h4>

            <div className="space-y-3">
              {SUGGESTED_SKILL_DOMAINS.map((domain, dIdx) => (
                <div key={dIdx} className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400">{domain.category}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {domain.skills.map((s, sIdx) => {
                      const alreadyAdded = skillsList.some(item => item.toLowerCase() === s.toLowerCase());
                      return (
                        <button
                          key={sIdx}
                          type="button"
                          disabled={alreadyAdded}
                          onClick={() => handleAddSkill(s)}
                          className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                            alreadyAdded
                              ? 'text-emerald-400/60 bg-emerald-500/5 border-emerald-500/20 cursor-default'
                              : 'text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border-slate-700 cursor-pointer hover:scale-105'
                          }`}
                        >
                          {alreadyAdded ? <Check className="w-3 h-3 text-emerald-400" /> : <Plus className="w-3 h-3" />}
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ACCOUNT & PRIVACY */}
      {activeTab === 'security' && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Account Identity & Security
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage your credentials, verify authentication integrity, and safeguard your data privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Candidate ID</span>
              <p className="text-xs font-mono font-bold text-white">#USR-{user?.id || 1}-PRO</p>
              <span className="text-[10px] text-slate-500 block">Registered on {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Security & Cryptography</span>
              <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> SHA256 / JWT Authentication Active
              </p>
              <span className="text-[10px] text-slate-500 block">Session tokens encrypted & refreshed</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-xs text-slate-300 space-y-1.5">
            <h4 className="font-bold text-blue-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> CareerAI Privacy Pledge
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your uploaded resumes, interview recordings, and performance transcripts are isolated in private storage. We never sell candidate telemetry or train public models on your proprietary answers.
            </p>
          </div>

          {/* Danger Zone */}
          <div className="pt-6 border-t border-red-500/20 space-y-3">
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" /> Danger Zone
            </h4>

            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h5 className="text-xs font-bold text-white">Delete Candidate Account</h5>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Permanently erase your candidate profile, uploaded resumes, mock interview recordings, and learning progress.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 border border-red-500/30 transition-all flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: AVATAR CHOOSER */}
      <Modal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        title="Choose Candidate Avatar"
        maxWidth="lg"
      >
        <div className="space-y-5 text-left">
          <p className="text-xs text-slate-400">
            Select a high-resolution AI/tech avatar preset or paste your custom profile photo URL.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PRESET_AVATARS.map((av) => {
              const isSelected = profilePhoto === av.url;
              return (
                <button
                  key={av.id}
                  onClick={() => handleSelectAvatar(av.url)}
                  className={`p-3 rounded-2xl border text-left transition-all group flex flex-col items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/10 border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-700/80 group-hover:scale-105 transition-transform">
                    <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-200">{av.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Custom Photo Image URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={customPhotoInput}
                onChange={(e) => setCustomPhotoInput(e.target.value)}
                placeholder="https://your-domain.com/photo.jpg"
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (customPhotoInput) handleSelectAvatar(customPhotoInput);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: RECRUITER PREVIEW */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Recruiter Public View"
        maxWidth="2xl"
      >
        <div className="space-y-6 text-left">
          <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-cyan-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              This is how technical recruiters and hiring managers view your profile in the candidate pool.
            </span>
            <span className="text-[10px] font-bold bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30">
              Live Preview
            </span>
          </div>

          {/* Clean Candidate Card View */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 space-y-5 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
                {profilePhoto ? (
                  <img src={profilePhoto} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white">
                    {name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">{name}</h3>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    Ready to Interview
                  </span>
                </div>
                <p className="text-xs font-semibold text-blue-400">{headline || targetRole}</p>
                <p className="text-[11px] text-slate-400">
                  {location} • {college} {degree ? `(${degree})` : ''} • {preferredWorkType}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 italic">
              "{bio || 'Motivated engineering candidate focused on high-impact technology solutions.'}"
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Core Technical Stack</span>
              <div className="flex flex-wrap gap-1.5">
                {skillsList.map((s, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-semibold text-slate-200 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/80"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Target Role</span>
                <span className="font-bold text-white">{targetRole}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Experience</span>
                <span className="font-bold text-white">{experienceLevel}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Comp Target</span>
                <span className="font-bold text-white">{salaryExpectation || 'Flexible'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Notice / Start</span>
                <span className="font-bold text-white">{availability}</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: PROFILE STRENGTH CHECKLIST */}
      <Modal
        isOpen={showChecklistModal}
        onClose={() => setShowChecklistModal(false)}
        title="Candidate Readiness Checklist"
        maxWidth="md"
      >
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block">Current Strength</span>
              <span className="text-xl font-black text-white">{calculatedStrength}%</span>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              {stats?.strength_label || 'All-Star Candidate'}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Complete the milestones below to maximize visibility in AI job matching and recruiter searches:
          </p>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {(stats?.completion_items || [
              { id: '1', title: 'Personal Details & Contact', completed: true, points: 10, tip: 'Keep email and phone verified.' },
              { id: '2', title: 'Professional Headline', completed: Boolean(headline), points: 10, tip: 'Add your target job title.' },
              { id: '3', title: 'Candidate Bio & Pitch', completed: Boolean(bio), points: 10, tip: 'Summarize your experience.' },
              { id: '4', title: 'Profile Photo / Avatar', completed: Boolean(profilePhoto), points: 10, tip: 'Choose a professional avatar.' },
              { id: '5', title: 'GitHub / LinkedIn Links', completed: Boolean(githubUrl || linkedinUrl), points: 10, tip: 'Add portfolio links.' },
              { id: '6', title: 'Education & Degree', completed: Boolean(college), points: 10, tip: 'Add your university.' },
              { id: '7', title: 'Target Role & Preferences', completed: Boolean(targetRole), points: 10, tip: 'Configure your career track.' },
              { id: '8', title: 'Technical Skill Badges (3+)', completed: skillsList.length >= 3, points: 10, tip: 'Add 3+ core tech skills.' },
              { id: '9', title: 'Active Resume Analyzed', completed: true, points: 10, tip: 'ATS score generated.' },
              { id: '10', title: 'Mock Interview Completed', completed: true, points: 10, tip: 'Interview evaluation on record.' }
            ]).map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                  item.completed
                    ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                    : 'bg-amber-500/5 border-amber-500/20 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-amber-400 flex-shrink-0" />
                  )}
                  <div>
                    <span className="font-semibold block text-white">{item.title}</span>
                    <span className="text-[10px] text-slate-400">{item.tip}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.completed ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                  +{item.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* MODAL 4: DELETE ACCOUNT CONFIRMATION */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Account Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
            <Trash2 className="w-6 h-6" />
          </div>

          <div className="text-center space-y-1">
            <h4 className="text-sm font-bold text-white">Permanently delete your account?</h4>
            <p className="text-xs text-slate-400">
              This action cannot be undone. All resume scores, interview evaluations, and personalized YouTube learning tracks will be permanently erased.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                try {
                  await profileApi.deleteAccount();
                  window.location.href = '/login';
                } catch {
                  showToast('Error', 'Failed to delete account.', 'error');
                }
              }}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-500/25 transition-colors"
            >
              Delete Permanently
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
