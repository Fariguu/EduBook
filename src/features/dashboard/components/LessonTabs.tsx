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
  CheckIcon,
  CalendarPlusIcon,
  Loader2Icon,
  InboxIcon,
} from "lucide-react";
import type { DashboardData, DashboardLesson } from "../types/dashboard.types";
import { confirmLesson, removeAvailableSlot } from "../actions/dashboard.actions";
import { deleteContactMessage } from "@/features/contact/actions/contact.actions";
import { CreateSlotDialog } from "./CreateSlotDialog";
import { EditLessonDialog } from "./EditLessonDialog";
import { RejectLessonDialog } from "./RejectLessonDialog";
import { CancelLessonDialog } from "./CancelLessonDialog";
import { LessonCardItem } from "./LessonCardItem";

interface LessonTabsProps {
  data: DashboardData;
}

export function LessonTabs({ data }: LessonTabsProps) {
  const [loadingActionId, setLoadingActionId] = React.useState<string | null>(null);

  const handleConfirm = async (lessonId: string) => {
    setLoadingActionId(lessonId);
    try {
      const res = await confirmLesson(lessonId);
      if (!res.success) {
        toast.error(res.error || "Impossibile confermare la lezione.");
      } else {
        toast.success("Lezione confermata ed email inviata allo studente!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Si è verificato un errore inatteso.");
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleRemoveSlot = async (slotId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo slot di disponibilità?")) return;

    setLoadingActionId(slotId);
    try {
      const res = await removeAvailableSlot(slotId);
      if (!res.success) {
        toast.error(res.error || "Impossibile eliminare lo slot.");
      } else {
        toast.success("Slot rimosso con successo.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Si è verificato un errore inatteso.");
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Eliminare definitivamente questo messaggio?")) return;

    setLoadingActionId(messageId);
    try {
      const res = await deleteContactMessage(messageId);
      if (!res.success) {
        toast.error(res.error || "Impossibile eliminare il messaggio.");
      } else {
        toast.success("Messaggio eliminato.");
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
    <Tabs defaultValue="in-attesa" className="w-full space-y-6">
      <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto p-1 bg-muted/60 rounded-xl border border-border">
        <TabsTrigger value="in-attesa" className="py-2.5 text-xs sm:text-sm font-semibold gap-2">
          <ClockIcon className="w-4 h-4 text-amber-500" />
          <span>In Attesa</span>
          {data.stats.pendingCount > 0 && (
            <Badge className="bg-amber-500 text-white hover:bg-amber-500 text-[10px] px-1.5 py-0 h-4">
              {data.stats.pendingCount}
            </Badge>
          )}
        </TabsTrigger>

        <TabsTrigger value="confermate" className="py-2.5 text-xs sm:text-sm font-semibold gap-2">
          <CheckCircle2Icon className="w-4 h-4 text-primary" />
          <span>Confermate</span>
          {data.stats.confirmedCount > 0 && (
            <Badge className="bg-primary text-white hover:bg-primary text-[10px] px-1.5 py-0 h-4">
              {data.stats.confirmedCount}
            </Badge>
          )}
        </TabsTrigger>

        <TabsTrigger value="disponibilita" className="py-2.5 text-xs sm:text-sm font-semibold gap-2">
          <CalendarIcon className="w-4 h-4 text-secondary" />
          <span>Disponibilità</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
            {data.stats.availableCount}
          </Badge>
        </TabsTrigger>

        <TabsTrigger value="messaggi" className="py-2.5 text-xs sm:text-sm font-semibold gap-2">
          <MessageSquareIcon className="w-4 h-4 text-sky-500" />
          <span>Messaggi</span>
          {data.stats.contactsCount > 0 && (
            <Badge className="bg-sky-500 text-white hover:bg-sky-500 text-[10px] px-1.5 py-0 h-4">
              {data.stats.contactsCount}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      {/* 1. TAB: LEZIONI IN ATTESA */}
      <TabsContent value="in-attesa" className="space-y-4">
        {data.pendingLessons.length === 0 ? (
          <Card className="border-dashed border-border bg-muted/20 text-center py-12">
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
          <div className="grid grid-cols-1 gap-4">
            {data.pendingLessons.map((lesson) => {
              const isProcessing = loadingActionId === lesson.id;

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
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border">
                      <RejectLessonDialog
                        lessonId={lesson.id}
                        guestName={lesson.guest_name}
                        guestEmail={lesson.guest_email}
                      />
                      <EditLessonDialog lesson={lesson} />
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(lesson.id)}
                        disabled={isProcessing}
                        className="bg-primary text-white hover:bg-primary/90 text-xs"
                      >
                        {isProcessing ? (
                          <span className="flex items-center gap-1.5">
                            <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                            Conferma in corso...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <CheckIcon className="w-3.5 h-3.5" />
                            Conferma Lezione
                          </span>
                        )}
                      </Button>
                    </div>
                  }
                />
              );
            })}
          </div>
        )}
      </TabsContent>

      {/* 2. TAB: LEZIONI CONFERMATE */}
      <TabsContent value="confermate" className="space-y-4">
        {data.confirmedLessons.length === 0 ? (
          <Card className="border-dashed border-border bg-muted/20 text-center py-12">
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
          <div className="grid grid-cols-1 gap-4">
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
      <TabsContent value="disponibilita" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border">
          <div>
            <h3 className="font-bold text-text text-sm sm:text-base">Gestione Slot di Disponibilità</h3>
            <p className="text-xs text-muted-foreground">
              Gli slot liberi impostati qui sotto sono visibili pubblicamente agli studenti sul calendario.
            </p>
          </div>
          <CreateSlotDialog />
        </div>

        {data.availableSlots.length === 0 ? (
          <Card className="border-dashed border-border bg-muted/20 text-center py-12">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.availableSlots.map((slot) => {
              const start = new Date(slot.start_time);
              const end = new Date(slot.end_time);
              const isDeleting = loadingActionId === slot.id;

              return (
                <Card key={slot.id} className="border-border hover:border-primary/30 transition-all shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-text capitalize text-xs">
                        {format(start, "EEEE d MMMM", { locale: it })}
                      </span>
                      <Badge variant="outline" className="text-[10px] text-primary border-primary/20">
                        Disponibile
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-text font-bold text-sm">
                      <ClockIcon className="w-4 h-4 text-primary" />
                      <span>
                        {format(start, "HH:mm")} - {format(end, "HH:mm")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-[11px] text-muted-foreground">
                        {Math.round((end.getTime() - start.getTime()) / (1000 * 60))} min
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSlot(slot.id)}
                        disabled={isDeleting}
                        className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                      >
                        {isDeleting ? (
                          <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span className="flex items-center gap-1">
                            <Trash2Icon className="w-3.5 h-3.5" />
                            Rimuovi
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
      <TabsContent value="messaggi" className="space-y-4">
        {data.contactMessages.length === 0 ? (
          <Card className="border-dashed border-border bg-muted/20 text-center py-12">
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
          <div className="grid grid-cols-1 gap-4">
            {data.contactMessages.map((msg) => {
              const isDeleting = loadingActionId === msg.id;

              return (
                <Card key={msg.id} className="border-border shadow-sm">
                  <CardContent className="p-5 space-y-3">
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
                        onClick={() => handleDeleteMessage(msg.id)}
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
    </Tabs>
  );
}
