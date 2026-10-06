import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Building2,
  Laptop,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Monitor,
  Server,
  Smartphone,
  Info,
} from 'lucide-react';
import { Terminal, UserRole } from '../types.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, role: UserRole, terminalId: string) => Promise<void>;
  onRegister: (name: string, email: string, role: UserRole, companyName: string, terminalId: string) => Promise<void>;
  currentTerminal: Terminal | null;
  terminals: Terminal[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  currentTerminal,
  terminals = [],
}) => {
  const [tab, setTab] = useState<'signin' | 'register' | 'demo'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('audience');
  const [companyName, setCompanyName] = useState('');
  const [selectedTerminalId, setSelectedTerminalId] = useState(
    currentTerminal?.id || terminals?.[0]?.id || 'term-mac-sf-01'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  React.useEffect(() => {
    if (currentTerminal?.id) {
      setSelectedTerminalId(currentTerminal.id);
    } else if (terminals && terminals.length > 0 && terminals[0]?.id) {
      setSelectedTerminalId(terminals[0].id);
    }
  }, [currentTerminal?.id, terminals]);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please provide an email address');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    try {
      await onLogin(email, role, selectedTerminalId);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      setErrorMessage('Please fill in required fields');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    try {
      await onRegister(name, email, role, companyName, selectedTerminalId);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemo = async (demoEmail: string, demoRole: UserRole, termId: string) => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      await onLogin(demoEmail, demoRole, termId);
      onClose();
    } catch (err: any) {
      setErrorMessage('Failed to sign in demo user.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTerminalIcon = (type: string) => {
    switch (type) {
      case 'kiosk':
        return <Server className="w-3.5 h-3.5" />;
      case 'mobile_pos':
        return <Smartphone className="w-3.5 h-3.5" />;
      default:
        return <Laptop className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        id="auth-modal-container"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-slate-950/50 text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Identity & Physical Terminal Access</h3>
              <p className="text-[11px] text-slate-400">Multi-Machine Session Authentication</p>
            </div>
          </div>
          <button
            id="close-auth-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 p-1.5 gap-1 text-xs">
          <button
            id="auth-tab-signin"
            onClick={() => { setTab('signin'); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              tab === 'signin' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            id="auth-tab-register"
            onClick={() => { setTab('register'); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              tab === 'register' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
          <button
            id="auth-tab-demo"
            onClick={() => { setTab('demo'); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center space-x-1 ${
              tab === 'demo' ? 'bg-indigo-600 text-white shadow-sm' : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>1-Click Personas</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tab 1: Sign In */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    id="signin-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. priya@metropolis-live.in"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    id="signin-password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Physical Terminal Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                  <span>Physical Terminal Machine</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Hardware Tagged</span>
                </label>
                <select
                  id="signin-terminal-select"
                  value={selectedTerminalId}
                  onChange={(e) => setSelectedTerminalId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {(terminals || []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.ip}) - {t.os}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center space-x-1">
                  <Info className="w-3 h-3 text-cyan-400 inline mr-1" />
                  Logs you into this specific physical hardware machine session.
                </p>
              </div>

              <button
                id="signin-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
              >
                {isLoading ? 'Authenticating...' : 'Sign In from this Terminal'}
              </button>
            </form>
          )}

          {/* Tab 2: Register */}
          {tab === 'register' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    id="register-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    id="register-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aarav.sharma@boxoffice.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Role Picker */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('audience')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      role === 'audience'
                        ? 'border-emerald-500/80 bg-emerald-500/10 text-emerald-200'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">Audience / Buyer</div>
                    <div className="text-[10px] text-slate-400">Buy event passes & digital tickets</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('executor')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      role === 'executor'
                        ? 'border-amber-500/80 bg-amber-500/10 text-amber-200'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">Event-Executor</div>
                    <div className="text-[10px] text-slate-400">Sell tickets & set dynamic pricing</div>
                  </button>
                </div>
              </div>

              {role === 'executor' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Company / Organization</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Broadway Entertainment Corp"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Physical Terminal Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Assign Hardware Terminal</label>
                <select
                  value={selectedTerminalId}
                  onChange={(e) => setSelectedTerminalId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {(terminals || []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.ip})
                    </option>
                  ))}
                </select>
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
              >
                {isLoading ? 'Creating Account...' : 'Register & Bind Terminal'}
              </button>
            </form>
          )}

          {/* Tab 3: 1-Click Demo Profiles */}
          {tab === 'demo' && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-400 mb-3">
                Select a preset role to immediately experience the platform from that perspective:
              </p>

              {/* Persona 1: Event Executor */}
              <div
                id="demo-user-executor"
                onClick={() => handleSelectDemo('priya@metropolis-live.in', 'executor', 'term-mac-sf-01')}
                className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                    PS
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                      Priya Sharma
                    </div>
                    <div className="text-[11px] text-amber-400 font-medium">Event-Executor / Organizer</div>
                    <div className="text-[10px] text-slate-400">Terminal #1 (MacBook Pro SF)</div>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-1 rounded font-medium">
                  Launch Studio
                </span>
              </div>

              {/* Persona 2: Audience Buyer */}
              <div
                id="demo-user-audience"
                onClick={() => handleSelectDemo('aarav.patel@gmail.com', 'audience', 'term-kiosk-arena-08')}
                className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                    AP
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                      Aarav Patel
                    </div>
                    <div className="text-[11px] text-emerald-400 font-medium">Audience / Ticket Buyer</div>
                    <div className="text-[10px] text-slate-400">Kiosk #08 (Arena Concourse)</div>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded font-medium">
                  Buy Tickets
                </span>
              </div>

              {/* Persona 3: Platform Admin */}
              <div
                id="demo-user-admin"
                onClick={() => handleSelectDemo('vikram.admin@omniticket.cloud', 'admin', 'term-win-pos-03')}
                className="p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
                    VM
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      Vikram Malhotra
                    </div>
                    <div className="text-[11px] text-indigo-400 font-medium">Platform & System Analytics</div>
                    <div className="text-[10px] text-slate-400">Surface Pro Terminal #3 (VIP Desk)</div>
                  </div>
                </div>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded font-medium">
                  System Admin
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="px-6 py-3 bg-slate-950/70 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Machine Fingerprint: {currentTerminal?.physicalMachineFingerprint || 'hw-uuid-a98f'}</span>
          </span>
          <span className="font-mono text-cyan-400">{currentTerminal?.ip || '192.168.1.42'}</span>
        </div>
      </div>
    </div>
  );
};
