"use client";

import * as React from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MailIcon,
  FileTextIcon,
  AlertCircleIcon,
  CalendarPlusIcon,
  ArrowLeftIcon,
  HelpCircleIcon,
} from "lucide-react";
import Link from "next/link";
import type { Lesson } from "../types/booking.types";
import { RescheduleForm } from "./RescheduleForm";

interface ManageBookingProps {
  lesson: Lesson;
  professorName?: string;
}

export function ManageBooking({ lesson, professorName = "il Professore" }: ManageBookingProps) {
  const [currentLesson, setCurrentLesson] = React.useState<Lesson>(lesson);
  const [isRescheduleOpen, setIsRescheduleOpen] = React.useState(false);

  const startDate = new Date(currentLesson.start_time);
  const endDate = new Date(currentLesson.end_time);

  const formattedDate = format(startDate, "EEEE d MMMM yyyy", { locale: it });
  const formattedStartTime = format(startDate, "HH:mm");
  const formattedEndTime = format(endDate, "HH:mm");

  // Genera link Google Calendar (formato YYYYMMDDTHHmmssZ)
  const formatGCalDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `Lezione con ${professorName}`
  )}&dates=${formatGCalDate(startDate)}/${formatGCalDate(endDate)}&details=${encodeURIComponent(
    `Lezione privata con ${professorName}.\nID Prenotazione: ${currentLesson.id}`
  )}`;

  const handleRescheduleSuccess = () => {
    setCurrentLesson((prev) => ({
      ...prev,
      reschedule_requested: true,
    }));
    setIsRescheduleOpen(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-4 space-y-6">
      {/* CARD PRINCIPALE PRENOTAZIONE */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="pb-4 border-b border-border bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Riepilogo Prenotazione
              </span>
              <CardTitle className="text-xl font-bold text-text capitalize mt-0.5">
                {formattedDate}
              </CardTitle>
            </div>

            <div>
              {currentLesson.status === "confirmed" ? (
                <Badge className="bg-primary text-white hover:bg-primary px-3 py-1 text-xs">
                  ✓ Confermata dal Docente
                </Badge>
              ) : currentLesson.status === "pending" ? (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 px-3 py-1 text-xs">
                  ⏳ In Attesa di Conferma
                </Badge>
              ) : (
                <Badge variant="outline">{currentLesson.status}</Badge>
              )}
            </div>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Codice lezione: <code className="text-text font-mono">{currentLesson.id}</code>
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* DETTAGLI ORARIO E STUDENTE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-card border border-border space-y-2.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Orario Lezione
              </span>
              <div className="flex items-center gap-2 text-text font-semibold text-base">
                <ClockIcon className="w-4 h-4 text-primary" />
                <span>
                  {formattedStartTime} - {formattedEndTime}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span className="capitalize">{formattedDate}</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-card border border-border space-y-2.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Dati Studente
              </span>
              <div className="flex items-center gap-2 text-text text-sm">
                <UserIcon className="w-4 h-4 text-primary" />
                <span>{currentLesson.guest_name || "Studente"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MailIcon className="w-3.5 h-3.5" />
                <span>{currentLesson.guest_email || "Nessuna email"}</span>
              </div>
            </div>
          </div>

          {/* NOTE DELLO STUDENTE */}
          {currentLesson.notes && (
            <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-1 text-sm">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <FileTextIcon className="w-3.5 h-3.5" /> Note inserite al momento della richiesta:
              </span>
              <p className="text-text text-xs sm:text-sm italic">{currentLesson.notes}</p>
            </div>
          )}

          {/* AZIONI SE CONFERMATA: GOOGLE CALENDAR */}
          {currentLesson.status === "confirmed" && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm">
                <p className="font-semibold text-text">La lezione è confermata!</p>
                <p className="text-xs text-muted-foreground">
                  Aggiungila al tuo calendario per ricevere un promemoria prima dell&apos;inizio.
                </p>
              </div>
              <a
                href={gcalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button variant="outline" size="sm" className="w-full border-primary/30 text-primary hover:bg-primary/10">
                  <CalendarPlusIcon className="w-4 h-4 mr-2" />
                  Aggiungi a Google Calendar
                </Button>
              </a>
            </div>
          )}

          {/* SEZIONE SPOSTAMENTO LEZIONE */}
          <div className="pt-2 border-t border-border">
            {currentLesson.reschedule_requested ? (
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <AlertCircleIcon className="w-4 h-4" />
                  Richiesta di Spostamento Inoltrata
                </div>
                <p className="text-xs leading-relaxed">
                  Hai richiesto di spostare questa lezione. Il professore ha ricevuto la tua notifica
                  e ti ricontatterà all&apos;indirizzo <strong>{currentLesson.guest_email}</strong> per
                  concordare un nuovo appuntamento.
                </p>
                {currentLesson.reschedule_notes && (
                  <p className="text-xs italic pt-1 border-t border-amber-500/20">
                    &ldquo;{currentLesson.reschedule_notes}&rdquo;
                  </p>
                )}
              </div>
            ) : !isRescheduleOpen ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground">
                  Hai avuto un imprevisto? Puoi richiedere un cambio di data o orario.
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRescheduleOpen(true)}
                  className="text-xs"
                >
                  Richiedi Spostamento
                </Button>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-muted/40 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-text">Richiesta Cambio Orario</span>
                </div>
                <RescheduleForm
                  lessonId={currentLesson.id}
                  onSuccess={handleRescheduleSuccess}
                  onCancel={() => setIsRescheduleOpen(false)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* FOOTER INFORMATIVO & LINK DI RITORNO */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground px-2">
        <Link
          href="/"
          className="flex items-center gap-1.5 hover:text-primary transition-colors"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" /> Torna alla Homepage
        </Link>
        <div className="flex items-center gap-1.5">
          <HelpCircleIcon className="w-3.5 h-3.5" />
          <span>Dubbi o domande?</span>
          <Link href="/contatti" className="underline hover:text-primary">
            Scrivi al docente
          </Link>
        </div>
      </div>
    </div>
  );
}
