import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import { ColorBends } from './components/ColorBends';
import { I18nProvider } from './i18n/I18nContext';
import { DocumentProvider } from './context/DocumentContext';
import { ScannerModal } from './components/ScannerModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { ShareModal } from './components/ShareModal';
import { SettingsModal } from './components/SettingsModal';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables & Tailwind styles */
import './theme/variables.css';

// Force iOS mode globally for authentic Apple design language
setupIonicReact({
  mode: 'ios',
  animated: true,
});

const App: React.FC = () => (
  <I18nProvider>
    <DocumentProvider>
      <IonApp className="bg-black text-white relative overflow-hidden">
        {/* React Bits: ColorBends Monochromatic OLED Shader Background */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black opacity-80">
          <ColorBends
            colors={["#ffffff", "#d0d0d8", "#888892", "#2e2e34"]}
            rotation={45}
            speed={0.16}
            scale={1.15}
            frequency={1.0}
            warpStrength={1.25}
            mouseInfluence={0.8}
            noise={0.06}
            parallax={0.35}
            iterations={2}
            intensity={0.9}
            bandWidth={5.5}
            transparent={true}
          />
        </div>

        {/* Main Navigation Router */}
        <IonReactRouter>
          <IonRouterOutlet>
            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
          </IonRouterOutlet>
        </IonReactRouter>

        {/* Full-screen Modals & Overlays */}
        <ScannerModal />
        <DocumentViewerModal />
        <ShareModal />
        <SettingsModal />
      </IonApp>
    </DocumentProvider>
  </I18nProvider>
);

export default App;
