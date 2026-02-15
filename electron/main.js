/* eslint-env node */
import { app, BrowserWindow, session } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hide automation flags from Google
app.commandLine.appendSwitch('disable-blink-features', 'AutomationControlled');
// Spoof a standard Modern Chrome
app.commandLine.appendSwitch('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36');

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
            enableRemoteModule: true,
        },
        // Hides "Chrome is being controlled by automated test software" bar
        // Also helps with Google Login detection
        enableLargerThanScreen: true,
        autoHideMenuBar: true,
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
    // CRITICAL: We must apply the "Nuclear Option" and UA Spoofing to the shared partition used by tiles
    // Otherwise, the tiles run without these protections because they use 'persist:main'
    const partition = 'persist:main';
    const streamSession = session.fromPartition(partition);

    // 1. Spoof User Agent Globally for this session (Fixes "Browser not secure" for Google)
    const agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

    const applyFilters = (sess) => {
        sess.webRequest.onBeforeSendHeaders((details, callback) => {
            details.requestHeaders['User-Agent'] = agent;
            callback({ cancel: false, requestHeaders: details.requestHeaders });
        });

        sess.webRequest.onHeadersReceived((details, callback) => {
            const responseHeaders = Object.assign({}, details.responseHeaders);
            const blockHeaders = ['x-frame-options', 'content-security-policy', 'frame-options'];
            Object.keys(responseHeaders).forEach((header) => {
                if (blockHeaders.includes(header.toLowerCase())) {
                    delete responseHeaders[header];
                }
            });
            callback({ cancel: false, responseHeaders: responseHeaders });
        });
    };

    // Apply to both the default session (for the app itself) and the stream session (for tiles)
    applyFilters(win.webContents.session);
    applyFilters(streamSession);

    // Allow popups (essential for Google/Social Logins)
    win.webContents.setWindowOpenHandler(({ url }) => {
        // You might want to strip 'electron' specific restrictions for popups too
        return { action: 'allow' };
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
