"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  description: string;
  display_order: number;
};

type ProductSet = {
  size: string;
  label: string;
  price: number;
  stock?: number;
};

type Product = {
  id: string;
  title_name: string;
  slug: string;
  main_image: string;
  short_description: string;
  listing_type: string;
  variation_type: string | null;
  product_sets: ProductSet[];
  price: number;
  category_id: string;
  sub_category_id: string;
  is_active: boolean;
};

export function CreatePackCatalog() {
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (data && data.length > 0) {
        setCategories(data);
        setActiveCategoryId(data[0].id);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!activeCategoryId) return;

    const fetchProducts = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("magnetify_products")
        .select("*")
        .eq("category_id", activeCategoryId)
        .eq("is_active", true)
        .eq("show_in_pack", true)
        .order("display_order", { ascending: true });

      setProducts(data || []);
      setLoading(false);
    };

    fetchProducts();
  }, [activeCategoryId]);

  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  return (
    <section className="rounded-[2rem] border border-border bg-white p-6 shadow-[0_24px_70px_rgba(26,26,27,0.08)] sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">

        {/* ── Left Sidebar ── */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-pink">
            Custom Selection
          </p>
          <h1 className="mt-4 text-4xl tracking-[-0.05em] text-foreground sm:text-5xl">
            Create your pack with the right format.
          </h1>
          <p className="mt-4 text-base leading-8 text-muted sm:text-lg">
            Browse by category, compare products, and add your favorites.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {categories.map((category) => {
              const isActive = category.id === activeCategoryId;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategoryId(category.id)}
                  className={`rounded-[1.4rem] border px-5 py-4 text-left transition ${
                    isActive
                      ? "border-pink bg-[#fff3f8] shadow-[0_12px_30px_rgba(255,27,107,0.08)]"
                      : "border-border bg-surface-muted hover:border-orange/30 hover:bg-white"
                  }`}
                >
                  <p className="text-lg font-semibold text-foreground">
                    {category.name}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {isActive && !loading ? `${products.length} Items` : ""}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right Content ── */}
        <div className="space-y-6">

          {/* Category hero panel */}
          {activeCategory && (
            <div className="grid gap-6 rounded-[1.85rem] border border-border bg-surface-muted p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold">
                  {activeCategory.name}
                </p>
                <h2 className="mt-3 text-3xl tracking-[-0.04em] text-foreground sm:text-4xl">
                  {activeCategory.description || activeCategory.name}
                </h2>
              </div>
              {activeCategory.image_url && (
                <div className="relative overflow-hidden rounded-[1.7rem] border border-border bg-white">
                  <div className="relative aspect-[4/3]">
                    <Image src={activeCategory.image_url} alt={activeCategory.name} fill className="object-cover" sizes="280px" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cards grid */}
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-72 animate-pulse rounded-[1.6rem] border border-border bg-surface-muted" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[1.6rem] border border-border bg-surface-muted p-12 text-center">
              <p className="text-base text-muted italic">No products added yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => {
                const isVariation = product.listing_type === "variation";
                
                // Get starting price for variations
                const startingPrice = isVariation && product.product_sets?.length > 0 
                  ? Math.min(...product.product_sets.map(s => s.price))
                  : product.price;

                return (
                  <article key={product.id} className="flex h-full flex-col rounded-[1.6rem] border border-border bg-white p-5 hover:shadow-lg transition-all group">
                    {/* Image */}
                    <div className="relative overflow-hidden rounded-[1.25rem] border border-border bg-surface-muted">
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={product.main_image || "/placeholder.png"}
                          alt={product.title_name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="mt-4 flex flex-1 flex-col">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gold">
                           Classic Format
                        </p>
                        {isVariation && (
                           <span className="text-[9px] bg-pink/10 text-pink px-2 py-0.5 rounded-full font-bold">
                             {product.product_sets.length} Variations
                           </span>
                        )}
                      </div>

                      <h3 className="mt-2 text-xl font-bold tracking-[-0.03em] text-foreground leading-snug">
                        {product.title_name}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-muted line-clamp-2">
                        {product.short_description || "Customizable photo magnets for your fridge and memory walls."}
                      </p>

                      <div className="mt-auto pt-4">
                        <p className="text-2xl font-black text-foreground">
                          {isVariation ? `From Rs. ${startingPrice}` : `Rs. ${product.price}`}
                        </p>
                        {isVariation && (
                          <p className="text-[10px] text-pink font-bold mt-1 uppercase italic">
                            * Tap to see all pack sizes
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Button */}
                    <div className="mt-5">
                      <Link
                        href={`/products/${product.slug}`}
                        className="inline-flex w-full items-center justify-center rounded-full bg-pink px-5 py-3 text-sm font-black text-white shadow-[0_10px_20px_rgba(255,27,107,0.15)] transition hover:bg-black"
                      >
                        {isVariation ? "View Variations" : "View Product"}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}