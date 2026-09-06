"use client";

import * as React from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  BookOpenIcon,
  FileTextIcon,
  PlusIcon,
  XIcon,
  Loader2Icon,
  SaveIcon,
  PencilIcon,
  CheckIcon,
  BriefcaseIcon,
} from "lucide-react";
import { updateProfile } from "../actions/profile.actions";

interface ProfileData {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  headline?: string | null;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  teaching_subjects?: string[] | null;
  subject_details?: Record<string, string> | null;
  suggested_subjects?: string[] | null;
}

interface ProfileFormProps {
  initialProfile: ProfileData | null;
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [firstName, setFirstName] = React.useState(initialProfile?.first_name || "");
  const [lastName, setLastName] = React.useState(initialProfile?.last_name || "");
  const [headline, setHeadline] = React.useState(
    initialProfile?.headline || "Docente di Scienze Matematiche"
  );
  const [email, setEmail] = React.useState(initialProfile?.email || "");
  const [phone, setPhone] = React.useState(initialProfile?.phone || "");
  const [bio, setBio] = React.useState(initialProfile?.bio || "");
  const [subjects, setSubjects] = React.useState<string[]>(
    initialProfile?.teaching_subjects && initialProfile.teaching_subjects.length > 0
      ? initialProfile.teaching_subjects
      : ["Matematica", "Fisica", "Analisi 1"]
  );
  const [subjectDetails, setSubjectDetails] = React.useState<Record<string, string>>(
    initialProfile?.subject_details || {}
  );
  const [suggestedSubjects, setSuggestedSubjects] = React.useState<string[]>(
    initialProfile?.suggested_subjects && initialProfile.suggested_subjects.length > 0
      ? initialProfile.suggested_subjects
      : [
          "Matematica",
          "Fisica",
          "Analisi 1",
          "Analisi 2",
          "Geometria",
          "Chimica",
          "Informatica",
          "Statistica",
          "Trigonometria",
        ]
  );

  const [newSubject, setNewSubject] = React.useState("");
  const [newSuggestion, setNewSuggestion] = React.useState("");
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [editingValue, setEditingValue] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleAddSubject = (subjectToAdd?: string) => {
    const term = (subjectToAdd || newSubject).trim();
    if (!term) return;

    if (subjects.some((s) => s.toLowerCase() === term.toLowerCase())) {
      toast.error("Questa materia è già presente nell'elenco.");
      return;
    }

    setSubjects((prev) => [...prev, term]);
    if (!subjectToAdd) {
      setNewSubject("");
    }
  };

