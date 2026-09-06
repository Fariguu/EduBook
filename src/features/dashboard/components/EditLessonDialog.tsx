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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClockIcon, PencilIcon } from "lucide-react";
import { format } from "date-fns";
import type { DashboardLesson } from "../types/dashboard.types";
import { updateLessonTime } from "../actions/dashboard.actions";
import { DialogActionFooter } from "./DialogActionFooter";

interface EditLessonDialogProps {
  lesson: DashboardLesson;
  trigger?: React.ReactNode;
}

export function EditLessonDialog({ lesson, trigger }: EditLessonDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const startObj = new Date(lesson.start_time);
  const endObj = new Date(lesson.end_time);

  const [date, setDate] = React.useState(format(startObj, "yyyy-MM-dd"));
  const [startTime, setStartTime] = React.useState(format(startObj, "HH:mm"));
  const [endTime, setEndTime] = React.useState(format(endObj, "HH:mm"));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newStart = new Date(`${date}T${startTime}`);
    const newEnd = new Date(`${date}T${endTime}`);

    if (newEnd.getTime() <= newStart.getTime()) {
      toast.error("L'orario di fine deve essere successivo all'orario di inizio.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await updateLessonTime({
        lessonId: lesson.id,
        newStartTime: newStart.toISOString(),
        newEndTime: newEnd.toISOString(),
      });

      if (!res.success) {
        toast.error(res.error || "Impossibile aggiornare l'orario.");
        setIsSubmitting(false);
        return;
      }

      toast.success("Orario lezione aggiornato e notificato allo studente!");
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
          <Button type="button" variant="outline" size="sm" className="text-xs">
            <PencilIcon className="w-3.5 h-3.5 mr-1" />
            Modifica Orario
          </Button>
        )}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-bold text-lg">
              <ClockIcon className="w-5 h-5 text-primary" />
              Modifica Data e Orario Lezione
            </DialogTitle>
            <DialogDescription>
              Studente: <strong>{lesson.guest_name || "Ospite"}</strong> ({lesson.guest_email || "Nessuna email"}).
              Lo studente riceverà un&apos;email automatica con il nuovo orario.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="editDate" className="text-xs font-semibold">
                Giorno della lezione <span className="text-destructive">*</span>
              </Label>
              <Input
                id="editDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="editStartTime" className="text-xs font-semibold">
                  Ora Inizio <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="editStartTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editEndTime" className="text-xs font-semibold">
                  Ora Fine <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="editEndTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <DialogActionFooter
            onCancel={() => setOpen(false)}
            isSubmitting={isSubmitting}
            submitLabel="Salva Modifiche"
          />
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
