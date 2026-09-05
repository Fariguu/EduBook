import { Card, CardContent } from "@/components/ui/card";
import { ClockIcon, CheckCircle2Icon, CalendarIcon, MessageSquareIcon } from "lucide-react";
import type { DashboardStatsData } from "../types/dashboard.types";

interface DashboardStatsProps {
  stats: DashboardStatsData;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const cards = [
    {
      title: "Da Confermare",
      count: stats.pendingCount,
      desc: "Richieste in attesa di approvazione",
      icon: ClockIcon,
      highlight: stats.pendingCount > 0,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: stats.pendingCount > 0 ? "border-amber-500/40 shadow-sm" : "border-border",
    },
    {
      title: "Confermate",
      count: stats.confirmedCount,
      desc: "Lezioni programmate",
      icon: CheckCircle2Icon,
      highlight: false,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-border",
    },
    {
      title: "Slot Disponibili",
      count: stats.availableCount,
      desc: "Slot futuri visibili online",
      icon: CalendarIcon,
      highlight: false,
      color: "text-secondary",
      bg: "bg-secondary/10",
      border: "border-border",
    },
    {
      title: "Messaggi",
      count: stats.contactsCount,
      desc: "Dal modulo di contatto",
      icon: MessageSquareIcon,
      highlight: stats.contactsCount > 0,
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-border",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <Card key={i} className={`${c.border} transition-all`}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  {c.title}
                </span>
                <span className="text-2xl font-black text-text mt-0.5 block">{c.count}</span>
                <span className="text-[11px] text-muted-foreground mt-0.5 block">{c.desc}</span>
              </div>
              <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
