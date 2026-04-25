"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { X } from "lucide-react";

const POPUP_ID = "00000000-0000-0000-0000-000000000001";
const STORAGE_KEY = "magnetify_popup_done";

const POPUP_SIZES: Record<string, string> = {
  small: "w-[280px]",
  medium: "w-[350px]",
  large: "w-[440px]",
};

export function HomepagePopupWidget() {
  const pathname = usePathname();
  const supabase = createClient();
  const [config, setConfig] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAdminPath = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdminPath) return;
    const alreadyDone = localStorage.getItem(STORAGE_KEY);
    if (alreadyDone) return;

    const fetchConfig = async () => {
      const { data } = await supabase
        .from("popup_config")
        .select("*")
        .eq("id", POPUP_ID)
        .single();

      if (data && data.is_active) {
        setConfig(data);
        const timer = setTimeout(
          () => setVisible(true),
          (data.delay_seconds || 5) * 1000
        );
        return () => clearTimeout(timer);
      }
    };

    fetchConfig();
  }, [isAdminPath]);

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem("magnetify_popup_closed", "true");
  };

  const handleSubmit = async () => {
    if (!email && !whatsapp) return;
    setError("");
    setLoading(true);

    try {
      const couponCode = config?.coupon_code || "";
      let existingData = null;

      if (email) {
        const res = await supabase
          .from("popup_leads")
          .select("id")
          .eq("email", email)
          .maybeSingle();
        existingData = res.data;
      } else if (whatsapp) {
        const res = await supabase
          .from("popup_leads")
          .select("id")
          .eq("whatsapp", whatsapp)
          .maybeSingle();
        existingData = res.data;
      }

      if (!existingData) {
        await supabase.from("popup_leads").insert({
          email: email || null,
          whatsapp: whatsapp || null,
          coupon_code: couponCode,
          coupon_used: false,
        });
      }

      if (couponCode) {
        localStorage.setItem("popup_coupon", couponCode);
      }

      localStorage.setItem(STORAGE_KEY, "true");
      setSubmitted(true);
      setTimeout(() => setVisible(false), 2500);
    } catch (err: any) {
      console.error("Error:", err);
      setError("Kuch galat hua, dobara try karo.");
    } finally {
      setLoading(false);
    }
  };

  if (isAdminPath || !config || !visible) return null;

  const bgStyle =
    config.bg_type === "image" && config.bg_image_url
      ? {
          backgroundImage: "url(" + config.bg_image_url + ")",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {
          background:
            "linear-gradient(135deg, " +
            (config.bg_color || "#ffd814") +
            " 0%, " +
            (config.bg_color || "#ffd814") +
            "cc 100%)",
        };

  const waNumber = config.whatsapp_number || "";
  const waHref =
    waNumber.length > 0
      ? "https://wa.me/" + waNumber + "?text=Hi! I saw your popup offer."
      : "";

  const sizeClass =
    POPUP_SIZES[config.popup_size || "medium"] || POPUP_SIZES.medium;

  const buttonBg = config.bg_color || "#FEDE00";

  return (
    <div>
      <div
        className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          className={
            "relative bg-white rounded-2xl overflow-hidden shadow-2xl max-w-full " +
            sizeClass
          }
        >
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-all"
          >
            <X size={16} className="text-white" />
          </button>

          <div
            className="relative h-40 flex items-center justify-center overflow-hidden"
            style={bgStyle}
          >
            <span className="relative text-white text-5xl font-black tracking-tight drop-shadow-lg z-10 text-center px-2">
              {config.discount_text || "10% OFF"}
            </span>
          </div>

          <div className="p-6 text-center">
            {submitted ? (
              <div className="py-4">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="text-lg font-black text-gray-800">
                  You are all set!
                </h3>
                {config.coupon_code && (
                  <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                    <p className="text-[11px] text-yellow-700 font-bold uppercase tracking-wider mb-1">
                      Your Coupon Code
                    </p>
                    <p className="text-xl font-black text-yellow-800 font-mono tracking-widest">
                      {config.coupon_code}
                    </p>
                    <p className="text-[11px] text-yellow-600 mt-1">
                      Checkout pe apply karo!
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Discount will be applied at checkout.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-black text-gray-800 mb-2">
                  {config.title || "Wait! Don't Miss Out"}
                </h3>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                  {config.sub_text}
                </p>

                <div className="space-y-3">
                  {config.collect_email && (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-400 transition-all"
                    />
                  )}

                  {config.collect_whatsapp && (
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="Enter your WhatsApp number"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 transition-all"
                    />
                  )}

                  {error.length > 0 && (
                    <p className="text-red-500 text-xs font-bold">{error}</p>
                  )}

                  {waHref.length > 0 && (
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-sm transition-all"
                    >
                      <span>Chat on WhatsApp</span>
                    </a>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={loading || (!email && !whatsapp)}
                    className="w-full font-black py-3 rounded-xl text-sm transition-all text-black hover:opacity-90 disabled:opacity-40"
                    style={{ backgroundColor: buttonBg }}
                  >
                    {loading
                      ? "Saving..."
                      : config.button_text || "Get My Discount"}
                  </button>

                  <button
                    onClick={handleClose}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    No thanks, I will pay full price
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
