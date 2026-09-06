import * as React from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2Icon } from "lucide-react";

interface DialogActionFooterProps {
  readonly onCancel: () => void;
  readonly isSubmitting: boolean;
  readonly submitLabel: string;
  readonly submittingLabel?: string;
  readonly submitVariant?: "default" | "destructive";
}

export function DialogActionFooter({
  onCancel,
  isSubmitting,
  submitLabel,
  submittingLabel = "Salvataggio...",
  submitVariant = "default",
}: DialogActionFooterProps) {
  return (
    <DialogFooter className="gap-2 sm:gap-0">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Annulla
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
        variant={submitVariant}
        className={
          submitVariant === "default"
            ? "bg-primary text-white hover:bg-primary/90"
            : undefined
        }
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Loader2Icon className="w-4 h-4 animate-spin" />
            <span>{submittingLabel}</span>
          </span>
        ) : (
          submitLabel
        )}
      </Button>
    </DialogFooter>
  );
}
