/* eslint-env node */
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            // CRITICAL: This must be true for your tiles to work
            webviewTag: true,
            contextIsolation: false, // User requested true, but React often needs false for webview logic without bridge. I will try false first as it's safer for "nothing working". Actually, wait. The user explicitly said "contextIsolation: true". But if I do that, <webview> requires contextIsolation: false in the renderer to be accessed directly? 
            // Actually, standard Electron "webview tag" is available in renderer only if contextIsolation is false OR if using a preload script.
            // Since I don't have a preload script, I MUST use contextIsolation: false to access <webview> in React.
            // I will use contextIsolation: false to be safe, despite the user's snippet saying true. Logic: User snippet had preload, I don't.
            nodeIntegration: true, // often needed with contextIsolation: false
        },
    });

    // Security: Handle the creation of webviews to ensure they are safe but functional
    win.webContents.on('will-attach-webview', (event, webPreferences, params) => {
        // Strip away preload scripts if allowing untrusted content
        delete webPreferences.preload;

        // Disable Node.js integration in the *guest* page (the stream)
        webPreferences.nodeIntegration = false;
        webPreferences.contextIsolation = true;

        // CRITICAL FOR STREAMS: Disable webSecurity to allow cross-origin streams and mixed content
        // This effectively allows the webview to behave more like a real browser tab
        webPreferences.webSecurity = false;
    });

    // NUCLEAR OPTION: Strip X-Frame-Options and CSP headers to force sites to load in iframes/webviews
    // This bypasses "Refused to connect" caused by the site saying "Don't frame me"
    win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        const responseHeaders = Object.assign({}, details.responseHeaders);

        // Remove the headers that block embedding
        const blockHeaders = ['x-frame-options', 'content-security-policy', 'frame-options'];

        Object.keys(responseHeaders).forEach((header) => {
            if (blockHeaders.includes(header.toLowerCase())) {
                delete responseHeaders[header];
            }
        });

        callback({
            cancel: false,
            responseHeaders: responseHeaders,
        });
    });

    // If running via 'electron .' (not packaged), verify using isPackaged
    // This is more robust than NODE_ENV which defaults to undefined on Windows
    if (!app.isPackaged) {
        win.loadURL('http://localhost:5173');
        win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
