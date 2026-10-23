import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonBadge,
  IonSpinner,
  IonToast,
  IonIcon,
} from '@ionic/react';
import {
  cameraOutline,
  scanOutline,
  shareOutline,
  copyOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { DocumentScanner } from '@capacitor-mlkit/document-scanner';
import { TextRecognition, Script } from '@capacitor-mlkit/text-recognition';
import { Share } from '@capacitor/share';

interface ScanData {
  scannedImages?: string[];
  pdf?: {
    pageCount: number;
    uri: string;
  };
}

export const TechPreviewHome: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isModuleAvailable, setIsModuleAvailable] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanData | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  useEffect(() => {
    addLog(`Plataforma detectada: ${Capacitor.getPlatform()}`);
    if (Capacitor.isNativePlatform()) {
      checkScannerModule();
    } else {
      addLog('Aviso: Estás en el navegador. ML Kit requiere ejecutarse en Android.');
    }
  }, []);

  const checkScannerModule = async () => {
    try {
      addLog('Comprobando módulo Google Play Document Scanner...');
      const res = await DocumentScanner.isGoogleDocumentScannerModuleAvailable();
      setIsModuleAvailable(res.available);
      addLog(`Módulo disponible en Google Play Services: ${res.available}`);

      if (!res.available) {
        addLog('Iniciando descarga/instalación automática del módulo de escáner...');
        await DocumentScanner.installGoogleDocumentScannerModule();
        addLog('Instalación del módulo solicitada a Google Play.');
      }
    } catch (err: any) {
      addLog(`Error al verificar módulo: ${err?.message || JSON.stringify(err)}`);
    }
  };

  const handleScan = async () => {
    if (!Capacitor.isNativePlatform()) {
      showToast('El escáner nativo solo funciona en Android.');
      addLog('Simulación en Web: Document Scanner requiere dispositivo Android.');
      return;
    }

    setIsScanning(true);
    addLog('Abriendo interfaz de escaneo de Google ML Kit...');

    try {
      const result = await DocumentScanner.scanDocument({
        galleryImportAllowed: true,
        pageLimit: 15,
        resultFormats: 'JPEG_PDF',
        scannerMode: 'FULL',
      });

      addLog(`¡Escaneo exitoso!`);
      if (result.scannedImages) {
        addLog(`Páginas escaneadas: ${result.scannedImages.length}`);
      }
      if (result.pdf) {
        addLog(`PDF generado: ${result.pdf.pageCount} páginas (${result.pdf.uri})`);
      }

      setScanResult(result);
      setOcrText('');
      showToast('Documento escaneado con éxito.');
    } catch (err: any) {
      addLog(`Error o cancelación en escaneo: ${err?.message || JSON.stringify(err)}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleRunOcr = async () => {
    if (!scanResult?.scannedImages || scanResult.scannedImages.length === 0) {
      showToast('Primero debes escanear una página.');
      return;
    }

    const firstImage = scanResult.scannedImages[0];
    setIsOcrProcessing(true);
    addLog(`Iniciando OCR Text Recognition v2 en página 1: ${firstImage}`);

    try {
      const result = await TextRecognition.processImage({
        path: firstImage,
        script: Script.Latin,
      });

      addLog(`OCR completado. Caracteres detectados: ${result.text?.length || 0}`);
      addLog(`Bloques de texto detectados: ${result.blocks?.length || 0}`);
      setOcrText(result.text || 'No se detectó ningún texto en la imagen.');
      showToast('OCR completado correctamente.');
    } catch (err: any) {
      addLog(`Error en OCR: ${err?.message || JSON.stringify(err)}`);
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const handleCopyText = async () => {
    if (!ocrText) return;
    try {
      await navigator.clipboard.writeText(ocrText);
      showToast('Texto copiado al portapapeles.');
      addLog('Texto OCR copiado al portapapeles.');
    } catch (err) {
      showToast('Error al copiar al portapapeles.');
    }
  };

  const handleShare = async () => {
    if (!scanResult) return;

    try {
      if (scanResult.pdf?.uri) {
        addLog(`Compartiendo PDF nativo: ${scanResult.pdf.uri}`);
        await Share.share({
          title: 'Documento KuroScan',
          text: 'Documento escaneado con KuroScan',
          url: scanResult.pdf.uri,
          dialogTitle: 'Compartir PDF escaneado',
        });
      } else if (scanResult.scannedImages?.[0]) {
        addLog(`Compartiendo imagen: ${scanResult.scannedImages[0]}`);
        await Share.share({
          title: 'Documento KuroScan',
          url: scanResult.scannedImages[0],
          dialogTitle: 'Compartir imagen escaneada',
        });
      }
      addLog('Diálogo de compartir abierto correctamente.');
    } catch (err: any) {
      addLog(`Error al compartir: ${err?.message || JSON.stringify(err)}`);
    }
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar style={{ '--background': '#000000', '--color': '#ffffff' } as React.CSSProperties}>
          <IonTitle>KuroScan — Test ML Kit</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#050505', color: '#ffffff' } as React.CSSProperties}>
        <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
          {/* Header Card */}
          <div
            style={{
              padding: '16px',
              borderRadius: '16px',
              backgroundColor: '#121214',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: '700' }}>
                  KuroScan PoC
                </h2>
                <span style={{ fontSize: '0.85rem', color: '#8e8e93' }}>
                  Plataforma: {Capacitor.getPlatform().toUpperCase()}
                </span>
              </div>
              <IonBadge color={Capacitor.isNativePlatform() ? 'success' : 'warning'}>
                {Capacitor.isNativePlatform() ? 'Android Nativo' : 'Web / Preview'}
              </IonBadge>
            </div>

            {Capacitor.isNativePlatform() && (
              <div
                style={{
                  marginTop: '12px',
                  paddingTop: '10px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '0.82rem',
                  color: '#a1a1aa',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <IonIcon
                  icon={isModuleAvailable ? checkmarkCircleOutline : alertCircleOutline}
                  style={{ color: isModuleAvailable ? '#34c759' : '#ff9f0a' }}
                />
                Google Scanner Module:{' '}
                <strong style={{ color: '#ffffff' }}>
                  {isModuleAvailable === null
                    ? 'Verificando...'
                    : isModuleAvailable
                    ? 'Disponible'
                    : 'Descargando'}
                </strong>
              </div>
            )}
          </div>

          {/* Action Button: Scan Document */}
          <IonButton
            expand="block"
            size="large"
            onClick={handleScan}
            disabled={isScanning}
            style={
              {
                '--background': '#ffffff',
                '--color': '#000000',
                '--border-radius': '14px',
                fontWeight: '600',
                marginBottom: '16px',
                height: '52px',
              } as React.CSSProperties
            }
          >
            {isScanning ? (
              <IonSpinner name="crescent" style={{ color: '#000000' }} />
            ) : (
              <>
                <IonIcon slot="start" icon={cameraOutline} />
                Escanear con ML Kit
              </>
            )}
          </IonButton>

          {/* Scan Results Section */}
          {scanResult && (
            <div
              style={{
                backgroundColor: '#121214',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: '600' }}>
                Resultado del Escaneo
              </h3>

              {scanResult.pdf && (
                <div
                  style={{
                    backgroundColor: '#1c1c1e',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    marginBottom: '12px',
                    fontSize: '0.85rem',
                  }}
                >
                  <p style={{ margin: '0 0 4px 0', color: '#ffffff', fontWeight: '500' }}>
                    📄 PDF generado con éxito ({scanResult.pdf.pageCount} páginas)
                  </p>
                  <p
                    style={{
                      margin: 0,
                      color: '#8e8e93',
                      fontSize: '0.75rem',
                      wordBreak: 'break-all',
                    }}
                  >
                    {scanResult.pdf.uri}
                  </p>
                </div>
              )}

              {/* Scanned Images Gallery */}
              {scanResult.scannedImages && scanResult.scannedImages.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#8e8e93' }}>
                    Páginas capturadas ({scanResult.scannedImages.length}):
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      overflowX: 'auto',
                      padding: '8px 0',
                    }}
                  >
                    {scanResult.scannedImages.map((uri, idx) => (
                      <div
                        key={idx}
                        style={{
                          flex: '0 0 110px',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          backgroundColor: '#000000',
                          position: 'relative',
                        }}
                      >
                        <img
                          src={Capacitor.convertFileSrc(uri)}
                          alt={`Página ${idx + 1}`}
                          style={{
                            width: '100%',
                            height: '140px',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '4px',
                            right: '4px',
                            background: 'rgba(0,0,0,0.7)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                          }}
                        >
                          Pág {idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons for result */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <IonButton
                  expand="block"
                  style={
                    {
                      flex: 1,
                      '--background': '#2c2c2e',
                      '--color': '#ffffff',
                      '--border-radius': '10px',
                    } as React.CSSProperties
                  }
                  onClick={handleRunOcr}
                  disabled={isOcrProcessing}
                >
                  {isOcrProcessing ? (
                    <IonSpinner name="dots" />
                  ) : (
                    <>
                      <IonIcon slot="start" icon={scanOutline} />
                      OCR Pág. 1
                    </>
                  )}
                </IonButton>

                <IonButton
                  expand="block"
                  style={
                    {
                      flex: 1,
                      '--background': '#2c2c2e',
                      '--color': '#ffffff',
                      '--border-radius': '10px',
                    } as React.CSSProperties
                  }
                  onClick={handleShare}
                >
                  <IonIcon slot="start" icon={shareOutline} />
                  Compartir
                </IonButton>
              </div>
            </div>
          )}

          {/* OCR Result Box */}
          {ocrText && (
            <div
              style={{
                backgroundColor: '#121214',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600' }}>
                  Texto Reconocido (ML Kit OCR)
                </h3>
                <IonButton
                  fill="clear"
                  size="small"
                  onClick={handleCopyText}
                  style={{ '--color': '#64d2ff', margin: 0 } as React.CSSProperties}
                >
                  <IonIcon slot="start" icon={copyOutline} />
                  Copiar
                </IonButton>
              </div>
              <pre
                style={{
                  backgroundColor: '#000000',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: '#e4e4e7',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  margin: 0,
                }}
              >
                {ocrText}
              </pre>
            </div>
          )}

          {/* Real-time Diagnostics Terminal */}
          <div
            style={{
              backgroundColor: '#0a0a0c',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '14px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: '600' }}>
                TERMINAL DE EVENTOS
              </span>
              <button
                onClick={() => setLogs([])}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#71717a',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  padding: '2px 6px',
                }}
              >
                Limpiar
              </button>
            </div>

            <div
              style={{
                fontFamily: 'Consolas, monospace',
                fontSize: '0.74rem',
                color: '#a1a1aa',
                maxHeight: '180px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              {logs.length === 0 ? (
                <span style={{ color: '#52525b', fontStyle: 'italic' }}>
                  Sin eventos registrados todavía...
                </span>
              ) : (
                logs.map((log, i) => (
                  <div key={i} style={{ wordBreak: 'break-all' }}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage}
          duration={2000}
          onDidDismiss={() => setToastMessage('')}
        />
      </IonContent>
    </IonPage>
  );
};
