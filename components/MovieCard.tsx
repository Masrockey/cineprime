'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Subject } from '@/lib/api';

interface MovieCardProps {
    movie: Subject;
}

export default function MovieCard({ movie }: MovieCardProps) {
    const imageUrl = movie.cover?.url || movie.image?.url;
    if (!imageUrl) return null;

    const linkHref = movie.isDracin ? `/dracin/${movie.subjectId}` : `/movie/${movie.subjectId}`;

    return (
        <Link href={linkHref} className="group relative min-w-[200px] h-[300px] cursor-pointer transition duration-200 ease-in-out md:hover:scale-110 md:hover:z-50">
            <div className="relative w-full h-full rounded overflow-hidden">
                <Image
                    src={imageUrl}
                    alt={movie.title}
                    fill
                    className="object-cover rounded"
                    sizes="(max-width: 768px) 150px, 200px"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-2">
                    <p className="text-white text-sm font-bold text-center w-full">{movie.title}</p>
                </div>
            </div>
        </Link>
    );
}
