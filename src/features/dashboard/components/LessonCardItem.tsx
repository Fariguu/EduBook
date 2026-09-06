import * as React from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  FileTextIcon,
  AlertTriangleIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardLesson } from "../types/dashboard.types";

interface LessonCardItemProps {
  readonly lesson: DashboardLesson;
  readonly topActions: React.ReactNode;
  readonly footer?: React.ReactNode;
}

export function LessonCardItem({ lesson, topActions, footer }: LessonCardItemProps) {
  const start = new Date(lesson.start_time);
  const end = new Date(lesson.end_time);

  return (
    <Card className="w-full border-border shadow-sm overflow-hidden bg-card">
      <CardContent className="w-full p-4 sm:p-5 space-y-3">
        {/* RIGA SUPERIORE: DATA - ORA - NOME (a sinistra) | AZIONI (a destra) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-foreground">
            <div className="flex items-center gap-1.5 text-primary">
              <CalendarIcon className="w-4 h-4 shrink-0" />
              <span className="capitalize">{format(start, "EEE d MMM yyyy", { locale: it })}</span>
            </div>

            <span className="text-muted-foreground/50 hidden sm:inline">•</span>

            <div className="flex items-center gap-1 text-muted-foreground text-xs sm:text-sm font-medium">
              <ClockIcon className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
              <span>
                {format(start, "HH:mm")} - {format(end, "HH:mm")}
              </span>
            </div>

            <span className="text-muted-foreground/50 hidden sm:inline">•</span>

            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <UserIcon className="w-4 h-4 shrink-0 text-foreground/80" />
              <span className="truncate max-w-[200px]">{lesson.guest_name || "Ospite"}</span>
            </div>
          </div>

          {/* Icone / Azioni allineate a destra */}
          <div className="flex items-center gap-1 sm:gap-1.5 self-end sm:self-auto shrink-0">
            {topActions}
          </div>
        </div>

        {/* Notifica di richiesta spostamento (se presente) */}
        {lesson.reschedule_requested && (
          <div className="p-2.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-0.5">
            <div className="flex items-center gap-1.5 font-semibold text-amber-800">
              <AlertTriangleIcon className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span>Richiesta di spostamento orario da parte dello studente:</span>
            </div>
            {lesson.reschedule_notes && (
              <p className="italic pl-5 text-amber-950">&ldquo;{lesson.reschedule_notes}&rdquo;</p>
            )}
          </div>
        )}

        {/* CORPO NOTE: ALTEZZA VARIABILE (V) in base al contenuto */}
        {lesson.notes && (
          <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs text-foreground space-y-1">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
              <FileTextIcon className="w-3 h-3 text-muted-foreground" />
              <span>Note Studente</span>
            </div>
            <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {lesson.notes}
            </p>
          </div>
        )}

        {/* RIGA INFERIORE / FOOTER (es. per Layout Confermate: Calendar a sx, Edit al centro, Delete a dx) */}
        {footer && <div className="pt-2 border-t border-border/70">{footer}</div>}
      </CardContent>
    </Card>
  );
}
