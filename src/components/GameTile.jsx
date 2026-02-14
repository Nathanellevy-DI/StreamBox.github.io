import React, { useState } from 'react';

export default function GameTile({ id }) {
    const [url, setUrl] = useState("");
    const [active, setActive] = useState(false);

    const handleConnect = (e) => {
        if (e.key === 'Enter') {
            let target = e.target.value;
            if (!target.startsWith('http')) target = 'https://' + target;
            setUrl(target);
            setActive(true);
        }
    };

    return (
        <div className="border border-gray-700 h-full w-full bg-[#111] overflow-hidden">
            {!active ? (
                <div className="flex items-center justify-center h-full">
                    <input
                        onKeyDown={handleConnect}
                        placeholder="Enter URL..."
                        className="bg-gray-900 border border-gray-600 p-2 text-sm text-white rounded outline-none focus:border-blue-500"
                    />
                </div>
            ) : (
                <webview
                    src={url}
                    // Partition makes each tile a separate "browser tab"
                    partition={`persist:tile-${id}`}
                    className="w-full h-full"
                    allowpopups="true"
                    style={{ width: '100%', height: '100%' }}
                />
            )}
        </div>
    );
}
