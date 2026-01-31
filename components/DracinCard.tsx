'use client';

import Image from 'next/image';
import Link from 'next/link';
import { DramaboxItem } from '@/lib/dramabox';

interface DracinCardProps {
    item: DramaboxItem;
}

export default function DracinCard({ item }: DracinCardProps) {
    if (!item.cover) return null;

    return (
        <Link href={`/dracin/${item.id}`} className="group relative w-full aspect-[2/3] cursor-pointer transition duration-200 ease-in-out md:hover:scale-110 md:hover:z-50">
            <div className="relative w-full h-full rounded overflow-hidden">
                <Image
                    src={item.cover}
                    alt={item.name}
                    fill
                    className="object-cover rounded"
                    sizes="(max-width: 768px) 150px, 200px"
                    unoptimized
                />
                <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-xs text-white">
                    {item.chapterCount} Eps
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-2">
                    <p className="text-white text-sm font-bold text-center w-full">{item.name}</p>
                </div>
            </div>
        </Link>
    );
}
