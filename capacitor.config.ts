import type { CapacitorConfig } from '@capacitor/cli';

// Android shell (PLAN B4.5): the same Vite web build packaged by Capacitor.
const config: CapacitorConfig = {
	appId: 'xyz.lekzera.ossuary',
	appName: 'Ossuary',
	webDir: 'dist',
	backgroundColor: '#0e0d12',
	android: { allowMixedContent: false },
};

export default config;
