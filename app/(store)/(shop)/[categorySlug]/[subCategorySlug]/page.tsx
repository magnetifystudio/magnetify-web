import { createPublicSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OfferTimer } from "./_components/OfferTimer";

// ── Offer type ──
interface SpecialOffer {
  id: string;
  discount_type: "percentage" | "flat" | "bogo";
  discount_value: number;
  expiry_at: string | null;
  show_timer: boolean;
  timer_color: string;
  timer_size: "small" | "medium" | "large";
  target_category_id: string | null;
  target_sub_category_id: string | null;
  target_product_id: string | null;
}

export default async function Page({
  params,
}: {
  params: Promise<{ categorySlug: string; subCategorySlug: string }>;
}) {
  const { categorySlug, subCategorySlug } = await params;
  const supabase = createPublicSupabaseClient();

  // 1. Sub-category fetch
  const { data: subCategoryRaw } = await supabase
    .from("sub_categories")
    .select("*")
    .eq("slug", subCategorySlug)
    .single();

  if (!subCategoryRaw) notFound();
  const subCategory = subCategoryRaw as any;

  // 2. Parent category fetch
  const { data: categoryRaw } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", categorySlug)
    .single();
  const category = categoryRaw as any;

  // 3. Products fetch
  const { data: products } = await supabase
    .from("magnetify_products")
    .select("*")
    .eq("sub_category_id", subCategory.id)
    .in("status", ["Active", "Featured"])
    .eq("listing_type", "single")
    .order("display_order", { ascending: true });

  const prods = products || [];

  // ── 4. Active Special Offers fetch ──
  const now = new Date().toISOString();
  const { data: offersRaw } = await supabase
    .from("special_offers")
    .select("*")
    .eq("is_active", true)
    .or(`expiry_at.is.null,expiry_at.gt.${now}`);

  const offers = (offersRaw || []) as SpecialOffer[];

  // ── Offer matching logic ──
  const getOfferForProduct = (productId: string): SpecialOffer | null => {
    // Level 3: Specific product match
    const productOffer = offers.find(o => o.target_product_id === productId);
    if (productOffer) return productOffer;

    // Level 2: SubCategory match
    const subCatOffer = offers.find(o =>
      o.target_sub_category_id === subCategory.id && !o.target_product_id
    );
    if (subCatOffer) return subCatOffer;

    // Level 1: Category match
    const catOffer = offers.find(o =>
      o.target_category_id === category?.id &&
      !o.target_sub_category_id &&
      !o.target_product_id
    );
    if (catOffer) return catOffer;

    // Level 0: All products offer
    const globalOffer = offers.find(o =>
      !o.target_category_id &&
      !o.target_sub_category_id &&
      !o.target_product_id
    );
    return globalOffer || null;
  };

  // ── Price calculation ──
  const getDiscountedPrice = (originalPrice: number, offer: SpecialOffer) => {
    if (offer.discount_type === "percentage") {
      return Math.round(originalPrice * (1 - offer.discount_value / 100));
    }
    if (offer.discount_type === "flat") {
      return Math.max(0, originalPrice - offer.discount_value);
    }
    return originalPrice;
  };

  const getDiscountLabel = (originalPrice: number, offer: SpecialOffer) => {
    if (offer.discount_type === "percentage") return `${offer.discount_value}% OFF`;
    if (offer.discount_type === "flat") return `₹${offer.discount_value} OFF`;
    return "BUY 1 GET 1";
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* HERO STRIP */}
      <div className="bg-[#1a1a1a] text-white px-6 py-10 md:py-14">
        <div className="max-w-6xl mx-auto">
          <nav className="flex gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-4">
            <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
            <span>/</span>
            {category && (
              <>
                <Link href={`/${categorySlug}`} className="hover:text-white/60 transition-colors">
                  {category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-white/60">{subCategory.name}</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">
            {subCategory.name}
          </h1>
          {subCategory.description && (
            <p className="mt-3 text-white/40 text-sm md:text-base max-w-xl font-medium">
              {subCategory.description}
            </p>
          )}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-[11px] font-black uppercase tracking-widest text-white/20 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              {prods.length} {prods.length === 1 ? "Product" : "Products"}
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-white/20 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              Handcrafted in Bangalore
            </span>
          </div>
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-14">
        {prods.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[#1a1a1a]/30 font-black uppercase text-sm tracking-widest">
              No products available yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {prods.map((p: any, idx: number) => {
              const offer = getOfferForProduct(p.id);
              const originalPrice = p.price;
              const finalPrice = offer ? getDiscountedPrice(originalPrice, offer) : originalPrice;
              const comparePrice = offer ? originalPrice : p.compare_price;
              const discountLabel = offer
                ? getDiscountLabel(originalPrice, offer)
                : p.compare_price
                  ? `${Math.round((1 - p.price / p.compare_price) * 100)}% OFF`
                  : null;

              return (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="group block"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-black/5">
                    {/* Image */}
                    <div className="relative aspect-square bg-[#f5f5f5] overflow-hidden">
                      {p.main_image ? (
                        <img
                          src={p.main_image}
                          alt={p.title_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[#1a1a1a]/15 text-xs font-black uppercase tracking-widest">No Image</span>
                        </div>
                      )}

                      {discountLabel && (
                        <div
                          className="absolute top-3 left-3 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: offer?.timer_color || "#FF385C" }}
                        >
                          {discountLabel}
                        </div>
                      )}

                      {offer && (
                        <div className="absolute top-3 right-3 bg-black/60 text-white text-[9px] font-black uppercase px-2 py-1 rounded-full tracking-wider">
                          Limited
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3 md:p-4">
                      <h3 className="text-[12px] md:text-[13px] font-black uppercase tracking-tight text-[#1a1a1a] leading-tight line-clamp-2 group-hover:text-[#FF385C] transition-colors">
                        {p.title_name}
                      </h3>

                      {p.short_description && (
                        <span className="inline-block mt-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FF385C]/10 text-[#FF385C] border border-[#FF385C]/20">
                          {p.short_description}
                        </span>
                      )}

                      {/* Price */}
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {offer?.discount_type === "bogo" ? (
                          <span className="text-sm font-black text-[#FF385C]">
                            BUY 1 GET 1 🎁
                          </span>
                        ) : (
                          <>
                            <span className="text-sm md:text-base font-black text-[#1a1a1a]">
                              ₹{finalPrice}
                            </span>
                            {comparePrice && comparePrice !== finalPrice && (
                              <span className="text-[11px] text-[#1a1a1a]/30 line-through font-medium">
                                ₹{comparePrice}
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {/* ── Countdown Timer (Imported from _components) ── */}
                      {offer?.show_timer && offer.expiry_at && (
                        <OfferTimer
                          expiryAt={offer.expiry_at}
                          color={offer.timer_color}
                          size={offer.timer_size}
                        />
                      )}

                      <div className="mt-3 w-full bg-[#1a1a1a] group-hover:bg-[#FF385C] text-white text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl text-center transition-colors duration-200">
                        Customize Now →
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}