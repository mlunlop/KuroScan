import React, { useState, useEffect } from 'react';
import {
  Camera,
  X,
  Zap,
  ZapOff,
  Sparkles,
  Layers,
  Check,
  RotateCcw,
  Sliders,
  ChevronRight,
  FileText
} from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { useI18n } from '../i18n/I18nContext';
import { LiquidGlassButton } from './LiquidGlassButton';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const ScannerModal: React.FC = () => {
  const { isScannerOpen, setIsScannerOpen, addScannedDocument } = useDocuments();
  const { t } = useI18n();
  
  const [flash, setFlash] = useState(false);
  const [autoCapture, setAutoCapture] = useState(true);
  const [capturedPages, setCapturedPages] = useState<string[]>([]);
  const [isDetecting, setIsDetecting] = useState(true);
  const [activeStep, setActiveStep] = useState<'camera' | 'review'>('camera');
  const [selectedFilter, setSelectedFilter] = useState<'enhanced' | 'original' | 'bw' | 'grayscale'>('enhanced');
  const [docName, setDocName] = useState('');

  useEffect(() => {
    if (isScannerOpen) {
      setActiveStep('camera');
      setCapturedPages([]);
      const d = new Date();
      setDocName(`Doc_${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, '0')}${d.getDate().toString().padStart(2, '0')}_${d.getHours()}${d.getMinutes()}`);
      
      // Auto-detect simulation
      const timer = setTimeout(() => {
        setIsDetecting(false);
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [isScannerOpen]);

  if (!isScannerOpen) return null;

  // Simulate snapping a page via ML Kit Document Scanner
  const handleCapturePage = () => {
    try {
      Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
    } catch {}

    const pageIndex = capturedPages.length + 1;
    const svgPage = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850">
      <rect width="600" height="850" fill="${selectedFilter === 'bw' ? '#ffffff' : '#f8f8fa'}"/>
      <rect x="30" y="30" width="540" height="790" fill="none" stroke="#d0d0d8" stroke-width="1.5" stroke-dasharray="4,4"/>
      <text x="60" y="90" font-family="-apple-system, Inter, sans-serif" font-size="24" font-weight="bold" fill="#000000">DOCUMENT SCAN (ML KIT)</text>
      <text x="60" y="120" font-family="-apple-system, Inter, sans-serif" font-size="14" fill="#666666">Filter: ${selectedFilter.toUpperCase()} | 4-point perspective active</text>
      <line x1="60" y1="140" x2="540" y2="140" stroke="#000000" stroke-width="2"/>
      <text x="60" y="190" font-family="-apple-system, Inter, sans-serif" font-size="15" fill="#222222">Page ${pageIndex} processed with Google ML Kit Document Scanner.</text>
      <text x="60" y="225" font-family="-apple-system, Inter, sans-serif" font-size="14" fill="#444444">• Auto-removal of shadows and creases.</text>
      <text x="60" y="255" font-family="-apple-system, Inter, sans-serif" font-size="14" fill="#444444">• High-sharpness optical focus for Text Recognition v2.</text>
      <text x="60" y="285" font-family="-apple-system, Inter, sans-serif" font-size="14" fill="#444444">• Real-time edge boundary detection.</text>
      <rect x="60" y="330" width="480" height="180" fill="#ededf2" rx="8" stroke="#d5d5db"/>
      <text x="80" y="370" font-family="-apple-system, Inter, sans-serif" font-size="14" font-weight="600" fill="#111111">EXTRACTED DATA SECTION</text>
      <text x="80" y="405" font-family="-apple-system, Inter, sans-serif" font-size="13" fill="#333333">Item 01: 4K Sensor verification complete</text>
      <text x="80" y="435" font-family="-apple-system, Inter, sans-serif" font-size="13" fill="#333333">Item 02: On-device NPU accelerated processing</text>
      <text x="80" y="465" font-family="-apple-system, Inter, sans-serif" font-size="13" fill="#333333">Item 03: Immediate selectable text extraction</text>
      <text x="540" y="800" font-family="-apple-system, Inter, sans-serif" font-size="13" fill="#888888" text-anchor="end">KuroScan Engine • Page ${pageIndex}</text>
    </svg>`;

    const pageUri = `data:image/svg+xml;utf8,${encodeURIComponent(svgPage)}`;
    setCapturedPages((prev) => [...prev, pageUri]);
  };

  const handleFinishAndSave = () => {
    if (capturedPages.length === 0) return;

    try {
      Haptics.notification({ type: NotificationType.Success }).catch(() => {});
    } catch {}

    const mockExtractedText = `DOCUMENT SCAN (ML KIT)
Filter: ${selectedFilter.toUpperCase()} | 4-point perspective active

Page 1 processed with Google ML Kit Document Scanner.
• Auto-removal of shadows and creases.
• High-sharpness optical focus for Text Recognition v2.
• Real-time edge boundary detection.

EXTRACTED DATA SECTION
Item 01: 4K Sensor verification complete
Item 02: On-device NPU accelerated processing
Item 03: Immediate selectable text extraction

KuroScan Engine • Text Recognition completed successfully.`;

    addScannedDocument({
      title: docName.trim() || t('newScanDefaultTitle'),
      pages: capturedPages,
      fileSize: `${(capturedPages.length * 0.7 + 0.3).toFixed(1)} MB`,
      favorite: false,
      tags: ['ML Kit', 'Scan'],
      ocrText: mockExtractedText,
      ocrConfidence: 0.99,
      filterApplied: selectedFilter,
    });

    setIsScannerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white select-none animate-fadeIn">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <LiquidGlassButton
          variant="glass"
          size="icon"
          onClick={() => setIsScannerOpen(false)}
          className="rounded-full bg-black/40"
        >
          <X className="w-5 h-5 text-white" />
        </LiquidGlassButton>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full liquid-glass-pill text-xs font-medium tracking-wide flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {t('scannerTitle')}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LiquidGlassButton
            variant="glass"
            size="icon"
            onClick={() => setFlash(!flash)}
            className={`rounded-full bg-black/40 ${flash ? 'text-amber-300 border-amber-300/40' : 'text-white'}`}
          >
            {flash ? <Zap className="w-5 h-5 fill-amber-300" /> : <ZapOff className="w-5 h-5" />}
          </LiquidGlassButton>
        </div>
      </div>

      {activeStep === 'camera' ? (
        /* CAMERA VIEWFINDER VIEW */
        <div className="relative flex-1 flex flex-col justify-between overflow-hidden">
          {/* Simulated Camera Feed Viewfinder */}
          <div className="absolute inset-0 bg-neutral-950 flex items-center justify-center p-6">
            {/* Dark background pattern */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Document Edge Detection Quadrilateral Overlay (ML Kit simulation) */}
            <div className="relative w-full max-w-sm aspect-[1/1.414] rounded-2xl border-2 border-white/50 flex flex-col justify-between p-4 shadow-[0_0_40px_rgba(255,255,255,0.08)] bg-white/[0.02]">
              {/* Corner Indicators */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg" />

              {/* Animated Scan Line */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-bounce opacity-80" />

              {/* Status Pill */}
              <div className="mx-auto mt-2 px-3 py-1 rounded-full liquid-glass-pill text-[11px] font-medium text-white/90 flex items-center gap-1.5 shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-white animate-spin" />
                {isDetecting ? t('detectingEdges') : t('readyHoldStill')}
              </div>

              {/* Viewfinder helper text */}
              <div className="mx-auto mb-2 text-center text-xs text-white/50 font-medium">
                {t('alignHelper')}
              </div>
            </div>
          </div>

          {/* Bottom Control Bar */}
          <div className="relative z-20 pb-12 pt-6 px-6 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-center gap-5">
            {/* Mode Selector Pill */}
            <div className="flex items-center gap-2 p-1 rounded-full liquid-glass-pill">
              <button
                onClick={() => setAutoCapture(true)}
                className={`text-xs px-3.5 py-1 rounded-full font-medium transition-all ${
                  autoCapture ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                {t('modeAuto')}
              </button>
              <button
                onClick={() => setAutoCapture(false)}
                className={`text-xs px-3.5 py-1 rounded-full font-medium transition-all ${
                  !autoCapture ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                {t('modeManual')}
              </button>
            </div>

            {/* Shutter and Page Trays */}
            <div className="w-full flex items-center justify-around max-w-sm">
              {/* Gallery / Captured thumbnails tray */}
              <div className="w-16 h-16 flex items-center justify-center">
                {capturedPages.length > 0 ? (
                  <button
                    onClick={() => setActiveStep('review')}
                    className="relative w-12 h-14 rounded-lg overflow-hidden border-2 border-white/60 shadow-lg active:scale-95 transition-transform"
                  >
                    <img src={capturedPages[capturedPages.length - 1]} alt="Preview" className="w-full h-full object-cover" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center shadow">
                      {capturedPages.length}
                    </span>
                  </button>
                ) : (
                  <div className="w-12 h-14 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-white/30">
                    <Layers className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* Shutter Button (Apple Liquid Glass Shutter) */}
              <button
                onClick={handleCapturePage}
                className="w-20 h-20 rounded-full border-4 border-white/80 p-1 flex items-center justify-center active:scale-90 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.25)]"
              >
                <div className="w-full h-full rounded-full bg-white active:bg-neutral-300 transition-colors" />
              </button>

              {/* Proceed to Review / Finish Button */}
              <div className="w-16 h-16 flex items-center justify-center">
                {capturedPages.length > 0 ? (
                  <LiquidGlassButton
                    variant="glass"
                    size="icon"
                    onClick={() => setActiveStep('review')}
                    className="rounded-full w-12 h-12 bg-white/10"
                  >
                    <Check className="w-6 h-6 text-white" />
                  </LiquidGlassButton>
                ) : (
                  <div className="w-12 h-12" />
                )}
              </div>
            </div>

            {/* Scanned Pages Count Indicator */}
            <div className="text-xs text-white/50 font-medium">
              {capturedPages.length === 0
                ? t('tapShutterToCapture')
                : `${capturedPages.length} ${capturedPages.length === 1 ? t('pagesScannedSingle') : t('pagesScannedPlural')}`}
            </div>
          </div>
        </div>
      ) : (
        /* REVIEW & FILTER VIEW */
        <div className="relative flex-1 flex flex-col justify-between overflow-y-auto px-6 py-4">
          <div className="space-y-4 max-w-md mx-auto w-full">
            {/* Document Title Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                {t('docNameLabel')}
              </label>
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl liquid-glass text-white font-medium text-base outline-none focus:border-white/40"
                placeholder={t('docNamePlaceholder')}
              />
            </div>

            {/* Scanned Pages Carousel Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                  {t('capturedPages')} ({capturedPages.length})
                </span>
                <button
                  onClick={() => setActiveStep('camera')}
                  className="text-xs text-white/80 flex items-center gap-1 hover:text-white"
                >
                  <Camera className="w-3.5 h-3.5" />
                  {t('addMorePages')}
                </button>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar">
                {capturedPages.map((page, idx) => (
                  <div
                    key={idx}
                    className="relative shrink-0 w-28 aspect-[1/1.4] rounded-xl overflow-hidden border border-white/20 liquid-glass-card shadow-lg"
                  >
                    <img src={page} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded-md bg-black/70 text-white font-medium">
                      {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ML Kit Filters Selector */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                {t('mlKitFilters')}
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'enhanced', label: t('filterEnhanced') },
                  { id: 'bw', label: t('filterBw') },
                  { id: 'grayscale', label: t('filterGrayscale') },
                  { id: 'original', label: t('filterOriginal') },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilter(f.id as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium text-center transition-all ${
                      selectedFilter === f.id
                        ? 'bg-white text-black font-semibold shadow-md'
                        : 'liquid-glass text-white/70 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* OCR Notice */}
            <div className="p-3.5 rounded-2xl liquid-glass-pill flex items-start gap-3 text-xs text-white/80">
              <FileText className="w-5 h-5 text-white shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">{t('ocrNoticeTitle')}</span>
                {t('ocrNoticeDesc')}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 pb-8 max-w-md mx-auto w-full flex items-center gap-3">
            <LiquidGlassButton
              variant="glass"
              className="flex-1 py-3.5 rounded-2xl"
              onClick={() => setActiveStep('camera')}
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              {t('btnRetake')}
            </LiquidGlassButton>

            <LiquidGlassButton
              variant="primary"
              className="flex-1 py-3.5 rounded-2xl font-semibold"
              onClick={handleFinishAndSave}
            >
              {t('btnSaveScan')}
              <ChevronRight className="w-4 h-4 ml-1" />
            </LiquidGlassButton>
          </div>
        </div>
      )}
    </div>
  );
};
