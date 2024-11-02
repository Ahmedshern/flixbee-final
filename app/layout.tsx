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
    default: "BeeFlix - Your Streaming Entertainment Hub",
    template: "%s | BeeFlix"
  },
  description: "Stream unlimited movies, TV shows, and more on BeeFlix. Start watching today with our premium streaming service.",
  keywords: ["streaming", "movies", "TV shows", "entertainment", "BeeFlix", "watch online"],
  authors: [{ name: "BeeFlix" }],
  creator: "BeeFlix",
  publisher: "BeeFlix",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://beeflix.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://beeflix.com',
    title: 'BeeFlix - Your Streaming Entertainment Hub',
    description: 'Stream unlimited movies, TV shows, and more on BeeFlix. Start watching today with our premium streaming service.',
    siteName: 'BeeFlix',
    images: [
      {
        url: 'https://beeflix.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BeeFlix - Streaming Entertainment',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BeeFlix - Your Streaming Entertainment Hub',
    description: 'Stream unlimited movies, TV shows, and more on BeeFlix. Start watching today with our premium streaming service.',
    images: ['https://beeflix.com/twitter-image.jpg'],
    creator: '@beeflix',
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content={viewport.toString()} />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <AuthProvider>
              <div className="relative min-h-screen flex flex-col">
                <SiteHeader />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}