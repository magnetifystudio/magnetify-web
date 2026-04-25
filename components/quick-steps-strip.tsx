import type { ComponentType, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

type QuickStep = {
  title: string;
  Icon: ComponentType<IconProps>;
};

type QuickStepsStripProps = {
  steps: QuickStep[];
};

export function QuickStepsStrip({ steps }: QuickStepsStripProps) {
  return (
    <section className="border-y border-border bg-white text-foreground shadow-[0_18px_50px_rgba(26,26,27,0.06)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-x-auto">
          <div className="flex min-w-max items-center justify-between gap-5 py-6 md:gap-7">
            {steps.map(({ title, Icon }, index) => (
              <div key={title} className="flex items-center gap-5 md:gap-7">
                <article className="flex min-w-[180px] flex-col items-center text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted">
                    Step {index + 1}
                  </p>
                  <span className="mt-3 flex size-16 items-center justify-center rounded-full border border-border bg-surface-muted text-foreground">
                    <Icon className="size-8" />
                  </span>
                  <p className="mt-4 text-lg font-semibold uppercase tracking-[0.08em] text-foreground">
                    {title}
                  </p>
                </article>

                {index < steps.length - 1 ? (
                  <span className="hidden h-px w-20 bg-border md:block lg:w-28" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
