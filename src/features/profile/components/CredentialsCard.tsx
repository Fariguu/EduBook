"use client";

import * as React from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  KeyRoundIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  ShieldCheckIcon,
} from "lucide-react";
import { updateCredentials } from "../actions/profile.actions";

interface CredentialsCardProps {
  readonly initialEmail: string;
}

export function CredentialsCard({ initialEmail }: CredentialsCardProps) {
  const [currentEmail, setCurrentEmail] = React.useState(initialEmail);
  const [emailInput, setEmailInput] = React.useState(initialEmail);
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const [isUpdatingEmail, setIsUpdatingEmail] = React.useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();

    if (!cleanEmail?.includes("@")) {
      toast.error("Inserisci un indirizzo email valido.");
      return;
    }

    if (cleanEmail === currentEmail.toLowerCase()) {
      toast.info("L'email inserita è già quella attualmente in uso.");
      return;
    }

    setIsUpdatingEmail(true);
    try {
      const res = await updateCredentials({ email: cleanEmail });
      if (res.success) {
        setCurrentEmail(cleanEmail);
        toast.success("Email di accesso aggiornata con successo!");
      } else {
        toast.error(res.error || "Impossibile aggiornare l'email.");
      }
    } catch {
      toast.error("Si è verificato un errore durante l'aggiornamento dell'email.");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      toast.error("Inserisci la nuova password.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("La password deve contenere almeno 8 caratteri.");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      toast.error("La password deve contenere almeno una lettera maiuscola.");
      return;
    }

    if (!/\d/.test(newPassword)) {
      toast.error("La password deve contenere almeno un numero.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Le password non coincidono.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await updateCredentials({
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Password di accesso aggiornata con successo!");
      } else {
        toast.error(res.error || "Impossibile aggiornare la password.");
      }
    } catch {
      toast.error("Si è verificato un errore durante l'aggiornamento della password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-4 border-b border-border">
        <CardTitle className="text-lg font-bold text-text flex items-center gap-2">
          <ShieldCheckIcon className="w-5 h-5 text-primary" />
          Credenziali di Accesso &amp; Sicurezza
        </CardTitle>
        <CardDescription>
          Modifica l&apos;indirizzo email e la password utilizzati per effettuare il login all&apos;area riservata docente.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* SEZIONE 1: MODIFICA EMAIL DI LOGIN */}
        <form onSubmit={handleUpdateEmail} className="space-y-3">
          <div className="flex items-center gap-2">
            <MailIcon className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-bold text-foreground">Email di Accesso</h4>
          </div>

          <p className="text-xs text-muted-foreground">
            Email attualmente in uso per autenticarti:{" "}
            <span className="font-semibold text-foreground">{currentEmail || "Non configurata"}</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center max-w-lg">
            <div className="relative flex-1">
              <MailIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              <Input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="nuova.email@docente.it"
                className="pl-9 text-sm h-10"
                required
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              disabled={isUpdatingEmail || emailInput.trim().toLowerCase() === currentEmail.toLowerCase()}
              className="h-10 text-xs font-semibold px-4 shrink-0"
            >
              {isUpdatingEmail ? (
                <>
                  <Loader2Icon className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Salvataggio...
                </>
              ) : (
                "Aggiorna Email"
              )}
            </Button>
          </div>
        </form>

        <div className="border-t border-border" />

        {/* SEZIONE 2: MODIFICA PASSWORD */}
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRoundIcon className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-bold text-foreground">Modifica Password</h4>
            </div>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              {showPassword ? (
                <>
                  <EyeOffIcon className="w-3.5 h-3.5" /> Nascondi
                </>
              ) : (
                <>
                  <EyeIcon className="w-3.5 h-3.5" /> Mostra
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <div className="space-y-1.5">
              <Label htmlFor="credNewPassword" className="text-xs font-semibold">
                Nuova Password
              </Label>
              <div className="relative">
                <LockIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <Input
                  id="credNewPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 text-sm h-10"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="credConfirmPassword" className="text-xs font-semibold">
                Conferma Nuova Password
              </Label>
              <div className="relative">
                <LockIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <Input
                  id="credConfirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 text-sm h-10"
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Requisiti di sicurezza: minimo 8 caratteri, almeno una lettera maiuscola e almeno un numero.
          </p>

          <div>
            <Button
              type="submit"
              variant="outline"
              disabled={isUpdatingPassword || !newPassword || !confirmPassword}
              className="h-10 text-xs font-semibold px-4"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2Icon className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Salvataggio Password...
                </>
              ) : (
                "Salva Nuova Password"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
