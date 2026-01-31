'use client';

import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { getSearch, Subject } from '@/lib/api';
import { searchDracinAction } from './actions';
import { DramaboxItem } from '@/lib/dramabox';
import MovieCard from '@/components/MovieCard';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [searchType, setSearchType] = useState<'movie' | 'dracin'>('movie');
    const abortControllerRef = useRef<AbortController | null>(null);

    const performSearch = async (searchQuery: string, pageNum: number, append: boolean = false, typeOverride?: 'movie' | 'dracin') => {
        const currentType = typeOverride || searchType;

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setLoading(true);
        if (!append) setResults([]);

        try {
            let movieList: Subject[] = [];
            let dracinList: Subject[] = [];
            let moviesHasMore = false;
            let dracinHasMore = false;

            if (currentType === 'movie') {
                const moviesData = await getSearch(searchQuery, pageNum, controller.signal);
                if (controller.signal.aborted) return;
                movieList = Array.isArray(moviesData) ? moviesData : ((moviesData as any).items || (moviesData as any).list || (moviesData as any).subjects || (moviesData as any).searchList || []);
                moviesHasMore = (moviesData as any).pager?.hasMore || false;
            } else {
                const dracinData = await searchDracinAction(searchQuery, pageNum);
                if (controller.signal.aborted) return;
                dracinList = (dracinData as DramaboxItem[]).map(item => ({
                    subjectId: item.id.toString(),
                    title: item.name,
                    cover: { url: item.cover, width: 0, height: 0 },
                    image: { url: item.cover, width: 0, height: 0 },
                    rate: 'N/A',
                    isDracin: true,
                    subjectType: 0,
                    description: item.introduction || '',
                    releaseDate: '',
                    genre: item.tags ? item.tags.join(', ') : '',
                    originalTitle: item.name,
                    viewCount: item.playCount || 0,
                    rec: false,
                    countryName: 'CN',
                    imdbRatingValue: 'N/A',
                    detailPath: `/dracin/${item.id}`
                }));
                dracinHasMore = Array.isArray(dracinData) && dracinData.length >= 20;
            }

            // Unified list (though now they are separate, deduplication is still good practice)
            const combined = [...movieList, ...dracinList];
            const uniqueList = Array.from(new Map(combined.map((item: Subject) => [item.subjectId, item])).values()) as Subject[];

            if (append) {
                setResults(prev => {
                    const newCombined = [...prev, ...uniqueList];
                    return Array.from(new Map(newCombined.map((item: Subject) => [item.subjectId, item])).values()) as Subject[];
                });
            } else {
                setResults(uniqueList);
            }

            setHasMore(currentType === 'movie' ? moviesHasMore : dracinHasMore);

        } catch (error: any) {
            if (error.name === 'AbortError') return;
            console.error(error);
        } finally {
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim()) {
                setPage(1);
                performSearch(query, 1, false, searchType);
            } else {
                setResults([]);
                setHasMore(false);
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
            }
        }, 800);

        return () => {
            clearTimeout(delayDebounceFn);
        };
    }, [query, searchType]);

    const handleTypeChange = (type: 'movie' | 'dracin') => {
        if (type === searchType) return;
        setSearchType(type);
        setPage(1);
        setResults([]);
        setHasMore(false);
        if (query.trim()) {
            performSearch(query, 1, false, type);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        performSearch(query, nextPage, true);
    };

    return (
        <div className="min-h-screen bg-[#141414]">
            {/* Fixed Search Type & Input Header */}
            <div className="fixed top-[60px] left-0 w-full z-40 bg-[#141414]/95 backdrop-blur-md border-b border-white/5 px-4 md:px-16 pt-4 pb-0 transition-all">
                <div className="max-w-4xl mx-auto space-y-4 pb-4">
                    {/* Search Type Selector */}
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={() => handleTypeChange('movie')}
                            className={`flex-1 md:flex-none md:min-w-[120px] px-6 py-2 rounded-full font-bold transition-all text-sm md:text-base border ${searchType === 'movie'
                                ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-900/40'
                                : 'bg-[#1f1f1f] text-gray-400 border-gray-800 hover:bg-[#252525] hover:text-white'
                                }`}
                        >
                            Film
                        </button>
                        <button
                            onClick={() => handleTypeChange('dracin')}
                            className={`flex-1 md:flex-none md:min-w-[120px] px-6 py-2 rounded-full font-bold transition-all text-sm md:text-base border ${searchType === 'dracin'
                                ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-900/40'
                                : 'bg-[#1f1f1f] text-gray-400 border-gray-800 hover:bg-[#252525] hover:text-white'
                                }`}
                        >
                            Dracin
                        </button>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={`Search ${searchType === 'movie' ? 'movies' : 'dramas'}...`}
                            className="w-full bg-[#1f1f1f] border border-gray-700 text-white px-12 py-3 rounded-full text-lg focus:outline-none focus:border-red-600 transition-colors shadow-lg"
                            autoFocus
                        />
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Results Content - Padded to start below fixed headers */}
            <div className="pt-56 px-4 md:px-16 pb-20">

                {loading && page === 1 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-gray-500 animate-pulse font-medium">Searching {searchType === 'movie' ? 'Movies' : 'Dramas'}...</div>
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {results.map((item) => (
                        <MovieCard key={`${item.isDracin ? 'd-' : 'm-'}${item.subjectId}`} movie={item} />
                    ))}
                </div>

                {!loading && hasMore && results.length > 0 && query && (
                    <div className="flex justify-center mt-12">
                        <button
                            onClick={handleLoadMore}
                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition-colors shadow-lg active:scale-95 transform"
                        >
                            Load More
                        </button>
                    </div>
                )}

                {loading && page > 1 && (
                    <div className="text-center text-gray-500 mt-8 animate-pulse">Loading more {searchType === 'movie' ? 'movies' : 'dramas'}...</div>
                )}

                {!loading && query && results.length === 0 && (
                    <div className="text-center text-gray-400 mt-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <p className="text-xl font-bold text-white">No results found</p>
                        <p className="text-sm mt-2 text-gray-500">
                            We couldn't find any {searchType === 'movie' ? 'movies' : 'dramas'} matching "{query}".
                        </p>
                        <p className="text-sm text-gray-500">Try adjusting your search or switching categories.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
