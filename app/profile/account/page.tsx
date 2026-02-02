'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, Camera, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';

export default function AccountSettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
            } else {
                setUser(user);
                setFullName(user.user_metadata?.full_name || '');
                setAvatarUrl(user.user_metadata?.avatar_url || null);
            }
            setLoading(false);
        };
        getUser();
    }, [router, supabase]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        setUploading(true);
        setMessage(null);

        try {
            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 3. Update User Metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            if (updateError) throw updateError;

            setAvatarUrl(publicUrl);
            setMessage({ type: 'success', text: 'Profile picture updated!' });
            router.refresh(); // Refresh to update server components/navbar if needed

        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: 'Error uploading image: ' + error.message });
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const updates: any = {
                data: { full_name: fullName }
            };

            if (password) {
                updates.password = password;
            }

            const { error } = await supabase.auth.updateUser(updates);

            if (error) {
                throw error;
            }

            setMessage({ type: 'success', text: 'Profile updated successfully' });
            if (password) setPassword(''); // Clear password field on success
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-[#050B14] flex items-center justify-center text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-[#050B14] text-white pt-24 pb-12 font-sans">
            <div className="max-w-2xl mx-auto px-4">
                <Link href="/profile" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Profile
                </Link>

                <Card className="bg-[#1f1f1f] border-gray-800 text-white">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Account Settings</CardTitle>
                        <CardDescription className="text-gray-400">
                            Update your personal information and security.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center mb-8">
                            {/* Hidden File Input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />

                            {/* Avatar Display */}
                            <div
                                onClick={handleAvatarClick}
                                className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group border-2 border-gray-700 hover:border-red-600 transition-colors"
                            >
                                {avatarUrl ? (
                                    <Image
                                        src={avatarUrl}
                                        alt="Avatar"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                        <UserIcon className="w-10 h-10 text-gray-400" />
                                    </div>
                                )}

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    {uploading ? (
                                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                                    ) : (
                                        <Camera className="w-6 h-6 text-white" />
                                    )}
                                </div>
                            </div>
                            <p className="mt-2 text-sm text-gray-400">Click to change avatar</p>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-6">

                            {/* Email (Read Only) */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                                <Input
                                    id="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="bg-[#141414] border-gray-700 text-gray-500 cursor-not-allowed"
                                />
                            </div>

                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-gray-300">Display Name</Label>
                                <Input
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="bg-[#141414] border-gray-700 text-white focus:border-red-600 focus:ring-red-600"
                                    placeholder="Enter your name"
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-gray-300">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-[#141414] border-gray-700 text-white focus:border-red-600 focus:ring-red-600"
                                    placeholder="Leave blank to keep current password"
                                />
                                <p className="text-xs text-gray-500">Only enter a new password if you want to change it.</p>
                            </div>

                            {/* Status Message */}
                            {message && (
                                <div className={`p-3 rounded flex items-center gap-2 ${message.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-900' : 'bg-red-900/20 text-red-400 border border-red-900'}`}>
                                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                    <span>{message.text}</span>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
