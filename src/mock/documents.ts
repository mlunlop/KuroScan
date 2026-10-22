import { ScannedDocument } from '../types/document';

// SVG Document page generator for realistic offline mockups
const createSvgDocumentPage = (title: string, sub: string, lines: string[], pageNum: number) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850">
    <rect width="600" height="850" fill="#fcfcfc"/>
    <rect x="25" y="25" width="550" height="800" fill="none" stroke="#e0e0e0" stroke-width="1.5" stroke-dasharray="6,4"/>
    <text x="50" y="80" font-family="-apple-system, Inter, sans-serif" font-size="22" font-weight="bold" fill="#111111">${title}</text>
    <text x="50" y="110" font-family="-apple-system, Inter, sans-serif" font-size="13" fill="#666666">${sub}</text>
    <line x1="50" y1="130" x2="550" y2="130" stroke="#111111" stroke-width="2"/>
    ${lines
      .map(
        (line, idx) =>
          `<text x="50" y="${170 + idx * 28}" font-family="-apple-system, Inter, sans-serif" font-size="14" fill="#333333">${line}</text>`
      )
      .join('')}
    <rect x="50" y="680" width="180" height="40" rx="4" fill="#f0f0f0" stroke="#cccccc"/>
    <text x="65" y="705" font-family="-apple-system, Inter, sans-serif" font-size="12" fill="#555555">SELLO DIGITAL ML-KIT</text>
    <text x="550" y="800" font-family="-apple-system, Inter, sans-serif" font-size="12" fill="#888888" text-anchor="end">Página ${pageNum}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const INITIAL_DOCUMENTS: ScannedDocument[] = [
  {
    id: 'doc-1',
    title: 'Contrato de Servicios KuroScan 2026',
    createdAt: 'Hoy, 16:45',
    updatedAt: 'Hoy, 16:45',
    pages: [
      createSvgDocumentPage(
        'CONTRATO DE PRESTACIÓN DE SERVICIOS',
        'Ref: KURO-2026-DEV | Vigencia: Oct 2026 - Oct 2027',
        [
          '1. OBJETO DEL CONTRATO: El presente acuerdo estipula el desarrollo',
          'y mantenimiento de la aplicación móvil KuroScan para Android & iOS.',
          '2. MOTOR OCR: Integración nativa de Google ML Kit Text Recognition v2,',
          'garantizando procesamiento 100% on-device con privacidad absoluta.',
          '3. CALIDAD DE ESCANEO: Implementación de ML Kit Document Scanner',
          'con recorte de perspectiva automático y corrección de sombras.',
          '4. PROPIEDAD INTELECTUAL: El código fuente y diseños pertenecen',
          'en su totalidad al usuario sin suscripciones ni marcas de agua.'
        ],
        1
      ),
      createSvgDocumentPage(
        'CONTRATO DE SERVICIOS (ANEXO I)',
        'Cláusula de Confidencialidad y Procesamiento On-Device',
        [
          'ANEXO I: ESPECIFICACIONES TÉCNICAS Y PRIVACIDAD',
          '• Ningún dato, imagen ni texto extraído será enviado a servidores externos.',
          '• Almacenamiento local seguro en el sandbox del sistema operativo.',
          '• Exportación ilimitada en formatos PDF y JPEG de alta definición.',
          '• Firmado digitalmente por ambas partes en Madrid a 22 de Octubre de 2026.'
        ],
        2
      )
    ],
    fileSize: '1.4 MB',
    favorite: true,
    tags: ['Legal', 'Trabajo'],
    ocrConfidence: 0.98,
    ocrText: `CONTRATO DE PRESTACIÓN DE SERVICIOS
Ref: KURO-2026-DEV | Vigencia: Oct 2026 - Oct 2027

1. OBJETO DEL CONTRATO: El presente acuerdo estipula el desarrollo y mantenimiento de la aplicación móvil KuroScan para Android & iOS.
2. MOTOR OCR: Integración nativa de Google ML Kit Text Recognition v2, garantizando procesamiento 100% on-device con privacidad absoluta.
3. CALIDAD DE ESCANEO: Implementación de ML Kit Document Scanner con recorte de perspectiva automático y corrección de sombras.
4. PROPIEDAD INTELECTUAL: El código fuente y diseños pertenecen en su totalidad al usuario sin suscripciones ni marcas de agua.

ANEXO I: ESPECIFICACIONES TÉCNICAS Y PRIVACIDAD
• Ningún dato, imagen ni texto extraído será enviado a servidores externos.
• Almacenamiento local seguro en el sandbox del sistema operativo.
• Exportación ilimitada en formatos PDF y JPEG de alta definición.
• Firmado digitalmente por ambas partes en Madrid a 22 de Octubre de 2026.`
  },
  {
    id: 'doc-2',
    title: 'Factura Equipamiento Apple Studio',
    createdAt: 'Ayer, 11:20',
    updatedAt: 'Ayer, 11:20',
    pages: [
      createSvgDocumentPage(
        'FACTURA SIMPLIFICADA - APPLE STORE',
        'Nº Factura: ES-2026-9812 | Fecha: 21/10/2026',
        [
          'CLIENTE: KuroScan Project Studio',
          'NIF / CIF: B-99887766 | Madrid, España',
          '-------------------------------------------------------',
          'CONCEPTO                    CANT.   PRECIO     TOTAL',
          '1. MacBook Pro 16" M4 Max     1    3.499,00 €  3.499,00 €',
          '2. Apple Studio Display 5K    1    1.779,00 €  1.779,00 €',
          '3. Magic Keyboard & Mouse     1      299,00 €    299,00 €',
          '-------------------------------------------------------',
          'SUBTOTAL: 5.577,00 €  |  IVA (21%): 1.171,17 €',
          'TOTAL A PAGAR: 6.748,17 €'
        ],
        1
      )
    ],
    fileSize: '890 KB',
    favorite: false,
    tags: ['Facturas', 'Finanzas'],
    ocrConfidence: 0.99,
    ocrText: `FACTURA SIMPLIFICADA - APPLE STORE
Nº Factura: ES-2026-9812 | Fecha: 21/10/2026
CLIENTE: KuroScan Project Studio
NIF / CIF: B-99887766 | Madrid, España
-------------------------------------------------------
CONCEPTO                    CANT.   PRECIO     TOTAL
1. MacBook Pro 16" M4 Max     1    3.499,00 €  3.499,00 €
2. Apple Studio Display 5K    1    1.779,00 €  1.779,00 €
3. Magic Keyboard & Mouse     1      299,00 €    299,00 €
-------------------------------------------------------
SUBTOTAL: 5.577,00 €  |  IVA (21%): 1.171,17 €
TOTAL A PAGAR: 6.748,17 €`
  },
  {
    id: 'doc-3',
    title: 'Notas de Arquitectura & ML Kit',
    createdAt: '19 Oct 2026',
    updatedAt: '19 Oct 2026',
    pages: [
      createSvgDocumentPage(
        'NOTAS TÉCNICAS: GOOGLE ML KIT V2',
        'Document Scanner & Text Recognition Pipeline',
        [
          'FLUDO DE CAPTURA:',
          '1. Disparo de DocumentScanner.getClient(options)',
          '2. Detección automática de bordes con aceleración GPU',
          '3. Filtros: Original, Enhanced, B/W Document, Grayscale',
          '4. Retorno de URIs de imágenes de alta resolución',
          'PROCESAMIENTO OCR:',
          '5. TextRecognizer.process(InputImage.fromFilePath)',
          '6. Extracción de bloques, líneas y coordenadas precisas',
          '7. Copiado a portapapeles y generación de PDF searchable.'
        ],
        1
      )
    ],
    fileSize: '620 KB',
    favorite: true,
    tags: ['Personal', 'Apuntes'],
    ocrConfidence: 0.96,
    ocrText: `NOTAS TÉCNICAS: GOOGLE ML KIT V2
Document Scanner & Text Recognition Pipeline

FLUDO DE CAPTURA:
1. Disparo de DocumentScanner.getClient(options)
2. Detección automática de bordes con aceleración GPU
3. Filtros: Original, Enhanced, B/W Document, Grayscale
4. Retorno de URIs de imágenes de alta resolución

PROCESAMIENTO OCR:
5. TextRecognizer.process(InputImage.fromFilePath)
6. Extracción de bloques, líneas y coordenadas precisas
7. Copiado a portapapeles y generación de PDF searchable.`
  }
];
