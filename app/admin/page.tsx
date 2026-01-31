import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Film, Activity } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { getRank } from '@/lib/api';

export default async function AdminDashboard() {
    // 1. Fetch User Count
    let userCount = 0;
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1 });
        if (data) {
            // Supabase listUsers returns total if requesting? 
            // Actually perPage: 1 returns data.users which is array. 
            // Does it return total?
            // Checking docs/types: ListUsersResponse usually contains 'total'.
            // If not, I might need page 1 and no perPage or separate count.
            // listUsers returns { users: User[], aud: string } - IT DOES NOT RETURN TOTAL in some versions.
            // Wait, Supabase Admin API usually wraps it. 
            // Let's assume for now I might have to fetch all or check if metadata has it.
            // Actually, `listUsers` returns `User[]` in the data property in older versions?
            // Checking supabase-js v2: `listUsers` returns `ListUsersResponse` which has `users` and `total`.
            // Ideally `total` is available.

            // TypeScript check might be needed. 
            // Let's rely on 'total' being there or fallback to users.length (which is 1 if paged).
            // If perPage=1, total should be the total count.
            userCount = (data as any).total || 0;
        }
    } catch (e) {
        console.error("Error fetching user count", e);
    }

    // 2. Fetch Rank Data for Top Content
    let topMovie: any = null;
    let topSeries: any = null;

    try {
        const rank = await getRank();
        if (rank.movie && rank.movie.length > 0) topMovie = rank.movie[0];
        if (rank.tv && rank.tv.length > 0) topSeries = rank.tv[0];
    } catch (e) {
        console.error("Error fetching rank", e);
    }

    // Fallback if no data
    const movieTitle = topMovie ? topMovie.title : 'N/A';
    const movieRating = topMovie ? topMovie.imdbRatingValue : '-';

    const seriesTitle = topSeries ? topSeries.title : 'N/A';
    const seriesRating = topSeries ? topSeries.imdbRatingValue : '-';

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-[#141414] border-gray-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userCount}</div>
                        <p className="text-xs text-gray-500">Registered users</p>
                    </CardContent>
                </Card>

                <Card className="bg-[#141414] border-gray-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Top Rated Movie</CardTitle>
                        <Film className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold truncate" title={movieTitle}>{movieTitle}</div>
                        <p className="text-xs text-gray-500">IMDb Rating: <span className="text-yellow-500 font-bold">{movieRating}</span></p>
                    </CardContent>
                </Card>

                <Card className="bg-[#141414] border-gray-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Top Rated Series</CardTitle>
                        <Activity className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold truncate" title={seriesTitle}>{seriesTitle}</div>
                        <p className="text-xs text-gray-500">IMDb Rating: <span className="text-yellow-500 font-bold">{seriesRating}</span></p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
