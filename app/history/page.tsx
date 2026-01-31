import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Play } from "lucide-react";

export default async function HistoryPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: history, error } = await supabase
        .from("history")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

    if (error) {
        console.error("Error fetching history:", error);
        return <div className="min-h-screen pt-24 text-white text-center">Error loading history</div>;
    }

    return (
        <div className="min-h-screen bg-[#050B14] text-white pt-24 pb-12 px-4 md:px-16">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/profile" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </Link>
                    <h1 className="text-3xl font-bold">Watch History</h1>
                </div>

                {history.length === 0 ? (
                    <div className="text-center text-gray-400 py-20">
                        <p className="text-xl">No history yet.</p>
                        <Link href="/" className="text-red-500 hover:underline mt-4 inline-block">Start watching</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {history.map((item) => {
                            const progress = item.duration > 0 ? (item.last_position / item.duration) * 100 : 0;
                            const href = item.type === 'dracin'
                                ? `/dracin/watch/${item.subject_id}/${item.episode || 0}`
                                : `/movie/${item.subject_id}?autoplay=true`;

                            return (
                                <Link
                                    key={item.id}
                                    href={href}
                                    className="group bg-[#141414] rounded-lg overflow-hidden border border-gray-800 transition hover:border-red-600"
                                >
                                    <div className="relative aspect-video">
                                        {item.poster ? (
                                            <Image
                                                src={item.poster}
                                                alt={item.title}
                                                fill
                                                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                                                No Image
                                            </div>
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-red-600 rounded-full p-2">
                                                <Play className="w-6 h-6 fill-white text-white" />
                                            </div>
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800">
                                            <div
                                                className="h-full bg-red-600"
                                                style={{ width: `${Math.min(100, progress)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg line-clamp-1 mb-1">{item.title}</h3>
                                        <div className="flex items-center justify-between text-sm text-gray-400">
                                            <span>
                                                {item.type === 'series' && `S${item.season} E${item.episode}`}
                                                {item.type === 'dracin' && `Episode ${Number(item.episode) + 1}`}
                                                {item.type === 'movie' && 'Movie'}
                                            </span>
                                            <span>{Math.floor(item.last_position / 60)}m left</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
