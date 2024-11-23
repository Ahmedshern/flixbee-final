import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";
import { ErrorBoundary } from '@/components/error-boundary';
import { Footer } from "@/components/ui/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "BuzzPlay - Your Streaming Entertainment Hub",
    template: "%s | BuzzPlay"
  },
  description: "Stream unlimited movies, TV shows, and more on BuzzPlay. Start watching today with our premium streaming service.",
  keywords: ["streaming", "movies", "TV shows", "entertainment", "BuzzPlay", "watch online"],
  authors: [{ name: "BuzzPlay" }],
  creator: "BuzzPlay",
  publisher: "BuzzPlay",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://BuzzPlay.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://BuzzPlay.com',
    title: 'BuzzPlayy - Your Streaming Entertainment Hub',
    description: 'Stream unlimited movies, TV shows, and more on BuzzPlay. Start watching today with our premium streaming service.',
    siteName: 'BuzzPlay',
    images: [
      {
        url: 'https://BuzzPlay.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BuzzPlay - Streaming Entertainment',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BuzzPlay - Your Streaming Entertainment Hub',
    description: 'Stream unlimited movies, TV shows, and more on BuzzPlay. Start watching today with our premium streaming service.',
    images: ['https://BuzzPlay.com/twitter-image.jpg'],
    creator: '@BuzzPlay',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" }
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <div className="relative min-h-screen flex flex-col">
                <SiteHeader />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}