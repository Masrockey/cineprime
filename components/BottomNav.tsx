'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Flame, History, Tv, User } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    // Hide on admin, login pages
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/login') || pathname?.startsWith('/dracin/watch')) {
        return null;
    }

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { name: 'Trending', href: '/trending', icon: Flame },
        { name: 'Dracin', href: '/dracin', icon: Tv },
        { name: 'Home', href: '/', icon: Home },
        { name: 'History', href: '/history', icon: History },
        { name: 'Profile', href: '/profile', icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 w-full bg-[#121212]/95 backdrop-blur-md border-t border-gray-800 z-[9999] pb-safe">
            <nav className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${active ? 'text-red-600' : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            <Icon className={`w-6 h-6 ${active ? 'fill-current' : ''}`} strokeWidth={active ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
