"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Plus, Trash2, Clock, ChevronDown, Tag, Pencil } from "lucide-react";

type Category = { id: string; name: string; slug: string };
type SubCategory = { id: string; name: string; category_id: string };
type Product = { id: string; title_name: string; sub_category_id: string };

type Offer = {
  id: string;
  offer_label: string;
  discount_type: "percentage" | "flat" | "bogo";
  discount_value: number;
  expiry_at: string | null;
  is_active: boolean;
  target_category_id: string | null;
  target_sub_category_id: string | null;
  target_product_id: string | null;
  show_timer: boolean;
  timer_color: string;
  timer_size: "small" | "medium" | "large";
};

const EMPTY_OFFER: Omit<Offer, "id"> = {
  offer_label: "Limited Time Offer",
  discount_type: "percentage",
  discount_value: 20,
  expiry_at: null,
  is_active: false,
  target_category_id: null,
  target_sub_category_id: null,
  target_product_id: null,
  show_timer: true,
  timer_color: "#dc2626",
  timer_size: "medium",
};

export default function SpecialOffersPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Dropdown data
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Filtered
  const [filteredSubs, setFilteredSubs] = useState<SubCategory[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Countdown for preview
  const [countdown, setCountdown] = useState({ h: "00", m: "00", s: "00" });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Fetch all data ──
  useEffect(() => {
    const init = async () => {
      const [{ data: offersData }, { data: cats }, { data: subs }, { data: prods }] = await Promise.all([
        supabase.from("special_offers").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("id, name, slug").order("name"),
        supabase.from("sub_categories").select("id, name, category_id").order("name"),
        supabase.from("magnetify_products").select("id, title_name, sub_category_id").eq("is_active", true).order("title_name"),
      ]);
      setOffers(offersData || []);
      setCategories(cats || []);
      setSubCategories(subs || []);
      setProducts(prods || []);
      setLoading(false);
    };
    init();
  }, []);

  // ── Cascade filtering ──
  useEffect(() => {
    if (!editingOffer) return;
    if (editingOffer.target_category_id) {
      setFilteredSubs(subCategories.filter(s => s.category_id === editingOffer.target_category_id));
    } else {
      setFilteredSubs([]);
    }
  }, [editingOffer?.target_category_id, subCategories]);

  useEffect(() => {
    if (!editingOffer) return;
    if (editingOffer.target_sub_category_id) {
      setFilteredProducts(products.filter(p => p.sub_category_id === editingOffer.target_sub_category_id));
    } else {
      setFilteredProducts([]);
    }
  }, [editingOffer?.target_sub_category_id, products]);

  // ── Live countdown ──
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!editingOffer?.expiry_at) { setCountdown({ h: "00", m: "00", s: "00" }); return; }
    const tick = () => {
      const diff = new Date(editingOffer.expiry_at!).getTime() - Date.now();
      if (diff <= 0) { setCountdown({ h: "00", m: "00", s: "00" }); return; }
      setCountdown({
        h: String(Math.floor(diff / 3600000)).padStart(2, "0"),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0"),
        s: String(Math.floor((diff % 60000) / 1000)).padStart(2, "0"),
      });
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [editingOffer?.expiry_at]);

  // ── Handlers ──
  const handleNew = () => {
    setEditingOffer({ id: "", ...EMPTY_OFFER });
    setIsNew(true);
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer({ ...offer });
    setIsNew(false);
  };

  const handleCancel = () => {
    setEditingOffer(null);
    setIsNew(false);
  };

  const updateField = (field: keyof Offer, value: unknown) => {
    setEditingOffer(prev => {
      if (!prev) return prev;
      // Reset downstream when parent changes
      if (field === "target_category_id") {
        return { ...prev, [field]: value as string | null, target_sub_category_id: null, target_product_id: null };
      }
      if (field === "target_sub_category_id") {
        return { ...prev, [field]: value as string | null, target_product_id: null };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSave = async () => {
    if (!editingOffer) return;
    setSaving(true);

    const payload = {
      offer_label: editingOffer.offer_label,
      discount_type: editingOffer.discount_type,
      discount_value: editingOffer.discount_value,
      expiry_at: editingOffer.expiry_at ? new Date(editingOffer.expiry_at).toISOString() : null,
      is_active: editingOffer.is_active,
      target_category_id: editingOffer.target_category_id || null,
      target_sub_category_id: editingOffer.target_sub_category_id || null,
      target_product_id: editingOffer.target_product_id || null,
      show_timer: editingOffer.show_timer,
      timer_color: editingOffer.timer_color,
      timer_size: editingOffer.timer_size,
      updated_at: new Date().toISOString(),
    };

    if (isNew) {
      const { data, error } = await supabase.from("special_offers").insert(payload).select().single();
      if (!error && data) setOffers(prev => [data, ...prev]);
    } else {
      const { error } = await supabase.from("special_offers").update(payload).eq("id", editingOffer.id);
      if (!error) setOffers(prev => prev.map(o => o.id === editingOffer.id ? { ...editingOffer, ...payload } : o));
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); setEditingOffer(null); setIsNew(false); }, 1200);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Is offer ko delete karna chahte ho?")) return;
    setDeleting(id);
    await supabase.from("special_offers").delete().eq("id", id);
    setOffers(prev => prev.filter(o => o.id !== id));
    setDeleting(null);
    if (editingOffer?.id === id) setEditingOffer(null);
  };

  const toggleActive = async (offer: Offer) => {
    await supabase.from("special_offers").update({ is_active: !offer.is_active }).eq("id", offer.id);
    setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, is_active: !o.is_active } : o));
  };

  // ── Helpers ──
  const getTargetLabel = (offer: Offer) => {
    if (offer.target_product_id) {
      return "📦 " + (products.find(p => p.id === offer.target_product_id)?.title_name || "Product");
    }
    if (offer.target_sub_category_id) {
      return "📂 " + (subCategories.find(s => s.id === offer.target_sub_category_id)?.name || "SubCategory");
    }
    if (offer.target_category_id) {
      return "🗂️ " + (categories.find(c => c.id === offer.target_category_id)?.name || "Category");
    }
    return "🌐 All Products";
  };

  const getDiscountLabel = (o: Offer) => {
    if (o.discount_type === "percentage") return `${o.discount_value}% OFF`;
    if (o.discount_type === "flat") return `₹${o.discount_value} OFF`;
    return "BUY 1 GET 1";
  };

  const getPreviewPrice = () => {
    if (!editingOffer) return { final: 999, original: 999 };
    if (editingOffer.discount_type === "percentage")
      return { final: Math.round(999 * (1 - editingOffer.discount_value / 100)), original: 999 };
    if (editingOffer.discount_type === "flat")
      return { final: Math.max(0, 999 - editingOffer.discount_value), original: 999 };
    return { final: 999, original: 999 };
  };

  const timerSizeClass = { small: "text-[16px]", medium: "text-[22px]", large: "text-[28px]" }[editingOffer?.timer_size || "medium"];

  const inputCls = "w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-[#FEDE00]/50 transition-all";
  const labelCls = "block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2";
  const selectCls = `${inputCls} cursor-pointer`;

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#FEDE00]" size={28} />
    </div>
  );

  const { final, original } = getPreviewPrice();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">

      {/* ── Header ── */}
      <div className="border-b border-white/5 px-8 py-6 sticky top-0 bg-[#0A0A0A] z-40">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">Special Offers</h1>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Magnetify Studio / Marketing</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[11px] font-black uppercase tracking-widest text-white/40">
              <span className="text-[#FEDE00] font-black">{offers.filter(o => o.is_active).length}</span> Active
              <span className="mx-1 text-white/20">/</span>
              <span>{offers.length}</span> Total
            </div>
            {editingOffer ? (
              <>
                <button onClick={handleCancel}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-white/40 text-[11px] font-black uppercase hover:border-white/20 hover:text-white/60 transition-all">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FEDE00] text-black text-[11px] font-black uppercase hover:scale-[0.98] transition-all disabled:opacity-50">
                  {saving && <Loader2 className="animate-spin" size={13} />}
                  {saved ? "✓ Saved!" : saving ? "Saving..." : isNew ? "Create Offer" : "Update Offer"}
                </button>
              </>
            ) : (
              <button onClick={handleNew}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FEDE00] text-black text-[11px] font-black uppercase hover:scale-[0.98] transition-all">
                <Plus size={14} /> New Offer
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {editingOffer ? (
          /* ── EDIT / CREATE MODE ── */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* LEFT: Form */}
            <div className="space-y-4">

              {/* Status */}
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-5">
                <p className={labelCls}>Controls</p>
                <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  editingOffer.is_active ? "bg-[#FEDE00]/5 border-[#FEDE00]/20" : "bg-white/[0.02] border-white/5"
                }`}>
                  <div>
                    <p className="text-[13px] font-black">Offer Status</p>
                    <p className="text-[11px] text-white/30 mt-0.5">Enable or disable this offer</p>
                  </div>
                  <button onClick={() => updateField("is_active", !editingOffer.is_active)}
                    className={`relative w-11 h-6 rounded-full border-2 transition-all ${
                      editingOffer.is_active ? "bg-[#FEDE00] border-[#FEDE00]" : "bg-white/5 border-white/10"
                    }`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                      editingOffer.is_active ? "left-5 bg-black" : "left-0.5 bg-white/30"
                    }`} />
                  </button>
                </div>
              </div>

              {/* Offer Config */}
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 space-y-4">
                <p className={labelCls}>Offer Configuration</p>

                <div>
                  <label className={labelCls}>Offer Label</label>
                  <input type="text" value={editingOffer.offer_label}
                    onChange={e => updateField("offer_label", e.target.value)}
                    placeholder="e.g. Deal of the Day" className={inputCls} />
                </div>

                {/* Discount Type */}
                <div>
                  <label className={labelCls}>Discount Type</label>
                  <div className="flex gap-2">
                    {[
                      { val: "percentage", icon: "%", label: "Percentage" },
                      { val: "flat", icon: "₹", label: "Flat Amount" },
                      { val: "bogo", icon: "🎁", label: "Buy 1 Get 1" },
                    ].map(({ val, icon, label }) => (
                      <button key={val} onClick={() => updateField("discount_type", val)}
                        className={`flex-1 py-3 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all ${
                          editingOffer.discount_type === val
                            ? "bg-[#FEDE00]/10 border-[#FEDE00]/40 text-[#FEDE00]"
                            : "bg-white/[0.02] border-white/5 text-white/30 hover:border-white/15"
                        }`}>
                        <span className="block text-base mb-1">{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Discount Value + Expiry */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>
                      {editingOffer.discount_type === "bogo" ? "Offer Type" : `Discount Value ${editingOffer.discount_type === "percentage" ? "(%)" : "(₹)"}`}
                    </label>
                    {editingOffer.discount_type === "bogo" ? (
                      <div className="flex items-center gap-2 bg-[#FEDE00]/5 border border-[#FEDE00]/20 rounded-xl px-4 py-2.5">
                        <span className="text-[#FEDE00] text-[12px] font-black">BUY 1 GET 1 FREE</span>
                      </div>
                    ) : (
                      <input type="number" value={editingOffer.discount_value}
                        onChange={e => updateField("discount_value", parseFloat(e.target.value) || 0)}
                        className={inputCls} />
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Expiry Date & Time</label>
                    <input type="datetime-local" value={editingOffer.expiry_at?.slice(0, 16) || ""}
                      onChange={e => updateField("expiry_at", e.target.value)}
                      className={inputCls} style={{ colorScheme: "dark" }} />
                  </div>
                </div>
              </div>

              {/* ── Target Selection ── */}
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 space-y-4">
                <div>
                  <p className={labelCls}>Apply Offer To</p>
                  <p className="text-[11px] text-white/20 mb-4">Choose category → subcategory → product (more specific = higher priority)</p>
                </div>

                {/* Step 1: Category */}
                <div>
                  <label className={labelCls}>Step 1 — Category <span className="text-white/15 normal-case font-normal">(optional)</span></label>
                  <select value={editingOffer.target_category_id || ""}
                    onChange={e => updateField("target_category_id", e.target.value || null)}
                    className={selectCls} style={{ colorScheme: "dark" }}>
                    <option value="">🌐 All Products (no filter)</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Step 2: SubCategory */}
                {editingOffer.target_category_id && (
                  <div>
                    <label className={labelCls}>Step 2 — Sub Category <span className="text-white/15 normal-case font-normal">(optional)</span></label>
                    <select value={editingOffer.target_sub_category_id || ""}
                      onChange={e => updateField("target_sub_category_id", e.target.value || null)}
                      className={selectCls} style={{ colorScheme: "dark" }}>
                      <option value="">📂 Entire Category</option>
                      {filteredSubs.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Step 3: Product */}
                {editingOffer.target_sub_category_id && (
                  <div>
                    <label className={labelCls}>Step 3 — Specific Product <span className="text-white/15 normal-case font-normal">(optional)</span></label>
                    <select value={editingOffer.target_product_id || ""}
                      onChange={e => updateField("target_product_id", e.target.value || null)}
                      className={selectCls} style={{ colorScheme: "dark" }}>
                      <option value="">📦 Entire SubCategory</option>
                      {filteredProducts.map(p => (
                        <option key={p.id} value={p.id}>{p.title_name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Target summary pill */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-[#FEDE00]/5 border border-[#FEDE00]/15 rounded-xl">
                  <Tag size={12} className="text-[#FEDE00]" />
                  <span className="text-[11px] font-black text-[#FEDE00]/80">
                    Offer will apply to: {getTargetLabel(editingOffer)}
                  </span>
                </div>
              </div>

              {/* Timer */}
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={labelCls}>Countdown Timer</p>
                    <p className="text-[11px] text-white/20">Creates urgency — boosts conversion by 30%</p>
                  </div>
                  <button onClick={() => updateField("show_timer", !editingOffer.show_timer)}
                    className={`relative w-11 h-6 rounded-full border-2 transition-all ${
                      editingOffer.show_timer ? "bg-[#FEDE00] border-[#FEDE00]" : "bg-white/5 border-white/10"
                    }`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                      editingOffer.show_timer ? "left-5 bg-black" : "left-0.5 bg-white/30"
                    }`} />
                  </button>
                </div>

                {editingOffer.show_timer && (
                  <>
                    <div>
                      <label className={labelCls}>Timer Color</label>
                      <div className="flex items-center gap-3 flex-wrap">
                        <input type="color" value={editingOffer.timer_color}
                          onChange={e => updateField("timer_color", e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent" />
                        <input type="text" value={editingOffer.timer_color}
                          onChange={e => updateField("timer_color", e.target.value)}
                          className="w-28 bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-[13px] text-white font-mono outline-none focus:border-[#FEDE00]/50" />
                        <div className="flex gap-2">
                          {["#dc2626", "#FEDE00", "#16a34a", "#2563eb", "#9333ea", "#ea580c"].map(c => (
                            <button key={c} onClick={() => updateField("timer_color", c)}
                              className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${editingOffer.timer_color === c ? "border-white scale-110" : "border-transparent"}`}
                              style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Timer Size</label>
                      <div className="flex gap-2">
                        {(["small", "medium", "large"] as const).map(size => (
                          <button key={size} onClick={() => updateField("timer_size", size)}
                            className={`flex-1 py-3 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all ${
                              editingOffer.timer_size === size
                                ? "bg-[#FEDE00]/10 border-[#FEDE00]/40 text-[#FEDE00]"
                                : "bg-white/[0.02] border-white/5 text-white/30 hover:border-white/15"
                            }`}>
                            {size === "small" ? "📱" : size === "medium" ? "💻" : "🖥️"}
                            <span className="block mt-1 capitalize">{size}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* RIGHT: Preview */}
            <div className="lg:sticky lg:top-28 self-start">
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]"
                  style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                <div className="absolute top-4 left-5 text-[9px] font-black uppercase tracking-widest text-white/20">Live Preview</div>

                <div className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden w-[240px] transition-all duration-500 ${editingOffer.is_active ? "scale-100 opacity-100" : "scale-95 opacity-30"}`}>
                  <div className="relative h-44 bg-gray-100 flex items-center justify-center">
                    <div className="absolute top-0 left-0 px-3 py-1.5 rounded-br-xl text-white text-[11px] font-black"
                      style={{ backgroundColor: editingOffer.timer_color }}>
                      {getDiscountLabel(editingOffer)}
                    </div>
                    {editingOffer.offer_label && (
                      <div className="absolute top-0 right-0 px-2 py-1.5 bg-black/50 rounded-bl-xl text-white text-[9px] font-black uppercase tracking-wider">
                        {editingOffer.offer_label}
                      </div>
                    )}
                    <Tag size={28} className="text-gray-300" />
                  </div>
                  <div className="p-4">
                    <p className="text-[13px] font-bold text-gray-800">Custom Photo Magnet</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{getTargetLabel(editingOffer)}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      {editingOffer.discount_type !== "bogo" ? (
                        <>
                          <span className="text-[17px] font-black text-gray-900">₹{final}</span>
                          <span className="text-[11px] text-gray-400 line-through">₹{original}</span>
                          {editingOffer.discount_type === "percentage" && (
                            <span className="text-[10px] font-black text-green-600">{editingOffer.discount_value}% off</span>
                          )}
                        </>
                      ) : (
                        <span className="text-[14px] font-black text-[#FEDE00]">BUY 1 GET 1 FREE 🎁</span>
                      )}
                    </div>

                    {editingOffer.show_timer && (
                      <div className="mt-3 rounded-xl p-2.5 flex justify-center items-center gap-2"
                        style={{ backgroundColor: `${editingOffer.timer_color}15`, border: `1px solid ${editingOffer.timer_color}30` }}>
                        <Clock size={11} style={{ color: editingOffer.timer_color }} />
                        {[{ val: countdown.h, label: "HRS" }, { val: countdown.m, label: "MIN" }, { val: countdown.s, label: "SEC" }].map(({ val, label }, i) => (
                          <div key={label} className="flex items-center gap-2">
                            {i > 0 && <span className="font-black text-[14px]" style={{ color: editingOffer.timer_color }}>:</span>}
                            <div className="text-center">
                              <p className={`font-black leading-none ${timerSizeClass}`} style={{ color: editingOffer.timer_color }}>{val}</p>
                              <p className="text-[7px] font-black uppercase tracking-widest mt-0.5" style={{ color: `${editingOffer.timer_color}80` }}>{label}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button className="w-full mt-3 py-2 text-[12px] font-black rounded-xl text-black" style={{ backgroundColor: "#FEDE00" }}>
                      Add to Cart
                    </button>
                  </div>
                </div>

                {!editingOffer.is_active && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-white/5 border border-white/10 text-white/40 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest">
                      Offer is Disabled
                    </span>
                  </div>
                )}

                <p className="relative mt-5 text-[10px] text-white/20 font-bold uppercase tracking-widest text-center">
                  Updates as you type
                </p>
              </div>
            </div>
          </div>

        ) : (
          /* ── LIST MODE ── */
          <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">

            {/* Table header */}
            <div className="grid grid-cols-[1fr_120px_140px_100px_80px_80px] gap-4 px-6 py-4 border-b border-white/5 bg-white/[0.02]">
              {["Offer", "Discount", "Target", "Expiry", "Status", ""].map((h, i) => (
                <div key={i} className="text-[9px] font-black uppercase tracking-widest text-white/25">{h}</div>
              ))}
            </div>

            {offers.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-white/20 font-black uppercase text-xs tracking-widest">No offers yet</p>
                <p className="text-white/10 text-[11px] mt-2">Click "New Offer" to create your first special offer</p>
              </div>
            ) : (
              offers.map(offer => (
                <div key={offer.id}
                  className="grid grid-cols-[1fr_120px_140px_100px_80px_80px] gap-4 px-6 py-4 border-b border-white/[0.04] items-center hover:bg-white/[0.02] transition-all">

                  <div>
                    <p className="text-[13px] font-black text-white">{offer.offer_label}</p>
                    {offer.show_timer && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock size={10} style={{ color: offer.timer_color }} />
                        <span className="text-[10px] font-bold" style={{ color: offer.timer_color }}>Timer On</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="px-2 py-1 rounded-lg text-[11px] font-black text-white"
                      style={{ backgroundColor: `${offer.timer_color}25`, color: offer.timer_color }}>
                      {getDiscountLabel(offer)}
                    </span>
                  </div>

                  <div className="text-[11px] text-white/40 font-medium truncate">
                    {getTargetLabel(offer)}
                  </div>

                  <div className="text-[11px] text-white/30 font-medium">
                    {offer.expiry_at
                      ? new Date(offer.expiry_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
                      : <span className="text-white/15">No expiry</span>}
                  </div>

                  {/* Toggle */}
                  <div>
                    <button onClick={() => toggleActive(offer)}
                      className={`relative w-10 h-5 rounded-full border-2 transition-all ${
                        offer.is_active ? "bg-green-500 border-green-500" : "bg-white/5 border-white/10"
                      }`}>
                      <span className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${
                        offer.is_active ? "left-4 bg-white" : "left-0.5 bg-white/30"
                      }`} />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => handleEdit(offer)}
                      className="p-2 rounded-xl hover:bg-white/5 text-white/20 hover:text-white transition-all">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(offer.id)} disabled={deleting === offer.id}
                      className="p-2 rounded-xl hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all">
                      {deleting === offer.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}