"use client";

import * as React from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckIcon, CalendarIcon, ClockIcon, MailIcon } from "lucide-react";
import { confirmLesson } from "../actions/dashboard.actions";
import { DialogActionFooter } from "./DialogActionFooter";

interface ConfirmLessonDialogProps {
  lessonId: string;
  guestName?: string | null;
  guestEmail?: string | null;
  startTime: string;
  endTime: string;
  trigger?: React.ReactNode;
}

export function ConfirmLessonDialog({
  lessonId,
  guestName,
  guestEmail,
  startTime,
  endTime,
  trigger,
}: ConfirmLessonDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const start = new Date(startTime);
  const end = new Date(endTime);
  const displayName = guestName || "lo studente";

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await confirmLesson(lessonId);

      if (!res.success) {
        toast.error(res.error || "Impossibile confermare la lezione.");
        setIsSubmitting(false);
        return;
      }

      toast.success("Lezione confermata con successo");
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Si è verificato un errore inatteso.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <span onClick={() => setOpen(true)} className="inline-block cursor-pointer">
        {trigger || (
          <Button
            type="button"
            size="sm"
            className="bg-primary text-white hover:bg-primary/90 text-xs font-semibold px-4 h-9 shadow-sm"
          >
            <CheckIcon className="w-4 h-4 mr-1.5" />
            Conferma
          </Button>
        )}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleConfirm}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary">
              <CheckIcon className="w-5 h-5" />
              <DialogTitle>Conferma Lezione</DialogTitle>
            </div>
            <DialogDescription className="text-xs pt-1">
              Sei sicuro di voler confermare la lezione con <strong>{displayName}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-xs space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
                <span className="capitalize">{format(start, "EEEE d MMMM yyyy", { locale: it })}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ClockIcon className="w-4 h-4 text-primary shrink-0" />
                <span>
                  {format(start, "HH:mm")} - {format(end, "HH:mm")}
                </span>
              </div>
              {guestEmail && (
                <div className="flex items-center gap-2 text-muted-foreground pt-1 border-t border-border/60">
                  <MailIcon className="w-4 h-4 text-primary shrink-0" />
                  <span>{guestEmail}</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground">
              Confermando la lezione, lo studente riceverà una notifica via email con il link per gestire
              la prenotazione e sincronizzare il proprio calendario Google.
            </p>
          </div>

          <DialogActionFooter
            onCancel={() => setOpen(false)}
            isSubmitting={isSubmitting}
            submitLabel="Sì, Conferma"
            submittingLabel="Conferma in corso..."
          />
        </form>
      </DialogContent>
    </Dialog>
  </>
  );
}
