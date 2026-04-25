"use client";

import { useState } from "react";
import Link from "next/link";
import type { FaqItem } from "@/lib/faqs";

function FaqToggleIcon({ open }: { open: boolean }) {
  return (
    <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-muted text-charcoal">
      <span className="absolute h-0.5 w-3.5 rounded-full bg-current" />
      {!open ? <span className="absolute h-3.5 w-0.5 rounded-full bg-current" /> : null}
    </span>
  );
}

export function FaqAccordionSection({
  items,
  eyebrow = "Frequently Asked Questions",
  title = "Everything customers usually ask before placing a custom order.",
  description = "Use this section to remove hesitation around delivery, payment, customization, pickup, bulk orders, and long-term product quality.",
  contactHref = "/contact",
  className = "",
  showIntro = true,
}: {
  items: readonly FaqItem[];
  eyebrow?: string;
  title?: string;
  description?: string;
  contactHref?: string;
  className?: string;
  showIntro?: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number>(-1);

  return (
    <section className={`mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 ${className}`}>
      <div className={showIntro ? "grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8" : ""}>
        {showIntro ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-pink sm:text-sm">
              {eyebrow}
            </p>
            <h2 className="mt-3 max-w-xl text-3xl tracking-[-0.05em] text-foreground sm:text-4xl lg:text-[3.15rem] lg:leading-[0.98]">
              {title}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted sm:text-base">
              {description}
            </p>

            <div className="mt-6 rounded-[1.75rem] border border-border bg-white p-5 shadow-[0_18px_45px_rgba(26,26,27,0.07)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
                Quick Notes
              </p>
              <div className="mt-3 grid gap-2.5">
                <div className="rounded-[1.15rem] bg-surface-muted px-4 py-2.5 text-sm text-muted">
                  Bangalore dispatch with India-wide delivery support.
                </div>
                <div className="rounded-[1.15rem] bg-surface-muted px-4 py-2.5 text-sm text-muted">
                  Full advance payment keeps design and printing faster.
                </div>
                <div className="rounded-[1.15rem] bg-surface-muted px-4 py-2.5 text-sm text-muted">
                  Special bulk pricing available on 50+ unit event orders.
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-muted">
                Questions still not covered?{" "}
                <Link href={contactHref} className="font-semibold text-pink hover:text-orange">
                  Contact Us
                </Link>
              </p>
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          {items.map((item, index) => {
            const isOpen = index === openIndex;

            return (
              <article
                key={item.question}
                className={`rounded-[1.75rem] border bg-white p-4 shadow-[0_14px_34px_rgba(26,26,27,0.05)] transition-colors sm:p-5 ${
                  isOpen ? "border-pink/20" : "border-border"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-start gap-3 text-left"
                  aria-expanded={isOpen}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold sm:text-xs">
                      {item.category}
                    </p>
                    <h3 className="mt-2 text-lg leading-snug tracking-[-0.03em] text-foreground sm:text-[1.55rem]">
                      {item.question}
                    </h3>
                  </div>
                  <FaqToggleIcon open={isOpen} />
                </button>

                {isOpen ? (
                  <p className="mt-4 max-w-3xl pr-2 text-sm leading-7 text-muted sm:text-base">
                    {item.answer}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
