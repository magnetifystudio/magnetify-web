"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// 1. Types definition
interface SubCategoryCount {
  count: number;
}

interface Category {
  id: string;
  name: string;
  image_url: string | null;
  display_order: number;
  sub_categories: SubCategoryCount[];
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CategoryManagerPage() {
  const [loading, setLoading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // FETCH: display_order ke hisaab se sort karke data mangwana
  const fetchCategories = async () => {
    console.log("Fetching categories from DB...");
    const { data, error } = await supabase
      .from("categories")
      .select(`
        id, 
        name, 
        image_url, 
        display_order,
        sub_categories(count)
      `)
      .order("display_order", { ascending: true });

    if (!error && data) {
      setCategories(data as any);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  // FINAL REORDER LOGIC (Zero-Start Approach)
  const handleMove = async (currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= categories.length || reordering) return;

    setReordering(true);

    // 1. Local copy mein swap (Optimistic UI)
    const updatedCategories = [...categories];
    const [movedItem] = updatedCategories.splice(currentIndex, 1);
    updatedCategories.splice(targetIndex, 0, movedItem);

    // Screen par turant dikhao
    setCategories(updatedCategories);

    try {
      console.log("Syncing new order to Database...");
      
      // 2. Loop update: Har item ko uske naye index (0, 1, 2...) ke hisaab se update karo
      for (let i = 0; i < updatedCategories.length; i++) {
        const { error } = await supabase
          .from('categories')
          .update({ display_order: i })
          .eq('id', updatedCategories[i].id);
        
        if (error) throw error;
      }
      
      console.log("DB Sync Complete!");
      // 3. Final fetch taaki confirm ho jaye ki DB mein wahi hai jo screen par hai
      await fetchCategories();

    } catch (err: any) {
      console.error("Move Error:", err);
      alert("Database Update Failed: " + err.message);
      fetchCategories(); // Error pe rollback
    } finally {
      setReordering(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!newCatName) return alert("Please enter name");
    if (!selectedFile) return alert("Please upload icon");
    setLoading(true);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `category-icons/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);

      const maxOrder = categories.length > 0 
        ? Math.max(...categories.map(c => c.display_order)) 
        : 0;

      const { error: catError } = await supabase
        .from("categories")
        .insert([{ 
          name: newCatName, 
          slug: newCatName.toLowerCase().replace(/ /g, "-"),
          image_url: publicUrl,
          display_order: maxOrder + 1 
        }]);

      if (catError) throw catError;

      setNewCatName("");
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchCategories();
      alert("Category Saved Successfully!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete category?")) {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (!error) fetchCategories();
    }
  };

  return (
    <div className="p-6 bg-[#f3f3f3] min-h-screen">
      <h1 className="text-[20px] mb-6 font-bold uppercase tracking-tighter text-[#232f3e]">
        Manage Product Classification
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white border border-[#adb5bd] rounded-[3px] shadow-lg">
          <div className="bg-[#f0f2f2] p-4 border-b border-[#adb5bd]">
            <h2 className="text-[14px] font-bold uppercase">Create New Category</h2>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <input 
                type="text" 
                placeholder="Category Name"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full border border-gray-400 p-2 text-[14px] rounded outline-none focus:border-orange-400" 
              />
              <button onClick={handleSave} disabled={loading} className="bg-[#232f3e] text-white py-2 px-6 rounded font-bold hover:bg-black transition-all">
                {loading ? "Saving..." : "Save Category"}
              </button>
            </div>
            <div className="relative aspect-square border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-[#fafafa]">
                {previewUrl ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-gray-300">📸 Upload Icon</span>}
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-[#adb5bd] rounded-[3px] shadow-md">
          <div className="bg-gray-100 p-3 border-b border-gray-300 flex justify-between">
             <span className="text-[11px] font-black uppercase text-gray-500">Live Inventory</span>
             {reordering && <span className="text-[10px] text-orange-600 animate-pulse font-bold">Syncing...</span>}
          </div>
          <table className="w-full text-[12px]">
            <thead className="bg-gray-50 uppercase text-gray-500 font-bold border-b">
              <tr>
                <th className="p-3 text-left">Order / Name</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c, index) => (
                <tr key={c.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-3 flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <button 
                        disabled={index === 0 || reordering}
                        onClick={() => handleMove(index, 'up')}
                        className="text-[14px] hover:scale-125 disabled:opacity-10 transition-transform"
                      >
                        🔼
                      </button>
                      <button 
                        disabled={index === categories.length - 1 || reordering}
                        onClick={() => handleMove(index, 'down')}
                        className="text-[14px] hover:scale-125 disabled:opacity-10 transition-transform"
                      >
                        🔽
                      </button>
                    </div>
                    {c.image_url && <img src={c.image_url} alt={c.name} className="w-8 h-8 rounded-md object-cover border border-gray-200" />}
                    <div className="flex flex-col">
                      <span className="font-bold text-[#007185] text-[13px]">{c.name}</span>
                      <span className="text-[9px] text-gray-400 uppercase">Order: {c.display_order}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:underline font-bold">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}