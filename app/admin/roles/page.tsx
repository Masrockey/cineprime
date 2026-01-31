import { createAdminClient } from '@/lib/supabase/admin';
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
import { RoleSelect } from './RoleSelect';

export default async function RolesPage() {
    const supabase = createAdminClient();
    let users: User[] = [];
    let errorMsg = '';

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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-white">Roles Management</h1>
            </div>

            <Card className="bg-[#141414] border-gray-800 text-white">
                <CardHeader>
                    <CardTitle>User Roles</CardTitle>
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
                                    <TableHead className="text-gray-400">Role</TableHead>
                                    <TableHead className="text-gray-400">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => {
                                    const role = user.app_metadata?.role || 'user';

                                    return (
                                        <TableRow key={user.id} className="border-gray-800 hover:bg-gray-900/50">
                                            <TableCell className="font-medium">{user.email}</TableCell>
                                            <TableCell>
                                                <RoleSelect userId={user.id} initialRole={role} />
                                            </TableCell>
                                            <TableCell>
                                                {user.confirmed_at ? (
                                                    <span className="text-green-500 text-sm">Confirmed</span>
                                                ) : (
                                                    <span className="text-yellow-500 text-sm">Pending</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {users.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-gray-500 py-8">
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
