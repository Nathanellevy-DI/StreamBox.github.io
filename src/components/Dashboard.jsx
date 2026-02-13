import React, { useState } from 'react';
import GameTile from './GameTile';

const Dashboard = () => {
    const [numTiles, setNumTiles] = useState(0);

    // If numTiles is 0, show selection screen
    if (numTiles === 0) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white">
                <h1 className="text-4xl font-bold mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    STREAMBOX
                </h1>
                <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-2xl w-full max-w-md">
                    <label className="block text-sm text-gray-400 mb-4">Select Grid Size</label>
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4, 6, 9].map((n) => (
                            <button
                                key={n}
                                onClick={() => setNumTiles(n)}
                                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 text-white py-4 rounded-lg text-xl font-bold transition-all"
                            >
                                {n} Screens
                            </button>
                        ))}
                    </div>
                    <div className="mt-6 flex gap-2">
                        <input
                            type="number"
                            placeholder="Custom"
                            className="bg-black border border-gray-700 text-white p-2 rounded flex-1"
                            min="1"
                            max="16"
                            id="custom-tiles-input"
                        />
                        <button
                            onClick={() => {
                                const val = document.getElementById('custom-tiles-input').value;
                                if (val > 0) setNumTiles(parseInt(val));
                            }}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded font-bold"
                        >
                            GO
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate grid columns class based on numTiles
    let gridClass = 'grid-cols-1';
    if (numTiles === 2) gridClass = 'grid-cols-2';
    else if (numTiles >= 3 && numTiles <= 4) gridClass = 'grid-cols-2';
    else if (numTiles >= 5 && numTiles <= 6) gridClass = 'grid-cols-3';
    else if (numTiles >= 7 && numTiles <= 9) gridClass = 'grid-cols-3'; // 3x3
    else if (numTiles >= 10 && numTiles <= 12) gridClass = 'grid-cols-4';
    else if (numTiles > 12) gridClass = 'grid-cols-4';

    // Dynamic style for exact grid control could be better, but Tailwind classes are requested.
    // For 3-4 items, grid-cols-2 means 2 rows.
    // We can render tiles.

    return (
        <div className={`h-screen w-screen grid ${gridClass} bg-black gap-1`}>
            {Array.from({ length: numTiles }).map((_, idx) => (
                <GameTile key={idx} id={idx + 1} />
            ))}

            {/* Floating Home Button */}
            <button
                onClick={() => setNumTiles(0)}
                className="absolute bottom-4 right-4 bg-gray-900/80 hover:bg-red-600 text-white p-2 rounded-full border border-gray-700 z-50 transition-colors"
                title="Reset Grid"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </button>
        </div>
    );
};

export default Dashboard;
