import React, { useState } from 'react'
import PhilosophersVisualization from './PhilosophersVisualization'

function App() {
    const [showVisualization, setShowVisualization] = useState(false);

    if (showVisualization) {
        return <PhilosophersVisualization />;
    }

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
            <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
                Dining Philosophers
            </h1>
            <p className="text-gray-400 mb-8 max-w-md text-center">
                A visual simulation of the classic Dining Philosophers problem, demonstrating concurrency, deadlocks, and resource sharing.
            </p>
            <button
                onClick={() => setShowVisualization(true)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition-colors flex items-center gap-2"
            >
                🚀 Launch Interactive Demo
            </button>
        </div>
    )
}

export default App
