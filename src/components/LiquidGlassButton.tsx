import React from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface LiquidGlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'glass' | 'primary' | 'ghost' | 'fab' | 'pill';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ReactNode;
  children?: React.ReactNode;
  haptic?: boolean;
}

export const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  variant = 'glass',
  size = 'md',
  icon,
  children,
  haptic = true,
  className = '',
  onClick,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (haptic) {
      try {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      } catch {
        // Safe fallback if not native
      }
    }
    if (onClick) onClick(e);
  };

  // Base Apple interactive styles
  const baseClasses =
    'relative inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer outline-none active:scale-95 disabled:opacity-40 disabled:pointer-events-none';

  // Size styles
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 rounded-xl gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-2xl gap-2',
    lg: 'text-base px-5 py-3 rounded-2xl gap-2.5',
    icon: 'p-2.5 rounded-2xl w-10 h-10 aspect-square',
  };

  // Variant styling
  const variantClasses = {
    glass:
      'liquid-glass text-white hover:bg-white/10 border border-white/15 hover:border-white/25 active:bg-white/15',
    primary:
      'bg-white text-black font-semibold shadow-[0_4px_24px_rgba(255,255,255,0.25)] hover:bg-neutral-100 active:bg-neutral-200',
    ghost:
      'bg-transparent text-white/70 hover:text-white hover:bg-white/5 active:bg-white/10 border border-transparent',
    pill:
      'liquid-glass-pill text-white/90 text-xs px-3.5 py-1.5 rounded-full hover:bg-white/12 active:bg-white/20',
    fab:
      'liquid-glass-fab text-white rounded-full w-14 h-14 p-0 shadow-[0_12px_36px_rgba(0,0,0,0.8),0_0_24px_rgba(255,255,255,0.18)] active:scale-90',
  };

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
