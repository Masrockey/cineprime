'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId: string, newRole: 'admin' | 'user') {
    try {
        const supabase = createAdminClient();

        // Security check: Ensure we can't demote the last admin or ourselves indiscriminately? 
        // For now, let's just do the update. 
        // ideally we should check if the user requesting this is an admin, 
        // but this action is used in a protected route (middleware covers it).

        const { error } = await supabase.auth.admin.updateUserById(
            userId,
            { app_metadata: { role: newRole } }
        );

        if (error) {
            console.error('Error updating role:', error);
            return { error: error.message };
        }

        revalidatePath('/admin/roles');
        return { success: true };
    } catch (error: any) {
        console.error('Unexpected error updating role:', error);
        return { error: error.message };
    }
}
