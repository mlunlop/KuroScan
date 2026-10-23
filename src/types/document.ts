export interface ScannedPage {
  id: string;
  uri: string;
  rotation?: number; // 0, 90, 180, 270
}

export interface KuroDocument {
  id: string;
  title: string;
  createdAt: number;
  pages: ScannedPage[];
  pdfUri?: string;
  ocrText?: string;
}
