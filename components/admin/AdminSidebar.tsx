'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Settings, LogOut, Menu, Shield, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const sidebarItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Roles', href: '/admin/roles', icon: Shield },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-[#E50914]">CinePrime Admin</h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-gray-800">
                <Button
                    variant="ghost"
                    className="w-full flex justify-start gap-3 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    onClick={handleLogout}
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </Button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-[#0a0a0a] border-r border-gray-800 z-50">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <div className="md:hidden flex items-center p-4 bg-[#0a0a0a] border-b border-gray-800 sticky top-0 z-50">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="w-6 h-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 bg-[#0a0a0a] border-r border-gray-800 text-white w-64">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
                <span className="ml-4 font-bold text-lg">Admin Panel</span>
            </div>
        </>
    );
}
