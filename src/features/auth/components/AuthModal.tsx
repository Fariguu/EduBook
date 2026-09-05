"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, KeyRound, Loader2, Mail, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  loginSchema,
  resetPasswordSchema,
  type LoginInput,
  type ResetPasswordInput,
} from "../schemas/auth.schema";
import { loginWithPassword, resetPasswordAction } from "../actions/auth.actions";

export function AuthModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"login" | "forgot">("login");
  const [loading, setLoading] = useState(false);

  // Sync modal view & open state when URL search param changes
  useEffect(() => {
    const shouldBeOpen = searchParams.get("auth") === "login";
    setIsOpen(shouldBeOpen);
    if (shouldBeOpen) {
      setView("login");
    }
  }, [searchParams]);

  const handleClose = () => {
    setIsOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("auth");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  // Login Form
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
    reset: resetLoginForm,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  // Forgot Password Form
  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: forgotErrors },
    reset: resetForgotForm,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onLoginSubmit = async (data: LoginInput) => {
    setLoading(true);
    const result = await loginWithPassword(data);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Accesso effettuato con successo!");
      setIsOpen(false);
      resetLoginForm();
      router.replace("/dashboard");
      router.refresh();
    }
  };

  const onForgotSubmit = async (data: ResetPasswordInput) => {
    setLoading(true);
    const result = await resetPasswordAction(data);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message || "Email di reset inviata!");
      resetForgotForm();
      setView("login");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[420px] p-6 overflow-hidden bg-card text-card-foreground border border-border shadow-2xl">
        <AnimatePresence mode="wait">
          {view === "login" ? (
            <motion.div
              key="login-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="space-y-2 text-left mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-1">
                  <LogIn className="w-5 h-5" />
                </div>
                <DialogTitle className="text-xl font-bold">Accesso Professore</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Inserisci le tue credenziali riservate per accedere alla dashboard.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="professore@example.com"
                      className={`pl-9 ${loginErrors.email ? "border-destructive" : ""}`}
                      {...registerLogin("email")}
                    />
                  </div>
                  {loginErrors.email && (
                    <p className="text-xs text-destructive">{loginErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <button
                      type="button"
                      onClick={() => setView("forgot")}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Password dimenticata?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      className={`pl-9 ${loginErrors.password ? "border-destructive" : ""}`}
                      {...registerLogin("password")}
                    />
                  </div>
                  {loginErrors.password && (
                    <p className="text-xs text-destructive">{loginErrors.password.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Accesso in corso...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Accedi
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="forgot-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="space-y-2 text-left mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-1">
                  <KeyRound className="w-5 h-5" />
                </div>
                <DialogTitle className="text-xl font-bold">Recupera Password</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Inserisci la tua email per ricevere il link di ripristino password.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmitForgot(onForgotSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="professore@example.com"
                      className={`pl-9 ${forgotErrors.email ? "border-destructive" : ""}`}
                      {...registerForgot("email")}
                    />
                  </div>
                  {forgotErrors.email && (
                    <p className="text-xs text-destructive">{forgotErrors.email.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Invio in corso...
                    </>
                  ) : (
                    "Invia Link di Reset"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => setView("login")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Torna al Login
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
