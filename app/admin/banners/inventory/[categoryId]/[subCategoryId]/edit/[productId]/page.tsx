"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ChevronLeft, Plus, Trash2, Save, Upload, X, Image as ImageIcon, Star, CheckCircle2, Zap, Loader2 } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export default function DetailedAddProductPage() {
  const params = useParams();
  const router = useRouter();
  
  const categoryId = params.categoryId as string;
  const subCategoryId = params.subCategoryId as string;
  const productId = (params.id as string) || (params.productId as string);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("CRAFTSMANSHIP");
  const [uploading, setUploading] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title_name: "",
    short_description: "",
    main_image: "",
    extra_images: Array(5).fill(""),
    why_buy_points: [{ title: "", description: "" }],
    product_sets: [{ size: "", price: "", label: "" }],
    product_details: [{ label: "Material", value: "Premium epoxy-coated steel" }],
    special_story: { 
      title: "", 
      description: "", 
      points: Array(4).fill({ title: "", desc: "" }) 
    },
    status: "Active"
  });

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("magnetify_products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) {
        console.error("❌ Fetch error:", error);
        return;
      }

      setFormData({
        title_name: data.title_name || "",
        short_description: data.short_description || "",
        main_image: data.main_image || "",
        extra_images: data.extra_images || Array(5).fill(""),
        why_buy_points: data.why_buy_points?.length
          ? data.why_buy_points
          : [{ title: "", description: "" }],
        // ✅ FIX 1: Pricing Label Fix
        product_sets: data.product_sets?.length
          ? data.product_sets.map((set: any) => ({
              size: set.size || "",
              price: set.price || "",
              label: set.label || ""
            }))
          : [{ size: "", price: "", label: "" }],
        product_details: data.product_details?.length
          ? data.product_details
          : [{ label: "", value: "" }],
        // ✅ FIX 2: Special Story Full Fix
        special_story: {
          title: data.special_story?.title || "",
          description: data.special_story?.description || "",
          points: data.special_story?.points?.length
            ? data.special_story.points.map((p: any) => ({
                title: p.title || "",
                desc: p.desc || ""
              }))
            : Array(4).fill({ title: "", desc: "" })
        },
        status: data.status || "Active"
      });
    };

    fetchProduct();
  }, [productId]);

  const handlePublish = async () => {
    if (!formData.title_name) return alert("Product Name zaroori hai!");
    setLoading(true);

    try {
      const payload = {
        title_name: formData.title_name,
        short_description: formData.short_description,
        slug: generateSlug(formData.title_name) + "-" + Date.now(),
        category_id: categoryId,
        sub_category_id: subCategoryId,
        main_image: formData.main_image,
        extra_images: formData.extra_images.filter(Boolean),
        why_buy_points: formData.why_buy_points.filter(p => p.title),
        product_sets: formData.product_sets,
        product_details: formData.product_details.filter(d => d.label && d.value),
        special_story: formData.special_story,
        status: formData.status,
      };

      const { error } = await supabase
        .from("magnetify_products")
        .update(payload)
        .eq("id", productId);

      if (error) throw error;
      alert("🚀 Product Updated Successfully!");
      router.push(`/admin/inventory/${categoryId}/${subCategoryId}`);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File, target: "main" | number) => {
    try {
      setUploading(target.toString());
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const filePath = `products/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('products').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('products').getPublicUrl(filePath);
      
      if (target === "main") {
        setFormData(prev => ({ ...prev, main_image: data.publicUrl }));
      } else {
        const newEx = [...formData.extra_images];
        newEx[target] = data.publicUrl;
        setFormData(prev => ({ ...prev, extra_images: newEx }));
      }
    } catch (err) { alert("Upload failed!"); } finally { setUploading(null); }
  };

  const handleDeleteImage = (target: "main" | number) => {
    if (target === "main") {
      setFormData({ ...formData, main_image: "" });
    } else {
      const newEx = [...formData.extra_images];
      newEx[target] = "";
      setFormData({ ...formData, extra_images: newEx });
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white pb-12">
      {/* Navbar */}
      <div className="bg-[#121212] border-b border-[#2A2A2A] sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-[10px] uppercase tracking-widest flex items-center gap-2 text-white/60 hover:text-[#FF1B6B] font-bold transition-all">
              <ChevronLeft size={14} /> Back
            </button>
            <span className="text-[10px] uppercase tracking-widest text-[#A0A0A0] font-bold">Studio / Edit</span>
          </div>
          <div className="flex gap-3">
            <button 
                onClick={handlePublish}
                disabled={loading}
                className="bg-[#FF1B6B] px-8 py-2 rounded-full text-[10px] uppercase font-bold text-white flex items-center gap-2 hover:bg-[#e0185d] shadow-lg shadow-[#FF1B6B]/20 transition-all"
            >
                {loading ? <Loader2 className="animate-spin" size={14}/> : <CheckCircle2 size={14}/>} 
                {loading ? 'Saving...' : 'Update Changes'}
            </button>
          </div>
      </div>

      <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-8 px-6 mt-8">
        {/* Left Col */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-[#1C1C1E] border border-[#2A2A2A] rounded-2xl p-6">
            <h3 className="text-[10px] font-black uppercase text-[#D4AF37] mb-6">Visual Assets</h3>
            <div className="aspect-square bg-[#2A2A2A] border-2 border-dashed border-[#3A3A3C] rounded-xl flex items-center justify-center relative overflow-hidden group">
              {formData.main_image ? (
                <>
                  <img src={formData.main_image} className="w-full h-full object-cover" />
                  <button onClick={() => handleDeleteImage("main")} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-red-500 transition-colors"><X size={14} /></button>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center">
                   <div className="bg-[#1C1C1E] p-4 rounded-full mb-3 text-[#FF1B6B]">
                    {uploading === "main" ? <Loader2 className="animate-spin" /> : <Upload size={24} />}
                   </div>
                   <p className="text-[10px] font-black uppercase">Upload Hero</p>
                   <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "main")} />
                </label>
              )}
            </div>
            <div className="grid grid-cols-5 gap-2 mt-4">
              {formData.extra_images.map((img, i) => (
                <div key={i} className="aspect-square bg-[#2A2A2A] border border-[#3A3A3C] rounded-lg flex items-center justify-center relative overflow-hidden group">
                  {img ? (
                    <>
                      <img src={img} className="w-full h-full object-cover" />
                      <button onClick={() => handleDeleteImage(i)} className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all"><X size={10} /></button>
                    </>
                  ) : (
                    <label className="cursor-pointer w-full h-full flex items-center justify-center">
                      {uploading === i.toString() ? <Loader2 className="animate-spin text-[#FF1B6B]" size={12} /> : <ImageIcon size={12} className="text-[#3A3A3C]"/>}
                      <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], i)} />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="col-span-12 lg:col-span-9 space-y-8">
          <div className="bg-[#1C1C1E] border border-[#2A2A2A] rounded-2xl p-8">
             <h3 className="text-[10px] font-black uppercase text-[#A0A0A0] mb-8">Identity</h3>
             <div className="space-y-8">
                <div>
                   <label className="text-[9px] uppercase font-black text-[#A0A0A0] mb-2 block tracking-widest">Product Name</label>
                   <input value={formData.title_name} onChange={(e) => setFormData({...formData, title_name: e.target.value})} className="w-full bg-transparent border-b-2 border-[#2A2A2A] py-3 text-3xl font-black outline-none focus:border-[#FF1B6B] transition-all" />
                </div>
                <div>
                   <label className="text-[9px] uppercase font-black text-[#A0A0A0] mb-2 block">Short Description</label>
                   <input value={formData.short_description} onChange={(e) => setFormData({...formData, short_description: e.target.value})} className="w-full bg-[#121212] border border-[#2A2A2A] p-4 rounded-xl text-sm" />
                </div>
             </div>
          </div>

          <div className="bg-[#1C1C1E] border border-[#2A2A2A] rounded-2xl overflow-hidden min-h-[500px]">
             <div className="flex bg-[#121212] border-b border-[#2A2A2A]">
                {['CRAFTSMANSHIP', 'PRICING', 'PRODUCT DETAILS', 'WHY MAKE SPECIAL'].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-5 text-[10px] font-black tracking-widest uppercase transition-all ${activeTab === tab ? 'text-[#FF1B6B] bg-[#1C1C1E] border-t-2 border-[#FF1B6B]' : 'text-white/40 hover:text-white'}`}>
                    {tab}
                  </button>
                ))}
             </div>
             
             <div className="p-8">
                {activeTab === 'CRAFTSMANSHIP' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-xs text-[#A0A0A0]">Points that make this unique</p>
                        <button onClick={() => setFormData({...formData, why_buy_points: [...formData.why_buy_points, {title: "", description: ""}]})} className="text-[10px] font-bold text-[#FF1B6B] uppercase">+ Add Point</button>
                    </div>
                    {formData.why_buy_points.map((pt, i) => (
                        <div key={i} className="p-4 bg-[#121212] rounded-xl border border-[#2A2A2A] space-y-4">
                            <input value={pt.title} onChange={(e) => {
                                const n = [...formData.why_buy_points]; n[i].title = e.target.value; setFormData({...formData, why_buy_points: n});
                            }} className="w-full bg-transparent border-b border-[#2A2A2A] py-2 text-sm font-bold" placeholder="Point Title" />
                            <textarea value={pt.description} onChange={(e) => {
                                const n = [...formData.why_buy_points]; n[i].description = e.target.value; setFormData({...formData, why_buy_points: n});
                            }} className="w-full bg-transparent p-2 text-sm text-white/70 h-20 outline-none" placeholder="Description..." />
                        </div>
                    ))}
                  </div>
                )}

                {activeTab === 'PRICING' && (
                  <div className="grid grid-cols-2 gap-6">
                     {formData.product_sets.map((set, i) => (
                        <div key={i} className="bg-[#121212] p-6 rounded-2xl border border-[#2A2A2A] space-y-4">
                           {/* ✅ FIX: Label Input Bound */}
                           <input value={set.label} onChange={(e) => {
                              const s = [...formData.product_sets]; s[i].label = e.target.value; setFormData({...formData, product_sets: s});
                           }} className="w-full bg-transparent border-b border-[#FF1B6B]/30 border-[#2A2A2A] py-2 text-white text-[10px] uppercase font-bold" placeholder="Label (e.g. Best Seller)" />
                           
                           <input value={set.size} onChange={(e) => {
                              const s = [...formData.product_sets]; s[i].size = e.target.value; setFormData({...formData, product_sets: s});
                           }} className="w-full bg-transparent border-b border-[#2A2A2A] py-2 text-white" placeholder="Size (e.g. Set of 4)" />
                           
                           <input value={set.price} onChange={(e) => {
                              const s = [...formData.product_sets]; s[i].price = e.target.value; setFormData({...formData, product_sets: s});
                           }} className="w-full bg-transparent border-b border-[#2A2A2A] py-2 text-white" placeholder="Price" />
                        </div>
                     ))}
                     <button onClick={() => setFormData({...formData, product_sets: [...formData.product_sets, {size: "", price: "", label: ""}]})} className="border border-dashed border-[#3A3A3C] rounded-2xl text-[10px] uppercase font-bold text-white/40 hover:text-[#FF1B6B] transition-all h-[150px]">+ Add Pricing Set</button>
                  </div>
                )}

                {activeTab === 'PRODUCT DETAILS' && (
                  <div className="space-y-4">
                    {formData.product_details.map((detail, i) => (
                      <div key={i} className="flex gap-4">
                        <input value={detail.label} onChange={(e) => {
                          const n = [...formData.product_details]; n[i].label = e.target.value; setFormData({...formData, product_details: n});
                        }} className="flex-1 bg-[#121212] border border-[#2A2A2A] p-4 rounded-xl text-sm" placeholder="Label" />
                        <input value={detail.value} onChange={(e) => {
                          const n = [...formData.product_details]; n[i].value = e.target.value; setFormData({...formData, product_details: n});
                        }} className="flex-[2] bg-[#121212] border border-[#2A2A2A] p-4 rounded-xl text-sm font-bold" placeholder="Value" />
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'WHY MAKE SPECIAL' && (
                  <div className="space-y-6">
                      {/* ✅ FIX: Title & Description Bound */}
                      <div>
                        <label className="text-[9px] uppercase font-black text-[#A0A0A0] mb-2 block">Story Title</label>
                        <input value={formData.special_story.title} onChange={(e) => setFormData({...formData, special_story: {...formData.special_story, title: e.target.value}})} className="w-full bg-transparent border-b border-[#2A2A2A] py-2 text-lg font-bold outline-none focus:border-[#FF1B6B]" placeholder="Story Title" />
                      </div>

                      <div>
                        <label className="text-[9px] uppercase font-black text-[#A0A0A0] mb-2 block">Story Description</label>
                        <textarea value={formData.special_story.description} onChange={(e) => setFormData({...formData, special_story: {...formData.special_story, description: e.target.value}})} className="w-full bg-[#121212] border border-[#2A2A2A] p-4 rounded-xl text-sm min-h-[120px] outline-none focus:border-[#FF1B6B]" placeholder="Description..." />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-6">
                        {formData.special_story.points.map((pt, i) => (
                          <div key={i} className="p-4 bg-[#121212] rounded-xl border border-[#2A2A2A] space-y-2">
                            <input 
                              value={pt.title} 
                              onChange={(e) => {
                                const newPts = [...formData.special_story.points];
                                newPts[i].title = e.target.value;
                                setFormData({...formData, special_story: {...formData.special_story, points: newPts}});
                              }} 
                              className="w-full bg-transparent border-b border-[#2A2A2A] py-1 text-xs font-bold" placeholder="Point Title" 
                            />
                            <textarea 
                              value={pt.desc} 
                              onChange={(e) => {
                                const newPts = [...formData.special_story.points];
                                newPts[i].desc = e.target.value;
                                setFormData({...formData, special_story: {...formData.special_story, points: newPts}});
                              }} 
                              className="w-full bg-transparent text-[11px] text-white/60 h-16 outline-none" placeholder="Point Description..." 
                            />
                          </div>
                        ))}
                      </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}