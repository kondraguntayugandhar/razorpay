import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`glass-card rounded-2xl p-6 border border-slate-800 ${className}`} {...props}>
      {children}
    </div>
  );
};
