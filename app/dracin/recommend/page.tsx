import { getDracinRecommend } from '@/lib/dramabox';
import DracinCard from '@/components/DracinCard';

export default async function DracinRecommendPage() {
    const items = await getDracinRecommend(1, 40); // Fetch a good amount

    return (
        <div className="pt-24 px-4 md:px-16 min-h-screen">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Just For You</h1>
                <p className="text-gray-400">Chinese dramas for you.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {items.length > 0 ? (
                    items.map((item, idx) => (
                        <DracinCard key={`${item.id}-${idx}`} item={item} />
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500 py-20">
                        No recommendations found.
                    </div>
                )}
            </div>
        </div>
    );
}
