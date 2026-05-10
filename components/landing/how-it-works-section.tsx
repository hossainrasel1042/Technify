"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "01",
    title: "Discover",
    description:
      "We kick off with a deep-dive into your product vision, map out requirements, and deliver a clear technical roadmap — all within the first week.",
    code: `technify.discover({
  client: 'your-product',
  goals: ['mvp', 'scale', 'launch'],
  timeline: '1 week'
})`,
  },
  {
    number: "02",
    title: "Build",
    description:
      "Our engineers and designers ship in tight, focused sprints. Weekly demos keep you in the loop — no surprises, just progress.",
    code: `technify.sprint('week-1', {
  design: 'ui-system',
  backend: 'api-layer',
  review: 'friday-demo'
})`,
  },
  {
    number: "03",
    title: "Ship",
    description:
      "We deploy to production, wire up monitoring, and hand over full ownership — or stay on as your dedicated engineering team.",
    code: `technify.deploy({
  env: 'production',
  region: 'auto'
}) // Live in < 30s`,
  },
];

// ─── Token-based highlighter ──────────────────────────────────────────────────
type Token = {
  type: "keyword" | "method" | "string" | "comment" | "punctuation" | "plain";
  value: string;
};

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let remaining = line;

  const rules: { type: Token["type"]; pattern: RegExp }[] = [
    { type: "comment",     pattern: /^\/\/.*/ },
    { type: "string",      pattern: /^('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/ },
    { type: "keyword",     pattern: /^(technify|process|env)\b/ },
    { type: "method",      pattern: /^(\.\w+)/ },
    { type: "punctuation", pattern: /^[{}()[\]:]/ },
    { type: "plain",       pattern: /^[^'"./{}()[\]:te]+/ },
    { type: "plain",       pattern: /^./ },
  ];

  while (remaining.length > 0) {
    let matched = false;
    for (const rule of rules) {
      const m = remaining.match(rule.pattern);
      if (m) {
        tokens.push({ type: rule.type, value: m[0] });
        remaining = remaining.slice(m[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push({ type: "plain", value: remaining[0] });
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}

const tokenClass: Record<Token["type"], string> = {
  keyword:     "text-foreground",
  method:      "text-primary",
  string:      "text-green-400",
  comment:     "text-muted-foreground/50",
  punctuation: "text-muted-foreground/70",
  plain:       "",
};

function HighlightedLine({
  line,
  stepIndex,
  lineIndex,
}: {
  line: string;
  stepIndex: number;
  lineIndex: number;
}) {
  const tokens = tokenizeLine(line);
  return (
    <div
      className="leading-relaxed animate-in fade-in slide-in-from-left-2"
      style={{ animationDelay: `${lineIndex * 50}ms` }}
    >
      <span className="text-muted-foreground/40 select-none w-6 inline-block">
        {lineIndex + 1}
      </span>
      {tokens.map((tok, i) =>
        tok.type === "plain" ? (
          <span key={i}>{tok.value}</span>
        ) : (
          <span key={i} className={tokenClass[tok.type]}>
            {tok.value}
          </span>
        )
      )}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeStep]);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-32 overflow-hidden bg-secondary/30"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-20">
          <h2
            className={`text-3xl lg:text-5xl font-semibold tracking-tight mb-6 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="text-balance">From idea to launch</span>
            <br />
            <span className="text-balance">in three steps.</span>
          </h2>
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Steps list */}
          <div className="space-y-2">
            {steps.map((step, index) => (
              <button
                key={step.number}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`w-full text-left p-6 rounded-xl border transition-all duration-300 ${
                  activeStep === index
                    ? "bg-card border-primary/50 card-shadow"
                    : "bg-transparent border-transparent hover:bg-card/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`font-mono text-sm transition-colors ${
                      activeStep === index
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.number}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                    <p
                      className={`text-sm leading-relaxed transition-colors ${
                        activeStep === index
                          ? "text-muted-foreground"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                {activeStep === index && (
                  <div className="mt-4 ml-8">
                    <div className="h-0.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full animate-[progress_4s_linear]"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Code display */}
          <div className="lg:sticky lg:top-32">
            <div className="rounded-xl overflow-hidden bg-card border border-border card-shadow">
              {/* Window chrome */}
              <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-secondary/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  project.ts
                </span>
              </div>

              {/* Code content */}
              <div className="p-6 font-mono text-sm min-h-[200px]">
                <pre className="text-muted-foreground">
                  {steps[activeStep].code.split("\n").map((line, i) => (
                    <HighlightedLine
                      key={`${activeStep}-${i}`}
                      line={line}
                      stepIndex={activeStep}
                      lineIndex={i}
                    />
                  ))}
                </pre>
              </div>

              {/* Output */}
              <div className="border-t border-border p-4 bg-secondary/20 font-mono text-xs">
                <div className="flex items-center gap-2 text-green-500">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Ready
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}} />
    </section>
  );
}