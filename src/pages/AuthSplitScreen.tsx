import React, { useState } from 'react';
import { HolographicChamber } from '../components/3D/HolographicChamber';
import { Heart, Mail, Lock, User, Eye, EyeOff, ArrowRight, Shield, CheckCircle, AlertCircle, Stethoscope, RefreshCw } from 'lucide-react';
import { useAuth, UserRole } from '../context/AuthContext';
import { api } from '../hooks/useApi';

interface AuthSplitScreenProps {
  onSuccess: () => void;
}

type Step = 'choose' | 'login' | 'register' | 'forgot' | 'verify' | 'reset';

export const AuthSplitScreen: React.FC<AuthSplitScreenProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [step, setStep]           = useState<Step>('choose');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirmPass, setConfirm] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [fullName, setFullName]   = useState('');
  const [role, setRole]           = useState<UserRole>('user');
  const [showPass, setShowPass]   = useState(false);
  const [remember, setRemember]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const ROLES: { id: UserRole; label: string; icon: React.FC<any>; desc: string }[] = [
    { id: 'user',   label: 'Patient',  icon: Heart,        desc: 'Track personal heart health' },
    { id: 'doctor', label: 'Doctor',   icon: Stethoscope,  desc: 'Manage patient cohorts' },
    { id: 'admin',  label: 'Admin',    icon: Shield,       desc: 'Platform administration' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all required fields.'); return; }
    setLoading(true); setError('');

    const isRegister = step === 'register';
    const endpoint   = isRegister ? '/api/auth/register' : '/api/auth/login';
    const body       = isRegister
      ? { email, password, full_name: fullName || email.split('@')[0], role }
      : { email, password };

    const { data, error: apiError } = await api.post(endpoint, body);

    if (apiError || !data) {
      setError(apiError || 'Authentication failed. Check your credentials.');
      setLoading(false);
      return;
    }

    // Map API response to UserProfile
    const userData = data.user || {};
    login({
      id:          userData.id,
      name:        userData.profile?.full_name || userData.full_name || email.split('@')[0].replace(/[._]/g, ' '),
      email:       userData.email || email,
      role:        userData.role || role,
      level:       userData.profile?.level || userData.level || 'Beginner',
      xp:          userData.profile?.xp || userData.xp || 0,
      streak_days: userData.profile?.streak_days || userData.streak_days || 0,
      joinedDate:  userData.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      is_verified: userData.is_verified,
    }, data.access_token, data.refresh_token);

    setLoading(false);
    onSuccess();
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Enter your email address.'); return; }
    setLoading(true); setError('');

    const { data, error: apiError } = await api.post('/api/auth/forgot-password', { email });
    setLoading(false);

    if (apiError) { setError(apiError); return; }

    const token = data?.reset_token; // Demo mode: token returned in response
    setSuccess(
      token
        ? `Password reset token: ${token} (Demo mode — copy this to reset password)`
        : 'If this email exists, a reset link has been sent.'
    );
    if (token) { setResetToken(token); setStep('reset'); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password !== confirmPass) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true); setError('');

    const { error: apiError } = await api.post('/api/auth/reset-password', {
      token: resetToken,
      new_password: password,
    });
    setLoading(false);

    if (apiError) { setError(apiError); return; }
    setSuccess('Password reset successfully! You can now log in.');
    setTimeout(() => setStep('login'), 2000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — 3D Heart + Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-dark)] via-[var(--bg-surface)] to-[var(--bg-dark)]" />
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at 50% 50%, var(--accent-cyan), transparent 70%)' }} />

        <div className="relative z-10 flex flex-col items-center text-center px-12">
          <div className="w-full max-w-sm h-[340px] mb-8">
            <HolographicChamber riskState="healthy" riskScore={18.5} interactive={false} />
          </div>
          <h2 className="font-heading text-3xl font-extrabold text-[color:var(--text-main)] mb-3">
            Your Cardiovascular<br />Operating System
          </h2>
          <p className="text-[color:var(--text-muted)] text-sm leading-relaxed max-w-sm">
            AI-powered heart risk prediction, 3D digital twin, daily health tracking, and clinical explainability — all in one platform.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-[color:var(--glass-border)] w-full">
            {[['94.8%', 'ML Accuracy'], ['3,200+', 'Records Trained'], ['5 Themes', 'UI Modes']].map(([v, l]) => (
              <div key={l} className="text-center">
                <p className="font-heading font-bold text-xl text-[var(--accent-cyan)]">{v}</p>
                <p className="text-[10px] text-[color:var(--text-muted)] font-mono-num uppercase mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-[color:var(--bg-surface)]">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--danger-rose)] to-[var(--accent-cyan)] flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg text-[color:var(--text-main)]">AEGIS HEART</span>
              <p className="text-[10px] text-[color:var(--text-muted)] font-mono-num -mt-0.5">CARDIOVASCULAR OS v4.5</p>
            </div>
          </div>

          {/* Error / Success Banners */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-[var(--danger-rose)]/12 border border-[var(--danger-rose)]/30 flex items-center gap-2 text-[var(--danger-rose)] text-sm animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-[var(--green-healthy)]/12 border border-[var(--green-healthy)]/30 flex items-center gap-2 text-[var(--green-healthy)] text-sm animate-fadeIn">
              <CheckCircle className="w-4 h-4 flex-shrink-0" /> {success}
            </div>
          )}

          {/* ── CHOOSE STEP ── */}
          {step === 'choose' && (
            <div className="animate-fadeIn">
              <h1 className="font-heading text-3xl font-extrabold text-[color:var(--text-main)] mb-2">Welcome</h1>
              <p className="text-[color:var(--text-muted)] text-sm mb-8">Sign in to your account or create a new one.</p>
              <div className="space-y-3">
                <button onClick={() => setStep('login')}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--purple-glow)] text-white font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg">
                  Sign In <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => setStep('register')}
                  className="w-full py-3.5 rounded-xl glass-panel border border-[var(--accent-cyan)]/30 text-[var(--accent-cyan)] font-semibold text-sm hover:bg-[var(--accent-cyan)]/10 transition-all cursor-pointer">
                  Create Account
                </button>
              </div>
              <p className="text-[10px] text-[color:var(--text-muted)] font-mono-num text-center mt-6">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          )}

          {/* ── LOGIN STEP ── */}
          {step === 'login' && (
            <form onSubmit={handleSubmit} className="animate-fadeIn">
              <h1 className="font-heading text-3xl font-extrabold text-[color:var(--text-main)] mb-2">Sign In</h1>
              <p className="text-[color:var(--text-muted)] text-sm mb-6">Enter your credentials to access your dashboard.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[color:var(--text-muted)] font-mono-num uppercase mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--text-muted)]" />
                    <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com"
                      className="w-full bg-[color:var(--bg-elevated)] border border-[color:var(--glass-border)] rounded-xl pl-10 pr-4 py-3 text-sm text-[color:var(--text-main)] focus:border-[var(--accent-cyan)] outline-none transition-colors placeholder:text-[color:var(--text-muted)]" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[color:var(--text-muted)] font-mono-num uppercase mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--text-muted)]" />
                    <input value={password} onChange={e => setPassword(e.target.value)} type={showPass ? 'text' : 'password'} placeholder="••••••••"
                      className="w-full bg-[color:var(--bg-elevated)] border border-[color:var(--glass-border)] rounded-xl pl-10 pr-10 py-3 text-sm text-[color:var(--text-main)] focus:border-[var(--accent-cyan)] outline-none transition-colors placeholder:text-[color:var(--text-muted)]" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] cursor-pointer">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[color:var(--text-muted)]">
                    <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="rounded accent-[var(--accent-cyan)]" />
                    Remember me
                  </label>
                  <button type="button" onClick={() => { setStep('forgot'); setError(''); }}
                    className="text-xs text-[var(--accent-cyan)] hover:underline cursor-pointer">Forgot password?</button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--purple-glow)] text-white font-semibold text-sm hover:opacity-90 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing In...</> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
              </button>
              <p className="text-xs text-[color:var(--text-muted)] text-center mt-4">
                No account? <button type="button" onClick={() => { setStep('register'); setError(''); }} className="text-[var(--accent-cyan)] hover:underline cursor-pointer">Create one</button>
              </p>
              <button type="button" onClick={() => setStep('choose')} className="w-full mt-2 text-xs text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] transition-colors cursor-pointer">← Back</button>
            </form>
          )}

          {/* ── REGISTER STEP ── */}
          {step === 'register' && (
            <form onSubmit={handleSubmit} className="animate-fadeIn">
              <h1 className="font-heading text-3xl font-extrabold text-[color:var(--text-main)] mb-2">Create Account</h1>
              <p className="text-[color:var(--text-muted)] text-sm mb-6">Start your cardiovascular health journey.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[color:var(--text-muted)] font-mono-num uppercase mb-1.5 block">Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ROLES.map(r => {
                      const Icon = r.icon;
                      return (
                        <button key={r.id} type="button" onClick={() => setRole(r.id)}
                          className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs transition-all cursor-pointer ${
                            role === r.id ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/12 text-[var(--accent-cyan)]' : 'border-[color:var(--glass-border)] text-[color:var(--text-muted)] hover:border-[var(--accent-cyan)]/40'
                          }`}>
                          <Icon className="w-4 h-4" />
                          <span className="font-mono-num">{r.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[color:var(--text-muted)] font-mono-num uppercase mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--text-muted)]" />
                    <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Dr. Saanvi Sharma"
                      className="w-full bg-[color:var(--bg-elevated)] border border-[color:var(--glass-border)] rounded-xl pl-10 pr-4 py-3 text-sm text-[color:var(--text-main)] focus:border-[var(--accent-cyan)] outline-none transition-colors placeholder:text-[color:var(--text-muted)]" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[color:var(--text-muted)] font-mono-num uppercase mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--text-muted)]" />
                    <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com"
                      className="w-full bg-[color:var(--bg-elevated)] border border-[color:var(--glass-border)] rounded-xl pl-10 pr-4 py-3 text-sm text-[color:var(--text-main)] focus:border-[var(--accent-cyan)] outline-none transition-colors placeholder:text-[color:var(--text-muted)]" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[color:var(--text-muted)] font-mono-num uppercase mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--text-muted)]" />
                    <input value={password} onChange={e => setPassword(e.target.value)} type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters"
                      className="w-full bg-[color:var(--bg-elevated)] border border-[color:var(--glass-border)] rounded-xl pl-10 pr-10 py-3 text-sm text-[color:var(--text-main)] focus:border-[var(--accent-cyan)] outline-none transition-colors placeholder:text-[color:var(--text-muted)]" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] cursor-pointer">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--purple-glow)] text-white font-semibold text-sm hover:opacity-90 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating Account...</> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
              </button>
              <p className="text-xs text-[color:var(--text-muted)] text-center mt-4">
                Already have an account? <button type="button" onClick={() => { setStep('login'); setError(''); }} className="text-[var(--accent-cyan)] hover:underline cursor-pointer">Sign in</button>
              </p>
              <button type="button" onClick={() => setStep('choose')} className="w-full mt-2 text-xs text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] transition-colors cursor-pointer">← Back</button>
            </form>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {step === 'forgot' && (
            <form onSubmit={handleForgot} className="animate-fadeIn">
              <h1 className="font-heading text-3xl font-extrabold text-[color:var(--text-main)] mb-2">Reset Password</h1>
              <p className="text-[color:var(--text-muted)] text-sm mb-6">Enter your email and we'll send a reset link.</p>
              <div>
                <label className="text-xs text-[color:var(--text-muted)] font-mono-num uppercase mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--text-muted)]" />
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com"
                    className="w-full bg-[color:var(--bg-elevated)] border border-[color:var(--glass-border)] rounded-xl pl-10 pr-4 py-3 text-sm text-[color:var(--text-main)] focus:border-[var(--accent-cyan)] outline-none transition-colors placeholder:text-[color:var(--text-muted)]" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--purple-glow)] text-white font-semibold text-sm hover:opacity-90 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</> : 'Send Reset Link'}
              </button>
              <button type="button" onClick={() => { setStep('login'); setError(''); setSuccess(''); }} className="w-full mt-3 text-xs text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] transition-colors cursor-pointer">← Back to Sign In</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
