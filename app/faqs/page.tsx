import { FaqAccordionSection } from "@/components/faq-accordion-section";
import { faqs } from "@/lib/faqs";

export default function FaqsPage() {
  return (
    <main>
      <FaqAccordionSection
        items={faqs}
        showIntro={false}
      />
    </main>
  );
}
