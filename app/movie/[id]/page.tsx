import { getMovieDetail } from '@/lib/api';
import MovieDetailView from '@/components/MovieDetailView';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function MoviePage({ params }: PageProps) {
    const { id } = await params;

    if (!id || id === '[object Object]') {
        return <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">Invalid Movie ID</div>;
    }

    try {
        const detail = await getMovieDetail(id);
        return <MovieDetailView detail={detail} />;
    } catch (e) {
        // Silently handle error for invalid IDs
        return (
            <div className="min-h-screen bg-[#141414] text-white flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Movie Not Found</h1>
                <p className="text-gray-400">The content you are looking for does not exist or has been removed.</p>
                <a href="/" className="bg-red-600 px-6 py-2 rounded-full hover:bg-red-700 transition">Go Home</a>
            </div>
        );
    }
}
