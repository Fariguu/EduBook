import React from "react";
import {
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
  type WhyChooseUsData,
} from "@/features/profile/constants/why-choose-us.constants";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
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

interface BioSectionProps {
  readonly data?: WhyChooseUsData;
}

function getGridColsClass(count: number): string {
  if (count <= 1) return "grid grid-cols-1 max-w-md mx-auto gap-8";
  if (count === 2) return "grid grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto gap-8";
  if (count === 3) return "grid grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto gap-8";
  if (count === 4) return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8";
  return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8";
}

export function BioSection({ data }: BioSectionProps) {
  const config = data && data.pillars && data.pillars.length > 0 ? data : DEFAULT_WHY_CHOOSE_US;
  const pillars = config.pillars;

  return (
    <section className="py-20 bg-background transition-colors">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {config.title || DEFAULT_WHY_CHOOSE_US.title}
          </h2>
          {config.subtitle && (
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              {config.subtitle}
            </p>
          )}
        </div>

        <div className={getGridColsClass(pillars.length)}>
          {pillars.map((pillar, i) => {
            const Icon = ICON_MAP[pillar.icon] || Target;

            return (
              <div
                key={i}
                className="p-6 rounded-2xl border border-border/60 bg-muted/20 hover:border-primary/40 transition-all flex flex-col items-start space-y-4 shadow-sm hover:shadow-md"
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
