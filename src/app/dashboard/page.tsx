import { Metadata } from "next";
import { getDashboardData } from "@/features/dashboard/actions/dashboard.actions";
import { DashboardStats } from "@/features/dashboard/components/DashboardStats";
import { LessonTabs } from "@/features/dashboard/components/LessonTabs";

export const metadata: Metadata = {
  title: "Dashboard Docente | EduBook",
  description: "Gestione lezioni, calendario disponibilità e messaggi ricevuti.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* INTESTAZIONE DASHBOARD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight">
            Benvenuto, {data.professorName}
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Gestisci le tue disponibilità, approva le prenotazioni e rispondi ai messaggi degli studenti.
          </p>
        </div>
      </div>

      {/* STATISTICHE RAPIDE */}
      <DashboardStats stats={data.stats} />

      {/* TABS LEZIONI & GESTIONE */}
      <LessonTabs data={data} />
    </div>
  );
}
