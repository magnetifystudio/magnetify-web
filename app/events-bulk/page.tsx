import Link from "next/link";

const eventCategories = [
  {
    title: "Weddings",
    detail:
      "Save-the-date magnets, wedding favors, welcome hampers, and guest-table keepsakes designed to feel premium.",
  },
  {
    title: "Corporate",
    detail:
      "Logo magnets, employee appreciation gifts, branded welcome kits, and event booth giveaways for marketing teams.",
  },
  {
    title: "Birthdays",
    detail:
      "Personalized return gifts for kids and adults, designed to keep the celebration memorable after the event ends.",
  },
  {
    title: "Anniversaries",
    detail:
      "Curated magnet packs for milestone celebrations, intimate dinner giveaways, and premium couple-story gifting.",
  },
];

const eventBenefits = [
  "Bulk discount pricing for larger quantities",
  "Premium packaging guidance for event presentation",
  "Fast turnaround planning based on deadline and quantity",
  "Design coordination for names, dates, logos, and themes",
];

const quoteTiers = [
  {
    title: "50+ Units",
    detail: "Best for intimate wedding functions, premium return gifts, and focused brand gifting.",
  },
  {
    title: "100+ Units",
    detail: "Recommended when packaging, multiple designs, or mixed magnet types are required.",
  },
  {
    title: "200+ Units",
    detail: "Ideal for large-scale celebrations, corporate events, and multi-day gifting programs.",
  },
];

export default function EventsBulkPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-border bg-white p-8 shadow-[0_30px_70px_rgba(26,26,27,0.08)]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
          <div>
            <h1 className="text-4xl tracking-[-0.04em] text-foreground sm:text-5xl">
              Custom photo magnets for weddings, birthdays, and corporate events.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted sm:text-lg">
              Create memorable event favors, branded keepsakes, and premium gifting
              packs that guests actually keep on display.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://wa.me/919370103844?text=Hi%20Magnetify%20Studio%2C%20I%20need%20a%20bulk%20quote%20for%20my%20event."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#25d366] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,211,102,0.28)] hover:-translate-y-0.5 hover:bg-[#20ba59]"
              >
                Get Bulk Quote on WhatsApp
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-gold/30 bg-white px-6 py-3.5 text-sm font-semibold text-gold hover:border-orange/40 hover:text-orange"
              >
                Contact for Details
              </Link>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-charcoal p-6 text-pearl">
            <p className="text-2xl font-semibold tracking-[-0.03em]">
              Bulk quotes for 50+ units
            </p>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Ideal for wedding giveaways, event favors, branded welcome kits,
              and premium gifting packs.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[2rem] border border-border bg-white p-8 shadow-[0_24px_70px_rgba(26,26,27,0.08)]">
          <h2 className="text-4xl tracking-[-0.04em] text-foreground">
            Events we cover
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted">
            From intimate celebrations to large corporate orders, we create
            keepsakes that feel personal, premium, and gifting-ready.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {eventCategories.map((category) => (
              <article
                key={category.title}
                className="rounded-[1.75rem] border border-border bg-surface-muted p-6"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pink">
                  {category.title}
                </p>
                <p className="mt-4 text-base leading-8 text-muted">
                  {category.detail}
                </p>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-gold/25 bg-[linear-gradient(180deg,#fff8e4_0%,#ffffff_100%)] p-8 shadow-[0_24px_70px_rgba(212,175,55,0.16)]">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
            Why choose Magnetify Studio
          </h2>
          <div className="mt-6 space-y-4">
            {eventBenefits.map((benefit) => (
              <div
                key={benefit}
                className="rounded-[1.4rem] border border-gold/15 bg-white px-4 py-4 text-sm leading-7 text-muted"
              >
                {benefit}
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="mt-8 rounded-[2.25rem] border border-border bg-charcoal p-8 text-pearl shadow-[0_24px_70px_rgba(26,26,27,0.14)] sm:p-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-4xl tracking-[-0.04em] text-white sm:text-5xl">
              Bulk order sizes
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-white/65">
            Share the closest quantity range and we will recommend the best
            format, packaging, and quote for your event.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {quoteTiers.map((tier) => (
            <article
              key={tier.title}
              className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange">
                {tier.title}
              </p>
              <p className="mt-4 text-base leading-8 text-white/72">{tier.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-[2.25rem] border border-gold/25 bg-[linear-gradient(135deg,#fff8e4_0%,#ffffff_60%,#fff2f7_100%)] p-8 shadow-[0_24px_70px_rgba(212,175,55,0.12)] sm:p-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-end">
          <div>
            <h2 className="text-4xl tracking-[-0.04em] text-foreground sm:text-5xl">
              Tell us your event size, date, and gifting idea.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted">
              Tell us the occasion, quantity, preferred magnet type, and timeline.
              We will guide you on the best format for bulk gifting and packaging.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://wa.me/919370103844?text=Hi%20Magnetify%20Studio%2C%20I%20need%20a%20bulk%20quote%20for%20my%20event."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#25d366] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,211,102,0.28)] hover:-translate-y-0.5 hover:bg-[#20ba59]"
              >
                Get Bulk Quote on WhatsApp
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-gold/30 bg-white px-6 py-3.5 text-sm font-semibold text-gold hover:border-orange/40 hover:text-orange"
              >
                Contact for Details
              </Link>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_18px_40px_rgba(26,26,27,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-pink">
              Share these details
            </p>
            <div className="mt-4 space-y-3 text-sm text-muted">
              <p>Event type: Wedding / Corporate / Birthday / Anniversary</p>
              <p>Quantity: 50+ / 100+ / 200+</p>
              <p>Need-by date: Mention delivery timeline clearly</p>
              <p>Magnet style: Square / Round / Music / Mixed gifting pack</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
