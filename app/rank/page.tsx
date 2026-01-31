
import { getRank, Subject } from '@/lib/api';
import MovieRow from '@/components/MovieRow';

export const revalidate = 3600;

export default async function RankPage() {
    let rankData: { movie: Subject[]; tv: Subject[] } = { movie: [], tv: [] };
    try {
        rankData = await getRank();
    } catch (e) {
        console.error("Failed to fetch rank:", e);
    }

    return (
        <div className="min-h-screen pt-24 pb-16" >
            <h1 className="text-3xl font-bold text-white mb-8 px-4 md:px-16">Top Ranked</h1>

            <div className="flex flex-col gap-8">
                {rankData.movie && rankData.movie.length > 0 && (
                    <MovieRow title="Top Rated Movies" movies={rankData.movie} />
                )}
                {rankData.tv && rankData.tv.length > 0 && (
                    <MovieRow title="Top Rated TV Shows" movies={rankData.tv} />
                )}

                {(!rankData.movie || rankData.movie.length === 0) && (!rankData.tv || rankData.tv.length === 0) && (
                    <div className="text-gray-500 px-4 md:px-16">No ranking data available.</div>
                )}
            </div>
        </div>
    );
}
