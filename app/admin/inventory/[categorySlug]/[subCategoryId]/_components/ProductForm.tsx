"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  ChevronLeft, Plus, Trash2, Upload, X,
  Image as ImageIcon, Star, CheckCircle2, Loader2
} from "lucide-react";

const supabase = createClient();

interface ProductFormProps {
  mode: "add" | "edit";
  listingType: "single" | "variation";
  categorySlug: string;
  subCategorySlug: string;
  subCategoryId: string;
  categoryId: string;
  productId?: string;
  initialData?: any;
}

const VARIATION_TYPES = [
  { value: "size", label: "Size", placeholder: "e.g. Small, Medium, Large" },
  { value: "color", label: "Color", placeholder: "e.g. Red, Blue, Black" },
  { value: "set", label: "Set", placeholder: "e.g. Set of 1, Set of 4, Set of 6" },
  { value: "material", label: "Material", placeholder: "e.g. Matte, Glossy, Wood" },
  { value: "custom", label: "Custom", placeholder: "e.g. Any custom option" },
];

const emptyVariation = { label: "", price: "", compare_price: "", stock: "" };
const emptySet = { size: "", price: "", compare_price: "", label: "", stock: "" };

const emptyForm = {
  title_name: "",
  short_description: "",
  main_image: "",
  extra_images: Array(5).fill("") as string[],
  why_buy_points: [{ title: "", description: "" }],
  product_sets: [{ size: "", price: "", compare_price: "", label: "", stock: "" }],
  product_details: [{ label: "Material", value: "Premium epoxy-coated steel" }],
  special_story: {
    title: "Built for gifting, made to stay on display.",
    description: "",
    points: Array(4).fill({ title: "", desc: "" }),
  },
  variation_type: "",
  variations: [{ ...emptyVariation }],
  price: "",
  compare_price: "",
  stock: "",
  status: "Active",
  photo_count: 1, // ← ADDED
};

type FormData = typeof emptyForm;

