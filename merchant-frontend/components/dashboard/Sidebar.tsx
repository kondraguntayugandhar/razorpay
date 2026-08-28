'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, CreditCard, Webhook, Key, Settings, LogOut, Zap } from 'lucide-react';
import { logoutMerchant } from '../../lib/auth';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Payments', href: '/dashboard', icon: CreditCard },
    { name: 'API Keys', href: '/login', icon: Key },
  ];

  const handleLogout = () => {
    logoutMerchant();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0 min-h-screen">
      <div>
        <div className="flex items-center space-x-3 px-3 py-4 mb-6 border-b border-slate-800/80">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-violet-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap className="h-5 w-5 text-slate-950 fill-current" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-100 tracking-tight">FastPay</span>
            <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Merchant Console</p>
          </div>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/10 to-violet-500/10 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800/80">
        <div className="px-3 py-2 mb-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          <p className="text-slate-400 text-[10px] uppercase font-semibold">Store Account</p>
          <p className="text-slate-200 font-medium truncate mt-0.5">Acme Store (Test Mode)</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
