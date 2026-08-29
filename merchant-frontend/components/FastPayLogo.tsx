import React from 'react';

interface FastPayLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FastPayLogo: React.FC<FastPayLogoProps> = ({ className = '', size = 'md' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      {/* Box Icon matching screenshot */}
      <div className={`${iconSizes[size]} bg-blue-600 rounded-lg flex items-center justify-center text-white font-black shrink-0 shadow-xs relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-blue-500 opacity-90"></div>
        <div className="relative z-10 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white rounded-[3px] flex items-center justify-center relative">
            <div className="w-2 h-2 bg-white rounded-[1px] absolute -bottom-1 -right-1"></div>
          </div>
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col leading-tight">
        <span className="font-bold text-gray-900 tracking-tight text-base font-sans">
          FastPay
        </span>
        <span className="text-[10px] font-semibold text-gray-400 tracking-wide uppercase">
          Merchant Portal
        </span>
      </div>
    </div>
  );
};

