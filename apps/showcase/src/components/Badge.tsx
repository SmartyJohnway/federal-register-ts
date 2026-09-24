import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'tierA' | 'tierB' | 'tierC' | 'trade' | 'outline' | 'success';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const baseClasses = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-wide';
  
  const variantClasses = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700',
    tierA: 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80',
    tierB: 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/80',
    tierC: 'bg-amber-950/80 text-amber-400 border border-amber-800/80',
    trade: 'bg-purple-950/80 text-purple-300 border border-purple-800/80',
    outline: 'bg-transparent text-slate-400 border border-slate-700',
    success: 'bg-green-950/80 text-green-300 border border-green-800/80',
  };

  return (
    <span className={twMerge(clsx(baseClasses, variantClasses[variant], className))} {...props}>
      {children}
    </span>
  );
}
