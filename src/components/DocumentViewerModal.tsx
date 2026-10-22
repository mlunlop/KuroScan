import React, { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  Star,
  Trash2,
  Copy,
  Check,
  Search,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Sparkles,
  X,
  Plus
} from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { useI18n } from '../i18n/I18nContext';
import { LiquidGlassButton } from './LiquidGlassButton';
import { Haptics, NotificationType } from '@capacitor/haptics';

export const DocumentViewerModal: React.FC = () => {
  const {
    activeDocument,
    isViewerOpen,
    setIsViewerOpen,
    deleteDocument,
    toggleFavorite,
    renameDocument,
    setIsShareOpen,
    setIsScannerOpen,
    isOcrSheetOpen,
    setIsOcrSheetOpen,
  } = useDocuments();

  const { t } = useI18n();

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);
  const [ocrSearchQuery, setOcrSearchQuery] = useState('');

  if (!isViewerOpen || !activeDocument) return null;

  const totalPages = activeDocument.pages.length;
  const currentPage = activeDocument.pages[currentPageIndex] || activeDocument.pages[0];

  const handleCopyOcrText = async () => {
    try {
      await navigator.clipboard.writeText(activeDocument.ocrText);
      Haptics.notification({ type: NotificationType.Success }).catch(() => {});
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([activeDocument.ocrText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeDocument.title}_OCR_MLKit.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleStartRename = () => {
    setEditedTitle(activeDocument.title);
    setIsEditingTitle(true);
  };

  const handleSaveRename = () => {
    if (editedTitle.trim()) {
      renameDocument(activeDocument.id, editedTitle.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-black text-white select-none animate-fadeIn">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3.5 z-20 liquid-glass border-b border-white/10">
        <LiquidGlassButton
          variant="ghost"
          size="icon"
          onClick={() => {
            setIsViewerOpen(false);
            setIsOcrSheetOpen(false);
          }}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </LiquidGlassButton>

        {/* Title / Renaming */}
        <div className="flex-1 px-3 text-center truncate">
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleSaveRename}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
              className="bg-white/10 text-white text-center font-semibold text-sm px-3 py-1 rounded-lg border border-white/30 outline-none w-full max-w-xs"
            />
          ) : (
            <button
              onClick={handleStartRename}
              className="text-sm font-semibold tracking-tight text-white hover:text-white/80 transition-colors truncate max-w-xs block mx-auto"
            >
              {activeDocument.title}
            </button>
          )}
          <span className="text-[10px] text-white/50 block">
            {activeDocument.createdAt} • {totalPages} {totalPages === 1 ? t('pageCountFullSingle') : t('pageCountFullPlural')} • {activeDocument.fileSize}
          </span>
        </div>

        {/* Actions (Favorite & Share) */}
        <div className="flex items-center gap-1">
          <LiquidGlassButton
            variant="ghost"
            size="icon"
            onClick={() => toggleFavorite(activeDocument.id)}
            className="rounded-full"
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                activeDocument.favorite ? 'text-amber-400 fill-amber-400' : 'text-white/70'
              }`}
            />
          </LiquidGlassButton>

          <LiquidGlassButton
            variant="ghost"
            size="icon"
            onClick={() => setIsShareOpen(true)}
            className="rounded-full"
          >
            <Share2 className="w-5 h-5 text-white/90" />
          </LiquidGlassButton>
        </div>
      </div>

      {/* Main Document Canvas Viewer */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden p-4 bg-neutral-950">
        {/* Subtle document background mesh */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        {/* Floating Page Navigators */}
        {totalPages > 1 && (
          <>
            <button
              disabled={currentPageIndex === 0}
              onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full liquid-glass flex items-center justify-center text-white disabled:opacity-20 active:scale-90 transition-transform"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              disabled={currentPageIndex === totalPages - 1}
              onClick={() => setCurrentPageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full liquid-glass flex items-center justify-center text-white disabled:opacity-20 active:scale-90 transition-transform"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Document Page Display */}
        <div
          className="relative max-h-full max-w-full aspect-[1/1.414] rounded-2xl overflow-hidden shadow-[0_12px_48px_rgba(0,0,0,0.85)] border border-white/20 transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <img
            src={currentPage}
            alt={`Page ${currentPageIndex + 1}`}
            className="w-full h-full object-contain bg-white"
          />
        </div>

        {/* Floating Page Indicator Pill & Zoom */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full liquid-glass-pill shadow-xl text-xs">
          <span className="font-medium text-white/90">
            {currentPageIndex + 1} / {totalPages}
          </span>
          <span className="w-px h-3 bg-white/20" />
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
            className="p-1 hover:text-white text-white/70"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.2))}
            className="p-1 hover:text-white text-white/70"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Liquid Glass Action Bar */}
      <div className="px-5 py-4 pb-10 z-20 liquid-glass border-t border-white/10 flex items-center justify-between gap-3">
        {/* ML Kit OCR Trigger Button */}
        <LiquidGlassButton
          variant="glass"
          className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border-white/25 flex items-center justify-center gap-2 text-white font-medium shadow-[0_0_20px_rgba(255,255,255,0.08)]"
          onClick={() => setIsOcrSheetOpen(true)}
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>{t('btnOcrAction')}</span>
        </LiquidGlassButton>

        {/* Add Page Button */}
        <LiquidGlassButton
          variant="glass"
          size="icon"
          className="rounded-2xl w-12 h-12"
          onClick={() => {
            setIsViewerOpen(false);
            setIsScannerOpen(true);
          }}
          title={t('btnAddPage')}
        >
          <Plus className="w-5 h-5 text-white" />
        </LiquidGlassButton>

        {/* Share Button */}
        <LiquidGlassButton
          variant="glass"
          size="icon"
          className="rounded-2xl w-12 h-12"
          onClick={() => setIsShareOpen(true)}
          title={t('btnSharePdf')}
        >
          <Share2 className="w-5 h-5 text-white" />
        </LiquidGlassButton>

        {/* Delete Button */}
        <LiquidGlassButton
          variant="ghost"
          size="icon"
          className="rounded-2xl w-12 h-12 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          onClick={() => {
            if (window.confirm(t('deleteDocConfirm'))) {
              deleteDocument(activeDocument.id);
            }
          }}
          title={t('btnDelete')}
        >
          <Trash2 className="w-5 h-5" />
        </LiquidGlassButton>
      </div>

      {/* GOOGLE ML KIT TEXT RECOGNITION V2 BOTTOM SHEET */}
      {isOcrSheetOpen && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-50 flex flex-col bg-[#0d0d0f]/95 backdrop-blur-3xl rounded-t-3xl border-t border-white/20 shadow-[0_-12px_48px_rgba(0,0,0,0.9)] animate-slideUp">
          {/* Sheet Handle */}
          <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mt-3 mb-2 shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-2 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl liquid-glass flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  {t('ocrSheetTitle')}
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                    {t('ocrConfidence')}
                  </span>
                </h3>
                <span className="text-[11px] text-white/50">{t('ocrOfflineNotice')}</span>
              </div>
            </div>

            <LiquidGlassButton
              variant="ghost"
              size="icon"
              onClick={() => setIsOcrSheetOpen(false)}
              className="rounded-full w-9 h-9"
            >
              <X className="w-5 h-5 text-white" />
            </LiquidGlassButton>
          </div>

          {/* Search bar inside extracted text */}
          <div className="px-6 py-3 shrink-0">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5" />
              <input
                type="text"
                placeholder={t('ocrSearchPlaceholder')}
                value={ocrSearchQuery}
                onChange={(e) => setOcrSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl liquid-glass text-xs text-white placeholder-white/40 outline-none focus:border-white/30"
              />
              {ocrSearchQuery && (
                <button
                  onClick={() => setOcrSearchQuery('')}
                  className="absolute right-3 text-white/50 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* OCR Extracted Text Content Box */}
          <div className="flex-1 overflow-y-auto px-6 py-2 select-text font-mono text-xs leading-relaxed text-white/90">
            <div className="p-4 rounded-2xl liquid-glass-card border border-white/10 whitespace-pre-wrap selection:bg-white selection:text-black">
              {activeDocument.ocrText}
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div className="p-6 pt-3 pb-8 shrink-0 border-t border-white/10 flex items-center gap-3">
            <LiquidGlassButton
              variant="primary"
              className="flex-1 py-3 rounded-2xl font-semibold"
              onClick={handleCopyOcrText}
            >
              {copiedToast ? (
                <>
                  <Check className="w-4 h-4 mr-1 text-emerald-600" />
                  {t('btnCopied')}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1.5" />
                  {t('btnCopyAll')}
                </>
              )}
            </LiquidGlassButton>

            <LiquidGlassButton
              variant="glass"
              className="py-3 px-4 rounded-2xl"
              onClick={handleDownloadTxt}
              title={t('btnSaveTxt')}
            >
              <Download className="w-4 h-4 mr-1" />
              {t('btnSaveTxt')}
            </LiquidGlassButton>
          </div>
        </div>
      )}
    </div>
  );
};
