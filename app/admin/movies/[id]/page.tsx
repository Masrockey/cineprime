import { getMovieDetail, getSources, SourceData, Subject, Resource } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { MoveLeft, PlayCircle, Download } from 'lucide-react';
import Link from 'next/link';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

// ... imports
import { EpisodeSelector } from '@/components/admin/EpisodeSelector';

interface MovieDetailPageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ season?: string; episode?: string }>;
}

export default async function MovieDetailPage({ params, searchParams }: MovieDetailPageProps) {
    const { id } = await params;
    const { season, episode } = await searchParams;

    let movie: Subject | null = null;
    let resource: Resource | undefined = undefined;
    let sources: SourceData[] = [];
    let errorMsg = '';

    // Parse params or default to 0
    let currentSeason = season ? parseInt(season) : 0;
    let currentEpisode = episode ? parseInt(episode) : 0;

    // Valid flags
    let isSeries = false;
    let showSources = false;

    try {
        const detail = await getMovieDetail(id);
        movie = detail.subject;
        resource = detail.resource;
        isSeries = movie.subjectType === 2;

        if (isSeries) {
            // For Series, only fetch if season/episode are explicitly selected
            if (currentSeason > 0 && currentEpisode > 0) {
                const sourceData = await getSources(id, movie.detailPath, currentSeason, currentEpisode);
                sources = sourceData.sources || [];
                showSources = true;
            } else {
                // Nothing selected yet, or invalid
                showSources = false;
            }
        } else {
            // Movies: always fetch 0,0
            const sourceData = await getSources(id, movie.detailPath, 0, 0);
            sources = sourceData.sources || [];
            showSources = true;
        }

    } catch (e: any) {
        console.error("Error fetching detail:", e);
        errorMsg = e.message;
    }

    if (errorMsg || !movie) {
        return (
            <div className="space-y-6">
                <Link href="/admin/movies">
                    <Button variant="ghost" className="gap-2 text-gray-400 hover:text-white">
                        <MoveLeft className="h-4 w-4" /> Back to Movies
                    </Button>
                </Link>
                <div className="p-4 text-red-500 bg-red-500/10 rounded border border-red-500/20">
                    Error loading movie: {errorMsg}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/movies">
                    <Button variant="outline" size="icon" className="h-9 w-9 border-gray-700 bg-transparent text-gray-400 hover:text-white hover:bg-gray-800">
                        <MoveLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight text-white line-clamp-1">{movie.title}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
                {/* Poster Column */}
                <div className="space-y-4">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-gray-800 shadow-xl">
                        <Image
                            src={movie.cover?.url || (movie.image?.url ?? '/placeholder.png')}
                            alt={movie.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>

                {/* Details Column */}
                <div className="space-y-6">
                    <Card className="bg-[#141414] border-gray-800 text-white">
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Synopsis</h3>
                                <p className="text-gray-300 leading-relaxed text-sm">
                                    {movie.description || "No description available."}
                                </p>
                            </div>

                            <Separator className="bg-gray-800" />

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <h3 className="text-gray-500 mb-1">Release Date</h3>
                                    <p>{movie.releaseDate || 'Unknown'}</p>
                                </div>
                                <div>
                                    <h3 className="text-gray-500 mb-1">IMDb Rating</h3>
                                    <div className="flex items-center gap-1">
                                        <span className="text-yellow-500 font-bold">{movie.imdbRatingValue}</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-gray-500 mb-1">Genre</h3>
                                    <p>{movie.genre || 'Unknown'}</p>
                                </div>
                                <div>
                                    <h3 className="text-gray-500 mb-1">Country</h3>
                                    <p>{movie.countryName || 'Unknown'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#141414] border-gray-800 text-white">
                        <CardHeader>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Streaming Sources</CardTitle>
                                        <CardDescription>Available video sources for playback.</CardDescription>
                                    </div>
                                    {isSeries && currentSeason > 0 && (
                                        <Badge variant="outline" className="text-primary border-primary/50">
                                            Season {currentSeason} - Episode {currentEpisode}
                                        </Badge>
                                    )}
                                </div>

                                {isSeries && resource?.seasons && (
                                    <EpisodeSelector
                                        seasons={resource.seasons}
                                        currentSeason={currentSeason}
                                        currentEpisode={currentEpisode}
                                    />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {!showSources && isSeries ? (
                                <div className="text-center py-8 text-gray-500">
                                    Please select an episode to view sources.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-gray-800 hover:bg-transparent">
                                            <TableHead className="text-gray-400">Quality</TableHead>
                                            <TableHead className="text-gray-400">Size</TableHead>
                                            <TableHead className="text-gray-400 text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sources.map((source, idx) => (
                                            <TableRow key={idx} className="border-gray-800 hover:bg-gray-900/50">
                                                <TableCell className="font-medium">
                                                    <Badge variant="secondary" className="bg-gray-800 hover:bg-gray-700">
                                                        {source.resolution}p
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-gray-400 font-mono text-xs">{source.size || '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={source.url} target="_blank">
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10">
                                                            <PlayCircle className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {sources.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center text-gray-500 py-4">
                                                    No sources found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
