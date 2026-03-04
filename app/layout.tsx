import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { ThemeProvider } from "@/components/providers/theme-providers";
import { QueryProvider } from "@/components/providers/query-provider";
import { CommandPalette } from "@/components/command-palette";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Editron | AI-Powered Cloud Code Editor",
  description: "A fast, browser-based development environment with WebContainers, 40+ starter templates, live previews, and integrated AI assistance (Gemini, Groq, Mistral). Stop installing, start coding.",
  keywords: ["cloud editor", "webcontainers", "browser ide", "ai code assistant", "nextjs templates", "react playground", "online code editor"],
  openGraph: {
    title: "Editron | AI-Powered Cloud Code Editor",
    description: "Code directly in your browser with WebContainers, 40+ templates, and an AI assistant. No local setup required.",
    url: "https://editron.vercel.app", // Replace with your actual domain later
    siteName: "Editron",
    images: [
      {
        url: "/og-image.jpg", // Create this eventually
        width: 1200,
        height: 630,
        alt: "Editron Interface Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Editron | AI-Powered Cloud Code Editor",
    description: "Code directly in your browser with WebContainers, 40+ templates, and an AI assistant.",
    images: ["/og-image.jpg"], // Create this eventually
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await auth()

  return (
    <SessionProvider session={session}>
      <html lang="en" suppressHydrationWarning className={`${inter.variable} ${geistMono.variable}`}>
        <body
          className={`${inter.className} antialiased`}
        >
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {/* Skip to content link for keyboard accessibility */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm focus:font-medium"
              >
                Skip to main content
              </a>
              <div className="flex flex-col min-h-screen">
                <Toaster />
                <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
                  {children}
                </main>
              </div>

              <CommandPalette />
            </ThemeProvider>
          </QueryProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
