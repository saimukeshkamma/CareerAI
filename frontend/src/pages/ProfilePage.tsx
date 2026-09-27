import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { profileApi } from '../services/api';
import {
  User, Mail, Phone, MapPin, GraduationCap,
  Briefcase, Save, ShieldCheck
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUserLocal } = useAuth();
  const { showToast } = useNotifications();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [college, setCollege] = useState(user?.college || '');
  const [degree, setDegree] = useState(user?.degree || '');
  const [branch, setBranch] = useState(user?.branch || '');
  const [gradYear, setGradYear] = useState<number | undefined>(user?.graduation_year || 2026);
  const [targetRole, setTargetRole] = useState(user?.target_role || 'AI Engineer');
  const [experienceLevel, setExperienceLevel] = useState(user?.experience_level || 'Entry-level');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await profileApi.update({
        name,
        phone,
        location,
        college,
        degree,
        branch,
        graduation_year: gradYear,
        target_role: targetRole,
        experience_level: experienceLevel,
        bio
      });
      updateUserLocal(updated);
      showToast('Profile Updated', 'Your career preferences have been saved.', 'success');
    } catch (err) {
      showToast('Error', 'Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in text-left">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Candidate Profile</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your personal details, education background, and target career track
        </p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar and Basic info */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-500/20 overflow-hidden">
              {user?.profile_photo ? (
                <img src={user.profile_photo} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{name}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <span className="mt-1.5 inline-block text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                {targetRole} Track
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State / Country"
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              >
                <option value="AI Engineer">AI Engineer</option>
                <option value="ML Engineer">Machine Learning Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Software Engineer">Software Engineer</option>
                <option value="Fullstack Developer">Fullstack Developer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              >
                <option value="Student / Intern">Student / Intern</option>
                <option value="Entry-level">Entry-level (0-2 yrs)</option>
                <option value="Mid-level">Mid-level (3-5 yrs)</option>
                <option value="Senior">Senior (5+ yrs)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Graduation Year</label>
              <input
                type="number"
                value={gradYear || ''}
                onChange={(e) => setGradYear(parseInt(e.target.value) || undefined)}
                placeholder="2026"
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">College / University</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. Stanford University"
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bio / Elevator Pitch</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief summary of your passions and goals..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 hover:scale-105"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
