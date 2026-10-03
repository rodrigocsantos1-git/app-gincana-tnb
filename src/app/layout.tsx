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
    icon: '/logo-treinando-campeoes.png',
    apple: '/logo-treinando-campeoes.png',
  },
  openGraph: {
    title: 'Gincana Acampa TNB • Treinando Campeões',
    description:
      'Ministério Infantil Tô na Bênção (IBP) — Pontuação e gerenciamento da gincana de acampamento em tempo real.',
    url: 'https://gincana-tnb.vercel.app',
    siteName: 'Gincana Acampa TNB',
    images: [
      {
        url: '/logo-treinando-campeoes.png',
        width: 591,
        height: 591,
        alt: 'Logo Treinando Campeões - Tô na Bênção',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Gincana Acampa TNB • Treinando Campeões',
    description:
      'Ministério Infantil Tô na Bênção (IBP) — Pontuação e gerenciamento da gincana de acampamento em tempo real.',
    images: ['/logo-treinando-campeoes.png'],
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
