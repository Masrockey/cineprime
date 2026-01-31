import { getDracinCategories } from '@/lib/dramabox';
import Link from 'next/link';

export default async function DracinCategoriesPage() {
    const categories = await getDracinCategories();

    return (
        <div className="pt-24 px-4 md:px-16 min-h-screen">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Categories</h1>
                <p className="text-gray-400">Browse by category.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.length > 0 ? (
                    categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/dracin/category/${cat.id}`}
                            className="bg-[#141414] border border-gray-800 hover:border-[#E50914] text-gray-300 hover:text-white p-4 rounded-md transition-colors flex items-center justify-center text-center font-medium"
                        >
                            {cat.name}
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500 py-20">
                        No categories found.
                    </div>
                )}
            </div>
        </div>
    );
}
