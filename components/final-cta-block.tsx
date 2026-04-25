import type { SVGProps } from "react";
import Image from "next/image";
import Link from "next/link";
import { CartIcon, IndiaFlagIcon, WhatsAppIcon } from "@/components/site-icons";

function CelebrationIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M7 4.5v5m10-3v4M4.5 9h5m10-1.5h-4M8 15l2 2m6-6 2-2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
      <path
        d="M12 8.5c1.4 2 3 3.6 5 5-2 2-3.6 3.6-5 5-1.4-1.4-3-3-5-5 2-1.4 3.6-3 5-5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
  );
}

function MagnetMockup() {
  return (
    <div className="relative mx-auto h-[220px] w-full max-w-[280px] sm:h-[236px] sm:max-w-[312px]">
      <div className="absolute left-0 top-10 w-[126px] rotate-[-5deg]">
        <Image
          src="/square-photo-magnet-family-memories-magnetify-studio-v2.png"
          alt="Square photo magnet family keepsake"
          width={126}
          height={126}
          className="h-auto w-full drop-shadow-[0_20px_32px_rgba(26,26,27,0.2)]"
        />
      </div>

      <div className="absolute left-[92px] top-0 w-[138px]">
        <Image
          src="/music-magnet-scan-play-family-keepsake-magnetify-studio-v2.png"
          alt="Music magnet scan and play family keepsake"
          width={138}
          height={218}
          className="h-auto w-full drop-shadow-[0_24px_38px_rgba(26,26,27,0.24)]"
        />
      </div>

      <div className="absolute bottom-5 right-2 w-[94px] rotate-[8deg]">
        <Image
          src="/round-photo-magnet-family-memories-magnetify-studio-v2.png"
          alt="Round photo magnet family keepsake"
          width={94}
          height={94}
          className="h-auto w-full drop-shadow-[0_18px_28px_rgba(26,26,27,0.18)]"
        />
      </div>

    </div>
  );
}

export function FinalCtaBlock() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <div className="relative overflow-hidden rounded-[2.25rem] bg-[linear-gradient(135deg,#ff1b6b_0%,#ff8c37_100%)] px-5 py-6 text-white shadow-[0_32px_90px_rgba(255,27,107,0.24)] sm:rounded-[2.8rem] sm:px-8 sm:py-8 lg:px-12 lg:py-9">
        <div className="absolute -left-20 top-10 h-52 w-52 rounded-full bg-white/12 blur-3xl" />
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-[#ffd7bd]/20 blur-3xl" />

        <div className="relative flex justify-start lg:justify-end">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-charcoal/18 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.22em]">
            <IndiaFlagIcon className="size-4" />
            <span>Handcrafted in Bangalore</span>
          </div>
        </div>

        <div className="relative mt-6 grid gap-6 md:gap-8 lg:grid-cols-[270px_minmax(0,1fr)] lg:items-center xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="order-2 lg:order-1">
            <MagnetMockup />
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="text-3xl tracking-[-0.05em] sm:text-4xl lg:text-[3.45rem] lg:leading-none">
              Turn Your Memories into Art
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/88 sm:text-base lg:text-[15px] lg:leading-7">
              Ready to create your custom magnet pack or planning a big event?
              We&apos;ve got you covered.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/#packs"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold text-pink shadow-[0_20px_40px_rgba(255,255,255,0.18)] hover:-translate-y-0.5 hover:bg-[#fff6fb] sm:w-auto"
              >
                <CartIcon className="size-4" />
                <span>Shop Best Sellers</span>
              </Link>

              <Link
                href="/events-bulk"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/55 bg-transparent px-6 py-4 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto"
              >
                <CelebrationIcon className="size-4" />
                <span>Book an Event</span>
              </Link>

              <a
                href="https://wa.me/919370103844?text=Hi%20Magnetify%20Studio%2C%20I%20want%20to%20place%20an%20order."
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-charcoal px-6 py-4 text-sm font-semibold text-white shadow-[0_22px_44px_rgba(26,26,27,0.24)] hover:-translate-y-0.5 hover:bg-[#0f0f10] sm:w-auto"
              >
                <WhatsAppIcon className="size-4" />
                <span>Order via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
