import * as React from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  CalendarIcon,
  UserIcon,
  MailIcon,
  FileTextIcon,
  AlertTriangleIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardLesson } from "../types/dashboard.types";

interface LessonCardItemProps {
  readonly lesson: DashboardLesson;
  readonly badge: React.ReactNode;
  readonly footer: React.ReactNode;
}

export function LessonCardItem({ lesson, badge, footer }: LessonCardItemProps) {
  const start = new Date(lesson.start_time);
  const end = new Date(lesson.end_time);

  return (
    <Card className="w-full border-border shadow-sm overflow-hidden">
      <CardContent className="w-full p-5 space-y-4">
        {/* Header con data, ora e badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground capitalize text-sm sm:text-base">
              {format(start, "EEEE d MMMM yyyy", { locale: it })}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">
              ({format(start, "HH:mm")} - {format(end, "HH:mm")})
            </span>
          </div>
          {badge}
        </div>

        {/* Allerta spostamento se richiesto */}
        {lesson.reschedule_requested && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-600/80 text-amber-950 dark:text-amber-100 text-xs space-y-1 shadow-sm">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
              <AlertTriangleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              Lo studente ha richiesto di spostare questa lezione
            </div>
            {lesson.reschedule_notes && (
              <p className="italic pl-5 text-amber-900 dark:text-amber-200">&ldquo;{lesson.reschedule_notes}&rdquo;</p>
            )}
          </div>
        )}

        {/* Dati studente */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 text-foreground">
            <UserIcon className="w-4 h-4 text-primary shrink-0" />
            <span className="font-medium">{lesson.guest_name || "Ospite"}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MailIcon className="w-4 h-4 text-primary shrink-0" />
            <a href={`mailto:${lesson.guest_email}`} className="hover:underline">
              {lesson.guest_email || "Nessuna email"}
            </a>
          </div>
        </div>

        {/* Note inserite dallo studente */}
        {lesson.notes && (
          <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs text-foreground space-y-1">
            <span className="text-muted-foreground font-semibold flex items-center gap-1">
              <FileTextIcon className="w-3.5 h-3.5" /> Note studente:
            </span>
            <p className="italic pl-4">{lesson.notes}</p>
          </div>
        )}

        {/* Azioni / Footer */}
        {footer}
      </CardContent>
    </Card>
  );
}
