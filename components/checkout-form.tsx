"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { createClient } from "@/utils/supabase/client";

function formatRupees(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

type CheckoutFormProps = {
  errorMessage?: string;
};

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
};

export function CheckoutForm({ errorMessage }: CheckoutFormProps) {
  const { items, itemCount, subtotal, clearCart } = useCart();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [fileError, setFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── NEW: cart photos from localStorage ──
  const [cartPhotos, setCartPhotos] = useState<string>("{}");

  // Coupon states
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);

  const deliveryCharge = subtotal >= 999 || subtotal === 0 ? 0 : 49;

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discount_type === "percentage") {
      return Math.round(subtotal * (appliedCoupon.discount_value / 100));
    }
    return Math.min(appliedCoupon.discount_value, subtotal);
  }, [appliedCoupon, subtotal]);

  const totalDue = subtotal + deliveryCharge - discountAmount;

  const cartPayload = useMemo(() => JSON.stringify(items), [items]);
  const orderDate = useMemo(() => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date()), []);

  useEffect(() => {
    // ── NEW: Load cart photos from localStorage ──
    const stored = localStorage.getItem("magnetify-cart-photos");
    if (stored) setCartPhotos(stored);

    // 1. Check for Popup coupon
    const popupCoupon = localStorage.getItem("popup_coupon");
    if (popupCoupon) {
      setCouponInput(popupCoupon);
      applyCoupon(popupCoupon);
    }

    // 2. Check for Cart drawer applied coupon
    const appliedFromCart = localStorage.getItem("magnetify-applied-coupon");
    if (appliedFromCart && !popupCoupon) {
      setCouponInput(appliedFromCart);
      applyCoupon(appliedFromCart);
      localStorage.removeItem("magnetify-applied-coupon");
    }

    fetchAvailableCoupons();
  }, []);

  const fetchAvailableCoupons = async () => {
    try {
      const { data } = await supabase.from("coupons").select("*").eq("is_active", true);
      setAvailableCoupons((data || []).filter((c: Coupon) => {
        if (c.expires_at && new Date(c.expires_at) < new Date()) return false;
        if (c.max_uses && c.used_count >= c.max_uses) return false;
        return true;
      }));
    } catch {
      // Coupon fetch fail hone pe form block nahi hoga
    }
  };

  const applyCoupon = async (code?: string) => {
    const codeToApply = (code || couponInput).trim().toUpperCase();
    if (!codeToApply) return;
    setCouponLoading(true);
    setCouponError("");
    const { data, error } = await supabase.from("coupons").select("*").eq("code", codeToApply).eq("is_active", true).single();
    if (error || !data) { setCouponError("Invalid coupon code. Please try again."); setAppliedCoupon(null); setCouponLoading(false); return; }
    const coupon = data as Coupon;
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) { setCouponError("This coupon has expired."); setAppliedCoupon(null); setCouponLoading(false); return; }
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) { setCouponError("This coupon has reached its usage limit."); setAppliedCoupon(null); setCouponLoading(false); return; }
    if (subtotal < coupon.min_order_value) { setCouponError(`Minimum order value ₹${coupon.min_order_value} required.`); setAppliedCoupon(null); setCouponLoading(false); return; }
    setAppliedCoupon(coupon);
    setCouponInput(coupon.code);
    setCouponError("");
    setCouponLoading(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
    localStorage.removeItem("popup_coupon");
    localStorage.removeItem("magnetify-applied-coupon");
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    if (!nextFile) { setFileError(""); return; }
    const extension = nextFile.name.split(".").pop()?.toLowerCase() ?? "";
    const isValidType = (nextFile.type === "image/jpeg" || nextFile.type === "image/png") && ["jpg", "jpeg", "png"].includes(extension);
    if (!isValidType) { event.target.value = ""; setFileError("Only JPG, JPEG, and PNG screenshots are allowed."); return; }
    if (nextFile.size > 2 * 1024 * 1024) { event.target.value = ""; setFileError("Payment screenshot must be 2MB or smaller."); return; }
    setFileError("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    // ── DOM se directly file check karo (React state sync issue avoid) ──
    const form = event.currentTarget as HTMLFormElement;
    const attachmentInput = form.querySelector<HTMLInputElement>('[name="attachment"]');
    const hasFile = attachmentInput && attachmentInput.files && attachmentInput.files.length > 0;

    if (!hasFile) {
      event.preventDefault();
      setFileError("Please upload the payment screenshot.");
      return;
    }

    if (fileError) {
      event.preventDefault();
      return;
    }

    if (appliedCoupon?.code) {
      const popupCoupon = localStorage.getItem("popup_coupon");
      if (popupCoupon && email) {
        supabase.from("popup_leads").update({ coupon_used: true }).eq("email", email).eq("coupon_code", appliedCoupon.code).then(() => {});
      }
    }

    localStorage.removeItem("popup_coupon");
    localStorage.removeItem("magnetify-applied-coupon");
    // ── NEW: Clear cart photos after submit ──
    localStorage.removeItem("magnetify-cart-photos");
    setIsSubmitting(true);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="rounded-[2rem] border border-border bg-white p-6 shadow-[0_24px_70px_rgba(26,26,27,0.08)] sm:p-8">
        <h1 className="text-4xl tracking-[-0.04em] text-foreground sm:text-5xl">Checkout</h1>
      </section>

      {items.length === 0 ? (
        <section className="mt-8 rounded-[2rem] border border-border bg-white p-6 text-center shadow-[0_24px_70px_rgba(26,26,27,0.08)] sm:p-8">
          <h2 className="text-3xl tracking-[-0.04em] text-foreground">Your cart is empty.</h2>
          <Link href="/create-pack" className="mt-6 inline-flex rounded-full bg-pink px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(255,27,107,0.26)] hover:-translate-y-0.5 hover:bg-orange">
            Browse products
          </Link>
        </section>
      ) : (
        <form action="/api/checkout-submit" method="POST" encType="multipart/form-data" onSubmit={handleSubmit}
          className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6">

          <input type="hidden" name="order_date" value={orderDate} />
          <input type="hidden" name="cart_payload" value={cartPayload} />
          <input type="hidden" name="item_count" value={`${itemCount}`} />
          <input type="hidden" name="subtotal_value" value={`${subtotal}`} />
          <input type="hidden" name="delivery_charge_value" value={`${deliveryCharge}`} />
          <input type="hidden" name="total_amount_value" value={`${totalDue}`} />
          <input type="hidden" name="discount_amount" value={`${discountAmount}`} />
          <input type="hidden" name="coupon_code" value={appliedCoupon?.code || ""} />
          {/* ── NEW: Pass cart photos to server ── */}
          <input type="hidden" name="cart_photos_payload" value={cartPhotos} />

          <section className="rounded-[2rem] border border-border bg-white p-6 shadow-[0_24px_70px_rgba(26,26,27,0.08)] sm:p-8">
            <h2 className="text-2xl tracking-[-0.03em] text-foreground">Shipping details</h2>
            {errorMessage && (
              <div className="mt-5 rounded-[1.5rem] border border-pink/20 bg-[#fff3f8] px-4 py-3 text-sm text-foreground">{errorMessage}</div>
            )}

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <input required type="text" name="customer_name" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter customer name"
                  className="mt-3 w-full rounded-2xl border border-border bg-surface-muted px-4 py-4 text-sm text-foreground outline-none placeholder:text-muted" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Mobile Number</label>
                <input required type="tel" name="customer_mobile" value={mobile} onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91"
                  className="mt-3 w-full rounded-2xl border border-border bg-surface-muted px-4 py-4 text-sm text-foreground outline-none placeholder:text-muted" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <input required type="email" name="customer_email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="mt-3 w-full rounded-2xl border border-border bg-surface-muted px-4 py-4 text-sm text-foreground outline-none placeholder:text-muted" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-foreground">Shipping Address</label>
                <textarea required rows={5} name="shipping_address" value={address} onChange={(e) => setAddress(e.target.value)}
                  placeholder="House number, street, city, state, PIN code"
                  className="mt-3 w-full rounded-[1.5rem] border border-border bg-surface-muted px-4 py-4 text-sm text-foreground outline-none placeholder:text-muted" />
              </div>
            </div>

            {/* ── COUPON SECTION ── */}
            <div className="mt-8 rounded-[1.75rem] border border-border bg-surface-muted p-5 sm:p-6">
              <h3 className="text-lg tracking-[-0.03em] text-foreground mb-4">🎟️ Apply Coupon</h3>

              {availableCoupons.length > 0 && !appliedCoupon && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Available Offers</p>
                  <div className="flex flex-wrap gap-2">
                    {availableCoupons.map((c) => (
                      <button key={c.id} type="button"
                        onClick={() => { setCouponInput(c.code); applyCoupon(c.code); }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-dashed border-pink/30 bg-white hover:border-pink/60 transition-all group">
                        <span className="font-mono font-black text-pink text-[13px] tracking-widest">{c.code}</span>
                        <span className="text-[11px] text-muted group-hover:text-foreground">
                          {c.discount_type === "percentage" ? `${c.discount_value}% off` : `₹${c.discount_value} off`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {appliedCoupon ? (
                <div className="flex flex-col gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-green-600 text-xl">✓</span>
                    <div>
                      <p className="text-sm font-black text-green-800 font-mono tracking-widest">{appliedCoupon.code}</p>
                      <p className="text-xs text-green-600 mt-0.5">
                        {appliedCoupon.discount_type === "percentage"
                          ? `${appliedCoupon.discount_value}% off applied — saving ${formatRupees(discountAmount)}`
                          : `₹${appliedCoupon.discount_value} off applied`}
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={removeCoupon} className="text-xs text-red-400 hover:text-red-600 font-bold transition-colors">Remove</button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input type="text" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                    placeholder="Enter coupon code"
                    className="flex-1 rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted font-mono uppercase tracking-wider" />
                  <button type="button" onClick={() => applyCoupon()} disabled={couponLoading || !couponInput}
                    className="px-5 py-3 rounded-2xl bg-pink text-white text-sm font-semibold hover:bg-orange transition-all disabled:opacity-40">
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              )}
              {couponError && <p className="mt-2 text-sm text-pink">{couponError}</p>}
            </div>

            {/* Payment Proof */}
            <div className="mt-6 rounded-[1.75rem] border border-pink/15 bg-[#fff3f8] p-5 sm:p-6">
              <h3 className="text-xl tracking-[-0.03em] text-foreground">Payment proof</h3>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground">Transaction ID</label>
                  <input required type="text" name="transaction_id" value={transactionId} onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Paste UPI reference ID"
                    className="mt-3 w-full rounded-2xl border border-border bg-white px-4 py-4 text-sm text-foreground outline-none placeholder:text-muted" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Upload screenshot</label>
                  <input type="file" name="attachment" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={handleFiles}
                    className="mt-3 block w-full rounded-2xl border border-border bg-white px-4 py-4 text-sm text-muted file:mr-4 file:rounded-full file:border file:border-charcoal/10 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-foreground" />
                  <p className="mt-3 text-sm text-muted">Only JPG, JPEG, and PNG files are allowed, up to 2MB.</p>
                  {fileError && <p className="mt-2 text-sm text-pink">{fileError}</p>}
                </div>
              </div>
            </div>
          </section>

          {/* Order Summary */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <section className="rounded-[2rem] border border-border bg-charcoal p-6 text-pearl shadow-[0_24px_70px_rgba(26,26,27,0.15)] sm:p-8">
              <h2 className="text-2xl tracking-[-0.03em] text-white">Order summary</h2>
              <div className="mt-6 space-y-4 text-sm text-white/72">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4">
                    <div>
                      <p>{item.title}</p>
                      {item.variantLabel && <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/45">{item.variantLabel}</p>}
                      <p className="mt-1 text-xs text-white/45">{item.quantity} x {item.priceLabel}</p>
                    </div>
                    <span>{formatRupees(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <span>Delivery Charge</span>
                  <span>{formatRupees(deliveryCharge)}</span>
                </div>
                {appliedCoupon && discountAmount > 0 && (
                  <div className="flex items-center justify-between text-green-400">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>− {formatRupees(discountAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-white/10 pt-4 text-base font-semibold text-white">
                  <span>Total Due</span>
                  <span>{formatRupees(totalDue)}</span>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-border bg-white p-6 shadow-[0_24px_70px_rgba(26,26,27,0.08)] sm:p-8">
              <h2 className="text-2xl tracking-[-0.03em] text-foreground">Scan to pay</h2>
              <div className="mt-5 rounded-[1.75rem] border-2 border-dashed border-orange/35 bg-[#fff6ef] p-6 text-center">
                <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-[1.5rem] bg-white text-center text-sm font-semibold uppercase tracking-[0.22em] text-muted shadow-[inset_0_0_0_1px_rgba(26,26,27,0.06)] sm:h-44 sm:w-44">
                  Place GPay QR Here
                </div>
              </div>
              <button type="submit" disabled={isSubmitting}
                className="mt-6 w-full rounded-full bg-pink px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(255,27,107,0.28)] hover:-translate-y-0.5 hover:bg-orange">
                {isSubmitting ? "Submitting..." : "Confirm payment"}
              </button>
            </section>
          </aside>
        </form>
      )}
    </main>
  );
}
