import { Calculator, Atom, Sigma, Binary, Compass, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SubjectBadgesProps {
  subjects?: string[];
  subjectDetails?: Record<string, string>;
}

export function SubjectBadges({
  subjects = ["Matematica", "Fisica", "Analisi 1", "Geometria", "Informatica"],
  subjectDetails = {},
}: SubjectBadgesProps) {
  const subjectIcons: Record<string, typeof Calculator> = {
    Matematica: Calculator,
    Fisica: Atom,
    "Analisi 1": Sigma,
    "Analisi 2": Sigma,
    Geometria: Compass,
    Informatica: Binary,
  };

  return (
    <section className="py-16 bg-muted/20 border-y border-border/40 transition-colors">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Materie e Ambiti di Insegnamento
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Percorsi di recupero, preparazione esami universitari, test d&apos;ingresso e approfondimento.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {subjects.map((subject) => {
            const Icon = subjectIcons[subject] || CheckCircle;
            const description =
              subjectDetails[subject] ||
              "Supporto completo su teoria, esercizi svolti, simulazioni di verifica ed esami.";

            return (
              <Card
                key={subject}
                className="border-border/60 bg-background/80 hover:border-primary/40 hover:shadow-md transition-all group"
              >
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {subject}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
