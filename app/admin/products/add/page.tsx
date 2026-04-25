"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Plus, Edit2, Trash2, ArrowRight, ArrowUp, ArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function InventoryFunctionalPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentCatId, setCurrentCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });
    
    if (data) setCategories(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!catName) return;
    const slug = catName.toLowerCase().replace(/ /g, "-");

    if (modalMode === "add") {
      const { error } = await supabase
        .from("categories")
        .insert([{ 
          name: catName, 
          slug, 
          display_order: categories.length > 0 
            ? Math.max(...categories.map(c => c.display_order)) + 1 
            : 0,
          image_url: "https://via.placeholder.com/400x300?text=Magnetify" 
        }]);
      if (!error) fetchCategories();
    } else {
      const { error } = await supabase
        .from("categories")
        .update({ name: catName, slug })
        .eq("id", currentCatId);
      if (!error) fetchCategories();
    }
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this category?")) {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (!error) fetchCategories();
    }
  };

  // UPDATED: Actual Reorder Logic (Zero-Start Approach)
  const moveCategory = async (currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= categories.length || reordering) return;

    setReordering(true);

    // 1. Local State Swap (Optimistic UI)
    const updated = [...categories];
    const [movedItem] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, movedItem);
    setCategories(updated);

    // 2. Database Sync
    try {
      console.log("Syncing to DB...");
      for (let i = 0; i < updated.length; i++) {
        const { error } = await supabase
          .from('categories')
          .update({ display_order: i })
          .eq('id', updated[i].id);
        
        if (error) throw error;
      }
      console.log("DB Updated!");
    } catch (err: any) {
      console.error("Sync Error:", err);
      alert("Database failed to update. Refreshing...");
      fetchCategories(); // Rollback
    } finally {
      setReordering(false);
    }
  };

  const openEditModal = (cat: any) => {
    setModalMode("edit");
    setCurrentCatId(cat.id);
    setCatName(cat.name);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCatName("");
    setCurrentCatId(null);
    setModalMode("add");
  };

  return (
    <div style={{ backgroundColor: "#F9FAFB", minHeight: "100vh", padding: "40px 5%", fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
        <div>
           <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#111827", margin: "0" }}>INVENTORY</h1>
           <p style={{ color: "#6B7280", fontSize: "14px" }}>
             {reordering ? "🔄 SYNCING ORDER..." : "Manage your store collections and ranking"}
           </p>
        </div>
        <button 
          onClick={() => { setModalMode("add"); setIsModalOpen(true); }}
          style={{ backgroundColor: "#1A365D", color: "white", padding: "12px 24px", borderRadius: "8px", border: "none", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Plus size={18} /> CREATE CATEGORY
        </button>
      </div>

      {/* Grid Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "25px" }}>
        {categories.map((cat, index) => (
          <div key={cat.id} style={{ backgroundColor: "white", borderRadius: "12px", overflow: "hidden", border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", opacity: reordering ? 0.7 : 1 }}>
            <div style={{ height: "200px", position: "relative" }}>
              <img src={cat.image_url} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            
            <div style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", marginBottom: "15px" }}>{cat.name}</h3>
              
              <button 
                onClick={() => router.push(`/admin/inventory/${cat.id}`)}
                style={{ width: "100%", backgroundColor: "#F3F4F6", color: "#111827", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "15px" }}
              >
                MANAGE ITEMS <ArrowRight size={16} />
              </button>

              <div style={{ display: "flex", borderTop: "1px solid #F3F4F6", paddingTop: "15px", justifyContent: "space-between", alignItems: "center" }}>
                
                {/* Reorder Group - Passing INDEX instead of ID */}
                <div style={{ display: "flex", gap: "5px" }}>
                  <button 
                    disabled={index === 0 || reordering}
                    onClick={() => moveCategory(index, 'up')} 
                    style={{ padding: "6px", backgroundColor: "#f8f9fa", border: "1px solid #ddd", borderRadius: "4px", cursor: index === 0 ? "not-allowed" : "pointer", opacity: index === 0 ? 0.3 : 1 }} 
                    title="Move Up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button 
                    disabled={index === categories.length - 1 || reordering}
                    onClick={() => moveCategory(index, 'down')} 
                    style={{ padding: "6px", backgroundColor: "#f8f9fa", border: "1px solid #ddd", borderRadius: "4px", cursor: index === categories.length - 1 ? "not-allowed" : "pointer", opacity: index === categories.length - 1 ? 0.3 : 1 }} 
                    title="Move Down"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                {/* Edit/Delete Group */}
                <div style={{ display: "flex", gap: "15px" }}>
                  <button 
                    onClick={() => openEditModal(cat)}
                    style={{ background: "none", border: "none", fontSize: "12px", fontWeight: "700", color: "#6B7280", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    style={{ background: "none", border: "none", fontSize: "12px", fontWeight: "700", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: "0", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", width: "400px", borderRadius: "16px", padding: "30px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "20px" }}>{modalMode === "add" ? "NEW CATEGORY" : "EDIT CATEGORY"}</h2>
            <input 
              type="text" 
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="e.g. Classic Magnets"
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #D1D5DB", marginBottom: "20px" }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleSave} style={{ flex: 1, backgroundColor: "#1A365D", color: "white", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "700" }}>SAVE</button>
              <button onClick={closeModal} style={{ flex: 1, backgroundColor: "#F3F4F6", color: "#4B5563", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "700" }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}