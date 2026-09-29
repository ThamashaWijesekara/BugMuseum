'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser } from '@/services/api';

function subscribe() {
  return () => { };
}

function getSnapshot() {
  return localStorage.getItem('username');
}

function getServerSnapshot() {
  return null;
}

export default function LandingPage() {
  const router = useRouter();
  const username = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    router.refresh();
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authMode === 'login') {
        const data = await loginUser({
          email: authForm.email,
          password: authForm.password,
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
      } else {
        const data = await registerUser({
          username: authForm.username,
          email: authForm.email,
          password: authForm.password,
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
      }
      router.push('/gallery');
      router.refresh();
    } catch (err: unknown) {
      console.error('Auth error:', err);
      setAuthError(
        authMode === 'login'
          ? 'Invalid email or password.'
          : 'Registration failed. Username or email may already be taken.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      {/* Background Animated Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />

      {/* Floating Animated Bug Badges */}
      <div className="absolute top-28 left-[8%] hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-full shadow-2xl backdrop-blur-md animate-bounce">
        <span className="text-xl">🐛</span>
        <span className="text-[11px] font-mono text-rose-400">NullReferenceException</span>
      </div>

      <div className="absolute top-48 right-[10%] hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-full shadow-2xl backdrop-blur-md animate-bounce [animation-delay:1s]">
        <span className="text-xl">🐝</span>
        <span className="text-[11px] font-mono text-amber-400">404 Route NotFound</span>
      </div>

      <div className="absolute bottom-32 left-[12%] hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-full shadow-2xl backdrop-blur-md animate-bounce [animation-delay:2s]">
        <span className="text-xl">🪲</span>
        <span className="text-[11px] font-mono text-purple-400">Deadlock Encountered</span>
      </div>

      {/* Navigation Header */}
      <nav className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-2xl transition-transform group-hover:rotate-12 duration-300">
              🐛
            </span>
            <span className="text-xl font-black text-amber-400 tracking-wider">
              BUG MUSEUM
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/gallery"
              className="text-xs font-semibold text-slate-300 hover:text-amber-400 transition-colors"
            >
              Exhibits Gallery
            </Link>

            {username ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="text-xs text-slate-300 hover:text-amber-400 transition-colors"
                >
                  Curator: <strong className="text-amber-400">{username}</strong>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition-colors border border-slate-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthMode('login')}
                className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-all"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Hero Container */}
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Hero Branding */}
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            ENTERPRISE BUG ARCHIVE & AI POST-MORTEMS
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-100 tracking-tight leading-tight">
            Document Failures. <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
              Master System Resiliency.
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
            A collaborative post-mortem museum for software teams to publish production bugs, inspect step-by-step resolution timelines, and generate Gemini AI summaries.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-md mx-auto lg:mx-0">
            <div>
              <div className="text-xl font-black text-amber-400">Post-Mortem</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Timelines</div>
            </div>
            <div>
              <div className="text-xl font-black text-purple-400">Gemini 1.5</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">AI Summaries</div>
            </div>
            <div>
              <div className="text-xl font-black text-rose-400">JWT Auth</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Guarded API</div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Interactive Auth / Authenticated Dashboard */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          {username ? (
            /* Logged-In User Dashboard Quick Card */
            <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl space-y-6 text-center">
              <div className="w-16 h-16 bg-amber-400/10 border border-amber-400/30 text-amber-400 rounded-full flex items-center justify-center text-3xl mx-auto">
                👋
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-100">Welcome Back!</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Logged in as <strong className="text-amber-400">{username}</strong>
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href="/gallery"
                  className="w-full block py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm transition-all"
                >
                  Browse Museum Gallery
                </Link>
                <Link
                  href="/bugs/create"
                  className="w-full block py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm border border-slate-700 transition-all"
                >
                  + Submit New Bug Exhibit
                </Link>
                <Link
                  href="/profile"
                  className="w-full block py-3 bg-transparent text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors"
                >
                  View Curator Profile Dashboard
                </Link>
              </div>
            </div>
          ) : (
            /* Unauthenticated Embedded Login / Register Card */
            <div className="bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl space-y-6">
              {/* Tab Selector */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMode === 'login'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMode === 'register'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                  Join Us
                </button>
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-100">
                  {authMode === 'login' ? 'Access Museum Portal' : 'Create Curator Account'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {authMode === 'login'
                    ? 'Sign in to upvote, comment, and submit bug exhibits.'
                    : 'Register to start curating software bug exhibits.'}
                </p>
              </div>

              {authError && (
                <div className="bg-rose-950/50 border border-rose-500/50 text-rose-300 p-3 rounded-xl text-xs">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {/* Username Input - ONLY shown when registering */}
                {authMode === 'register' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="username"
                      value={authForm.username}
                      onChange={(e) =>
                        setAuthForm({ ...authForm, username: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                )}

                {/* Email Address Input - ALWAYS shown for both login and register */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="curator@company.com"
                    value={authForm.email}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, email: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                {/* Password Input - ALWAYS shown */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authForm.password}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, password: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-all disabled:opacity-50 shadow-lg shadow-amber-400/10"
                >
                  {authLoading
                    ? 'Processing...'
                    : authMode === 'login'
                      ? 'Sign In to Portal'
                      : 'Create Account'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-600">
        <p>Bug Museum Platform — Enterprise Application Architecture</p>
      </footer>
    </main>
  );
}