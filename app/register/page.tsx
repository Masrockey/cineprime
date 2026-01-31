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

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const captchaRef = useRef<HCaptcha>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleGoogleSignup = async () => {
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

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!captchaToken) {
            setError('Please complete the captcha');
            return;
        }

        setLoading(true);
        setError('');

        const { error } = await supabase.auth.signUp({
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
            setSuccess(true);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black p-4">
                <Card className="w-full max-w-sm bg-[#141414] border-gray-800 text-white">
                    <CardHeader>
                        <CardTitle className="text-2xl text-primary text-center">Check Your Email</CardTitle>
                        <CardDescription className="text-center">
                            We have sent a verification link to <strong>{email}</strong>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Button onClick={() => router.push('/login')} className="bg-red-600 hover:bg-red-700">
                            Back to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
                    <CardTitle className="text-3xl font-bold text-white text-center mb-2">Join Cineprime Today</CardTitle>
                </CardHeader>
                <CardContent className="px-0">


                    <form onSubmit={handleRegister} className="space-y-4">
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
                                minLength={6}
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
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </form>
                    <div className="mt-8 text-center text-sm text-gray-400">
                        Already have an account? <Link href="/login" className="text-white hover:underline font-bold">Log In</Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
