"use client";

import * as React from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ClockIcon,
  CheckCircle2Icon,
  CalendarIcon,
  MessageSquareIcon,
  UserIcon,
  MailIcon,
  Trash2Icon,
  CalendarPlusIcon,
  Loader2Icon,
  InboxIcon,
  RotateCwIcon,
  CheckIcon,
  XIcon,
  PencilIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import type { DashboardData, DashboardLesson, ContactMessage } from "../types/dashboard.types";
import { removeAvailableSlot, runManualCleanup } from "../actions/dashboard.actions";
import { deleteContactMessage } from "@/features/contact/actions/contact.actions";
import { LessonCardItem } from "./LessonCardItem";
import { ExpandableText } from "./ExpandableText";

const CreateSlotDialog = dynamic(
  () => import("./CreateSlotDialog").then((mod) => mod.CreateSlotDialog)
);
const EditLessonDialog = dynamic(
  () => import("./EditLessonDialog").then((mod) => mod.EditLessonDialog)
);
const RejectLessonDialog = dynamic(
  () => import("./RejectLessonDialog").then((mod) => mod.RejectLessonDialog)
);
const CancelLessonDialog = dynamic(
  () => import("./CancelLessonDialog").then((mod) => mod.CancelLessonDialog)
);
const ConfirmLessonDialog = dynamic(
  () => import("./ConfirmLessonDialog").then((mod) => mod.ConfirmLessonDialog)
);

interface LessonTabsProps {
  readonly data: DashboardData;
}

