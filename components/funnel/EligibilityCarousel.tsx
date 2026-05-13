"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Option = { value: string; label: string; subLabel?: string };
type Question = {
  id: string;
  label: string;
  subtext?: string;
  options: Option[];
};

interface Props {
  questions: Question[];
  onComplete: (answers: Record<string, string>) => void;
  onCancel: () => void;
}

export function EligibilityCarousel({ questions, onComplete, onCancel }: Props) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const q = questions[current];
  const isLast = current === questions.length - 1;

  const goBack = useCallback(() => {
    if (current === 0) return;
    setDirection("back");
    setAnimating(true);
    setTimeout(() => { setCurrent((c) => c - 1); setAnimating(false); }, 200);
  }, [current]);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
      if (e.key === "ArrowLeft") goBack();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goBack, onCancel]);

  function select(optionValue: string) {
    const updated = { ...answers, [q.id]: optionValue };
    setAnswers(updated);

    if (isLast) {
      onComplete(updated);
      return;
    }

    setDirection("forward");
    setAnimating(true);
    setTimeout(() => { setCurrent((c) => c + 1); setAnimating(false); }, 200);
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Eligibility questions"
    >
      <div className="bg-white rounded-[var(--tm-r-xl)] shadow-[var(--tm-shadow-lg)] w-full max-w-[440px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <button
            onClick={goBack}
            disabled={current === 0}
            className={cn(
              "p-1.5 rounded-[var(--tm-r-sm)] transition-colors",
              current === 0
                ? "text-[var(--tm-ink-300)] cursor-default"
                : "text-[var(--tm-ink-700)] hover:bg-[var(--tm-ink-100)]"
            )}
            aria-label="Previous question"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Step dots */}
          <div className="flex gap-2" aria-label={`Question ${current + 1} of ${questions.length}`}>
            {questions.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === current
                    ? "w-6 bg-[var(--tm-green-500)]"
                    : i < current
                    ? "w-2 bg-[var(--tm-green-300)]"
                    : "w-2 bg-[var(--tm-ink-300)]"
                )}
              />
            ))}
          </div>

          <button
            onClick={onCancel}
            className="p-1.5 rounded-[var(--tm-r-sm)] text-[var(--tm-ink-500)] hover:text-[var(--tm-ink-900)] hover:bg-[var(--tm-ink-100)] transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Question */}
        <div
          className={cn(
            "px-6 pb-6 transition-all duration-200",
            animating && direction === "forward" && "opacity-0 translate-y-2",
            animating && direction === "back" && "opacity-0 -translate-y-2"
          )}
        >
          <p className="text-xs font-semibold text-[var(--tm-green-700)] uppercase tracking-wide mb-1">
            {current + 1} / {questions.length}
          </p>
          <h2
            className="text-xl font-bold text-[var(--tm-ink-900)] mb-1"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            {q.label}
          </h2>
          {q.subtext && (
            <p className="text-xs italic text-[var(--tm-ink-500)] mb-5">{q.subtext}</p>
          )}
          {!q.subtext && <div className="mb-5" />}

          <div className="flex flex-col gap-3">
            {q.options.map((opt) => {
              const selected = answers[q.id] === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => select(opt.value)}
                  className={cn(
                    "w-full text-left px-4 py-4 rounded-[var(--tm-r-lg)] border-2 font-semibold text-sm transition-all duration-150",
                    selected
                      ? "bg-[var(--tm-green-50)] border-[var(--tm-green-500)] text-[var(--tm-green-700)]"
                      : "bg-white border-[var(--tm-ink-300)] text-[var(--tm-ink-700)] hover:border-[var(--tm-green-300)] hover:bg-[var(--tm-green-50)]"
                  )}
                  aria-pressed={selected}
                >
                  <span className="block">{opt.label}</span>
                  {opt.subLabel && (
                    <span className="text-xs font-normal text-[var(--tm-ink-500)] mt-0.5 block">
                      {opt.subLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
