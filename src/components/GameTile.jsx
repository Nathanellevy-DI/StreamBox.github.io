import React, { useState } from 'react';

export default function GameTile({ id, onRemove }) {
    const [url, setUrl] = useState("");
    const [active, setActive] = useState(false);
    const webviewRef = React.useRef(null); // Ref for accessing webview methods

    // Robust check for Electron environment
    const isElectron = typeof navigator !== 'undefined' && /electron/i.test(navigator.userAgent);

    const handleConnect = (e) => {
        if (e.key === 'Enter') {
            let target = e.target.value;
            if (!target.startsWith('http')) target = 'https://' + target;
            setUrl(target);
            setActive(true);
        }
    };

    const handleReload = () => {
        if (webviewRef.current) {
            try {
                webviewRef.current.reload();
            } catch (e) {
                // If ref fails, just toggle active to force re-render (fallback)
                setActive(false);
                setTimeout(() => setActive(true), 50);
            }
        } else {
            // Iframe reload fallback
            const current = url;
            setUrl('');
            setTimeout(() => setUrl(current), 50);
        }
    };

    const handleExit = () => {
        setActive(false);
        setUrl("");
    };

    return (
        <div className="border border-gray-700 h-full w-full bg-[#111] overflow-hidden relative group">
            {/* Mini-Header (Visible on Hover or when Active) */}
            {active && (
                <div className="absolute top-0 right-0 z-50 flex bg-black/80 rounded-bl-lg backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100">
                    <button
                        onClick={handleReload}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
                        title="Reload Stream"
                    >
                        ⟳
                    </button>
                    <button
                        onClick={handleExit}
                        className="p-2 text-white hover:text-red-400 hover:bg-gray-700/50 transition-colors"
                        title="Close Stream (Keep Tile)"
                    >
                        ✕
                    </button>
                    <div className="w-[1px] h-4 bg-gray-600 mx-1"></div>
                    <button
                        onClick={() => {
                            if (window.confirm("Delete this screen entirely?")) {
                                onRemove();
                            }
                        }}
                        className="p-2 text-red-600 hover:bg-red-900/30 transition-colors"
                        title="Remove Tile"
                    >
                        🗑️
                    </button>
                </div>
            )}

            {/* Always visible 'Remove Tile' for empty state */}
            {!active && (
                <div className="absolute top-0 right-0 p-2 z-40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => {
                            if (window.confirm("Delete this screen entirely?")) {
                                onRemove();
                            }
                        }}
                        className="text-red-600 hover:text-red-400 font-bold"
                        title="Remove Tile"
                    >
                        🗑️
                    </button>
                </div>
            )}

            {!active ? (
                <div className="flex items-center justify-center h-full">
                    <input
                        onKeyDown={handleConnect}
                        placeholder="Enter URL..."
                        className="bg-gray-900 border border-gray-600 p-2 text-sm text-white rounded outline-none focus:border-blue-500"
                    />
                </div>
            ) : (
                isElectron ? (
                    // ELECTRON: Use "Golden Setup" webview
                    <div className="relative w-full h-full">
                        <webview
                            ref={webviewRef}
                            src={url}
                            // Shared partition allows one login to work across all tiles (Google, ESPN, etc.)
                            partition="persist:main"
                            className="w-full h-full"
                            allowpopups="true"
                            // Spoof Chrome to prevent "Browser not supported" blocks
                            useragent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
                            // RE-ADDED: Explicitly disable security in the tag to ensure the renderer respects it
                            webpreferences="contextIsolation=false, nodeIntegration=false, webSecurity=false"
                            style={{ width: '100%', height: '100%' }}
                        />
                        {/* Debug Indicator: e = Electron, w = Web */}
                        <div className="absolute bottom-0 right-0 p-1 text-[10px] text-gray-500 opacity-20 hover:opacity-100 pointer-events-none">e</div>
                    </div>
                ) : (
                    // WEB: Use Iframe Fallback (for GitHub Pages)
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 overflow-hidden relative">
                        <iframe
                            src={url}
                            className="w-full h-full border-none"
                            title={`Tile ${id}`}
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        />
                        {/* Fallback Overlay for blocked sites on Web */}
                        <div className="absolute top-0 right-0 p-2 pointer-events-none">
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold uppercase hover:bg-red-500 pointer-events-auto opacity-70 hover:opacity-100 transition-opacity"
                            >
                                Open Tab ↗
                            </a>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}
