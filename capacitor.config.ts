import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kuroscan.app',
  appName: 'KuroScan',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
