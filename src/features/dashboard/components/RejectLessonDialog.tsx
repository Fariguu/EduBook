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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangleIcon, XCircleIcon } from "lucide-react";
import { rejectLesson } from "../actions/dashboard.actions";
import { DialogActionFooter } from "./DialogActionFooter";

interface RejectLessonDialogProps {
  readonly lessonId: string;
  readonly guestName?: string | null;
  readonly guestEmail?: string | null;
  readonly trigger?: React.ReactNode;
}

export function RejectLessonDialog({
  lessonId,
  guestName,
  guestEmail,
  trigger,
}: Readonly<RejectLessonDialogProps>) {
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await rejectLesson({
        lessonId,
        reason: reason.trim() || undefined,
      });

      if (!res.success) {
        toast.error(res.error || "Impossibile rifiutare la prenotazione.");
        setIsSubmitting(false);
        return;
      }

      toast.success("Prenotazione rifiutata. Lo slot è tornato disponibile.");
      setOpen(false);
      setReason("");
    } catch (err) {
      console.error(err);
      toast.error("Si è verificato un errore inatteso.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {trigger ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-block cursor-pointer bg-transparent border-none p-0 text-left font-normal"
        >
          {trigger}
        </button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="text-xs text-destructive hover:bg-destructive/10"
        >
          <XCircleIcon className="w-3.5 h-3.5 mr-1" />
          Rifiuta
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive font-bold text-lg">
              <AlertTriangleIcon className="w-5 h-5 text-destructive" />
              Rifiuta Richiesta di Prenotazione
            </DialogTitle>
            <DialogDescription>
              Stai per rifiutare la richiesta di <strong>{guestName || "Studente"}</strong>{" "}
              {guestEmail && `(${guestEmail})`}. Lo slot tornerà immediatamente disponibile per altri studenti.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="rejectReason" className="text-xs font-semibold">
                Motivazione per lo studente (opzionale)
              </Label>
              <Textarea
                id="rejectReason"
                placeholder="Es. Purtroppo ho un impegno imprevisto a quell'orario. Ti invito a verificare il calendario per un'altra data..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[90px] text-xs"
                maxLength={500}
              />
              <p className="text-[11px] text-muted-foreground">
                Se indicata, la motivazione verrà inclusa nell&apos;email di notifica inviata allo studente.
              </p>
            </div>
          </div>

          <DialogActionFooter
            onCancel={() => setOpen(false)}
            isSubmitting={isSubmitting}
            submitLabel="Conferma Rifiuto"
            submittingLabel="Rifiuto in corso..."
            submitVariant="destructive"
          />
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
