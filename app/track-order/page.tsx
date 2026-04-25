"use client";

import { useState } from "react";

const TIMELINE_STEPS = [
  {
    statuses: ["pending"],
    label: "Order Received",
    desc: "Your order has been placed. We're verifying your payment.",
    icon: "📦",
  },
  {
    statuses: ["confirmed"],
    label: "Payment Confirmed",
    desc: "Payment verified! Your magnets are now being prepared.",
    icon: "✅",
  },
  {
    statuses: ["unshipped"],
    label: "Ready to Ship",
    desc: "Your order is packed and ready for dispatch.",
    icon: "🎁",
  },
  {
    // ✅ handles both "sent" (new) and "shipped" (legacy)
    statuses: ["sent", "shipped"],
    label: "Shipped",
    desc: "Your order is on its way! Track it using the link below.",
    icon: "🚚",
  },
];

// ✅ Maps ANY status value → step index (0-3)
function getStepIndex(status: string): number {
  for (let i = 0; i < TIMELINE_STEPS.length; i++) {
    if (TIMELINE_STEPS[i].statuses.includes(status)) return i;
  }
  return 0; // default to first step if unknown
}

export default function TrackOrderPage() {
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchQuery: query.trim() }),
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Tracking error:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleTrack();
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="rounded-[2rem] border border-border bg-white p-8 shadow-[0_30px_70px_rgba(26,26,26,0.08)]">
        <h1 className="text-4xl tracking-[-0.04em] text-foreground sm:text-5xl font-bold">
          Track your order
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted sm:text-lg">
          Enter the order ID or mobile number shared with you after confirmation to check the latest update.
        </p>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main column */}
        <div className="space-y-6">

          {/* Input */}
          <section className="rounded-[2rem] border border-border bg-white p-8 shadow-[0_24px_70px_rgba(26,26,26,0.05)]">
            <label className="text-sm font-medium text-foreground">
              Order ID or Mobile Number
            </label>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="#MAG1001 or 9876543210"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full rounded-full border border-border bg-surface-muted px-5 py-4 text-sm text-black focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                type="button"
                onClick={handleTrack}
                disabled={loading}
                className="rounded-full bg-pink-500 px-8 py-4 text-sm font-semibold text-white hover:bg-orange-500 transition-colors disabled:opacity-50"
              >
                {loading ? "Checking..." : "Check Status"}
              </button>
            </div>
          </section>

          {/* Not found */}
          {searched && !loading && orders.length === 0 && (
            <div className="rounded-[2rem] border border-border bg-white p-8 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-semibold text-foreground">No orders found</p>
              <p className="text-sm text-muted mt-2">
                Double-check your order ID or mobile number and try again.
              </p>
            </div>
          )}

          {/* Order cards */}
          {orders.map((order) => {
            const currentStepIndex = getStepIndex(order.status);
            const isShipped = order.status === "sent" || order.status === "shipped";

            // ✅ Use stored full URL directly — no {id} replacement needed
            const trackingLink = order.courier_tracking_url || null;

            return (
              <div
                key={order.order_id}
                className="rounded-[2rem] border border-border bg-white p-8 shadow-[0_24px_70px_rgba(26,26,26,0.05)]"
              >
                {/* Order header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <p className="text-2xl font-bold tracking-[-0.03em] text-foreground">
                      Order #{order.order_id}
                    </p>
                    <p className="text-sm text-muted mt-1">
                      Placed on{" "}
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <StatusPill status={order.status} />
                </div>

                {/* ✅ Tracking card — only shown when shipped/sent */}
                {isShipped && (
                  <div className="mt-5 rounded-2xl border border-pink-200 bg-pink-50 overflow-hidden">
                    {/* Tracking info row */}
                    <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">🚚</span>
                        <div>
                          <p className="text-[10px] font-bold text-pink-500 tracking-widest uppercase">
                            Tracking ID
                          </p>
                          <p className="text-base font-bold text-foreground mt-0.5 font-mono">
                            {order.tracking_id || "—"}
                          </p>
                          {order.courier_name && (
                            <p className="text-xs text-muted mt-0.5">
                              via {order.courier_name}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* ✅ Track button — opens courier website */}
                      {trackingLink ? (
                        <a
                          href={trackingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm px-6 py-3 transition-colors whitespace-nowrap"
                        >
                          Track Package →
                        </a>
                      ) : (
                        <span className="text-xs text-muted italic">
                          Tracking link not available yet
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* ✅ Dynamic Timeline */}
                <div className="mt-8 space-y-0">
                  {TIMELINE_STEPS.map((step, i) => {
                    const isDone = i <= currentStepIndex;
                    const isCurrent = i === currentStepIndex;
                    const isLast = i === TIMELINE_STEPS.length - 1;

                    return (
                      <div key={i} className="flex gap-4">
                        {/* Dot + connector line */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`h-9 w-9 rounded-full flex items-center justify-center text-base flex-shrink-0 transition-all duration-300 ${
                              isCurrent
                                ? "bg-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.45)]"
                                : isDone
                                ? "bg-pink-100"
                                : "bg-gray-100"
                            }`}
                          >
                            {isCurrent ? (
                              <span className="text-base">{step.icon}</span>
                            ) : isDone ? (
                              <span className="text-pink-500 text-sm font-black">✓</span>
                            ) : (
                              <span className="text-gray-300 text-sm font-bold">{i + 1}</span>
                            )}
                          </div>
                          {!isLast && (
                            <div
                              className={`w-0.5 flex-1 my-1 min-h-[2.5rem] transition-all duration-300 ${
                                i < currentStepIndex ? "bg-pink-300" : "bg-gray-100"
                              }`}
                            />
                          )}
                        </div>

                        {/* Step text */}
                        <div className={`pb-7 ${isLast ? "pb-0" : ""}`}>
                          <div className="flex items-center gap-2 mt-1">
                            <p
                              className={`font-semibold text-sm transition-colors ${
                                isCurrent
                                  ? "text-pink-500"
                                  : isDone
                                  ? "text-foreground"
                                  : "text-gray-300"
                              }`}
                            >
                              {step.label}
                            </p>
                            {isCurrent && (
                              <span className="text-[10px] font-bold bg-pink-100 text-pink-500 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                Current
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-sm mt-0.5 leading-6 transition-colors ${
                              isDone ? "text-muted" : "text-gray-300"
                            }`}
                          >
                            {/* ✅ Shipped step — custom message with courier name */}
                            {step.statuses.includes("sent") && isShipped && order.courier_name
                              ? `Shipped via ${order.courier_name}. Click "Track Package" above to check live status.`
                              : step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Help */}
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted leading-7">
                    Need help?{" "}
                    <a
                      href="https://wa.me/917988258189"
                      target="_blank"
                      rel="noreferrer"
                      className="text-pink-500 font-semibold hover:underline"
                    >
                      WhatsApp us →
                    </a>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="rounded-[2rem] border border-border bg-white p-8 shadow-sm sticky top-8">
            <h3 className="font-bold text-foreground mb-6">How it works</h3>
            <ul className="space-y-5">
              {TIMELINE_STEPS.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="h-8 w-8 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center text-base flex-shrink-0">
                    {step.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{step.label}</p>
                    <p className="text-xs text-muted mt-0.5 leading-5">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-muted leading-5">
                Orders are typically shipped within{" "}
                <strong className="text-foreground">4–5 business days</strong> of payment
                confirmation.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

// ── Status Pill ───────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; classes: string }> = {
    pending: {
      label: "Payment Pending",
      classes: "bg-yellow-50 text-yellow-600 border-yellow-200",
    },
    confirmed: {
      label: "In Production",
      classes: "bg-purple-50 text-purple-600 border-purple-200",
    },
    unshipped: {
      label: "Ready to Ship",
      classes: "bg-orange-50 text-orange-600 border-orange-200",
    },
    // ✅ both "sent" and "shipped" show green Shipped pill
    sent: {
      label: "Shipped ✓",
      classes: "bg-green-50 text-green-600 border-green-200",
    },
    shipped: {
      label: "Shipped ✓",
      classes: "bg-green-50 text-green-600 border-green-200",
    },
  };

  const config = map[status] ?? {
    label: status,
    classes: "bg-gray-50 text-gray-600 border-gray-200",
  };

  return (
    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${config.classes}`}>
      {config.label}
    </span>
  );
}
