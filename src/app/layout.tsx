import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/components/AuthContext';

export const metadata: Metadata = {
  title: 'Gincana Acampa TNB • Placar em Tempo Real',
  description:
    'Sistema de gerenciamento e pontuação em tempo real da gincana de acampamento do Ministério Infantil Tô na Bênção (IBP).',
  icons: {
    icon: '/Logo_TNB.jpg',
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
