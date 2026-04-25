"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";
import ProductForm from "../_components/ProductForm";

export default function EditProductPage() {
  const params = useParams();
  const categorySlug = params.categorySlug as string;
  const subCategorySlug = params.subCategoryId as string; // URL se slug aa raha hai
  const productId = params.productId as string;

  const supabase = createClient();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("magnetify_products")
          .select("*")
          .eq("id", productId)
          .single();

        if (fetchError) {
          console.error("Supabase Error:", fetchError);
          setError(fetchError.message);
        } else {
          setProduct(data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId, supabase]);

  if (loading) return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin text-[#FF1B6B] mx-auto mb-4" size={32} />
        <p className="text-white/40 text-xs font-black uppercase tracking-widest">Loading Product Data...</p>
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="text-center bg-[#1C1C1E] p-8 rounded-2xl border border-[#2A2A2A] max-w-sm w-full">
        <AlertCircle className="text-[#FF1B6B] mx-auto mb-4" size={48} />
        <h2 className="text-white font-bold mb-2 font-black uppercase text-xs tracking-widest">Product Not Found</h2>
        <p className="text-white/50 text-[10px] mb-6 leading-relaxed">
          {error || "The product you are trying to edit could not be retrieved from the database."}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-[#FF1B6B] w-full py-3 rounded-full text-[10px] font-bold uppercase text-white shadow-lg shadow-[#FF1B6B]/20"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );

  return (
    <ProductForm
      mode="edit"
      listingType={product.listing_type || "single"}
      categorySlug={categorySlug}
      subCategorySlug={subCategorySlug}
      // Yahan hum database wali real IDs bhej rahe hain taaki save query fail na ho
      subCategoryId={product.sub_category_id}
      categoryId={product.category_id}
      productId={productId}
      initialData={product}
    />
  );
}