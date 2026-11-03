import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { ESTATE_MEDIA } from '../assets/media';
import { ArchitecturalImage } from '../components/ArchitecturalImage';
import { useEstate } from '../context/EstateContext';
import { UserRole } from '../types/estate';

export const AuthPage: React.FC = () => {
  const {
    signInWithCredentials,
    registerAccount,
    signInAsDemoRole,
    currentUser,
    backendConnected,
    navigateTo,
  } = useEstate();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login State (pre-populated with demo VIP credentials for convenience)
  const [loginEmail, setLoginEmail] = useState(
    'a.kensington@privatefamilyoffice.uk'
  );
  const [loginPassword, setLoginPassword] = useState('client2026');

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regLocation, setRegLocation] = useState('London, United Kingdom');
  const [regRole, setRegRole] = useState<UserRole>(UserRole.CLIENT);
  const [regPassword, setRegPassword] = useState('');

  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginEmail.trim()) {
      setError('Please enter your registered email address.');
      return;
    }
    if (loginPassword.length < 4) {
      setError('Please enter your password.');
      return;
    }
    setLoading(true);
    const res = await signInWithCredentials(loginEmail.trim(), loginPassword);
    setLoading(false);
    if (!res.ok && res.error) {
      setError(res.error);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (regName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (regPhone.trim().length < 7) {
      setError('Please provide a valid telephone number.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Please choose a password of at least 6 characters.');
      return;
    }

    setLoading(true);
    const res = await registerAccount({
      fullName: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      location: regLocation.trim(),
      role: regRole,
      password: regPassword,
    });
    setLoading(false);

    if (!res.ok && res.error) {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-110px)] bg-[#060608] text-white grid grid-cols-1 lg:grid-cols-12">
      {/* Left Showcase */}
      <div className="hidden lg:flex lg:col-span-6 relative bg-[#0B0C10] p-14 flex-col justify-between overflow-hidden border-r border-white/10">
        <div className="absolute inset-0">
          <ArchitecturalImage
            src={ESTATE_MEDIA.penthouseSkylineDubai}
            alt="Ciel Royal Sky Penthouse interior"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/75 to-[#060608]/40" />
        </div>

        <div className="relative z-10 space-y-4">
          <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#C9A962]">
            VIP Client &amp; Executive Access
          </p>
          <h1 className="font-display text-4xl xl:text-5xl font-semibold text-white leading-tight max-w-lg">
            Curate Shortlists, Private Viewings &amp; Sovereign Mandates
          </h1>
        </div>

        <div className="relative z-10 space-y-4 max-w-md border-t border-white/15 pt-6">
          <p className="text-sm text-zinc-300 leading-relaxed">
            Access your saved residences, confirmed private viewing slots, property comparisons, and executive CRM controls.
          </p>
          <p className="text-xs text-[#C9A962]">
            WEBXDIGITAL ESTATE · Designed &amp; Developed by WebxDigital
          </p>
        </div>
      </div>

      {/* Right Form */}
      <div className="lg:col-span-6 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          {currentUser && (
            <div className="bg-[#0D0E12] border border-[#C9A962]/45 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="text-xs text-zinc-300">
                Signed in as{' '}
                <strong className="text-white">{currentUser.fullName}</strong> (
                {currentUser.role})
              </div>
              <button
                type="button"
                onClick={() =>
                  navigateTo(
                    currentUser.role === UserRole.ADMIN
                      ? 'admin-dashboard'
                      : 'user-dashboard'
                  )
                }
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#DFC07A] whitespace-nowrap cursor-pointer"
              >
                <span>Open Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="bg-[#0D0E12] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#060608] border border-white/10 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setError(null);
                }}
                className={`py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                  tab === 'login'
                    ? 'bg-[#C9A962] text-[#060608]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setError(null);
                }}
                className={`py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                  tab === 'register'
                    ? 'bg-[#C9A962] text-[#060608]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Register VIP
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="p-3 text-xs text-red-200 bg-red-950/60 border border-red-500/40 rounded-lg"
              >
                {error}
              </div>
            )}

            {tab === 'login' ? (
              <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
                <div>
                  <h2 className="font-display text-3xl font-semibold text-white">
                    Sign In to VIP Portal
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Demo VIP: <code className="text-[#DFC07A]">client2026</code>{' '}
                    · Demo Admin:{' '}
                    <code className="text-[#DFC07A]">
                      admin@webxdigital-estate.com
                    </code>{' '}
                    / <code className="text-[#DFC07A]">admin2026</code>
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-5 text-xs font-semibold uppercase tracking-[0.16em] rounded-lg gold-metallic-btn cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleRegisterSubmit}
                noValidate
                className="space-y-4"
              >
                <div>
                  <h2 className="font-display text-3xl font-semibold text-white">
                    Create VIP Client Account
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Register to persist saved estates, viewing bookings, and mandates.
                  </p>
                </div>

                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Full Name *"
                  className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="Email Address *"
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                  />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="Phone Number *"
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={regLocation}
                    onChange={(e) => setRegLocation(e.target.value)}
                    placeholder="Primary City / Country"
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                  />
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none cursor-pointer"
                  >
                    <option value={UserRole.CLIENT}>VIP Client</option>
                    <option value={UserRole.INVESTOR}>
                      Family Office Investor
                    </option>
                  </select>
                </div>

                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Password (min. 6 characters) *"
                  className="w-full px-3.5 py-2.5 text-sm text-white bg-[#060608] border border-white/15 rounded-lg focus:border-[#C9A962] focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-5 text-xs font-semibold uppercase tracking-[0.16em] rounded-lg gold-metallic-btn cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Create VIP Account'}
                </button>
              </form>
            )}

            {/* Instant 1-Click Demo Role Access */}
            <div className="pt-5 border-t border-white/10 space-y-3">
              <p className="text-xs uppercase tracking-wider font-semibold text-[#C9A962]">
                Instant Role Demonstration
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => signInAsDemoRole('client')}
                  className="py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-white bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg transition-colors cursor-pointer"
                >
                  Demo VIP Client
                </button>
                <button
                  type="button"
                  onClick={() => signInAsDemoRole('admin')}
                  className="py-2.5 px-3 text-xs font-semibold uppercase tracking-wider rounded-lg gold-metallic-btn cursor-pointer"
                >
                  Demo Executive Admin
                </button>
              </div>
            </div>
          </div>

          {/* Honest Backend & Database Status */}
          <div className="bg-[#0D0E12] border border-white/10 rounded-xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-[#C9A962] shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-400 leading-relaxed">
              <strong className="text-white">Backend Status:</strong>{' '}
              {backendConnected
                ? 'Connected to Express server-side HMAC session authentication & persistent JSON database (/api/*). External Firebase/Supabase adapters remain optional via .env.'
                : 'Running in static client-only mode. Start the Express backend server (`npm run dev` / `npm start`) for full server-side RBAC persistence.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
