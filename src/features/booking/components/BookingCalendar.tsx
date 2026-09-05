"use client";

import * as React from "react";
import { format, isBefore, startOfToday } from "date-fns";
import { it } from "date-fns/locale";
import { Turnstile } from "@marsidev/react-turnstile";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  ClockIcon,
  CheckCircle2Icon,
  UserIcon,
  MailIcon,
  FileTextIcon,
  SparklesIcon,
  ArrowRightIcon,
  RefreshCwIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { AvailableSlot, TimeSlotOption } from "../types/booking.types";
import {
  getDaysWithAvailableSlots,
  getSlotsForDay,
  generateSlotIntervals,
} from "../utils/slot-utils";
import { bookLesson } from "../actions/booking.actions";

interface BookingCalendarProps {
  initialSlots: AvailableSlot[];
  professorName?: string;
}

export function BookingCalendar({
  initialSlots,
  professorName = "Professore",
}: BookingCalendarProps) {
  const [slots, setSlots] = React.useState<AvailableSlot[]>(initialSlots);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = React.useState<AvailableSlot | null>(null);
  const [selectedInterval, setSelectedInterval] = React.useState<TimeSlotOption | null>(null);

  // Form State
  const [guestName, setGuestName] = React.useState("");
  const [guestEmail, setGuestEmail] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Success State
  const [successData, setSuccessData] = React.useState<{
    lessonId: string;
    date: string;
    time: string;
    guestName: string;
    guestEmail: string;
  } | null>(null);

  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

  // Calcola i giorni con disponibilità per il calendario
  const availableDays = React.useMemo(() => getDaysWithAvailableSlots(slots), [slots]);

  // Slot disponibili per il giorno selezionato
  const slotsForSelectedDay = React.useMemo(() => {
    if (!selectedDate) return [];
    return getSlotsForDay(slots, selectedDate);
  }, [slots, selectedDate]);

  // Opzioni di intervallo per lo slot selezionato (gestione Mega-Slot)
  const intervalOptions = React.useMemo(() => {
    if (!selectedSlot) return [];
    return generateSlotIntervals(selectedSlot);
  }, [selectedSlot]);

  // Reset selezione al cambio data
  const handleSelectDate = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setSelectedInterval(null);
  };

  // Selezione slot
  const handleSelectSlot = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    const intervals = generateSlotIntervals(slot);
    if (intervals.length > 0) {
      setSelectedInterval(intervals[0]);
    } else {
      setSelectedInterval(null);
    }
  };

  // Submit della prenotazione
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSlot || !selectedInterval) {
      toast.error("Seleziona una data e un orario per la lezione.");
      return;
    }

    if (!guestName.trim() || guestName.trim().length < 2) {
      toast.error("Il nome deve contenere almeno 2 caratteri.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!guestEmail.trim() || !emailRegex.test(guestEmail.trim())) {
      toast.error("Inserisci un indirizzo email valido.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await bookLesson({
        slotId: selectedSlot.id,
        startTime: selectedInterval.startTime,
        endTime: selectedInterval.endTime,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim().toLowerCase(),
        notes: notes.trim(),
        turnstileToken,
      });

      if (!res.success) {
        toast.error(res.error || "Errore durante la prenotazione.");
        setIsSubmitting(false);
        return;
      }

      // Imposta stato di successo
      const formattedDate = selectedDate
        ? format(selectedDate, "EEEE d MMMM yyyy", { locale: it })
        : "";
      const formattedTime = selectedInterval.label;

      setSuccessData({
        lessonId: res.lessonId!,
        date: formattedDate,
        time: formattedTime,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
      });

      // Rimuovi o aggiorna lo slot locale
      setSlots((prev) => prev.filter((s) => s.id !== selectedSlot.id));
      toast.success("Prenotazione inviata con successo!");
    } catch (err) {
      console.error(err);
      toast.error("Si è verificato un errore inaspettato. Riprova.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setSelectedInterval(null);
    setGuestName("");
    setGuestEmail("");
    setNotes("");
    setTurnstileToken(null);
  };

  // Schermata di Successo
  if (successData) {
    return (
      <div className="w-full max-w-2xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-primary/20 shadow-lg text-center overflow-hidden">
            <div className="bg-primary/10 p-6 flex flex-col items-center justify-center border-b border-primary/20">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-3">
                <CheckCircle2Icon className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-text">Richiesta di Prenotazione Inviata!</h2>
              <p className="text-muted-foreground mt-1 text-sm max-w-md">
                Abbiamo inviato un&apos;email di conferma a <strong>{successData.guestEmail}</strong>.
              </p>
            </div>

            <CardContent className="p-6 text-left space-y-4">
              <div className="bg-muted/40 p-4 rounded-lg space-y-2 text-sm border border-border">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  <span className="font-medium text-text capitalize">{successData.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">{successData.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">{successData.guestName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MailIcon className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">{successData.guestEmail}</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                <p className="font-medium text-text flex items-center gap-2 mb-1">
                  <SparklesIcon className="w-4 h-4 text-primary" />
                  Cosa succede ora?
                </p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Il {professorName} esaminerà la richiesta e ti invierà la conferma definitiva con il link
                  per partecipare alla lezione. Puoi seguire lo stato o richiedere uno spostamento in
                  qualsiasi momento tramite la tua pagina privata.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href={`/gestisci/${successData.lessonId}`} className="flex-1">
                  <Button className="w-full bg-primary text-white hover:bg-primary/90">
                    Gestisci Prenotazione
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  <RefreshCwIcon className="w-4 h-4 mr-2" />
                  Nuova Prenotazione
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const today = startOfToday();

  return (
    <div className="w-full max-w-6xl mx-auto py-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLONNA SINISTRA: Calendario */}
        <div className="lg:col-span-6">
          <Card className="border-border shadow-md overflow-hidden">
            <CardHeader className="pb-4 border-b border-border/60 bg-muted/20">
              <CardTitle className="text-xl font-bold flex items-center gap-2.5 text-text">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Seleziona una data
              </CardTitle>
              <CardDescription className="text-sm">
                I giorni con punto verde hanno almeno uno slot di lezione disponibile.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleSelectDate}
                locale={it}
                disabled={(date) => isBefore(date, today)}
                modifiers={{
                  hasSlots: availableDays,
                }}
                modifiersClassNames={{
                  hasSlots:
                    "font-bold text-primary relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-2 after:h-2 after:bg-primary after:rounded-full",
                }}
                className="w-full max-w-md [--cell-size:2.85rem] text-base"
              />
            </CardContent>
          </Card>
        </div>

        {/* COLONNA DESTRA: Slot orari e Modulo Prenotazione */}
        <div className="lg:col-span-6">
          <AnimatePresence mode="wait">
            {!selectedDate ? (
              <motion.div
                key="no-date"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="border-dashed border-border bg-muted/20 text-center p-8">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-text text-base">Nessuna data selezionata</h3>
                  <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
                    Clicca su un giorno nel calendario a sinistra per visualizzare le fasce orarie
                    disponibili.
                  </p>
                </Card>
              </motion.div>
            ) : slotsForSelectedDay.length === 0 ? (
              <motion.div
                key="no-slots"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="border-border text-center p-8">
                  <h3 className="font-semibold text-text text-base">Nessuna disponibilità</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Non ci sono slot disponibili per{" "}
                    <strong>{format(selectedDate, "d MMMM yyyy", { locale: it })}</strong>. Scegli
                    un altro giorno con il punto verde.
                  </p>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key={selectedDate.toISOString()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* 1. SELEZIONE DELLO SLOT */}
                <Card className="border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-text capitalize">
                        {format(selectedDate, "EEEE d MMMM yyyy", { locale: it })}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {slotsForSelectedDay.length} {slotsForSelectedDay.length === 1 ? "slot" : "slot"}
                      </Badge>
                    </div>
                    <CardDescription>
                      Scegli la fascia oraria di disponibilità che preferisci:
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {slotsForSelectedDay.map((slot) => {
                        const isSelected = selectedSlot?.id === slot.id;
                        const startFormatted = format(new Date(slot.start_time), "HH:mm");
                        const endFormatted = format(new Date(slot.end_time), "HH:mm");

                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => handleSelectSlot(slot)}
                            className={`p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                              isSelected
                                ? "border-primary bg-primary/10 text-text ring-1 ring-primary"
                                : "border-border hover:border-primary/40 bg-card text-text"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <ClockIcon
                                className={`w-4 h-4 ${
                                  isSelected ? "text-primary" : "text-muted-foreground"
                                }`}
                              />
                              <span className="font-semibold text-sm">
                                {startFormatted} - {endFormatted}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">Disponibile</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Partizionamento Mega-Slot */}
                    {selectedSlot && intervalOptions.length > 1 && (
                      <div className="pt-3 border-t border-border space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Durata ed orario della tua lezione (Mega-Slot frazionabile):
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {intervalOptions.map((opt, idx) => {
                            const isOptSelected =
                              selectedInterval?.startTime === opt.startTime &&
                              selectedInterval?.endTime === opt.endTime;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedInterval(opt)}
                                className={`px-3 py-2 rounded-md border text-xs font-medium text-left transition-all ${
                                  isOptSelected
                                    ? "bg-primary text-white border-primary shadow-sm"
                                    : "bg-muted/40 hover:bg-muted border-border text-text"
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 2. FORM DATI GUEST (Nome, Email, Note, Turnstile) */}
                {selectedSlot && selectedInterval && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border-border shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-bold text-text flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-primary" />
                          Dati per la prenotazione
                        </CardTitle>
                        <CardDescription>
                          Prenotazione per: <strong>{selectedInterval.label}</strong> del{" "}
                          <strong>{format(selectedDate, "d MMMM", { locale: it })}</strong>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form noValidate onSubmit={handleSubmitBooking} className="space-y-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="guestName" className="text-sm font-medium">
                              Nome e Cognome <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                              <UserIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                              <Input
                                id="guestName"
                                placeholder="Mario Rossi"
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                className="pl-9"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="guestEmail" className="text-sm font-medium">
                              Indirizzo Email <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                              <MailIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                              <Input
                                id="guestEmail"
                                type="email"
                                placeholder="mario.rossi@email.it"
                                value={guestEmail}
                                onChange={(e) => setGuestEmail(e.target.value)}
                                className="pl-9"
                                required
                              />
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Riceverai qui la conferma e il link privato per gestire la lezione.
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="notes" className="text-sm font-medium">
                              Note o argomenti da trattare (opzionale)
                            </Label>
                            <div className="relative">
                              <FileTextIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                              <Textarea
                                id="notes"
                                placeholder="Es. Preparazione esame Analisi 1, esercizi sulle derivate..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="pl-9 min-h-[80px]"
                                maxLength={500}
                              />
                            </div>
                          </div>

                          {/* Turnstile Anti-Spam */}
                          <div className="py-2 flex justify-center">
                            <Turnstile
                              siteKey={turnstileSiteKey}
                              onSuccess={(token) => setTurnstileToken(token)}
                              onError={() => setTurnstileToken(null)}
                              onExpire={() => setTurnstileToken(null)}
                              options={{
                                theme: "auto",
                                size: "flexible",
                              }}
                            />
                          </div>

                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-primary text-white hover:bg-primary/90 h-11 text-base font-semibold"
                          >
                            {isSubmitting ? (
                              <span className="flex items-center gap-2">
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                Registrazione in corso...
                              </span>
                            ) : (
                              "Invia Richiesta di Prenotazione"
                            )}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
