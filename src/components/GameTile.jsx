import React, { useState, useRef } from 'react';


const GameTile = ({ id }) => {
    const [url, setUrl] = useState('');
    const [activeUrl, setActiveUrl] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const webviewRef = useRef(null);

    const handleGo = (e) => {
        e.preventDefault();
        if (url) {
            let finalUrl = url;
            // If it has spaces or no dots, treat as search query
            if (url.includes(' ') || !url.includes('.')) {
                finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
            } else if (!/^https?:\/\//i.test(url)) {
                finalUrl = `https://${url}`;
            }
            setActiveUrl(finalUrl);
            setIsActive(true);
        }
    };

    const handleClose = () => {
        setIsActive(false);
        setActiveUrl('');
        setUrl('');
    };

    const handleReload = () => {
        if (webviewRef.current) {
            // webview tag methods are available on the DOM element
            webviewRef.current.reload();
        }
    };

    const handleBack = () => {
        if (webviewRef.current && webviewRef.current.canGoBack()) {
            webviewRef.current.goBack();
        }
    };

    const toggleMute = () => {
        const newMuteState = !isMuted;
        setIsMuted(newMuteState);
        if (webviewRef.current) {
            webviewRef.current.setAudioMuted(newMuteState);
        }
    };

    // React requires specific handling for custom elements like webview
    // We use a ref and simple JSX, assuming Electron environment allows it.

    // Check if running in Electron
    const isElectron = /electron/i.test(navigator.userAgent);

    return (
        <div className={`flex flex-col h-full border-2 ${!isMuted ? 'border-yellow-500' : 'border-gray-800'} bg-black overflow-hidden relative rounded-xl`}>
            {/* Mini-Header */}
            <div className="flex items-center justify-between bg-gray-900 p-1 h-8 text-xs">
                <div className="flex space-x-2">
                    {isActive && (
                        <>
                            <button onClick={handleBack} className="text-gray-400 hover:text-white px-2">Back</button>
                            <button onClick={handleReload} className="text-gray-400 hover:text-white px-2">⟳</button>
                        </>
                    )}
                </div>
                <div className="flex space-x-2">
                    {isActive && (
                        <button
                            onClick={toggleMute}
                            className={`px-2 ${!isMuted ? 'text-yellow-400 font-bold' : 'text-gray-400'}`}
                        >
                            {isMuted ? 'UNMUTE' : 'MUTE'}
                        </button>
                    )}
                    <button onClick={isActive ? handleClose : () => { }} className="text-red-500 hover:text-red-400 px-2">
                        {isActive ? '✕' : ''}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative flex items-center justify-center">
                {!isActive ? (
                    <form onSubmit={handleGo} className="w-full max-w-md p-4 flex flex-col items-center gap-4">
                        <h2 className="text-gray-500 font-mono text-sm">TILE {id}</h2>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Enter URL (e.g. youtube.com)"
                            className="w-full bg-gray-800 text-white border border-gray-700 p-2 rounded focus:border-blue-500 outline-none"
                            autoFocus={id === 1}
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-bold w-full"
                        >
                            GO
                        </button>
                    </form>
                ) : (
                    isElectron ? (
                        <webview
                            ref={webviewRef}
                            src={activeUrl}
                            partition={`persist:tile-${id}`}
                            style={{ width: '100%', height: '100%' }}
                            allowpopups="true"
                            webpreferences="contextIsolation=true, nodeIntegration=false"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center relative">
                            <iframe
                                src={activeUrl}
                                className="w-full h-full border-none"
                                title={`Tile ${id}`}
                                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                            />
                            {/* Fallback overlay */}
                            <div className="absolute top-0 left-0 w-full flex flex-col items-center pointer-events-none">
                                <div className="w-full h-8 bg-orange-600/90 text-xs flex items-center justify-between px-4 text-white z-10 pointer-events-auto">
                                    <span>Web View - Sites may block embedding</span>
                                    <a
                                        href={activeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-black/50 hover:bg-black/80 px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors"
                                    >
                                        Open in New Tab ↗
                                    </a>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default GameTile;
