'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell } from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?keyword=${encodeURIComponent(searchQuery)}`);
        }
    };

    if (pathname?.startsWith('/admin') || pathname?.startsWith('/login') || pathname?.startsWith('/dracin/watch')) {
        return null;
    }

    return (
        <nav className={`fixed w-full z-[9999] transition-colors duration-300 ${isScrolled ? 'bg-[#141414]' : 'bg-[#141414]/80 backdrop-blur-sm'}`}>
            <div className="px-4 md:px-16 py-3 flex items-center justify-between gap-4 transition-all duration-500">
                {/* Logo */}
                <Link href="/" className="text-[#E50914] text-xl md:text-2xl font-bold shrink-0">
                    CINEPRIME
                </Link>

                {/* Search Box */}
                {/* Search Box */}
                <div className="flex items-center gap-4">
                    <Link href="/search" className="p-2 text-white hover:text-gray-300 transition">
                        <Search className="w-6 h-6" />
                    </Link>

                    {/* Notification Icon */}
                    <div className="flex items-center shrink-0">
                        <Bell className="w-6 h-6 text-white cursor-pointer hover:text-gray-300 transition" />
                    </div>
                </div>
            </div>
        </nav>
    );
}
