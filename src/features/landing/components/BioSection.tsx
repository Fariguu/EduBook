import { Award, Target, Clock, Laptop } from "lucide-react";

export function BioSection() {
  const pillars = [
    {
      icon: Target,
      title: "Metodo Strutturato",
      description:
        "Ogni lezione parte dai dubbi dello studente per costruire una comprensione solida delle basi teoriche e pratiche.",
    },
    {
      icon: Laptop,
      title: "Flessibilità Oraria",
      description:
        "Possibilità di scegliere tra lezioni online su piattaforma con lavagna condivisa o in presenza.",
    },
    {
      icon: Award,
      title: "Esperienza Qualificata",
      description:
        "Anni di docenza ed affiancamento a studenti di licei, istituti tecnici e facoltà scientifiche ed ingegneristiche.",
    },
    {
      icon: Clock,
      title: "Prenotazione Istantanea",
      description:
        "Consulta il calendario aggiornato in tempo reale e prenota lo slot di tuo interesse senza attese.",
    },
  ];

  return (
    <section className="py-20 bg-background transition-colors">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Perché Scegliere Questo Percorso
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Un approccio didattico focalizzato sull&apos;autonomia dello studente e sui risultati concreti.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;

            return (
              <div
                key={i}
                className="p-6 rounded-2xl border border-border/60 bg-muted/20 hover:border-primary/40 transition-all flex flex-col items-start space-y-4"
              >
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
