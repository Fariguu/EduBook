"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, LogIn, Calendar, Mail, Home, Menu, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

interface PublicNavbarProps {
  readonly isAuthenticated?: boolean;
}

export function PublicNavbar({ isAuthenticated = false }: PublicNavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  // Chiudi il menu mobile ad ogni cambio pagina
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/prenota", label: "Prenota", icon: Calendar },
    { href: "/contatti", label: "Contatti", icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-colors">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Edu<span className="text-primary">Book</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Link href="/dashboard" className={buttonVariants({ size: "sm", className: "gap-2 bg-primary text-primary-foreground hover:bg-primary/90" })}>
              Dashboard
            </Link>
          ) : (
            <Link href="/?auth=login" className={buttonVariants({ variant: "outline", size: "sm", className: "gap-2 border-primary/30 hover:border-primary text-foreground hover:text-primary" })}>
              <LogIn className="h-4 w-4 text-primary" />
              <span>Accedi</span>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="w-9 h-9 p-0 text-foreground hover:bg-muted"
            aria-label={isOpen ? "Chiudi menu di navigazione" : "Apri menu di navigazione"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown Navigation */}
      {isOpen && (
        <div className="md:hidden border-b border-border/60 bg-background/95 backdrop-blur-md px-4 pt-2 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-border/40 flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className={buttonVariants({ size: "sm", className: "w-full justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90" })}
              >
                Vai alla Dashboard
              </Link>
            ) : (
              <Link
                href="/?auth=login"
                onClick={() => setIsOpen(false)}
                className={buttonVariants({ variant: "outline", size: "sm", className: "w-full justify-center gap-2 border-primary/30 hover:border-primary text-foreground hover:text-primary" })}
              >
                <LogIn className="h-4 w-4 text-primary" />
                <span>Accedi come Docente</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
