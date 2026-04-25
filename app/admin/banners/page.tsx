"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Trash2, ArrowUp, ArrowDown, Upload, Loader2, X } from "lucide-react";

type Banner = {
  id: string;
  image_url: string;
  vibe: string;
  headline: string;
  subheadline: string;
  cta_label: string;
  cta_href: string;
  display_order: number;
  is_active: boolean;
};

type NewBannerForm = Omit<Banner, "id" | "display_order">;

const EMPTY_FORM: NewBannerForm = {
  image_url: "",
  vibe: "",
  headline: "",
  subheadline: "",
  cta_label: "Explore Collection",
  cta_href: "/",
  is_active: true,
};

export default function MainBannersPage() {
  const supabase = createClient();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<NewBannerForm>(EMPTY_FORM);
  const [modalUploading, setModalUploading] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Close modal on backdrop click
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    if (modalOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [modalOpen]);

  const fetchBanners = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("banners")
      .select("*")
      .order("display_order", { ascending: true });
    setBanners(data || []);
    setLoading(false);
  };

  const updateField = (id: string, field: keyof Banner, value: any) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleImageUpload = async (bannerId: string, file: File) => {
    setUploading(bannerId);
    const fileName = `banners/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("category-images").upload(fileName, file);
    if (!error) {
      const { data } = supabase.storage.from("category-images").getPublicUrl(fileName);
      updateField(bannerId, "image_url", data.publicUrl);
      await supabase.from("banners").update({ image_url: data.publicUrl }).eq("id", bannerId);
      showToast("Image uploaded!");
    } else {
      alert(`Upload failed: ${error.message}`);
    }
    setUploading(null);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    for (const banner of banners) {
      await supabase.from("banners").update({
        image_url: banner.image_url,
        vibe: banner.vibe,
        headline: banner.headline,
        subheadline: banner.subheadline,
        cta_label: banner.cta_label,
        cta_href: banner.cta_href,
        display_order: banner.display_order,
        is_active: banner.is_active,
      }).eq("id", banner.id);
    }
    setSaving(false);
    showToast("All banners saved!");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    await supabase.from("banners").delete().eq("id", id);
    setBanners(prev => prev.filter(b => b.id !== id));
    showToast("Banner deleted!");
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;
    const updated = [...banners];
    const temp = updated[index].display_order;
    updated[index].display_order = updated[targetIndex].display_order;
    updated[targetIndex].display_order = temp;
    const tempBanner = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = tempBanner;
    setBanners(updated);
    await supabase.from("banners").update({ display_order: updated[index].display_order }).eq("id", updated[index].id);
    await supabase.from("banners").update({ display_order: updated[targetIndex].display_order }).eq("id", updated[targetIndex].id);
  };

  // ── Modal helpers ──────────────────────────────────────────────

  const openModal = () => {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (modalSaving || modalUploading) return;
    setModalOpen(false);
    setForm(EMPTY_FORM);
  };

  const handleModalImageUpload = async (file: File) => {
    setModalUploading(true);
    const fileName = `banners/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("category-images").upload(fileName, file);
    if (!error) {
      const { data } = supabase.storage.from("category-images").getPublicUrl(fileName);
      setForm(f => ({ ...f, image_url: data.publicUrl }));
    } else {
      alert(`Upload failed: ${error.message}`);
    }
    setModalUploading(false);
  };

  const handleModalSubmit = async (publish: boolean) => {
    if (!form.headline.trim()) {
      alert("Headline required!");
      return;
    }
    setModalSaving(true);
    const maxOrder = banners.reduce((max, b) => Math.max(max, b.display_order), 0);
    const { data, error } = await supabase.from("banners").insert({
      ...form,
      is_active: publish,
      display_order: maxOrder + 1,
    }).select().single();

    if (error) {
      alert(`Failed to save: ${error.message}`);
      setModalSaving(false);
      return;
    }

    if (data) setBanners(prev => [...prev, data]);
    setModalSaving(false);
    setModalOpen(false);
    setForm(EMPTY_FORM);
    showToast(publish ? "Banner published!" : "Banner saved as draft!");
  };

  // ──────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <p className="text-[#FEDE00] font-black uppercase tracking-widest text-xs animate-pulse">Loading Banners...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl text-[13px] font-black shadow-2xl bg-green-500/20 border border-green-500/30 text-green-400">
          ✓ {toast}
        </div>
      )}

      {/* ── Add Banner Modal ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            ref={modalRef}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111111] border border-white/10 rounded-3xl shadow-2xl"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#111111] z-10 flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div>
                <h2 className="text-lg font-black uppercase italic tracking-tight text-white">New Banner</h2>
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-0.5">Fill details then publish or save as draft</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl hover:bg-white/5 text-white/30 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* Image Upload */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">Banner Image <span className="text-white/20">(recommended 1920×620px)</span></p>
                <label className="block">
                  <div className={`relative h-[180px] rounded-2xl overflow-hidden border-2 border-dashed transition-all cursor-pointer ${
                    form.image_url ? "border-white/10" : "border-white/10 hover:border-[#FEDE00]/30"
                  }`} style={{ background: "rgba(255,255,255,0.03)" }}>
                    {form.image_url ? (
                      <>
                        <img src={form.image_url} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="flex items-center gap-2 bg-white/20 backdrop-blur rounded-xl px-4 py-2 text-white text-[12px] font-black uppercase">
                            <Upload size={13} /> Replace Image
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                        {modalUploading ? (
                          <Loader2 size={22} className="text-[#FEDE00] animate-spin" />
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                              <Upload size={16} className="text-white/30" />
                            </div>
                            <div className="text-center">
                              <p className="text-[12px] font-black uppercase tracking-widest text-white/30">Click to upload</p>
                              <p className="text-[10px] text-white/20 mt-0.5">PNG, JPG, WebP</p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    disabled={modalUploading}
                    onChange={(e) => e.target.files?.[0] && handleModalImageUpload(e.target.files[0])}
                  />
                </label>
              </div>

              {/* Vibe + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Eyebrow Text (Vibe)</label>
                  <input
                    type="text"
                    value={form.vibe}
                    onChange={(e) => setForm(f => ({ ...f, vibe: e.target.value }))}
                    placeholder="e.g. Joyful & Gift-Focused"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-[#FEDE00]/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Status</label>
                  <select
                    value={form.is_active ? "active" : "draft"}
                    onChange={(e) => setForm(f => ({ ...f, is_active: e.target.value === "active" }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-white outline-none focus:border-[#FEDE00]/50 transition-all"
                  >
                    <option value="active" style={{ background: "#1a1a1a" }}>Active</option>
                    <option value="draft" style={{ background: "#1a1a1a" }}>Draft</option>
                  </select>
                </div>
              </div>

              {/* Headline */}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">
                  Headline <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.headline}
                  onChange={(e) => setForm(f => ({ ...f, headline: e.target.value }))}
                  placeholder="e.g. The Perfect Gift for Every Story."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-[#FEDE00]/50 transition-all"
                />
              </div>

              {/* Subheadline */}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Description</label>
                <textarea
                  value={form.subheadline}
                  onChange={(e) => setForm(f => ({ ...f, subheadline: e.target.value }))}
                  placeholder="e.g. Whether it is a birthday or an anniversary..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-[#FEDE00]/50 transition-all resize-none"
                />
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Button Text</label>
                  <input
                    type="text"
                    value={form.cta_label}
                    onChange={(e) => setForm(f => ({ ...f, cta_label: e.target.value }))}
                    placeholder="e.g. Explore Collection"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-[#FEDE00]/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Button Link</label>
                  <input
                    type="text"
                    value={form.cta_href}
                    onChange={(e) => setForm(f => ({ ...f, cta_href: e.target.value }))}
                    placeholder="e.g. /shop/classic-magnets"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-[#FEDE00]/50 transition-all"
                  />
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-[#111111] border-t border-white/5 px-6 py-4 flex items-center justify-between gap-3">
              <button
                onClick={closeModal}
                disabled={modalSaving}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all text-[11px] font-black uppercase disabled:opacity-30"
              >
                Cancel
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleModalSubmit(false)}
                  disabled={modalSaving || modalUploading}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all text-[11px] font-black uppercase disabled:opacity-30"
                >
                  {modalSaving ? <Loader2 size={13} className="animate-spin inline mr-1" /> : null}
                  Save as Draft
                </button>
                <button
                  onClick={() => handleModalSubmit(true)}
                  disabled={modalSaving || modalUploading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FEDE00] text-black text-[11px] font-black uppercase hover:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {modalSaving ? <Loader2 size={13} className="animate-spin" /> : null}
                  {modalSaving ? "Publishing..." : "Publish Banner"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-white/5 px-8 py-6 sticky top-0 bg-[#0A0A0A] z-40 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">Main Banners</h1>
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Magnetify Studio / Marketing</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all text-[11px] font-black uppercase"
          >
            <Plus size={13} /> Add Banner
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FEDE00] text-black text-[11px] font-black uppercase hover:scale-[0.98] transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : null}
            {saving ? "Saving..." : "Publish Changes"}
          </button>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">

        {/* Guidelines */}
        <div className="bg-[#FEDE00]/5 border border-[#FEDE00]/20 rounded-2xl p-4 flex gap-3">
          <span className="text-[#FEDE00] text-lg">💡</span>
          <div>
            <p className="text-[#FEDE00] text-[12px] font-black uppercase tracking-widest mb-1">Pro Tip</p>
            <p className="text-white/40 text-[12px] leading-relaxed">
              Banner image recommended size: <strong className="text-white/60">1920x620px</strong>.
              Text fields (vibe, headline etc.) overlay on top of the image — keep images clean without too much text.
            </p>
          </div>
        </div>

        {/* Banners */}
        {banners.map((banner, index) => (
          <div key={banner.id} className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">

            {/* Banner Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#FEDE00]/10 border border-[#FEDE00]/20 flex items-center justify-center">
                  <span className="text-[#FEDE00] text-[10px] font-black">{index + 1}</span>
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-white/40">Banner {index + 1}</span>
                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
                  banner.is_active
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-white/5 text-white/30 border-white/10"
                }`}>{banner.is_active ? "Active" : "Draft"}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleMove(index, "up")} disabled={index === 0}
                  className="p-1.5 rounded-lg hover:bg-[#FEDE00]/10 text-white/20 hover:text-[#FEDE00] disabled:opacity-10 transition-all">
                  <ArrowUp size={13} />
                </button>
                <button onClick={() => handleMove(index, "down")} disabled={index === banners.length - 1}
                  className="p-1.5 rounded-lg hover:bg-[#FEDE00]/10 text-white/20 hover:text-[#FEDE00] disabled:opacity-10 transition-all">
                  <ArrowDown size={13} />
                </button>
                <button onClick={() => handleDelete(banner.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

              {/* Image Upload */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">Banner Image</p>
                <div className="relative h-[160px] rounded-xl overflow-hidden bg-white/5 border border-white/10">
                  {banner.image_url ? (
                    <>
                      <img src={banner.image_url} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer flex items-center gap-2 bg-white/20 backdrop-blur rounded-xl px-4 py-2 text-white text-[12px] font-black uppercase">
                          <Upload size={13} /> Replace
                          <input type="file" className="hidden" accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(banner.id, e.target.files[0])} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition-all">
                      {uploading === banner.id ? (
                        <Loader2 size={20} className="text-[#FEDE00] animate-spin" />
                      ) : (
                        <>
                          <Upload size={20} className="text-white/20" />
                          <span className="text-[11px] text-white/20 font-bold uppercase tracking-widest">Upload Image</span>
                        </>
                      )}
                      <input type="file" className="hidden" accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(banner.id, e.target.files[0])} />
                    </label>
                  )}
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-4">

                {/* Status + Vibe row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Status</label>
                    <select
                      value={banner.is_active ? "active" : "draft"}
                      onChange={(e) => updateField(banner.id, "is_active", e.target.value === "active")}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-white outline-none focus:border-[#FEDE00]/50 transition-all">
                      <option value="active" style={{ background: '#1a1a1a' }}>Active</option>
                      <option value="draft" style={{ background: '#1a1a1a' }}>Draft</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Eyebrow Text (Vibe)</label>
                    <input
                      type="text"
                      value={banner.vibe}
                      onChange={(e) => updateField(banner.id, "vibe", e.target.value)}
                      placeholder="e.g. Joyful & Gift-Focused"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-[#FEDE00]/50 transition-all" />
                  </div>
                </div>

                {/* Headline */}
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Headline (Main Title)</label>
                  <input
                    type="text"
                    value={banner.headline}
                    onChange={(e) => updateField(banner.id, "headline", e.target.value)}
                    placeholder="e.g. The Perfect Gift for Every Story."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-[#FEDE00]/50 transition-all" />
                </div>

                {/* Subheadline */}
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Description</label>
                  <textarea
                    value={banner.subheadline}
                    onChange={(e) => updateField(banner.id, "subheadline", e.target.value)}
                    placeholder="e.g. Whether it is a birthday or an anniversary..."
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-[#FEDE00]/50 transition-all resize-none" />
                </div>

                {/* CTA */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Button Text</label>
                    <input
                      type="text"
                      value={banner.cta_label}
                      onChange={(e) => updateField(banner.id, "cta_label", e.target.value)}
                      placeholder="e.g. Explore Collection"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-[#FEDE00]/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Button Link</label>
                    <input
                      type="text"
                      value={banner.cta_href}
                      onChange={(e) => updateField(banner.id, "cta_href", e.target.value)}
                      placeholder="e.g. /shop/classic-magnets"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-[#FEDE00]/50 transition-all" />
                  </div>
                </div>

              </div>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div className="text-center py-24">
            <p className="text-white/20 font-black uppercase text-xs tracking-widest">No banners yet</p>
            <button
              onClick={openModal}
              className="mt-4 flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-[#FEDE00]/10 border border-[#FEDE00]/20 text-[#FEDE00] text-[11px] font-black uppercase"
            >
              <Plus size={13} /> Add First Banner
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
