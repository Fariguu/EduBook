import { differenceInMinutes, addMinutes, format, isSameDay, startOfDay } from "date-fns";
import type { AvailableSlot, TimeSlotOption } from "../types/booking.types";

/**
 * Restituisce l'elenco delle date univoche che hanno almeno uno slot disponibile.
 */
export function getDaysWithAvailableSlots(slots: AvailableSlot[]): Date[] {
  const dayMap = new Map<string, Date>();

  for (const slot of slots) {
    const slotDate = new Date(slot.start_time);
    const dayKey = format(slotDate, "yyyy-MM-dd");
    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, startOfDay(slotDate));
    }
  }

  return Array.from(dayMap.values());
}

/**
 * Filtra gli slot disponibili per una determinata giornata.
 */
export function getSlotsForDay(slots: AvailableSlot[], selectedDate: Date): AvailableSlot[] {
  return slots.filter((slot) => isSameDay(new Date(slot.start_time), selectedDate));
}

/**
 * Partiziona un Mega-Slot in intervalli selezionabili (es. 1h, 2h o intero slot).
 */
export function generateSlotIntervals(slot: AvailableSlot): TimeSlotOption[] {
  const start = new Date(slot.start_time);
  const end = new Date(slot.end_time);
  start.setSeconds(0, 0);
  end.setSeconds(0, 0);

  const totalMinutes = differenceInMinutes(end, start);
  if (isNaN(totalMinutes) || totalMinutes <= 0) {
    return [];
  }

  // Se lo slot dura 60 minuti o meno, l'unica opzione è lo slot stesso
  if (totalMinutes <= 60) {
    return [
      {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        durationMinutes: totalMinutes,
        label: `${format(start, "HH:mm")} - ${format(end, "HH:mm")} (${totalMinutes} min)`,
      },
    ];
  }

  const options: TimeSlotOption[] = [];

  // 1. Intervalli da 1 ora (60 min)
  let currentStart = start;
  while (differenceInMinutes(end, currentStart) >= 60) {
    const currentEnd = addMinutes(currentStart, 60);
    options.push({
      startTime: currentStart.toISOString(),
      endTime: currentEnd.toISOString(),
      durationMinutes: 60,
      label: `${format(currentStart, "HH:mm")} - ${format(currentEnd, "HH:mm")} (1 ora)`,
    });
    currentStart = addMinutes(currentStart, 60);
  }

  // 2. Intervalli da 1 ora e mezza (90 min) se lo slot lo permette
  if (totalMinutes >= 90) {
    let cur = start;
    while (differenceInMinutes(end, cur) >= 90) {
      const curEnd = addMinutes(cur, 90);
      options.push({
        startTime: cur.toISOString(),
        endTime: curEnd.toISOString(),
        durationMinutes: 90,
        label: `${format(cur, "HH:mm")} - ${format(curEnd, "HH:mm")} (1.5 ore)`,
      });
      cur = addMinutes(cur, 60); // step di 1 ora
    }
  }

  // 3. Intervalli da 2 ore (120 min) se lo slot lo permette
  if (totalMinutes >= 120) {
    let cur2 = start;
    while (differenceInMinutes(end, cur2) >= 120) {
      const curEnd2 = addMinutes(cur2, 120);
      options.push({
        startTime: cur2.toISOString(),
        endTime: curEnd2.toISOString(),
        durationMinutes: 120,
        label: `${format(cur2, "HH:mm")} - ${format(curEnd2, "HH:mm")} (2 ore)`,
      });
      cur2 = addMinutes(cur2, 60);
    }
  }

  // 4. Intero Mega-Slot (se diverso dalle opzioni già aggiunte)
  const isAlreadyFullOption = options.some(
    (opt) => opt.startTime === start.toISOString() && opt.endTime === end.toISOString()
  );

  if (!isAlreadyFullOption) {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const durationStr = mins > 0 ? `${hours}h ${mins}m` : `${hours} ore`;
    options.push({
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationMinutes: totalMinutes,
      label: `${format(start, "HH:mm")} - ${format(end, "HH:mm")} (Tutto lo slot: ${durationStr})`,
    });
  }

  return options;
}
