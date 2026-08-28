import './globals.css';
import React from 'react';

export const metadata = {
  title: 'FastPay — Instant Payment Checkout',
  description: 'Fast, secure, event-driven customer payment checkout platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
