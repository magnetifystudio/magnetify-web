"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";

type AddToCartButtonProps = {
  item: {
    id: string;
    title: string;
    variantLabel?: string;
    price: number;
    priceLabel: string;
    imageSrc: string;
    imageAlt: string;
    href?: string;
  };
  className: string;
  children: ReactNode;
};

export function AddToCartButton({
  item,
  className,
  children,
}: AddToCartButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    // variantLabel se 'set size' extract karne ka logic
    // Example: "2 x 2 IN" se '2' nikalega
    const setMatch = item.variantLabel?.match(/(\d+)\s*x\s*\d+/i);
    const setSize = setMatch ? parseInt(setMatch[1]) : 1;

    // Query parameters build karna
    const queryParams = new URLSearchParams({
      id: item.id,
      title: item.title,
      price: item.price.toString(),
      priceLabel: item.priceLabel,
      set: setSize.toString(),
      label: item.variantLabel || "",
      image: item.imageSrc,
      slug: item.id, // Aapne slug ke liye id use ki hai
    });

    router.push(`/upload-photos?${queryParams.toString()}`);
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}