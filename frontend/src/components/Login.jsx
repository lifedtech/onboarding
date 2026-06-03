import { useState } from 'react';
import { Mail, Lock, Loader2, AlertCircle, Activity } from 'lucide-react';
import useOpsStore from '../store/useOpsStore';
import logo from '../assets/favicon.svg';

export default function Login() {
  const login = useOpsStore((s) => s.login);
  const isLoading = useOpsStore((s) => s.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    const result = await login(email.trim(), password);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid texture */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#00ad9c 1px, transparent 1px), linear-gradient(90deg, #00ad9c 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Glow shapes */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-bg-mint blur-[120px] opacity-70 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-teal/5 blur-[120px] opacity-70 pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white border border-border-leaf rounded-2xl shadow-2xl shadow-brand-teal/5 p-8 relative z-10">

          {/* Logo / Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 border border-slate-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-sm bg-white">
              <img src={logo} alt="Lifed Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-text-main font-extrabold text-lg leading-tight tracking-wide">Lifed Healthmate</h1>
              <p className="text-text-muted text-xs font-semibold">Onboarding Manager</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-text-main text-2xl font-extrabold tracking-tight">Welcome back</h2>
            <p className="text-text-muted text-sm mt-1">Sign in to your ops account to continue.</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-text-main text-sm font-semibold mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/70 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ops@lifed.com"
                  disabled={isLoading}
                  className="w-full bg-slate-50 border border-border-leaf text-text-main placeholder-text-muted/50
                             rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium
                             focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-text-main text-sm font-semibold mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/70 pointer-events-none" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full bg-slate-50 border border-border-leaf text-text-main placeholder-text-muted/50
                             rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium
                             focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-all duration-200"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-teal hover:bg-brand-teal-hover disabled:bg-brand-teal/40 disabled:cursor-not-allowed
                         text-white font-bold rounded-xl py-2.5 text-sm
                         flex items-center justify-center gap-2 shadow-md shadow-brand-teal/10 hover:shadow-lg hover:shadow-brand-teal/15
                         transition-all duration-200 hover:-translate-y-0.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-text-muted/70 text-xs mt-5 font-semibold">
          Access is restricted to authorised operations staff.
        </p>
      </div>
    </div>
  );
}
