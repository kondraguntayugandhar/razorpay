import React from 'react';

interface FastPayLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FastPayLogo: React.FC<FastPayLogoProps> = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: { icon: 'w-6 h-6 rounded-lg border-1.5 p-0.5', text: 'text-base', dot: 'r-5' },
    md: { icon: 'w-8 h-8 rounded-xl border-2 p-1', text: 'text-lg', dot: 'r-6' },
    lg: { icon: 'w-10 h-10 rounded-xl border-2 p-1', text: 'text-xl', dot: 'r-7' },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* FastPay Icon Card */}
      <div className={`${s.icon} bg-white border-[#2563eb] shadow-xs flex items-center justify-center shrink-0`}>
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-[#2563eb]">
          <path
            d="M 35 25 L 65 25 C 75 25 70 40 55 50 C 40 60 35 75 65 75 L 70 75"
            stroke="currentColor"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="68" cy="16" r="7" fill="currentColor" />
          <circle cx="32" cy="84" r="7" fill="currentColor" />
        </svg>
      </div>

      {/* FastPay Wordmark */}
      <span className={`font-bold tracking-tight text-[#1d4ed8] font-sans ${s.text}`}>
        FastPay
      </span>
    </div>
  );
};
