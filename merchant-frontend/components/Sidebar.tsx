'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FastPayLogo } from './FastPayLogo';
import {
  LayoutDashboard,
  CreditCard,
  ShoppingBag,
  RotateCcw,
  AlertTriangle,
  Users,
  Link2,
  Users2,
  FileText,
  Webhook,
  History,
  BarChart3,
  Key,
  User,
  Settings,
  ShieldCheck,
  Bell
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navGroups = [
    {
      title: 'CORE',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Payments', href: '/payments', icon: CreditCard },
        { label: 'Orders', href: '/orders', icon: ShoppingBag },
        { label: 'Refunds', href: '/refunds', icon: RotateCcw },
        { label: 'Payment Links', href: '/links', icon: Link2 },
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { label: 'Customers', href: '/customers', icon: Users },
        { label: 'Disputes', href: '/disputes', icon: AlertTriangle },
        { label: 'Invoices', href: '/invoices', icon: FileText },
        { label: 'Settlements', href: '/settlements', icon: ShieldCheck },
      ]
    },
    {
      title: 'DEVELOPERS & TOOLS',
      items: [
        { label: 'API Keys', href: '/developers/api-keys', icon: Key },
        { label: 'Webhooks', href: '/webhooks', icon: Webhook },
        { label: 'Reports', href: '/reports', icon: BarChart3 },
        { label: 'Audit Log', href: '/audit-logs', icon: History },
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { label: 'Team', href: '/team', icon: Users2 },
        { label: 'Notifications', href: '/notifications', icon: Bell },
        { label: 'Profile', href: '/profile', icon: User },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* BRAND HEADER */}
      <div className="h-16 border-b border-slate-800 flex items-center px-6">
        <FastPayLogo size="md" />
      </div>

      {/* NAVIGATION LINKS */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER USER CARD */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <Link href="/profile" className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-800/60 transition-colors">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
            AM
          </div>
          <div className="overflow-hidden text-left">
            <p className="text-xs font-bold text-slate-100 truncate">Arjun M</p>
            <p className="text-[10px] text-slate-500 truncate">Merchant Owner</p>
          </div>
        </Link>
      </div>
    </aside>
  );
};
