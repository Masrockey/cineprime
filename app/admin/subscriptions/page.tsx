'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface Plan {
    id: string;
    name: string;
    price: number;
    duration_days: number;
    description: string;
    features: string[]; // Simplification: we'll store features as array of strings
}

export default function SubscriptionsPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [currentPlan, setCurrentPlan] = useState<Partial<Plan>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [featuresInput, setFeaturesInput] = useState('');

    const supabase = createClient();

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('plans')
            .select('*')
            .order('price', { ascending: true });

        if (error) {
            console.error('Error fetching plans:', error);
            toast.error('Failed to fetch plans');
        } else {
            setPlans(data || []);
        }
        setLoading(false);
    };

    const handleOpenCreate = () => {
        setCurrentPlan({
            name: '',
            price: 0,
            duration_days: 30,
            description: '',
            features: []
        });
        setFeaturesInput('');
        setIsEditing(false);
        setIsSheetOpen(true);
    };

    const handleOpenEdit = (plan: Plan) => {
        setCurrentPlan(plan);
        setFeaturesInput(Array.isArray(plan.features) ? plan.features.join('\n') : '');
        setIsEditing(true);
        setIsSheetOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const featuresArray = featuresInput.split('\n').filter(f => f.trim() !== '');
        const planData = {
            ...currentPlan,
            features: featuresArray
        };

        try {
            if (isEditing && currentPlan.id) {
                const { error } = await supabase
                    .from('plans')
                    .update(planData)
                    .eq('id', currentPlan.id);
                if (error) throw error;
                toast.success('Plan updated successfully');
            } else {
                const { error } = await supabase
                    .from('plans')
                    .insert([planData]);
                if (error) throw error;
                toast.success('Plan created successfully');
            }
            setIsSheetOpen(false);
            fetchPlans();
        } catch (error: any) {
            console.error('Error saving plan:', error);
            toast.error(error.message || 'Failed to save plan');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;

        try {
            const { error } = await supabase
                .from('plans')
                .delete()
                .eq('id', id);
            if (error) throw error;
            toast.success('Plan deleted successfully');
            fetchPlans();
        } catch (error: any) {
            console.error('Error deleting plan:', error);
            toast.error(error.message || 'Failed to delete plan');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-white">Subscriptions</h1>
                <Button onClick={handleOpenCreate} className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Plan
                </Button>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="bg-[#141414] border-gray-800 text-white sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="text-white">{isEditing ? 'Edit Plan' : 'Create Plan'}</SheetTitle>
                        <SheetDescription className="text-gray-400">
                            {isEditing ? 'Update the subscription plan details.' : 'Add a new subscription plan.'}
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Plan Name</Label>
                            <Input
                                id="name"
                                value={currentPlan.name || ''}
                                onChange={(e) => setCurrentPlan({ ...currentPlan, name: e.target.value })}
                                className="bg-[#0a0a0a] border-gray-700"
                                placeholder="e.g. Monthly Premium"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={currentPlan.price || ''}
                                    onChange={(e) => setCurrentPlan({ ...currentPlan, price: parseFloat(e.target.value) })}
                                    className="bg-[#0a0a0a] border-gray-700"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration (Days)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    min="1"
                                    value={currentPlan.duration_days || ''}
                                    onChange={(e) => setCurrentPlan({ ...currentPlan, duration_days: parseInt(e.target.value) })}
                                    className="bg-[#0a0a0a] border-gray-700"
                                    placeholder="30"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={currentPlan.description || ''}
                                onChange={(e) => setCurrentPlan({ ...currentPlan, description: e.target.value })}
                                className="bg-[#0a0a0a] border-gray-700"
                                placeholder="Short description"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="features">Features (One per line)</Label>
                            <Textarea
                                id="features"
                                value={featuresInput}
                                onChange={(e) => setFeaturesInput(e.target.value)}
                                className="bg-[#0a0a0a] border-gray-700 min-h-[150px]"
                                placeholder="Ad-free viewing&#10;4K Resolution&#10;Offline downloads"
                            />
                        </div>
                        <SheetFooter>
                            <Button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700 w-full">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEditing ? 'Save Changes' : 'Create Plan')}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            <Card className="bg-[#141414] border-gray-800 text-white">
                <CardHeader>
                    <CardTitle>Active Plans</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-gray-400">Loading plans...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-gray-800 hover:bg-transparent">
                                    <TableHead className="text-gray-400">Name</TableHead>
                                    <TableHead className="text-gray-400">Price</TableHead>
                                    <TableHead className="text-gray-400">Duration</TableHead>
                                    <TableHead className="text-gray-400">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {plans.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                            No plans found. Create one to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    plans.map((plan) => (
                                        <TableRow key={plan.id} className="border-gray-800 hover:bg-gray-900/50">
                                            <TableCell className="font-medium">
                                                <div>{plan.name}</div>
                                                <div className="text-xs text-gray-500">{plan.description}</div>
                                            </TableCell>
                                            <TableCell>Rp. {plan.price}</TableCell>
                                            <TableCell>{plan.duration_days} Days</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="hover:text-blue-400 hover:bg-blue-400/10"
                                                        onClick={() => handleOpenEdit(plan)}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="hover:text-red-400 hover:bg-red-400/10"
                                                        onClick={() => handleDelete(plan.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
