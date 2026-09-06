export interface HeroCardItem {
  label: string;
  value: string;
}

export interface HeroCardData {
  items: HeroCardItem[];
  footnote?: string | null;
}

export const DEFAULT_HERO_CARD: HeroCardData = {
  items: [
    { label: "Lezioni disponibili", value: "Online & In Presenza" },
    { label: "Prenotazione", value: "Diretta & Istantanea" },
    { label: "Flessibilità", value: "Slot Personalizzabili" },
  ],
  footnote: "Nessun account studente richiesto — prenotazione diretta in 2 minuti.",
};
