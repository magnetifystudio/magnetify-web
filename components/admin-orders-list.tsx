"use client";

import { useMemo, useState, useTransition } from "react";

type AdminOrderItem = {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  mobileNumber: string;
  totalAmount: number;
  transactionId: string;
  shippingAddress: string;
  createdAt: string;
  paymentProofUrl: string | null;
  lineItems: string[];
};

type AdminOrdersListProps = {
  initialOrders: AdminOrderItem[];
};

function formatRupees(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

export function AdminOrdersList({ initialOrders }: AdminOrdersListProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [statusMessage, setStatusMessage] = useState("");
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [pendingActionLabel, setPendingActionLabel] = useState("");
  const [isPending, startTransition] = useTransition();

  const hasOrders = useMemo(() => orders.length > 0, [orders]);

  const runAction = (orderId: string, action: "verify" | "reject") => {
    setStatusMessage("");
    setPendingActionId(orderId);
    setPendingActionLabel(action === "verify" ? "Verifying..." : "Rejecting...");

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}/${action}`, {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Could not update the order.");
        }

        const payload = (await response.json()) as { message?: string };

        setOrders((currentOrders) =>
          currentOrders.filter((order) => order.orderId !== orderId),
        );
        setStatusMessage(
          payload.message ??
            (action === "verify"
              ? "Payment verified successfully."
              : "Payment marked as failed."),
        );
      } catch {
        setStatusMessage(
          action === "verify"
            ? "Payment could not be verified right now. Please try again."
            : "Payment could not be rejected right now. Please try again.",
        );
      } finally {
        setPendingActionId(null);
        setPendingActionLabel("");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl tracking-[-0.04em] text-foreground sm:text-5xl">
            Orders awaiting verification
          </h1>
          <p className="mt-3 text-base leading-8 text-muted">
            Review the payment reference, screenshot proof, and order total before
            moving the order into production.
          </p>
        </div>

        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="inline-flex rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground hover:border-pink/40 hover:text-pink"
          >
            Logout
          </button>
        </form>
      </div>

      {statusMessage ? (
        <div className="rounded-[1.5rem] border border-border bg-white px-4 py-3 text-sm text-foreground shadow-[0_12px_32px_rgba(26,26,27,0.04)]">
          {statusMessage}
        </div>
      ) : null}

      {!hasOrders ? (
        <section className="rounded-[2rem] border border-border bg-white p-8 text-center shadow-[0_24px_70px_rgba(26,26,27,0.08)]">
          <h2 className="text-3xl tracking-[-0.04em] text-foreground">
            No orders are waiting right now.
          </h2>
          <p className="mt-4 text-base leading-8 text-muted">
            New payment proofs will appear here as soon as customers submit them.
          </p>
        </section>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => {
            const isBusy = isPending && pendingActionId === order.orderId;

            return (
              <article
                key={order.id}
                className="rounded-[2rem] border border-border bg-white p-6 shadow-[0_24px_70px_rgba(26,26,27,0.08)]"
              >
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pink">
                          {order.orderId}
                        </p>
                        <h2 className="mt-3 text-3xl tracking-[-0.04em] text-foreground">
                          {order.customerName}
                        </h2>
                        <p className="mt-2 text-sm leading-7 text-muted">
                          {order.customerEmail} | {order.mobileNumber}
                        </p>
                      </div>

                      <div className="rounded-full border border-orange/20 bg-[#fff7ef] px-4 py-2 text-sm font-semibold text-foreground">
                        {formatRupees(order.totalAmount)}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-[1.5rem] border border-border bg-surface-muted p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                          Transaction ID
                        </p>
                        <p className="mt-3 text-xl font-semibold tracking-[-0.03em] text-foreground">
                          {order.transactionId}
                        </p>
                      </div>

                      <div className="rounded-[1.5rem] border border-border bg-surface-muted p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                          Shipping address
                        </p>
                        <p className="mt-3 text-sm leading-7 text-foreground">
                          {order.shippingAddress}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-border bg-surface-muted p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                        Order items
                      </p>
                      <ul className="mt-4 space-y-2 text-sm leading-7 text-foreground">
                        {order.lineItems.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => runAction(order.orderId, "verify")}
                        className="inline-flex min-w-[12rem] items-center justify-center rounded-full bg-pink px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(255,27,107,0.28)] hover:-translate-y-0.5 hover:bg-orange disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isBusy && pendingActionLabel === "Verifying..."
                          ? pendingActionLabel
                          : "Verify & Confirm"}
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => runAction(order.orderId, "reject")}
                        className="inline-flex min-w-[12rem] items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground hover:border-pink/40 hover:text-pink disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isBusy && pendingActionLabel === "Rejecting..."
                          ? pendingActionLabel
                          : "Reject Payment"}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-border bg-[#fff8f3] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                      Payment screenshot
                    </p>
                    <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-border bg-white">
                      {order.paymentProofUrl ? (
                        <div className="aspect-[4/5] w-full">
                          {/* Signed admin previews use direct storage URLs. */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={order.paymentProofUrl}
                            alt={`Payment proof for ${order.orderId}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-[4/5] items-center justify-center px-6 text-center text-sm text-muted">
                          Signed preview is unavailable right now.
                        </div>
                      )}
                    </div>
                    <p className="mt-4 text-xs uppercase tracking-[0.22em] text-muted">
                      Submitted {new Date(order.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
