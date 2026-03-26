import type {Metadata} from 'next';
import './globals.css'; // Global styles
import Providers from './providers';
import { CartProvider } from '@/hooks/use-cart';

export const metadata: Metadata = {
  title: 'My Google AI Studio App',
  description: 'My Google AI Studio App',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="https://picsum.photos/seed/pos/192/192" />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <CartProvider>
            {children}
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
