"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { 
  ChevronLeft, Plus, Trash2, Upload, X, 
  Image as ImageIcon, Star, CheckCircle2, Loader2 
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DetailedAddProductPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;
  const subCategoryId = params.subCategoryId as string;
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("CRAFTSMANSHIP");
  const [uploading, setUploading] = useState<string | null>(null);

  // 🔥 STATE MATCHING YOUR PREVIOUS DESIGN
  const [formData, setFormData] = useState({
    title_name: "",
    short_description: "",
    main_image: "",
    extra_images: Array(5).fill(""),
    why_buy_points: [{ title: "", description: "" }],
    product_sets: [{ size: "", price: "", label: "" }],
    product_details: [{ label: "Material", value: "Premium epoxy-coated steel" }],
    special_story: { 
      title: "Built for gifting, made to stay on display.", 
      description: "", 
      points: Array(4).fill({ title: "", desc: "" }) 
    },
    status: "Active"
  });

  // 🔥 INTEGRATED SUBMIT LOGIC
  const handlePublish = async (e: any) => {
    if (e) e.preventDefault();
    if (!formData.title_name) return alert("Product Name zaroori hai!");
    if (!formData.main_image) return alert("Hero Image upload karein!");

    setLoading(true);

    try {
      // AUTO SLUG
      const slug = formData.title_name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') + "-" + Date.now();

      // MAPPING STATE TO DATABASE COLUMNS
      const { error } = await supabase.from("magnetify_products").insert([
        {
          title_name: formData.title_name,
          short_description: formData.short_description,
          slug: slug,
          category_id: categoryId,
          sub_category_id: subCategoryId,
          main_image: formData.main_image,
          // Sending as proper JSON objects/arrays
          extra_images: formData.extra_images.filter(Boolean),
          why_buy_points: formData.why_buy_points.filter(p => p.title),
          product_sets: formData.product_sets.filter(s => s.size),
          product_details: formData.product_details.filter(d => d.label),
          special_story: formData.special_story,
          status: formData.status,
          display_order: 0
        },
      ]);

      if (error) throw error;

      alert("🚀 Product Published Successfully!");
      router.push(`/admin/inventory/${categoryId}/${subCategoryId}`);

    } catch (err: any) {
      console.error("FULL ERROR:", err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- IMAGE UPLOAD LOGIC ---
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
    } catch (err) { 
      alert("Upload fail ho gaya!"); 
    } finally { 
      setUploading(null); 
    }
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
    <div className="min-h-screen bg-[#121212] text-white font-sans pb-12">
      {/* Top Navbar */}
      <div className="bg-[#121212] border-b border-[#2A2A2A] sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-[10px] uppercase tracking-widest flex items-center gap-2 text-white/60 hover:text-[#FF1B6B] transition-all font-bold">
              <ChevronLeft size={14} /> Discard
            </button>
            <span className="text-[#2A2A2A]">/</span>
            <span className="text-[10px] uppercase tracking-widest text-[#A0A0A0] font-bold">Studio / <span className="text-white">Add Product</span></span>
          </div>
          <p className="text-[#D4AF37] font-serif italic text-xl tracking-widest">Magnetify Studio</p>
          <div className="flex gap-3">
            <button 
                onClick={handlePublish}
                disabled={loading}
                className="bg-[#FF1B6B] px-8 py-2 rounded-full text-[10px] uppercase font-bold text-white flex items-center gap-2 hover:bg-[#e0185d] shadow-lg shadow-[#FF1B6B]/20 transition-all"
            >
                {loading ? <Loader2 className="animate-spin" size={14}/> : <CheckCircle2 size={14}/>} 
                {loading ? 'Publishing...' : 'Publish'}
            </button>
          </div>
      </div>

      <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-8 px-6 mt-8">
        {/* LEFT COLUMN */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-[#1C1C1E] border border-[#2A2A2A] rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 text-[10px] font-black uppercase text-[#D4AF37]">
              <h3>Visual Assets</h3>
              <Star size={14} className="fill-[#D4AF37]"/>
            </div>

            {/* Main Image */}
            <div className="aspect-square bg-[#2A2A2A] border-2 border-dashed border-[#3A3A3C] rounded-xl flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#FF1B6B] transition-colors">
              {formData.main_image ? (
                <>
                  <img src={formData.main_image} className="w-full h-full object-cover" alt="Hero" />
                  <button onClick={() => handleDeleteImage("main")} className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-[#FF1B6B] rounded-full text-white transition-colors backdrop-blur-sm"><X size={14} /></button>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center">
                   <div className="bg-[#1C1C1E] p-4 rounded-full shadow-md mb-3 text-[#FF1B6B]">
                    {uploading === "main" ? <Loader2 className="animate-spin" /> : <Upload size={24} />}
                   </div>
                   <p className="text-[10px] font-black uppercase text-white">Hero Image</p>
                   <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "main")} />
                </label>
              )}
            </div>

            {/* Extras */}
            <div className="grid grid-cols-5 gap-2 mt-4">
              {formData.extra_images.map((img, i) => (
                <div key={i} className="aspect-square bg-[#2A2A2A] border border-[#3A3A3C] rounded-lg flex items-center justify-center relative overflow-hidden group hover:border-[#FF1B6B]">
                  {img ? (
                    <>
                      <img src={img} className="w-full h-full object-cover" alt="Extra" />
                      <button onClick={() => handleDeleteImage(i)} className="absolute top-1 right-1 p-0.5 bg-black/60 hover:bg-[#FF1B6B] rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"><X size={10} /></button>
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
          
          <div className="bg-[#1C1C1E] rounded-2xl p-6 border border-[#2A2A2A]">
             <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#A0A0A0] mb-6">Publish Status</h3>
             <div className="space-y-3">
                {['Draft', 'Active', 'Featured'].map((s) => (
                   <div key={s} onClick={() => setFormData({...formData, status: s})} className={`flex justify-between items-center p-4 rounded-xl border transition-all cursor-pointer ${formData.status === s ? 'border-[#FF1B6B] bg-[#FF1B6B]/5' : 'border-[#3A3A3C]'}`}>
                      <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${formData.status === s ? 'bg-[#FF1B6B]' : 'bg-[#3A3A3C]'}`}></div>
                         <span className="text-xs font-bold uppercase text-white">{s}</span>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-12 lg:col-span-9 space-y-8">
          <div className="bg-[#1C1C1E] border border-[#2A2A2A] rounded-2xl p-8 shadow-sm">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-[#A0A0A0] mb-8">Product Identity</h3>
             <div className="space-y-8">
                <div>
                   <label className="text-[9px] uppercase font-black text-[#A0A0A0] mb-2 block tracking-widest">Product Name</label>
                   <input value={formData.title_name} onChange={(e) => setFormData({...formData, title_name: e.target.value})} className="w-full bg-transparent border-b-2 border-[#2A2A2A] py-3 text-3xl font-black text-white outline-none focus:border-[#FF1B6B] transition-all" placeholder="e.g. HERITAGE ROSE SET" />
                </div>
                <div>
                   <label className="text-[9px] uppercase font-black text-[#A0A0A0] mb-2 block tracking-widest">Tagline / Short Desc</label>
                   <input value={formData.short_description} onChange={(e) => setFormData({...formData, short_description: e.target.value})} className="w-full bg-[#121212] border border-[#2A2A2A] p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-[#FF1B6B]" placeholder="Perfect for every wall..." />
                </div>
             </div>
          </div>

          {/* Tabs Section */}
          <div className="bg-[#1C1C1E] border border-[#2A2A2A] rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
             <div className="flex bg-[#121212] border-b border-[#2A2A2A] overflow-x-auto">
                {['CRAFTSMANSHIP', 'PRICING', 'PRODUCT DETAILS', 'WHY MAKE SPECIAL'].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-5 text-[10px] font-black tracking-widest uppercase whitespace-nowrap transition-all ${activeTab === tab ? 'text-[#FF1B6B] bg-[#1C1C1E] border-t-2 border-t-[#FF1B6B]' : 'text-white/40 hover:text-white'}`}>
                    {tab}
                  </button>
                ))}
             </div>
             
             <div className="p-8">
                {activeTab === 'CRAFTSMANSHIP' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-[#A0A0A0] italic">Why buy points</p>
                        <button onClick={() => setFormData({...formData, why_buy_points: [...formData.why_buy_points, {title: "", description: ""}]})} className="flex items-center gap-2 text-[10px] font-bold uppercase text-[#FF1B6B] border border-[#FF1B6B]/20 px-4 py-2 rounded-full"><Plus size={12}/> Add Point</button>
                    </div>
                    {formData.why_buy_points.map((pt, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-[#121212] rounded-xl border border-[#2A2A2A]">
                            <div className="flex-1 space-y-4">
                                <input value={pt.title} onChange={(e) => {
                                    const newPts = [...formData.why_buy_points];
                                    newPts[i].title = e.target.value;
                                    setFormData({...formData, why_buy_points: newPts});
                                }} className="w-full bg-transparent border-b border-[#2A2A2A] py-2 text-sm font-bold text-white outline-none focus:border-[#FF1B6B]" placeholder="Feature Title" />
                                <textarea value={pt.description} onChange={(e) => {
                                    const newPts = [...formData.why_buy_points];
                                    newPts[i].description = e.target.value;
                                    setFormData({...formData, why_buy_points: newPts});
                                }} className="w-full bg-transparent border border-[#2A2A2A] p-4 rounded-lg text-sm text-white/70 outline-none h-24" placeholder="Detail..." />
                            </div>
                            <button onClick={() => setFormData({...formData, why_buy_points: formData.why_buy_points.filter((_, idx) => idx !== i)})} className="text-white/20 hover:text-red-500"><Trash2 size={16}/></button>
                        </div>
                    ))}
                  </div>
                )}

                {activeTab === 'PRICING' && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-[#A0A0A0] italic">Sets & Pricing</p>
                        <button onClick={() => setFormData({...formData, product_sets: [...formData.product_sets, {size: "", price: "", label: ""}]})} className="flex items-center gap-2 text-[10px] font-bold uppercase text-[#FF1B6B] border border-[#FF1B6B]/20 px-4 py-2 rounded-full"><Plus size={12}/> Add Set</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {formData.product_sets.map((set, i) => (
                          <div key={i} className="bg-[#121212] p-6 rounded-2xl border border-[#2A2A2A] relative group">
                             <button onClick={() => setFormData({...formData, product_sets: formData.product_sets.filter((_, idx) => idx !== i)})} className="absolute -top-2 -right-2 w-6 h-6 bg-[#FF1B6B] rounded-full flex items-center justify-center text-white"><X size={12}/></button>
                             <div className="grid gap-4">
                                <div><label className="text-[9px] uppercase font-black text-[#A0A0A0] mb-2 block">Set Size</label><input value={set.size} onChange={(e) => {
                                    const s = [...formData.product_sets]; s[i].size = e.target.value; setFormData({...formData, product_sets: s});
                                }} className="w-full bg-transparent border-b border-[#2A2A2A] py-2 text-white font-bold" placeholder="e.g. Set of 4" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                   <div><label className="text-[9px] uppercase font-black text-[#A0A0A0] mb-2 block">Price (₹)</label><input value={set.price} onChange={(e) => {
                                       const s = [...formData.product_sets]; s[i].price = e.target.value; setFormData({...formData, product_sets: s});
                                   }} className="w-full bg-transparent border-b border-[#2A2A2A] py-2 text-white font-bold" placeholder="499" /></div>
                                   <div><label className="text-[9px] uppercase font-black text-[#A0A0A0] mb-2 block">Badge</label><input value={set.label} onChange={(e) => {
                                       const s = [...formData.product_sets]; s[i].label = e.target.value; setFormData({...formData, product_sets: s});
                                   }} className="w-full bg-transparent border-b border-[#2A2A2A] py-2 text-white font-bold" placeholder="Best Seller" /></div>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                  </div>
                )}

                {activeTab === 'PRODUCT DETAILS' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-[#A0A0A0] italic">Specifications</p>
                        <button onClick={() => setFormData({...formData, product_details: [...formData.product_details, {label: "", value: ""}]})} className="flex items-center gap-2 text-[10px] font-bold uppercase text-[#FF1B6B] border border-[#FF1B6B]/20 px-4 py-2 rounded-full"><Plus size={12}/> Add Detail</button>
                    </div>
                    {formData.product_details.map((detail, i) => (
                      <div key={i} className="flex gap-4 items-center group">
                        <input value={detail.label} onChange={(e) => {
                          const newDet = [...formData.product_details]; newDet[i].label = e.target.value; setFormData({...formData, product_details: newDet});
                        }} className="flex-1 bg-[#121212] border border-[#2A2A2A] p-4 rounded-xl text-sm text-white" placeholder="Label" />
                        <input value={detail.value} onChange={(e) => {
                          const newDet = [...formData.product_details]; newDet[i].value = e.target.value; setFormData({...formData, product_details: newDet});
                        }} className="flex-[2] bg-[#121212] border border-[#2A2A2A] p-4 rounded-xl text-sm text-white font-bold" placeholder="Value" />
                        <button onClick={() => setFormData({...formData, product_details: formData.product_details.filter((_, idx) => idx !== i)})} className="p-2 text-white/20 hover:text-[#FF1B6B]"><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'WHY MAKE SPECIAL' && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[9px] uppercase font-black text-[#A0A0A0] tracking-widest">Section Title</label>
                      <input value={formData.special_story.title} onChange={(e) => setFormData({...formData, special_story: {...formData.special_story, title: e.target.value}})} className="w-full bg-transparent border-b border-[#2A2A2A] py-2 text-lg font-bold text-white outline-none" />
                      
                      <label className="text-[9px] uppercase font-black text-[#A0A0A0] tracking-widest block mt-4">Description</label>
                      <textarea value={formData.special_story.description} onChange={(e) => setFormData({...formData, special_story: {...formData.special_story, description: e.target.value}})} className="w-full bg-[#121212] border border-[#2A2A2A] p-4 rounded-xl text-sm text-white/70 min-h-[120px]" placeholder="Story behind this product..." />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.special_story.points.map((p, i) => (
                        <div key={i} className="p-4 bg-[#121212] border border-[#2A2A2A] rounded-xl space-y-2">
                          <input value={p.title} onChange={(e) => {
                             const newPts = [...formData.special_story.points]; newPts[i] = {...newPts[i], title: e.target.value};
                             setFormData({...formData, special_story: {...formData.special_story, points: newPts}});
                          }} className="w-full bg-transparent text-xs font-bold text-white outline-none border-b border-white/5 pb-1" placeholder="Feature title" />
                          <textarea value={p.desc} onChange={(e) => {
                             const newPts = [...formData.special_story.points]; newPts[i] = {...newPts[i], desc: e.target.value};
                             setFormData({...formData, special_story: {...formData.special_story, points: newPts}});
                          }} className="w-full bg-transparent text-[11px] text-white/50 outline-none resize-none" rows={2} placeholder="Description" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
             </div>
          </div>

          {/* Bottom Action */}
          <div className="flex justify-end gap-4 mt-8">
             <button onClick={handlePublish} disabled={loading} className="bg-white text-[#121212] px-12 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#FF1B6B] hover:text-white transition-all shadow-xl flex items-center gap-3">
                {loading ? 'Publishing...' : 'Publish Product'} <CheckCircle2 size={18}/>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}