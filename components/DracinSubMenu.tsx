"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Bell, User, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

export default function DracinSubMenu() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [keyword, setKeyword] = useState(searchParams.get("q") || "");
    const [isScrolled, setIsScrolled] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState("Bahasa (ID)"); // Default to ID

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);

        // Read initial language from cookie
        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
        }
        const savedLang = getCookie("dracin_lang");
        switch (savedLang) {
            case 'en': setSelectedLang("English (EN)"); break;
            case 'ms': setSelectedLang("Melayu (MY)"); break;
            case 'zh': setSelectedLang("Mandarin (ZH)"); break;
            default: setSelectedLang("Bahasa (ID)"); // Default IN
        }

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.lang-selector')) {
                setIsLangMenuOpen(false);
            }
        };
        window.addEventListener('click', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleLangSelect = (langCode: string, langName: string) => {
        document.cookie = `dracin_lang=${langCode}; path=/; max-age=31536000`;
        setSelectedLang(langName);
        router.refresh();
        setIsLangMenuOpen(false);
    };

    const isActive = (path: string) => pathname === path;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setShowMobileMenu(false); // Close menu on search
        if (keyword.trim()) {
            router.push(`/dracin/search?q=${encodeURIComponent(keyword)}`);
        }
    };

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);
    };

    return (
        <nav className={`fixed top-0 left-0 w-full z-[100] transition-colors duration-300 border-b border-gray-800/50 ${isScrolled ? 'bg-[#141414]' : 'bg-[#141414]/90 backdrop-blur-md'}`}>
            <div className="px-4 md:px-16 py-4 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    {/* Logo - Renamed and removed Hamburger */}
                    <div className="flex items-center gap-4">
                        <Link href="/dracin" className="text-[#E50914] text-lg md:text-2xl font-bold uppercase whitespace-nowrap">
                            CINEPRIME
                        </Link>
                    </div>

                    {/* Desktop Links */}
                    <ul className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
                        <li>
                            <Link href="/dracin" className={`hover:text-[#E50914] transition-colors ${isActive('/dracin') ? 'text-white font-bold' : ''}`}>
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/dracin/recommend" className={`hover:text-[#E50914] transition-colors ${isActive('/dracin/recommend') ? 'text-white font-bold' : ''}`}>
                                Recommend
                            </Link>
                        </li>
                        <li>
                            <Link href="/dracin/vip" className={`hover:text-[#E50914] transition-colors ${isActive('/dracin/vip') ? 'text-white font-bold' : ''}`}>
                                VIP
                            </Link>
                        </li>
                        <li>
                            <Link href="/dracin/categories" className={`hover:text-[#E50914] transition-colors ${isActive('/dracin/categories') ? 'text-white font-bold' : ''}`}>
                                Categories
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Desktop Search & Icons */}
                <div className="hidden md:flex items-center gap-6">
                    <form onSubmit={handleSearch} className="relative w-64">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 cursor-pointer" onClick={(e) => handleSearch(e as any)} />
                        <Input
                            type="text"
                            placeholder="Search Dracin..."
                            className="pr-9 h-9 bg-black/50 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-[#E50914]"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </form>

                    {/* Language Selector */}
                    <div className="relative lang-selector text-gray-300 hover:text-white flex items-center gap-1 z-50">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsLangMenuOpen(!isLangMenuOpen);
                            }}
                            className="text-sm font-medium focus:outline-none flex items-center gap-1 min-w-[90px] justify-end"
                        >
                            {selectedLang}
                        </button>

                        {isLangMenuOpen && (
                            <div className="absolute top-full right-0 mt-2 w-32 bg-[#141414] border border-gray-800 rounded-md shadow-lg py-2">
                                <button
                                    onClick={() => handleLangSelect('in', 'Bahasa (ID)')}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-800 text-sm text-gray-300 hover:text-white"
                                >
                                    Bahasa (ID)
                                </button>
                                <button
                                    onClick={() => handleLangSelect('en', 'English (EN)')}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-800 text-sm text-gray-300 hover:text-white"
                                >
                                    English (EN)
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-white">
                        <Bell className="w-5 h-5 cursor-pointer hover:text-gray-300" />
                    </div>
                </div>

                {/* Mobile Icons - Minimal like Navbar */}
                <div className="flex md:hidden items-center gap-4 text-white">
                    {/* Search Icon for Mobile */}
                    <Link href="/dracin/search">
                        <Search className="w-5 h-5" />
                    </Link>
                    <Bell className="w-5 h-5" />
                </div>
            </div>
        </nav>
    );
}
