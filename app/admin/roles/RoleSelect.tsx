'use client';

import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { updateUserRole } from './actions';

interface RoleSelectProps {
    userId: string;
    initialRole: string;
    currentUserEmail?: string;
}

export function RoleSelect({ userId, initialRole, currentUserEmail }: RoleSelectProps) {
    const [role, setRole] = useState(initialRole);
    const [loading, setLoading] = useState(false);

    const handleRoleChange = async (newRole: 'admin' | 'user') => {
        setLoading(true);
        // Optimistic update
        setRole(newRole);

        const result = await updateUserRole(userId, newRole);

        if (result.error) {
            toast.error(`Failed to update role: ${result.error}`);
            // Revert on error
            setRole(initialRole);
        } else {
            toast.success(`Role updated to ${newRole}`);
        }
        setLoading(false);
    };

    return (
        <Select
            value={role}
            onValueChange={(val) => handleRoleChange(val as 'admin' | 'user')}
            disabled={loading}
        >
            <SelectTrigger className="w-[100px] h-8">
                <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin" className="text-red-500 font-medium">Admin</SelectItem>
            </SelectContent>
        </Select>
    );
}
