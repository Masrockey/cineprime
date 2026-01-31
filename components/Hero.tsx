'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play, Info } from 'lucide-react';
import { Subject, BannerItem } from '@/lib/api';

interface HeroProps {
    item: BannerItem | Subject;
}

export default function Hero({ item }: HeroProps) {
    // Prefer 'image' (often wider/better for banner) over 'cover', or fallback.
    // Note: API types might vary. Safe access.
    const imageUrl = (item as any).image?.url || (item as any).cover?.url || (item as any).subject?.cover?.url;
    const title = item.title || (item as any).subject?.title;
    const description = (item as any).description || (item as any).subject?.description || "No description available.";

    let id = item.subjectId || (item as any).subject?.subjectId;
    if (typeof id !== 'string') {
        console.warn("Hero item ID is not a string:", id);
        id = "";
    }

    if (!imageUrl) return null;

    return (
        <div className="relative h-[56.25vw] min-h-[60vh] w-full">
            <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover brightness-75"
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />

            <div className="absolute top-[30%] md:top-[40%] ml-4 md:ml-16 w-[90%] md:w-[40%]">
                <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-md mb-4">
                    {title}
                </h1>
                <p className="text-white text-sm md:text-lg drop-shadow-md mb-6 line-clamp-3">
                    {description}
                </p>
                <div className="flex flex-row gap-3">
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
        </div>
    );
}
