import { createPublicSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Product } from "@/types/product";
import ProductGallery from "./_components/ProductGallery";
import AddToCartSection from "./_components/AddToCartSection";
import { ProductDetailsAccordion } from "@/components/product-details-accordion";
import { ProductRatingDisplay } from "@/components/product-rating-display";

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const ICON_PATHS = [
  "M12 3.5 5.5 6v5.3c0 4.2 2.7 8 6.5 9.2 3.8-1.2 6.5-5 6.5-9.2V6L12 3.5Z M9.3 12.2l1.8 1.8 3.8-4",
  "M12 3l1.7 4.8L18.5 9.5l-4.8 1.7L12 16l-1.7-4.8L5.5 9.5l4.8-1.7L12 3Z",
  "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z",
  "M13 2 4.5 13.5H12L11 22l8.5-11.5H12L13 2Z",
  "M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8l-6.2 3.3L7 14.2 2 9.3l6.9-1L12 2Z",
  "M5.5 11.5h13v6a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-6Z M4.5 11.5h15 M7 10.5V8.8c0-.8.7-1.5 1.5-1.5S10 8 10 8.8c0 .5.2.9.6 1.2.6.5 1.4.5 2 0 .4-.3.6-.7.6-1.2 0-.8.7-1.5 1.5-1.5S16 8 16 8.8v1.7",
];

