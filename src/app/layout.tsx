
import type {Metadata} from 'next';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ManaBackground } from '@/components/ManaBackground';
import { CustomBackground } from '@/components/CustomBackground';
import { AmbientGlow } from '@/components/AmbientGlow';
import { TutorialTour } from '@/components/TutorialTour';
import { FloatingArenaLink } from '@/components/FloatingArenaLink';

export const metadata: Metadata = {
  title: 'Kaiwhakawānabe – The Couch Judge',
  description: 'Live Kapa Haka Fan Judging & Engagement',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-white text-foreground min-h-screen selection:bg-primary/30 relative">
        <FirebaseClientProvider>
          {/* Layered Branding Background */}
          <AmbientGlow />
          <CustomBackground />
          <ManaBackground />
          
          <TutorialTour />
          <FloatingArenaLink />
          
          <main className="max-w-md mx-auto w-full px-4 pt-6 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out relative z-10">
            {children}
          </main>
          
          <Navigation />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
