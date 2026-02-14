import React, { useState } from 'react';
import GameTile from './GameTile';

export default function Dashboard() {
    const [count, setCount] = useState(0);
    const [confirmed, setConfirmed] = useState(false);

    if (!confirmed) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
                <h1 className="text-2xl mb-4">How many games today?</h1>
                <input
                    type="number"
                    onChange={(e) => setCount(e.target.value)}
                    className="bg-gray-800 p-2 rounded mb-4 w-20 text-center text-white"
                />
                <button
                    onClick={() => setConfirmed(true)}
                    className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-500"
                >
                    Launch Grid
                </button>
            </div>
        );
    }

    // Safe grid logic to prevent crashes if count is invalid
    const gridClass = count <= 1 ? 'grid-cols-1' : count <= 4 ? 'grid-cols-2' : 'grid-cols-3';

    return (
        <div className={`grid h-screen w-screen bg-black gap-1 p-1 ${gridClass}`}>
            {Array.from({ length: count }).map((_, i) => (
                <GameTile key={i} id={i} />
            ))}
        </div>
    );
}
