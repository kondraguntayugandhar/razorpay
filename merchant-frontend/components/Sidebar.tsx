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
  Settings,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const mainItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Payments', href: '/payments', icon: CreditCard },
    { label: 'Orders', href: '/orders', icon: ShoppingBag },
    { label: 'Refunds', href: '/refunds', icon: RotateCcw },
    { label: 'Disputes', href: '/disputes', icon: AlertTriangle },
    { label: 'Settlements', href: '/settlements', icon: ShieldCheck },
    { label: 'Reports', href: '/reports', icon: BarChart3 },
    { label: 'Customers', href: '/customers', icon: Users },
    { label: 'Payment Links', href: '/links', icon: Link2 },
    { label: 'Invoices', href: '/invoices', icon: FileText },
  ];

  const developerItems = [
    { label: 'API Keys', href: '/developers/api-keys', icon: Key },
    { label: 'Webhooks', href: '/webhooks', icon: Webhook },
    { label: 'Logs', href: '/audit-logs', icon: History },
  ];

  const accountItems = [
    { label: 'Settings', href: '/profile', icon: Settings },
    { label: 'Team', href: '/team', icon: Users2 },
    { label: 'Audit', href: '/audit-logs', icon: FileSpreadsheet },
  ];

  const renderLink = (item: { label: string; href: string; icon: React.ElementType }) => {
    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
          isActive
            ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 shrink-0 select-none shadow-2xs z-30">
      {/* BRAND HEADER */}
      <div className="h-16 border-b border-gray-100 flex items-center px-5">
        <FastPayLogo size="md" />
      </div>

      {/* NAVIGATION LINKS */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {/* Main Nav Items */}
        <div className="space-y-1">
          {mainItems.map(renderLink)}
        </div>

        {/* DEVELOPERS Group */}
        <div>
          <p className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            DEVELOPERS
          </p>
          <div className="space-y-1">
            {developerItems.map(renderLink)}
          </div>
        </div>

        {/* ACCOUNT Group */}
        <div>
          <p className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            ACCOUNT
          </p>
          <div className="space-y-1">
            {accountItems.map(renderLink)}
          </div>
        </div>
      </div>

      {/* FOOTER USER PROFILE CARD */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/50">
        <Link href="/profile" className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white hover:shadow-2xs transition-all border border-transparent hover:border-gray-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            AM
          </div>
          <div className="overflow-hidden text-left">
            <p className="text-xs font-bold text-gray-900 truncate">Arjun M</p>
            <p className="text-[10px] text-gray-500 truncate">Merchant Owner</p>
          </div>
        </Link>
      </div>
    </aside>
  );
};

