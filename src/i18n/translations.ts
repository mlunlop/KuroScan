export type Language = 'es' | 'en';

export const translations = {
  es: {
    // App Branding
    appName: 'KuroScan',
    appSubtitle: 'Escáner de Documentos',
    engineBadge: 'ML Kit',

    // Home / Dashboard
    searchPlaceholder: 'Buscar por título, contenido u OCR...',
    filterAll: 'Todos',
    filterRecent: 'Recientes',
    filterFavorites: 'Favoritos',
    gridTooltip: 'Vista en cuadrícula',
    listTooltip: 'Vista en lista',
    emptyTitle: 'Sin documentos escaneados',
    emptyDesc: 'Pulsa el botón de la cámara para escanear tu primer documento con Google ML Kit.',
    emptySearchDesc: 'No se encontró ningún resultado para "{query}"',
    scanNow: 'Escanear ahora',
    ocrBadge: 'OCR v2',
    pageCountSingle: 'pág.',
    pageCountPlural: 'págs.',
    pageCountFullSingle: 'página',
    pageCountFullPlural: 'páginas',
    btnExtractText: 'Texto',
    btnShare: 'Compartir',
    btnDelete: 'Eliminar',
    fabScanTooltip: 'Escanear nuevo documento con Google ML Kit',
    deleteConfirm: '¿Deseas eliminar este documento escaneado?',

    // Scanner
    scannerTitle: 'Google ML Kit Scanner',
    detectingEdges: 'Detectando bordes de página...',
    readyHoldStill: 'Listo • Mantén quieto el dispositivo',
    alignHelper: 'Alinea el documento dentro del marco',
    modeAuto: 'Auto-Captura',
    modeManual: 'Manual',
    tapShutterToCapture: 'Toca el obturador para capturar',
    pagesScannedSingle: 'página escaneada',
    pagesScannedPlural: 'páginas escaneadas',
    docNameLabel: 'Nombre del Documento',
    docNamePlaceholder: 'Nombre del archivo...',
    capturedPages: 'Páginas Capturadas',
    addMorePages: 'Añadir más',
    mlKitFilters: 'Filtros Google ML Kit',
    filterEnhanced: 'Color Pro',
    filterBw: 'B/N Doc',
    filterGrayscale: 'Gris',
    filterOriginal: 'Original',
    ocrNoticeTitle: 'Google ML Kit Text Recognition v2',
    ocrNoticeDesc: 'Se extraerá automáticamente el texto en el visor para búsqueda y copiado sin conexión.',
    btnRetake: 'Retomar',
    btnSaveScan: 'Guardar Escaneo',
    newScanDefaultTitle: 'Nuevo Escaneo ML Kit',

    // Viewer
    viewPageIndicator: '{current} / {total}',
    btnOcrAction: 'Extraer Texto (OCR)',
    btnAddPage: 'Añadir página',
    btnSharePdf: 'Compartir PDF',
    deleteDocConfirm: '¿Seguro que deseas eliminar este documento?',
    ocrSheetTitle: 'Google ML Kit Text Recognition v2',
    ocrConfidence: '99% Confianza',
    ocrOfflineNotice: 'Procesamiento On-Device (Sin conexión)',
    ocrSearchPlaceholder: 'Buscar dentro del texto extraído...',
    btnCopyAll: 'Copiar Todo el Texto',
    btnCopied: '¡Copiado al Portapapeles!',
    btnSaveTxt: 'Guardar TXT',

    // Share Modal
    shareHeader: 'Exportar y Compartir',
    ocrLayerReady: 'Capa OCR ML Kit lista',
    fileFormatLabel: 'Formato de Archivo',
    formatPdfOcrTitle: 'PDF con OCR Inteligente (Recomendado)',
    formatPdfOcrDesc: 'Texto seleccionable y copiable. Máxima compatibilidad.',
    formatPdfLightTitle: 'PDF Ligero Comprimido',
    formatPdfLightDesc: 'Optimizado para enviar por WhatsApp o Email.',
    formatImagesTitle: 'Imágenes JPEG en ZIP',
    formatImagesDesc: 'Páginas individuales en alta definición.',
    btnDownload: 'Descargar',
    btnShareAction: 'Compartir',
    btnSharedSuccess: '¡Compartido!',
    shareMessage: 'Documento escaneado con KuroScan ({pages} págs.)',

    // Settings
    settingsTitle: 'Ajustes de KuroScan',
    privacyBadgeTitle: 'Privacidad 100% On-Device',
    privacyBadgeSub: 'Cero Nube',
    privacyBadgeDesc: 'Tus escaneos y el reconocimiento OCR de Google ML Kit se ejecutan 100% en el procesador de tu móvil. No hay servidores, ni rastreadores, ni suscripciones.',
    
    // Settings: Language
    sectionLanguage: 'Idioma / Language',
    interfaceLanguageLabel: 'Idioma de la interfaz',
    interfaceLanguageDesc: 'Español o English (detección automática por país)',
    langEs: 'Español (ES)',
    langEn: 'English (US)',

    // Settings: Scanner
    sectionScanner: 'Motor de Escaneo (Google ML Kit)',
    pdfQualityLabel: 'Calidad de PDF predeterminada',
    pdfQualityDesc: 'Equilibrio entre nitidez y tamaño',
    qualityHigh: 'Alta Fidelidad',
    qualityBalanced: 'Equilibrado',
    qualityCompressed: 'Máxima Compresión',
    autoCropLabel: 'Autocorte de perspectiva 4-puntos',
    autoCropDesc: 'Detecta automáticamente los bordes del papel',

    // Settings: OCR
    sectionOcr: 'Reconocimiento de Texto (OCR v2)',
    ocrLanguageLabel: 'Idioma principal OCR',
    ocrLanguageDesc: 'Google ML Kit Text v2 Latin Model',
    hapticsLabel: 'Respuesta háptica (Vibración)',
    hapticsDesc: 'Feedback táctil al capturar y pulsar',

    // Settings: Storage
    sectionStorage: 'Almacenamiento Local',
    clearCacheLabel: 'Liberar memoria caché',
    clearCacheDesc: 'Archivos temporales del visor',
    btnClearCache: 'Vaciar',
    cacheClearedAlert: 'Caché temporal y miniaturas liberadas con éxito (0 MB)',
    resetDemoLabel: 'Restablecer datos demo',
    resetDemoDesc: 'Carga de nuevo las facturas y contratos de muestra',
    btnResetDemo: 'Restaurar',
    resetConfirm: '¿Deseas restaurar los documentos de demostración iniciales?',

    // Footer
    footerAppInfo: 'KuroScan • Versión 1.0.0 (Capacitor 8 / React 19)',
    footerOpenSource: '100% Gratuito y de Código Abierto • CamScanner Alternative'
  },
  en: {
    // App Branding
    appName: 'KuroScan',
    appSubtitle: 'Document Scanner',
    engineBadge: 'ML Kit',

    // Home / Dashboard
    searchPlaceholder: 'Search by title, content or OCR...',
    filterAll: 'All',
    filterRecent: 'Recent',
    filterFavorites: 'Favorites',
    gridTooltip: 'Grid view',
    listTooltip: 'List view',
    emptyTitle: 'No scanned documents',
    emptyDesc: 'Tap the camera button to scan your first document with Google ML Kit.',
    emptySearchDesc: 'No results found for "{query}"',
    scanNow: 'Scan now',
    ocrBadge: 'OCR v2',
    pageCountSingle: 'page',
    pageCountPlural: 'pages',
    pageCountFullSingle: 'page',
    pageCountFullPlural: 'pages',
    btnExtractText: 'Text',
    btnShare: 'Share',
    btnDelete: 'Delete',
    fabScanTooltip: 'Scan new document with Google ML Kit',
    deleteConfirm: 'Do you want to delete this scanned document?',

    // Scanner
    scannerTitle: 'Google ML Kit Scanner',
    detectingEdges: 'Detecting page edges...',
    readyHoldStill: 'Ready • Hold device steady',
    alignHelper: 'Align document within frame',
    modeAuto: 'Auto-Capture',
    modeManual: 'Manual',
    tapShutterToCapture: 'Tap shutter to capture',
    pagesScannedSingle: 'page scanned',
    pagesScannedPlural: 'pages scanned',
    docNameLabel: 'Document Name',
    docNamePlaceholder: 'File name...',
    capturedPages: 'Captured Pages',
    addMorePages: 'Add more',
    mlKitFilters: 'Google ML Kit Filters',
    filterEnhanced: 'Pro Color',
    filterBw: 'B&W Doc',
    filterGrayscale: 'Grayscale',
    filterOriginal: 'Original',
    ocrNoticeTitle: 'Google ML Kit Text Recognition v2',
    ocrNoticeDesc: 'Text will be automatically extracted in the viewer for offline searching and copying.',
    btnRetake: 'Retake',
    btnSaveScan: 'Save Scan',
    newScanDefaultTitle: 'New ML Kit Scan',

    // Viewer
    viewPageIndicator: '{current} / {total}',
    btnOcrAction: 'Extract Text (OCR)',
    btnAddPage: 'Add page',
    btnSharePdf: 'Share PDF',
    deleteDocConfirm: 'Are you sure you want to delete this document?',
    ocrSheetTitle: 'Google ML Kit Text Recognition v2',
    ocrConfidence: '99% Confidence',
    ocrOfflineNotice: 'On-Device Processing (Offline)',
    ocrSearchPlaceholder: 'Search within extracted text...',
    btnCopyAll: 'Copy All Text',
    btnCopied: 'Copied to Clipboard!',
    btnSaveTxt: 'Save TXT',

    // Share Modal
    shareHeader: 'Export & Share',
    ocrLayerReady: 'ML Kit OCR layer ready',
    fileFormatLabel: 'File Format',
    formatPdfOcrTitle: 'Smart OCR PDF (Recommended)',
    formatPdfOcrDesc: 'Selectable and searchable text. Maximum compatibility.',
    formatPdfLightTitle: 'Compressed Light PDF',
    formatPdfLightDesc: 'Optimized for sending via WhatsApp or Email.',
    formatImagesTitle: 'JPEG Images in ZIP',
    formatImagesDesc: 'Individual pages in high definition.',
    btnDownload: 'Download',
    btnShareAction: 'Share',
    btnSharedSuccess: 'Shared!',
    shareMessage: 'Scanned document with KuroScan ({pages} pages)',

    // Settings
    settingsTitle: 'KuroScan Settings',
    privacyBadgeTitle: '100% On-Device Privacy',
    privacyBadgeSub: 'Zero Cloud',
    privacyBadgeDesc: 'Your scans and Google ML Kit OCR run 100% locally on your device processor. No servers, no trackers, no subscriptions.',

    // Settings: Language
    sectionLanguage: 'Language / Idioma',
    interfaceLanguageLabel: 'App Language',
    interfaceLanguageDesc: 'English or Spanish (auto-detected by country)',
    langEs: 'Español (ES)',
    langEn: 'English (US)',

    // Settings: Scanner
    sectionScanner: 'Scan Engine (Google ML Kit)',
    pdfQualityLabel: 'Default PDF Quality',
    pdfQualityDesc: 'Balance between sharpness and file size',
    qualityHigh: 'High Fidelity',
    qualityBalanced: 'Balanced',
    qualityCompressed: 'Max Compression',
    autoCropLabel: '4-point perspective auto-crop',
    autoCropDesc: 'Automatically detects document paper edges',

    // Settings: OCR
    sectionOcr: 'Text Recognition (OCR v2)',
    ocrLanguageLabel: 'Primary OCR Language',
    ocrLanguageDesc: 'Google ML Kit Text v2 Latin Model',
    hapticsLabel: 'Haptic Feedback (Vibration)',
    hapticsDesc: 'Tactile feedback when capturing and tapping',

    // Settings: Storage
    sectionStorage: 'Local Storage',
    clearCacheLabel: 'Clear Cache',
    clearCacheDesc: 'Temporary cache files from viewer',
    btnClearCache: 'Clear',
    cacheClearedAlert: 'Temporary cache and thumbnails cleared successfully (0 MB)',
    resetDemoLabel: 'Reset Demo Data',
    resetDemoDesc: 'Reload initial sample invoices and contracts',
    btnResetDemo: 'Restore',
    resetConfirm: 'Do you want to restore the initial demo documents?',

    // Footer
    footerAppInfo: 'KuroScan • Version 1.0.0 (Capacitor 8 / React 19)',
    footerOpenSource: '100% Free & Open Source • CamScanner Alternative'
  }
} as const;

export type TranslationKey = keyof typeof translations.es;
