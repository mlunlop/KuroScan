import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonSpinner,
  IonToast,
  IonAlert,
  IonActionSheet,
} from '@ionic/react';
import {
  cameraOutline,
  documentTextOutline,
  trashOutline,
  shareOutline,
  ellipsisVerticalOutline,
  timeOutline,
  sparklesOutline,
} from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { KuroDocument } from '../types/document';
import { DocumentService } from '../services/documentService';
import Aurora from '../components/Aurora/Aurora';
import GlassSurface from '../components/GlassSurface/GlassSurface';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<KuroDocument[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [selectedDoc, setSelectedDoc] = useState<KuroDocument | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const loadDocuments = async () => {
    const list = await DocumentService.getDocuments();
    setDocuments(list);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const showToast = (msg: string) => setToastMessage(msg);

  // Trigger scanning flow: Launches Google ML Kit Document Scanner
  const handleStartScanning = async () => {
    setIsCapturing(true);
    try {
      const pages = await DocumentService.scanPages('mlkit');
      if (pages.length > 0) {
        navigate('/editor/new', {
          state: {
            initialPages: pages,
            mode: 'mlkit',
          },
        });
      }
    } catch (err: any) {
      showToast(`Error al escanear: ${err?.message || 'Cancelado'}`);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!selectedDoc) return;
    await DocumentService.deleteDocument(selectedDoc.id);
    await loadDocuments();
    showToast('Documento eliminado.');
    setSelectedDoc(null);
  };

  const handleShareDocument = async () => {
    if (!selectedDoc) return;
    try {
      let pdfUri = selectedDoc.pdfUri;
      if (!pdfUri && selectedDoc.pages.length > 0) {
        pdfUri = await DocumentService.compilePdf(selectedDoc.pages, selectedDoc.title);
      }
      if (pdfUri) {
        await Share.share({
          title: selectedDoc.title,
          url: pdfUri,
          dialogTitle: 'Compartir PDF KuroScan',
        });
      }
    } catch (err: any) {
      showToast(`Error al compartir: ${err?.message || 'Cancelado'}`);
    }
  };

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
              padding: '6px 16px',
            }}
          >
            {/* Opal / Graphite Brand Identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '9px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(255, 255, 255, 0.25)',
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '3px',
                    backgroundColor: '#000000',
                  }}
                />
              </div>
              <IonTitle
                style={{
                  padding: 0,
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  letterSpacing: '-0.03em',
                  color: '#ffffff',
                }}
              >
                KuroScan
              </IonTitle>
            </div>

            {/* Monochromatic Status Pill */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                color: '#d4d4d8',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '500',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 8px #ffffff',
                }}
              />
              Google ML Kit
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent
        fullscreen
        style={{ '--background': '#000000', color: '#ffffff' } as React.CSSProperties}
      >
        {/* Monochromatic Ambient Aurora Background (Opal/Graphite Style) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '380px',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <Aurora
            colorStops={['#1c1c20', '#2a2a32', '#3e3e48', '#1c1c20']}
            amplitude={0.8}
            blend={0.65}
            speed={0.45}
            glow={0.5}
            height={0.55}
          />

          {/* Smooth Fade Gradient to pure OLED black */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.7) 70%, #000000 100%)',
            }}
          />
        </div>

        {/* Foreground Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '16px 18px 120px',
            maxWidth: '640px',
            margin: '0 auto',
          }}
        >
          {/* Header Title Section */}
          <div style={{ marginTop: '8px', marginBottom: '22px' }}>
            <h1
              style={{
                margin: '0 0 4px',
                fontSize: '1.65rem',
                fontWeight: '700',
                letterSpacing: '-0.035em',
                color: '#ffffff',
              }}
            >
              Documentos
            </h1>
            <p
              style={{
                margin: 0,
                color: '#a1a1aa',
                fontSize: '0.85rem',
                fontWeight: '400',
              }}
            >
              {documents.length} {documents.length === 1 ? 'documento' : 'documentos'} escaneados
            </p>
          </div>

          {/* Document List */}
          {documents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {documents.map((doc) => {
                const firstPage = doc.pages[0];
                return (
                  <div
                    key={doc.id}
                    onClick={() => navigate(`/editor/${doc.id}`)}
                    style={{
                      backgroundColor: 'rgba(12, 12, 14, 0.75)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.09)',
                      borderRadius: '18px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease, border-color 0.15s ease',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: '56px',
                        height: '74px',
                        borderRadius: '11px',
                        overflow: 'hidden',
                        backgroundColor: '#18181b',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        flexShrink: 0,
                        position: 'relative',
                      }}
                    >
                      {firstPage ? (
                        <img
                          src={
                            Capacitor.isNativePlatform()
                              ? Capacitor.convertFileSrc(firstPage.uri)
                              : firstPage.uri
                          }
                          alt={doc.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <IonIcon icon={documentTextOutline} style={{ color: '#71717a' }} />
                        </div>
                      )}
                    </div>

                    {/* Document Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          margin: '0 0 5px',
                          fontSize: '1.02rem',
                          fontWeight: '600',
                          color: '#ffffff',
                          letterSpacing: '-0.02em',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {doc.title}
                      </h3>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#a1a1aa',
                          fontSize: '0.78rem',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <IonIcon icon={timeOutline} style={{ fontSize: '0.85rem' }} />
                          {new Date(doc.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                        <span>•</span>
                        <span>
                          {doc.pages.length} {doc.pages.length === 1 ? 'página' : 'páginas'}
                        </span>
                        {doc.ocrText && (
                          <>
                            <span>•</span>
                            <span
                              style={{
                                color: '#ffffff',
                                fontWeight: '600',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                              }}
                            >
                              OCR
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Sheet Trigger Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDoc(doc);
                        setShowActionSheet(true);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#a1a1aa',
                        padding: '8px',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IonIcon icon={ellipsisVerticalOutline} style={{ fontSize: '1.25rem' }} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Opal-style Minimalist Empty State */
            <div
              style={{
                marginTop: '36px',
                textAlign: 'center',
                padding: '48px 24px',
                backgroundColor: 'rgba(12, 12, 14, 0.6)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 18px',
                }}
              >
                <IonIcon
                  icon={cameraOutline}
                  style={{ fontSize: '2rem', color: '#ffffff' }}
                />
              </div>

              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  margin: '0 0 8px',
                  letterSpacing: '-0.025em',
                  color: '#ffffff',
                }}
              >
                Sin documentos aún
              </h2>
              <p
                style={{
                  margin: '0 auto 24px',
                  color: '#a1a1aa',
                  fontSize: '0.88rem',
                  maxWidth: '280px',
                  lineHeight: '1.45',
                }}
              >
                Escanea folios, recibos o apuntes con la máxima calidad y detección inteligente de bordes.
              </p>

              <div style={{ display: 'inline-block' }}>
                <GlassSurface
                  width={240}
                  height={54}
                  borderRadius={27}
                  backgroundOpacity={0.12}
                  distortionScale={-160}
                  onClick={handleStartScanning}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#ffffff',
                      fontWeight: '600',
                      fontSize: '0.92rem',
                    }}
                  >
                    <IonIcon icon={cameraOutline} style={{ fontSize: '1.2rem' }} />
                    Primer Escaneo
                  </div>
                </GlassSurface>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Floating Pill with Liquid Glass Surface */}
        <div
          style={{
            position: 'fixed',
            bottom: '26px',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 100,
            pointerEvents: 'none',
          }}
        >
          <div style={{ pointerEvents: 'auto' }}>
            <GlassSurface
              width={220}
              height={58}
              borderRadius={29}
              distortionScale={-180}
              backgroundOpacity={0.16}
              onClick={handleStartScanning}
              style={{
                boxShadow:
                  '0 12px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 255, 255, 0.1)',
              }}
            >
              {isCapturing ? (
                <IonSpinner name="crescent" style={{ color: '#ffffff', width: '22px', height: '22px' }} />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    color: '#ffffff',
                    fontWeight: '600',
                    fontSize: '0.96rem',
                    letterSpacing: '-0.015em',
                  }}
                >
                  <IonIcon icon={cameraOutline} style={{ fontSize: '1.3rem' }} />
                  Escanear
                </div>
              )}
            </GlassSurface>
          </div>
        </div>

        {/* Action Sheet for Document */}
        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          buttons={[
            {
              text: 'Editar / Ver Páginas',
              handler: () => {
                if (selectedDoc) navigate(`/editor/${selectedDoc.id}`);
              },
            },
            {
              text: 'Compartir PDF',
              icon: shareOutline,
              handler: handleShareDocument,
            },
            {
              text: 'Eliminar Documento',
              role: 'destructive',
              icon: trashOutline,
              handler: () => setShowDeleteAlert(true),
            },
            {
              text: 'Cancelar',
              role: 'cancel',
            },
          ]}
        />

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Eliminar Documento"
          message={`¿Estás seguro de que deseas eliminar "${selectedDoc?.title}"?`}
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Eliminar',
              role: 'destructive',
              handler: handleDeleteDocument,
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