export function LessonTabs({ data }: LessonTabsProps) {
  const [loadingActionId, setLoadingActionId] = React.useState<string | null>(null);
  const [isRunningCleanup, setIsRunningCleanup] = React.useState(false);

  // Dialog State per Modali di Conferma eleganti (in stile con il design system)
  const [slotToDelete, setSlotToDelete] = React.useState<DashboardLesson | null>(null);
  const [messageToDelete, setMessageToDelete] = React.useState<ContactMessage | null>(null);
  const [cleanupConfirmOpen, setCleanupConfirmOpen] = React.useState(false);

  const executeCleanup = async () => {
    setIsRunningCleanup(true);
    setCleanupConfirmOpen(false);
    try {
      const result = await runManualCleanup();
      if (result.success) {
        toast.success(
          `Cleanup completato con successo: ${result.cancelledExpired ?? 0} lezioni scadute annullate, ${result.deletedSlots ?? 0} slot passati rimossi.`
        );
      } else {
        toast.error(result.error || "Errore durante l'esecuzione del cleanup.");
      }
    } catch {
      toast.error("Impossibile eseguire il cleanup di sistema.");
    } finally {
      setIsRunningCleanup(false);
    }
  };

  const executeRemoveSlot = async () => {
    if (!slotToDelete) return;
    const slotId = slotToDelete.id;
    setSlotToDelete(null);
    setLoadingActionId(slotId);

    try {
      const res = await removeAvailableSlot(slotId);
      if (!res.success) {
        toast.error(res.error || "Impossibile eliminare lo slot.");
      } else {
        toast.success("Slot di disponibilità rimosso con successo.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Si è verificato un errore inatteso.");
    } finally {
      setLoadingActionId(null);
    }
  };

  const executeDeleteMessage = async () => {
    if (!messageToDelete) return;
    const messageId = messageToDelete.id;
    setMessageToDelete(null);
    setLoadingActionId(messageId);

    try {
      const res = await deleteContactMessage(messageId);
      if (!res.success) {
        toast.error(res.error || "Impossibile eliminare il messaggio.");
      } else {
        toast.success("Messaggio eliminato con successo.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Si è verificato un errore inatteso.");
    } finally {
      setLoadingActionId(null);
    }
  };

  // Google Calendar URL generator helper
  const getGCalUrl = (lesson: DashboardLesson) => {
    const start = new Date(lesson.start_time);
    const end = new Date(lesson.end_time);
    const formatGCalDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      `Lezione con ${lesson.guest_name || "Studente"}`
    )}&dates=${formatGCalDate(start)}/${formatGCalDate(end)}&details=${encodeURIComponent(
      `Lezione privata EduBook.\nStudente: ${lesson.guest_name} (${lesson.guest_email})\nNote: ${lesson.notes || "Nessuna"}`
    )}`;
  };

  return (
    <Tabs defaultValue="in-attesa" className="w-full flex flex-col">
      <div className="flex flex-col md:flex-row gap-6 items-start w-full">
        {/* COLONNA SINISTRA: 4 PULSANTI VERTICALI + AZIONE RAPIDA SLOT */}
        <div className="w-full md:w-64 lg:w-72 shrink-0 space-y-4">
          <div className="p-3 bg-card rounded-xl border border-border shadow-sm space-y-2">
            <div className="px-2 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Sezioni Operative
            </div>
            <TabsList className="flex flex-col w-full h-auto p-0 bg-transparent space-y-1.5 border-0">
              <TabsTrigger
                value="in-attesa"
                className="w-full justify-between px-3.5 py-3 text-sm font-semibold rounded-lg border border-transparent transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-muted/60 data-[state=inactive]:text-foreground"
              >
                <div className="flex items-center gap-2.5">
                  <ClockIcon className="w-4 h-4 text-amber-500 data-[state=active]:text-white" />
                  <span>In Attesa</span>
                </div>
                {data.stats.pendingCount > 0 ? (
                  <Badge className="bg-amber-500 text-white hover:bg-amber-500 text-xs px-2 py-0.5">
                    {data.stats.pendingCount}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground border-border/80">
                    0
                  </Badge>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="confermate"
                className="w-full justify-between px-3.5 py-3 text-sm font-semibold rounded-lg border border-transparent transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-muted/60 data-[state=inactive]:text-foreground"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2Icon className="w-4 h-4 text-primary data-[state=active]:text-white" />
                  <span>Confermate</span>
                </div>
                <Badge variant={data.stats.confirmedCount > 0 ? "default" : "outline"} className="text-xs px-2 py-0.5">
                  {data.stats.confirmedCount}
                </Badge>
              </TabsTrigger>

              <TabsTrigger
                value="disponibilita"
                className="w-full justify-between px-3.5 py-3 text-sm font-semibold rounded-lg border border-transparent transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-muted/60 data-[state=inactive]:text-foreground"
              >
                <div className="flex items-center gap-2.5">
                  <CalendarIcon className="w-4 h-4 text-secondary data-[state=active]:text-white" />
                  <span>Disponibilità</span>
                </div>
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {data.stats.availableCount}
                </Badge>
              </TabsTrigger>

              <TabsTrigger
                value="messaggi"
                className="w-full justify-between px-3.5 py-3 text-sm font-semibold rounded-lg border border-transparent transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:hover:bg-muted/60 data-[state=inactive]:text-foreground"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquareIcon className="w-4 h-4 text-sky-500 data-[state=active]:text-white" />
                  <span>Messaggi</span>
                </div>
                {data.stats.contactsCount > 0 ? (
                  <Badge className="bg-sky-500 text-white hover:bg-sky-500 text-xs px-2 py-0.5">
                    {data.stats.contactsCount}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground border-border/80">
                    0
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Azione Rapida Aggiunta Disponibilità */}
          <div className="p-3.5 bg-card rounded-xl border border-border shadow-sm space-y-2">
            <span className="text-xs font-semibold text-muted-foreground block">
              Disponibilità Docente
            </span>
            <div className="w-full [&>button]:w-full">
              <CreateSlotDialog />
            </div>
          </div>

          {/* Manutenzione Sistema */}
          <div className="p-3.5 bg-card rounded-xl border border-border shadow-sm space-y-2.5">
            <div>
              <span className="text-xs font-semibold text-foreground block">
                Manutenzione Sistema
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                Annulla le richieste scadute e rimuove gli slot passati.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCleanupConfirmOpen(true)}
              disabled={isRunningCleanup}
              className="w-full text-xs font-medium h-9 border-border/80 hover:bg-muted"
            >
              {isRunningCleanup ? (
                <span className="flex items-center gap-1.5">
                  <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                  Pulizia in corso...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <RotateCwIcon className="w-3.5 h-3.5 text-primary" />
                  Avvia Manutenzione
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* COLONNA DESTRA: AREA OPERAZIONI A DIMENSIONE STABILE */}
        <div className="flex-1 min-w-0 w-full min-h-[520px]">

      {/* 1. TAB: LEZIONI IN ATTESA (Layout 1: DATA ORA NOME | MAIL X CHECK - NOTE ALTEZZA VARIABILE) */}
      <TabsContent value="in-attesa" className="w-full space-y-4">
        {data.pendingLessons.length === 0 ? (
          <Card className="w-full border-dashed border-border bg-muted/20 text-center py-12">
            <CardContent className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <InboxIcon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground text-base">Nessuna richiesta in attesa</h3>
              <p className="text-muted-foreground text-xs max-w-sm mx-auto">
                Quando uno studente prenota uno slot libero dal sito pubblico, la richiesta apparirà qui per
                la tua approvazione.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 w-full">
            {data.pendingLessons.map((lesson) => {
              return (
                <LessonCardItem
                  key={lesson.id}
                  lesson={lesson}
                  topActions={
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {lesson.guest_email && (
                        <a
                          href={`mailto:${lesson.guest_email}?subject=${encodeURIComponent("Richiesta di lezione EduBook")}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
                          title={`Invia email a ${lesson.guest_email}`}
                          aria-label={`Rispondi via email a ${lesson.guest_name || "studente"}`}
                        >
                          <MailIcon className="w-3.5 h-3.5" />
                          <span>Rispondi</span>
                        </a>
                      )}

                      <EditLessonDialog
                        lesson={lesson}
                        trigger={
                          <div
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium transition-colors cursor-pointer"
                            title="Modifica orario lezione"
                            aria-label="Modifica orario lezione"
                          >
                            <PencilIcon className="w-3.5 h-3.5" />
                            <span>Modifica</span>
                          </div>
                        }
                      />

                      <RejectLessonDialog
                        lessonId={lesson.id}
                        guestName={lesson.guest_name}
                        guestEmail={lesson.guest_email}
                        trigger={
                          <div
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-medium transition-colors cursor-pointer"
                            title="Rifiuta richiesta"
                            aria-label="Rifiuta richiesta"
                          >
                            <XIcon className="w-3.5 h-3.5" />
                            <span>Rifiuta</span>
                          </div>
                        }
                      />

                      <ConfirmLessonDialog
                        lessonId={lesson.id}
                        guestName={lesson.guest_name}
                        guestEmail={lesson.guest_email}
                        startTime={lesson.start_time}
                        endTime={lesson.end_time}
                        trigger={
                          <div
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-primary/30 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium transition-colors shadow-sm cursor-pointer"
                            title="Conferma richiesta"
                            aria-label="Conferma richiesta"
                          >
                            <CheckIcon className="w-3.5 h-3.5" />
                            <span>Conferma</span>
                          </div>
                        }
                      />
                    </div>
                  }
                />
              );
            })}
          </div>
        )}
      </TabsContent>

      {/* 2. TAB: LEZIONI CONFERMATE (Layout 2: DATA ORA NOME | MAIL - NOTE ALTEZZA VARIABILE - FOOTER: CALENDAR | EDIT | DELETE) */}
      <TabsContent value="confermate" className="w-full space-y-4">
        {data.confirmedLessons.length === 0 ? (
          <Card className="w-full border-dashed border-border bg-muted/20 text-center py-12">
            <CardContent className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <CheckCircle2Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground text-base">Nessuna lezione confermata</h3>
              <p className="text-muted-foreground text-xs max-w-sm mx-auto">
                Le lezioni che confermi appariranno in questo elenco con gli appuntamenti in programma.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 w-full">
            {data.confirmedLessons.map((lesson) => {
              return (
                <LessonCardItem
                  key={lesson.id}
                  lesson={lesson}
                  topActions={
                    lesson.guest_email ? (
                      <a
                        href={`mailto:${lesson.guest_email}?subject=${encodeURIComponent("Lezione confermata EduBook")}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
                        title={`Invia email a ${lesson.guest_email}`}
                        aria-label={`Rispondi via email a ${lesson.guest_name || "studente"}`}
                      >
                        <MailIcon className="w-3.5 h-3.5" />
                        <span>Rispondi</span>
                      </a>
                    ) : null
                  }
                  footer={
                    <div className="flex items-center justify-between gap-2">
                      {/* Sinistra: Pulsante Google Calendar Pill */}
                      <a
                        href={getGCalUrl(lesson)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors"
                        title="Aggiungi a Google Calendar"
                      >
                        <CalendarPlusIcon className="w-3.5 h-3.5" />
                        <span>Calendar</span>
                      </a>

                      {/* Destra: Modifica Orario & Elimina affiancati */}
                      <div className="flex items-center gap-2">
                        <EditLessonDialog
                          lesson={lesson}
                          trigger={
                            <div
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium transition-colors cursor-pointer"
                              title="Modifica orario lezione"
                              aria-label="Modifica orario lezione"
                            >
                              <PencilIcon className="w-3.5 h-3.5" />
                              <span>Modifica</span>
                            </div>
                          }
                        />

                        <CancelLessonDialog
                          lessonId={lesson.id}
                          guestName={lesson.guest_name}
                          trigger={
                            <div
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-destructive/20 bg-background hover:bg-destructive/10 text-destructive text-xs font-medium transition-colors cursor-pointer"
                              title="Annulla o elimina lezione"
                              aria-label="Annulla o elimina lezione"
                            >
                              <Trash2Icon className="w-3.5 h-3.5" />
                              <span>Elimina</span>
                            </div>
                          }
                        />
                      </div>
                    </div>
                  }
                />
              );
            })}
          </div>
        )}
      </TabsContent>

      {/* 3. TAB: DISPONIBILITÀ (Layout 3: DATA • ORA • DURATA • VISIBILE - EDIT / TRASH) */}
      <TabsContent value="disponibilita" className="w-full space-y-4">
        <div className="p-4 rounded-xl bg-card border border-border w-full">
          <h3 className="font-bold text-foreground text-sm sm:text-base">Gestione Slot di Disponibilità</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gli slot liberi impostati qui sotto sono visibili pubblicamente agli studenti sul calendario.
          </p>
        </div>

        {data.availableSlots.length === 0 ? (
          <Card className="w-full border-dashed border-border bg-muted/20 text-center py-12">
            <CardContent className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground text-base">Nessuno slot libero programmato</h3>
              <p className="text-muted-foreground text-xs max-w-sm mx-auto">
                Usa il pulsante &ldquo;Aggiungi Disponibilità&rdquo; nel pannello laterale per creare le fasce orarie in cui sei libero per lezioni private.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 w-full">
            {data.availableSlots.map((slot) => {
              const start = new Date(slot.start_time);
              const end = new Date(slot.end_time);
              const durationMin = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
              const isDeleting = loadingActionId === slot.id;

              return (
                <Card key={slot.id} className="w-full border-border shadow-sm overflow-hidden bg-card">
                  <CardContent className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                    {/* A sinistra: DATA • ORA • DURATA */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm font-semibold text-foreground">
                      <div className="flex items-center gap-1.5 text-primary">
                        <CalendarIcon className="w-4 h-4 shrink-0" />
                        <span className="capitalize">{format(start, "EEE d MMM yyyy", { locale: it })}</span>
                      </div>

                      <span className="text-muted-foreground/50 hidden sm:inline">•</span>

                      <div className="flex items-center gap-1 text-muted-foreground font-medium">
                        <ClockIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {format(start, "HH:mm")} - {format(end, "HH:mm")}
                        </span>
                      </div>

                      <span className="text-muted-foreground/50 hidden sm:inline">•</span>

                      <div className="text-muted-foreground font-medium">
                        {durationMin} min
                      </div>

                      <span className="text-muted-foreground/50 hidden sm:inline">•</span>

                      {/* Stato: • VISIBILE */}
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span>VISIBILE</span>
                      </div>
                    </div>

                    {/* All'estrema destra: Tasto Elimina */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSlotToDelete(slot)}
                        disabled={isDeleting}
                        className="h-8 px-2.5 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/20 rounded-md"
                        title="Rimuovi disponibilità"
                        aria-label="Rimuovi disponibilità"
                      >
                        {isDeleting ? (
                          <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2Icon className="w-3.5 h-3.5" />
                        )}
                        <span>Elimina</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </TabsContent>

      {/* 4. TAB: MESSAGGI (Layout 4: MITTENTE • EMAIL | DATA E ORA - MESSAGGIO ALTEZZA VARIABILE - FOOTER: RISPONDI | CESTINO) */}
      <TabsContent value="messaggi" className="w-full space-y-4">
        {data.contactMessages.length === 0 ? (
          <Card className="w-full border-dashed border-border bg-muted/20 text-center py-12">
            <CardContent className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <MessageSquareIcon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground text-base">Nessun messaggio ricevuto</h3>
              <p className="text-muted-foreground text-xs max-w-sm mx-auto">
                I messaggi inviati tramite la pagina pubblica di contatto appariranno qui.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 w-full">
            {data.contactMessages.map((msg) => {
              const isDeleting = loadingActionId === msg.id;

              return (
                <Card key={msg.id} className="w-full border-border shadow-sm overflow-hidden bg-card">
                  <CardContent className="p-4 sm:p-5 space-y-3 w-full">
                    {/* RIGA SUPERIORE: MITTENTE • EMAIL (a sinistra) | DATA E ORA (a destra) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm font-semibold text-foreground">
                        <div className="flex items-center gap-1.5">
                          <UserIcon className="w-4 h-4 text-primary shrink-0" />
                          <span>{msg.name}</span>
                        </div>

                        <span className="text-muted-foreground/50 hidden sm:inline">•</span>

                        <a
                          href={`mailto:${msg.email}`}
                          className="text-xs sm:text-sm font-normal text-muted-foreground hover:text-primary hover:underline"
                        >
                          {msg.email}
                        </a>
                      </div>

                      <div className="text-xs text-muted-foreground font-medium self-end sm:self-auto shrink-0">
                        {format(new Date(msg.created_at), "d MMMM yyyy, HH:mm", { locale: it })}
                      </div>
                    </div>

                    {/* CORPO MESSAGGIO: ALTEZZA VARIABILE (V) con 'continua a leggere' se supera 3 righe */}
                    <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-xs sm:text-sm text-foreground leading-relaxed">
                      <ExpandableText text={msg.message} className="text-foreground/90 leading-relaxed text-xs sm:text-sm" />
                    </div>

                    {/* RIGA INFERIORE / FOOTER: RISPONDI (a sinistra) | CESTINO (a destra) */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/70">
                      <a
                        href={`mailto:${msg.email}?subject=${encodeURIComponent("Risposta da EduBook")}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline py-1"
                        title="Rispondi via email"
                      >
                        <MailIcon className="w-3.5 h-3.5" />
                        <span>Rispondi</span>
                      </a>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMessageToDelete(msg)}
                        disabled={isDeleting}
                        className="h-8 px-2.5 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/20 rounded-md"
                        title="Elimina messaggio"
                        aria-label="Elimina messaggio"
                      >
                        {isDeleting ? (
                          <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2Icon className="w-3.5 h-3.5" />
                        )}
                        <span>Elimina</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </TabsContent>
        </div>
      </div>

      {/* Dialog Conferma Pulizia Sistema */}
      <Dialog open={cleanupConfirmOpen} onOpenChange={setCleanupConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
              <RotateCwIcon className="w-5 h-5" />
            </div>
            <DialogTitle>Conferma Manutenzione Sistema</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground space-y-2 pt-1">
              <span>Questa operazione eseguirà la manutenzione automatica del sistema:</span>
              <ul className="list-disc list-inside space-y-1 pl-1 text-foreground/80 font-medium">
                <li>Annulla automaticamente le prenotazioni in attesa scadute.</li>
                <li>Rimuove gli slot di disponibilità passati e non più prenotabili.</li>
              </ul>
              <span>Vuoi avviare la procedura adesso?</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCleanupConfirmOpen(false)}
              disabled={isRunningCleanup}
            >
              Annulla
            </Button>
            <Button
              type="button"
              onClick={executeCleanup}
              disabled={isRunningCleanup}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {isRunningCleanup ? (
                <>
                  <Loader2Icon className="w-4 h-4 animate-spin mr-1.5" />
                  Pulizia in corso...
                </>
              ) : (
                "Conferma ed Esegui"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Conferma Eliminazione Slot */}
      <Dialog open={!!slotToDelete} onOpenChange={(open) => !open && setSlotToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-2">
              <Trash2Icon className="w-5 h-5" />
            </div>
            <DialogTitle>Elimina Slot di Disponibilità</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground pt-1">
              Sei sicuro di voler rimuovere questo slot di disponibilità?
              {slotToDelete && (
                <span className="block mt-2 font-medium text-foreground bg-muted/60 p-2.5 rounded-md">
                  {format(new Date(slotToDelete.start_time), "EEEE d MMMM yyyy", { locale: it })} dalle{" "}
                  {format(new Date(slotToDelete.start_time), "HH:mm")} alle{" "}
                  {format(new Date(slotToDelete.end_time), "HH:mm")}
                </span>
              )}
              <span className="block mt-2 text-xs">
                Gli studenti non potranno più prenotare lezioni private in questa fascia oraria.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSlotToDelete(null)}
              disabled={loadingActionId === slotToDelete?.id}
            >
              Annulla
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={executeRemoveSlot}
              disabled={loadingActionId === slotToDelete?.id}
            >
              {loadingActionId === slotToDelete?.id ? (
                <>
                  <Loader2Icon className="w-4 h-4 animate-spin mr-1.5" />
                  Eliminazione...
                </>
              ) : (
                "Elimina Slot"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Conferma Eliminazione Messaggio */}
      <Dialog open={!!messageToDelete} onOpenChange={(open) => !open && setMessageToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-2">
              <Trash2Icon className="w-5 h-5" />
            </div>
            <DialogTitle>Elimina Messaggio di Contatto</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground pt-1">
              Sei sicuro di voler eliminare questo messaggio? L&apos;operazione non può essere annullata.
              {messageToDelete && (
                <span className="block mt-2 font-medium text-foreground bg-muted/60 p-2.5 rounded-md">
                  Da: <strong>{messageToDelete.name}</strong> ({messageToDelete.email})
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setMessageToDelete(null)}
              disabled={loadingActionId === messageToDelete?.id}
            >
              Annulla
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={executeDeleteMessage}
              disabled={loadingActionId === messageToDelete?.id}
            >
              {loadingActionId === messageToDelete?.id ? (
                <>
                  <Loader2Icon className="w-4 h-4 animate-spin mr-1.5" />
                  Eliminazione...
                </>
              ) : (
                "Elimina Messaggio"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
