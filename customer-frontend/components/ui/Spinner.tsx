import React from 'react';

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-5 w-5 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className={`animate-spin rounded-full border-t-emerald-500 border-r-emerald-500 border-b-slate-700 border-l-slate-700 ${sizes[size]} ${className}`} />
  );
};
