"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Sparkles, Loader2 } from "lucide-react";

const POPUP_ID = "00000000-0000-0000-0000-000000000001";

const POPUP_SIZES = {
  small: "w-[280px]",
  medium: "w-[350px]",
  large: "w-[440px]",
};

export default function HomepagePopups() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiBox, setShowAiBox] = useState(false);

  const [isEnabled, setIsEnabled] = useState(false);
  const [delay, setDelay] = useState(5);
  const [title, setTitle] = useState("Wait! Don't Miss Out");
  const [subtitle, setSubtitle] = useState("Get flat 10% off on your first custom magnet.");
  const [discountText, setDiscountText] = useState("10% OFF");
  const [couponCode, setCouponCode] = useState("");
  const [buttonText, setButtonText] = useState("Get My Discount");
  const [buttonLink, setButtonLink] = useState("");
  const [bgImageUrl, setBgImageUrl] = useState("");
  const [collectEmail, setCollectEmail] = useState(true);
  const [collectWhatsapp, setCollectWhatsapp] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [bgColor, setBgColor] = useState("#ffd814");
  const [bgType, setBgType] = useState<"color" | "image">("color");
  const [popupSize, setPopupSize] = useState<"small" | "medium" | "large">("medium");

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase
        .from("popup_config")
        .select("*")
        .eq("id", POPUP_ID)
        .single();

      if (data) {
        setIsEnabled(data.is_active ?? false);
        setDelay(data.delay_seconds ?? 5);
        setTitle(data.title ?? "Wait! Don't Miss Out");
        setSubtitle(data.sub_text ?? "Get flat 10% off on your first custom magnet.");
        setDiscountText(data.discount_text ?? "10% OFF");
        setCouponCode(data.coupon_code ?? "");
        setButtonText(data.button_text ?? "Get My Discount");
        setButtonLink(data.button_link ?? "");
        setBgImageUrl(data.bg_image_url ?? "");
        setCollectEmail(data.collect_email ?? true);
        setCollectWhatsapp(data.collect_whatsapp ?? false);
        setWhatsappNumber(data.whatsapp_number ?? "");
        setBgColor(data.bg_color ?? "#ffd814");
        setBgType(data.bg_type ?? "color");
        setPopupSize(data.popup_size ?? "medium");
      }
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("popup_config").update({
      is_active: isEnabled,
      delay_seconds: delay,
      title,
      sub_text: subtitle,
      discount_text: discountText,
      coupon_code: couponCode,
      button_text: buttonText,
      button_link: buttonLink,
      bg_image_url: bgImageUrl,
      collect_email: collectEmail,
      collect_whatsapp: collectWhatsapp,
      whatsapp_number: whatsappNumber,
      bg_color: bgColor,
      bg_type: bgType,
      popup_size: popupSize,
      updated_at: new Date().toISOString(),
    }).eq("id", POPUP_ID);

    if (error) console.error("Save error:", error);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const fileName = `popup/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("category-images")
      .upload(fileName, file);

    if (!uploadError) {
      const { data } = supabase.storage.from("category-images").getPublicUrl(fileName);
      const publicUrl = data.publicUrl;
      setBgImageUrl(publicUrl);
      setBgType("image");

      const { error: dbError } = await supabase.from("popup_config").update({
        bg_image_url: publicUrl,
        bg_type: "image",
        updated_at: new Date().toISOString(),
      }).eq("id", POPUP_ID);

      if (dbError) {
        console.error("Auto-save failed:", dbError);
        alert("Image uploaded but DB update failed.");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } else {
      alert(`Upload failed: ${uploadError.message}`);
    }
    setUploading(false);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const prompt = `You are a marketing copywriter for Magnetify, a custom photo magnet brand from India.
