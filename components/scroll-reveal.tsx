"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  variant?: "up" | "left" | "scale";
};

const hiddenVariants: Record<NonNullable<ScrollRevealProps["variant"]>, string> = {
  up: "translate-y-8 opacity-0",
  left: "-translate-x-10 opacity-0",
  scale: "translate-y-5 scale-[0.96] opacity-0",
};

const shownVariants: Record<NonNullable<ScrollRevealProps["variant"]>, string> = {
  up: "translate-y-0 opacity-100",
  left: "translate-x-0 opacity-100",
  scale: "translate-y-0 scale-100 opacity-100",
};

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  threshold = 0.18,
  variant = "up",
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={elementRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transform-gpu transition-all duration-700 ease-out motion-reduce:transform-none motion-reduce:transition-none ${
        isVisible ? shownVariants[variant] : hiddenVariants[variant]
      } ${className}`}
    >
      {children}
    </div>
  );
}
