import React from 'react';
import { cn } from './Button';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, title, description, footer }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-soft border border-primary-100 overflow-hidden flex flex-col h-full',
        className,
      )}
    >
      {(title || description) && (
        <div className="px-6 py-4 border-b border-primary-50 shrink-0">
          {title && <h3 className="text-lg font-semibold text-primary-800">{title}</h3>}
          {description && <p className="text-sm text-primary-500 mt-1">{description}</p>}
        </div>
      )}
      <div className="px-6 py-5 flex-1">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-primary-50/50 border-t border-primary-50 shrink-0 mt-auto">
          {footer}
        </div>
      )}
    </div>
  );
};
