"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function ProductRatingDisplay({ productId }: { productId: string }) {
  const supabase = createClient();
  const [avg, setAvg] = useState<number | null>(null);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    supabase
      .from("product_reviews")
      .select("rating")
      .eq("product_id", productId)
      .then(({ data }: { data: { rating: number }[] | null }) => {
        if (!data || data.length === 0) return;
        const total = data.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0);
        setAvg(parseFloat((total / data.length).toFixed(1)));
        setCount(data.length);
      });
  }, [productId]);

  if (count === 0) {
    return (
      <div className="flex items-center gap-3 pt-4 border-t border-black/5">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <svg key={i} width="18" height="18" viewBox="0 0 14 14" fill="#FF385C">
              <path d="M7 1l1.5 4H13l-3.5 2.5L11 12 7 9.5 3 12l1.5-4.5L1 5h4.5z" />
            </svg>
          ))}
        </div>
        <span className="text-[15px] font-bold text-[#1a1a1a]">4.9/5</span>
        <span className="text-[14px] text-[#1a1a1a]/35 font-medium">
          120+ Happy Customers
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 pt-4 border-t border-black/5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            width="18"
            height="18"
            viewBox="0 0 14 14"
            fill={i <= Math.round(avg!) ? "#FF385C" : "#e5e7eb"}
          >
            <path d="M7 1l1.5 4H13l-3.5 2.5L11 12 7 9.5 3 12l1.5-4.5L1 5h4.5z" />
          </svg>
        ))}
      </div>
      <span className="text-[15px] font-bold text-[#1a1a1a]">{avg}/5</span>
      <span className="text-[14px] text-[#1a1a1a]/35 font-medium">
        {count}+ Happy Customers
      </span>
    </div>
  );
}