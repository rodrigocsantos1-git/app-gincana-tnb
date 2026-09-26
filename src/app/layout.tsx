import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/components/AuthContext';

export const metadata: Metadata = {
  metadataBase: new URL('https://gincana-tnb.vercel.app'),
  title: 'Gincana Acampa TNB • Placar em Tempo Real',
  description:
    'Ministério Infantil Tô na Bênção (IBP) — Pontuação e gerenciamento da gincana de acampamento em tempo real.',
  icons: {
    icon: '/Logo_TNB.jpg',
    apple: '/Logo_TNB.jpg',
  },
  openGraph: {
    title: 'Gincana Acampa TNB • Placar em Tempo Real',
    description:
      'Ministério Infantil Tô na Bênção (IBP) — Pontuação e gerenciamento da gincana de acampamento em tempo real.',
    url: 'https://gincana-tnb.vercel.app',
    siteName: 'Gincana Acampa TNB',
    images: [
      {
        url: '/Logo_TNB.jpg',
        width: 512,
        height: 512,
        alt: 'Logo Tô na Bênção',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Gincana Acampa TNB • Placar em Tempo Real',
    description:
      'Ministério Infantil Tô na Bênção (IBP) — Pontuação e gerenciamento da gincana de acampamento em tempo real.',
    images: ['/Logo_TNB.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
