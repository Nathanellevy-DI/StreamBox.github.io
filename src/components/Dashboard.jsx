import React, { useState, useMemo } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import GameTile from './GameTile';

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Dashboard() {
    const [count, setCount] = useState(0);
    const [confirmed, setConfirmed] = useState(false);

    // Generate layout based on count
    const layout = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => ({
            i: i.toString(),
            x: (i % 2) * 6, // 2 columns by default
            y: Math.floor(i / 2) * 4,
            w: 6,
            h: 4,
            minW: 2,
            minH: 2
        }));
    }, [count]);

    if (!confirmed) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
                <h1 className="text-2xl mb-4">How many games today?</h1>
                <input
                    type="number"
                    onChange={(e) => setCount(Number(e.target.value))}
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

    return (
        <div className="h-screen w-screen bg-black overflow-hidden relative">
            {/* Draggable Grid */}
            <ResponsiveGridLayout
                className="layout"
                layouts={{ lg: layout }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={100}
                margin={[4, 4]} // Gap between tiles
                isDraggable={true}
                isResizable={true}
                draggableHandle=".drag-handle" // Only drag from a specific handle if we want, or remove to drag anywhere. Let's try dragging anywhere first, but webviews catch clicks. We NEED a handle.
            >
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="bg-[#111] border border-gray-700 relative group">
                        {/* Drag Handle (Hidden overlay setup) - Actually, we need a visible handle or sidebar for better UX with webviews */}
                        <div className="drag-handle absolute top-0 left-0 w-8 h-8 bg-blue-600/50 hover:bg-blue-600 z-50 cursor-move rounded-br opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs">
                            ✥
                        </div>

                        {/* The Tile Content */}
                        <div className="w-full h-full" onMouseDown={(e) => e.stopPropagation()}>
                            <GameTile id={i} />
                        </div>
                    </div>
                ))}
            </ResponsiveGridLayout>
        </div>
    );
}
