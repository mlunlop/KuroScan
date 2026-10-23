import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
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
import Aurora from '../components/Aurora/Aurora';
import GlassSurface from '../components/GlassSurface/GlassSurface';

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

  useEffect(() => {
    const state = location.state as
      | { initialPages?: string[]; initialPage?: string; mode?: 'mlkit' | 'direct' }
      | undefined;

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

  // Add another page to the document with Google ML Kit
  const handleAddPage = async () => {
    setIsCapturing(true);
    try {
      const uris = await DocumentService.scanPages('mlkit');
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

  const handleMovePageLeft = () => {
    if (activePageIndex <= 0) return;
    const newPages = [...document.pages];
    const temp = newPages[activePageIndex];
    newPages[activePageIndex] = newPages[activePageIndex - 1];
    newPages[activePageIndex - 1] = temp;
    setDocument((prev) => ({ ...prev, pages: newPages }));
    setActivePageIndex(activePageIndex - 1);
  };

  const handleMovePageRight = () => {
    if (activePageIndex >= document.pages.length - 1) return;
    const newPages = [...document.pages];
    const temp = newPages[activePageIndex];
    newPages[activePageIndex] = newPages[activePageIndex + 1];
    newPages[activePageIndex + 1] = temp;
    setDocument((prev) => ({ ...prev, pages: newPages }));
    setActivePageIndex(activePageIndex + 1);
  };

  const handleDeleteCurrentPage = () => {
    if (document.pages.length === 0) return;
    const updated = document.pages.filter((_, idx) => idx !== activePageIndex);
    setDocument((prev) => ({ ...prev, pages: updated }));
    setActivePageIndex(Math.max(0, activePageIndex - 1));
    showToast('Página eliminada.');
  };

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
      <IonHeader translucent className="ion-no-border">
        <IonToolbar
          style={
            {
              '--background': 'transparent',
              '--color': '#ffffff',
            } as React.CSSProperties
          }
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 14px',
              gap: '10px',
            }}
          >
            {/* Liquid Glass Back Button */}
            <GlassSurface
              width={38}
              height={38}
              borderRadius={19}
              backgroundOpacity={0.12}
              onClick={() => navigate('/home')}
            >
              <IonIcon icon={arrowBackOutline} style={{ fontSize: '1.2rem', color: '#ffffff' }} />
            </GlassSurface>

            {/* Editable Title */}
            <input
              value={document.title}
              onChange={(e) => setDocument((prev) => ({ ...prev, title: e.target.value }))}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: '600',
                letterSpacing: '-0.02em',
                textAlign: 'center',
                outline: 'none',
              }}
              placeholder="Título del Documento"
            />

            {/* Liquid Glass Save Header Button */}
            <GlassSurface
              width={82}
              height={36}
              borderRadius={18}
              backgroundOpacity={0.16}
              onClick={handleSaveDocument}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#ffffff' }}>
                {isGeneratingPdf ? <IonSpinner name="dots" style={{ width: '18px', height: '18px' }} /> : 'Guardar'}
              </span>
            </GlassSurface>
          </div>
        </IonToolbar>

        {/* Monochromatic Segmented Control */}
        <div style={{ padding: '0 16px 8px' }}>
          <IonSegment
            value={activeTab}
            onIonChange={(e) => setActiveTab(e.detail.value as 'pages' | 'ocr')}
            style={
              {
                '--background': 'rgba(255, 255, 255, 0.05)',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              } as React.CSSProperties
            }
          >
            <IonSegmentButton value="pages">
              <IonLabel style={{ fontWeight: '500' }}>Páginas ({document.pages.length})</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="ocr">
              <IonLabel style={{ fontWeight: '500' }}>Texto OCR</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>
      </IonHeader>

      <IonContent
        fullscreen
        style={{ '--background': '#000000', color: '#ffffff' } as React.CSSProperties}
      >
        {/* Subtle Ambient Aurora in upper editor area */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '260px',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <Aurora
            colorStops={['#141416', '#222226', '#303036', '#141416']}
            amplitude={0.7}
            blend={0.7}
            speed={0.4}
            glow={0.4}
            height={0.5}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.8) 75%, #000000 100%)',
            }}
          />
        </div>

        {activeTab === 'pages' ? (
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100%',
              padding: '6px 16px 110px',
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
                  backgroundColor: 'rgba(9, 9, 11, 0.85)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '22px',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  overflow: 'hidden',
                  minHeight: '340px',
                  maxHeight: '52vh',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7)',
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

                {/* Page Number Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    padding: '4px 10px',
                    borderRadius: '9px',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                  }}
                >
                  Pág. {activePageIndex + 1} de {document.pages.length}
                </div>

                {/* Navigation Pills */}
                {activePageIndex > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  >
                    <GlassSurface
                      width={38}
                      height={38}
                      borderRadius={19}
                      backgroundOpacity={0.2}
                      onClick={handleMovePageLeft}
                    >
                      <IonIcon icon={chevronBackOutline} style={{ fontSize: '1.2rem', color: '#ffffff' }} />
                    </GlassSurface>
                  </div>
                )}

                {activePageIndex < document.pages.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  >
                    <GlassSurface
                      width={38}
                      height={38}
                      borderRadius={19}
                      backgroundOpacity={0.2}
                      onClick={handleMovePageRight}
                    >
                      <IonIcon icon={chevronForwardOutline} style={{ fontSize: '1.2rem', color: '#ffffff' }} />
                    </GlassSurface>
                  </div>
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
                  backgroundColor: '#0a0a0c',
                  borderRadius: '20px',
                  border: '1px dashed rgba(255,255,255,0.12)',
                }}
              >
                <IonIcon icon={documentTextOutline} style={{ fontSize: '3rem', color: '#52525b' }} />
                <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginTop: '10px' }}>
                  Sin páginas aún.
                </p>
              </div>
            )}

            {/* Quick Actions Row */}
            {document.pages.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  margin: '12px 0 6px',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleMovePageLeft}
                    disabled={activePageIndex === 0}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: activePageIndex === 0 ? '#52525b' : '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '7px 12px',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    ↶ Mover Izq
                  </button>
                  <button
                    onClick={handleMovePageRight}
                    disabled={activePageIndex >= document.pages.length - 1}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color:
                        activePageIndex >= document.pages.length - 1 ? '#52525b' : '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '7px 12px',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      fontWeight: '500',
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
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      padding: '7px 12px',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    {isOcrLoading ? (
                      <IonSpinner name="dots" style={{ width: '16px', height: '16px' }} />
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
                      backgroundColor: 'rgba(255, 69, 58, 0.12)',
                      color: '#ff453a',
                      border: '1px solid rgba(255, 69, 58, 0.25)',
                      padding: '7px 11px',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <IonIcon icon={trashOutline} />
                  </button>
                </div>
              </div>
            )}

            {/* Horizontal Page Thumbnails */}
            <div style={{ marginTop: '6px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <span style={{ fontSize: '0.82rem', color: '#a1a1aa', fontWeight: '500' }}>
                  Carrusel de páginas:
                </span>
                <span style={{ fontSize: '0.74rem', color: '#71717a' }}>
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
                      height: '104px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border:
                        idx === activePageIndex
                          ? '2px solid #ffffff'
                          : '1px solid rgba(255, 255, 255, 0.12)',
                      backgroundColor: '#121214',
                      cursor: 'pointer',
                      position: 'relative',
                      boxShadow:
                        idx === activePageIndex ? '0 0 14px rgba(255, 255, 255, 0.2)' : 'none',
                      transition: 'border-color 0.15s ease',
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
                        background: 'rgba(0,0,0,0.75)',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: '600',
                      }}
                    >
                      {idx + 1}
                    </div>
                  </div>
                ))}

                {/* Add Page Button */}
                <div
                  onClick={handleAddPage}
                  style={{
                    flex: '0 0 76px',
                    height: '104px',
                    borderRadius: '12px',
                    border: '1px dashed rgba(255, 255, 255, 0.25)',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {isCapturing ? (
                    <IonSpinner name="crescent" style={{ width: '22px', height: '22px' }} />
                  ) : (
                    <>
                      <IonIcon icon={addOutline} style={{ fontSize: '1.4rem', color: '#ffffff' }} />
                      <span style={{ fontSize: '0.72rem', color: '#a1a1aa', fontWeight: '500' }}>
                        Añadir
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* OCR Tab */
          <div style={{ position: 'relative', zIndex: 1, padding: '16px 16px 110px' }}>
            <div
              style={{
                backgroundColor: 'rgba(12, 12, 14, 0.8)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                padding: '18px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px',
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: '0 0 2px',
                      fontSize: '1.05rem',
                      fontWeight: '700',
                      letterSpacing: '-0.02em',
                      color: '#ffffff',
                    }}
                  >
                    Texto Reconocido
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                    Google ML Kit OCR (En dispositivo)
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleRunOcr}
                    disabled={isOcrLoading}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: '500',
                    }}
                  >
                    {isOcrLoading ? 'Leyendo...' : 'Re-analizar'}
                  </button>

                  {document.ocrText && (
                    <GlassSurface
                      width={80}
                      height={32}
                      borderRadius={16}
                      backgroundOpacity={0.15}
                      onClick={() => {
                        navigator.clipboard.writeText(document.ocrText!);
                        showToast('Texto copiado al portapapeles.');
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                        }}
                      >
                        <IonIcon icon={copyOutline} />
                        Copiar
                      </div>
                    </GlassSurface>
                  )}
                </div>
              </div>

              {document.ocrText ? (
                <pre
                  style={{
                    backgroundColor: '#000000',
                    padding: '16px',
                    borderRadius: '14px',
                    fontSize: '0.86rem',
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
                <div style={{ textAlign: 'center', padding: '36px 12px', color: '#a1a1aa' }}>
                  <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem' }}>
                    Extrae el texto de la página {activePageIndex + 1} para copiarlo libremente.
                  </p>
                  <GlassSurface
                    width={220}
                    height={46}
                    borderRadius={23}
                    backgroundOpacity={0.16}
                    onClick={handleRunOcr}
                    style={{ margin: '0 auto' }}
                  >
                    <span style={{ fontSize: '0.86rem', fontWeight: '600', color: '#ffffff' }}>
                      {isOcrLoading ? 'Procesando con ML Kit...' : 'Extraer texto de esta página'}
                    </span>
                  </GlassSurface>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating Liquid Glass Bottom Bar (Opal Style) */}
        <div
          style={{
            position: 'fixed',
            bottom: '18px',
            left: '16px',
            right: '16px',
            display: 'flex',
            gap: '10px',
            zIndex: 100,
            alignItems: 'center',
          }}
        >
          {/* Add Page Button */}
          <div style={{ flex: 1 }}>
            <GlassSurface
              width="100%"
              height={54}
              borderRadius={27}
              backgroundOpacity={0.14}
              distortionScale={-160}
              onClick={handleAddPage}
            >
              {isCapturing ? (
                <IonSpinner name="dots" style={{ color: '#ffffff' }} />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                  }}
                >
                  <IonIcon icon={addOutline} style={{ fontSize: '1.25rem' }} />
                  Añadir Página
                </div>
              )}
            </GlassSurface>
          </div>

          {/* Share Button */}
          <div style={{ width: '54px' }}>
            <GlassSurface
              width={54}
              height={54}
              borderRadius={27}
              backgroundOpacity={0.14}
              distortionScale={-160}
              onClick={handleShare}
            >
              <IonIcon icon={shareOutline} style={{ fontSize: '1.25rem', color: '#ffffff' }} />
            </GlassSurface>
          </div>

          {/* Guardar PDF Button */}
          <div style={{ flex: 1.2 }}>
            <GlassSurface
              width="100%"
              height={54}
              borderRadius={27}
              backgroundOpacity={0.25}
              distortionScale={-180}
              onClick={handleSaveDocument}
              style={{
                boxShadow: '0 0 20px rgba(255, 255, 255, 0.12)',
              }}
            >
              {isGeneratingPdf ? (
                <IonSpinner name="crescent" style={{ color: '#ffffff', width: '20px', height: '20px' }} />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '0.92rem',
                  }}
                >
                  <IonIcon icon={checkmarkOutline} style={{ fontSize: '1.25rem' }} />
                  Guardar PDF
                </div>
              )}
            </GlassSurface>
          </div>
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
