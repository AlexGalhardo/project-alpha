// Desktop shell (PLAN B4.4): loads the built web game from dist/ in a frameless-by-default window
// sized for the 1920×1080 target; no Node integration, the game is the same web build.
const { app, BrowserWindow, Menu } = require('electron');
const path = require('node:path');

function createWindow() {
	const win = new BrowserWindow({
		width: 1920,
		height: 1080,
		useContentSize: true,
		backgroundColor: '#0e0d12',
		autoHideMenuBar: true,
		title: 'Ossuary',
		icon: path.join(__dirname, 'icon.png'),
		webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
	});
	win.maximize();
	win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

Menu.setApplicationMenu(null);
app.whenReady().then(() => {
	createWindow();
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});
