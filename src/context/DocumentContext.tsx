import React, { createContext, useContext, useState, useEffect } from 'react';
import { ScannedDocument, AppSettings } from '../types/document';
import { INITIAL_DOCUMENTS } from '../mock/documents';

interface DocumentContextType {
  documents: ScannedDocument[];
  filteredDocuments: ScannedDocument[];
  activeDocument: ScannedDocument | null;
  setActiveDocument: (doc: ScannedDocument | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilter: 'all' | 'recent' | 'favorites';
  setActiveFilter: (filter: 'all' | 'recent' | 'favorites') => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  
  // Modals visibility
  isScannerOpen: boolean;
  setIsScannerOpen: (open: boolean) => void;
  isViewerOpen: boolean;
  setIsViewerOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isShareOpen: boolean;
  setIsShareOpen: (open: boolean) => void;
  isOcrSheetOpen: boolean;
  setIsOcrSheetOpen: (open: boolean) => void;

  // Document Operations
  addScannedDocument: (doc: Omit<ScannedDocument, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteDocument: (id: string) => void;
  toggleFavorite: (id: string) => void;
  renameDocument: (id: string, newTitle: string) => void;
  
  // App Settings
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  defaultPdfQuality: 'balanced',
  defaultOcrLanguage: 'es',
  autoCropEnabled: true,
  autoOrientEnabled: true,
  hapticsEnabled: true,
  cloudSync: false,
};

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<ScannedDocument[]>(() => {
    const saved = localStorage.getItem('kuroscan_documents');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_DOCUMENTS;
      }
    }
    return INITIAL_DOCUMENTS;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('kuroscan_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [activeDocument, setActiveDocument] = useState<ScannedDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'recent' | 'favorites'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isOcrSheetOpen, setIsOcrSheetOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('kuroscan_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('kuroscan_settings', JSON.stringify(settings));
  }, [settings]);

  // Document management actions
  const addScannedDocument = (docData: Omit<ScannedDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const formattedDate = `Hoy, ${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    const newDoc: ScannedDocument = {
      ...docData,
      id: `doc-${Date.now()}`,
      createdAt: formattedDate,
      updatedAt: formattedDate,
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setActiveDocument(newDoc);
    setIsViewerOpen(true);
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (activeDocument?.id === id) {
      setActiveDocument(null);
      setIsViewerOpen(false);
      setIsShareOpen(false);
    }
  };

  const toggleFavorite = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, favorite: !d.favorite } : d))
    );
    if (activeDocument?.id === id) {
      setActiveDocument((prev) => (prev ? { ...prev, favorite: !prev.favorite } : null));
    }
  };

  const renameDocument = (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, title: newTitle.trim() } : d))
    );
    if (activeDocument?.id === id) {
      setActiveDocument((prev) => (prev ? { ...prev, title: newTitle.trim() } : null));
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Filtered documents list
  const filteredDocuments = documents.filter((doc) => {
    // Search match
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.ocrText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'favorites') return doc.favorite;
    if (activeFilter === 'recent') {
      return doc.createdAt.includes('Hoy') || doc.createdAt.includes('Ayer');
    }
    return true;
  });

  return (
    <DocumentContext.Provider
      value={{
        documents,
        filteredDocuments,
        activeDocument,
        setActiveDocument,
        searchQuery,
        setSearchQuery,
        activeFilter,
        setActiveFilter,
        viewMode,
        setViewMode,
        isScannerOpen,
        setIsScannerOpen,
        isViewerOpen,
        setIsViewerOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        isShareOpen,
        setIsShareOpen,
        isOcrSheetOpen,
        setIsOcrSheetOpen,
        addScannedDocument,
        deleteDocument,
        toggleFavorite,
        renameDocument,
        settings,
        updateSettings,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};
