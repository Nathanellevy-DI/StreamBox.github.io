import React, { useState, useMemo, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import GameTile from './GameTile';

// Use the robust CJS import pattern for v1.4.4
const Responsive = GridLayout.Responsive;
const WidthProvider = GridLayout.WidthProvider;
const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Dashboard() {
    // State: Array of tile objects { i, x, y, w, h }
    // We use 'i' as the unique ID for RGL
    const [tiles, setTiles] = useState([]);

    // Initial Setup Mode (Legacy support for the "How many games?" screen)
    const [setupCount, setSetupCount] = useState(0);
    const [confirmed, setConfirmed] = useState(false);

    // Initial Layout Generation
    const generateInitialLayout = () => {
        const initialTiles = Array.from({ length: setupCount }).map((_, i) => ({
            i: i.toString(),
            x: (i % 2) * 6,
            y: Math.floor(i / 2) * 4,
            w: 6,
            h: 4
        }));
        setTiles(initialTiles);
        setConfirmed(true);
    };

    // Add a new tile dynamically
    const addTile = () => {
        // Generate a unique ID based on timestamp or increment
        // Simple increment based on max ID found to avoid collisions
        const maxId = tiles.length > 0 ? Math.max(...tiles.map(t => parseInt(t.i) || 0)) : -1;
        const newId = (maxId + 1).toString();

        const newTile = {
            i: newId,
            x: (tiles.length % 2) * 6, // Alternating columns
            y: Infinity, // RGL handles putting it at the bottom
            w: 6,
            h: 4,
            minW: 2,
            minH: 2
        };
        setTiles([...tiles, newTile]);
    };

    // Remove a tile
    const removeTile = (id) => {
        setTiles(prevTiles => prevTiles.filter(t => t.i !== id));
    };

    if (!confirmed) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
                <h1 className="text-2xl mb-4">How many games to start?</h1>
                <input
                    type="number"
                    onChange={(e) => setSetupCount(Number(e.target.value))}
                    className="bg-gray-800 p-2 rounded mb-4 w-20 text-center text-white"
                />
                <button
                    onClick={generateInitialLayout}
                    className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-500"
                >
                    Launch Grid
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-black overflow-hidden relative">
            {/* Control Bar: Add Button */}
            <button
                onClick={addTile}
                className="absolute bottom-6 right-6 z-[9999] bg-blue-600 w-14 h-14 rounded-full text-3xl flex items-center justify-center shadow-lg hover:bg-blue-500 hover:scale-110 transition-transform text-white pb-1"
                title="Add New Screen"
            >
                +
            </button>

            {/* Draggable Grid */}
            <ResponsiveGridLayout
                className="layout"
                layouts={{ lg: tiles }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={100}
                margin={[4, 4]}
                isDraggable={true}
                isResizable={true}
                draggableHandle=".drag-handle"
                onLayoutChange={(layout) => {
                    // Sync RGL layout changes back to our state so items don't jump around
                    // We map the incoming layout props back to our tile objects
                    // This is crucial for "persistence" during the session
                    const layoutMap = new Map(layout.map(l => [l.i, l]));
                    setTiles(prevTiles => prevTiles.map(t => {
                        const l = layoutMap.get(t.i);
                        return l ? { ...t, ...l } : t;
                    }));
                }}
            >
                {tiles.map((tile) => (
                    <div key={tile.i} data-grid={tile} className="bg-[#111] border border-gray-700 relative group">
                        {/* Drag Handle */}
                        <div className="drag-handle absolute top-0 left-0 w-8 h-8 bg-blue-600/50 hover:bg-blue-600 z-50 cursor-move rounded-br opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs">
                            ✥
                        </div>

                        {/* The Tile Content */}
                        <div className="w-full h-full" onMouseDown={(e) => e.stopPropagation()}>
                            <GameTile id={tile.i} onRemove={() => removeTile(tile.i)} />
                        </div>

                        {/* Custom Resize Handle - Always visible, high z-index, larger touch target */}
                        <span
                            className="react-resizable-handle react-resizable-handle-se absolute bottom-0 right-0 w-8 h-8 z-[100] cursor-se-resize flex items-center justify-center bg-blue-600/20 hover:bg-blue-600/80 rounded-tl-lg transition-colors"
                            style={{ backgroundImage: 'none' }}
                        >
                            <div className="w-4 h-4 border-r-2 border-b-2 border-white transform -translate-x-1 -translate-y-1"></div>
                        </span>
                    </div>
                ))}
            </ResponsiveGridLayout>
        </div>
    );
}
