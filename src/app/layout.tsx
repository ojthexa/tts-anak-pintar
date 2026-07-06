import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Toaster } from "sonner";
import { ThemeToggle, SoundToggle, FontSizeToggle, NavLinks } from "@/components/shared/NavbarClient";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TTS Anak Pintar",
    template: "%s | TTS Anak Pintar",
  },
  description:
    "Educational Crossword Puzzle Game for Indonesian Elementary School Students. Belajar sambil bermain TTS interaktif!",
  keywords: [
    "TTS",
    "teka teki silang",
    "crossword",
    "educational game",
    "game edukasi",
    "SD",
    "sekolah dasar",
    "belajar",
    "islam",
    "al-quran",
    "bahasa arab",
    "bahasa inggris",
  ],
  authors: [{ name: "TTS Anak Pintar" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0f2f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1419" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#f0f2f5] dark:bg-[#0f1419] text-gray-800 dark:text-gray-200">
        <ThemeProvider>
          <AuthProvider>
            {/* Navigation */}
            <Navbar />

            {/* Main content */}
            <main className="min-h-[calc(100vh-64px)]">{children}</main>

            {/* Footer */}
            <Footer />

            {/* Toast notifications */}
            <Toaster
              position="top-center"
              toastOptions={{
                className: "clay-sm",
                duration: 4000,
              }}
              richColors
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

/**
 * Navigation bar component
 */
function Navbar() {
  return (
    <header className="sticky top-0 z-50 clay-sm mx-4 mt-2 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full clay-colored flex items-center justify-center text-xl group-hover:animate-wiggle">
            🧩
          </div>
          <span className="font-bold text-lg clay-text hidden sm:block">
            TTS Anak Pintar
          </span>
        </a>

        <nav className="flex items-center gap-1.5 sm:gap-2">
          <NavLinks />
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
          <FontSizeToggle />
          <SoundToggle />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

/**
 * Footer component
 */
function Footer() {
  return (
    <footer className="clay mx-4 mb-2 px-6 py-4 mt-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧩</span>
          <span className="font-bold clay-text">TTS Anak Pintar</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © 2026 TTS Anak Pintar — Belajar sambil bermain ✨
        </p>
      </div>
    </footer>
  );
}
