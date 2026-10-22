export interface ScannedDocument {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  pages: string[];
  fileSize: string;
  favorite: boolean;
  tags: string[];
  ocrText: string;
  ocrConfidence?: number;
  filterApplied?: 'original' | 'enhanced' | 'bw' | 'grayscale';
}

export interface AppSettings {
  defaultPdfQuality: 'high' | 'balanced' | 'compressed';
  defaultOcrLanguage: 'es' | 'en' | 'fr' | 'de' | 'it';
  autoCropEnabled: boolean;
  autoOrientEnabled: boolean;
  hapticsEnabled: boolean;
  cloudSync: boolean; // Always false for KuroScan (100% on-device guarantee)
}
