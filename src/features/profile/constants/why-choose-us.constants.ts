export interface WhyChooseUsPillar {
  icon: string;
  title: string;
  description: string;
}

export interface WhyChooseUsData {
  title: string;
  subtitle?: string | null;
  pillars: WhyChooseUsPillar[];
}

export const DEFAULT_WHY_CHOOSE_US: WhyChooseUsData = {
  title: "Perché Scegliere Questo Percorso",
  subtitle: "Un approccio didattico focalizzato sull'autonomia dello studente e sui risultati concreti.",
  pillars: [
    {
      icon: "Target",
      title: "Metodo Strutturato",
      description:
        "Ogni lezione parte dai dubbi dello studente per costruire una comprensione solida delle basi teoriche e pratiche.",
    },
    {
      icon: "Laptop",
      title: "Flessibilità Oraria",
      description:
        "Possibilità di scegliere tra lezioni online su piattaforma con lavagna condivisa o in presenza.",
    },
    {
      icon: "Award",
      title: "Esperienza Qualificata",
      description:
        "Anni di docenza ed affiancamento a studenti di licei, istituti tecnici e facoltà scientifiche ed ingegneristiche.",
    },
    {
      icon: "Clock",
      title: "Prenotazione Istantanea",
      description:
        "Consulta il calendario aggiornato in tempo reale e prenota lo slot di tuo interesse senza attese.",
    },
  ],
};

export const AVAILABLE_PILLAR_ICONS = [
  { value: "Target", label: "Bersaglio / Metodo" },
  { value: "Laptop", label: "Computer / Flessibilità" },
  { value: "Award", label: "Premio / Esperienza" },
  { value: "Clock", label: "Orologio / Disponibilità" },
  { value: "BookOpen", label: "Libro / Studio" },
  { value: "GraduationCap", label: "Laurea / Formazione" },
  { value: "CheckCircle2", label: "Spunta / Obiettivi" },
  { value: "Sparkles", label: "Scintille / Eccellenza" },
  { value: "Brain", label: "Cervello / Logica" },
  { value: "Lightbulb", label: "Lampadina / Idee" },
] as const;
