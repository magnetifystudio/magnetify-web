"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

const marqueeRows = [
  {
    duration: "28s",
    items: [
      "Custom Magnets",
      "Music Magnets",
      "Premium Acrylic",
      "Made in Bangalore",
      "Gifting Moments",
      "Photo Keepsakes",
    ],
  },
  {
    duration: "34s",
    reverse: true,
    items: [
      "Wedding Favors",
      "Birthday Gifts",
      "Corporate Branding",
      "Scratch-Resistant Finish",
      "Fridge Memories",
      "Handcrafted Details",
    ],
  },
] as const;

function MarqueeTrack({
  items,
  duration,
  reverse = false,
}: {
  items: readonly string[];
  duration: string;
  reverse?: boolean;
}) {
  const repeatedItems = [...items, ...items];

  return (
    <div
      className={`parallax-marquee-track ${reverse ? "parallax-marquee-track--reverse" : ""}`}
      style={{ "--marquee-duration": duration } as CSSProperties}
    >
      {repeatedItems.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="mr-4 inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/72 px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-charcoal shadow-[0_14px_28px_rgba(26,26,27,0.08)] backdrop-blur-md sm:mr-5 sm:px-5 sm:text-base"
        >
          <span className="size-2.5 rounded-full bg-[linear-gradient(135deg,#FF1B6B_0%,#FF8C37_100%)]" />
          {item}
        </span>
      ))}
    </div>
  );
}

export function ScrollMarqueeSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0.5);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      return;
    }

    let frame = 0;

    const updateProgress = () => {
      frame = 0;

      const section = sectionRef.current;

      if (!section) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const rawProgress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
      const nextProgress = Math.min(1, Math.max(0, rawProgress));

      setProgress(nextProgress);
    };

    const queueUpdate = () => {
      if (frame !== 0) {
        return;
      }

      frame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
    };
  }, []);

  const firstRowX = -72 + progress * 144;
  const secondRowX = 72 - progress * 144;
  const firstRowY = (0.5 - progress) * 14;
  const secondRowY = (progress - 0.5) * 14;

  return (
    <section ref={sectionRef} className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="overflow-hidden rounded-[2.4rem] border border-[#efdfd3] bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(255,245,239,0.95)_52%,rgba(255,239,247,0.95)_100%)] py-8 shadow-[0_26px_70px_rgba(26,26,27,0.08)] sm:py-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-pink">
            Moving Marquee
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl tracking-[-0.05em] text-foreground sm:text-[2.8rem] sm:leading-[0.96]">
            Personalized gifting that moves with your story.
          </h2>
        </div>

        <div className="mt-7 space-y-4">
          <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
            <div
              className="will-change-transform"
              style={{
                transform: `translate3d(${firstRowX}px, ${firstRowY}px, 0)`,
              }}
            >
              <MarqueeTrack
                items={marqueeRows[0].items}
                duration={marqueeRows[0].duration}
              />
            </div>
          </div>

          <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
            <div
              className="will-change-transform"
              style={{
                transform: `translate3d(${secondRowX}px, ${secondRowY}px, 0)`,
              }}
            >
              <MarqueeTrack
                items={marqueeRows[1].items}
                duration={marqueeRows[1].duration}
                reverse
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
