import React from 'react';
import { Sidebar } from '../../components/dashboard/Sidebar';

export const metadata = {
  title: 'FastPay — Merchant Console',
  description: 'Merchant dashboard overview and payment management',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 overflow-y-auto min-w-0">{children}</div>
    </div>
  );
}
