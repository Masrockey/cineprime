'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Subject, BannerItem } from '@/lib/api';

interface HeroSliderProps {
    items: (BannerItem | Subject)[];
}

export default function HeroSlider({ items }: HeroSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((current) => (current + 1) % items.length);
        }, 8000); // 8 seconds per slide
        return () => clearInterval(timer);
    }, [items.length]);

    const nextSlide = () => {
        setCurrentIndex((current) => (current + 1) % items.length);
    };

    const prevSlide = () => {
        setCurrentIndex((current) => (current - 1 + items.length) % items.length);
    };

    if (!items || items.length === 0) return null;

    const currentItem = items[currentIndex];

    // Data extraction helper
    const getData = (item: any) => {
        const imageUrl = item.image?.url || item.cover?.url || item.subject?.cover?.url;
        const title = item.title || item.subject?.title;
        const description = item.description || item.subject?.description || "No description available.";
        let id = item.subjectId || item.subject?.subjectId;
        if (typeof id !== 'string') {
            id = "";
        }
        return { imageUrl, title, description, id };
    };

    return (
        <div className="relative h-[56.25vw] min-h-[60vh] w-full group overflow-hidden">
            {/* Background Images - Transition Group or simple absolute positioning */}
            {items.map((item, index) => {
                const { imageUrl, title } = getData(item);
                if (!imageUrl) return null;
                return (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        <Image
                            src={imageUrl}
                            alt={title || "Banner"}
                            fill
                            className="object-cover brightness-75"
                            priority={index === 0} // High priority for first image
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                    </div>
                );
            })}


            {/* Content Overlay */}
            <div className="absolute top-[30%] md:top-[40%] ml-4 md:ml-16 w-[90%] md:w-[40%] z-20">
                {/* We render content for current index */}
                {(() => {
                    const { title, description, id } = getData(currentItem);
                    return (
                        <div className="animate-fade-in">
                            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-md mb-4 transition-all duration-500">
                                {title}
                            </h1>
                            <p className="text-white text-sm md:text-lg drop-shadow-md mb-6 line-clamp-3 transition-all duration-500 delay-100">
                                {description}
                            </p>
                            <div className="flex flex-row gap-3 transition-all duration-500 delay-200">
                                <Link
                                    href={`/movie/${id}`}
                                    className="bg-white text-black py-2 px-4 md:px-6 rounded flex items-center gap-2 hover:bg-opacity-80 transition font-semibold"
                                >
                                    <Play className="w-5 h-5 fill-black" /> Play
                                </Link>
                                <Link
                                    href={`/movie/${id}`}
                                    className="bg-gray-500/70 text-white py-2 px-4 md:px-6 rounded flex items-center gap-2 hover:bg-opacity-50 transition font-semibold"
                                >
                                    <Info className="w-5 h-5" /> More Info
                                </Link>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Navigation Buttons (visible on hover) */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 rounded-full hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <ChevronLeft className="w-8 h-8" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 rounded-full hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <ChevronRight className="w-8 h-8" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                {items.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all border border-white/50 ${index === currentIndex ? 'bg-white scale-125' : 'bg-transparent hover:bg-white/50'}`}
                    />
                ))}
            </div>
        </div>
    );
}
