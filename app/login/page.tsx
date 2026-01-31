'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import Link from 'next/link';
import HCaptcha from '@hcaptcha/react-hcaptcha';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const captchaRef = useRef<HCaptcha>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!captchaToken) {
            setError('Please complete the captcha');
            return;
        }

        setLoading(true);
        setError('');

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
            options: {
                captchaToken,
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            setCaptchaToken(null);
            captchaRef.current?.resetCaptcha();
        } else {
            router.push('/profile');
            router.refresh();
        }
    };

    return (
        <div
            className="flex h-screen w-screen overflow-hidden items-center justify-center p-4 relative bg-cover bg-center"
            style={{ backgroundImage: "url('/login-bg.png')" }}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            <Card className="w-full max-w-sm bg-transparent border-none text-white relative shadow-none z-10">
                <button
                    onClick={() => router.push('/')}
                    className="absolute right-0 -top-12 text-gray-300 hover:text-white transition"
                >
                    <X className="w-8 h-8" />
                </button>
                <CardHeader className="px-0">
                    <CardTitle className="text-3xl font-bold text-white text-center mb-2">Start streaming now with Cineprime</CardTitle>
                </CardHeader>
                <CardContent className="px-0">


                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-300">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-black/40 border-gray-600 text-white placeholder:text-gray-500 h-12"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-300">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-black/40 border-gray-600 text-white h-12"
                                required
                            />
                        </div>
                        {error && (
                            <div className="text-red-500 text-sm font-medium">{error}</div>
                        )}

                        <div className="flex justify-center transition-all duration-300">
                            <HCaptcha
                                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
                                onVerify={(token) => setCaptchaToken(token)}
                                onExpire={() => setCaptchaToken(null)}
                                ref={captchaRef}
                                theme="dark"
                            />
                        </div>
                        <Button type="submit" className="w-full h-12 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold text-lg shadow-lg shadow-red-900/20" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                    <div className="mt-8 text-center text-sm text-gray-400">
                        Don't have an account? <Link href="/register" className="text-white hover:underline font-bold">Sign Up</Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
