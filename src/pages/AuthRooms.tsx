import React, { useState } from 'react';
import { GlassPanel } from '../components/UI/GlassPanel';
import { Lock, Mail, User, X, Sparkles, LogIn } from 'lucide-react';

interface AuthRoomsProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { name: string; email: string }) => void;
}

export const AuthRooms: React.FC<AuthRoomsProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = {
      name: fullName || email.split('@')[0] || 'Aegis Researcher',
      email: email || 'researcher@aegisheart.io',
    };
    onSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[color:var(--bg-dark)]/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-md">
        <GlassPanel glow="cyan" className="p-8">
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] glass-panel border border-[color:var(--glass-border)]"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] text-xs font-mono-num mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>JWT NEURAL AUTHENTICATION</span>
            </div>
            <h3 className="font-heading text-2xl font-bold text-[color:var(--text-main)]">
              {isRegister ? 'CREATE AEGIS ACCOUNT' : 'SYSTEM LOGIN CORE'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 font-mono-num text-xs">
            {isRegister && (
              <div>
                <label className="text-[color:var(--text-muted)] block mb-1.5">FULL NAME</label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[color:var(--glass-border)] border border-[color:var(--glass-border)] text-[color:var(--text-main)]">
                  <User className="w-4 h-4 text-[var(--accent-cyan)]" />
                  <input
                    type="text"
                    required
                    placeholder="Dr. Saanvi Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-transparent outline-none text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[color:var(--text-muted)] block mb-1.5">RESEARCHER EMAIL</label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[color:var(--glass-border)] border border-[color:var(--glass-border)] text-[color:var(--text-main)]">
                <Mail className="w-4 h-4 text-[var(--accent-cyan)]" />
                <input
                  type="email"
                  required
                  placeholder="saanvi@aegisheart.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[color:var(--text-muted)] block mb-1.5">SECURITY ACCESS PASS</label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[color:var(--glass-border)] border border-[color:var(--glass-border)] text-[color:var(--text-main)]">
                <Lock className="w-4 h-4 text-[var(--accent-cyan)]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent outline-none text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl font-bold bg-gradient-to-r from-[var(--accent-cyan)] via-[var(--purple-glow)] to-[var(--danger-rose)] text-[color:var(--text-main)] hover:opacity-90 transition-all shadow-[0_0_25px_rgba(0,245,255,0.3)] cursor-pointer mt-2"
            >
              {isRegister ? 'REGISTER RESEARCHER PROFILE' : 'AUTHENTICATE & ENTER'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs font-mono-num text-[color:var(--text-muted)]">
            {isRegister ? 'Already registered?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-[var(--accent-cyan)] font-bold underline cursor-pointer"
            >
              {isRegister ? 'Login Core' : 'Register Profile'}
            </button>
          </div>

        </GlassPanel>
      </div>
    </div>
  );
};
