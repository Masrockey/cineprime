'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Switch } from '@/components/ui/switch';
import { User, Bookmark, History, FileText, ChevronRight, Crown, Shield } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PlanSelector from '@/components/subscription/PlanSelector';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [supabase] = useState(() => createClient());

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
            } else {
                setUser(user);
                // Fetch subscription
                const { data: sub } = await supabase
                    .from('user_subscriptions')
                    .select('*, plans(name)')
                    .eq('user_id', user.id)
                    .single();

                if (sub) {
                    setSubscription(sub);
                }
            }
            setLoading(false);
        };
        getUser();
    }, [router, supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    if (loading) {
        return <div className="min-h-screen bg-[#050B14] flex items-center justify-center text-white">Loading...</div>;
    }

    if (!user) return null;

    const menuItems = [
        { icon: User, label: "Account settings", href: "/profile/account" },
        { icon: Bookmark, label: "Bookmark", href: "/profile/bookmarks" },
        { icon: History, label: "History", href: "/history" },
        { icon: Shield, label: "Contact support", href: "/contact" },
        { icon: FileText, label: "Terms & condition", href: "/terms" },
    ];

    return (
        <div className="min-h-screen bg-[#050B14] text-white pt-24 pb-24 relative overflow-hidden font-sans">
            {/* Background Effect */}
            <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-red-900/20 to-[#050B14] pointer-events-none" />

            <div className="max-w-md mx-auto px-6 relative z-10 flex flex-col items-center">

                {/* Profile Header */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative mb-4">
                        <Avatar className="w-24 h-24 border-2 border-gray-700">
                            <AvatarImage src={user.user_metadata?.avatar_url || "https://github.com/shadcn.png"} />
                            <AvatarFallback className="bg-red-600 text-2xl font-bold">
                                {user.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <h1 className="text-2xl font-bold mb-1">{user.user_metadata?.full_name || "Cineprime User"}</h1>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                </div>

                {/* Menu List */}
                <div className="w-full space-y-2 mb-8">
                    {menuItems.map((item, index) => (
                        <Link key={index} href={item.href} className="flex items-center justify-between py-4 cursor-pointer hover:bg-white/5 rounded-lg px-2 transition">
                            <div className="flex items-center gap-4">
                                <item.icon className="w-6 h-6 text-red-500" />
                                <span className="text-base font-medium text-gray-200">{item.label}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <ChevronRight className="w-5 h-5 text-gray-500" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Premium Button / Plan Selector */}
                {/* Premium Button / Plan Selector */}
                <PlanSelector
                    userId={user.id}
                    currentPlanName={subscription?.plans?.name}
                    subscriptionStatus={subscription?.status}
                    expiryDate={subscription?.current_period_end}
                />

                {/* Sign Out (Custom) */}
                <button
                    onClick={handleSignOut}
                    className="text-gray-500 font-medium text-sm hover:text-white hover:underline transition"
                >
                    Sign Out
                </button>

            </div>
        </div>
    );
}
