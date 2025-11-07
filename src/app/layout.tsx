import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import { FirebaseClientProvider, UserProvider } from '@/firebase';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'EduGenius',
  description: 'La plateforme éducative du futur.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body className={cn('font-body antialiased', inter.variable)}>
        <FirebaseClientProvider>
          <UserProvider>
            {children}
          </UserProvider>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
