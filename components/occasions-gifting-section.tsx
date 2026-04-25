import type { SVGProps } from "react";
import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/scroll-reveal";

const occasionCards = [
  {
    eyebrow: "Birthdays & Celebrations",
    title: "The Ultimate Return Gift",
    description:
      "Ditch the chocolates. Give your guests a memory they can keep on their fridge forever.",
    cta: "Shop Birthday Packs",
    href: "/shop/classic-magnets",
    image: "/birthday-photo-frame-gift-box-magnetify-studio.png",
    icon: "cake" as const,
  },
  {
    eyebrow: "Anniversaries & Romance",
    title: "Your Story, In a Song",
    description:
      "Celebrate your milestones with Music Magnets. Scan, play, and relive your favorite moments.",
    cta: "Create a Romantic Set",
    href: "/shop/music-magnets#round-music-magnet",
    image: "/wedding-music-magnets-keepsake-magnetify-studio.png",
    icon: "ring" as const,
  },
  {
    eyebrow: "Corporate Branding",
    title: "Brand Visibility That Sticks",
    description:
      "Perfect for employee appreciation, client gifts, or event souvenirs that stay in sight.",
    cta: "Get Corporate Quote",
    href: "https://wa.me/919370103844?text=Hi%20Magnetify%2C%20I'm%20interested%20in%20a%20corporate%20gifting%20quote%20in%20Bangalore.",
    image: "/corporate-acrylic-photo-gift-desk-setup-magnetify-studio.png",
    icon: "briefcase" as const,
  },
] as const;

function CakeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M7 10.5V8.8c0-.8.7-1.5 1.5-1.5S10 8 10 8.8c0 .5.2.9.6 1.2.6.5 1.4.5 2 0 .4-.3.6-.7.6-1.2 0-.8.7-1.5 1.5-1.5S16 8 16 8.8v1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
      <path
        d="M5.5 11.5h13v6a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-6Z"
        strokeWidth={1.8}
      />
      <path
        d="M4.5 11.5h15"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
  );
}

function RingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="14" r="5.5" strokeWidth={1.8} />
      <path
        d="M12 3.5 15 8H9l3-4.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
  );
}

function BriefcaseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect x="4" y="7" width="16" height="11" rx="2.5" strokeWidth={1.8} />
      <path
        d="M9 7V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8V7M4 12h16"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
  );
}

function OccasionIcon({
  icon,
  className,
}: {
  icon: (typeof occasionCards)[number]["icon"];
  className?: string;
}) {
  if (icon === "cake") {
    return <CakeIcon className={className} />;
  }

  if (icon === "ring") {
    return <RingIcon className={className} />;
  }

  return <BriefcaseIcon className={className} />;
}

export function OccasionsGiftingSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <ScrollReveal variant="up">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-pink">
            Occasions & Gifting
          </p>
          <h2 className="mt-3 text-3xl tracking-[-0.05em] text-foreground sm:text-4xl lg:text-5xl">
            Gifts for Every Milestone.
          </h2>
        </ScrollReveal>
        <ScrollReveal
          variant="up"
          delay={120}
          className="max-w-2xl text-sm leading-7 text-muted sm:text-base sm:leading-8"
        >
          This section helps visitors quickly see where Magnetify fits into birthdays,
          anniversaries, and brand gifting without needing to imagine the use case themselves.
        </ScrollReveal>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {occasionCards.map((card, index) => {
          const isExternal = card.href.startsWith("https://");

          const content = (
            <article className="group overflow-hidden rounded-[2.2rem] border border-border bg-white shadow-[0_22px_60px_rgba(26,26,27,0.08)] transition-transform duration-300 hover:-translate-y-1">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,26,27,0.02)_0%,rgba(26,26,27,0.2)_100%)]" />
                <div className="absolute left-4 top-4 inline-flex max-w-[calc(100%-2rem)] flex-wrap items-center gap-2 rounded-full bg-white/88 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-charcoal shadow-[0_10px_24px_rgba(26,26,27,0.08)] sm:left-5 sm:top-5 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.24em]">
                  <OccasionIcon icon={card.icon} className="size-4 text-pink" />
                  <span>{card.eyebrow}</span>
                </div>
              </div>

              <div className="p-6 sm:p-7">
                <h3 className="text-2xl tracking-[-0.04em] text-foreground sm:text-3xl">
                  {card.title}
                </h3>
                <p className="mt-4 min-h-0 text-sm leading-7 text-muted sm:min-h-[7rem] sm:text-base sm:leading-8">
                  {card.description}
                </p>
                <span className="mt-5 inline-flex rounded-full bg-pink px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(255,27,107,0.18)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:bg-orange sm:px-5 sm:py-3">
                  {card.cta}
                </span>
              </div>
            </article>
          );

          return isExternal ? (
            <ScrollReveal
              key={card.title}
              variant="scale"
              delay={index * 110}
            >
              <a
                href={card.href}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                {content}
              </a>
            </ScrollReveal>
          ) : (
            <ScrollReveal
              key={card.title}
              variant="scale"
              delay={index * 110}
            >
              <Link href={card.href} className="block">
                {content}
              </Link>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
