import { getDracinCategoryDetail } from '@/lib/dramabox';
import DracinCard from '@/components/DracinCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ page?: string }>;
}

export default async function DracinCategoryDetailPage(props: PageProps) {
    const params = await props.params;
    const searchParams = await props.searchParams;

    if (!params.id) redirect('/dracin/categories');

    const page = Number(searchParams.page) || 1;
    const { books, categoryName, totalPages } = await getDracinCategoryDetail(params.id, page, 20);

    return (
        <div className="pt-24 px-4 md:px-16 min-h-screen">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">{categoryName || `Category ${params.id}`}</h1>
                <p className="text-gray-400">Browse dramas in this category.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {books.length > 0 ? (
                    books.map((item, idx) => (
                        <DracinCard key={`${item.id}-${idx}`} item={item} />
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500 py-20">
                        No dramas found in this category.
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-4 mt-8 pb-8">
                    <Button
                        disabled={page <= 1}
                        variant="outline"
                        className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700 hover:text-white disabled:opacity-50"
                        asChild
                    >
                        {page > 1 ? (
                            <Link href={`/dracin/category/${params.id}?page=${page - 1}`}>
                                Previous
                            </Link>
                        ) : (
                            <span>Previous</span>
                        )}
                    </Button>
                    <span className="flex items-center text-white px-4">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        disabled={page >= totalPages}
                        variant="outline"
                        className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700 hover:text-white disabled:opacity-50"
                        asChild
                    >
                        {page < totalPages ? (
                            <Link href={`/dracin/category/${params.id}?page=${page + 1}`}>
                                Next
                            </Link>
                        ) : (
                            <span>Next</span>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
