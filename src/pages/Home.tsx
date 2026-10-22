import React from 'react';
import {
  Settings,
  Search,
  Camera,
  FileText,
  Star,
  Share2,
  Trash2,
  LayoutGrid,
  List,
  Sparkles,
  Layers,
  Clock,
  X
} from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { useI18n } from '../i18n/I18nContext';
import { Isologo } from '../components/Isologo';
import { LiquidGlassButton } from '../components/LiquidGlassButton';
import { GlassCard } from '../components/GlassCard';
import { GlassSurface } from '../components/GlassSurface';
import { ScannedDocument } from '../types/document';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const Home: React.FC = () => {
  const {
    filteredDocuments,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    viewMode,
    setViewMode,
    setActiveDocument,
    setIsViewerOpen,
    setIsScannerOpen,
    setIsSettingsOpen,
    setIsShareOpen,
    setIsOcrSheetOpen,
    toggleFavorite,
    deleteDocument,
  } = useDocuments();

  const { t } = useI18n();

  const handleDocumentClick = (doc: ScannedDocument) => {
    try {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    } catch {}
    setActiveDocument(doc);
    setIsViewerOpen(true);
  };

  const handleQuickShare = (e: React.MouseEvent, doc: ScannedDocument) => {
    e.stopPropagation();
    setActiveDocument(doc);
    setIsShareOpen(true);
  };

  const handleQuickOcr = (e: React.MouseEvent, doc: ScannedDocument) => {
    e.stopPropagation();
    setActiveDocument(doc);
    setIsViewerOpen(true);
    setIsOcrSheetOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    if (window.confirm(t('deleteConfirm'))) {
      deleteDocument(docId);
    }
  };

  return (
    <div className="relative min-h-screen pb-32 pt-12 px-4 sm:px-6 max-w-4xl mx-auto flex flex-col z-10">
      {/* TOP HEADER: React Bits GlassSurface Header Bar */}
      <GlassSurface
        width="100%"
        height={64}
        borderRadius={24}
        distortionScale={-80}
        displace={0.25}
        backgroundOpacity={0.08}
        className="mb-5 px-2"
      >
        <div className="w-full flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <Isologo size={38} showText={true} />
          </div>

          <div className="flex items-center gap-2">
            {/* Settings Wheel (Rueda de ajuste arriba a la derecha) */}
            <LiquidGlassButton
              variant="ghost"
              size="icon"
              onClick={() => setIsSettingsOpen(true)}
              className="rounded-full w-10 h-10"
              title={t('settingsTitle')}
            >
              <Settings className="w-5 h-5 text-white/90 hover:rotate-45 transition-transform duration-300" />
            </LiquidGlassButton>
          </div>
        </div>
      </GlassSurface>

      {/* SEARCH BAR & VIEW SWITCH */}
      <section className="space-y-3 mb-6">
        <div className="flex items-center gap-2">
          {/* Apple-style search input */}
          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl liquid-glass text-xs sm:text-sm text-white placeholder-white/35 outline-none focus:border-white/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 text-white/50 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Grid / List switch */}
          <div className="flex items-center p-1 rounded-2xl liquid-glass-pill shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === 'grid' ? 'bg-white text-black shadow-sm' : 'text-white/50 hover:text-white'
              }`}
              title={t('gridTooltip')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === 'list' ? 'bg-white text-black shadow-sm' : 'text-white/50 hover:text-white'
              }`}
              title={t('listTooltip')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Filter Chips (Apple style) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: t('filterAll') },
            { id: 'recent', label: t('filterRecent') },
            { id: 'favorites', label: t('filterFavorites') },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all select-none shrink-0 ${
                activeFilter === f.id
                  ? 'bg-white text-black font-semibold shadow-md scale-[1.02]'
                  : 'liquid-glass-pill text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* DOCUMENT LIST / GRID */}
      <main className="flex-1">
        {filteredDocuments.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-20 h-20 rounded-3xl liquid-glass flex items-center justify-center mb-4 text-white/40 shadow-inner">
              <FileText className="w-10 h-10 stroke-[1.2]" />
            </div>
            <h3 className="text-base font-semibold text-white">{t('emptyTitle')}</h3>
            <p className="text-xs text-white/50 max-w-xs mt-1.5 leading-relaxed">
              {searchQuery
                ? t('emptySearchDesc', { query: searchQuery })
                : t('emptyDesc')}
            </p>
            {!searchQuery && (
              <LiquidGlassButton
                variant="primary"
                size="md"
                className="mt-5 font-semibold"
                onClick={() => setIsScannerOpen(true)}
              >
                <Camera className="w-4 h-4 mr-1.5" />
                {t('scanNow')}
              </LiquidGlassButton>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredDocuments.map((doc) => (
              <GlassCard
                key={doc.id}
                interactive
                onClick={() => handleDocumentClick(doc)}
                className="group flex flex-col justify-between p-3"
              >
                {/* Document Thumbnail Preview */}
                <div className="relative aspect-[1/1.3] w-full rounded-xl overflow-hidden bg-white mb-2.5 shadow-md">
                  <img
                    src={doc.pages[0]}
                    alt={doc.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Page Badge */}
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-semibold text-white flex items-center gap-1">
                    <Layers className="w-2.5 h-2.5" />
                    {doc.pages.length}
                  </div>

                  {/* Favorite Toggle Star */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(doc.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/80 hover:text-white"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        doc.favorite ? 'text-amber-400 fill-amber-400' : 'text-white/80'
                      }`}
                    />
                  </button>

                  {/* OCR indicator badge */}
                  <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md bg-white/90 text-black text-[9px] font-mono font-bold">
                    {t('ocrBadge')}
                  </div>
                </div>

                {/* Document Info */}
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-white truncate group-hover:text-white/90">
                    {doc.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-white/45">
                    <span>{doc.createdAt}</span>
                    <span>{doc.fileSize}</span>
                  </div>
                </div>

                {/* Quick actions hover overlay */}
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5 text-white/60">
                  <button
                    onClick={(e) => handleQuickOcr(e, doc)}
                    className="p-1 hover:text-white text-[11px] flex items-center gap-1"
                    title={t('btnExtractText')}
                  >
                    <Sparkles className="w-3 h-3 text-white" />
                    <span>{t('btnExtractText')}</span>
                  </button>
                  <button
                    onClick={(e) => handleQuickShare(e, doc)}
                    className="p-1 hover:text-white"
                    title={t('btnShare')}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="space-y-2.5">
            {filteredDocuments.map((doc) => (
              <GlassCard
                key={doc.id}
                interactive
                onClick={() => handleDocumentClick(doc)}
                className="group flex items-center justify-between p-3 gap-3"
              >
                {/* Thumbnail */}
                <div className="w-14 h-18 aspect-[1/1.3] rounded-lg overflow-hidden bg-white shrink-0 border border-white/10 shadow-sm">
                  <img
                    src={doc.pages[0]}
                    alt={doc.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Meta details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white truncate">{doc.title}</h4>
                    {doc.favorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/45 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {doc.createdAt}
                    </span>
                    <span>•</span>
                    <span>{doc.pages.length} {doc.pages.length === 1 ? t('pageCountSingle') : t('pageCountPlural')}</span>
                    <span>•</span>
                    <span>{doc.fileSize}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/80 font-mono">
                      Google ML Kit
                    </span>
                    {doc.tags.map((tTag) => (
                      <span key={tTag} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/60">
                        {tTag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-1 text-white/60 shrink-0">
                  <button
                    onClick={(e) => handleQuickOcr(e, doc)}
                    className="p-2 rounded-xl hover:bg-white/10 hover:text-white"
                    title={t('btnExtractText')}
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={(e) => handleQuickShare(e, doc)}
                    className="p-2 rounded-xl hover:bg-white/10 hover:text-white"
                    title={t('btnShare')}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, doc.id)}
                    className="p-2 rounded-xl hover:bg-red-500/10 hover:text-red-400"
                    title={t('btnDelete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </main>

      {/* FLOATING ACTION BUTTON CON REACT BITS: <GlassSurface /> */}
      <div className="fixed bottom-7 right-6 z-30">
        <button
          onClick={() => {
            try {
              Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
            } catch {}
            setIsScannerOpen(true);
          }}
          className="group relative cursor-pointer outline-none active:scale-90 transition-transform"
          title={t('fabScanTooltip')}
        >
          {/* Subtle pulsant glow aura */}
          <span className="absolute inset-0 rounded-full bg-white/20 animate-ping pointer-events-none" />

          {/* Optical refraction glass button */}
          <GlassSurface
            width={64}
            height={64}
            borderRadius={32}
            distortionScale={-160}
            displace={0.45}
            backgroundOpacity={0.14}
            className="shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_28px_rgba(255,255,255,0.22)]"
          >
            <Camera className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />
          </GlassSurface>
        </button>
      </div>
    </div>
  );
};

export default Home;
