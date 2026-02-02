'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from '@/components/ui/sheet';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Plan {
    id: string;
    name: string;
    price: number;
    duration_days: number;
}

interface UserSubscriptionManagerProps {
    userId: string;
    userEmail: string;
    plans: Plan[];
    currentSubscription: any;
}

export default function UserSubscriptionManager({
    userId,
    userEmail,
    plans,
    currentSubscription
}: UserSubscriptionManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<string>(currentSubscription?.plan_id || '');
    const [status, setStatus] = useState<string>(currentSubscription?.status || 'active');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSave = async () => {
        if (!selectedPlanId) return;
        setLoading(true);

        try {
            // Upsert subscription
            const { error } = await supabase
                .from('user_subscriptions')
                .upsert({
                    user_id: userId,
                    plan_id: selectedPlanId,
                    status: status,
                }, { onConflict: 'user_id' });

            if (error) throw error;

            toast.success('Subscription updated successfully');
            setIsOpen(false);
            router.refresh();
        } catch (error: any) {
            console.error('Error updating subscription:', error);
            toast.error(error.message || 'Failed to update subscription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <CreditCard className="h-4 w-4" />
                    <span className="sr-only">Manage Subscription</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="bg-[#141414] border-gray-800 text-white">
                <SheetHeader>
                    <SheetTitle className="text-white">Manage Subscription</SheetTitle>
                    <SheetDescription>
                        Assign or update subscription for {userEmail}
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="plan">Plan</Label>
                        <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                            <SelectTrigger className="bg-[#0a0a0a] border-gray-700 text-white">
                                <SelectValue placeholder="Select a plan" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#141414] border-gray-700 text-white">
                                {plans.map((plan) => (
                                    <SelectItem key={plan.id} value={plan.id}>
                                        {plan.name} - Rp. {plan.price}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="bg-[#0a0a0a] border-gray-700 text-white">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#141414] border-gray-700 text-white">
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="canceled">Canceled</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {currentSubscription && (
                        <div className="text-xs text-gray-500 mt-2">
                            Current Plan: {currentSubscription.plans?.name || 'None'} <br />
                            Status: {currentSubscription.status}
                        </div>
                    )}
                </div>
                <SheetFooter>
                    <Button
                        onClick={handleSave}
                        disabled={loading || !selectedPlanId}
                        className="bg-red-600 hover:bg-red-700 text-white w-full"
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
