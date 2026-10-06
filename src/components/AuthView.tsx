import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Ticket,
  Sliders,
  BarChart3,
  LogOut,
  KeyRound,
  AlertCircle,
  UserCheck,
} from 'lucide-react';
import { Terminal, User, UserRole } from '../types.js';

interface AuthViewProps {
  currentUser: User | null;
  currentTerminal: Terminal | null;
  onLogin: (email: string, role: UserRole, terminalId: string) => Promise<void>;
  onRegister: (
    name: string,
    email: string,
    role: UserRole,
    companyName: string,
    terminalId: string
  ) => Promise<void>;
  onLogout: () => void;
  onNavigate: (view: 'catalog' | 'executor' | 'analytics' | 'my_tickets') => void;
  initialMode?: 'signin' | 'register';
}

export const AuthView: React.FC<AuthViewProps> = ({
  currentUser,
  currentTerminal,
  onLogin,
  onRegister,
  onLogout,
  onNavigate,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);

  // Sign In state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<UserRole>('audience');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<UserRole>('audience');
  const [regCompany, setRegCompany] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const terminalId = currentTerminal?.id || 'term-mac-sf-01';

  // Handle Login submission
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginEmail.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onLogin(loginEmail.trim(), loginRole, terminalId);
      setSuccessMessage('Successfully signed in! Welcome back.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Registration submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!regPassword) {
      setErrorMessage('Please create a password for your account.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password.');
      return;
    }
    if (regRole === 'executor' && !regCompany.trim()) {
      setErrorMessage('Please provide an organization or event company name.');
      return;
    }
    if (!agreedToTerms) {
      setErrorMessage('Please agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onRegister(regName.trim(), regEmail.trim(), regRole, regCompany.trim(), terminalId);
      setSuccessMessage('Account registered successfully! You are now authenticated.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Email might already be registered.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>{currentUser ? 'User Authentication & Profile' : 'Access Restricted • Login Required'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {currentUser ? 'Your OmniTicket Account' : 'Sign In to Access OmniTicket'}
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          {currentUser
            ? 'Manage your active ticketing credentials, role permissions, and session details.'
            : 'Access to the ticketing platform requires authentication. Please sign in or register to continue.'}
        </p>

        {/* Role permission info banner when not logged in */}
        {!currentUser && (
          <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-left">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-xs space-y-1">
              <div className="font-bold text-indigo-300 flex items-center space-x-1">
                <Ticket className="w-3.5 h-3.5 text-indigo-400" />
                <span>Audience</span>
              </div>
              <p className="text-[11px] text-slate-400">See live events, select seats, and purchase tickets.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 text-xs space-y-1">
              <div className="font-bold text-amber-300 flex items-center space-x-1">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Organiser</span>
              </div>
              <p className="text-[11px] text-slate-400">Setup live events and configure dynamic surge pricing.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-rose-500/30 text-xs space-y-1">
              <div className="font-bold text-rose-300 flex items-center space-x-1">
                <BarChart3 className="w-3.5 h-3.5 text-rose-400" />
                <span>Platform Admin</span>
              </div>
              <p className="text-[11px] text-slate-400">See events going on, audience counts, and dynamic pricing.</p>
            </div>
          </div>
        )}
      </div>

      {/* If User is Already Logged In: Full Profile & Session Card */}
      {currentUser ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Active User Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center space-x-4">
              <img
                src={
                  currentUser.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt={currentUser.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-md"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-white">{currentUser.name}</h2>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                      currentUser.role === 'executor'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : currentUser.role === 'admin'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{currentUser.email}</div>
                {currentUser.companyName && (
                  <div className="text-xs text-indigo-300 flex items-center space-x-1 mt-1 font-medium">
                    <Building2 className="w-3 h-3" />
                    <span>{currentUser.companyName}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={onLogout}
                className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700/80 text-rose-300 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Account Details & Permissions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Account ID</div>
              <div className="text-xs font-mono text-slate-200 truncate">{currentUser.id}</div>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Security Status</div>
              <div className="text-xs text-emerald-400 flex items-center space-x-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Session Active & Verified</span>
              </div>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Platform Access</div>
              <div className="text-xs text-indigo-300 capitalize font-medium">
                {currentUser.role === 'executor'
                  ? 'Full Organizer & Surge Studio'
                  : currentUser.role === 'admin'
                  ? 'Platform Administration'
                  : 'Audience Booking & Digital Wallet'}
              </div>
            </div>
          </div>

          {/* Quick Actions for Active User based on Role */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Role Shortcuts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentUser.role === 'audience' && (
                <>
                  <button
                    onClick={() => onNavigate('catalog')}
                    className="p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/80 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between text-indigo-400 group-hover:text-indigo-300">
                      <Ticket className="w-4 h-4" />
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="text-xs font-semibold text-white mt-2">Browse Events & Buy Tickets</div>
                    <div className="text-[11px] text-slate-400">View upcoming concerts, theater and sports</div>
                  </button>

                  <button
                    onClick={() => onNavigate('my_tickets')}
                    className="p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/80 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between text-emerald-400 group-hover:text-emerald-300">
                      <UserCheck className="w-4 h-4" />
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="text-xs font-semibold text-white mt-2">My Ticket Passes</div>
                    <div className="text-[11px] text-slate-400">View QR codes and confirmed orders</div>
                  </button>
                </>
              )}

              {currentUser.role === 'executor' && (
                <button
                  onClick={() => onNavigate('executor')}
                  className="sm:col-span-2 p-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-left transition-all group"
                >
                  <div className="flex items-center justify-between text-amber-400 group-hover:text-amber-300">
                    <Sliders className="w-5 h-5" />
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="text-sm font-bold text-white mt-2">Open Organiser Studio</div>
                  <div className="text-xs text-amber-200/80">Setup new events, publish schedules, and configure real-time dynamic surge pricing</div>
                </button>
              )}

              {currentUser.role === 'admin' && (
                <button
                  onClick={() => onNavigate('analytics')}
                  className="sm:col-span-2 p-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/40 text-left transition-all group"
                >
                  <div className="flex items-center justify-between text-rose-400 group-hover:text-rose-300">
                    <BarChart3 className="w-5 h-5" />
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="text-sm font-bold text-white mt-2">Open Admin Event & Audience Monitor</div>
                  <div className="text-xs text-rose-200/80">Track count of audiences per event, live dynamic pricing multipliers, and events going on</div>
                </button>
              )}
            </div>
          </div>

          {/* Switch Account Quick Section */}
          <div className="pt-4 border-t border-slate-800 text-center">
            <button
              onClick={() => {
                onLogout();
                setMode('signin');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center space-x-1"
            >
              <span>Sign in with a different account</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        /* If User is NOT Logged In: Tabs for Sign In & Register */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Tab Selection */}
          <div className="flex border-b border-slate-800 bg-slate-950/70 p-1.5">
            <button
              id="auth-tab-signin"
              onClick={() => {
                setMode('signin');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center space-x-2 ${
                mode === 'signin'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Sign In (Login)</span>
            </button>

            <button
              id="auth-tab-register"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center space-x-2 ${
                mode === 'register'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Create Account (Register)</span>
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Feedback Alerts */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-xs text-rose-300 flex items-start space-x-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-xs text-emerald-300 flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* TAB 1: SIGN IN FORM */}
            {mode === 'signin' && (
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                {/* Email input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Email Address</span>
                    <span className="text-[10px] text-slate-500 font-normal">Required</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="login-email-input"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Password input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Password</span>
                    <span className="text-[10px] text-indigo-400 hover:underline cursor-pointer">
                      Forgot password?
                    </span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="login-password-input"
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Role selection if new user */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Signing in as Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setLoginRole('audience')}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        loginRole === 'audience'
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      Audience
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginRole('executor')}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        loginRole === 'executor'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      Organizer
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginRole('admin')}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        loginRole === 'admin'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                </div>

                {/* Remember me & Options */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>Remember this machine</span>
                  </label>
                </div>

                {/* Submit button */}
                <button
                  id="login-submit-button"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <span>Signing in...</span>
                  ) : (
                    <>
                      <span>Sign In to OmniTicket</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Switch to Register link */}
                <div className="text-center text-xs text-slate-400 pt-2">
                  <span>Don't have an account yet? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMessage('');
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Create a free account
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: REGISTER FORM */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Full Name & Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Full Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        id="reg-name-input"
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Aarav Sharma"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        id="reg-email-input"
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="aarav.sharma@example.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Role selection cards */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Select Account Role & Permissions
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div
                      id="reg-role-audience"
                      onClick={() => setRegRole('audience')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        regRole === 'audience'
                          ? 'bg-indigo-600/15 border-indigo-500 text-white ring-1 ring-indigo-500'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-white">Audience</div>
                        {regRole === 'audience' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Book tickets, select seats on the venue canvas, digital passes.
                      </div>
                    </div>

                    <div
                      id="reg-role-executor"
                      onClick={() => setRegRole('executor')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        regRole === 'executor'
                          ? 'bg-amber-500/15 border-amber-500 text-white ring-1 ring-amber-500'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-amber-300">Event Organizer</div>
                        {regRole === 'executor' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Create events, configure dynamic surge pricing algorithms.
                      </div>
                    </div>

                    <div
                      id="reg-role-admin"
                      onClick={() => setRegRole('admin')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        regRole === 'admin'
                          ? 'bg-rose-500/15 border-rose-500 text-white ring-1 ring-rose-500'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-rose-300">Platform Admin</div>
                        {regRole === 'admin' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        System metrics, financial yield reports, user directory.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organization name (shown if Organizer or Admin) */}
                {regRole === 'executor' && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Production Company or Organizer Name</span>
                      <span className="text-[10px] text-amber-400 font-mono">Required for Organizers</span>
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        id="reg-company-input"
                        type="text"
                        value={regCompany}
                        onChange={(e) => setRegCompany(e.target.value)}
                        placeholder="e.g. Paramount Live or Broadway Global"
                        required={regRole === 'executor'}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                )}

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        id="reg-password-input"
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        required
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        id="reg-confirm-password-input"
                        type={showRegPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms and Privacy Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start space-x-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      id="reg-terms-checkbox"
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>
                      I agree to OmniTicket's{' '}
                      <span className="text-indigo-400 hover:underline">Terms of Service</span> and{' '}
                      <span className="text-indigo-400 hover:underline">Privacy Policy</span>.
                    </span>
                  </label>
                </div>

                {/* Register Submit Button */}
                <button
                  id="reg-submit-button"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <span>Registering Account...</span>
                  ) : (
                    <>
                      <span>Create Free Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Switch to Login link */}
                <div className="text-center text-xs text-slate-400 pt-2">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMessage('');
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Sign in here
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
