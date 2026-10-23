import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { DocumentScanner } from '@capacitor-mlkit/document-scanner';
import { TextRecognition, Script } from '@capacitor-mlkit/text-recognition';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { PDFDocument } from 'pdf-lib';
import { KuroDocument, ScannedPage } from '../types/document';

const STORAGE_KEY = 'kuroscan_documents_v1';

export class DocumentService {
  /**
   * Scans document pages.
   * Mode 'mlkit': Uses Google ML Kit Document Scanner (real AI edge detection, perspective correction, desk/background removal).
   * Mode 'direct': Uses standard device camera.
   */
  static async scanPages(mode: 'mlkit' | 'direct' = 'mlkit'): Promise<string[]> {
    if (mode === 'mlkit') {
      if (!Capacitor.isNativePlatform()) {
        throw new Error('ML Kit Document Scanner solo funciona en Android.');
      }
      try {
        const result = await DocumentScanner.scanDocument({
          galleryImportAllowed: true,
          pageLimit: 20,
          resultFormats: 'JPEG',
          scannerMode: 'FULL',
        });
        return result.scannedImages || [];
      } catch (err: any) {
        if (err?.message?.includes('cancel') || err?.message?.includes('Cancel') || err?.code === '1') {
          return [];
        }
        throw err;
      }
    } else {
      try {
        const photo = await Camera.getPhoto({
          quality: 92,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Camera,
        });
        const uri = photo.path || photo.webPath;
        return uri ? [uri] : [];
      } catch (err: any) {
        if (err?.message?.includes('User cancelled') || err?.message?.includes('cancel')) {
          return [];
        }
        throw err;
      }
    }
  }

  /**
   * Runs offline OCR on a page using Google ML Kit Text Recognition v2
   */
  static async runOcr(imageUri: string): Promise<string> {
    if (!Capacitor.isNativePlatform()) {
      return 'Texto OCR de prueba (En navegador web no se ejecuta ML Kit). En Android leerá el texto del folio escaneado.';
    }
    const result = await TextRecognition.processImage({
      path: imageUri,
      script: Script.Latin,
    });
    return result.text || '';
  }

  /**
   * Compiles multiple scanned pages into a single PDF document using pdf-lib
   */
  static async compilePdf(pages: ScannedPage[], docTitle: string): Promise<string> {
    if (pages.length === 0) {
      throw new Error('No hay páginas para generar el PDF.');
    }

    const pdfDoc = await PDFDocument.create();

    for (const page of pages) {
      try {
        const imageBytes = await this.fetchImageBytes(page.uri);
        let embeddedImage;
        try {
          embeddedImage = await pdfDoc.embedJpg(imageBytes);
        } catch {
          embeddedImage = await pdfDoc.embedPng(imageBytes);
        }

        const pdfPage = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
        pdfPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: embeddedImage.width,
          height: embeddedImage.height,
        });
      } catch (err) {
        console.error('Error procesando imagen para PDF:', err);
      }
    }

    const pdfBytes = await pdfDoc.save();
    const base64Data = this.arrayBufferToBase64(pdfBytes);
    const sanitizedTitle = docTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${sanitizedTitle}_${Date.now()}.pdf`;

    if (Capacitor.isNativePlatform()) {
      const saved = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
      });
      return saved.uri;
    } else {
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      return URL.createObjectURL(blob);
    }
  }

  static async getDocuments(): Promise<KuroDocument[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static async saveDocument(doc: KuroDocument): Promise<void> {
    const list = await this.getDocuments();
    const index = list.findIndex((d) => d.id === doc.id);
    if (index >= 0) {
      list[index] = doc;
    } else {
      list.unshift(doc);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  static async deleteDocument(id: string): Promise<void> {
    const list = await this.getDocuments();
    const filtered = list.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  private static async fetchImageBytes(uri: string): Promise<Uint8Array> {
    const src = Capacitor.isNativePlatform() ? Capacitor.convertFileSrc(uri) : uri;
    const response = await fetch(src);
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }

  private static arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}
