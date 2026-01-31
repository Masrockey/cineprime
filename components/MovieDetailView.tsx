'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Play } from 'lucide-react';
import { MovieDetail, getSources, generateStreamLink, getRecommendations, Subject } from '@/lib/api';
import VideoPlayer from './VideoPlayer';
import MovieRow from './MovieRow';
import BookmarkButton from './BookmarkButton';

interface MovieDetailViewProps {
    detail: MovieDetail;
}

export default function MovieDetailView({ detail }: MovieDetailViewProps) {
    const { subject, resource } = detail;
    const isSeries = subject.subjectType === 2;

    // Series State
    const [selectedSeason, setSelectedSeason] = useState(isSeries && resource?.seasons?.[0]?.se || 0);
    const [selectedEpisode, setSelectedEpisode] = useState(1);

    // Player State
    const [isPlaying, setIsPlaying] = useState(false);
    const [streamUrl, setStreamUrl] = useState<string | null>(null);
    const [captions, setCaptions] = useState<any[]>([]); // Use appropriate type if imported or allow implicit
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Recommendations State
    const [recommendations, setRecommendations] = useState<Subject[]>([]);

    const currentSeason = resource?.seasons?.find(s => s.se === selectedSeason);
    const episodeCount = currentSeason?.maxEp || 0;

    const [sources, setSources] = useState<any[]>([]);
    const [currentQuality, setCurrentQuality] = useState(0);
    const [historyResume, setHistoryResume] = useState<{ episode?: number; season?: number; position?: number } | null>(null);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchRecs = async () => {
            if (subject?.subjectId) {
                try {
                    const recs = await getRecommendations(subject.subjectId);
                    setRecommendations(recs);
                } catch (e) {
                    console.error("Failed to fetch recommendations", e);
                }
            }
        };
        fetchRecs();
    }, [subject?.subjectId]);

    const searchParams = useSearchParams();

    useEffect(() => {
        const fetchHistory = async () => {
            if (!subject?.subjectId) return;
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('history')
                .select('*')
                .eq('user_id', user.id)
                .eq('subject_id', subject.subjectId)
                .single();

            if (data) {
                setHistoryResume({
                    episode: data.episode || 1,
                    season: data.season || 0,
                    position: data.last_position
                });

                if (isSeries) {
                    if (data.season) setSelectedSeason(data.season);
                    if (data.episode) setSelectedEpisode(data.episode);
                }

                // Autoplay after history is set
                const autoplay = searchParams?.get('autoplay');
                if (autoplay === 'true') {
                    // Small delay to ensure state is committed
                    setTimeout(() => {
                        handlePlay(data.season || 0, data.episode || 1);
                    }, 500);
                }
            }
        };
        fetchHistory();
    }, [subject?.subjectId, isSeries, searchParams]);

    const handlePlay = async (sOverride?: number, eOverride?: number) => {
        // Check Auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }

        if (isPlaying) return;
        setLoading(true);
        setError('');
        try {
            // Fetch Source
            const s = sOverride !== undefined ? sOverride : (isSeries ? selectedSeason : 0);
            const e = eOverride !== undefined ? eOverride : (isSeries ? selectedEpisode : 0);

            // ... rest of logic
            const data = await getSources(subject.subjectId, subject.detailPath, s, e);
            const { sources: fetchedSources, captions: fetchedCaptions } = data;

            if (!fetchedSources || fetchedSources.length === 0) {
                throw new Error("Source not found");
            }

            // Pick best quality (max resolution)
            const sorted = fetchedSources.sort((a, b) => b.resolution - a.resolution);
            const bestSource = sorted[0];

            if (!bestSource || !bestSource.url) {
                throw new Error("Playable URL not found");
            }

            // Generate Link
            const link = await generateStreamLink(bestSource.url);
            if (!link) throw new Error("Stream link generation failed");

            setSources(sorted);
            setStreamUrl(link);
            setCaptions(fetchedCaptions);
            setCurrentQuality(bestSource.resolution);
            setIsPlaying(true);
        } catch (err) {
            console.error(err);
            setError("Failed to load video. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const changeQuality = async (source: any) => {
        try {
            const link = await generateStreamLink(source.url);
            if (link) {
                setStreamUrl(link);
                setCurrentQuality(source.resolution);
            }
        } catch (e) {
            console.error("Failed to change quality", e);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#141414] text-white font-sans">
            {/* Background Image / Backdrop */}
            <div className="absolute top-0 left-0 w-full h-[70vh] opacity-50 z-0">
                <Image
                    src={subject.cover?.url || subject.image?.url || ''}
                    alt={subject.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 pt-[20vh] px-4 md:px-16 flex flex-col md:flex-row gap-8">
                {/* Poster */}
                <div className="flex-shrink-0 w-[200px] md:w-[300px] h-[300px] md:h-[450px] relative rounded shadow-2xl">
                    <Image
                        src={subject.cover?.url || ''}
                        alt={subject.title}
                        fill
                        className="object-cover rounded"
                    />
                </div>

                {/* Details */}
                <div className="flex-1 mt-4 md:mt-0">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{subject.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-6 flex-wrap">
                        <span>{subject.releaseDate}</span>
                        <span className="border border-gray-600 px-1 text-xs rounded">HD</span>
                        <span>{subject.genre}</span>
                        <span>{subject.duration ? `${Math.round(subject.duration / 60)}m` : ''}</span>
                        {subject.countryName && <span>• {subject.countryName}</span>}
                        {subject.imdbRatingValue && (
                            <span className="flex items-center gap-1 text-yellow-500">
                                ⭐ {subject.imdbRatingValue}
                            </span>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="space-y-6 mb-8">
                        {isSeries && (
                            <div className="space-y-4 bg-[#1f1f1f] p-4 rounded-lg max-w-xl">
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-400">Season</span>
                                    <select
                                        value={selectedSeason}
                                        onChange={(e) => {
                                            setSelectedSeason(Number(e.target.value));
                                            setSelectedEpisode(1);
                                        }}
                                        className="bg-black border border-gray-700 rounded px-2 py-1"
                                    >
                                        {resource?.seasons?.map(s => (
                                            <option key={s.se} value={s.se}>Season {s.se}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <span className="text-gray-400 block mb-2">Episode: {selectedEpisode}</span>
                                    <div className="grid grid-cols-5 md:grid-cols-8 gap-2 max-h-40 overflow-y-auto no-scrollbar">
                                        {Array.from({ length: episodeCount }, (_, i) => episodeCount - i).map(ep => (
                                            <button
                                                key={ep}
                                                onClick={() => setSelectedEpisode(ep)}
                                                className={`py-2 px-1 rounded text-center text-sm font-medium transition ${selectedEpisode === ep
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                                    }`}
                                            >
                                                {ep}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => handlePlay()}
                                disabled={loading}
                                className={`
                                    flex items-center gap-2 bg-white text-black px-8 py-3 rounded font-bold text-xl hover:bg-gray-200 transition
                                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                {loading ? 'Loading...' : (
                                    <>
                                        <Play className="w-6 h-6 fill-black" />
                                        {isSeries ? `Play S${selectedSeason} E${selectedEpisode}` : 'Play Movie'}
                                    </>
                                )}
                            </button>
                            <BookmarkButton
                                id={subject.subjectId}
                                type="movie"
                                title={subject.title}
                                poster={subject.cover?.url || subject.image?.url || ''}
                                className="h-[52px] w-[52px] bg-[#1f1f1f] border-gray-700 hover:bg-[#333]"
                            />
                        </div>
                        {error && (
                            <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded mt-4">
                                <p className="font-semibold">{error}</p>
                            </div>
                        )}
                    </div>

                    <p className="text-lg text-gray-200 mb-8 max-w-2xl leading-relaxed">
                        {subject.description}
                    </p>

                    {/* Cast and More Info */}
                    <div className="mb-8 max-w-3xl">
                        {detail.stars && detail.stars.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-gray-400 font-bold mb-2">Cast</h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-300">
                                    {detail.stars.map((star: any, index: number) => (
                                        <div key={index} className="flex items-center gap-2 bg-[#1f1f1f] px-3 py-1 rounded-full">
                                            {star.avatarUrl || star.avatar || star.image ? (
                                                <Image
                                                    src={star.avatarUrl || star.avatar || star.image}
                                                    alt={star.name}
                                                    width={24}
                                                    height={24}
                                                    className="rounded-full object-cover"
                                                />
                                            ) : null}
                                            <span>{star.name}</span>
                                            {star.character && <span className="text-gray-500 text-xs">as {star.character}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div className="relative z-10 w-full pb-16">
                    <MovieRow title="More Like This" movies={recommendations} />
                </div>
            )}

            {isPlaying && streamUrl && (
                <VideoPlayer
                    url={streamUrl}
                    captions={captions}
                    sources={sources}
                    currentResolution={currentQuality}
                    onQualityChange={changeQuality}
                    onClose={() => setIsPlaying(false)}
                    // History Data
                    subjectId={subject.subjectId}
                    type={isSeries ? 'series' : 'movie'}
                    title={subject.title}
                    poster={subject.cover?.url || subject.image?.url || ''}
                    season={isSeries ? selectedSeason : undefined}
                    episode={isSeries ? selectedEpisode : undefined}
                    startTime={(historyResume?.season === selectedSeason && historyResume?.episode === selectedEpisode) || (!isSeries && historyResume) ? historyResume?.position : 0}
                />
            )}
        </div>
    );
}
