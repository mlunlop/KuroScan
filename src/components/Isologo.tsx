import React from 'react';
import { useI18n } from '../i18n/I18nContext';

interface IsologoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const Isologo: React.FC<IsologoProps> = ({ size = 36, showText = false, className = '' }) => {
  const { t } = useI18n();

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div 
        className="relative flex items-center justify-center rounded-2xl p-1 liquid-glass overflow-hidden"
        style={{ width: size, height: size }}
      >
        {/* Subtle scan glow light */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
        
        {/* Geometric Scan Emblem */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="w-3/4 h-3/4 text-white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Top-left corner */}
          <path d="M4 8V6a2 2 0 0 1 2-2h2" />
          {/* Top-right corner */}
          <path d="M16 4h2a2 2 0 0 1 2 2v2" />
          {/* Bottom-right corner */}
          <path d="M20 16v2a2 2 0 0 1-2 2h-2" />
          {/* Bottom-left corner */}
          <path d="M8 20H6a2 2 0 0 1-2-2v-2" />
          
          {/* High-tech central scan beam */}
          <line x1="4" y1="12" x2="20" y2="12" stroke="white" strokeWidth="2" strokeDasharray="3 1.5" />
          
          {/* Document shape inside */}
          <rect x="8" y="7" width="8" height="10" rx="1" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold tracking-tight text-white text-base">{t('appName')}</span>
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/10 text-white/80 font-mono">
              {t('engineBadge')}
            </span>
          </div>
          <span className="text-[10px] text-white/40 tracking-wider">{t('appSubtitle')}</span>
        </div>
      )}
    </div>
  );
};
