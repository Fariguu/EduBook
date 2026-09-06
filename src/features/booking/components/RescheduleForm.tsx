"use client";

import * as React from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon, XIcon } from "lucide-react";
import { requestReschedule } from "../actions/manage.actions";

interface RescheduleFormProps {
  lessonId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function RescheduleForm({ lessonId, onSuccess, onCancel }: RescheduleFormProps) {
  const [notes, setNotes] = React.useState("");
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (notes.trim().length < 5) {
      toast.error("Inserisci almeno 5 caratteri per descrivere la tua richiesta.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await requestReschedule({
        lessonId,
        rescheduleNotes: notes.trim(),
        turnstileToken,
      });

      if (!res.success) {
        toast.error(res.error || "Impossibile inviare la richiesta.");
        setIsSubmitting(false);
        return;
      }

      toast.success("Richiesta di spostamento inviata con successo!");
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Si è verificato un errore di rete. Riprova.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label htmlFor="rescheduleNotes" className="text-sm font-semibold text-foreground">
          Motivazione o orari alternativi preferiti <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="rescheduleNotes"
          placeholder="Es. Vorrei spostare la lezione a venerdì prossimo dalle 16:00, o in alternativa lunedì mattina..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[100px] text-sm"
          maxLength={500}
          required
        />
        <p className="text-[11px] text-muted-foreground">
          Il professore riceverà la tua richiesta e concorderà un nuovo orario via email.
        </p>
      </div>

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

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-xs sm:text-sm"
        >
          <XIcon className="w-4 h-4 mr-1.5" />
          Annulla
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-white hover:bg-primary/90 text-xs sm:text-sm"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-1.5">
              <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
              Invio in corso...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <SendIcon className="w-3.5 h-3.5" />
              Invia Richiesta
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
