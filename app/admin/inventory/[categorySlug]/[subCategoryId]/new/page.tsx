"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Layers, Box, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import ProductForm from "../_components/ProductForm";

export default function NewProductPage() {
  const params = useParams();
  const categorySlug = params.categorySlug as string;
  const subCategorySlug = params.subCategoryId as string;

  const [step, setStep] = useState<"choose" | "form">("choose");
  const [listingType, setListingType] = useState<"single" | "variation" | null>(null);
  
  // ✅ Actual UUIDs store karenge
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [resolving, setResolving] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const resolveIds = async () => {
      // Category UUID fetch karo slug se
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .single();

      // SubCategory UUID fetch karo slug se
      const { data: sub } = await supabase
        .from("sub_categories")
        .select("id")
        .eq("slug", subCategorySlug)
        .single();

      if (cat) setCategoryId(cat.id);
      if (sub) setSubCategoryId(sub.id);
      setResolving(false);
    };

    resolveIds();
  }, [categorySlug, subCategorySlug]);

  if (resolving) return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <p className="text-white/30 text-xs font-black uppercase tracking-widest animate-pulse">Loading...</p>
    </div>
  );

  if (step === "form" && listingType) {
    return (
      <ProductForm
        mode="add"
        listingType={listingType}
        categorySlug={categorySlug}
        subCategorySlug={subCategorySlug}
        subCategoryId={subCategoryId}   // ✅ actual UUID
        categoryId={categoryId}          // ✅ actual UUID
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-16">
          <p className="text-[#FF1B6B] text-[10px] font-black uppercase tracking-[0.4em] mb-4">New Product</p>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white leading-none">Listing Type</h1>
          <p className="text-white/30 text-sm mt-4 font-medium">
            Pehle batao — yeh product single hai ya variations mein aata hai?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => { setListingType("single"); setStep("form"); }}
            className="group bg-[#1C1C1E] border-2 border-[#2A2A2A] hover:border-[#FF1B6B] rounded-3xl p-8 text-left transition-all duration-300 hover:bg-[#FF1B6B]/5"
          >
            <div className="bg-[#FF1B6B]/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#FF1B6B]/20 transition-colors">
              <Box size={28} className="text-[#FF1B6B]" />
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-3">Single Listing</h2>
            <p className="text-white/40 text-xs font-medium leading-relaxed mb-6">
              Ek price, ek stock. Jaise ek specific magnet set jo sirf ek type mein aata hai.
            </p>
            <div className="flex items-center gap-2 text-[#FF1B6B] text-[10px] font-black uppercase tracking-widest">
              Select <ChevronRight size={14} />
            </div>
          </button>

          <button
            onClick={() => { setListingType("variation"); setStep("form"); }}
            className="group bg-[#1C1C1E] border-2 border-[#2A2A2A] hover:border-[#D4AF37] rounded-3xl p-8 text-left transition-all duration-300 hover:bg-[#D4AF37]/5"
          >
            <div className="bg-[#D4AF37]/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#D4AF37]/20 transition-colors">
              <Layers size={28} className="text-[#D4AF37]" />
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-3">Variation Listing</h2>
            <p className="text-white/40 text-xs font-medium leading-relaxed mb-6">
              Multiple options — Color, Size, Material, Set size — har variation ka alag price aur stock.
            </p>
            <div className="flex items-center gap-2 text-[#D4AF37] text-[10px] font-black uppercase tracking-widest">
              Select <ChevronRight size={14} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
