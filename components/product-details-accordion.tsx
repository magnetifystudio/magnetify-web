export type ProductDetailItem = {
  label: string;
  value: string;
};

type ProductDetailsAccordionProps = {
  items: ProductDetailItem[];
  className?: string;
};

export function ProductDetailsAccordion({
  items,
  className = "",
}: ProductDetailsAccordionProps) {
  return (
    <div className={`space-y-3 ${className}`.trim()}>
      {items.map((item, index) => (
        <details
          key={`${item.label}-${index}`}
          className="group rounded-[1.4rem] border border-border bg-[#fbfbfc] px-6 py-5"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold text-foreground">
            {item.label}
            <span className="text-2xl text-muted transition-transform duration-300 group-open:rotate-45 flex-shrink-0">
              +
            </span>
          </summary>
          <p className="mt-3 pr-8 text-[15px] leading-relaxed text-muted">
            {item.value}
          </p>
        </details>
      ))}
    </div>
  );
}