Generate popup content based on: "${aiPrompt}"
Respond ONLY with a JSON object (no markdown, no backticks):
{
  "title": "catchy popup headline (max 6 words)",
  "sub_text": "compelling offer description (max 15 words)",
  "discount_text": "discount label like '10% OFF' or 'FREE SHIPPING' (max 3 words)",
  "button_text": "CTA button text (max 4 words)"
}`;
      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      const clean = (data.text || "").replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      if (parsed.title) setTitle(parsed.title);
      if (parsed.sub_text) setSubtitle(parsed.sub_text);
      if (parsed.discount_text) setDiscountText(parsed.discount_text);
      if (parsed.button_text) setButtonText(parsed.button_text);
      setShowAiBox(false);
      setAiPrompt("");
    } catch {
      alert("AI generation failed. Try again!");
    }
    setAiLoading(false);
  };

  const previewBgStyle = bgType === "image" && bgImageUrl
    ? { backgroundImage: `url(${bgImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}cc 100%)` };

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#FEDE00]" size={28} />
    </div>
  );

  const inputCls = "w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-[#FEDE00]/50 transition-all";
  const labelCls = "block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2";

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <div className="border-b border-white/5 px-8 py-6 sticky top-0 bg-[#0A0A0A] z-40">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">Homepage Popup</h1>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">Magnetify Studio / Marketing</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[11px] font-black uppercase tracking-widest transition-all ${
              isEnabled ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-white/5 border-white/10 text-white/30"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isEnabled ? "bg-green-400 animate-pulse" : "bg-white/20"}`} />
              {isEnabled ? "Live" : "Disabled"}
            </div>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FEDE00] text-black text-[11px] font-black uppercase hover:scale-[0.98] transition-all disabled:opacity-50">
              {saving ? <Loader2 className="animate-spin" size={13} /> : null}
              {saved ? "✓ Saved!" : saving ? "Saving..." : "Save & Publish"}
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4">Controls</p>
              {[
                { label: "Popup Status", desc: "Enable or disable popup globally", val: isEnabled, set: setIsEnabled, accent: "yellow" },
                { label: "Collect Email", desc: "Show email input field in popup", val: collectEmail, set: setCollectEmail, accent: "blue" },
                { label: "Collect WhatsApp", desc: "Show WhatsApp input in popup", val: collectWhatsapp, set: setCollectWhatsapp, accent: "green" },
              ].map(({ label, desc, val, set, accent }) => (
                <div key={label} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  val
                    ? accent === "yellow" ? "bg-[#FEDE00]/5 border-[#FEDE00]/20"
                    : accent === "blue" ? "bg-blue-500/5 border-blue-500/20"
                    : "bg-green-500/5 border-green-500/20"
                    : "bg-white/[0.02] border-white/5"
                }`}>
                  <div>
                    <p className="text-[13px] font-black text-white">{label}</p>
                    <p className="text-[11px] text-white/30 mt-0.5">{desc}</p>
                  </div>
                  <button onClick={() => set(!val)}
                    className={`relative w-11 h-6 rounded-full border-2 transition-all ${
                      val
                        ? accent === "yellow" ? "bg-[#FEDE00] border-[#FEDE00]"
                        : accent === "blue" ? "bg-blue-500 border-blue-500"
                        : "bg-green-500 border-green-500"
                        : "bg-white/5 border-white/10"
                    }`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                      val ? "left-5 bg-black" : "left-0.5 bg-white/30"
                    }`} />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4">Content</p>
              <div>
                <label className={labelCls}>Discount Label</label>
                <input type="text" value={discountText} onChange={(e) => setDiscountText(e.target.value)}
                  className={inputCls} placeholder="e.g. 10% OFF" />
              </div>

              <div>
                <label className={labelCls}>
                  Coupon Code{" "}
                  <span className="text-white/15 normal-case font-medium">
                    (jo customer checkout pe use karega)
                  </span>
                </label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className={`${inputCls} font-mono tracking-widest text-[#FEDE00]`}
                  placeholder="e.g. WELCOME10"
                />
                <p className="text-[10px] text-white/20 mt-1.5">
                  Ye code popup submit karne par customer ko milega
                </p>
              </div>

              <div>
                <label className={labelCls}>Popup Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Sub-text / Offer Details</label>
                <textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
                  className={`${inputCls} h-20 resize-none`} />
              </div>

              <div>
                <label className={labelCls}>Button Text</label>
                <input type="text" value={buttonText} onChange={(e) => setButtonText(e.target.value)}
                  className={inputCls} placeholder="e.g. Get My Discount" />
              </div>

              <div>
                <label className={labelCls}>Button Link <span className="text-white/15 normal-case font-medium">(optional)</span></label>
                <input type="text" value={buttonLink} onChange={(e) => setButtonLink(e.target.value)}
                  className={inputCls} placeholder="e.g. /shop-all" />
              </div>

              <div>
                <label className={labelCls}>WhatsApp Business Number <span className="text-white/15 normal-case font-medium">(optional)</span></label>
                <input type="text" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)}
                  className={inputCls} placeholder="919370103844 (with country code, no +)" />
                <p className="text-[10px] text-white/20 mt-1.5">If filled, a "Chat on WhatsApp" button will show in popup</p>
              </div>
            </div>

            <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 space-y-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4">Settings</p>
              <div>
                <label className={labelCls}>Display Delay (Seconds)</label>
                <div className="flex items-center gap-3">
                  <input type="number" value={delay} onChange={(e) => setDelay(parseInt(e.target.value))}
                    className="w-24 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-white outline-none focus:border-[#FEDE00]/50 transition-all" />
                  <span className="text-[11px] text-white/20">seconds before popup appears</span>
                </div>
              </div>

              <div>
                <label className={labelCls}>Popup Size</label>
                <div className="flex gap-2">
                  {(["small", "medium", "large"] as const).map((size) => (
                    <button key={size} onClick={() => setPopupSize(size)}
                      className={`flex-1 py-3 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all ${
                        popupSize === size
                          ? "bg-[#FEDE00]/10 border-[#FEDE00]/40 text-[#FEDE00]"
                          : "bg-white/[0.02] border-white/5 text-white/30 hover:border-white/15"
                      }`}>
                      {size === "small" ? "📱" : size === "medium" ? "💻" : "🖥️"}
                      <span className="block mt-1 capitalize">{size}</span>
                      <span className="block text-[9px] opacity-50 mt-0.5">{size === "small" ? "280px" : size === "medium" ? "350px" : "440px"}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Popup Background</label>
                <div className="flex gap-2 mb-4">
                  {[{ val: "color", icon: "🎨", label: "Color" }, { val: "image", icon: "🖼️", label: "Image" }].map(({ val, icon, label }) => (
                    <button key={val} onClick={() => setBgType(val as "color" | "image")}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all ${
                        bgType === val
                          ? "bg-[#FEDE00]/10 border-[#FEDE00]/40 text-[#FEDE00]"
                          : "bg-white/[0.02] border-white/5 text-white/30 hover:border-white/15"
                      }`}>
                      {icon} {label}
                    </button>
                  ))}
                </div>

                {bgType === "color" ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent" />
                    <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                      className="w-28 bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-[13px] text-white font-mono outline-none focus:border-[#FEDE00]/50" />
                    <div className="flex gap-2">
                      {["#ffd814", "#FF385C", "#0e7466", "#232f3e", "#ff6b6b", "#845ef7"].map(c => (
                        <button key={c} onClick={() => setBgColor(c)}
                          className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${bgColor === c ? "border-white scale-110" : "border-transparent"}`}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    {bgImageUrl ? (
                      <div className="relative w-full h-24 border border-white/10 rounded-xl overflow-hidden">
                        <img src={bgImageUrl} className="w-full h-full object-cover" alt="bg" />
                        <button onClick={() => { setBgImageUrl(""); setBgType("color"); }}
                          className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-lg transition-all">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 border border-dashed border-white/10 hover:border-[#FEDE00]/30 rounded-xl p-6 cursor-pointer transition-all group">
                        {uploading
                          ? <Loader2 className="animate-spin text-[#FEDE00]" size={16} />
                          : <>
                              <span className="text-2xl">📁</span>
                              <span className="text-[12px] text-white/30 group-hover:text-white/50 transition-all">Click to upload image</span>
                            </>
                        }
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#111111] border border-white/5 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#FEDE00]" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50">AI Content Generator</p>
                </div>
                <button onClick={() => setShowAiBox(!showAiBox)}
                  className="text-[11px] font-black text-[#FEDE00] uppercase tracking-widest hover:opacity-70 transition-all">
                  {showAiBox ? "✕ Cancel" : "Generate →"}
                </button>
              </div>
              {showAiBox && (
                <div className="space-y-3">
                  <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. 'Diwali sale 20% off on all magnets'"
                    className={`${inputCls} h-20 resize-none`} />
                  <button onClick={handleAiGenerate} disabled={aiLoading || !aiPrompt.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FEDE00] text-black text-[11px] font-black uppercase tracking-widest hover:scale-[0.98] transition-all disabled:opacity-30">
                    {aiLoading ? <Loader2 className="animate-spin" size={13} /> : <Sparkles size={13} />}
                    {aiLoading ? "Generating..." : "Generate with AI"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-28 self-start">
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

              <div className="absolute top-4 left-5 text-[9px] font-black uppercase tracking-widest text-white/20">Desktop Preview</div>
              <div className="absolute top-4 right-5 text-[9px] font-black uppercase tracking-widest text-white/20 capitalize">{popupSize}</div>

              <div className={`relative bg-white shadow-2xl rounded-2xl overflow-hidden border border-white/10 transition-all duration-500 ${POPUP_SIZES[popupSize]} ${isEnabled ? "scale-100 opacity-100" : "scale-95 opacity-30"}`}>
                <div className="h-40 flex items-center justify-center relative overflow-hidden" style={previewBgStyle}>
                  <span className="relative text-white text-5xl font-black tracking-tight drop-shadow-lg z-10">
                    {discountText || "10% OFF"}
                  </span>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                  <p className="text-[12px] text-gray-600 mt-2">{subtitle}</p>
                  <div className="mt-5 space-y-2">
                    {collectEmail && (
                      <input type="email" disabled placeholder="Enter your email address"
                        className="w-full border border-gray-300 p-2 text-[12px] rounded-xl" />
                    )}
                    {collectWhatsapp && (
                      <input type="tel" disabled placeholder="Enter your WhatsApp number"
                        className="w-full border border-green-300 p-2 text-[12px] rounded-xl" />
                    )}
                    {whatsappNumber && (
                      <div className="flex items-center gap-2 justify-center bg-green-50 border border-green-200 rounded-xl p-2">
                        <span className="text-green-600 text-lg">💬</span>
                        <span className="text-[11px] font-bold text-green-700">Chat on WhatsApp</span>
                      </div>
                    )}
                    <button className="w-full py-2 text-[12px] font-bold rounded-xl shadow-sm text-white"
                      style={{ backgroundColor: bgType === "color" ? bgColor : "#ffd814" }}>
                      {buttonText || "Get My Discount"}
                    </button>
                    <button className="text-[11px] text-gray-400">No thanks, I'll pay full price</button>
                  </div>
                </div>
              </div>

              {!isEnabled && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white/5 border border-white/10 text-white/40 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest">
                    Popup is Disabled
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}