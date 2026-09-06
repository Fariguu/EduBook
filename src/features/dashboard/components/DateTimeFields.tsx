"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateTimeFieldsProps {
  readonly date: string;
  readonly onDateChange: (value: string) => void;
  readonly startTime: string;
  readonly onStartTimeChange: (value: string) => void;
  readonly endTime: string;
  readonly onEndTimeChange: (value: string) => void;
  readonly minDate?: string;
  readonly idPrefix?: string;
}

export function DateTimeFields({
  date,
  onDateChange,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  minDate,
  idPrefix = "dt",
}: Readonly<DateTimeFieldsProps>) {
  const dateId = `${idPrefix}-date`;
  const startId = `${idPrefix}-start`;
  const endId = `${idPrefix}-end`;

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor={dateId} className="text-xs font-semibold">
          Giorno della lezione <span className="text-destructive">*</span>
        </Label>
        <Input
          id={dateId}
          type="date"
          value={date}
          min={minDate}
          onChange={(e) => onDateChange(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={startId} className="text-xs font-semibold">
            Ora Inizio <span className="text-destructive">*</span>
          </Label>
          <Input
            id={startId}
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={endId} className="text-xs font-semibold">
            Ora Fine <span className="text-destructive">*</span>
          </Label>
          <Input
            id={endId}
            type="time"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            required
          />
        </div>
      </div>
    </>
  );
}

export function validateLessonTimes(date: string, startTime: string, endTime: string): {
  readonly isValid: boolean;
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly error?: string;
} {
  if (!date || !startTime || !endTime) {
    return { isValid: false, error: "Compila tutti i campi della data e dell'orario." };
  }

  const startDate = new Date(`${date}T${startTime}`);
  const endDate = new Date(`${date}T${endTime}`);

  if (endDate.getTime() <= startDate.getTime()) {
    return {
      isValid: false,
      error: "L'orario di fine deve essere successivo all'orario di inizio.",
    };
  }

  return { isValid: true, startDate, endDate };
}

