"use client";

import * as React from "react";

interface ExpandableTextProps {
  readonly text: string;
  readonly className?: string;
}

export function ExpandableText({ text, className = "" }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isClamped, setIsClamped] = React.useState(false);
  const textRef = React.useRef<HTMLParagraphElement>(null);

  React.useLayoutEffect(() => {
    const el = textRef.current;
    if (el) {
      setIsClamped(el.scrollHeight > el.clientHeight + 1);
    }
  }, [text]);

  return (
    <div className="space-y-1">
      <p
        ref={textRef}
        className={`${className} ${
          isExpanded ? "" : "line-clamp-3"
        } whitespace-pre-wrap transition-all`}
      >
        {text}
      </p>

      {(isClamped || isExpanded) && (
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="text-[11px] font-normal text-muted-foreground/70 hover:text-muted-foreground transition-colors inline-block cursor-pointer focus:outline-none underline-offset-2 hover:underline"
        >
          {isExpanded ? "mostra meno" : "continua a leggere"}
        </button>
      )}
    </div>
  );
}
