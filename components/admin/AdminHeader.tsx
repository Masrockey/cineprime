'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AdminHeader() {
    return (
        <header className="hidden md:flex h-16 items-center justify-end gap-4 border-b border-gray-800 bg-[#0a0a0a] px-6">
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">Admin User</span>
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>AD</AvatarFallback>
                </Avatar>
            </div>
        </header>
    )
}
