'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FastPayLogo } from '../../components/FastPayLogo';
import { Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('merchant@company.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#111318] flex items-center justify-center p-2 sm:p-6 font-sans">
      <div className="w-full max-w-[390px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col p-6 min-h-[672px] justify-between">


        {/* LOGO & WELCOME */}
        <div className="text-center pt-4">
          <div className="flex justify-center mb-4">
            <FastPayLogo size="lg" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Welcome back</h1>
          <p className="text-xs text-gray-400 mt-1">Sign in to your merchant account</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-4 my-auto">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="merchant@company.com"
              className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-700">Password</label>
              <a href="#" className="text-xs text-blue-600 font-semibold hover:underline">
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="remember" className="text-xs text-gray-700 font-medium">
              Remember me for 30 days
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2 mt-2"
          >
            <span>Sign in</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* OR DIVIDER */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="shrink mx-3 text-[11px] font-bold text-gray-400 uppercase">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* GOOGLE SIGN IN */}
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors flex items-center justify-center space-x-2 shadow-2xs"
          >
            <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-extrabold">
              G
            </div>
            <span>Sign in with Google</span>
          </button>
        </form>

        {/* FOOTER */}
        <div className="text-center space-y-2 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-600">
            Don't have a FastPay account?{' '}
            <a href="#" className="text-blue-600 font-bold hover:underline">
              Create merchant account
            </a>
          </p>
          <div className="flex items-center justify-center space-x-1 text-[11px] text-gray-400">
            <Lock className="w-3 h-3" />
            <span>Stream encrypted connection</span>
          </div>
        </div>

      </div>
    </div>
  );
}
