import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
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
  sparklesOutline,
  ellipsisVerticalOutline,
  timeOutline,
} from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { KuroDocument } from '../types/document';
import { DocumentService } from '../services/documentService';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<KuroDocument[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [selectedDoc, setSelectedDoc] = useState<KuroDocument | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [scanMode, setScanMode] = useState<'mlkit' | 'direct'>('mlkit');

  const loadDocuments = async () => {
    const list = await DocumentService.getDocuments();
    setDocuments(list);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const showToast = (msg: string) => setToastMessage(msg);

  // Trigger scanning flow: Scans with Google ML Kit -> Enters Document Editor with cropped pages!
  const handleStartScanning = async () => {
    setIsCapturing(true);
    try {
      const pages = await DocumentService.scanPages(scanMode);
      if (pages.length > 0) {
        // Navigate immediately to editor with all scanned & cropped pages!
        navigate('/editor/new', {
          state: {
            initialPages: pages,
            mode: scanMode,
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '7px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
              <IonTitle style={{ padding: 0, fontSize: '1.25rem', fontWeight: '700' }}>
                KuroScan
              </IonTitle>
            </div>

            {/* Mode Toggle Button: Direct (Zero-Screen) vs ML Kit */}
            <div
              onClick={() => {
                const nextMode = scanMode === 'direct' ? 'mlkit' : 'direct';
                setScanMode(nextMode);
                showToast(
                  nextMode === 'direct'
                    ? 'Modo Directo activado (Sin pantallas intermedias)'
                    : 'Modo Google ML Kit activado'
                );
              }}
              style={{
                backgroundColor: '#161618',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '0.72rem',
                color: scanMode === 'direct' ? '#30d158' : '#64d2ff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: scanMode === 'direct' ? '#30d158' : '#64d2ff',
                }}
              />
              {scanMode === 'direct' ? 'Disparo Directo' : 'Google ML Kit'}
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent
        fullscreen
        style={{ '--background': '#000000', color: '#ffffff' } as React.CSSProperties}
      >
        <div style={{ padding: '16px 16px 100px', maxWidth: '640px', margin: '0 auto' }}>
          {/* Header Subtitle */}
          <div style={{ marginBottom: '16px' }}>
            <h1
              style={{
                margin: '8px 0 2px',
                fontSize: '1.5rem',
                fontWeight: '700',
                letterSpacing: '-0.02em',
              }}
            >
              Documentos
            </h1>
            <p style={{ margin: 0, color: '#8e8e93', fontSize: '0.85rem' }}>
              {documents.length} {documents.length === 1 ? 'documento' : 'documentos'} guardados
            </p>
          </div>

          {/* Document List */}
          {documents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {documents.map((doc) => {
                const firstPage = doc.pages[0];
                return (
                  <div
                    key={doc.id}
                    onClick={() => navigate(`/editor/${doc.id}`)}
                    style={{
                      backgroundColor: '#111113',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: '54px',
                        height: '72px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        backgroundColor: '#1c1c1e',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        flexShrink: 0,
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
                          <IonIcon icon={documentTextOutline} style={{ color: '#52525b' }} />
                        </div>
                      )}
                    </div>

                    {/* Document Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          margin: '0 0 4px',
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: '#ffffff',
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
                          color: '#8e8e93',
                          fontSize: '0.78rem',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
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
                            <span style={{ color: '#64d2ff', fontWeight: '500' }}>OCR</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDoc(doc);
                        setShowActionSheet(true);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#8e8e93',
                        padding: '8px',
                        cursor: 'pointer',
                        borderRadius: '8px',
                      }}
                    >
                      <IonIcon icon={ellipsisVerticalOutline} style={{ fontSize: '1.2rem' }} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div
              style={{
                marginTop: '40px',
                textAlign: 'center',
                padding: '40px 20px',
                backgroundColor: '#0a0a0c',
                borderRadius: '20px',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  backgroundColor: '#161618',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <IonIcon
                  icon={cameraOutline}
                  style={{ fontSize: '1.8rem', color: '#a1a1aa' }}
                />
              </div>

              <h2 style={{ fontSize: '1.15rem', fontWeight: '600', margin: '0 0 6px' }}>
                Sin documentos aún
              </h2>
              <p
                style={{
                  margin: '0 auto 20px',
                  color: '#8e8e93',
                  fontSize: '0.85rem',
                  maxWidth: '280px',
                  lineHeight: '1.4',
                }}
              >
                Digitaliza tus hojas, apuntes o recibos de forma instantánea sin pantallas intermedias.
              </p>

              <IonButton
                onClick={handleStartScanning}
                disabled={isCapturing}
                style={
                  {
                    '--background': '#ffffff',
                    '--color': '#000000',
                    '--border-radius': '12px',
                    fontWeight: '600',
                  } as React.CSSProperties
                }
              >
                {isCapturing ? (
                  <IonSpinner name="dots" />
                ) : (
                  <>
                    <IonIcon slot="start" icon={cameraOutline} />
                    Escanear primer documento
                  </>
                )}
              </IonButton>
            </div>
          )}
        </div>

        {/* Bottom Floating Apple-style Pill Action Bar */}
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 100,
            pointerEvents: 'none',
          }}
        >
          <button
            onClick={handleStartScanning}
            disabled={isCapturing}
            style={{
              pointerEvents: 'auto',
              backgroundColor: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: '26px',
              padding: '14px 28px',
              fontSize: '0.95rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 10px 25px rgba(255, 255, 255, 0.15)',
              cursor: 'pointer',
              transition: 'transform 0.1s ease',
            }}
          >
            {isCapturing ? (
              <IonSpinner name="crescent" style={{ color: '#000000', width: '20px', height: '20px' }} />
            ) : (
              <>
                <IonIcon icon={cameraOutline} style={{ fontSize: '1.25rem' }} />
                Escanear
              </>
            )}
          </button>
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