export default function ProductForm({
  mode, listingType, categorySlug, subCategorySlug,
  subCategoryId, categoryId, productId, initialData
}: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("CRAFTSMANSHIP");
  const [uploading, setUploading] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>(() => {
    if (mode === "edit" && initialData) {
      return {
        ...emptyForm,
        ...initialData,
        price: initialData.price ?? "",
        compare_price: initialData.compare_price ?? "",
        stock: initialData.stock ?? "",
        photo_count: initialData.photo_count ?? 1, // ← ADDED
        extra_images: initialData.extra_images?.length
          ? [...initialData.extra_images, ...Array(5).fill("")].slice(0, 5)
          : Array(5).fill(""),
        why_buy_points: initialData.why_buy_points?.length
          ? initialData.why_buy_points
          : emptyForm.why_buy_points,
        product_sets: initialData.product_sets?.length
          ? initialData.product_sets.map((s: any) => ({
              ...s,
              size: s.size ?? "",
              label: s.label ?? "",
              price: s.price ?? "",
              compare_price: s.compare_price ?? "",
              stock: s.stock ?? "",
            }))
          : emptyForm.product_sets,
        product_details: initialData.product_details?.length
          ? initialData.product_details
          : emptyForm.product_details,
        special_story: initialData.special_story || emptyForm.special_story,
        variations: initialData.variations?.length
          ? initialData.variations.map((v: any) => ({
              ...v,
              label: v.label ?? "",
              price: v.price ?? "",
              compare_price: v.compare_price ?? "",
              stock: v.stock ?? "",
            }))
          : emptyForm.variations,
        variation_type: initialData.variation_type ?? "",
      };
    }
    return emptyForm;
  });

  const handleUpload = async (file: File, target: "main" | number) => {
    try {
      setUploading(target.toString());
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const { error: uploadError } = await supabase.storage.from("products").upload(`products/${fileName}`, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("products").getPublicUrl(`products/${fileName}`);
      if (target === "main") {
        setFormData((prev: FormData) => ({ ...prev, main_image: data.publicUrl }));
      } else {
        const newEx = [...formData.extra_images];
        newEx[target as number] = data.publicUrl;
        setFormData((prev: FormData) => ({ ...prev, extra_images: newEx }));
      }
    } catch { alert("Upload failed!"); }
    finally { setUploading(null); }
  };

  const handleDeleteImage = (target: "main" | number) => {
    if (target === "main") {
      setFormData((prev: FormData) => ({ ...prev, main_image: "" }));
    } else {
      const newEx = [...formData.extra_images];
      newEx[target as number] = "";
      setFormData((prev: FormData) => ({ ...prev, extra_images: newEx }));
    }
  };

  const handlePublish = async () => {
    if (!formData.title_name) return alert("Product Name is required!");
    if (!formData.main_image) return alert("Hero Image is required!");
    if (listingType === "variation" && !formData.variation_type) return alert("Variation type select karo!");

    setLoading(true);
    try {
      const slug = formData.title_name.toLowerCase().trim()
        .replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "")
        + "-" + Date.now();

      const payload: any = {
        title_name: formData.title_name,
        short_description: formData.short_description,
        main_image: formData.main_image,
        extra_images: formData.extra_images.filter(Boolean),
        why_buy_points: formData.why_buy_points.filter((p: any) => p.title),
        product_details: formData.product_details.filter((d: any) => d.label),
        special_story: formData.special_story,
        status: formData.status,
        listing_type: listingType,
      };

      if (listingType === "single") {
        payload.price = formData.price ? Number(formData.price) : null;
        payload.compare_price = formData.compare_price ? Number(formData.compare_price) : null;
        payload.stock = formData.stock ? Number(formData.stock) : null;
        payload.photo_count = formData.photo_count || 1; // ← ADDED
        payload.product_sets = [];
        payload.variations = [];
        payload.variation_type = null;
      } else {
        payload.variation_type = formData.variation_type;
        payload.compare_price = null;
        payload.stock = null;

        if (formData.variation_type === "set") {
          const sets = formData.product_sets
            .filter((s: any) => s.size)
            .map((s: any) => ({
              ...s,
              price: s.price ? Number(s.price) : null,
              compare_price: s.compare_price ? Number(s.compare_price) : null,
              stock: s.stock ? Number(s.stock) : null,
            }));
          payload.product_sets = sets;
          payload.variations = [];
          payload.price = sets[0]?.price || null;
        } else {
          const vars = formData.variations
            .filter((v: any) => v.label)
            .map((v: any) => ({
              ...v,
              price: v.price ? Number(v.price) : null,
              compare_price: v.compare_price ? Number(v.compare_price) : null,
              stock: v.stock ? Number(v.stock) : null,
            }));
          payload.variations = vars;
          payload.product_sets = [];
          payload.price = vars[0]?.price || null;
        }
      }

      if (mode === "add") {
        const { error } = await supabase.from("magnetify_products").insert([{
          ...payload, slug, category_id: categoryId, sub_category_id: subCategoryId, display_order: 0,
        }]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("magnetify_products").update(payload).eq("id", productId);
        if (error) throw error;
      }

      alert(mode === "add" ? "🚀 Product Published!" : "✅ Product Updated!");
      router.push(`/admin/inventory/${categorySlug}/${subCategorySlug}`);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    "CRAFTSMANSHIP",
    listingType === "variation" ? "SETS & PRICING" : "PRICING",
    "PRODUCT DETAILS",
    "WHY MAKE SPECIAL"
  ];

  const selectedVariationType = VARIATION_TYPES.find(v => v.value === formData.variation_type);

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans pb-12">
      {/* Header */}
      <div className="bg-[#121212] border-b border-[#2A2A2A] sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-[10px] uppercase tracking-widest flex items-center gap-2 text-white/60 hover:text-[#FF1B6B] transition-all font-bold">
            <ChevronLeft size={14} /> Discard
          </button>
          <span className="text-[#2A2A2A]">/</span>
          <span className="text-[10px] uppercase tracking-widest text-[#A0A0A0] font-bold">
            Studio / <span className="text-white">{mode === "add" ? "Add Product" : "Edit Product"}</span>
          </span>
          <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full border ${listingType === "variation" ? "bg-[#FF1B6B]/10 text-[#FF1B6B] border-[#FF1B6B]/30" : "bg-white/5 text-white/40 border-white/10"}`}>
            {listingType === "variation" ? "Variation Listing" : "Single Listing"}
          </span>
        </div>
        <p className="text-[#D4AF37] font-serif italic text-xl tracking-widest">Magnetify Studio</p>
        <button onClick={handlePublish} disabled={loading}
          className="bg-[#FF1B6B] px-8 py-2 rounded-full text-[10px] uppercase font-bold text-white flex items-center gap-2 hover:bg-[#e0185d] shadow-lg shadow-[#FF1B6B]/20 transition-all">
          {loading ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
          {loading ? "Saving..." : mode === "add" ? "Publish" : "Update"}
        </button>
      </div>

      <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-8 px-6 mt-8">
        {/* LEFT SIDEBAR */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-[#1C1C1E] border border-[#2A2A2A] rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6 text-[10px] font-black uppercase text-[#D4AF37]">
              <h3>Visual Assets</h3>
              <Star size={14} className="fill-[#D4AF37]" />
            </div>
            <div className="aspect-square bg-[#2A2A2A] border-2 border-dashed border-[#3A3A3C] rounded-xl flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#FF1B6B] transition-colors">
              {formData.main_image ? (
                <>
                  <img src={formData.main_image} className="w-full h-full object-cover" alt="Hero" />
                  <button onClick={() => handleDeleteImage("main")} className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-[#FF1B6B] rounded-full text-white transition-colors">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center">
                  <div className="bg-[#1C1C1E] p-4 rounded-full mb-3 text-[#FF1B6B]">
                    {uploading === "main" ? <Loader2 className="animate-spin" /> : <Upload size={24} />}
                  </div>
                  <p className="text-[10px] font-black uppercase text-white">Hero Image</p>
                  <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "main")} />
                </label>
              )}
            </div>
            <div className="grid grid-cols-5 gap-2 mt-4">
              {formData.extra_images.map((img: string, i: number) => (
                <div key={i} className="aspect-square bg-[#2A2A2A] border border-[#3A3A3C] rounded-lg flex items-center justify-center relative overflow-hidden group hover:border-[#FF1B6B]">
                  {img ? (
                    <>
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button onClick={() => handleDeleteImage(i)} className="absolute top-1 right-1 p-0.5 bg-black/60 hover:bg-[#FF1B6B] rounded-full text-white opacity-0 group-hover:opacity-100 transition-all">
                        <X size={10} />
                      </button>
                    </>
                  ) : (
                    <label className="cursor-pointer w-full h-full flex items-center justify-center">
                      {uploading === i.toString() ? <Loader2 className="animate-spin text-[#FF1B6B]" size={12} /> : <ImageIcon size={12} className="text-[#3A3A3C]" />}
                      <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], i)} />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-[#2A2A2A]">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#A0A0A0] mb-6">Publish Status</h3>
            <div className="space-y-3">
              {[
                { key: "Draft", color: "border-gray-500 bg-gray-500/10 text-gray-300", dot: "bg-gray-400", icon: "⏸" },
                { key: "Active", color: "border-green-500 bg-green-500/10 text-green-400", dot: "bg-green-400", icon: "✓" },
                { key: "Featured", color: "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]", dot: "bg-[#D4AF37]", icon: "★" },
              ].map(({ key, color, dot, icon }) => (
                <div key={key} onClick={() => setFormData({ ...formData, status: key })}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.status === key ? color : "border-[#3A3A3C] text-white/30 hover:text-white/60 hover:border-white/20"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${formData.status === key ? dot : "bg-[#3A3A3C]"}`} />
                    <span className="text-xs font-black uppercase tracking-widest">{key}</span>
                  </div>
                  {formData.status === key && <span className="text-sm font-black">{icon}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="col-span-12 lg:col-span-9 space-y-8">
          <div className="bg-[#1C1C1E] border border-[#2A2A2A] rounded-2xl p-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#A0A0A0] mb-8">Product Identity</h3>
            <div className="space-y-8">
              <div>
                <label className="text-[9px] uppercase font-black text-[#A0A0A0] mb-2 block tracking-widest">Product Name</label>
                <input value={formData.title_name}
                  onChange={(e) => setFormData({ ...formData, title_name: e.target.value })}
                  className="w-full bg-transparent border-b-2 border-[#2A2A2A] py-3 text-3xl font-black text-white outline-none focus:border-[#FF1B6B] transition-all"
                  placeholder="e.g. HERITAGE ROSE SET" />
              </div>
              <div>
                <label className="text-[9px] uppercase font-black text-[#A0A0A0] mb-2 block tracking-widest">Tagline / Short Desc</label>
                <input value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2A2A2A] p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-[#FF1B6B]"
                  placeholder="Perfect for every wall..." />
              </div>

              {/* ← UPDATED: grid-cols-4 + photo_count field */}
              {listingType === "single" && (
                <div className="grid grid-cols-4 gap-6">
                  <div>
                    <label className="text-[9px] uppercase font-black text-[#A0A0A0] mb-2 block tracking-widest">Price (₹)</label>
                    <input value={formData.price} type="number"
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-[#121212] border border-[#2A2A2A] p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-[#FF1B6B]"
                      placeholder="499" />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-black text-[#A0A0A0] mb-2 block tracking-widest">Compare Price (₹) <span className="text-white/20 normal-case font-normal">optional</span></label>
                    <input value={formData.compare_price} type="number"
                      onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })}
                      className="w-full bg-[#121212] border border-[#2A2A2A] p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-[#FF1B6B]"
                      placeholder="699" />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-black text-[#A0A0A0] mb-2 block tracking-widest">Stock <span className="text-white/20 normal-case font-normal">units</span></label>
                    <input value={formData.stock} type="number"
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full bg-[#121212] border border-[#2A2A2A] p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-[#FF1B6B]"
                      placeholder="100" />
                  </div>
                  {/* ← NEW FIELD */}
                  <div>
                    <label className="text-[9px] uppercase font-black text-[#A0A0A0] mb-2 block tracking-widest">
                      Photos Required <span className="text-white/20 normal-case font-normal">per order</span>
                    </label>
                    <input
                      value={formData.photo_count}
                      type="number"
                      min={1}
                      max={20}
                      onChange={(e) => setFormData({ ...formData, photo_count: parseInt(e.target.value) || 1 })}
                      className="w-full bg-[#121212] border border-[#2A2A2A] p-4 rounded-xl text-sm font-bold text-[#FEDE00] outline-none focus:border-[#FF1B6B]"
                      placeholder="1"
                    />
                    <p className="text-[9px] text-white/20 mt-1">Kitni photos customer upload karega</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* TABS */}
          <div className="bg-[#1C1C1E] border border-[#2A2A2A] rounded-2xl overflow-hidden min-h-[500px]">
            <div className="flex bg-[#121212] border-b border-[#2A2A2A] overflow-x-auto">
              {tabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-8 py-5 text-[10px] font-black tracking-widest uppercase whitespace-nowrap transition-all ${activeTab === tab ? "text-[#FF1B6B] bg-[#1C1C1E] border-t-2 border-t-[#FF1B6B]" : "text-white/40 hover:text-white"}`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === "CRAFTSMANSHIP" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-[#A0A0A0] italic">Why buy points</p>
                    <button onClick={() => setFormData({ ...formData, why_buy_points: [...formData.why_buy_points, { title: "", description: "" }] })}
                      className="flex items-center gap-2 text-[10px] font-bold uppercase text-[#FF1B6B] border border-[#FF1B6B]/20 px-4 py-2 rounded-full hover:bg-[#FF1B6B]/10 transition-all">
                      <Plus size={12} /> Add Point
                    </button>
                  </div>
                  {formData.why_buy_points.map((pt: any, i: number) => (
                    <div key={i} className="flex gap-4 p-4 bg-[#121212] rounded-xl border border-[#2A2A2A]">
                      <div className="flex-1 space-y-4">
                        <input value={pt.title}
                          onChange={(e) => { const n = [...formData.why_buy_points]; n[i] = { ...n[i], title: e.target.value }; setFormData({ ...formData, why_buy_points: n }); }}
                          className="w-full bg-transparent border-b border-[#2A2A2A] py-2 text-sm font-bold text-white outline-none focus:border-[#FF1B6B]"
                          placeholder="Feature Title" />
                        <textarea value={pt.description}
                          onChange={(e) => { const n = [...formData.why_buy_points]; n[i] = { ...n[i], description: e.target.value }; setFormData({ ...formData, why_buy_points: n }); }}
                          className="w-full bg-transparent border border-[#2A2A2A] p-4 rounded-lg text-sm text-white/70 outline-none h-24 resize-none focus:border-[#FF1B6B]"
                          placeholder="Detail..." />
                      </div>
                      <button onClick={() => setFormData({ ...formData, why_buy_points: formData.why_buy_points.filter((_: any, idx: number) => idx !== i) })}
                        className="text-white/20 hover:text-red-500 self-start mt-1"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "PRICING" && listingType === "single" && (
                <div className="space-y-6">
                  <p className="text-xs text-[#A0A0A0] italic">Price already set above in Product Identity section.</p>
                  <div className="p-6 bg-[#121212] border border-[#2A2A2A] rounded-2xl flex items-center gap-6">
                    <div className="flex-1">
                      <p className="text-[9px] uppercase font-black text-[#A0A0A0] mb-1">Selling Price</p>
                      <p className="text-3xl font-black text-[#FF1B6B]">₹{formData.price || "—"}</p>
                    </div>
                    {formData.compare_price && (
                      <div className="flex-1">
                        <p className="text-[9px] uppercase font-black text-[#A0A0A0] mb-1">Compare Price</p>
                        <p className="text-xl font-black text-white/30 line-through">₹{formData.compare_price}</p>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-[9px] uppercase font-black text-[#A0A0A0] mb-1">Stock</p>
                      <p className="text-xl font-black text-green-400">{formData.stock || "—"} units</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] uppercase font-black text-[#A0A0A0] mb-1">Photos Required</p>
                      <p className="text-xl font-black text-[#FEDE00]">{formData.photo_count} per order</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "SETS & PRICING" && listingType === "variation" && (
                <div className="space-y-8">
                  <div>
                    <label className="text-[9px] uppercase font-black text-[#A0A0A0] mb-3 block tracking-widest">Step 1 — Variation Type Select Karo</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {VARIATION_TYPES.map((vt) => (
                        <button key={vt.value}
                          onClick={() => setFormData({ ...formData, variation_type: vt.value, variations: [{ ...emptyVariation }], product_sets: [{ ...emptySet }] })}
                          className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${formData.variation_type === vt.value ? "border-[#FF1B6B] bg-[#FF1B6B]/10 text-[#FF1B6B]" : "border-[#2A2A2A] text-white/40 hover:border-white/30 hover:text-white"}`}>
                          {vt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.variation_type && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <label className="text-[9px] uppercase font-black text-[#A0A0A0] block tracking-widest">Step 2 — {selectedVariationType?.label} Options</label>
                          <p className="text-[10px] text-white/30 mt-1">e.g. {selectedVariationType?.placeholder}</p>
                        </div>
                        <button
                          onClick={() => {
                            if (formData.variation_type === "set") {
                              setFormData({ ...formData, product_sets: [...formData.product_sets, { ...emptySet }] });
                            } else {
                              setFormData({ ...formData, variations: [...formData.variations, { ...emptyVariation }] });
                            }
                          }}
                          className="flex items-center gap-2 text-[10px] font-bold uppercase text-[#FF1B6B] border border-[#FF1B6B]/20 px-4 py-2 rounded-full hover:bg-[#FF1B6B]/10 transition-all">
                          <Plus size={12} /> Add {selectedVariationType?.label}
                        </button>
                      </div>

                      {formData.variation_type === "set" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {formData.product_sets.map((set: any, i: number) => (
                            <div key={i} className="bg-[#121212] p-6 rounded-2xl border border-[#2A2A2A] relative">
                              <button onClick={() => setFormData({ ...formData, product_sets: formData.product_sets.filter((_: any, idx: number) => idx !== i) })}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-[#FF1B6B] rounded-full flex items-center justify-center text-white">
                                <X size={12} />
                              </button>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-[9px] uppercase font-black text-[#A0A0A0] mb-2 block">Set Name</label>
                                  <input value={set.size}
                                    onChange={(e) => { const s = [...formData.product_sets]; s[i] = { ...s[i], size: e.target.value }; setFormData({ ...formData, product_sets: s }); }}
                                    className="w-full bg-transparent border-b border-[#2A2A2A] py-2 text-white font-bold outline-none focus:border-[#FF1B6B]"
                                    placeholder="e.g. Set of 4" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-[9px] uppercase font-black text-[#A0A0A0] mb-2 block">Price (₹)</label>
                                    <input value={set.price} type="number"
                                      onChange={(e) => { const s = [...formData.product_sets]; s[i] = { ...s[i], price: e.target.value }; setFormData({ ...formData, product_sets: s }); }}
                                      className="w-full bg-transparent border-b border-[#2A2A2A] py-2 text-white font-bold outline-none focus:border-[#FF1B6B]"
                                      placeholder="499" />
                                  </div>
                                  <div>
                                    <label className="text-[9px] uppercase font-black text-[#A0A0A0] mb-2 block">Compare Price</label>
                                    <input value={set.compare_price} type="number"
                                      onChange={(e) => { const s = [...formData.product_sets]; s[i] = { ...s[i], compare_price: e.target.value }; setFormData({ ...formData, product_sets: s }); }}
                                      className="w-full bg-transparent border-b border-[#2A2A2A] py-2 text-white/50 font-bold outline-none focus:border-[#FF1B6B]"
                                      placeholder="699" />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-[9px] uppercase font-black text-[#A0A0A0] mb-2 block">Stock <span className="text-white/20 normal-case font-normal">units</span></label>
                                    <input value={set.stock} type="number"
                                      onChange={(e) => { const s = [...formData.product_sets]; s[i] = { ...s[i], stock: e.target.value }; setFormData({ ...formData, product_sets: s }); }}
                                      className="w-full bg-transparent border-b border-[#2A2A2A] py-2 text-green-400 font-bold outline-none focus:border-[#FF1B6B]"
                                      placeholder="50" />
                                  </div>
                                  <div>
                                    <label className="text-[9px] uppercase font-black text-[#A0A0A0] mb-2 block">Badge <span className="text-white/20 normal-case font-normal">optional</span></label>
                                    <input value={set.label}
                                      onChange={(e) => { const s = [...formData.product_sets]; s[i] = { ...s[i], label: e.target.value }; setFormData({ ...formData, product_sets: s }); }}
                                      className="w-full bg-transparent border-b border-[#2A2A2A] py-2 text-white font-bold outline-none focus:border-[#FF1B6B]"
                                      placeholder="e.g. Best Seller" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_40px] gap-4 px-4">
                            <p className="text-[9px] uppercase font-black text-[#A0A0A0] tracking-widest">{selectedVariationType?.label} Name</p>
                            <p className="text-[9px] uppercase font-black text-[#A0A0A0] tracking-widest">Price (₹)</p>
                            <p className="text-[9px] uppercase font-black text-[#A0A0A0] tracking-widest">Compare Price</p>
                            <p className="text-[9px] uppercase font-black text-[#A0A0A0] tracking-widest">Stock</p>
                            <div />
                          </div>
                          {formData.variations.map((v: any, i: number) => (
                            <div key={i} className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_40px] gap-4 items-center bg-[#121212] px-4 py-3 rounded-xl border border-[#2A2A2A]">
                              <input value={v.label}
                                onChange={(e) => { const vars = [...formData.variations]; vars[i] = { ...vars[i], label: e.target.value }; setFormData({ ...formData, variations: vars }); }}
                                className="bg-transparent border-b border-[#2A2A2A] py-2 text-white font-bold outline-none focus:border-[#FF1B6B] text-sm"
                                placeholder={selectedVariationType?.placeholder.split(",")[0]} />
                              <input value={v.price} type="number"
                                onChange={(e) => { const vars = [...formData.variations]; vars[i] = { ...vars[i], price: e.target.value }; setFormData({ ...formData, variations: vars }); }}
                                className="bg-transparent border-b border-[#2A2A2A] py-2 text-[#FF1B6B] font-black outline-none focus:border-[#FF1B6B] text-sm"
                                placeholder="499" />
                              <input value={v.compare_price} type="number"
                                onChange={(e) => { const vars = [...formData.variations]; vars[i] = { ...vars[i], compare_price: e.target.value }; setFormData({ ...formData, variations: vars }); }}
                                className="bg-transparent border-b border-[#2A2A2A] py-2 text-white/40 font-bold outline-none focus:border-[#FF1B6B] text-sm"
                                placeholder="699" />
                              <input value={v.stock} type="number"
                                onChange={(e) => { const vars = [...formData.variations]; vars[i] = { ...vars[i], stock: e.target.value }; setFormData({ ...formData, variations: vars }); }}
                                className="bg-transparent border-b border-[#2A2A2A] py-2 text-green-400 font-bold outline-none focus:border-[#FF1B6B] text-sm"
                                placeholder="50" />
                              <button onClick={() => setFormData({ ...formData, variations: formData.variations.filter((_: any, idx: number) => idx !== i) })}
                                className="text-white/20 hover:text-red-500"><Trash2 size={16} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {!formData.variation_type && (
                    <div className="py-16 text-center border border-dashed border-[#2A2A2A] rounded-2xl">
                      <p className="text-white/20 font-black uppercase text-xs tracking-widest">Pehle upar se variation type select karo</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "PRODUCT DETAILS" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-[#A0A0A0] italic">Specifications</p>
                    <button onClick={() => setFormData({ ...formData, product_details: [...formData.product_details, { label: "", value: "" }] })}
                      className="flex items-center gap-2 text-[10px] font-bold uppercase text-[#FF1B6B] border border-[#FF1B6B]/20 px-4 py-2 rounded-full hover:bg-[#FF1B6B]/10 transition-all">
                      <Plus size={12} /> Add Detail
                    </button>
                  </div>
                  {formData.product_details.map((detail: any, i: number) => (
                    <div key={i} className="flex gap-4 items-center">
                      <input value={detail.label}
                        onChange={(e) => { const d = [...formData.product_details]; d[i] = { ...d[i], label: e.target.value }; setFormData({ ...formData, product_details: d }); }}
                        className="flex-1 bg-[#121212] border border-[#2A2A2A] p-4 rounded-xl text-sm text-white outline-none focus:border-[#FF1B6B]"
                        placeholder="Label e.g. Material" />
                      <input value={detail.value}
                        onChange={(e) => { const d = [...formData.product_details]; d[i] = { ...d[i], value: e.target.value }; setFormData({ ...formData, product_details: d }); }}
                        className="flex-[2] bg-[#121212] border border-[#2A2A2A] p-4 rounded-xl text-sm text-white font-bold outline-none focus:border-[#FF1B6B]"
                        placeholder="Value e.g. Premium Steel" />
                      <button onClick={() => setFormData({ ...formData, product_details: formData.product_details.filter((_: any, idx: number) => idx !== i) })}
                        className="p-2 text-white/20 hover:text-[#FF1B6B]"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "WHY MAKE SPECIAL" && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] uppercase font-black text-[#A0A0A0] tracking-widest block mb-2">Section Title</label>
                      <input value={formData.special_story.title}
                        onChange={(e) => setFormData({ ...formData, special_story: { ...formData.special_story, title: e.target.value } })}
                        className="w-full bg-transparent border-b border-[#2A2A2A] py-2 text-lg font-bold text-white outline-none focus:border-[#FF1B6B]" />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-black text-[#A0A0A0] tracking-widest block mb-2 mt-4">Description</label>
                      <textarea value={formData.special_story.description}
                        onChange={(e) => setFormData({ ...formData, special_story: { ...formData.special_story, description: e.target.value } })}
                        className="w-full bg-[#121212] border border-[#2A2A2A] p-4 rounded-xl text-sm text-white/70 min-h-[120px] resize-none outline-none focus:border-[#FF1B6B]"
                        placeholder="Story behind this product..." />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.special_story.points.map((p: any, i: number) => (
                      <div key={i} className="p-4 bg-[#121212] border border-[#2A2A2A] rounded-xl space-y-2">
                        <input value={p.title}
                          onChange={(e) => { const n = [...formData.special_story.points]; n[i] = { ...n[i], title: e.target.value }; setFormData({ ...formData, special_story: { ...formData.special_story, points: n } }); }}
                          className="w-full bg-transparent text-xs font-bold text-white outline-none border-b border-white/5 pb-1 focus:border-[#FF1B6B]"
                          placeholder="Feature title" />
                        <textarea value={p.desc}
                          onChange={(e) => { const n = [...formData.special_story.points]; n[i] = { ...n[i], desc: e.target.value }; setFormData({ ...formData, special_story: { ...formData.special_story, points: n } }); }}
                          className="w-full bg-transparent text-[10px] text-white/50 outline-none h-16 resize-none"
                          placeholder="Short description..." />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handlePublish} disabled={loading}
              className="bg-white text-[#121212] px-12 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#FF1B6B] hover:text-white transition-all shadow-xl flex items-center gap-3">
              {loading ? "Saving..." : mode === "add" ? "Publish Product" : "Update Product"}
              <CheckCircle2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}