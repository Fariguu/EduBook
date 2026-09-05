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
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DashboardData, DashboardLesson, ContactMessage } from "../types/dashboard.types";
import { removeAvailableSlot } from "../actions/dashboard.actions";
import { deleteContactMessage } from "@/features/contact/actions/contact.actions";
import { CreateSlotDialog } from "./CreateSlotDialog";
import { EditLessonDialog } from "./EditLessonDialog";
import { RejectLessonDialog } from "./RejectLessonDialog";
import { CancelLessonDialog } from "./CancelLessonDialog";
import { ConfirmLessonDialog } from "./ConfirmLessonDialog";
import { LessonCardItem } from "./LessonCardItem";

interface LessonTabsProps {
  data: DashboardData;
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
      const res = await fetch("/api/cron/cleanup");
      const result = await res.json();
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
    <Tabs defaultValue="in-attesa" className="w-full">
      <div className="flex flex-col md:flex-row gap-6 items-start">
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

      {/* 1. TAB: LEZIONI IN ATTESA */}
      <TabsContent value="in-attesa" className="w-full space-y-4">
        {data.pendingLessons.length === 0 ? (
          <Card className="w-full border-dashed border-border bg-muted/20 text-center py-12">
            <CardContent className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <InboxIcon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-text text-base">Nessuna richiesta in attesa</h3>
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
                  badge={
                    <Badge className="w-fit bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-xs">
                      In Attesa di Conferma
                    </Badge>
                  }
                  footer={
                    <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-border">
                      <RejectLessonDialog
                        lessonId={lesson.id}
                        guestName={lesson.guest_name}
                        guestEmail={lesson.guest_email}
                      />
                      <EditLessonDialog lesson={lesson} />
                      <ConfirmLessonDialog
                        lessonId={lesson.id}
                        guestName={lesson.guest_name}
                        guestEmail={lesson.guest_email}
                        startTime={lesson.start_time}
                        endTime={lesson.end_time}
                      />
                    </div>
                  }
                />
              );
            })}
          </div>
        )}
      </TabsContent>

      {/* 2. TAB: LEZIONI CONFERMATE */}
      <TabsContent value="confermate" className="w-full space-y-4">
        {data.confirmedLessons.length === 0 ? (
          <Card className="w-full border-dashed border-border bg-muted/20 text-center py-12">
            <CardContent className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <CheckCircle2Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-text text-base">Nessuna lezione confermata</h3>
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
                  badge={
                    <Badge className="w-fit bg-primary text-white hover:bg-primary text-xs">
                      ✓ Confermata
                    </Badge>
                  }
                  footer={
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
                      <a
                        href={getGCalUrl(lesson)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1.5"
                      >
                        <CalendarPlusIcon className="w-3.5 h-3.5" />
                        Apri in Google Calendar
                      </a>

                      <div className="flex items-center gap-2">
                        <EditLessonDialog lesson={lesson} />
                        <CancelLessonDialog lessonId={lesson.id} guestName={lesson.guest_name} />
                      </div>
                    </div>
                  }
                />
              );
            })}
          </div>
        )}
      </TabsContent>

      {/* 3. TAB: DISPONIBILITÀ (SLOT LIBERI) */}
      <TabsContent value="disponibilita" className="w-full space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border w-full">
          <div>
            <h3 className="font-bold text-text text-sm sm:text-base">Gestione Slot di Disponibilità</h3>
            <p className="text-xs text-muted-foreground">
              Gli slot liberi impostati qui sotto sono visibili pubblicamente agli studenti sul calendario.
            </p>
          </div>
          <CreateSlotDialog />
        </div>

        {data.availableSlots.length === 0 ? (
          <Card className="w-full border-dashed border-border bg-muted/20 text-center py-12">
            <CardContent className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-text text-base">Nessuno slot libero programmato</h3>
              <p className="text-muted-foreground text-xs max-w-sm mx-auto">
                Clicca su &ldquo;Aggiungi Disponibilità&rdquo; per creare le fasce orarie in cui sei libero per lezioni private.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 w-full">
            {data.availableSlots.map((slot) => {
              const start = new Date(slot.start_time);
              const end = new Date(slot.end_time);
              const durationMin = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
              const isDeleting = loadingActionId === slot.id;

              return (
                <Card key={slot.id} className="w-full border-border shadow-sm overflow-hidden">
                  <CardContent className="p-5 space-y-4 w-full">
                    {/* Header con data, orario e badge */}
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
                      <Badge className="w-fit bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-xs">
                        Disponibile per Prenotazione
                      </Badge>
                    </div>

                    {/* Dettagli slot e disponibilità */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2 text-foreground">
                        <ClockIcon className="w-4 h-4 text-primary shrink-0" />
                        <span className="font-medium">Durata slot: {durationMin} minuti</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                        <span>Visibile pubblicamente nel calendario prenotazioni</span>
                      </div>
                    </div>

                    {/* Azioni / Footer */}
                    <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSlotToDelete(slot)}
                        disabled={isDeleting}
                        className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 h-9 px-3.5"
                      >
                        {isDeleting ? (
                          <span className="flex items-center gap-1.5">
                            <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                            Eliminazione...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <Trash2Icon className="w-3.5 h-3.5" />
                            Rimuovi Disponibilità
                          </span>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </TabsContent>

      {/* 4. TAB: MESSAGGI DAL MODULO DI CONTATTO */}
      <TabsContent value="messaggi" className="w-full space-y-4">
        {data.contactMessages.length === 0 ? (
          <Card className="w-full border-dashed border-border bg-muted/20 text-center py-12">
            <CardContent className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <MessageSquareIcon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-text text-base">Nessun messaggio ricevuto</h3>
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
                <Card key={msg.id} className="w-full border-border shadow-sm">
                  <CardContent className="p-5 space-y-3 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-primary" />
                        <span className="font-bold text-text text-sm">{msg.name}</span>
                        <span className="text-xs text-muted-foreground">
                          (&lt;<a href={`mailto:${msg.email}`} className="text-primary hover:underline">{msg.email}</a>&gt;)
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {format(new Date(msg.created_at), "d MMMM yyyy, HH:mm", { locale: it })}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-xs sm:text-sm text-text whitespace-pre-wrap leading-relaxed">
                      {msg.message}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <a
                        href={`mailto:${msg.email}?subject=${encodeURIComponent("Risposta da EduBook")}`}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
                      >
                        <MailIcon className="w-3.5 h-3.5" />
                        Rispondi via email
                      </a>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMessageToDelete(msg)}
                        disabled={isDeleting}
                        className="text-xs text-destructive hover:bg-destructive/10 h-8 px-2"
                      >
                        {isDeleting ? (
                          <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span className="flex items-center gap-1">
                            <Trash2Icon className="w-3.5 h-3.5" />
                            Elimina
                          </span>
                        )}
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