function PointIcon({ index }: { index: number }) {
  const path = ICON_PATHS[index % ICON_PATHS.length];
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      {path.split(" M").map((d, i) => (
        <path key={i} d={i === 0 ? d : "M" + d} />
      ))}
    </svg>
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createPublicSupabaseClient();

  const { data, error } = await supabase
    .from("magnetify_products")
    .select("*")
    .eq("slug", decodeURIComponent(slug))
    .single();

  if (error || !data) {
    console.error(error);
    return notFound();
  }

  const product = data as unknown as Product;

  const { data: subCat } = await supabase
    .from("sub_categories")
    .select("id, name, slug, category_id")
    .eq("id", product.sub_category_id)
    .single() as { data: SubCategory | null };

  const { data: cat } = subCat
    ? (await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("id", subCat.category_id)
        .single()) as { data: Category | null }
    : { data: null as Category | null };

  const allImages = [product.main_image, ...(product.extra_images || [])].filter(Boolean);
  const isSingle = product.listing_type === "single" || !product.listing_type;
  const sets = product.product_sets || [];
  const variations = product.variations || [];

  return (
    <div className="min-h-screen bg-[#F7F4F0]">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-14">

        {/* BREADCRUMB */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[#1a1a1a]/30 sm:mb-8 lg:mb-10">
          <Link href="/" className="hover:text-[#FF385C] transition-colors">Home</Link>
          {cat && (<><span>/</span><Link href={`/${cat.slug}`} className="hover:text-[#FF385C] transition-colors">{cat.name}</Link></>)}
          {subCat && (<><span>/</span><Link href={`/${cat?.slug}/${subCat.slug}`} className="hover:text-[#FF385C] transition-colors">{subCat.name}</Link></>)}
          <span>/</span>
          <span className="text-[#1a1a1a]/50">{product.title_name}</span>
        </nav>

        {/* ── HERO: 3 columns ── */}
        <div className="mb-8 grid grid-cols-1 items-start gap-5 md:grid-cols-2 xl:mb-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_360px] xl:gap-7">

          {/* COL 1 — Gallery */}
          <div className="bg-white rounded-[2rem] border border-black/6 shadow-[0_24px_70px_rgba(26,26,27,0.08)] overflow-hidden">
            <ProductGallery images={allImages} title={product.title_name} />
          </div>

          {/* COL 2 — Title + Why Buy */}
          <div className="flex flex-col gap-6">

            {/* Title card */}
            <div className="rounded-[2rem] border border-black/6 bg-white p-5 shadow-[0_24px_70px_rgba(26,26,27,0.08)] sm:p-6 lg:p-8">
              {subCat && (
                <div className="inline-flex items-center gap-2 bg-[#FF385C]/8 border border-[#FF385C]/15 rounded-full px-4 py-2 mb-5">
                  <div className="w-2 h-2 rounded-full bg-[#FF385C]" />
                  <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#FF385C]">{subCat.name}</span>
                </div>
              )}
              <h1 className="mb-4 text-[24px] font-bold leading-[1.2] tracking-tight text-[#1a1a1a] sm:text-[28px] lg:text-[32px]">
                {product.title_name}
              </h1>
              {product.short_description?.trim() && (
                <p className="mb-5 text-[15px] font-medium leading-relaxed text-[#1a1a1a]/50 sm:text-[16px]">
                  {product.short_description}
                </p>
              )}
              
              {/* Rating Display Component */}
              <ProductRatingDisplay productId={product.id} />
            </div>

            {/* Why Buy card */}
            {product.why_buy_points && product.why_buy_points.length > 0 && (
              <div className="rounded-[2rem] border border-black/6 bg-white p-5 shadow-[0_24px_70px_rgba(26,26,27,0.08)] sm:p-6 lg:p-8">
                <div className="inline-flex items-center gap-2 bg-[#FF385C]/8 border border-[#FF385C]/15 rounded-full px-4 py-2 mb-5">
                  <div className="w-2 h-2 rounded-full bg-[#FF385C]" />
                  <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#FF385C]">Why Buy</span>
                </div>
                <div className="space-y-1">
                  {product.why_buy_points.map((item: any, i: number) => (
                    <div key={i} className="flex gap-4 items-start px-4 py-3 rounded-2xl hover:bg-[#FFF5F7] transition-colors duration-200">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-[12px] font-black"
                        style={{ background: 'linear-gradient(135deg,#ff1b6b,#ff8c37)', boxShadow: '0 4px 14px rgba(255,27,107,0.3)' }}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-[#1a1a1a] leading-tight">{item.title}</p>
                        {item.description && (
                          <p className="text-[13px] text-[#1a1a1a]/45 font-medium mt-1 leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* COL 3 — Cart card */}
          <div className="md:col-span-2 xl:col-span-1 xl:sticky xl:top-24">
            <div className="rounded-[2rem] border border-black/6 bg-white p-5 shadow-[0_24px_70px_rgba(26,26,27,0.08)] sm:p-6 lg:p-7">

              {/* In Stock */}
              <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-4 py-3 mb-6">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[11px] font-black">✓</span>
                </div>
                <div>
                  <p className="text-[13px] font-black text-green-700">In Stock & Ready to Ship</p>
                  <p className="text-[12px] text-green-600/70">Delivered in 4–5 business days</p>
                </div>
              </div>

              <AddToCartSection
                isSingle={isSingle}
                price={product.price}
                comparePrice={product.compare_price}
                sets={sets}
                variations={variations}
                variationType={product.variation_type}
                productId={product.id}
                productTitle={product.title_name}
                productSlug={product.slug}
                photoCount={product.photo_count || 1}
              />

              {/* Trust badges */}
              <div className="mt-6 pt-5 border-t border-black/5 grid grid-cols-3 gap-3">
                {[
                  { icon: "🚚", label: "4-5 Day\nDelivery" },
                  { icon: "💎", label: "Premium\nQuality" },
                  { icon: "🔒", label: "Secure\nPayment" },
                ].map((b) => (
                  <div key={b.label} className="bg-[#F7F4F0] rounded-xl py-3 px-2 text-center border border-black/5">
                    <div className="text-2xl mb-1.5">{b.icon}</div>
                    <p className="text-[10px] font-bold text-[#1a1a1a]/45 uppercase tracking-wide leading-tight whitespace-pre-line">{b.label}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

        {/* ── BOTTOM: Special Story + Product Details ── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-7">

          {product.special_story && (product.special_story.title || product.special_story.description) && (
            <div className="rounded-[2rem] border border-black/6 bg-white p-5 shadow-[0_24px_70px_rgba(26,26,27,0.08)] sm:p-6 lg:p-10">
              <div className="inline-flex items-center gap-2 bg-[#FF385C]/8 border border-[#FF385C]/15 rounded-full px-4 py-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-[#FF385C]" />
                <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#FF385C]">Why Magnetify Studio?</span>
              </div>
              <h2 className="text-[26px] md:text-[28px] font-bold text-[#1a1a1a] tracking-tight leading-snug mb-3">
                {product.special_story.title}
              </h2>
              {product.special_story.description && (
                <p className="text-[15px] text-[#1a1a1a]/45 leading-relaxed mb-7">
                  {product.special_story.description}
                </p>
              )}
              {product.special_story.points && product.special_story.points.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {product.special_story.points.filter((p: any) => p.title).map((point: any, i: number) => (
                    <div key={i} className="bg-[#F7F4F0] rounded-[1.4rem] p-5 border border-black/5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-default">
                      <div className="w-13 h-13 rounded-2xl flex items-center justify-center mb-4 text-white"
                        style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg,#ff1b6b 0%,#ff8c37 100%)', boxShadow: '0 8px 22px rgba(255,27,107,0.28)' }}>
                        <PointIcon index={i} />
                      </div>
                      <p className="text-[15px] font-bold text-[#1a1a1a] mb-1.5 leading-tight">{point.title}</p>
                      {point.desc && (
                        <p className="text-[13px] text-[#1a1a1a]/40 leading-relaxed">{point.desc}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {product.product_details && product.product_details.length > 0 && (
            <div className="rounded-[2rem] border border-black/6 bg-white p-5 shadow-[0_24px_70px_rgba(26,26,27,0.08)] sm:p-6 lg:p-10">
              <div className="inline-flex items-center gap-2 bg-[#FF385C]/8 border border-[#FF385C]/15 rounded-full px-4 py-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-[#FF385C]" />
                <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#FF385C]">Product Details</span>
              </div>
              <h3 className="text-[26px] md:text-[28px] font-bold text-[#1a1a1a] mb-2 leading-snug">
                Quick details before you order.
              </h3>
              <p className="text-[15px] text-[#1a1a1a]/40 mb-7 leading-relaxed">Everything you need to know.</p>
              <ProductDetailsAccordion items={product.product_details} />
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
