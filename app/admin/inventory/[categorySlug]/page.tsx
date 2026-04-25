"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { addSubCategoryAction, deleteSubCategoryAction, moveSubCategoryAction } from './actions';

export default function CategoryManagementPage({ params }: { params: Promise<{ categorySlug: string }> }) {
  const [categorySlug, setCategorySlug] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [categoryName, setCategoryName] = useState<string>("");
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newName, setNewName] = useState("");

  const supabase = createClient();

  const resetForm = () => {
    setNewName("");
    setShowAddModal(false);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') resetForm();
    };
    if (showAddModal) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showAddModal]);

  useEffect(() => {
    params.then(({ categorySlug }) => {
      setCategorySlug(categorySlug); // ✅ slug save karo
      fetchData(categorySlug);
    });
  }, []);

  const fetchData = async (slug: string) => {
    const { data: cat } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('slug', slug)
      .single();

    if (cat) {
      setCategoryId(cat.id);
      setCategoryName(cat.name);

      const { data: subs } = await supabase
        .from('sub_categories')
        .select('*')
        .eq('category_id', cat.id)
        .order('display_order', { ascending: true });

      setSubCategories(subs || []);
    }
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return alert("Please enter a name");

    const formData = new FormData();
    formData.append('name', newName);

    await addSubCategoryAction(categoryId, formData);
    resetForm();
    fetchData(categorySlug); // slug use karo
  };

  const handleDelete = async (id: string) => {
    if (!confirm("DANGER: This will delete the sub-category permanently. Proceed?")) return;
    await deleteSubCategoryAction(id, categoryId);
    fetchData(categorySlug); // slug use karo
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= subCategories.length) return;

    const updated = [...subCategories];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSubCategories(updated);

    const current = subCategories[index];
    const target = subCategories[targetIndex];

    await moveSubCategoryAction(
      current.id, target.display_order,
      target.id, current.display_order,
      categoryId
    );

    fetchData(categorySlug); // slug use karo
  };

  if (loading) return (
    <div className="p-20 bg-[#020617] text-[#FEDE00] font-bold text-center tracking-widest animate-pulse uppercase">
      Initializing System...
    </div>
  );

  return (
    <div className="p-8 bg-[#020617] min-h-screen text-white font-sans">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <Link
            href="/admin/inventory"
            className="text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-[#FEDE00] transition-colors"
          >
            ← Back to Inventory
          </Link>
          <h1 className="text-4xl font-black uppercase text-[#FEDE00] italic leading-none mt-2">
            {categoryName}
          </h1>
          <p className="text-gray-500 text-[10px] mt-2 font-bold tracking-widest uppercase">
            Magnetify Studio / Sub-Categories
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#FEDE00] text-black px-8 py-3 rounded-full font-black uppercase text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(254,222,0,0.3)]"
        >
          + Add Sub-Category
        </button>
      </div>

      {/* SUB-CATEGORY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {subCategories.map((sub: any, idx) => (
          <div
            key={sub.id}
            className="bg-[#0F172A] border border-white/5 p-6 rounded-[2rem] shadow-2xl hover:border-[#FEDE00]/30 transition-colors group flex flex-col"
          >
            <div className="flex flex-col mb-6 flex-grow">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-[#FEDE00] text-xl font-black uppercase italic tracking-tighter truncate max-w-[180px]">
                  {sub.name}
                </h2>
                <div className="flex bg-black rounded-xl p-1 border border-white/5">
                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="px-3 py-1 disabled:opacity-10 text-[#FEDE00] hover:bg-[#FEDE00]/10 rounded-lg transition-colors"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === subCategories.length - 1}
                    className="px-3 py-1 disabled:opacity-10 text-[#FEDE00] hover:bg-[#FEDE00]/10 rounded-lg transition-colors"
                  >
                    ↓
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(sub.id)}
                className="flex-1 bg-red-500/10 text-red-500 py-3 rounded-xl text-[10px] font-black uppercase border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
              >
                Delete
              </button>
              {/* ✅ FIX: categoryId ki jagah categorySlug use karo */}
              {/* ✅ FIX: sub.id ki jagah sub.slug use karo */}
              <Link
                href={`/admin/inventory/${categorySlug}/${sub.slug}`}
                className="flex-[2] block text-center bg-white/5 text-white hover:bg-[#FEDE00] hover:text-black py-3 rounded-xl font-black uppercase text-[10px] transition-all border border-white/10 hover:border-[#FEDE00]"
              >
                Manage Products
              </Link>
            </div>
          </div>
        ))}

        {subCategories.length === 0 && (
          <div className="col-span-full py-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center">
            <p className="text-gray-600 font-black uppercase text-xs tracking-widest">
              No sub-categories found. Create your first one.
            </p>
          </div>
        )}
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}
          className="fixed inset-0 bg-[#020617]/95 backdrop-blur-md flex items-center justify-center z-50 p-4 cursor-pointer"
        >
          <div className="bg-[#0F172A] border border-[#FEDE00]/30 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl cursor-default">
            <div className="text-center mb-8">
              <h2 className="text-[#FEDE00] text-2xl font-black uppercase italic tracking-tighter">
                Create Sub-Category
              </h2>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                New Entry Details
              </p>
            </div>

            <form onSubmit={handleAdd} className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase font-black text-gray-400 mb-2 ml-1 tracking-widest">
                  Sub-Category Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. ROUND SHAPE"
                  className="w-full bg-black border border-white/5 rounded-2xl px-5 py-4 text-white focus:border-[#FEDE00] outline-none transition-colors font-bold uppercase placeholder:text-gray-800"
                />
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
                  className="flex-[2] bg-[#FEDE00] text-black py-4 rounded-2xl font-black uppercase text-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Confirm & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
