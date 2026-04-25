const policies = [
  {
    title: "Customized products",
    detail: "Because every order is made from customer-provided photos, returns and refunds are not available once production starts.",
  },
  {
    title: "Delivery charge",
    detail: "A flat ₹49 delivery charge applies per order unless a future offer states otherwise.",
  },
  {
    title: "Advance payment",
    detail: "Orders move into verification only after 50% advance payment is received and the transaction proof is submitted.",
  },
  {
    title: "Production window",
    detail: "Tracking details are typically shared within 4-5 days after payment verification, depending on production load.",
  },
];

export default function TermsAndConditionsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-border bg-white p-8 shadow-[0_30px_70px_rgba(26,26,27,0.08)]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
          <div>
            <h1 className="text-4xl tracking-[-0.04em] text-foreground sm:text-5xl">
              Terms & conditions
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted sm:text-lg">
              Please review these points before placing a custom order.
            </p>
          </div>
          <div className="rounded-[1.75rem] bg-charcoal p-6 text-pearl">
            <p className="text-2xl font-semibold tracking-[-0.03em]">
              Order policies
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {policies.map((policy) => (
          <section
            key={policy.title}
            className="rounded-[2rem] border border-border bg-white p-8 shadow-[0_24px_70px_rgba(26,26,27,0.08)]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-pink">
              {policy.title}
            </p>
            <p className="mt-4 text-base leading-8 text-muted">{policy.detail}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
