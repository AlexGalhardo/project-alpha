import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
	testDir: 'tests',
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
		command: 'bun run build && bun run preview',
		url: `http://localhost:${PORT}`,
		reuseExistingServer: true,
		timeout: 120_000,
	},
	projects: [
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
