"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Plus, X, Copy, Check } from "lucide-react";

type Coupon = {
  id: string;
  code: string;
  discount_type: "percentage" | "flat";
  discount_value: number;
  min_order_value: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  applicable_to: string;
  created_at: string;
};

export default function CouponsPage() {
  const supabase = createClient();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "flat">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrder, setMinOrder] = useState("0");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  const inputCls = "w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-[#FEDE00]/50 transition-all";
  const labelCls = "block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2";

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setCode(""); setDiscountType("percentage"); setDiscountValue("");
    setMinOrder("0"); setMaxUses(""); setExpiresAt(""); setIsActive(true);
    setEditingCoupon(null);
  };

  const openCreate = () => { resetForm(); setShowModal(true); };

  const openEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDiscountType(c.discount_type);
    setDiscountValue(String(c.discount_value));
    setMinOrder(String(c.min_order_value));
    setMaxUses(c.max_uses ? String(c.max_uses) : "");
    setExpiresAt(c.expires_at ? c.expires_at.slice(0, 16) : "");
    setIsActive(c.is_active);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!code.trim() || !discountValue) return;
    setSaving(true);
    const payload = {
      code: code.toUpperCase().trim(),
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      min_order_value: parseFloat(minOrder) || 0,
      max_uses: maxUses ? parseInt(maxUses) : null,
      expires_at: expiresAt || null,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    };

    if (editingCoupon) {
      await supabase.from("coupons").update(payload).eq("id", editingCoupon.id);
    } else {
      await supabase.from("coupons").insert({ ...payload, used_count: 0 });
    }

    setSaving(false);
    setShowModal(false);
    resetForm();
    fetchCoupons();
  };

  const toggleActive = async (c: Coupon) => {
    await supabase.from("coupons").update({ is_active: !c.is_active }).eq("id", c.id);
    fetchCoupons();
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    fetchCoupons();
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const random = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setCode(random);
  };

  // Stats
  const activeCoupons = coupons.filter(c => c.is_active);
  const totalRedeemed = coupons.reduce((sum, c) => sum + c.used_count, 0);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">

      {/* Header */}
      <div className="border-b border-white/5 px-8 py-6 sticky top-0 bg-[#0A0A0A] z-40">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">Coupons & Promotions</h1>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Magnetify Studio / Marketing</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FEDE00] text-black text-[11px] font-black uppercase hover:scale-[0.98] transition-all">
            <Plus size={14} /> Create New Coupon
          </button>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Redeemed", value: totalRedeemed, color: "text-white" },
            { label: "Active Codes", value: activeCoupons.length, color: "text-[#FEDE00]" },
            { label: "Total Coupons", value: coupons.length, color: "text-white/60" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#111111] border border-white/5 rounded-2xl p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-2">{label}</p>
              <p className={`text-3xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Coupons Table */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/25">All Coupons</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-[#FEDE00]" size={24} />
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-white/20 text-[13px] font-black uppercase tracking-widest">No coupons yet</p>
              <button onClick={openCreate} className="mt-4 text-[#FEDE00] text-[11px] font-black uppercase tracking-widest hover:opacity-70">
                Create your first coupon →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {coupons.map((c) => {
                const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
                const usagePercent = c.max_uses ? Math.round((c.used_count / c.max_uses) * 100) : null;

                return (
                  <div key={c.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-all">

                    {/* Code */}
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="bg-[#FEDE00]/10 border border-[#FEDE00]/20 border-dashed px-3 py-1.5 rounded-lg">
                          <span className="font-mono font-black text-[#FEDE00] text-[14px] tracking-widest">{c.code}</span>
                        </div>
                        <button onClick={() => copyCode(c.code, c.id)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
                          {copiedId === c.id ? <Check size={12} className="text-green-400" /> : <Copy size={12} className="text-white/40" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-white/20 mt-1.5 font-medium">
                        Valid on: {c.applicable_to === "all" ? "All Products" : c.applicable_to}
                      </p>
                    </div>

                    {/* Discount */}
                    <div className="flex-shrink-0 w-28">
                      <p className="text-[15px] font-black text-white">
                        {c.discount_type === "percentage" ? `${c.discount_value}%` : `₹${c.discount_value}`}
                      </p>
                      <p className="text-[10px] text-white/25 mt-0.5 uppercase font-bold">
                        {c.discount_type === "percentage" ? "Percentage" : "Flat"} Off
                      </p>
                    </div>

                    {/* Usage */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[12px] font-black text-white">{c.used_count}</span>
                        {c.max_uses && <span className="text-[11px] text-white/25">/ {c.max_uses} uses</span>}
                      </div>
                      {usagePercent !== null && (
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(usagePercent, 100)}%`,
                              backgroundColor: usagePercent > 80 ? "#ef4444" : "#FEDE00"
                            }} />
                        </div>
                      )}
                    </div>

                    {/* Expiry */}
                    <div className="flex-shrink-0 w-32 text-right">
                      {c.expires_at ? (
                        <span className={`text-[11px] font-bold ${isExpired ? "text-red-400" : "text-white/40"}`}>
                          {isExpired ? "Expired" : new Date(c.expires_at).toLocaleDateString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-[11px] text-white/20">No expiry</span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex-shrink-0">
                      <button onClick={() => toggleActive(c)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                          c.is_active && !isExpired
                            ? "bg-green-500/10 border-green-500/20 text-green-400"
                            : "bg-white/5 border-white/10 text-white/25"
                        }`}>
                        {c.is_active && !isExpired ? "● Active" : "○ Inactive"}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <button onClick={() => openEdit(c)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-black text-white/50 hover:text-white transition-all">
                        Edit
                      </button>
                      <button onClick={() => deleteCoupon(c.id)}
                        className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-all">
                        <X size={12} className="text-red-400" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Marketing Tip */}
        <div className="bg-[#FEDE00]/5 border border-[#FEDE00]/10 rounded-2xl p-5 flex gap-4">
          <span className="text-xl flex-shrink-0">💡</span>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-[#FEDE00]/70 mb-1">Marketing Tip</p>
            <p className="text-[13px] text-white/40 leading-relaxed">
              Influencers ke liye custom codes banayein (e.g., <span className="text-[#FEDE00]/60 font-mono font-bold">JAYANT15</span>) — track karo ki kaun sa creator sabse zyada sales la raha hai!
            </p>
          </div>
        </div>

      </div>

      {/* ── CREATE / EDIT MODAL ── */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]" onClick={() => { setShowModal(false); resetForm(); }} />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">

              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                <h2 className="text-[14px] font-black uppercase tracking-widest text-white">
                  {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
                </h2>
                <button onClick={() => { setShowModal(false); resetForm(); }}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
                  <X size={14} className="text-white/50" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5 space-y-4">

                {/* Code */}
                <div>
                  <label className={labelCls}>Coupon Code</label>
                  <div className="flex gap-2">
                    <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className={inputCls} placeholder="e.g. WELCOME10" />
                    <button onClick={generateCode}
                      className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-black text-white/50 hover:text-white transition-all whitespace-nowrap">
                      Auto
                    </button>
                  </div>
                </div>

                {/* Discount Type + Value */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Discount Type</label>
                    <div className="flex gap-2">
                      {(["percentage", "flat"] as const).map(t => (
                        <button key={t} onClick={() => setDiscountType(t)}
                          className={`flex-1 py-2.5 rounded-xl border text-[11px] font-black uppercase transition-all ${
                            discountType === t
                              ? "bg-[#FEDE00]/10 border-[#FEDE00]/40 text-[#FEDE00]"
                              : "bg-white/[0.02] border-white/5 text-white/30"
                          }`}>
                          {t === "percentage" ? "%" : "₹"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Value</label>
                    <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)}
                      className={inputCls} placeholder={discountType === "percentage" ? "10" : "200"} />
                  </div>
                </div>

                {/* Min Order */}
                <div>
                  <label className={labelCls}>Min Order Value (₹)</label>
                  <input type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)}
                    className={inputCls} placeholder="0 = no minimum" />
                </div>

                {/* Max Uses + Expiry */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Max Uses</label>
                    <input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)}
                      className={inputCls} placeholder="Unlimited" />
                  </div>
                  <div>
                    <label className={labelCls}>Expires At</label>
                    <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
                      className={inputCls} />
                  </div>
                </div>

                {/* Active Toggle */}
                <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  isActive ? "bg-green-500/5 border-green-500/20" : "bg-white/[0.02] border-white/5"
                }`}>
                  <div>
                    <p className="text-[13px] font-black text-white">Active Status</p>
                    <p className="text-[11px] text-white/30 mt-0.5">Coupon visible to customers</p>
                  </div>
                  <button onClick={() => setIsActive(!isActive)}
                    className={`relative w-11 h-6 rounded-full border-2 transition-all ${
                      isActive ? "bg-green-500 border-green-500" : "bg-white/5 border-white/10"
                    }`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                      isActive ? "left-5 bg-black" : "left-0.5 bg-white/30"
                    }`} />
                  </button>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-white/5 flex gap-3">
                <button onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[12px] font-black text-white/50 hover:text-white transition-all">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving || !code || !discountValue}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FEDE00] text-black text-[12px] font-black uppercase hover:scale-[0.98] transition-all disabled:opacity-30">
                  {saving ? <Loader2 className="animate-spin" size={13} /> : null}
                  {saving ? "Saving..." : editingCoupon ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
}