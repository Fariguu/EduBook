import { requireAuth } from "@/features/auth/utils/require-auth";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { GraduationCapIcon, ExternalLinkIcon, UserIcon, CalendarIcon } from "lucide-react";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAuth();

  const professorName =
    profile?.first_name || profile?.last_name
      ? `Prof. ${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
      : "Professore";

  return (
    <div className="flex flex-col min-h-screen bg-background text-text">
      {/* HEADER DI NAVIGAZIONE DASHBOARD */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
        <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Badge */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 font-black text-xl tracking-tight text-primary">
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
                <GraduationCapIcon className="w-5 h-5" />
              </div>
              <span>EduBook</span>
            </Link>
            <Badge variant="secondary" className="hidden sm:inline-flex bg-primary/10 text-primary border-primary/20 text-[11px] font-semibold">
              Dashboard Docente
            </Badge>
          </div>

          {/* Links Navigazione */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-muted transition-colors flex items-center gap-1.5"
            >
              <CalendarIcon className="w-4 h-4 text-primary" />
              <span className="hidden sm:inline">Calendario &</span> Lezioni
            </Link>

            <Link
              href="/dashboard/profilo"
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-muted transition-colors flex items-center gap-1.5"
            >
              <UserIcon className="w-4 h-4 text-primary" />
              Profilo
            </Link>

            <Link
              href="/"
              target="_blank"
              className="hidden md:flex px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-muted text-muted-foreground transition-colors items-center gap-1"
            >
              <span>Vedi Sito</span>
              <ExternalLinkIcon className="w-3.5 h-3.5" />
            </Link>
          </nav>

          {/* User Info, Theme & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden lg:inline text-xs font-semibold text-muted-foreground">
              {professorName}
            </span>
            <ThemeToggle />
            <LogoutButton variant="outline" size="sm" className="h-9 px-2.5 text-xs" />
          </div>
        </div>
      </header>

      {/* CONTENUTO PRINCIPALE */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
