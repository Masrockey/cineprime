
import { getTrending, Subject, TrendingResponse } from '@/lib/api';
import { getDracinRecommend, DramaboxItem } from '@/lib/dramabox';
import MovieCard from '@/components/MovieCard';
import Link from 'next/link';

export const revalidate = 3600;

export default async function TrendingPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const { page: pageParam } = await searchParams;
    const page = parseInt(pageParam || "1", 10);

    let trendingData: TrendingResponse = { subjectList: [], pager: { hasMore: false, nextPage: "1", page: "0", perPage: 0, totalCount: 0 } };
    let dracinData: DramaboxItem[] = [];

    try {
        const [trendingRes, dracinRes] = await Promise.all([
            getTrending(page),
            getDracinRecommend(page, 20)
        ]);
        trendingData = trendingRes;
        dracinData = dracinRes;
    } catch (e) {
        console.error("Failed to fetch trending:", e);
    }

    const { subjectList, pager } = trendingData;

    // Map Dracin Data to Subject
    const dracinSubjects: Subject[] = dracinData.map(d => ({
        subjectId: d.id.toString(),
        subjectType: 3,
        title: d.name,
        description: d.introduction,
        releaseDate: "",
        genre: d.tags.join(", "),
        cover: { url: d.cover, width: 300, height: 450 },
        image: { url: d.cover, width: 300, height: 450 },
        countryName: "China",
        imdbRatingValue: "N/A",
        detailPath: `/dracin/${d.id}`,
        isDracin: true
    }));

    // Interleave or merge lists
    // Simple merge: [...subjectList, ...dracinSubjects]
    // Or interleave for better diversity
    const combinedList: Subject[] = [];
    const maxLength = Math.max(subjectList.length, dracinSubjects.length);
    for (let i = 0; i < maxLength; i++) {
        if (i < subjectList.length) combinedList.push(subjectList[i]);
        if (i < dracinSubjects.length) combinedList.push(dracinSubjects[i]);
    }

    return (
        <div className="min-h-screen pt-24 px-4 md:px-16" >
            <h1 className="text-3xl font-bold text-white mb-8">Trending Now</h1>
            {combinedList.length === 0 ? (
                <div className="text-gray-500">No trending content found.</div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
                        {combinedList.map((movie) => (
                            <MovieCard key={`${movie.isDracin ? 'd' : 'm'}-${movie.subjectId}`} movie={movie} />
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center gap-4 pb-12">
                        {page > 1 && (
                            <Link
                                href={`/trending?page=${page - 1}`}
                                className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
                            >
                                Previous
                            </Link>
                        )}

                        <span className="px-4 py-2 text-gray-400 flex items-center">
                            Page {page}
                        </span>

                        {/* Use pager.hasMore from main API, effectively limiting Dracin nav to main API limits unless we want infinite dracin pages */}
                        {pager.hasMore && (
                            <Link
                                href={`/trending?page=${page + 1}`}
                                className="px-6 py-2 bg-primary text-white rounded hover:bg-red-700 transition"
                            >
                                Next
                            </Link>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