  const handleRemoveSubject = (indexToRemove: number) => {
    if (subjects.length <= 1) {
      toast.error("Devi mantenere almeno una materia d'insegnamento.");
      return;
    }
    const removedName = subjects[indexToRemove];
    setSubjects((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (removedName) {
      setSubjectDetails((prev) => {
        const next = { ...prev };
        delete next[removedName];
        return next;
      });
    }
    if (editingIndex === indexToRemove) {
      setEditingIndex(null);
      setEditingValue("");
    }
  };

  const startEditingSubject = (index: number) => {
    setEditingIndex(index);
    setEditingValue(subjects[index]);
  };

  const saveEditingSubject = (index: number) => {
    const term = editingValue.trim();
    if (!term) {
      toast.error("Il nome della materia non può essere vuoto.");
      return;
    }
    if (
      subjects.some(
        (s, idx) => idx !== index && s.toLowerCase() === term.toLowerCase()
      )
    ) {
      toast.error("Questa materia è già presente nell'elenco.");
      return;
    }
    const oldName = subjects[index];
    setSubjects((prev) => prev.map((s, idx) => (idx === index ? term : s)));
    if (oldName && oldName !== term) {
      setSubjectDetails((prev) => {
        const next = { ...prev };
        if (next[oldName]) {
          next[term] = next[oldName];
          delete next[oldName];
        }
        return next;
      });
    }
    setEditingIndex(null);
    setEditingValue("");
  };

  const cancelEditingSubject = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  const handleSubjectDetailChange = (subjectName: string, text: string) => {
    setSubjectDetails((prev) => ({
      ...prev,
      [subjectName]: text,
    }));
  };

  const handleAddSuggestion = () => {
    const term = newSuggestion.trim();
    if (!term) return;
    if (suggestedSubjects.some((s) => s.toLowerCase() === term.toLowerCase())) {
      toast.error("Questo suggerimento è già presente.");
      return;
    }
    setSuggestedSubjects((prev) => [...prev, term]);
    setNewSuggestion("");
  };

  const handleRemoveSuggestion = (sugToRemove: string) => {
    setSuggestedSubjects((prev) => prev.filter((s) => s !== sugToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSubject();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Nome e Cognome sono obbligatori.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      toast.error("Inserisci un indirizzo email valido.");
      return;
    }

    if (subjects.length === 0) {
      toast.error("Inserisci almeno una materia d'insegnamento.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        headline: headline.trim() || "Docente di Scienze Matematiche",
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        bio: bio.trim() || null,
        teaching_subjects: subjects,
        subject_details: subjectDetails,
        suggested_subjects: suggestedSubjects,
      });

      if (!res.success) {
        toast.error(res.error || "Impossibile aggiornare il profilo.");
        setIsSubmitting(false);
        return;
      }

      toast.success("Profilo e materie aggiornati con successo!");
    } catch (err) {
      console.error(err);
      toast.error("Si è verificato un errore inaspettato.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. DATI ANAGRAFICI & RECAPITI */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-text flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-primary" />
            Informazioni Personali & Recapiti
          </CardTitle>
          <CardDescription>
            Questi dati identificano il docente sul sito web e nelle comunicazioni inviate agli studenti.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-xs font-semibold">
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Gabriele"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-xs font-semibold">
                Cognome <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Farigu"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="headline" className="text-xs font-semibold">
              Qualifica / Sottotitolo Professionale <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <BriefcaseIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              <Input
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="pl-9"
                placeholder="Es. Docente di Scienze Matematiche / Ingegnere Informatico"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="profEmail" className="text-xs font-semibold">
                Email Pubblica & Notifiche <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <MailIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <Input
                  id="profEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  placeholder="gabriele@edubook.it"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profPhone" className="text-xs font-semibold">
                Telefono / WhatsApp (opzionale)
              </Label>
              <div className="relative">
                <PhoneIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <Input
                  id="profPhone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-9"
                  placeholder="+39 340 123 4567"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. MATERIE INSEGNATE (TAGS INTERATTIVI & CRUD) */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-text flex items-center gap-2">
            <BookOpenIcon className="w-5 h-5 text-primary" />
            Materie Insegnate (Gestione & Modifica)
          </CardTitle>
          <CardDescription>
            Aggiungi, rinomina o rimuovi le materie insegnate. Le modifiche appariranno immediatamente nella Homepage e nel form di prenotazione.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Badge attivi e modifica in linea */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Materie Attive ({subjects.length}):
            </Label>
            <div className="flex flex-wrap gap-2 pt-1">
              {subjects.map((sub, idx) => (
                <div key={sub} className="inline-flex items-center">
                  {editingIndex === idx ? (
                    <div className="flex items-center gap-1 bg-background border border-primary rounded-md px-1.5 py-0.5 shadow-sm">
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveEditingSubject(idx);
                          } else if (e.key === "Escape") {
                            cancelEditingSubject();
                          }
                        }}
                        autoFocus
                        className="text-xs font-medium bg-transparent border-none outline-none focus:ring-0 w-28 px-1 text-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => saveEditingSubject(idx)}
                        className="p-1 text-primary hover:bg-primary/10 rounded transition-colors"
                        title="Salva modifica materia"
                      >
                        <CheckIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditingSubject}
                        className="p-1 text-muted-foreground hover:bg-muted rounded transition-colors"
                        title="Annulla"
                      >
                        <XIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/25 pl-3 pr-1 py-1 text-xs font-semibold flex items-center gap-1.5 group"
                    >
                      <span>{sub}</span>
                      <button
                        type="button"
                        onClick={() => startEditingSubject(idx)}
                        className="w-4 h-4 rounded hover:bg-primary/20 flex items-center justify-center text-primary/70 hover:text-primary transition-colors ml-0.5"
                        title={`Modifica o rinomina "${sub}"`}
                      >
                        <PencilIcon className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(idx)}
                        className="w-4 h-4 rounded-full hover:bg-destructive/20 hover:text-destructive flex items-center justify-center transition-colors"
                        title={`Rimuovi "${sub}"`}
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Descrizioni Personalizzate delle Materie (Card nella Home) */}
          <div className="space-y-3 pt-3 border-t border-border">
            <div>
              <Label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Descrizione e Obiettivi per ciascuna materia (Homepage):
              </Label>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Personalizza il testo esplicativo che viene mostrato nelle schede della sezione &ldquo;Materie e Ambiti di Insegnamento&rdquo;.
              </p>
            </div>

            <div className="space-y-3">
              {subjects.map((sub) => (
                <div
                  key={sub}
                  className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <BookOpenIcon className="w-3.5 h-3.5" />
                      {sub}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {(subjectDetails[sub] || "").length}/250
                    </span>
                  </div>
                  <Input
                    value={
                      subjectDetails[sub] !== undefined
                        ? subjectDetails[sub]
                        : "Supporto completo su teoria, esercizi svolti, simulazioni di verifica ed esami."
                    }
                    onChange={(e) => handleSubjectDetailChange(sub, e.target.value)}
                    placeholder="Es. Approfondimento su limiti, derivate, integrali e studio di funzioni per esami universitari."
                    className="text-xs h-9 bg-background"
                    maxLength={250}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Aggiunta nuova materia */}
          <div className="space-y-2 pt-3 border-t border-border">
            <Label htmlFor="newSubjectInput" className="text-xs font-semibold">
              Aggiungi nuova materia d&apos;insegnamento:
            </Label>
            <div className="flex gap-2">
              <Input
                id="newSubjectInput"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Es. Lingua Inglese, Diritto, Economia Aziendale..."
                className="text-xs sm:text-sm"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddSubject()}
                className="shrink-0"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Aggiungi
              </Button>
            </div>

            {/* Suggerimenti rapidi (personalizzabili ed eliminabili) */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  Suggerimenti rapidi (clicca per aggiungere alle materie o rimuovi dai suggerimenti):
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {suggestedSubjects.map((sug) => {
                  const isAlreadyAdded = subjects.some(
                    (cur) => cur.toLowerCase() === sug.toLowerCase()
                  );

                  return (
                    <div
                      key={sug}
                      className="inline-flex items-center rounded-md border border-border bg-muted/40 text-[11px] overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => handleAddSubject(sug)}
                        disabled={isAlreadyAdded}
                        className={`px-2 py-0.5 transition-colors ${
                          isAlreadyAdded
                            ? "text-muted-foreground/60 cursor-not-allowed bg-muted/60"
                            : "text-foreground hover:text-primary hover:bg-muted font-medium"
                        }`}
                        title={
                          isAlreadyAdded
                            ? "Materia già aggiunta"
                            : `Aggiungi "${sug}" alle materie insegnate`
                        }
                      >
                        + {sug}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSuggestion(sug)}
                        className="px-1.5 py-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-l border-border transition-colors"
                        title={`Elimina "${sug}" dai suggerimenti`}
                      >
                        <XIcon className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Form aggiunta nuovo suggerimento personalizzato */}
              <div className="flex items-center gap-2 pt-1 max-w-sm">
                <Input
                  value={newSuggestion}
                  onChange={(e) => setNewSuggestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSuggestion();
                    }
                  }}
                  placeholder="Nuovo suggerimento rapido..."
                  className="text-xs h-7 bg-background"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddSuggestion}
                  className="h-7 text-xs px-2 text-primary hover:bg-primary/10 shrink-0"
                >
                  <PlusIcon className="w-3.5 h-3.5 mr-1" />
                  Salva Suggerimento
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. BIOGRAFIA & METODOLOGIA */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-text flex items-center gap-2">
            <FileTextIcon className="w-5 h-5 text-primary" />
            Biografia & Presentazione Pubblica
          </CardTitle>
          <CardDescription>
            Testo descrittivo che appare nella sezione Hero della Homepage per presentare le tue qualifiche e il tuo metodo.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="profBio" className="text-xs font-semibold">
              Descrizione / Bio
            </Label>
            <span className="text-xs text-muted-foreground">{bio.length}/1000</span>
          </div>
          <Textarea
            id="profBio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Descrivi la tua esperienza, il percorso accademico e il metodo didattico che utilizzi con gli studenti..."
            className="min-h-[140px] text-sm leading-relaxed"
            maxLength={1000}
          />
        </CardContent>
      </Card>

      {/* PULSANTE DI SALVATAGGIO */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-white hover:bg-primary/90 h-11 px-6 text-sm sm:text-base font-semibold"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2Icon className="w-4 h-4 animate-spin" />
              Salvataggio modifiche...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <SaveIcon className="w-4 h-4" />
              Salva Modifiche Profilo
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
