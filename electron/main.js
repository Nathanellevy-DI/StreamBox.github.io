/* eslint-env node */
import { app, BrowserWindow } from 'electron';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        backgroundColor: '#000000',
        webPreferences: {
            nodeIntegration: true, // Required for webviewTag in some versions, but mostly contextIsolation: false is needed if we use require. 
            // However, prompt explicitly asked for: "Handle will-attach-webview to ensure nodeIntegration is disabled for safety"
            // and "enable webviewTag: true"
            webviewTag: true,
            contextIsolation: false, // Often simplifies things for quick prototypes when using webviewTag, but let's try to be safe if possible.
            // Actually, for webviewTag to work in renderer without contextIsolation, we might need contextIsolation: false or a strong preload.
            // Given the prompt's simplicity focus, I will start with contextIsolation: false to ensure <webview> works easily in React,
            // but I will ensure nodeIntegration is disabled in the webview itself via will-attach-webview.
        },
    });

    // Load the web app
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Security: Disable nodeIntegration in webviews
    mainWindow.webContents.on('will-attach-webview', (event, webPreferences, _params) => {
        // Strip away preload scripts if allowing untrusted content
        delete webPreferences.preload;

        // Disable Node.js integration
        webPreferences.nodeIntegration = false;
        webPreferences.contextIsolation = true; // Isolate context in webview

        // Verify URL being loaded (optional, but good practice)
        // console.log('Webview loading:', params.src);
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
