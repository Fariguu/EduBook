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
import {
  LayoutTemplateIcon,
  PlusIcon,
  Trash2Icon,
  RotateCcwIcon,
  SaveIcon,
  Loader2Icon,
  BookOpen,
} from "lucide-react";
import {
  DEFAULT_HERO_CARD,
  type HeroCardData,
  type HeroCardItem,
} from "../constants/hero-card.constants";
import { updateHeroCard, resetHeroCard } from "../actions/profile.actions";

interface HeroCardConfigCardProps {
  readonly initialData?: HeroCardData | null;
  readonly professorName?: string;
  readonly headline?: string | null;
}

const PREVIEW_VALUE_COLORS = [
  "text-primary font-semibold",
  "text-secondary font-semibold",
  "text-foreground font-semibold",
];

export function HeroCardConfigCard({
  initialData,
  professorName = "Professore",
  headline = "Docente Qualificato",
}: HeroCardConfigCardProps) {
  const data =
    initialData && initialData.items?.length > 0 ? initialData : DEFAULT_HERO_CARD;

  const [items, setItems] = React.useState<HeroCardItem[]>(data.items);
  const [footnote, setFootnote] = React.useState<string>(
    data.footnote ?? DEFAULT_HERO_CARD.footnote ?? ""
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);

  const handleAddItem = () => {
    if (items.length >= 5) {
      toast.error("Puoi inserire al massimo 5 elementi nella card.");
      return;
    }
    setItems((prev) => [...prev, { label: "", value: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.error("Deve essere presente almeno un elemento informativo.");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof HeroCardItem,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (let i = 0; i < items.length; i++) {
      if (!items[i].label.trim()) {
        toast.error(`L'etichetta dell'elemento #${i + 1} non può essere vuota.`);
        return;
      }
      if (!items[i].value.trim()) {
        toast.error(`Il valore dell'elemento #${i + 1} non può essere vuoto.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await updateHeroCard({
        items: items.map((it) => ({
          label: it.label.trim(),
          value: it.value.trim(),
        })),
        footnote: footnote.trim() || null,
      });

      if (!res.success) {
        toast.error(res.error || "Impossibile salvare la configurazione.");
        return;
      }

      toast.success("Card hero aggiornata con successo!");
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
      const res = await resetHeroCard();
      if (!res.success) {
        toast.error(res.error || "Impossibile ripristinare i valori predefiniti.");
        return;
      }

      setItems(DEFAULT_HERO_CARD.items);
      setFootnote(DEFAULT_HERO_CARD.footnote ?? "");
      toast.success("Card ripristinata ai valori predefiniti!");
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
            <LayoutTemplateIcon className="w-5 h-5 text-primary" />
            <span>Card Informativa Hero</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-1">
            Personalizza i punti informativi e la nota visualizzati nella card in primo piano della home page.
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form Fields Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground">
                    Righe Informative ({items.length}/5)
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                    disabled={items.length >= 5 || isSubmitting}
                    className="text-xs h-7 border-border hover:border-primary/50 text-foreground"
                  >
                    <PlusIcon className="w-3 h-3 mr-1 text-primary" />
                    Aggiungi Voce
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {items.map((item, index) => (
                    <div
                      key={`item-row-${index}`}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/30 transition-colors"
                    >
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        <div>
                          <Label className="text-[10px] text-muted-foreground mb-1 block">
                            Etichetta (Sinistra)
                          </Label>
                          <Input
                            placeholder="Es. Lezioni disponibili"
                            value={item.label}
                            onChange={(e) =>
                              handleItemChange(index, "label", e.target.value)
                            }
                            maxLength={35}
                            disabled={isSubmitting}
                            className="text-xs h-8 bg-background border-border"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground mb-1 block">
                            Valore (Destra)
                          </Label>
                          <Input
                            placeholder="Es. Online & In Presenza"
                            value={item.value}
                            onChange={(e) =>
                              handleItemChange(index, "value", e.target.value)
                            }
                            maxLength={40}
                            disabled={isSubmitting}
                            className="text-xs h-8 bg-background border-border"
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length <= 1 || isSubmitting}
                        title="Elimina voce"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 mt-3"
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footnote Field */}
              <div className="space-y-1.5 pt-2">
                <Label htmlFor="hero-footnote" className="text-xs font-semibold text-foreground">
                  Nota a piè di pagina (opzionale)
                </Label>
                <Input
                  id="hero-footnote"
                  placeholder="Es. Nessun account studente richiesto — prenotazione diretta in 2 minuti."
                  value={footnote}
                  onChange={(e) => setFootnote(e.target.value)}
                  maxLength={120}
                  disabled={isSubmitting}
                  className="text-xs bg-background border-border"
                />
                <p className="text-[11px] text-muted-foreground">
                  Testo informativo visualizzato in basso nella card. Lascia vuoto per nasconderlo.
                </p>
              </div>
            </div>

            {/* Live Preview Column */}
            <div className="lg:col-span-5 space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">
                Anteprima Live Landing Page
              </Label>
              <div className="rounded-2xl border border-border bg-background p-5 shadow-lg space-y-4">
                <div className="flex items-center gap-3 border-b border-border pb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-inner">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-sm text-foreground truncate">
                      {professorName}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {headline || "Docente"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-muted-foreground">
                  {items.map((item, index) => (
                    <div
                      key={`preview-${index}`}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 gap-2"
                    >
                      <span className="font-medium text-foreground truncate">
                        {item.label || "Etichetta"}
                      </span>
                      <span
                        className={`${PREVIEW_VALUE_COLORS[index % PREVIEW_VALUE_COLORS.length]} shrink-0`}
                      >
                        {item.value || "Valore"}
                      </span>
                    </div>
                  ))}
                </div>

                {footnote ? (
                  <div className="pt-1 text-center text-[11px] text-muted-foreground leading-tight">
                    {footnote}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="font-medium text-xs h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Salvataggio in corso...
                </>
              ) : (
                <>
                  <SaveIcon className="w-3.5 h-3.5 mr-1.5" />
                  Salva Modifiche Card
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
