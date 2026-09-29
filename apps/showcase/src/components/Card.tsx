import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export function Card({ className, hoverEffect = false, children, ...props }: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm',
          hoverEffect && 'transition-all hover:border-slate-700 hover:shadow-cyan-950/20 hover:shadow-xl',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge(clsx('mb-4 pb-3 border-b border-slate-800/80 flex items-center justify-between', className))} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={twMerge(clsx('text-lg font-semibold text-slate-100 flex items-center gap-2', className))} {...props}>
      {children}
    </h3>
  );
}
