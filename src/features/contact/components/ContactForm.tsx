"use client";

import * as React from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SendIcon,
  UserIcon,
  MailIcon,
  MessageSquareIcon,
  CheckCircle2Icon,
  RefreshCwIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { sendContactMessage } from "../actions/contact.actions";

export function ContactForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [privacyConsent, setPrivacyConsent] = React.useState(false);
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Inserisci il tuo nome.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      toast.error("Inserisci un indirizzo email valido con un dominio valido.");
      return;
    }

    if (message.trim().length < 10) {
      toast.error("Il messaggio deve contenere almeno 10 caratteri.");
      return;
    }

    if (!privacyConsent) {
      toast.error("È necessario accettare l'informativa sulla privacy.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await sendContactMessage({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        message: message.trim(),
        privacyConsent: true,
        turnstileToken,
      });

      if (!res.success) {
        toast.error(res.error || "Errore durante l'invio del messaggio.");
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      toast.success("Messaggio inviato con successo!");
    } catch (err) {
      console.error(err);
      toast.error("Si è verificato un errore inaspettato. Riprova più tardi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setMessage("");
    setPrivacyConsent(false);
    setTurnstileToken(null);
    setIsSuccess(false);
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-text flex items-center gap-2">
          <MessageSquareIcon className="w-5 h-5 text-primary" />
          Invia un messaggio
        </CardTitle>
        <CardDescription>
          Compila il modulo per qualsiasi informazione, richiesta di lezioni su misura o chiarimenti.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-6 text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto">
                <CheckCircle2Icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text">Messaggio Ricevuto!</h3>
                <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
                  Grazie <strong>{name}</strong>, il tuo messaggio è stato recapitato al docente.
                  Riceverai una risposta al più presto all&apos;indirizzo <strong>{email}</strong>.
                </p>
              </div>
              <div className="pt-2">
                <Button variant="outline" onClick={handleReset} className="text-sm">
                  <RefreshCwIcon className="w-4 h-4 mr-2" />
                  Invia un altro messaggio
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              noValidate
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="contactName" className="text-sm font-medium">
                    Nome e Cognome <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                    <Input
                      id="contactName"
                      placeholder="Mario Rossi"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contactEmail" className="text-sm font-medium">
                    Indirizzo Email <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <MailIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="mario.rossi@email.it"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="contactMessage" className="text-sm font-medium">
                    Il tuo Messaggio <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-xs text-muted-foreground">{message.length}/2000</span>
                </div>
                <Textarea
                  id="contactMessage"
                  placeholder="Scrivi qui la tua richiesta o domanda..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[140px] text-sm"
                  maxLength={2000}
                  required
                />
              </div>

              {/* Consenso Privacy */}
              <div className="flex items-start gap-2.5 pt-1">
                <Checkbox
                  id="privacy"
                  checked={privacyConsent}
                  onCheckedChange={(checked) => setPrivacyConsent(Boolean(checked))}
                />
                <Label
                  htmlFor="privacy"
                  className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
                >
                  Ho letto e accetto l&apos;
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="underline text-primary hover:text-primary/80 ml-1"
                  >
                    informativa sulla privacy
                  </Link>{" "}
                  per il trattamento dei dati personali necessari alla risposta.
                </Label>
              </div>

              {/* Turnstile Anti-Spam */}
              <div className="py-2 flex justify-center">
                <Turnstile
                  siteKey={turnstileSiteKey}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onError={() => setTurnstileToken(null)}
                  onExpire={() => setTurnstileToken(null)}
                  options={{
                    theme: "auto",
                    size: "flexible",
                  }}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white hover:bg-primary/90 h-11 text-base font-semibold"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Invio in corso...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <SendIcon className="w-4 h-4" />
                    Invia Messaggio
                  </span>
                )}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
