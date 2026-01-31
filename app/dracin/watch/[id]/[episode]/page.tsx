import { getDracinStream, getDracinDetail } from '@/lib/dramabox';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { List, ArrowRight, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import { DracinPlayer } from '@/components/DracinPlayer';

interface DracinWatchPageProps {
    params: Promise<{ id: string; episode: string }>;
}


export default async function DracinWatchPage({ params }: DracinWatchPageProps) {
    const { id, episode } = await params;
    const episodeNum = parseInt(episode);

    // Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch stream URL
    const streamUrl = await getDracinStream(id, episodeNum);

    // Fetch detail for title and navigation context
    const { drama } = await getDracinDetail(id);

    if (!streamUrl) {
        return (
            <div className="pt-24 px-4 text-center text-white">
                <h1 className="text-2xl font-bold mb-4">Error</h1>
                <p className="mb-8">Could not load stream for Episode {episode}. It might be a premium/VIP episode or API error.</p>
                <Link href={`/dracin/${id}`}>
                    <Button variant="outline">Back to Detail</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="pt-20 min-h-screen bg-black flex flex-col items-center">
            {/* Player Container */}
            <div className="w-full max-w-5xl aspect-video bg-black relative shadow-2xl">
                <DracinPlayer
                    id={id}
                    episode={episodeNum}
                    title={drama?.name || 'Unknown Drama'}
                    poster={drama?.cover || ''}
                    streamUrl={streamUrl}
                />
            </div>

            {/* Info & Navigation */}
            <div className="w-full max-w-5xl px-4 py-6 text-white">
                <div className="mb-6">
                    <h1 className="text-xl md:text-2xl font-bold mb-6 text-center">
                        {drama?.name || 'Unknown Drama'} - Episode {episodeNum + 1}
                    </h1>

                    <div className="grid grid-cols-3 items-center">
                        {/* Left: Previous */}
                        <div className="flex justify-start">
                            {episodeNum > 0 ? (
                                <Link href={`/dracin/watch/${id}/${episodeNum - 1}`}>
                                    <Button variant="outline" className="border-gray-700">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Previous
                                    </Button>
                                </Link>
                            ) : (
                                <div />
                            )}
                        </div>

                        {/* Center: Back */}
                        <div className="flex justify-center">
                            <Link href={`/dracin/${id}`}>
                                <Button variant="ghost" className="bg-[#141414] hover:bg-[#b00710] text-white">
                                    <List className="w-4 h-4 mr-2" />
                                    List
                                </Button>
                            </Link>
                        </div>

                        {/* Right: Next */}
                        <div className="flex justify-end">
                            <Link href={`/dracin/watch/${id}/${episodeNum + 1}`}>
                                <Button className="bg-[#E50914] hover:bg-[#b00710] text-white">
                                    Next
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
