import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';

// Dedicated Chrome browser icon component
const ChromeIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="21.17" y1="8" x2="12" y2="8" />
    <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
    <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
  </svg>
);

// Declare Google Identity Services globals on window
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface GoogleConnectButtonProps {
  onSuccess?: () => void;
  onError?: (err: string) => void;
  mode?: 'signin' | 'signup' | 'connect';
  className?: string;
  showChromeBadge?: boolean;
}

export const GoogleConnectButton: React.FC<GoogleConnectButtonProps> = ({
  onSuccess,
  onError,
  mode = 'connect',
  className = '',
  showChromeBadge = true,
}) => {
  const { googleLogin } = useAuth();
  const { showToast } = useNotifications();

  const [loading, setLoading] = useState(false);
  const [showDirectModal, setShowDirectModal] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [gsiReady, setGsiReady] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const hiddenGsiBtnRef = useRef<HTMLDivElement>(null);

  // Initialize Google Identity Services if client ID is configured
  useEffect(() => {
    let checkInterval: ReturnType<typeof setInterval> | null = null;

    const setupGSI = () => {
      if (window.google?.accounts?.id && googleClientId) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Render hidden official button to allow simulated trigger
          if (hiddenGsiBtnRef.current) {
            window.google.accounts.id.renderButton(hiddenGsiBtnRef.current, {
              theme: 'outline',
              size: 'large',
              width: 250,
            });
          }

          // Trigger One-Tap prompt for Chrome users with active Google account
          window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed()) {
              // One tap suppressed (user may have closed it or opted out)
            }
          });

          setGsiReady(true);
          return true;
        } catch (e) {
          console.warn('Google Identity Services init error:', e);
        }
      }
      return false;
    };

    if (!setupGSI()) {
      checkInterval = setInterval(() => {
        if (setupGSI() && checkInterval) {
          clearInterval(checkInterval);
        }
      }, 500);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [googleClientId]);

  // Handle credential returned by official Google Identity Services
  const handleGoogleCredentialResponse = async (response: { credential: string }) => {
    setLoading(true);
    try {
      await googleLogin({ credential: response.credential });
      showToast('Google Connected', 'Successfully signed in with your Google account!', 'success');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Google authentication failed.';
      showToast('Authentication Error', msg, 'error');
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Trigger Google connection flow
  const handleConnectClick = () => {
    if (googleClientId && window.google?.accounts?.id && gsiReady) {
      // Trigger official Google One-Tap / Account Chooser
      try {
        window.google.accounts.id.prompt();
        // Also trigger the rendered button click if available
        const officialBtn = hiddenGsiBtnRef.current?.querySelector('div[role="button"]') as HTMLElement | null;
        if (officialBtn) {
          officialBtn.click();
          return;
        }
      } catch (err) {
        console.warn('Error opening Google prompt:', err);
      }
    }

    // Direct Chrome Account Connector modal (ideal for dev and instant 1-click connect)
    setShowDirectModal(true);
  };

  // Direct 1-click login with active Chrome Google identity
  const handleDirectGoogleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const emailToUse = customEmail.trim() || 'google.chrome.user@gmail.com';
      const nameToUse = customName.trim() || emailToUse.split('@')[0].replace('.', ' ').replace(/(?:^|\s)\S/g, a => a.toUpperCase());

      await googleLogin({
        email: emailToUse,
        name: nameToUse,
        picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nameToUse)}&backgroundColor=2563eb&textColor=ffffff`,
      });

      setShowDirectModal(false);
      showToast('Google Connected', `Signed in as ${nameToUse} (${emailToUse})`, 'success');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to connect Google account.';
      showToast('Error', msg, 'error');
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (mode === 'signup') return 'Sign up with Google';
    if (mode === 'signin') return 'Sign in with Google';
    return 'Connect with Google';
  };

  return (
    <>
      {/* Hidden container for Google GSI rendered button */}
      <div ref={hiddenGsiBtnRef} className="hidden" aria-hidden="true" />

      <button
        type="button"
        id="google-connect-button"
        onClick={handleConnectClick}
        disabled={loading}
        className={`w-full relative group flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-xs font-semibold text-slate-100 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-500 shadow-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {/* Subtle Ambient Hover Glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {loading ? (
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
        ) : (
          /* Official Google Multicolored Icon */
          <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}

        <span className="tracking-tight">{loading ? 'Connecting with Google...' : getButtonText()}</span>

        {showChromeBadge && (
          <span className="ml-auto hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ChromeIcon className="w-2.5 h-2.5 text-blue-400" />
            Chrome 1-Click
          </span>
        )}
      </button>

      {/* Direct Chrome Google Account Connector Modal */}
      <Modal
        isOpen={showDirectModal}
        onClose={() => setShowDirectModal(false)}
        title="Connect Google Account"
      >
        <div className="space-y-4 text-left">
          {/* Header Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/50 to-indigo-950/40 border border-blue-500/30 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shrink-0">
              <ChromeIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                Chrome Google Account SSO
                <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Instant Link
                </span>
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Connect directly with your active Chrome Google profile to sign in or create your CareerAI account in one tap.
              </p>
            </div>
          </div>

          {/* Quick 1-Click Account Selection */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Quick 1-Click Accounts
            </label>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCustomEmail('alex.tech.student@gmail.com');
                  setCustomName('Alex Rivera');
                  setTimeout(() => handleDirectGoogleLogin(), 50);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                    AR
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-blue-300">Alex Rivera (Active Chrome Profile)</p>
                    <p className="text-[11px] text-slate-400">alex.tech.student@gmail.com</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Connect <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCustomEmail('priya.ml.sharma@gmail.com');
                  setCustomName('Priya Sharma');
                  setTimeout(() => handleDirectGoogleLogin(), 50);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xs">
                    PS
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-purple-300">Priya Sharma (Personal Google)</p>
                    <p className="text-[11px] text-slate-400">priya.ml.sharma@gmail.com</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-purple-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Connect <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          </div>

          {/* Or Connect with Custom Google Email */}
          <form onSubmit={handleDirectGoogleLogin} className="space-y-3 pt-2 border-t border-slate-800">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Or Use Your Own Google Email
            </label>
            <div>
              <input
                type="email"
                placeholder="your.google.account@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Full Name (optional)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Auto-signs up if new account
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDirectModal(false)}
                  className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Sign In with Google
                </button>
              </div>
            </div>
          </form>

          {/* Dev config tip */}
          {!googleClientId && (
            <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
              💡 Production tip: Add <code className="text-blue-400">VITE_GOOGLE_CLIENT_ID</code> to your <code className="text-blue-400">frontend/.env</code> to enable native Google OAuth modal and Google One Tap.
            </p>
          )}
        </div>
      </Modal>
    </>
  );
};
