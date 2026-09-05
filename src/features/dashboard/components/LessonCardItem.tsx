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
  lesson: DashboardLesson;
  badge: React.ReactNode;
  footer: React.ReactNode;
}

export function LessonCardItem({ lesson, badge, footer }: LessonCardItemProps) {
  const start = new Date(lesson.start_time);
  const end = new Date(lesson.end_time);

  return (
    <Card className="border-border shadow-sm overflow-hidden">
      <CardContent className="p-5 space-y-4">
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
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangleIcon className="w-4 h-4" />
              Lo studente ha richiesto di spostare questa lezione
            </div>
            {lesson.reschedule_notes && (
              <p className="italic pl-5">&ldquo;{lesson.reschedule_notes}&rdquo;</p>
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
