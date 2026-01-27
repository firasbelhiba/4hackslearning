import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: '4hacks Learning - Learn, Build, and Compete',
  description:
    'Your complete learning ecosystem for mastering skills, earning certifications, and applying them in real hackathons.',
  keywords: ['learning', 'hackathon', 'web3', 'blockchain', 'certification', 'hedera'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
