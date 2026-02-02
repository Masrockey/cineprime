import { createAdminClient } from '@/lib/supabase/admin';
import UserSubscriptionManager from '@/components/admin/UserSubscriptionManager';
import { User } from '@supabase/supabase-js';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; // I might need to install badge, but I'll check/skip for now or use plain HTML

export default async function UsersPage() {
    // We need to handle the case where SERVICE_ROLE_KEY is missing gracefully-ish or just fail
    let users: User[] = [];
    let errorMsg = '';

    const supabase = createAdminClient();

    try {
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing in .env.local");
        }

        const { data, error } = await supabase.auth.admin.listUsers();
        if (error) throw error;
        users = data.users || [];
    } catch (e: any) {
        console.error("Error fetching users:", e);
        errorMsg = e.message;
    }

    // Fetch plans
    let plans: any[] = [];
    try {
        const { data: plansData } = await supabase.from('plans').select('*');
        plans = plansData || [];
    } catch (error) {
        console.error("Error fetching plans:", error);
    }

    // Fetch subscriptions for these users
    let subscriptionsByUserId: Record<string, any> = {};
    if (users.length > 0) {
        const { data: subs } = await supabase
            .from('user_subscriptions')
            .select('user_id, status, plans(name)')
            .in('user_id', users.map(u => u.id));

        if (subs) {
            subs.forEach((sub: any) => {
                subscriptionsByUserId[sub.user_id] = sub;
            });
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-white">Users</h1>
            </div>

            <Card className="bg-[#141414] border-gray-800 text-white">
                <CardHeader>
                    <CardTitle>User List</CardTitle>
                </CardHeader>
                <CardContent>
                    {errorMsg ? (
                        <div className="p-4 text-red-500 bg-red-500/10 rounded border border-red-500/20">
                            Error: {errorMsg}. <br />
                            <span className="text-sm text-gray-400">Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env.local</span>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-gray-800 hover:bg-transparent">
                                    <TableHead className="text-gray-400">Email</TableHead>
                                    <TableHead className="text-gray-400">Subscription</TableHead>
                                    <TableHead className="text-gray-400">Created At</TableHead>
                                    <TableHead className="text-gray-400">Last Sign In</TableHead>
                                    <TableHead className="text-gray-400">Status</TableHead>
                                    <TableHead className="text-gray-400">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => {
                                    const sub = subscriptionsByUserId[user.id];
                                    return (
                                        <TableRow key={user.id} className="border-gray-800 hover:bg-gray-900/50">
                                            <TableCell className="font-medium">{user.email}</TableCell>
                                            <TableCell>
                                                {sub ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-white">{sub.plans?.name || 'Unknown Plan'}</span>
                                                        <span className={`text-xs ${sub.status === 'active' ? 'text-green-500' : 'text-gray-500'
                                                            }`}>
                                                            {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                {user.last_sign_in_at
                                                    ? new Date(user.last_sign_in_at).toLocaleDateString()
                                                    : 'Never'}
                                            </TableCell>
                                            <TableCell>
                                                {user.confirmed_at ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">Confirmed</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500">Pending</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <UserSubscriptionManager
                                                    userId={user.id}
                                                    userEmail={user.email || ''}
                                                    plans={plans}
                                                    currentSubscription={sub}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {users.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
