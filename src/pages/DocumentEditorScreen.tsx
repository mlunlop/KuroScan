import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonSpinner,
  IonToast,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonAlert,
} from '@ionic/react';
import {
  arrowBackOutline,
  addOutline,
  trashOutline,
  shareOutline,
  copyOutline,
  checkmarkOutline,
  scanOutline,
  chevronBackOutline,
  chevronForwardOutline,
  documentTextOutline,
} from 'ionicons/icons';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { KuroDocument, ScannedPage } from '../types/document';
import { DocumentService } from '../services/documentService';

export const DocumentEditorScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const [document, setDocument] = useState<KuroDocument>({
    id: id || `doc_${Date.now()}`,
    title: `Documento ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`,
    createdAt: Date.now(),
    pages: [],
  });

  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'pages' | 'ocr'>('pages');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [scanMode, setScanMode] = useState<'mlkit' | 'direct'>('mlkit');

  // Initialize document if passed via location state or loaded by ID
  useEffect(() => {
    const state = location.state as
      | { initialPages?: string[]; initialPage?: string; mode?: 'mlkit' | 'direct' }
      | undefined;
    if (state?.mode) {
      setScanMode(state.mode);
    }

    if (id && id !== 'new') {
      DocumentService.getDocuments().then((docs) => {
        const found = docs.find((d) => d.id === id);
        if (found) {
          setDocument(found);
        }
      });
    } else if (state?.initialPages && state.initialPages.length > 0) {
      const scannedPages: ScannedPage[] = state.initialPages.map((uri, idx) => ({
        id: `page_${Date.now()}_${idx}`,
        uri,
      }));
      setDocument((prev) => ({
        ...prev,
        pages: scannedPages,
      }));
    } else if (state?.initialPage) {
      setDocument((prev) => ({
        ...prev,
        pages: [{ id: `page_${Date.now()}`, uri: state.initialPage! }],
      }));
    }
  }, [id, location.state]);

  const showToast = (msg: string) => setToastMessage(msg);

  // Add another page to the document
  const handleAddPage = async () => {
    setIsCapturing(true);
    try {
      const uris = await DocumentService.scanPages(scanMode);
      if (uris.length > 0) {
        const newPages: ScannedPage[] = uris.map((uri, idx) => ({
          id: `page_${Date.now()}_${idx}`,
          uri,
        }));
        setDocument((prev) => {
          const updated = [...prev.pages, ...newPages];
          setActivePageIndex(updated.length - 1);
          return { ...prev, pages: updated };
        });
        showToast(`${newPages.length} página(s) añadida(s).`);
      }
    } catch (err: any) {
      showToast(`Error al capturar: ${err?.message || 'Cancelado'}`);
    } finally {
      setIsCapturing(false);
    }
  };

  // Reorder page Left
  const handleMovePageLeft = () => {
    if (activePageIndex <= 0) return;
    const newPages = [...document.pages];
    const temp = newPages[activePageIndex];
    newPages[activePageIndex] = newPages[activePageIndex - 1];
    newPages[activePageIndex - 1] = temp;
    setDocument((prev) => ({ ...prev, pages: newPages }));
    setActivePageIndex(activePageIndex - 1);
  };

  // Reorder page Right
  const handleMovePageRight = () => {
    if (activePageIndex >= document.pages.length - 1) return;
    const newPages = [...document.pages];
    const temp = newPages[activePageIndex];
    newPages[activePageIndex] = newPages[activePageIndex + 1];
    newPages[activePageIndex + 1] = temp;
    setDocument((prev) => ({ ...prev, pages: newPages }));
    setActivePageIndex(activePageIndex + 1);
  };

  // Delete current active page
  const handleDeleteCurrentPage = () => {
    if (document.pages.length === 0) return;
    const updated = document.pages.filter((_, idx) => idx !== activePageIndex);
    setDocument((prev) => ({ ...prev, pages: updated }));
    setActivePageIndex(Math.max(0, activePageIndex - 1));
    showToast('Página eliminada.');
  };

  // Run OCR on current page
  const handleRunOcr = async () => {
    if (document.pages.length === 0) {
      showToast('No hay páginas para reconocer.');
      return;
    }
    const targetPage = document.pages[activePageIndex];
    setIsOcrLoading(true);
    try {
      const text = await DocumentService.runOcr(targetPage.uri);
      setDocument((prev) => ({
        ...prev,
        ocrText: text,
      }));
      setActiveTab('ocr');
      showToast('Texto OCR extraído.');
    } catch (err: any) {
      showToast(`Error en OCR: ${err?.message || 'Error'}`);
    } finally {
      setIsOcrLoading(false);
    }
  };

  // Save document and compile PDF
  const handleSaveDocument = async () => {
    if (document.pages.length === 0) {
      showToast('Añade al menos una página antes de guardar.');
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const pdfUri = await DocumentService.compilePdf(document.pages, document.title);
      const updatedDoc: KuroDocument = {
        ...document,
        pdfUri,
      };
      await DocumentService.saveDocument(updatedDoc);
      showToast('Documento guardado con éxito.');
      navigate('/home', { replace: true });
    } catch (err: any) {
      showToast(`Error al guardar PDF: ${err?.message || 'Error'}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Share generated PDF
  const handleShare = async () => {
    try {
      let pdfUri = document.pdfUri;
      if (!pdfUri && document.pages.length > 0) {
        setIsGeneratingPdf(true);
        pdfUri = await DocumentService.compilePdf(document.pages, document.title);
        setIsGeneratingPdf(false);
      }

      if (pdfUri) {
        await Share.share({
          title: document.title,
          url: pdfUri,
          dialogTitle: 'Compartir PDF KuroScan',
        });
      } else {
        showToast('Primero genera el documento.');
      }
    } catch (err: any) {
      showToast(`Error al compartir: ${err?.message || 'Cancelado'}`);
    }
  };

  const activePage = document.pages[activePageIndex];

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar
          style={
            {
              '--background': '#000000',
              '--color': '#ffffff',
              '--border-color': 'rgba(255,255,255,0.08)',
            } as React.CSSProperties
          }
        >
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => navigate('/home')}>
              <IonIcon slot="icon-only" icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>

          <input
            value={document.title}
            onChange={(e) => setDocument((prev) => ({ ...prev, title: e.target.value }))}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '1.05rem',
              fontWeight: '600',
              width: '100%',
              textAlign: 'center',
              outline: 'none',
            }}
            placeholder="Título del Documento"
          />

          <IonButtons slot="end">
            <IonButton
              fill="clear"
              onClick={handleSaveDocument}
              disabled={isGeneratingPdf || document.pages.length === 0}
              style={{ fontWeight: '600', color: '#ffffff' }}
            >
              {isGeneratingPdf ? <IonSpinner name="dots" /> : 'Guardar'}
            </IonButton>
          </IonButtons>
        </IonToolbar>

        {/* Apple-style Segmented Control */}
        <div style={{ backgroundColor: '#000000', padding: '4px 16px 10px' }}>
          <IonSegment
            value={activeTab}
            onIonChange={(e) => setActiveTab(e.detail.value as 'pages' | 'ocr')}
            style={
              {
                '--background': '#161618',
                borderRadius: '12px',
              } as React.CSSProperties
            }
          >
            <IonSegmentButton value="pages">
              <IonLabel>Páginas ({document.pages.length})</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="ocr">
              <IonLabel>Texto OCR</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>
      </IonHeader>

      <IonContent
        fullscreen
        style={{ '--background': '#000000', color: '#ffffff' } as React.CSSProperties}
      >
        {activeTab === 'pages' ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100%',
              padding: '12px 16px 90px',
              boxSizing: 'border-box',
            }}
          >
            {/* Main Preview Area */}
            {document.pages.length > 0 && activePage ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  backgroundColor: '#0a0a0c',
                  borderRadius: '18px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  minHeight: '340px',
                  maxHeight: '55vh',
                }}
              >
                <img
                  src={
                    Capacitor.isNativePlatform()
                      ? Capacitor.convertFileSrc(activePage.uri)
                      : activePage.uri
                  }
                  alt={`Página ${activePageIndex + 1}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />

                {/* Badge of active page */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(8px)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  Pág. {activePageIndex + 1} de {document.pages.length}
                </div>

                {/* Page Navigation Overlay Buttons */}
                {activePageIndex > 0 && (
                  <button
                    onClick={handleMovePageLeft}
                    style={{
                      position: 'absolute',
                      left: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.65)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <IonIcon icon={chevronBackOutline} />
                  </button>
                )}

                {activePageIndex < document.pages.length - 1 && (
                  <button
                    onClick={handleMovePageRight}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.65)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <IonIcon icon={chevronForwardOutline} />
                  </button>
                )}
              </div>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '280px',
                  backgroundColor: '#0d0d0f',
                  borderRadius: '16px',
                  border: '1px dashed rgba(255,255,255,0.15)',
                }}
              >
                <IonIcon icon={documentTextOutline} style={{ fontSize: '3rem', color: '#52525b' }} />
                <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginTop: '8px' }}>
                  Aún no hay páginas en este documento.
                </p>
              </div>
            )}

            {/* Quick Actions Bar for Active Page */}
            {document.pages.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  margin: '12px 0',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleMovePageLeft}
                    disabled={activePageIndex === 0}
                    style={{
                      backgroundColor: '#161618',
                      color: activePageIndex === 0 ? '#52525b' : '#ffffff',
                      border: '1px solid rgba(255,255,255,0.08)',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    ↶ Mover Izq
                  </button>
                  <button
                    onClick={handleMovePageRight}
                    disabled={activePageIndex >= document.pages.length - 1}
                    style={{
                      backgroundColor: '#161618',
                      color:
                        activePageIndex >= document.pages.length - 1 ? '#52525b' : '#ffffff',
                      border: '1px solid rgba(255,255,255,0.08)',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    ↷ Mover Der
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleRunOcr}
                    disabled={isOcrLoading}
                    style={{
                      backgroundColor: '#161618',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.1)',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {isOcrLoading ? (
                      <IonSpinner name="dots" />
                    ) : (
                      <>
                        <IonIcon icon={scanOutline} />
                        OCR
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowDeleteAlert(true)}
                    style={{
                      backgroundColor: 'rgba(255, 69, 58, 0.15)',
                      color: '#ff453a',
                      border: '1px solid rgba(255, 69, 58, 0.3)',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    <IonIcon icon={trashOutline} />
                  </button>
                </div>
              </div>
            )}

            {/* Horizontal Thumbnails Carousel */}
            <div style={{ marginTop: '4px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <span style={{ fontSize: '0.8rem', color: '#8e8e93', fontWeight: '500' }}>
                  Todas las páginas:
                </span>
                <span style={{ fontSize: '0.75rem', color: '#71717a' }}>
                  Toca para seleccionar
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  overflowX: 'auto',
                  padding: '4px 2px 10px',
                }}
              >
                {document.pages.map((page, idx) => (
                  <div
                    key={page.id}
                    onClick={() => setActivePageIndex(idx)}
                    style={{
                      flex: '0 0 76px',
                      height: '105px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border:
                        idx === activePageIndex
                          ? '2px solid #ffffff'
                          : '1px solid rgba(255, 255, 255, 0.12)',
                      backgroundColor: '#121214',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={
                        Capacitor.isNativePlatform()
                          ? Capacitor.convertFileSrc(page.uri)
                          : page.uri
                      }
                      alt={`Pág ${idx + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '4px',
                        right: '4px',
                        background: 'rgba(0,0,0,0.7)',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                      }}
                    >
                      {idx + 1}
                    </div>
                  </div>
                ))}

                {/* Add Page Card Button */}
                <div
                  onClick={handleAddPage}
                  style={{
                    flex: '0 0 76px',
                    height: '105px',
                    borderRadius: '10px',
                    border: '1px dashed rgba(255, 255, 255, 0.25)',
                    backgroundColor: '#161618',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {isCapturing ? (
                    <IonSpinner name="crescent" style={{ width: '24px', height: '24px' }} />
                  ) : (
                    <>
                      <IonIcon icon={addOutline} style={{ fontSize: '1.5rem', color: '#ffffff' }} />
                      <span style={{ fontSize: '0.7rem', color: '#a1a1aa' }}>Añadir</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* OCR Tab */
          <div style={{ padding: '16px 16px 90px' }}>
            <div
              style={{
                backgroundColor: '#121214',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 2px', fontSize: '1rem', fontWeight: '600' }}>
                    Texto Reconocido
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#8e8e93' }}>
                    Google ML Kit Text Recognition v2 (Offline)
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleRunOcr}
                    disabled={isOcrLoading}
                    style={{
                      backgroundColor: '#2c2c2e',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    {isOcrLoading ? 'Leyendo...' : 'Re-analizar'}
                  </button>

                  {document.ocrText && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(document.ocrText!);
                        showToast('Texto copiado al portapapeles.');
                      }}
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      <IonIcon icon={copyOutline} />
                      Copiar
                    </button>
                  )}
                </div>
              </div>

              {document.ocrText ? (
                <pre
                  style={{
                    backgroundColor: '#000000',
                    padding: '14px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: '#e4e4e7',
                    margin: 0,
                    maxHeight: '400px',
                    overflowY: 'auto',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {document.ocrText}
                </pre>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#71717a' }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem' }}>
                    Pulsa para extraer el texto de la página {activePageIndex + 1}.
                  </p>
                  <button
                    onClick={handleRunOcr}
                    disabled={isOcrLoading}
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '10px 16px',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    {isOcrLoading ? 'Procesando con ML Kit...' : 'Extraer texto de esta página'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Floating Apple-style Action Bar */}
        <div
          style={{
            position: 'fixed',
            bottom: '16px',
            left: '16px',
            right: '16px',
            display: 'flex',
            gap: '10px',
            zIndex: 100,
          }}
        >
          <button
            onClick={handleAddPage}
            disabled={isCapturing}
            style={{
              flex: 1,
              height: '50px',
              backgroundColor: '#1c1c1e',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '14px',
              fontWeight: '600',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backdropFilter: 'blur(12px)',
              cursor: 'pointer',
            }}
          >
            {isCapturing ? (
              <IonSpinner name="dots" />
            ) : (
              <>
                <IonIcon icon={addOutline} style={{ fontSize: '1.2rem' }} />
                Añadir Página
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            style={{
              height: '50px',
              padding: '0 18px',
              backgroundColor: '#1c1c1e',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(12px)',
              cursor: 'pointer',
            }}
          >
            <IonIcon icon={shareOutline} style={{ fontSize: '1.2rem' }} />
          </button>

          <button
            onClick={handleSaveDocument}
            disabled={isGeneratingPdf || document.pages.length === 0}
            style={{
              flex: 1.2,
              height: '50px',
              backgroundColor: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: '14px',
              fontWeight: '600',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            {isGeneratingPdf ? (
              <IonSpinner name="crescent" style={{ color: '#000000' }} />
            ) : (
              <>
                <IonIcon icon={checkmarkOutline} style={{ fontSize: '1.2rem' }} />
                Guardar PDF
              </>
            )}
          </button>
        </div>

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Eliminar Página"
          message={`¿Seguro que deseas eliminar la página ${activePageIndex + 1}?`}
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Eliminar',
              role: 'destructive',
              handler: handleDeleteCurrentPage,
            },
          ]}
        />

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
