import { getDracinDetail } from '@/lib/dramabox';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import DracinEpisodeList from '@/components/DracinEpisodeList';
import BookmarkButton from '@/components/BookmarkButton';

interface DracinDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function DracinDetailPage({ params }: DracinDetailPageProps) {
    const { id } = await params;
    const { drama, chapters } = await getDracinDetail(id);

    if (!drama) {
        return <div className="pt-24 text-center text-white">Drama not found.</div>;
    }

    return (
        <div className="pt-24 px-4 md:px-16 min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
                {/* Cover Image */}
                <div className="relative aspect-[2/3] w-full max-w-[300px] mx-auto md:mx-0 rounded-lg overflow-hidden border border-gray-800 shadow-xl">
                    <Image
                        src={drama.cover || '/placeholder.png'}
                        alt={drama.name || 'Drama Cover'}
                        fill
                        className="object-cover"
                        priority
                        unoptimized
                    />
                </div>

                {/* Details */}
                <div className="space-y-6 text-white">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-3xl font-bold">{drama.name}</h1>
                            <BookmarkButton
                                id={id}
                                type="dracin"
                                title={drama.name}
                                poster={drama.cover || ''}
                            />
                        </div>
                        <div className="flex gap-2 mb-4 flex-wrap">
                            {drama.tags && drama.tags.map(tag => (
                                <Badge key={tag.tagId} variant="secondary" className="bg-gray-800">{tag.tagName}</Badge>
                            ))}
                        </div>

                        {/* Episode List */}
                        <Card className="bg-[#141414] border-gray-800 text-white mt-4 mb-6">
                            <CardHeader>
                                <CardTitle>Episodes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DracinEpisodeList chapters={chapters} bookId={id} />
                            </CardContent>
                        </Card>

                        <p className="text-gray-400">{drama.introduction}</p>
                    </div>

                    <div className="flex gap-8 text-sm text-gray-400 border-y border-gray-800 py-4">
                        <div>
                            <span className="block font-bold text-white mb-1">Chapters</span>
                            {drama.chapterCount}
                        </div>
                        <div>
                            <span className="block font-bold text-white mb-1">Views</span>
                            {drama.playCount.toLocaleString()}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
