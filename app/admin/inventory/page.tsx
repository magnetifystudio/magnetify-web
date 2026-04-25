"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client'; 
import Link from 'next/link';
import { 
  Category, 
  deleteCategoryAction, 
  moveCategoryAction, 
  addCategoryAction, 
  uploadImageAction 
} from './actions';

export default function InventoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form States
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState(""); 
  const [newCatImage, setNewCatImage] = useState("");
  const [isuploading, setIsuploading] = useState(false);
  
  const supabase = createClient();

  const resetForm = () => {
    setNewCatName("");
    setNewCatDesc("");
    setNewCatImage("");
    setShowAddModal(false);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') resetForm();
    };
    if (showAddModal) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showAddModal]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error) setCategories((data as any[]) || []);
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsuploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadImageAction(formData);
    
    if (result.success && result.url) {
      setNewCatImage(result.url);
    } else {
      alert("Upload failed: " + result.error);
    }
    setIsuploading(false);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return alert("Please enter a name");

    const result = await addCategoryAction({
      name: newCatName,
      description: newCatDesc, 
      image_url: newCatImage || ""
    });

    if (result.success) {
      resetForm();
      fetchCategories();
    } else {
      alert("Error: " + result.error);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const current = categories[index];
    const target = categories[targetIndex];

    const result = await moveCategoryAction(current.id, target.display_order, target.id, current.display_order);
    if (!result.error) {
      fetchCategories(); 
    }
  };

  if (loading) return (
    <div className="p-20 bg-[#020617] text-[#FEDE00] font-bold font-montserrat text-center tracking-widest animate-pulse uppercase">
      Initializing System...
    </div>
  );

  return (
    <div className="p-8 bg-[#020617] min-h-screen text-white font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-12">
        <div>
           <h1 className="text-4xl font-black uppercase text-[#FEDE00] italic leading-none">Main Inventory</h1>
           <p className="text-gray-500 text-[10px] mt-2 font-bold tracking-widest uppercase">Magnetify Studio / Admin Panel</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#FEDE00] text-black px-8 py-3 rounded-full font-black uppercase text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(254,222,0,0.3)]"
        >
          + Add New Category
        </button>
      </div>

      {/* CATEGORY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat: any, idx) => (
          <div key={cat.id} className="bg-[#0F172A] border border-white/5 p-6 rounded-[2rem] shadow-2xl hover:border-[#FEDE00]/30 transition-colors group flex flex-col">
            <div className="relative overflow-hidden rounded-2xl mb-5 aspect-video bg-black">
               {cat.image_url ? (
                 <img src={cat.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
               ) : (
                 <div className="flex items-center justify-center h-full text-gray-700 font-black italic uppercase text-xs">No Visual Data</div>
               )}
            </div>
            
            <div className="flex flex-col mb-6 flex-grow">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-[#FEDE00] text-xl font-black uppercase italic tracking-tighter truncate max-w-[180px]">{cat.name}</h2>
                <div className="flex bg-black rounded-xl p-1 border border-white/5">
                  <button onClick={() => handleMove(idx, 'up')} disabled={idx === 0} className="px-3 py-1 disabled:opacity-10 text-[#FEDE00] hover:bg-[#FEDE00]/10 rounded-lg transition-colors">↑</button>
                  <button onClick={() => handleMove(idx, 'down')} disabled={idx === categories.length - 1} className="px-3 py-1 disabled:opacity-10 text-[#FEDE00] hover:bg-[#FEDE00]/10 rounded-lg transition-colors">↓</button>
                </div>
              </div>
              
              <p className="text-gray-400 text-xs italic line-clamp-2 leading-relaxed">
                {cat.description || "No description provided for this collection."}
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={async () => { 
                  if(confirm("DANGER: This will delete the category permanently. Proceed?")) {
                    await deleteCategoryAction(cat.id, cat.image_url || "");
                    fetchCategories();
                  }
                }}
                className="flex-1 bg-red-500/10 text-red-500 py-3 rounded-xl text-[10px] font-black uppercase border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
              >
                Delete
              </button>
              <Link href={`/admin/inventory/${cat.slug}`} className="flex-[2] block text-center bg-white/5 text-white hover:bg-[#FEDE00] hover:text-black py-3 rounded-xl font-black uppercase text-[10px] transition-all border border-white/10 hover:border-[#FEDE00]">
                Manage Items
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ADD CATEGORY MODAL */}
      {showAddModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) resetForm();
          }}
          className="fixed inset-0 bg-[#020617]/95 backdrop-blur-md flex items-center justify-center z-50 p-4 cursor-pointer"
        >
          <div className="bg-[#0F172A] border border-[#FEDE00]/30 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl cursor-default scale-in-center">
            <div className="text-center mb-8">
              <h2 className="text-[#FEDE00] text-2xl font-black uppercase italic tracking-tighter">Create Category</h2>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">New Entry Details</p>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase font-black text-gray-400 mb-2 ml-1 tracking-widest">Category Name</label>
                <input 
                  type="text" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. LUXE MAGNETS"
                  className="w-full bg-black border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-[#FEDE00] outline-none transition-colors font-bold uppercase placeholder:text-gray-800"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black text-gray-400 mb-2 ml-1 tracking-widest">Description</label>
                <textarea 
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Tell us more about this collection..."
                  className="w-full bg-black border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-[#FEDE00] outline-none transition-all font-bold text-sm min-h-[100px] resize-none placeholder:text-gray-800 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black text-gray-400 mb-2 ml-1 tracking-widest">Cover Image</label>
                <div className="relative group border-2 border-dashed border-white/10 rounded-2xl p-2 transition-all hover:border-[#FEDE00]/50 bg-black/40 aspect-video flex flex-col items-center justify-center overflow-hidden">
                  {newCatImage ? (
                    <div className="relative w-full h-full">
                      <img src={newCatImage} className="w-full h-full object-cover rounded-xl" alt="Preview" />
                      <button 
                        type="button"
                        onClick={() => setNewCatImage("")}
                        className="absolute top-3 right-3 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-lg"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <input 
                        type="file" 
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                        accept="image/*"
                      />
                      <div className="text-center">
                        <div className="text-[#FEDE00] text-3xl mb-1 animate-bounce">↑</div>
                        <p className="text-[10px] text-gray-500 font-black uppercase">
                          {isuploading ? "Uploading..." : "Drop file or click"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={resetForm}
                  className="flex-1 text-gray-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  disabled={isuploading}
                  className="flex-[2] bg-[#FEDE00] text-black py-4 rounded-2xl font-black uppercase text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isuploading ? "Wait..." : "Confirm & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
