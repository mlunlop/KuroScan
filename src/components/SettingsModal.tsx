import React from 'react';
import {
  X,
  Sliders,
  ShieldCheck,
  HardDrive,
  Globe,
  Languages,
  Smartphone,
  RotateCcw
} from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { useI18n } from '../i18n/I18nContext';
import { Language } from '../i18n/translations';
import { LiquidGlassButton } from './LiquidGlassButton';
import { INITIAL_DOCUMENTS } from '../mock/documents';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, settings, updateSettings } = useDocuments();
  const { language, setLanguage, t } = useI18n();

  if (!isSettingsOpen) return null;

  const handleResetDefaults = () => {
    if (window.confirm(t('resetConfirm'))) {
      localStorage.setItem('kuroscan_documents', JSON.stringify(INITIAL_DOCUMENTS));
      window.location.reload();
    }
  };

  const handleClearCache = () => {
    Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
    alert(t('cacheClearedAlert'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn select-none p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#0e0e11] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slideUp">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-white" />
            <h3 className="font-semibold text-white text-base">{t('settingsTitle')}</h3>
          </div>
          <LiquidGlassButton
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(false)}
            className="rounded-full w-8 h-8"
          >
            <X className="w-4 h-4 text-white" />
          </LiquidGlassButton>
        </div>

        {/* Scrollable Settings Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* 100% On-Device Guarantee Badge */}
          <div className="p-4 rounded-2xl liquid-glass border border-emerald-500/30 bg-emerald-950/15 flex items-start gap-3.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-white">{t('privacyBadgeTitle')}</h4>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  {t('privacyBadgeSub')}
                </span>
              </div>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">
                {t('privacyBadgeDesc')}
              </p>
            </div>
          </div>

          {/* Group 0: Idioma / Language (Bilingual Selection) */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider block px-1">
              {t('sectionLanguage')}
            </span>
            <div className="rounded-2xl liquid-glass-card divide-y divide-white/5 border border-white/10 overflow-hidden">
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Languages className="w-4 h-4 text-white/70" />
                  <div>
                    <span className="text-xs font-medium text-white block">{t('interfaceLanguageLabel')}</span>
                    <span className="text-[11px] text-white/40">{t('interfaceLanguageDesc')}</span>
                  </div>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="bg-white/10 text-white text-xs px-3 py-1.5 rounded-xl border border-white/20 outline-none font-medium cursor-pointer"
                >
                  <option value="es" className="bg-neutral-900">{t('langEs')}</option>
                  <option value="en" className="bg-neutral-900">{t('langEn')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Group 1: Google ML Kit & Scanner */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider block px-1">
              {t('sectionScanner')}
            </span>
            <div className="rounded-2xl liquid-glass-card divide-y divide-white/5 border border-white/10 overflow-hidden">
              {/* Quality selector */}
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-white block">{t('pdfQualityLabel')}</span>
                  <span className="text-[11px] text-white/40">{t('pdfQualityDesc')}</span>
                </div>
                <select
                  value={settings.defaultPdfQuality}
                  onChange={(e) => updateSettings({ defaultPdfQuality: e.target.value as any })}
                  className="bg-white/10 text-white text-xs px-3 py-1.5 rounded-xl border border-white/20 outline-none"
                >
                  <option value="high" className="bg-neutral-900">{t('qualityHigh')}</option>
                  <option value="balanced" className="bg-neutral-900">{t('qualityBalanced')}</option>
                  <option value="compressed" className="bg-neutral-900">{t('qualityCompressed')}</option>
                </select>
              </div>

              {/* Auto crop toggle */}
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-white block">{t('autoCropLabel')}</span>
                  <span className="text-[11px] text-white/40">{t('autoCropDesc')}</span>
                </div>
                <button
                  onClick={() => updateSettings({ autoCropEnabled: !settings.autoCropEnabled })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.autoCropEnabled ? 'bg-white' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full transition-transform absolute top-0.5 ${
                      settings.autoCropEnabled
                        ? 'translate-x-5 bg-black'
                        : 'translate-x-0.5 bg-white/70'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Group 2: OCR Settings */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider block px-1">
              {t('sectionOcr')}
            </span>
            <div className="rounded-2xl liquid-glass-card divide-y divide-white/5 border border-white/10 overflow-hidden">
              {/* OCR Language */}
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-white/60" />
                  <div>
                    <span className="text-xs font-medium text-white block">{t('ocrLanguageLabel')}</span>
                    <span className="text-[11px] text-white/40">{t('ocrLanguageDesc')}</span>
                  </div>
                </div>
                <select
                  value={settings.defaultOcrLanguage}
                  onChange={(e) => updateSettings({ defaultOcrLanguage: e.target.value as any })}
                  className="bg-white/10 text-white text-xs px-3 py-1.5 rounded-xl border border-white/20 outline-none"
                >
                  <option value="es" className="bg-neutral-900">Español (ES)</option>
                  <option value="en" className="bg-neutral-900">English (US)</option>
                  <option value="fr" className="bg-neutral-900">Français (FR)</option>
                  <option value="de" className="bg-neutral-900">Deutsch (DE)</option>
                </select>
              </div>

              {/* Haptics toggle */}
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-white/60" />
                  <div>
                    <span className="text-xs font-medium text-white block">{t('hapticsLabel')}</span>
                    <span className="text-[11px] text-white/40">{t('hapticsDesc')}</span>
                  </div>
                </div>
                <button
                  onClick={() => updateSettings({ hapticsEnabled: !settings.hapticsEnabled })}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.hapticsEnabled ? 'bg-white' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full transition-transform absolute top-0.5 ${
                      settings.hapticsEnabled
                        ? 'translate-x-5 bg-black'
                        : 'translate-x-0.5 bg-white/70'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Group 3: Storage & Maintenance */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider block px-1">
              {t('sectionStorage')}
            </span>
            <div className="rounded-2xl liquid-glass-card divide-y divide-white/5 border border-white/10 overflow-hidden">
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <HardDrive className="w-4 h-4 text-white/60" />
                  <div>
                    <span className="text-xs font-medium text-white block">{t('clearCacheLabel')}</span>
                    <span className="text-[11px] text-white/40">{t('clearCacheDesc')}</span>
                  </div>
                </div>
                <button
                  onClick={handleClearCache}
                  className="px-3 py-1.5 rounded-xl liquid-glass text-xs text-white/80 hover:text-white"
                >
                  {t('btnClearCache')}
                </button>
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-white/60" />
                  <div>
                    <span className="text-xs font-medium text-white block">{t('resetDemoLabel')}</span>
                    <span className="text-[11px] text-white/40">{t('resetDemoDesc')}</span>
                  </div>
                </div>
                <button
                  onClick={handleResetDefaults}
                  className="px-3 py-1.5 rounded-xl bg-white/10 text-xs text-white/80 hover:text-white"
                >
                  {t('btnResetDemo')}
                </button>
              </div>
            </div>
          </div>

          {/* About footer */}
          <div className="pt-2 text-center text-[11px] text-white/30 space-y-1">
            <p>{t('footerAppInfo')}</p>
            <p>{t('footerOpenSource')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
