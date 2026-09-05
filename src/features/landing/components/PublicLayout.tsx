import * as React from "react";
import { PublicNavbar } from "./PublicNavbar";
import { Footer } from "./Footer";

interface PublicLayoutProps {
  isAuthenticated?: boolean;
  maxWidth?: "4xl" | "5xl" | "6xl";
  children: React.ReactNode;
}

export function PublicLayout({
  isAuthenticated = false,
  maxWidth = "5xl",
  children,
}: PublicLayoutProps) {
  const maxWidthClass =
    maxWidth === "4xl"
      ? "max-w-4xl"
      : maxWidth === "6xl"
      ? "max-w-6xl"
      : "max-w-5xl";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicNavbar isAuthenticated={isAuthenticated} />
      <main className={`flex-1 container mx-auto px-4 py-10 ${maxWidthClass}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
