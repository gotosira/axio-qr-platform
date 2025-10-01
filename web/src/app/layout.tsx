import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthModal from "@/components/AuthModal";
import Providers from "@/components/Providers";
import ThemeToggle from "@/components/ThemeToggle";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AXIO QR - Modern QR Code Generator",
  description: "Create, customize, and track professional QR codes with advanced analytics. Generate beautiful QR codes with custom logos, colors, and styles.",
  keywords: "QR code generator, custom QR codes, QR analytics, professional QR codes, branded QR codes",
  authors: [{ name: "AXIO QR" }],
  creator: "AXIO QR",
  openGraph: {
    title: "AXIO QR - Modern QR Code Generator",
    description: "Create, customize, and track professional QR codes with advanced analytics.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AXIO QR - Modern QR Code Generator",
    description: "Create, customize, and track professional QR codes with advanced analytics.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark light" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-8">
                  <Link 
                    href="/" 
                    className="flex items-center gap-2 font-bold text-xl tracking-tight hover:text-primary transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">Q</span>
                    </div>
                    AXIO QR
                  </Link>
                  <nav className="hidden md:flex items-center gap-6">
                    <Link 
                      href="/" 
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline underline-offset-4"
                    >
                      Home
                    </Link>
                    <Link 
                      href="/my-qr" 
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline underline-offset-4"
                    >
                      My QR Codes
                    </Link>
                    <Link 
                      href="/analytics" 
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline underline-offset-4"
                    >
                      Analytics
                    </Link>
                  </nav>
                </div>
                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  <AuthModal />
                </div>
              </div>
            </div>
          </header>
          <ErrorBoundary>
            <main className="min-h-screen animate-fade-in">
              {children}
            </main>
          </ErrorBoundary>
          <footer className="border-t border-border/40 bg-muted/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-xs">Q</span>
                  </div>
                  <span className="text-sm text-muted-foreground">© 2024 AXIO QR. All rights reserved.</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                  <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                  <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
                </div>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
