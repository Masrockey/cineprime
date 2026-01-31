import { getDracinHome } from '@/lib/dramabox';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import DracinCard from '@/components/DracinCard';

interface DracinPageProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function DracinPage({ searchParams }: DracinPageProps) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const size = 24;
    const dracinList = await getDracinHome(page, size);

    return (
        <div className="pt-24 px-4 md:px-16 min-h-screen pb-10">
            <h1 className="text-2xl font-bold text-white mb-2">Chinese Drama</h1>
            <div className="flex items-center gap-4 text-sm md:text-base text-gray-400 mb-6">
                <Link href="/dracin/vip" className="hover:text-red-600 transition">VIP</Link>
                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                <Link href="/dracin/recommend" className="hover:text-red-600 transition">Recommend</Link>
                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                <Link href="/dracin/categories" className="hover:text-red-600 transition">Categories</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                {dracinList.map((item) => (
                    <DracinCard key={item.id} item={item} />
                ))}
            </div>

            {dracinList.length === 0 && (
                <div className="text-gray-500 text-center py-10">No dramas found.</div>
            )}

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 mt-8">
                <Link href={page > 1 ? `/dracin?page=${page - 1}` : '#'}>
                    <Button variant="outline" disabled={page <= 1} className="flex items-center gap-1 bg-black/50 text-white border-gray-700 hover:bg-gray-800">
                        Previous
                    </Button>
                </Link>

                <span className="text-white font-medium">Page {page}</span>

                <Link href={dracinList.length === size ? `/dracin?page=${page + 1}` : '#'}>
                    <Button
                        variant="outline"
                        disabled={dracinList.length < size}
                        className="flex items-center gap-1 bg-black/50 text-white border-gray-700 hover:bg-gray-800"
                    >
                        Next
                    </Button>
                </Link>
            </div>
        </div>
    );
}
