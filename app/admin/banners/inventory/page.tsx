"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase"; 
import { Plus, Edit2, Trash2, ArrowRight, ArrowUp, ArrowDown, Upload, Loader2, X, Image as ImageIcon, AlignLeft } from "lucide-react"; 

const supabase = getSupabase();

export default function InventoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null); // Step 1: Modal ref create kiya

  const [formData, setFormData] = useState({ name: "", imageUrl: "", description: "" });

  // Step 2: Click Outside aur ESC Key logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      // Agar click modal container ke bahar hua hai to close kar do
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden"; // Scroll lock
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset"; // Scroll restore
    };
  }, [isModalOpen]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      if (data) setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
      alert("Delete failed");
    }
  };

  const getCorrectImagePath = (path: string, name: string) => {
    if (!path || path.includes('placeholder')) {
      const n = name.toLowerCase();
      if (n.includes("classic")) return "/classic-magnets-fridge-photo-display-magnetify-studio.jpg";
      if (n.includes("acrylic")) return "/acrylic-photo-magnets-fridge-display-magnetify-studio.jpg";
      if (n.includes("music")) return "/music-magnet-s-can-play-family-keepsake-magnetify-studio.jpg";
      if (n.includes("accessories")) return "/photo-accessories-keychains-pins-bottle-openers-magnetify-studio.jpg";
      if (n.includes("frames")) return "/heritage-gold-photo-grid-frame-and-premium-gift-box.jpg";
      if (n.includes("ornaments")) return "/crystal-ornaments-premium-gifting-magnetify-studio.jpg";
    }
    return path?.startsWith('http') ? path : path?.replace('/images/', '/');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `cat-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('category-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
    } catch (error: any) {
      alert("Upload failed: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleMove = async (currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const currentCat = categories[currentIndex];
    const targetCat = categories[targetIndex];

    const newCategories = [...categories];
    newCategories[currentIndex] = { ...targetCat, display_order: currentCat.display_order };
    newCategories[targetIndex] = { ...currentCat, display_order: targetCat.display_order };
    setCategories(newCategories);

    try {
      const { error: err1 } = await supabase.from('categories')
        .update({ display_order: targetCat.display_order })
        .eq('id', currentCat.id);

      const { error: err2 } = await supabase.from('categories')
        .update({ display_order: currentCat.display_order })
        .eq('id', targetCat.id);

      if (err1 || err2) throw new Error("Sync Error");
    } catch (err) {
      fetchCategories(); 
    }
  };

  const saveCategory = async () => {
    if (!formData.name || !formData.imageUrl) return;
    
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        image_url: formData.imageUrl,
        description: formData.description,
        slug: formData.name.toLowerCase().trim().replace(/\s+/g, "-")
      };

      if (editingId) {
        const { error } = await supabase.from("categories")
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert([{ 
          ...payload,
          display_order: categories.length 
        }]);
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      setFormData({ name: "", imageUrl: "", description: "" });
      setEditingId(null);
      await fetchCategories();
    } catch (error: any) {
      alert("Save failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#1A202C] uppercase tracking-tighter">Inventory</h1>
          <p className="text-[10px] text-gray-400 font-bold italic mt-1 uppercase tracking-widest">Shor Kam, Kaam Zyada.</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setFormData({name:"", imageUrl:"", description: ""}); setIsModalOpen(true); }} 
          className="bg-[#1A365D] text-white px-8 py-4 rounded-2xl text-[10px] font-black tracking-widest hover:bg-black transition-all flex items-center gap-3 shadow-xl"
        >
          <Plus size={18} strokeWidth={3} /> CREATE COLLECTION
        </button>
      </div>

      {loading && categories.length === 0 ? (
        <div className="py-40 text-center animate-pulse">
          <Loader2 className="animate-spin mx-auto text-gray-300 mb-4" size={40} />
          <div className="font-black text-gray-300 uppercase tracking-widest text-xs">Syncing Database...</div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {categories.map((cat, index) => (
            <div key={cat.id} className="bg-white rounded-[3rem] overflow-hidden shadow-sm border border-gray-100 group flex flex-col relative hover:shadow-2xl transition-all duration-500">
              <div className="h-64 bg-gray-50 relative overflow-hidden">
                <img 
                  src={getCorrectImagePath(cat.image_url, cat.name)} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black shadow-sm z-20 text-[#1A365D]">
                  RANK #{index + 1}
                </div>
              </div>

              <div className="p-10 flex-1 flex flex-col">
                <h3 className="text-xl font-black text-[#1A202C] uppercase mb-2 tracking-tight">{cat.name}</h3>
                <p className="text-[11px] text-gray-400 font-medium mb-6 line-clamp-2 italic">{cat.description || "No description added."}</p>
                
                <div className="flex items-center gap-3 mb-8">
                  <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="flex-1 py-4 bg-gray-50 rounded-2xl text-gray-400 hover:text-[#2B6CB0] border border-gray-100 flex justify-center disabled:opacity-10 transition-all"><ArrowUp size={18} strokeWidth={3}/></button>
                  <button onClick={() => handleMove(index, 'down')} disabled={index === categories.length - 1} className="flex-1 py-4 bg-gray-50 rounded-2xl text-gray-400 hover:text-[#2B6CB0] border border-gray-100 flex justify-center disabled:opacity-10 transition-all"><ArrowDown size={18} strokeWidth={3}/></button>
                </div>

                <button 
                  onClick={() => router.push(`/admin/inventory/${cat.id}`)}
                  className="w-full bg-[#EBF4FF] text-[#2B6CB0] py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-8 hover:bg-[#2B6CB0] hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  MANAGE ITEMS <ArrowRight size={16} strokeWidth={3} />
                </button>
                
                <div className="mt-auto flex gap-6 pt-6 border-t border-gray-50">
                  <button onClick={() => { setEditingId(cat.id); setFormData({name: cat.name, imageUrl: cat.image_url, description: cat.description || ""}); setIsModalOpen(true); }} className="flex-1 flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 hover:text-blue-600 uppercase transition-colors">
                    <Edit2 size={14} /> Edit
                  </button>
                  <button onClick={() => deleteCategory(cat.id)} className="flex-1 flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 hover:text-red-500 uppercase transition-colors">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#1A202C]/95 backdrop-blur-xl flex items-center justify-center z-50 p-6">
          {/* Step 3: modalRef yahan attach kiya */}
          <div ref={modalRef} className="bg-white w-full max-w-lg rounded-[3.5rem] p-12 shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-gray-300 hover:text-black transition-colors"><X size={24}/></button>
            
            <h2 className="text-2xl font-black mb-1 uppercase text-[#1A202C]">Collection Details</h2>
            <p className="text-[10px] text-gray-400 font-bold mb-10 uppercase tracking-widest italic">Magnetify Studio Elite</p>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Collection Title</label>
                <input 
                  className="w-full border-2 border-gray-100 bg-gray-50 p-5 rounded-2xl font-bold outline-none focus:border-[#2B6CB0] transition-all text-sm" 
                  placeholder="E.G. CLASSIC FRIDGE MAGNETS" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase">
                    Description / Short Story
                  </label>
                  <span className="text-[8px] font-bold text-[#2B6CB0] uppercase bg-[#EBF4FF] px-2 py-0.5 rounded-md">
                    Only 10-15 Words
                  </span>
                </div>
                <textarea 
                  rows={3}
                  className="w-full border-2 border-gray-100 bg-gray-50 p-5 rounded-2xl font-bold outline-none focus:border-[#2B6CB0] transition-all text-sm resize-none" 
                  placeholder="Explain the vibe of this collection in 10-15 words..." 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Cover Media</label>
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-200 bg-gray-50 p-8 rounded-[2.5rem] text-center cursor-pointer hover:border-blue-300 transition-all">
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                  {isUploading ? <Loader2 className="animate-spin mx-auto text-blue-500" /> : 
                   formData.imageUrl ? <img src={formData.imageUrl} className="h-32 mx-auto rounded-2xl object-cover shadow-md" /> : 
                   <div className="py-2"><ImageIcon className="mx-auto text-gray-300 mb-2" size={28} /><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Upload High-Res Cover</span></div>}
                </div>
              </div>

              <button 
                onClick={saveCategory} 
                disabled={isUploading || !formData.imageUrl || !formData.name} 
                className="w-full bg-[#1A202C] text-white py-6 rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase hover:bg-black transition-all shadow-xl disabled:opacity-20 active:scale-95"
              >
                {isUploading ? 'PROCESS...' : editingId ? 'UPDATE COLLECTION' : 'CONFIRM & SAVE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}