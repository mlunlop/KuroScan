import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  interactive = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`liquid-glass-card rounded-2xl md:rounded-3xl p-4 transition-all duration-200 relative overflow-hidden ${
        interactive
          ? 'cursor-pointer active:scale-[0.985] hover:border-white/20'
          : ''
      } ${className}`}
      {...props}
    >
      {/* Subtle specular top sheen */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};
