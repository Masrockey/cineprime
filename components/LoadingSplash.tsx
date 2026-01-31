import React from 'react';

export default function LoadingSplash() {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#141414]">
            <div className="flex flex-col items-center animate-pulse">
                <h1 className="text-[#E50914] text-4xl md:text-6xl font-bold tracking-tighter uppercase mb-4 drop-shadow-lg">
                    CINEPRIME
                </h1>
                <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-500 text-sm animate-pulse">Loading amazing content...</p>
        </div>
    );
}
