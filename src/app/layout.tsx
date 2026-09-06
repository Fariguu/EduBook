import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { DemoBanner } from "@/components/DemoBanner";
import { AuthModal } from "@/features/auth/components/AuthModal";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduBook - Prenotazione Lezioni Private (Demo)",
  description: "Piattaforma per la gestione e prenotazione di lezioni private - Ambiente Demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground flex flex-col min-h-screen`}>
        <DemoBanner />
        {children}
        <Suspense fallback={null}>
          <AuthModal />
        </Suspense>
        <Toaster position="bottom-right" closeButton richColors />
      </body>
    </html>
  );
}
