import React from 'react';
import Link from 'next/link';
import { Home, CreditCard, ShoppingBag, MoreHorizontal } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'payments' | 'orders' | 'more';
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[390px] mx-auto bg-white border-t border-gray-100 flex items-center justify-around py-2 z-50 shadow-lg">
      <Link
        href="/dashboard"
        className={`flex flex-col items-center space-y-0.5 text-[10px] font-medium ${
          activeTab === 'home' ? 'text-blue-600 font-bold' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </Link>

      <Link
        href="/payments"
        className={`flex flex-col items-center space-y-0.5 text-[10px] font-medium ${
          activeTab === 'payments' ? 'text-blue-600 font-bold' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <CreditCard className="w-5 h-5" />
        <span>Payments</span>
      </Link>

      <Link
        href="/settlements"
        className={`flex flex-col items-center space-y-0.5 text-[10px] font-medium ${
          activeTab === 'orders' ? 'text-blue-600 font-bold' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <ShoppingBag className="w-5 h-5" />
        <span>Orders</span>
      </Link>

      <Link
        href="/links/create"
        className={`flex flex-col items-center space-y-0.5 text-[10px] font-medium ${
          activeTab === 'more' ? 'text-blue-600 font-bold' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <MoreHorizontal className="w-5 h-5" />
        <span>More</span>
      </Link>
    </nav>
  );
};
