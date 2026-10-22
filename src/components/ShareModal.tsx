import React, { useState } from 'react';
import {
  X,
  Share2,
  FileText,
  FileCheck,
  Image as ImageIcon,
  Check,
  Send,
  Download
} from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { useI18n } from '../i18n/I18nContext';
import { LiquidGlassButton } from './LiquidGlassButton';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const ShareModal: React.FC = () => {
  const { activeDocument, isShareOpen, setIsShareOpen } = useDocuments();
  const { t } = useI18n();

  const [selectedFormat, setSelectedFormat] = useState<'pdf-ocr' | 'pdf-light' | 'images'>('pdf-ocr');
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  if (!isShareOpen || !activeDocument) return null;

  const handleShareTrigger = async () => {
    setIsSharing(true);
    try {
      Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
      
      // Native Web Share or Capacitor Share fallback
      if (navigator.share) {
        await navigator.share({
          title: activeDocument.title,
          text: t('shareMessage', { pages: activeDocument.pages.length }),
          url: window.location.href,
        });
      } else {
        // Fallback simulation
        await new Promise((r) => setTimeout(r, 800));
      }

      setShareSuccess(true);
      setTimeout(() => {
        setShareSuccess(false);
        setIsShareOpen(false);
      }, 1500);
    } catch {
      // User cancelled share
    } finally {
      setIsSharing(false);
    }
  };

  const handleQuickDownload = () => {
    const link = document.createElement('a');
    link.href = activeDocument.pages[0];
    link.download = `${activeDocument.title}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    Haptics.notification({ type: NotificationType.Success }).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md animate-fadeIn select-none p-0 sm:p-4">
      <div className="w-full max-w-md bg-[#111114] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slideUp">
        {/* Top Sheet Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-white" />
            <h3 className="font-semibold text-white text-base">{t('shareHeader')}</h3>
          </div>
          <LiquidGlassButton
            variant="ghost"
            size="icon"
            onClick={() => setIsShareOpen(false)}
            className="rounded-full w-8 h-8"
          >
            <X className="w-4 h-4 text-white" />
          </LiquidGlassButton>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Document Preview Card */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl liquid-glass-card">
            <div className="w-14 h-18 rounded-lg overflow-hidden border border-white/20 bg-white shrink-0">
              <img
                src={activeDocument.pages[0]}
                alt="Thumb"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white text-sm truncate">{activeDocument.title}</h4>
              <p className="text-xs text-white/50 mt-0.5">
                {activeDocument.pages.length} {activeDocument.pages.length === 1 ? t('pageCountFullSingle') : t('pageCountFullPlural')} • {activeDocument.fileSize}
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 mt-1 font-mono">
                <Check className="w-3 h-3" /> {t('ocrLayerReady')}
              </span>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block">
              {t('fileFormatLabel')}
            </label>
            <div className="space-y-2">
              {[
                {
                  id: 'pdf-ocr',
                  icon: FileCheck,
                  title: t('formatPdfOcrTitle'),
                  desc: t('formatPdfOcrDesc'),
                },
                {
                  id: 'pdf-light',
                  icon: FileText,
                  title: t('formatPdfLightTitle'),
                  desc: t('formatPdfLightDesc'),
                },
                {
                  id: 'images',
                  icon: ImageIcon,
                  title: t('formatImagesTitle'),
                  desc: t('formatImagesDesc'),
                },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedFormat === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedFormat(opt.id as any)}
                    className={`w-full p-3.5 rounded-2xl text-left flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'liquid-glass border-white/40 bg-white/10'
                        : 'bg-white/[0.02] border border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isSelected ? 'bg-white text-black' : 'bg-white/10 text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">{opt.title}</span>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <p className="text-[11px] text-white/50 mt-0.5 leading-snug">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-6 pt-2 pb-8 border-t border-white/10 flex items-center gap-3">
          <LiquidGlassButton
            variant="glass"
            className="flex-1 py-3.5 rounded-2xl"
            onClick={handleQuickDownload}
          >
            <Download className="w-4 h-4 mr-1.5" />
            {t('btnDownload')}
          </LiquidGlassButton>

          <LiquidGlassButton
            variant="primary"
            className="flex-1 py-3.5 rounded-2xl font-semibold"
            onClick={handleShareTrigger}
            disabled={isSharing}
          >
            {shareSuccess ? (
              <>
                <Check className="w-4 h-4 mr-1 text-emerald-600" />
                {t('btnSharedSuccess')}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-1.5" />
                {t('btnShareAction')}
              </>
            )}
          </LiquidGlassButton>
        </div>
      </div>
    </div>
  );
};
