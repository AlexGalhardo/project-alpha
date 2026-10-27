import { defineConfig, devices } from '@playwright/test';

// Dedicated port: 4173 (Vite's default preview port) is often taken by other local servers,
// and reusing one of them would test a stale build.
const PORT = 4188;

export default defineConfig({
	testDir: 'tests',
	testIgnore: ['**/unit/**'],
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: 0,
	reporter: [['list']],
	timeout: 60_000,
	use: {
		baseURL: `http://localhost:${PORT}`,
		trace: 'retain-on-failure',
	},
	webServer: {
		command: `bun run build && bunx vite preview --port ${PORT} --strictPort`,
		url: `http://localhost:${PORT}`,
		reuseExistingServer: false,
		timeout: 120_000,
	},
	projects: [
		// Primary target (ADR 0015): Full HD renders 1:1. Only the screen tour runs here and at 1366×768.
		{
			name: 'desktop-1920x1080',
			testMatch: /screens\.spec\.ts/,
			use: {
				...devices['Desktop Chrome'],
				channel: 'chromium',
				viewport: { width: 1920, height: 1080 },
				deviceScaleFactor: 1,
			},
		},
		{
			name: 'desktop-1366x768',
			testMatch: /screens\.spec\.ts/,
			use: {
				...devices['Desktop Chrome'],
				channel: 'chromium',
				viewport: { width: 1366, height: 768 },
				deviceScaleFactor: 1,
			},
		},
		{
			name: 'desktop-1280x720',
			use: {
				...devices['Desktop Chrome'],
				// Full Chromium (new headless): the headless-shell download is blocked by the local TLS proxy.
				channel: 'chromium',
				viewport: { width: 1280, height: 720 },
				deviceScaleFactor: 1,
			},
		},
		{
			name: 'mobile-landscape-844x390',
			use: {
				...devices['Desktop Chrome'],
				// Full Chromium (new headless): the headless-shell download is blocked by the local TLS proxy.
				channel: 'chromium',
				viewport: { width: 844, height: 390 },
				deviceScaleFactor: 3,
				isMobile: true,
				hasTouch: true,
			},
		},
	],
});
