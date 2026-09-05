"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusIcon, CalendarIcon, Loader2Icon } from "lucide-react";
import { addDays, format } from "date-fns";
import { createSlot } from "../actions/dashboard.actions";

export function CreateSlotDialog() {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Valori iniziali predefiniti
  const tomorrow = addDays(new Date(), 1);
  const [date, setDate] = React.useState(format(tomorrow, "yyyy-MM-dd"));
  const [startTime, setStartTime] = React.useState("14:00");
  const [endTime, setEndTime] = React.useState("15:00");
  const [isRecurring, setIsRecurring] = React.useState(false);
  const [recurrenceEndDate, setRecurrenceEndDate] = React.useState(
    format(addDays(tomorrow, 28), "yyyy-MM-dd")
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !startTime || !endTime) {
      toast.error("Compila tutti i campi della data e dell'orario.");
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    if (endDateTime.getTime() <= startDateTime.getTime()) {
      toast.error("L'orario di fine deve essere successivo all'orario di inizio.");
      return;
    }

    if (isRecurring && !recurrenceEndDate) {
      toast.error("Indica una data di fine per la ricorrenza settimanale.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createSlot({
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        isRecurring,
        recurrenceEndDate: isRecurring
          ? new Date(`${recurrenceEndDate}T23:59:59`).toISOString()
          : null,
      });

      if (!res.success) {
        toast.error(res.error || "Impossibile creare lo slot.");
        setIsSubmitting(false);
        return;
      }

      const countMsg = res.count && res.count > 1
        ? `${res.count} slot ricorrenti creati con successo!`
        : "Slot di disponibilità creato con successo!";

      toast.success(countMsg);
      setOpen(false);
      setIsRecurring(false);
    } catch (err) {
      console.error(err);
      toast.error("Si è verificato un errore durante la creazione.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-primary text-white hover:bg-primary/90 text-xs sm:text-sm"
      >
        <PlusIcon className="w-4 h-4 mr-1.5" />
        Aggiungi Disponibilità
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-text font-bold text-lg">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Nuovo Slot di Disponibilità
            </DialogTitle>
            <DialogDescription>
              Inserisci la fascia oraria in cui sei disponibile per ripetizioni o lezioni private.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="slotDate" className="text-xs font-semibold">
                Giorno della lezione <span className="text-destructive">*</span>
              </Label>
              <Input
                id="slotDate"
                type="date"
                value={date}
                min={format(new Date(), "yyyy-MM-dd")}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="startTime" className="text-xs font-semibold">
                  Ora Inizio <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="endTime" className="text-xs font-semibold">
                  Ora Fine <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              💡 Se imposti una durata superiore a 1 ora (es. 14:00 - 18:00), il sistema lo tratterà come
              Mega-Slot frazionabile dagli studenti.
            </p>

            {/* Checkbox Ricorrenza Settimanale */}
            <div className="pt-2 border-t border-border space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isRecurring"
                  checked={isRecurring}
                  onCheckedChange={(c) => setIsRecurring(Boolean(c))}
                />
                <Label htmlFor="isRecurring" className="text-xs font-semibold cursor-pointer">
                  Ripeti settimanalmente (ogni 7 giorni allo stesso orario)
                </Label>
              </div>

              {isRecurring && (
                <div className="pl-6 space-y-1.5">
                  <Label htmlFor="recurrenceEnd" className="text-xs text-muted-foreground">
                    Fino al giorno:
                  </Label>
                  <Input
                    id="recurrenceEnd"
                    type="date"
                    value={recurrenceEndDate}
                    min={date}
                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    required={isRecurring}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                  Salvataggio...
                </span>
              ) : (
                "Crea Disponibilità"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
