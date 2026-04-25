import Image from "next/image";
import Link from "next/link";
import {
  FacebookIcon,
  IndiaFlagIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  PinterestIcon,
  ShieldCheckIcon,
  ThreadsIcon,
  YouTubeIcon,
} from "@/components/site-icons";

const shopLinks = [
  { href: "/create-pack", label: "Square Magnets" },
  { href: "/create-pack", label: "Round Magnets" },
  { href: "/create-pack", label: "Music Magnets", badge: "Popular" },
  { href: "/create-pack", label: "Keychains & Ornaments" },
];

const eventLinks = [
  { href: "/events-bulk", label: "Weddings & Engagements" },
  { href: "/events-bulk", label: "Corporate Events" },
  { href: "/events-bulk", label: "Birthday Bashes" },
  { href: "/events-bulk", label: "Anniversary Celebrations" },
];

const supportLinks = [
  { href: "/track-order", label: "Track Your Order" },
  { href: "/shipping-and-delivery", label: "Shipping & Delivery" },
  { href: "/terms-and-conditions", label: "Terms of Service" },
  { href: "/faqs", label: "FAQs" },
];

const trustBadges = [
  "Quality Assured",
  "Scratch-Resistant",
  "Waterproof",
];

const paymentMethods = [
  { label: "GPay", className: "bg-[#eaf2ff] text-[#1a73e8]" },
  { label: "PhonePe", className: "bg-[#f1e9ff] text-[#5f259f]" },
  { label: "UPI", className: "bg-[#fff0e6] text-[#ff8c37]" },
];

const socialLinks = [
  {
    href: "https://instagram.com/magnetify_studio",
    label: "Instagram",
    Icon: InstagramIcon,
  },
  {
    href: "https://facebook.com/MagnetifyStudio",
    label: "Facebook",
    Icon: FacebookIcon,
  },
  {
    href: "https://threads.com/@magnetify_studio",
    label: "Threads",
    Icon: ThreadsIcon,
  },
  {
    href: "https://pinterest.com/magnetifystudio",
    label: "Pinterest",
    Icon: PinterestIcon,
  },
  {
    href: "https://www.youtube.com/@MagnetifyStudio",
    label: "YouTube",
    Icon: YouTubeIcon,
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-charcoal text-pearl">
      <div className="border-b border-white/8">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-3 px-4 py-5 sm:px-6 lg:px-8">
          {trustBadges.map((badge) => (
            <div
              key={badge}
              className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/78"
            >
              <ShieldCheckIcon className="size-4 text-orange" />
              <span>{badge}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[1.05fr_1fr_1fr_1fr_1.35fr] lg:px-8">
        <div>
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-full bg-white/8 ring-1 ring-white/12">
              <Image
                src="/favicon.png"
                alt="Magnetify Studio"
                width={44}
                height={44}
                className="rounded-full"
              />
            </span>
            <div>
              <p className="text-lg font-black tracking-[0.28em] text-white">
                MAGNETIFY
              </p>
              <p className="text-[10px] uppercase tracking-[0.48em] text-white/45">
                Studio
              </p>
            </div>
          </div>

          <p className="mt-5 max-w-xs text-sm leading-7 text-white/65">
            Turning your favorite memories into premium magnetic keepsakes.
          </p>

          <div className="mt-6 flex flex-nowrap gap-2.5 overflow-x-auto pb-1">
            {socialLinks.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 rounded-full border border-white/10 bg-white/5 p-2.5 text-white/72 hover:border-pink/50 hover:text-pink"
                aria-label={label}
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-orange">
            Shop & Categories
          </p>
          <div className="mt-5 grid gap-3 text-sm text-white/70">
            {shopLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 hover:text-pink"
              >
                <span>{link.label}</span>
                {link.badge ? (
                  <span className="rounded-full bg-[#fff7d8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">
                    {link.badge}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-orange">
            Events
          </p>
          <div className="mt-5 grid gap-3 text-sm text-white/70">
            {eventLinks.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-pink">
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href="/events-bulk"
            className="mt-6 inline-flex rounded-full bg-[#25d366] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(37,211,102,0.28)] hover:-translate-y-0.5 hover:bg-[#20ba59]"
          >
            Request a Bulk Quote
          </Link>
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-orange">
            Support & Information
          </p>
          <div className="mt-5 grid gap-3 text-sm text-white/70">
            {supportLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-pink">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/62">
            4-5 working days delivery and no returns on personalized items.
          </div>
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-orange">
            Direct Contact
          </p>
          <div className="mt-5 space-y-4">
            <a
              href="mailto:magnetify.studio@gmail.com"
              className="flex items-start gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/75 hover:border-pink/40 hover:text-pink"
            >
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-orange">
                <MailIcon className="size-[1.125rem]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-white">Email</span>
                <span className="block break-all text-[12px] leading-6 sm:text-[13px]">
                  magnetify.studio@gmail.com
                </span>
              </span>
            </a>

            <div className="flex items-start gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/75">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-orange">
                <MapPinIcon className="size-[1.125rem]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-white">Our Base</span>
                <span>Bangalore, Karnataka</span>
              </span>
            </div>

            <a
              href="https://instagram.com/magnetify_studio"
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/75 hover:border-pink/40 hover:text-pink"
            >
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-orange">
                <InstagramIcon className="size-[1.125rem]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-white">Instagram</span>
                <span>@magnetify_studio</span>
              </span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/8 bg-[#141415]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 text-sm text-white/65 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>Copyright 2026 Magnetify Studio. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-2">
            {paymentMethods.map((payment) => (
              <span
                key={payment.label}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${payment.className}`}
              >
                {payment.label}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-white/72">
            <IndiaFlagIcon className="size-5" />
            <span>Proudly Made in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
