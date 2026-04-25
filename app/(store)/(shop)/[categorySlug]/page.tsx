import { createPublicSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

// Types define karte hain taaki 'never' wala error na aaye
interface Category {
  id: string;
  name: string;
  slug: string;
}

interface SubCategory {
  id: string;
  name: string;
  slug: string;
}

type PageProps = {
  params: Promise<{ categorySlug: string }>;
};

export default async function CategoryPage({ params }: PageProps) {
  const { categorySlug } = await params;
  const supabase = createPublicSupabaseClient();

  // 1. Fetch category with explicit type casting
  const { data: categoryData, error: catError } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("slug", categorySlug)
    .single();

  const category = categoryData as Category | null;

  if (catError || !category) {
    console.error("Category Fetch Error:", catError);
    return notFound();
  }

  // 2. Fetch subcategories with explicit type casting
  const { data: subData, error: subError } = await supabase
    .from("sub_categories")
    .select("id, name, slug")
    .eq("category_id", category.id)
    .order("display_order", { ascending: true });

  const subs = (subData as SubCategory[]) || [];

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="bg-[#1a1a1a] text-white px-6 py-10 md:py-14">
        <div className="max-w-6xl mx-auto">
          <nav className="flex gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-4">
            <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white/60">{category.name}</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">
            {category.name}
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-14">
        {subs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">No Collections Found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {subs.map((sub) => (
              <Link
                key={sub.id}
                href={`/${categorySlug}/${sub.slug}`}
                className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-black/5 p-6"
              >
                <h3 className="font-black uppercase text-sm tracking-tight text-[#1a1a1a] group-hover:text-[#FF385C] transition-colors">
                  {sub.name}
                </h3>
                <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]/30">
                  Shop Now →
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}