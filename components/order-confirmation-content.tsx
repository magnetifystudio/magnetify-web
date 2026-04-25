"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "@/components/cart-provider";
import { FeedbackPopup } from "@/components/feedback-popup";

type OrderConfirmationContentProps = {
  customer?: string;
  orderId?: string;
  transactionId?: string;
  amount?: string;
};

export function OrderConfirmationContent({
  customer,
  orderId,
  transactionId,
  amount,
}: OrderConfirmationContentProps) {
  const { clearCart } = useCart();
  const hasClearedCart = useRef(false);

  const safeOrderId = orderId ?? "MAG000000";
  const safeCustomer = customer ?? "Customer";
  const safeTransactionId = transactionId ?? "Pending";
  const safeAmount = amount ?? "Rs. 0";

  useEffect(() => {
    if (hasClearedCart.current) {
      return;
    }

    clearCart();
    hasClearedCart.current = true;
  }, [clearCart]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-border bg-white p-8 shadow-[0_24px_70px_rgba(26,26,27,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-pink">
          Order confirmed
        </p>
        <h1 className="mt-4 text-4xl tracking-[-0.04em] text-foreground sm:text-5xl">
          Thanks, {safeCustomer}. Your payment details have been submitted.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted sm:text-lg">
          We have shared your order details with Magnetify Studio. Keep your
          order ID handy for future tracking and support.
        </p>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-[2rem] border border-border bg-white p-8 shadow-[0_24px_70px_rgba(26,26,27,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-pink">
            Order ID
          </p>
          <p className="mt-4 text-5xl font-semibold tracking-[-0.05em] text-foreground">
            #{safeOrderId}
          </p>
          <p className="mt-4 text-base leading-7 text-muted">
            Share this ID whenever you message the studio about this order.
          </p>
        </section>

        <section className="rounded-[2rem] border border-border bg-white p-8 shadow-[0_24px_70px_rgba(26,26,27,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-pink">
            Payment details
          </p>
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                Transaction ID
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                {safeTransactionId}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                Amount paid
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                {safeAmount}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-border bg-charcoal p-8 text-pearl shadow-[0_24px_70px_rgba(26,26,27,0.15)]">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange">
            What happens next
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-white/75">
            <li>The payment proof is checked by the team.</li>
            <li>Your product details move into production after verification.</li>
            <li>Tracking updates will be shared on WhatsApp in 4-5 working days.</li>
          </ul>
        </section>

        <section className="rounded-[2rem] border border-border bg-white p-8 shadow-[0_24px_70px_rgba(26,26,27,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-pink">
            Keep shopping
          </p>
          <p className="mt-4 text-base leading-7 text-muted">
            Want to keep browsing or create another custom gift? You can jump
            back into the catalog or build your next order right away.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/create-pack"
              className="inline-flex rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground hover:border-pink/40 hover:text-pink"
            >
              Create Another Pack
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-full bg-pink px-5 py-3 text-sm font-semibold text-white hover:bg-orange"
            >
              Continue Shopping
            </Link>
            <Link
              href="/track-order"
              className="inline-flex rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground hover:border-pink/40 hover:text-pink"
            >
              Track Order
            </Link>
          </div>
        </section>
      </div>

      {/* Added Feedback Popup */}
      <FeedbackPopup 
        orderId={safeOrderId} 
        customerName={safeCustomer} 
      />
    </main>
  );
}