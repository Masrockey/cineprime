import { searchDracin } from '@/lib/dramabox';
import DracinCard from '@/components/DracinCard';

interface SearchPageProps {
    searchParams: Promise<{ q: string }>;
}

export default async function DracinSearchPage({ searchParams }: SearchPageProps) {
    const { q } = await searchParams;
    const items = q ? await searchDracin(q, 1, 40) : [];

    return (
        <div className="pt-24 px-4 md:px-16 min-h-screen">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Search Results</h1>
                <p className="text-gray-400">
                    {q ? `Results for "${q}"` : 'Enter a keyword to search'}
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {items.length > 0 ? (
                    items.map((item, idx) => (
                        <DracinCard key={`${item.id}-${idx}`} item={item} />
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500 py-20">
                        {q ? 'No results found.' : 'Waiting for input...'}
                    </div>
                )}
            </div>
        </div>
    );
}
