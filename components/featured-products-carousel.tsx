import { createPublicSupabaseClient } from "@/lib/supabase/server";
import { FeaturedProductsCarouselClient } from "./featured-products-carousel-client";

type FeaturedProduct = {
  id: string;
  title_name: string;
  price: number;
  main_image: string;
  slug: string;
  display_order: number;
};

export async function FeaturedProductsCarousel() {
  const supabase = createPublicSupabaseClient();

  const { data: featuredItems } = await supabase
    .from("featured_items")
    .select(`
      display_order,
      product_id,
      magnetify_products (
        id,
        title_name,
        price,
        main_image,
        slug
      )
    `)
    .eq("is_active", true)
    .order("display_order");

  const products: FeaturedProduct[] = (featuredItems || [])
    .map((item: any) => ({
      ...item.magnetify_products,
      display_order: item.display_order,
    }))
    .filter(Boolean);

  if (products.length === 0) return null;

  return <FeaturedProductsCarouselClient products={products} />;
}