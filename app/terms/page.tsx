'use client';

import Navbar from '@/components/Navbar';
import { ScrollText, Shield, FileText, CheckCircle } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
                        Terms & Conditions
                    </h1>
                    <p className="text-xl text-gray-400">
                        Please read these terms carefully before using our service.
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                        Last updated: Feb 02, 2026
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-12 text-gray-300">

                    {/* Section 1 */}
                    <section className="bg-[#141414] p-8 rounded-2xl border border-gray-800">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-red-600/10 p-3 rounded-lg text-red-500">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">1. Introduction</h2>
                        </div>
                        <p className="leading-relaxed mb-4">
                            Welcome to <strong>CinePrime</strong> ("Company", "we", "our", "us"). These Terms and Conditions ("Terms", "Terms and Conditions") govern your use of our website located at cineprime.com (together or individually "Service") operated by CinePrime.
                        </p>
                        <p className="leading-relaxed">
                            By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section className="bg-[#141414] p-8 rounded-2xl border border-gray-800">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-red-600/10 p-3 rounded-lg text-red-500">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">2. Privacy Policy</h2>
                        </div>
                        <p className="leading-relaxed">
                            Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the Site and informs users of our data collection practices.
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section className="bg-[#141414] p-8 rounded-2xl border border-gray-800">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-red-600/10 p-3 rounded-lg text-red-500">
                                <ScrollText className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">3. Content & Copyright</h2>
                        </div>
                        <p className="leading-relaxed mb-4">
                            Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.
                        </p>
                        <ul className="space-y-3 mt-4">
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>You retain any and all of your rights to any Content you submit, post or display on or through the Service and you are responsible for protecting those rights.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>CinePrime has the right but not the obligation to monitor and edit all Content provided by users.</span>
                            </li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section className="bg-[#141414] p-8 rounded-2xl border border-gray-800">
                        <h2 className="text-2xl font-bold text-white mb-4">4. Prohibited Uses</h2>
                        <p className="leading-relaxed mb-4">
                            You may use the Service only for lawful purposes and in accordance with Terms. You agree not to use the Service:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>In any way that violates any applicable national or international law or regulation.</li>
                            <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way by exposing them to inappropriate content or otherwise.</li>
                            <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.</li>
                        </ul>
                    </section>

                    <div className="text-center pt-12 pb-8 border-t border-gray-800">
                        <p className="text-gray-500">
                            If you have any questions about these Terms, please contact us at <span className="text-red-500 cursor-pointer hover:underline">legal@cineprime.com</span>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
