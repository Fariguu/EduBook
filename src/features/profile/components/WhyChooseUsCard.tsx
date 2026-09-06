"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  SparklesIcon,
  PlusIcon,
  Trash2Icon,
  RotateCcwIcon,
  SaveIcon,
  Loader2Icon,
  Award,
  Target,
  Clock,
  Laptop,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Sparkles,
  Brain,
  Lightbulb,
} from "lucide-react";
import {
  DEFAULT_WHY_CHOOSE_US,
  AVAILABLE_PILLAR_ICONS,
  type WhyChooseUsData,
  type WhyChooseUsPillar,
} from "../constants/why-choose-us.constants";
import { updateWhyChooseUs, resetWhyChooseUs } from "../actions/profile.actions";

const ICON_PREVIEWS: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  Laptop,
  Award,
  Clock,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Sparkles,
  Brain,
  Lightbulb,
};

interface WhyChooseUsCardProps {
  readonly initialData?: WhyChooseUsData | null;
}

export function WhyChooseUsCard({ initialData }: WhyChooseUsCardProps) {
  const data = initialData && initialData.pillars?.length > 0 ? initialData : DEFAULT_WHY_CHOOSE_US;

  const [title, setTitle] = React.useState(data.title || DEFAULT_WHY_CHOOSE_US.title);
  const [subtitle, setSubtitle] = React.useState(data.subtitle ?? DEFAULT_WHY_CHOOSE_US.subtitle ?? "");
  const [pillars, setPillars] = React.useState<WhyChooseUsPillar[]>(data.pillars);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);

  const handleAddPillar = () => {
    if (pillars.length >= 6) {
      toast.error("Puoi aggiungere al massimo 6 punti di forza.");
      return;
    }
    setPillars((prev) => [
      ...prev,
      {
        icon: "Target",
        title: "Nuovo Punto di Forza",
        description: "Descrivi il punto di forza e l'approccio didattico.",
      },
    ]);
  };

  const handleRemovePillar = (index: number) => {
    if (pillars.length <= 1) {
      toast.error("Deve essere presente almeno un punto di forza.");
      return;
    }
    setPillars((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePillarChange = (
    index: number,
    field: keyof WhyChooseUsPillar,
    value: string
  ) => {
    setPillars((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Il titolo della sezione è obbligatorio.");
      return;
    }

    for (let i = 0; i < pillars.length; i++) {
      if (!pillars[i].title.trim()) {
        toast.error(`Il titolo della scheda #${i + 1} non può essere vuoto.`);
        return;
      }
      if (!pillars[i].description.trim()) {
        toast.error(`La descrizione della scheda #${i + 1} non può essere vuota.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await updateWhyChooseUs({
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        pillars,
      });

      if (!res.success) {
        toast.error(res.error || "Impossibile aggiornare la sezione.");
        return;
      }

      toast.success("Sezione aggiornata con successo! I cambiamenti sono visibili sul sito.");
    } catch (err) {
      console.error(err);
      toast.error("Si è verificato un errore inaspettato.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const res = await resetWhyChooseUs();
      if (!res.success) {
        toast.error(res.error || "Impossibile ripristinare i valori.");
        return;
      }

      setTitle(DEFAULT_WHY_CHOOSE_US.title);
      setSubtitle(DEFAULT_WHY_CHOOSE_US.subtitle ?? "");
      setPillars(DEFAULT_WHY_CHOOSE_US.pillars);
      toast.success("Sezione ripristinata ai valori predefiniti!");
    } catch (err) {
      console.error(err);
      toast.error("Si è verificato un errore durante il ripristino.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card className="border-border shadow-sm bg-card">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
            <SparklesIcon className="w-5 h-5 text-primary" />
            <span>Gestione Percorso</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-1">
            Personalizza i testi e le schede del percorso formativo mostrati nella landing page pubblica.
          </CardDescription>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={isResetting || isSubmitting}
          className="text-xs h-8 border-border text-muted-foreground hover:text-foreground shrink-0"
        >
          {isResetting ? (
            <Loader2Icon className="w-3.5 h-3.5 animate-spin mr-1.5" />
          ) : (
            <RotateCcwIcon className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
          )}
          Ripristina Predefiniti
        </Button>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Intestazione Sezione (Titolo e Sottotitolo) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/20 border border-border/70">
            <div className="space-y-1.5">
              <Label htmlFor="section-title" className="text-xs font-semibold text-foreground">
                Titolo Sezione <span className="text-destructive">*</span>
              </Label>
              <Input
                id="section-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                placeholder="es. Perché Scegliere Questo Percorso"
                className="text-sm bg-background"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="section-subtitle" className="text-xs font-semibold text-foreground">
                Sottotitolo Sezione
              </Label>
              <Input
                id="section-subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                maxLength={250}
                placeholder="es. Un approccio didattico focalizzato sui risultati..."
                className="text-sm bg-background"
              />
            </div>
          </div>

          {/* Lista Schede / Punti di Forza */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Schede Punti di Forza ({pillars.length} di 6)
              </span>

              {pillars.length < 6 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPillar}
                  className="text-xs h-7 px-2.5 text-primary border-primary/30 hover:bg-primary/10"
                >
                  <PlusIcon className="w-3.5 h-3.5 mr-1" />
                  Aggiungi Scheda
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pillars.map((pillar, idx) => {
                const IconComponent = ICON_PREVIEWS[pillar.icon] || Target;

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-border/80 bg-card shadow-xs space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-foreground">
                          Scheda #{idx + 1}
                        </span>
                      </div>

                      {pillars.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePillar(idx)}
                          className="w-7 h-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                          title="Rimuovi scheda"
                          aria-label={`Rimuovi scheda ${idx + 1}`}
                        >
                          <Trash2Icon className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>

                    {/* Selezione Icona & Titolo */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="space-y-1">
                        <Label
                          htmlFor={`pillar-icon-${idx}`}
                          className="text-[11px] font-semibold text-muted-foreground"
                        >
                          Icona
                        </Label>
                        <select
                          id={`pillar-icon-${idx}`}
                          value={pillar.icon}
                          onChange={(e) => handlePillarChange(idx, "icon", e.target.value)}
                          className="w-full text-xs h-9 rounded-md border border-input bg-background px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {AVAILABLE_PILLAR_ICONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <Label
                          htmlFor={`pillar-title-${idx}`}
                          className="text-[11px] font-semibold text-muted-foreground"
                        >
                          Titolo Scheda <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`pillar-title-${idx}`}
                          value={pillar.title}
                          onChange={(e) => handlePillarChange(idx, "title", e.target.value)}
                          maxLength={80}
                          placeholder="es. Metodo Strutturato"
                          className="text-xs h-9 bg-background"
                          required
                        />
                      </div>
                    </div>

                    {/* Descrizione */}
                    <div className="space-y-1">
                      <Label
                        htmlFor={`pillar-desc-${idx}`}
                        className="text-[11px] font-semibold text-muted-foreground"
                      >
                        Descrizione <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id={`pillar-desc-${idx}`}
                        value={pillar.description}
                        onChange={(e) => handlePillarChange(idx, "description", e.target.value)}
                        maxLength={400}
                        rows={3}
                        placeholder="Descrivi l'aspetto chiave..."
                        className="text-xs bg-background resize-none leading-relaxed"
                        required
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Salvataggio */}
          <div className="pt-2 border-t border-border flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || isResetting}
              className="text-xs font-semibold px-5 h-9 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                  Salvataggio in corso...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <SaveIcon className="w-3.5 h-3.5" />
                  Salva Sezione
                </span>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
