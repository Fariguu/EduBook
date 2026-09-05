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
import { Label } from "@/components/ui/label";
import { AlertCircleIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { cancelLessonWithChoice } from "../actions/dashboard.actions";

interface CancelLessonDialogProps {
  lessonId: string;
  guestName?: string | null;
  trigger?: React.ReactNode;
}

export function CancelLessonDialog({ lessonId, guestName, trigger }: CancelLessonDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [keepAvailable, setKeepAvailable] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await cancelLessonWithChoice({
        lessonId,
        keepAvailable,
      });

      if (!res.success) {
        toast.error(res.error || "Impossibile annullare la lezione.");
        setIsSubmitting(false);
        return;
      }

      toast.success(
        keepAvailable
          ? "Lezione annullata. Lo slot è tornato disponibile."
          : "Lezione e slot eliminati definitivamente."
      );
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Si è verificato un errore inaspettato.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <span onClick={() => setOpen(true)} className="inline-block cursor-pointer">
        {trigger || (
          <Button type="button" variant="outline" size="sm" className="text-xs text-destructive hover:bg-destructive/10">
            <Trash2Icon className="w-3.5 h-3.5 mr-1" />
            Annulla Lezione
          </Button>
        )}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive font-bold text-lg">
              <AlertCircleIcon className="w-5 h-5 text-destructive" />
              Annulla Lezione Programmata
            </DialogTitle>
            <DialogDescription>
              Stai per annullare la lezione confermata con <strong>{guestName || "lo Studente"}</strong>.
              Lo studente riceverà un&apos;email di notifica dell&apos;annullamento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <Label className="text-xs font-semibold block text-text">
              Cosa desideri fare con questo slot orario?
            </Label>

            <div className="space-y-2">
              <label
                className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                  keepAvailable
                    ? "border-primary bg-primary/10 text-text ring-1 ring-primary"
                    : "border-border hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="keepChoice"
                  checked={keepAvailable}
                  onChange={() => setKeepAvailable(true)}
                  className="mt-0.5"
                />
                <div>
                  <strong className="block text-text font-semibold">
                    Mantieni lo slot come disponibile
                  </strong>
                  <span>Lo slot rimarrà visibile nel calendario pubblico per altri studenti.</span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                  !keepAvailable
                    ? "border-destructive bg-destructive/10 text-text ring-1 ring-destructive"
                    : "border-border hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="keepChoice"
                  checked={!keepAvailable}
                  onChange={() => setKeepAvailable(false)}
                  className="mt-0.5"
                />
                <div>
                  <strong className="block text-destructive font-semibold">
                    Elimina definitivamente lo slot
                  </strong>
                  <span>Rimuove completamente la fascia oraria dal calendario.</span>
                </div>
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Indietro
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                  Operazione in corso...
                </span>
              ) : (
                "Conferma Annullamento"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
