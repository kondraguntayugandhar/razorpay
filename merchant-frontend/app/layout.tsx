import './globals.css';
import React from 'react';

export const metadata = {
  title: 'FastPay Merchant Portal — Dashboard & Refund Management',
  description: 'Merchant payment analytics and refund operations console',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
