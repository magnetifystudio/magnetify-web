import { WhatsAppIcon } from "@/components/site-icons";

const chatUrl =
  "https://wa.me/919370103844?text=Hi%20Magnetify%20Studio%2C%20I%20want%20help%20with%20a%20custom%20pack%20or%20bulk%20event%20quote.";

export function WhatsAppWidget() {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <div className="pointer-events-auto flex flex-col items-end gap-3">
        <div className="hidden max-w-[240px] rounded-2xl border border-[#25d366]/20 bg-white px-4 py-3 text-sm leading-6 text-foreground shadow-[0_18px_40px_rgba(26,26,27,0.14)] md:block">
          Need help with an order or event quote?
          <span className="block text-muted">Chat with us on WhatsApp.</span>
        </div>

        <a
          href={chatUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat on WhatsApp"
          className="group relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_18px_40px_rgba(37,211,102,0.35)] hover:-translate-y-0.5 hover:bg-[#20ba59] sm:h-16 sm:w-16"
        >
          <span className="absolute inset-0 rounded-full bg-[#25d366] opacity-30 blur-md" />
          <span className="relative flex size-10 items-center justify-center rounded-full bg-white/18 sm:size-11">
            <WhatsAppIcon className="size-[1.375rem]" />
          </span>
        </a>
      </div>
    </div>
  );
}
