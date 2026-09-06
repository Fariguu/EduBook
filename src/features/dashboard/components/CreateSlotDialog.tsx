"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PlusIcon, CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { createSlot } from "../actions/dashboard.actions";
import { DialogActionFooter } from "./DialogActionFooter";
import { DateTimeFields, validateLessonTimes } from "./DateTimeFields";

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

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const validation = validateLessonTimes(date, startTime, endTime);
    if (!validation.isValid || !validation.startDate || !validation.endDate) {
      toast.error(validation.error || "Orari non validi.");
      return;
    }

    if (isRecurring && !recurrenceEndDate) {
      toast.error("Indica una data di fine per la ricorrenza settimanale.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createSlot({
        startTime: validation.startDate.toISOString(),
        endTime: validation.endDate.toISOString(),
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
    } catch {
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
            <DialogTitle className="flex items-center gap-2 text-foreground font-bold text-lg">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Nuovo Slot di Disponibilità
            </DialogTitle>
            <DialogDescription>
              Inserisci la fascia oraria in cui sei disponibile per ripetizioni o lezioni private.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <DateTimeFields
              date={date}
              onDateChange={setDate}
              startTime={startTime}
              onStartTimeChange={setStartTime}
              endTime={endTime}
              onEndTimeChange={setEndTime}
              minDate={format(new Date(), "yyyy-MM-dd")}
              idPrefix="slot"
            />

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

          <DialogActionFooter
            onCancel={() => setOpen(false)}
            isSubmitting={isSubmitting}
            submitLabel="Crea Disponibilità"
          />
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
