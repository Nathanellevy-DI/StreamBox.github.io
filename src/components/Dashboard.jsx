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

    // Initial Layout Generation - Smart Fit
    const generateInitialLayout = () => {
        let cols = 2;
        let w = 6;
        let h = 4;

        // Bento Grid Logic (No Dead Space)
        const layouts = [];

        if (setupCount === 1) {
            layouts.push({ i: '0', x: 0, y: 0, w: 12, h: 8 });
        } else if (setupCount === 2) {
            layouts.push({ i: '0', x: 0, y: 0, w: 6, h: 8 });
            layouts.push({ i: '1', x: 6, y: 0, w: 6, h: 8 });
        } else if (setupCount === 3) {
            layouts.push({ i: '0', x: 0, y: 0, w: 4, h: 8 });
            layouts.push({ i: '1', x: 4, y: 0, w: 4, h: 8 });
            layouts.push({ i: '2', x: 8, y: 0, w: 4, h: 8 });
        } else if (setupCount === 4) {
            layouts.push({ i: '0', x: 0, y: 0, w: 6, h: 4 });
            layouts.push({ i: '1', x: 6, y: 0, w: 6, h: 4 });
            layouts.push({ i: '2', x: 0, y: 4, w: 6, h: 4 });
            layouts.push({ i: '3', x: 6, y: 4, w: 6, h: 4 });
        } else if (setupCount === 5) {
            // 2 Top (6x4), 3 Bottom (4x4)
            layouts.push({ i: '0', x: 0, y: 0, w: 6, h: 4 });
            layouts.push({ i: '1', x: 6, y: 0, w: 6, h: 4 });
            layouts.push({ i: '2', x: 0, y: 4, w: 4, h: 4 });
            layouts.push({ i: '3', x: 4, y: 4, w: 4, h: 4 });
            layouts.push({ i: '4', x: 8, y: 4, w: 4, h: 4 });
        } else if (setupCount === 6) {
            // 3x2 Grid
            cols = 3; w = 4; h = 4;
        } else if (setupCount === 7) {
            // 3 Top (4x4), 4 Bottom (3x4)
            layouts.push({ i: '0', x: 0, y: 0, w: 4, h: 4 });
            layouts.push({ i: '1', x: 4, y: 0, w: 4, h: 4 });
            layouts.push({ i: '2', x: 8, y: 0, w: 4, h: 4 });
            layouts.push({ i: '3', x: 0, y: 4, w: 3, h: 4 });
            layouts.push({ i: '4', x: 3, y: 4, w: 3, h: 4 });
            layouts.push({ i: '5', x: 6, y: 4, w: 3, h: 4 });
            layouts.push({ i: '6', x: 9, y: 4, w: 3, h: 4 });
        } else if (setupCount === 8) {
            // 4x2 Grid
            cols = 4; w = 3; h = 4;
        } else if (setupCount === 9) {
            // 3x3 Grid
            cols = 3; w = 4; h = 3;
        } else if (setupCount === 10) {
            // "Hero & Squad" Layout
            layouts.push({ i: '0', x: 0, y: 0, w: 6, h: 4 });
            layouts.push({ i: '1', x: 6, y: 0, w: 6, h: 4 });
            layouts.push({ i: '2', x: 0, y: 4, w: 3, h: 2 });
            layouts.push({ i: '3', x: 3, y: 4, w: 3, h: 2 });
            layouts.push({ i: '4', x: 6, y: 4, w: 3, h: 2 });
            layouts.push({ i: '5', x: 9, y: 4, w: 3, h: 2 });
            layouts.push({ i: '6', x: 0, y: 6, w: 3, h: 2 });
            layouts.push({ i: '7', x: 3, y: 6, w: 3, h: 2 });
            layouts.push({ i: '8', x: 6, y: 6, w: 3, h: 2 });
            layouts.push({ i: '9', x: 9, y: 6, w: 3, h: 2 });
        } else if (setupCount <= 12) {
            // 4x3 Grid
            cols = 4; w = 3; h = 3;
        } else if (setupCount <= 16) {
            // 4x4 Grid
            cols = 4; w = 3; h = 3;
        } else if (setupCount <= 48) {
            // High Density: 6 columns
            cols = 6; w = 2; h = 2;
        } else {
            // Ultra Density: 12 columns
            cols = 12; w = 1; h = 1;
        }

        let initialTiles;
        if (layouts.length > 0) {
            initialTiles = layouts.map(l => ({ ...l, minW: 1, minH: 1 }));
        } else {
            initialTiles = Array.from({ length: setupCount }).map((_, i) => ({
                i: i.toString(),
                x: (i % cols) * w,
                y: Math.floor(i / cols) * h,
                w: w,
                h: h,
                minW: 1,
                minH: 1
            }));
        }

        setTiles(initialTiles);
        setConfirmed(true);
    };

    // Add a new tile dynamically
    const addTile = () => {
        const maxId = tiles.length > 0 ? Math.max(...tiles.map(t => parseInt(t.i) || 0)) : -1;
        const newId = (maxId + 1).toString();

        const newTile = {
            i: newId,
            x: (tiles.length % 2) * 6,
            y: Infinity,
            w: 6,
            h: 4,
            minW: 1,
            minH: 1
        };
        setTiles([...tiles, newTile]);
    };

    // Remove a tile
    const removeTile = (id) => {
        setTiles(prevTiles => prevTiles.filter(t => t.i !== id));
    };

    // Dynamic Row Height Calculation
    // Auto-shrinks so ALL tiles fit on screen without scrolling
    const [rowHeight, setRowHeight] = useState(100);

    useEffect(() => {
        const handleResize = () => {
            const vh = window.innerHeight;

            // Calculate the total grid rows occupied by tiles
            let maxGridRows = 8; // Default
            if (tiles.length > 0) {
                maxGridRows = Math.max(...tiles.map(t => (t.y || 0) + (t.h || 1)));
            }

            // Safety: at least 1 row
            const targetRows = Math.max(maxGridRows, 1);

            const marginY = 4;
            const totalMargin = marginY * (targetRows - 1);

            // Calculate height per row to fit exactly in viewport
            const calculatedHeight = Math.floor((vh - totalMargin - 10) / targetRows);

            // Minimum of 10px per row (for extreme cases like 48 tiles)
            setRowHeight(Math.max(calculatedHeight, 10));
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, [tiles]);

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
                rowHeight={rowHeight}
                margin={[4, 4]}
                isDraggable={true}
                isResizable={true}
                draggableHandle=".drag-handle"
                onLayoutChange={(layout) => {
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

                        {/* Custom Resize Handle */}
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
