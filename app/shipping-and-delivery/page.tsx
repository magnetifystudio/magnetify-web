const deliveryPoints = [
  "Orders generally move to tracking update within 4-5 working days after payment verification.",
  "A flat delivery charge of Rs. 49 applies unless a promotional offer overrides it.",
  "Because products are personalized, the team verifies payment and artwork details before dispatch.",
];

export default function ShippingAndDeliveryPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-border bg-white p-8 shadow-[0_30px_70px_rgba(26,26,27,0.08)]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
          <div>
            <h1 className="text-4xl tracking-[-0.04em] text-foreground sm:text-5xl">
              Shipping and delivery
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted sm:text-lg">
              Here is what to expect after placing your order, including delivery
              timing, shipping charges, and dispatch updates.
            </p>
          </div>
          <div className="rounded-[1.75rem] bg-charcoal p-6 text-pearl">
            <p className="text-2xl font-semibold tracking-[-0.03em]">
              4-5 working days
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {deliveryPoints.map((point, index) => (
          <section
            key={point}
            className={`rounded-[2rem] border p-8 shadow-[0_24px_70px_rgba(26,26,27,0.08)] ${
              index === 1 ? "border-pink/25 bg-[#fff3f8]" : "border-border bg-white"
            }`}
          >
            <p className="text-base leading-8 text-muted">{point}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
