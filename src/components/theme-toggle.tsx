"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full">
        <span className="sr-only">Alterna tema</span>
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="w-9 h-9 rounded-full transition-colors hover:bg-muted text-foreground"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Passa a Tema Chiaro" : "Passa a Tema Scuro"}
      aria-label="Alterna tema chiaro/scuro"
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform text-primary" />
      ) : (
        <Moon className="h-4 w-4 transition-transform text-primary" />
      )}
      <span className="sr-only">Alterna tema</span>
    </Button>
  );
}
