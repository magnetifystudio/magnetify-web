import Link from "next/link";
import Image from "next/image";
import { HomeBannerCarousel } from "@/components/home-banner-carousel";
import { ScrollReveal } from "@/components/scroll-reveal";
import { FeaturedProductsCarousel } from "@/components/featured-products-carousel";
import { ScrollMarqueeSection } from "@/components/scroll-marquee-section";
import { OccasionsGiftingSection } from "@/components/occasions-gifting-section";
import { WhyChooseSection } from "@/components/why-choose-section";
import { FaqAccordionSection } from "@/components/faq-accordion-section";

const collections = [
  {
    key: "classic-magnets",
    href: "/shop/classic-magnets",
    image: "/custom-photo-magnets-fridge-decor-magnetify-studio.png",
    title: "Classic Magnets",
    description: "Square and round photo magnets for fridges, memory walls, and everyday gifting.",
    cta: "View Collection",
  },
  {
    key: "acrylic-collection",
    href: "/shop/acrylic-collection",
    image: "/premium-acrylic-music-blocks-and-photo-frames-desk-decor.png",
    title: "Acrylic Collection",
    description: "Premium acrylic frames and keepsakes with a polished, modern decor feel.",
    cta: "Explore Collection",
  },
  {
    key: "frames-displays",
    href: "/shop/frames-displays",
    image: "/heritage-gold-photo-grid-frame-and-premium-gift-box.png",
    title: "Frames & Displays",
    description: "Premium heritage-style frames and multi-photo display pieces made for special moments.",
    cta: "View Collection",
  },
];

const faqItems = [
  { category: "Delivery & Timings", question: "How long does it take for my order to arrive?", answer: "Standard delivery usually takes 4-5 working days after dispatch. We ship across India from our Bangalore studio." },
  { category: "Delivery & Timings", question: "Do you offer faster delivery in Bangalore?", answer: "Yes. For customers in Bangalore, we offer same-day or next-day delivery options when the order is placed before the daily cutoff time." },
  { category: "Payments & Booking", question: "What is the payment process?", answer: "To keep production fast and seamless, we follow a full advance payment model. You can pay securely during checkout by scanning our UPI or GPay QR code. Once payment is confirmed, your order moves into the design and printing phase." },
  { category: "Customization & Music Magnets", question: "How do I share my photos and song choices?", answer: "You can upload your photos directly on the product page. For Music Magnets, simply paste the Spotify or YouTube link in the provided text box. If you face any issues, you can also WhatsApp your files to us at +91 9370103844 with your Order ID." },
  { category: "Studio Pickup", question: "Can I pick up my order from the Bangalore studio?", answer: "Absolutely. If you are based in Bangalore and want to save on shipping, select the Self-Pickup option at checkout. We will notify you on WhatsApp with the exact location and timing once your order is ready for collection." },
  { category: "Events & Bulk Orders", question: "Do you handle large orders for weddings or corporate events?", answer: "Yes, we specialize in event favors. Whether it is a wedding, birthday, or corporate branding event, we offer special bulk pricing for orders above 50 units. Click the Book an Event button to chat with us for a custom quote." },
  { category: "Product Quality & Care", question: "Are the magnets durable?", answer: "Our magnets feature a premium glossy finish that is waterproof and scratch-resistant. They are designed to stick firmly to metallic surfaces like fridges and cupboards, and they can be cleaned with a damp cloth without fading the print." },
];

export default function HomePage() {
  return (
    <main className="pb-6">
      {/* Hero Banner Carousel */}
      <HomeBannerCarousel />

      {/* Collections Grid
          mobile  → 1 column (default)
          tablet  → 2 columns (md:)
          desktop → 3 columns (lg:)
      */}
      <section id="shop-all" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((col, i) => (
            <ScrollReveal key={col.key} delay={i * 90} variant="scale">
              <article className="group overflow-hidden rounded-[2rem] border border-[#e9dfd5] bg-[#f8f2e9] shadow-[0_22px_60px_rgba(26,26,27,0.08)]">
                {/* Image — shorter on mobile, taller on desktop */}
                <div className="relative aspect-[3/2] sm:aspect-[4/3] overflow-hidden">
                  <Image
                    src={col.image}
                    alt={col.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  />
                </div>
                <div className="p-5 sm:p-7 lg:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#6f8c87]">
                    Collection
                  </p>
                  <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.05em] text-foreground">
                    {col.title}
                  </h2>
                  <p className="mt-3 text-sm sm:text-base leading-7 text-muted line-clamp-3 sm:line-clamp-none">
                    {col.description}
                  </p>
                  <Link
                    href={col.href}
                    className="mt-5 sm:mt-7 inline-flex rounded-full bg-[#0e7466] px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.12em] text-white shadow-[0_16px_30px_rgba(14,116,102,0.2)] hover:-translate-y-0.5 hover:bg-charcoal transition-all"
                  >
                    {col.cta}
                  </Link>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Featured Products Carousel */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <FeaturedProductsCarousel />
      </section>

      {/* Scroll Marquee */}
      <ScrollMarqueeSection />

      {/* Why Choose Magnetify */}
      <WhyChooseSection />

      {/* Occasions & Gifting */}
      <OccasionsGiftingSection />

      {/* FAQ */}
      <FaqAccordionSection items={faqItems} className="pb-2 pt-4" showIntro={false} />
    </main>
  );
}
