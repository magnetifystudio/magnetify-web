import type { SVGProps } from "react";
import { ScrollReveal } from "@/components/scroll-reveal";

function CameraIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M4.5 8.5A2.5 2.5 0 0 1 7 6h1.3l1.2-1.8c.3-.4.7-.7 1.2-.7h2.6c.5 0 .9.3 1.2.7L16.7 6H18a2.5 2.5 0 0 1 2.5 2.5V17A2.5 2.5 0 0 1 18 19.5H7A2.5 2.5 0 0 1 4.5 17V8.5Z"
        strokeWidth={1.8}
      />
      <circle cx="12" cy="12.5" r="3.5" strokeWidth={1.8} />
    </svg>
  );
}

function SparkleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="m12 3 1.7 4.8L18.5 9.5l-4.8 1.7L12 16l-1.7-4.8L5.5 9.5l4.8-1.7L12 3ZM18.5 16l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2ZM5.5 15l1 2.8 2.8 1-2.8 1-1 2.8-1-2.8-2.8-1 2.8-1 1-2.8Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.6}
      />
    </svg>
  );
}

function FlagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M6 4v16" strokeLinecap="round" strokeWidth={1.8} />
      <path
        d="M7 5.5h10.5l-1.5 2.8L17.5 11H7V5.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
      <path
        d="M10.5 8.2h3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.4}
      />
    </svg>
  );
}

const steps = [
  {
    step: "Step 1",
    title: "Custom Design",
    description: "Personalized touches for every order.",
    Icon: CameraIcon,
  },
  {
    step: "Step 2",
    title: "Premium Finish",
    description: "High-gloss, scratch-resistant quality.",
    Icon: SparkleIcon,
  },
  {
    step: "Step 3",
    title: "Made in India",
    description: "Crafted with pride, delivered with care.",
    Icon: FlagIcon,
  },
] as const;

export function WhyChooseSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[2.5rem] border border-border bg-white p-6 shadow-[0_22px_60px_rgba(26,26,27,0.07)] sm:p-8 lg:p-10">
        <ScrollReveal variant="up" className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-pink">
            Why Choose Magnetify?
          </p>
        </ScrollReveal>

        <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-center">
          {steps.map((step, index) => (
            <div key={step.title} className="contents">
              <ScrollReveal
                variant="scale"
                delay={index * 120}
                className="flex-1"
              >
                <div className="rounded-[1.8rem] border border-border bg-surface-muted/55 px-5 py-6 text-center sm:px-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                    {step.step}
                  </p>
                  <div className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#ff1b6b_0%,#ff8c37_100%)] text-white shadow-[0_16px_30px_rgba(255,27,107,0.18)]">
                    <step.Icon className="size-7" />
                  </div>
                  <h3 className="mt-4 text-2xl tracking-[-0.03em] text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>

              {index < steps.length - 1 ? (
                <div className="hidden h-px w-20 bg-[linear-gradient(90deg,#ff1b6b_0%,#ff8c37_100%)] lg:block xl:w-28" />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
