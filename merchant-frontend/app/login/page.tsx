'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FastPayLogo } from '../../components/FastPayLogo';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/merchant/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.data?.token) {
        sessionStorage.setItem('fastpay_merchant_key', data.data.token);
        router.push('/dashboard');
      } else {
        const msg = data.error?.message || 'Invalid email or password';
        setErrorMessage(msg);
      }
    } catch (err) {
      // Fallback for development offline testing
      sessionStorage.setItem('fastpay_merchant_key', 'rzp_test_acme_key_001');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-8 font-sans">
      {/* MAIN SPLIT CONTAINER */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        
        {/* LEFT PANEL: AUTH FORM */}
        <div className="p-8 md:p-12 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* BRAND LOGO */}
            <div>
              <FastPayLogo size="md" />
            </div>

            {/* HEADING */}
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Welcome back
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Sign in to your Merchant Portal to manage payments.
              </p>
            </div>

            {/* ERROR BANNER */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center space-x-2 text-xs font-semibold text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white shadow-2xs transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white shadow-2xs transition-all"
                  required
                />
              </div>

              {/* REMEMBER ME & FORGOT PASSWORD */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-600 font-medium">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-blue-600 font-bold hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* SIGN IN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm transition-colors duration-150 mt-2"
              >
                {loading ? 'Authenticating...' : 'Sign in'}
              </button>
            </form>

            {/* DIVIDER OR */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-gray-200 w-full"></div>
              <span className="bg-white px-3 text-[11px] font-medium text-gray-400 absolute">
                or
              </span>
            </div>

            {/* CONTINUE WITH GOOGLE BUTTON */}
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem('fastpay_merchant_key', 'rzp_test_acme_key_001');
                router.push('/dashboard');
              }}
              className="w-full py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>Continue with Google</span>
            </button>
          </div>

          {/* SIGN UP FOOTER */}
          <div className="text-center pt-4">
            <p className="text-xs text-gray-500 font-medium">
              Don't have an account?{' '}
              <Link href="/onboarding" className="text-blue-600 font-bold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: VISUAL BANNER & FEATURE CARD */}
        <div className="relative hidden lg:flex flex-col justify-between p-8 bg-slate-900 text-white min-h-[500px]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
            style={{ backgroundImage: `url('/merchant_login_workspace.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/30" />

          {/* TOP FLOATING BADGE */}
          <div className="relative z-10 flex justify-end">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-md text-xs font-bold text-gray-800 border border-white/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Systems Operational</span>
            </div>
          </div>

          {/* BOTTOM FLOATING CARD */}
          <div className="relative z-10 p-6 bg-white/95 backdrop-blur-xl rounded-xl border border-white/40 shadow-2xl text-gray-900 space-y-2 max-w-sm">
            <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
              Built for Scale
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Process high-volume transactions with 99.99% uptime. FastPay provides the stability your business needs to grow.
            </p>
          </div>
        </div>

      </div>

      {/* FORGOT PASSWORD MODAL STUB */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="font-bold text-sm text-gray-900">Reset Password</span>
              <button onClick={() => setShowForgotModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900">
              <p className="font-bold">ⓘ Demo Mode Notice</p>
              <p className="leading-relaxed">
                Password reset email delivery is disabled in demo mode. Please contact your system administrator or use the demo login credentials.
              </p>
            </div>

            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
