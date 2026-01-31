import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';


export const metadata: Metadata = {
  title: 'Cineprime - Watch Movies & Series',
  description: 'Unlimited movies, TV shows, and more.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark overflow-x-hidden">
      <body className="antialiased bg-[#141414] text-white pb-16">
        <Navbar />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
