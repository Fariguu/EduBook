import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";
import { subDays } from "date-fns";

export const dynamic = "force-dynamic";

/**
 * Route handler per il cron job di cleanup (eseguito ogni giorno alle 02:00 UTC).
 * Rimuove lezioni completate o passate più vecchie di 365 giorni.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  // Se CRON_SECRET è configurato in produzione, verifica l'header Authorization
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: "Non autorizzato" },
        { status: 401 }
      );
    }
  }

  try {
    const adminClient = createAdminClient();
    const cutoffDate = subDays(new Date(), 365).toISOString();

    // Elimina lezioni demo con end_time antecedente a 365 giorni fa
    const { data, error } = await adminClient
      .from("lessons_demo")
      .delete()
      .lt("end_time", cutoffDate)
      .select("id");

    if (error) {
      console.error("[Cron Cleanup] Errore eliminazione lezioni scadute:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const deletedCount = data ? data.length : 0;
    console.info(`[Cron Cleanup] Eseguito con successo. Lezioni eliminate: ${deletedCount}`);

    return NextResponse.json({
      success: true,
      deletedCount,
      cutoffDate,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron Cleanup] Errore inatteso:", error);
    return NextResponse.json(
      { success: false, error: "Errore interno durante il cleanup" },
      { status: 500 }
    );
  }
}
