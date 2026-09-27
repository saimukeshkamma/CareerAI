import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import {
  Brain, Mail, Lock, User, GraduationCap,
  Briefcase, ArrowRight, Sparkles
} from 'lucide-react';
import { GoogleConnectButton } from '../components/auth/GoogleConnectButton';

interface SignupPageProps {
  onNavigate: (tab: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const { register, isLoading } = useAuth();
  const { showToast } = useNotifications();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('AI Engineer');
  const [experienceLevel, setExperienceLevel] = useState('Student / Intern');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('B.S. Computer Science');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register({
        name,
        email,
        password,
        target_role: targetRole,
        experience_level: experienceLevel,
        college,
        degree
      });
      showToast('Account Created!', `Welcome to CareerAI, ${name.split(' ')[0]}! Let's analyze your career profile.`, 'success');
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please check your information.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080c17] flex items-center justify-center p-4 relative overflow-hidden py-12">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-lg">
        {/* Brand */}
        <div className="text-center mb-6">
          <div
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-2.5 cursor-pointer group mb-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Brain className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">Career<span className="text-blue-400">AI</span></span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Create Your Account</h2>
          <p className="text-xs text-slate-400 mt-1">Join thousands of students and engineers elevating their tech career</p>
        </div>

        {/* Card */}
        <div className="glass-card border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
          
          {/* Direct Chrome Google SSO Connect */}
          <div className="mb-5">
            <GoogleConnectButton
              mode="signup"
              onSuccess={() => onNavigate('dashboard')}
            />
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-[#0b1021] px-2.5 text-slate-400 font-semibold tracking-wider">
                Or fill details manually
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-blue-500 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@stanford.edu"
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-blue-500 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  minLength={6}
                  className="w-full bg-slate-900/80 border border-slate-800 focus:border-blue-500 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Tech Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="AI Engineer">AI Engineer</option>
                  <option value="ML Engineer">ML Engineer</option>
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
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="Student / Intern">Student / Intern</option>
                  <option value="Entry-level">Entry-level (0-2 yrs)</option>
                  <option value="Mid-level">Mid-level (3-5 yrs)</option>
                  <option value="Senior">Senior (5+ yrs)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">University / College</label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. Stanford University"
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-blue-500 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Degree / Branch</label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. B.S. Computer Science"
                  className="w-full bg-slate-900/80 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Get Started with CareerAI'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="font-bold text-blue-400 hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
