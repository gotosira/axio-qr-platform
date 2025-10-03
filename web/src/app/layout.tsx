import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import ConditionalLayout from "@/components/ConditionalLayout";

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
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
