import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";

export default async function BookmarksPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: bookmarks, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching bookmarks:", error);
        return <div className="min-h-screen pt-24 text-white text-center">Error loading bookmarks</div>;
    }

    return (
        <div className="min-h-screen bg-[#050B14] text-white pt-24 pb-12 px-4 md:px-16">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/profile" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </Link>
                    <h1 className="text-3xl font-bold">My Bookmarks</h1>
                </div>

                {bookmarks.length === 0 ? (
                    <div className="text-center text-gray-400 py-20">
                        <p className="text-xl">No bookmarks yet.</p>
                        <Link href="/" className="text-red-500 hover:underline mt-4 inline-block">Explore movies</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {bookmarks.map((item) => (
                            <Link
                                key={item.id}
                                href={item.type === 'movie' ? `/movie/${item.subject_id}` : `/dracin/${item.subject_id}`}
                                className="group relative aspect-[2/3] rounded-lg overflow-hidden border border-gray-800 bg-gray-900 transition hover:scale-105"
                            >
                                {item.poster ? (
                                    <Image
                                        src={item.poster}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                    <span className="text-white font-medium text-sm line-clamp-2">{item.title}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
