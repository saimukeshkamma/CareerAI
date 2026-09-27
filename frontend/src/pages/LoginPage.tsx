import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { authApi } from '../services/api';
import {
  Brain, Sparkles, Mail, Lock, ArrowRight,
  UserCheck, ShieldCheck
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { GoogleConnectButton } from '../components/auth/GoogleConnectButton';

interface LoginPageProps {
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, demoLogin, isLoading } = useAuth();
  const { showToast } = useNotifications();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Forgot Password Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      showToast('Welcome back!', 'Successfully signed into CareerAI.', 'success');
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    }
  };

  const handleDemo = async (userId: number, name: string) => {
    try {
      await demoLogin(userId);
      showToast(`Welcome, ${name}!`, 'Logged in via demo account with sample resume and interview data.', 'success');
      onNavigate('dashboard');
    } catch (err: any) {
      setError('Demo login failed. Please try again.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authApi.forgotPassword(forgotEmail);
      setForgotMessage(res.message);
      showToast('Check Email', res.message, 'info');
    } catch (err) {
      setForgotMessage('If this account exists, password instructions were dispatched.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080c17] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-2.5 cursor-pointer group mb-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Brain className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">Career<span className="text-blue-400">AI</span></span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to your AI Career Assistant dashboard</p>
        </div>

        {/* Card */}
        <div className="glass-card border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
          
          {/* Connect with Google Button */}
          <div className="mb-5">
            <GoogleConnectButton
              mode="signin"
              onSuccess={() => onNavigate('dashboard')}
            />
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-[#0b1021] px-2.5 text-slate-400 font-semibold tracking-wider">
                Or sign in with email
              </span>
            </div>
          </div>

          {/* Quick 1-Click Demo Profiles */}
          <div className="mb-6 pb-6 border-b border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Instant 1-Click Demo Accounts
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleDemo(1, "Alex Rivera")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-850 hover:border-blue-500/40 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 font-black text-xs flex items-center justify-center">
                    AR
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-blue-300">Alex Rivera</h5>
                    <p className="text-[10px] text-slate-400">Stanford AI Intern • Resume Score: 87</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-400 group-hover:translate-x-0.5 transition-transform">Login ➔</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemo(2, "Priya Sharma")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-850 hover:border-purple-500/40 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 font-black text-xs flex items-center justify-center">
                    PS
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white group-hover:text-purple-300">Priya Sharma</h5>
                    <p className="text-[10px] text-slate-400">Mid-Level ML Engineer • 4 yrs exp</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-purple-400 group-hover:translate-x-0.5 transition-transform">Login ➔</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@careerai.dev"
                  className="w-full bg-slate-900/80 border border-slate-800 focus:border-blue-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-[11px] text-blue-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/80 border border-slate-800 focus:border-blue-500 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <button
                onClick={() => onNavigate('signup')}
                className="font-bold text-blue-400 hover:underline"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => {
          setForgotModalOpen(false);
          setForgotMessage(null);
        }}
        title="Reset Your Password"
      >
        <form onSubmit={handleForgotPassword} className="space-y-4 text-left">
          <p className="text-xs text-slate-400">
            Enter your email address and we'll dispatch a secure recovery token to reset your credentials.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="you@university.edu"
              className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
            />
          </div>

          {forgotMessage && (
            <p className="text-xs text-emerald-400 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/30">
              {forgotMessage}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500"
            >
              Send Instructions
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
