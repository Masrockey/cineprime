'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Mail, MessageSquare } from 'lucide-react';

export default function ContactPage() {

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
                        Contact Support
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Have a question or running into an issue? We're here to help.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto text-gray-300">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-[#141414] p-8 rounded-2xl border border-gray-800 hover:border-red-600/30 transition-colors">
                            <h3 className="text-2xl font-bold text-white mb-6">Get in touch</h3>

                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-600/10 text-red-500">
                                            <Mail className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-medium text-white">Email</h4>
                                        <p className="mt-1 text-gray-500">support@cineprime.com</p>
                                        <p className="text-gray-500">partnerships@cineprime.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-600/10 text-red-500">
                                            <MessageSquare className="h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-medium text-white">Live Chat</h4>
                                        <p className="mt-1 text-gray-500">Available Mon-Fri, 9am - 5pm EST</p>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* FAQ Section */}
                        <div className="bg-gradient-to-br from-[#141414] to-[#1f1f1f] p-8 rounded-2xl border border-gray-800">
                            <h3 className="text-xl font-bold text-white mb-6">Common Questions</h3>
                            <div className="space-y-4">
                                <FAQItem
                                    question="How do I update my profile picture?"
                                    answer="Go to your Profile page, select 'Account settings', and click on your current avatar. You can then upload a new image from your device."
                                />
                                <FAQItem
                                    question="My payment failed, what do I do?"
                                    answer="Ensure your card details are correct and you have sufficient funds. If the problem continues, try a different card or contact your bank. You can also reach out to our support team."
                                />
                                <FAQItem
                                    question="Can I download movies to watch offline?"
                                    answer="No! You can't download movies to watch offline. This feature is not available yet."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-700/50 last:border-0 pb-4 last:pb-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full text-left group"
            >
                <span className="text-sm font-medium text-gray-300 group-hover:text-red-500 transition-colors">
                    {question}
                </span>
                <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}>
                    <div className="w-4 h-4 text-gray-500 group-hover:text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </div>
                </span>
            </button>
            <div
                className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className="overflow-hidden">
                    <p className="text-xs text-gray-500 leading-relaxed">
                        {answer}
                    </p>
                </div>
            </div>
        </div>
    );
}

