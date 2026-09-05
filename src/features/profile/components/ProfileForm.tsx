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
} from "lucide-react";
import { updateProfile } from "../actions/profile.actions";

interface ProfileData {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  teaching_subjects?: string[] | null;
}

interface ProfileFormProps {
  initialProfile: ProfileData | null;
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [firstName, setFirstName] = React.useState(initialProfile?.first_name || "");
  const [lastName, setLastName] = React.useState(initialProfile?.last_name || "");
  const [email, setEmail] = React.useState(initialProfile?.email || "");
  const [phone, setPhone] = React.useState(initialProfile?.phone || "");
  const [bio, setBio] = React.useState(initialProfile?.bio || "");
  const [subjects, setSubjects] = React.useState<string[]>(
    initialProfile?.teaching_subjects && initialProfile.teaching_subjects.length > 0
      ? initialProfile.teaching_subjects
      : ["Matematica", "Fisica", "Analisi 1"]
  );
  const [newSubject, setNewSubject] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const suggestedSubjects = [
    "Matematica",
    "Fisica",
    "Analisi 1",
    "Analisi 2",
    "Geometria",
    "Chimica",
    "Informatica",
    "Statistica",
    "Trigonometria",
  ];

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
    setSubjects((prev) => prev.filter((_, idx) => idx !== indexToRemove));
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
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        bio: bio.trim() || null,
        teaching_subjects: subjects,
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

      {/* 2. MATERIE INSEGNATE (TAGS INTERATTIVI) */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-text flex items-center gap-2">
            <BookOpenIcon className="w-5 h-5 text-primary" />
            Materie Insegnate
          </CardTitle>
          <CardDescription>
            Le materie aggiunte qui appariranno come badge in rilievo nella Homepage e nella pagina Contatti.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Badge attivi */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Materie Attive ({subjects.length}):
            </Label>
            <div className="flex flex-wrap gap-2 pt-1">
              {subjects.map((sub, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/25 pl-3 pr-1.5 py-1 text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>{sub}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(idx)}
                    className="w-4 h-4 rounded-full hover:bg-primary/20 flex items-center justify-center transition-colors"
                    title={`Rimuovi ${sub}`}
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Aggiunta nuova materia */}
          <div className="space-y-2 pt-2 border-t border-border">
            <Label htmlFor="newSubjectInput" className="text-xs font-semibold">
              Aggiungi nuova materia:
            </Label>
            <div className="flex gap-2">
              <Input
                id="newSubjectInput"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Es. Elettronica, Statistica, Economia..."
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

            {/* Suggerimenti rapidi */}
            <div className="pt-2">
              <span className="text-[11px] text-muted-foreground block mb-1">
                Suggerimenti veloci (clicca per aggiungere):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestedSubjects
                  .filter((s) => !subjects.some((cur) => cur.toLowerCase() === s.toLowerCase()))
                  .map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAddSubject(s)}
                      className="px-2 py-0.5 rounded-md border border-border bg-muted/40 hover:bg-muted text-[11px] text-muted-foreground hover:text-text transition-colors"
                    >
                      + {s}
                    </button>
                  ))}
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
