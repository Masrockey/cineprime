'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Check, Crown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Plan {
    id: string;
    name: string;
    price: number;
    duration_days: number;
    description?: string;
}

interface PlanSelectorProps {
    userId: string;
    trigger?: React.ReactNode;
    currentPlanName?: string;
    subscriptionStatus?: string;
    expiryDate?: string;
}

export default function PlanSelector({
    userId,
    trigger,
    currentPlanName,
    subscriptionStatus,
    expiryDate
}: PlanSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(false);
    const [subscribing, setSubscribing] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            fetchPlans();
        }
    }, [isOpen]);

    const fetchPlans = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('plans').select('*').order('price');
        if (error) {
            console.error('Error fetching plans:', error);
            toast.error('Failed to load plans');
        } else {
            setPlans(data || []);
        }
        setLoading(false);
    };

    const handleSubscribe = async (plan: Plan) => {
        setSubscribing(plan.id);

        try {
            // Calculate expiry date
            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + plan.duration_days);

            const { error } = await supabase
                .from('user_subscriptions')
                .upsert({
                    user_id: userId,
                    plan_id: plan.id,
                    status: 'active',
                    current_period_end: endDate.toISOString(),
                }, { onConflict: 'user_id' });

            if (error) throw error;

            toast.success(`Successfully subscribed to ${plan.name}!`);
            setIsOpen(false);
            router.refresh();
        } catch (error: any) {
            console.error('Error subscribing:', error);
            toast.error(error.message || 'Failed to subscribe');
        } finally {
            setSubscribing(null);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                {trigger || (
                    <Button
                        className={`w-full h-auto min-h-[56px] py-4 text-white text-lg font-bold rounded-xl shadow-lg flex flex-col items-center justify-center gap-1 mb-6 ${currentPlanName
                            ? "bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-yellow-500/30 text-yellow-500 shadow-yellow-900/10"
                            : "bg-gradient-to-r from-red-600 to-red-900 hover:from-red-700 hover:to-red-950 shadow-red-900/40"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Crown className={`w-6 h-6 ${currentPlanName ? "fill-yellow-500 text-yellow-500" : "fill-white"}`} />
                            <span>{currentPlanName || "Join premium"}</span>
                        </div>

                        {currentPlanName && (
                            <div className="flex flex-col items-center text-xs font-normal opacity-80 mt-1 space-y-0.5">
                                {expiryDate && (
                                    <span>Expires: {new Date(expiryDate).toLocaleDateString()}</span>
                                )}
                                {subscriptionStatus && (
                                    <span className="capitalize px-2 py-0.5 bg-white/10 rounded-full text-[10px] tracking-wide">
                                        {subscriptionStatus}
                                    </span>
                                )}
                            </div>
                        )}
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] bg-[#141414] border-gray-800 text-white rounded-t-3xl overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-white text-2xl text-center">Choose Your Plan</SheetTitle>
                    <SheetDescription className="text-center text-gray-400">
                        Unlock the full library of movies and series
                    </SheetDescription>
                </SheetHeader>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                    </div>
                ) : (
                    <div className="grid gap-4 max-w-md mx-auto pb-8">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 relative overflow-hidden group hover:border-red-600/50 transition-all"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                        <div className="text-gray-400 text-sm">{plan.duration_days} Days Access</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-red-500">Rp {plan.price.toLocaleString()}</div>
                                    </div>
                                </div>

                                <ul className="space-y-2 mb-6">
                                    {plan.description ? (
                                        plan.description.split('\n').map((feature, idx) => (
                                            <li key={idx} className="flex items-center text-sm text-gray-300">
                                                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="flex items-center text-sm text-gray-300">
                                            <span>No description available</span>
                                        </li>
                                    )}
                                </ul>

                                <Button
                                    onClick={() => handleSubscribe(plan)}
                                    disabled={subscribing === plan.id || (subscriptionStatus === 'active' && currentPlanName === plan.name)}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                                >
                                    {subscribing === plan.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        subscriptionStatus === 'active' && currentPlanName === plan.name
                                            ? "Current Plan"
                                            : subscriptionStatus === 'expired'
                                                ? "Renew Subscription"
                                                : "Subscribe Now"
                                    )}
                                </Button>
                            </div>
                        ))}
                        {plans.length === 0 && (
                            <div className="text-center text-gray-500 py-10">
                                No plans available at the moment.
                            </div>
                        )}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
