'use client';

import { Subject } from '@/lib/api';
import MovieCard from './MovieCard';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MovieRowProps {
    title: string;
    movies: Subject[];
    headerContent?: React.ReactNode;
}

export default function MovieRow({ title, movies, headerContent }: MovieRowProps) {
    const rowRef = useRef<HTMLDivElement>(null);

    const slide = (offset: number) => {
        if (rowRef.current) {
            rowRef.current.scrollLeft += offset;
        }
    };

    if (!movies || movies.length === 0) return null;

    return (
        <div className="px-4 md:px-12 my-8 space-y-4 group">
            <div className="mb-2">
                <h2 className="text-white text-xl md:text-2xl font-semibold hover:text-gray-300 cursor-pointer transition inline-block">
                    {title}
                </h2>
                {headerContent}
            </div>
            <div className="relative">
                <button
                    className="absolute left-0 top-0 bottom-0 z-40 bg-black/50 hover:bg-black/70 w-12 hidden md:group-hover:flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                    onClick={() => slide(-500)}
                >
                    <ChevronLeft className="text-white w-8 h-8" />
                </button>

                <div ref={rowRef} className="flex items-center gap-4 overflow-x-scroll no-scrollbar scroll-smooth p-2">
                    {movies.map((movie) => (
                        <MovieCard key={movie.subjectId} movie={movie} />
                    ))}
                </div>

                <button
                    className="absolute right-0 top-0 bottom-0 z-40 bg-black/50 hover:bg-black/70 w-12 hidden md:group-hover:flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                    onClick={() => slide(500)}
                >
                    <ChevronRight className="text-white w-8 h-8" />
                </button>
            </div>
        </div>
    );
}
