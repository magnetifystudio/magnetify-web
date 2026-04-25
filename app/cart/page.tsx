"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, RefreshCw, Upload } from "lucide-react";

type LocalPhoto = {
  cart_item_id: string;
  product_id: string;
  product_title: string;
  variant_label: string;
  photo_urls: string[];
  price: number;
};

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const router = useRouter();
  const [cartPhotos, setCartPhotos] = useState<Record<string, LocalPhoto>>({});

  // localStorage se photos load karo
  useEffect(() => {
    const stored = localStorage.getItem("magnetify-cart-photos");
    if (stored) {
      setCartPhotos(JSON.parse(stored));
    }
  }, []);

  const getPhotosForItem = (cartItemId: string): LocalPhoto | undefined => {
    return cartPhotos[cartItemId];
  };

  const handleUploadPhotos = (item: any) => {
    // Set size nikalo variantLabel se
    const numMatch = item.variantLabel?.match(/(\d+)/);
    const setSize = numMatch ? parseInt(numMatch[1]) : 1;

    router.push(
      `/upload-photos?id=${item.id}` +
      `&title=${encodeURIComponent(item.title)}` +
      `&price=${item.price}` +
      `&priceLabel=${encodeURIComponent(`₹${item.price}`)}` +
      `&set=${setSize}` +
      `&label=${encodeURIComponent(item.variantLabel || "")}` +
      `&slug=${item.href?.replace("/products/", "") || ""}`
    );
  };

  const handleChangePhotos = (item: any, photoData: LocalPhoto) => {
    router.push(
      `/upload-photos?id=${item.id}` +
      `&title=${encodeURIComponent(item.title)}` +
      `&price=${item.price}` +
      `&priceLabel=${encodeURIComponent(`₹${item.price}`)}` +
      `&set=${photoData.photo_urls.length}` +
      `&label=${encodeURIComponent(item.variantLabel || "")}` +
      `&slug=${item.href?.replace("/products/", "") || ""}` +
      `&replacing=${item.id}`
    );
  };

  const handleRemoveItem = (itemId: string) => {
    // localStorage se bhi hatao
    const stored = JSON.parse(localStorage.getItem("magnetify-cart-photos") || "{}");
    delete stored[itemId];
    localStorage.setItem("magnetify-cart-photos", JSON.stringify(stored));
    setCartPhotos(stored);
    removeItem(itemId);
  };

  // Check karo sabki photos upload hain ya nahi
  const allPhotosUploaded = items.every(item => getPhotosForItem(item.id));

  const deliveryCharge = subtotal >= 999 ? 0 : 49;
  const total = subtotal + deliveryCharge;

  return (
    <div className="min-h-screen bg-[#FAF9F6]">

      {/* Header */}
      <div className="bg-[#1a1a1a] px-4 py-8 text-white sm:px-6 sm:py-10">
        <div className="max-w-5xl mx-auto">
          <nav className="flex gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-4">
            <Link href="/" className="hover:text-white/60">Home</Link>
            <span>/</span>
            <span className="text-white/60">Cart</span>
          </nav>
          <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl md:text-5xl">Your Cart</h1>
          <p className="mt-2 text-white/40 text-sm font-medium">
            {items.length === 0 ? "No items" : `${items.length} item${items.length > 1 ? "s" : ""} ready`}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {items.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-6">🛒</p>
            <p className="text-[#1a1a1a]/30 font-black uppercase text-sm tracking-widest mb-6">Cart is empty</p>
            <Link href="/"
              className="inline-flex items-center gap-2 bg-[#FF385C] text-white px-8 py-3 rounded-2xl font-black uppercase text-sm tracking-widest hover:-translate-y-0.5 transition-all">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">

            {/* LEFT — Cart Items */}
            <div className="space-y-4">
              {items.map((item) => {
                const photoData = getPhotosForItem(item.id);
                const hasPhotos = !!photoData;

                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">

                    {/* Product Info */}
                    <div className="flex gap-4 p-4 sm:p-5">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#f5f5f5] flex-shrink-0 border border-black/5">
                        <Image src={item.imageSrc} alt={item.imageAlt} fill className="object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-[14px] font-black uppercase tracking-tight text-[#1a1a1a] leading-tight">
                          {item.title}
                        </h3>
                        {item.variantLabel && (
                          <p className="text-[11px] font-black uppercase tracking-widest text-[#FF385C] mt-1">
                            {item.variantLabel}
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-4">
                          <div className="flex items-center gap-2 bg-[#f5f5f5] rounded-xl px-2 py-1">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-lg hover:bg-[#FF385C] hover:text-white transition-all">−</button>
                            <span className="text-sm font-bold min-w-[20px] text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-lg hover:bg-[#FF385C] hover:text-white transition-all">+</button>
                          </div>
                          <span className="text-[15px] font-black text-[#1a1a1a]">₹{item.price * item.quantity}</span>
                        </div>
                      </div>

                      <button onClick={() => handleRemoveItem(item.id)}
                        className="text-[#1a1a1a]/20 hover:text-red-500 transition-colors self-start">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Photos Section */}
                      <div className={`border-t p-4 sm:p-5 ${hasPhotos ? "border-black/5" : "border-orange-100 bg-orange-50"}`}>
                      {hasPhotos ? (
                        <>
                          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-[11px] font-black uppercase tracking-widest text-[#1a1a1a]/40">
                              📷 Photos ({photoData.photo_urls.length})
                            </p>
                            <button onClick={() => handleChangePhotos(item, photoData)}
                              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#FF385C] hover:opacity-70 transition-all border border-[#FF385C]/20 px-3 py-1.5 rounded-full">
                              <RefreshCw size={10} /> Change Photos
                            </button>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {photoData.photo_urls.map((url, idx) => (
                              <div key={idx}
                                className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-[#FF385C]/20 bg-[#f5f5f5]">
                                <Image src={url} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] font-black text-center py-0.5">
                                  {idx + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        /* ── Upload Button ── */
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-[12px] font-black text-orange-600 uppercase tracking-widest">
                              ⚠️ Photos upload nahi ki
                            </p>
                            <p className="text-[11px] text-orange-500/70 font-medium mt-0.5">
                              Checkout se pehle photos upload karo
                            </p>
                          </div>
                          <button onClick={() => handleUploadPhotos(item)}
                            className="flex items-center gap-2 bg-[#FF385C] text-white text-[11px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl hover:-translate-y-0.5 transition-all shadow-md shadow-[#FF385C]/20">
                            <Upload size={12} /> Upload Photos
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT — Order Summary */}
            <div className="self-start space-y-4 lg:sticky lg:top-24">
              <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
                <h2 className="text-[13px] font-black uppercase tracking-widest text-[#1a1a1a] mb-5">
                  Order Summary
                </h2>

                <div className="space-y-3 pb-4 border-b border-black/5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#1a1a1a]/50 font-medium">Subtotal</span>
                    <span className="font-black text-[#1a1a1a]">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#1a1a1a]/50 font-medium">Delivery</span>
                    <span className={`font-black ${deliveryCharge === 0 ? "text-green-600" : "text-[#1a1a1a]"}`}>
                      {deliveryCharge === 0 ? "FREE 🎉" : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  {deliveryCharge > 0 && (
                    <p className="text-[11px] text-[#1a1a1a]/30 font-medium">
                      ₹{999 - subtotal} more for free delivery
                    </p>
                  )}
                </div>

                <div className="flex justify-between mt-4 mb-5">
                  <span className="text-[15px] font-black text-[#1a1a1a]">Total</span>
                  <span className="text-[18px] font-black text-[#1a1a1a]">₹{total}</span>
                </div>

                {deliveryCharge > 0 && (
                  <div className="mb-5">
                    <div className="h-2 bg-[#f5f5f5] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#FF385C] to-[#ff8c37] rounded-full transition-all"
                        style={{ width: `${Math.min((subtotal / 999) * 100, 100)}%` }} />
                    </div>
                  </div>
                )}

                {/* Checkout button — photos nahi hain to disable */}
                {allPhotosUploaded ? (
                  <Link href="/checkout"
                    className="w-full flex items-center justify-center bg-[#1a1a1a] hover:bg-[#FF385C] text-white font-black uppercase tracking-widest text-sm py-4 rounded-2xl transition-all hover:-translate-y-0.5 shadow-lg">
                    Proceed to Checkout →
                  </Link>
                ) : (
                  <div>
                    <button disabled
                      className="w-full flex items-center justify-center bg-[#1a1a1a]/20 text-[#1a1a1a]/30 font-black uppercase tracking-widest text-sm py-4 rounded-2xl cursor-not-allowed">
                      Proceed to Checkout →
                    </button>
                    <p className="text-center text-[11px] font-black text-orange-500 uppercase tracking-widest mt-2">
                      ⚠️ Pehle sabki photos upload karo
                    </p>
                  </div>
                )}

                <button onClick={() => router.push("/")}
                  className="w-full mt-3 text-[11px] font-black uppercase tracking-widest text-[#1a1a1a]/30 hover:text-[#FF385C] transition-colors py-2">
                  ← Continue Shopping
                </button>
              </div>

              <div className="bg-[#FFF5F7] border border-[#FF385C]/15 rounded-2xl p-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#FF385C] mb-2">
                  📸 Photo Notice
                </p>
                <p className="text-[12px] text-[#1a1a1a]/50 font-medium leading-relaxed">
                  Photos order confirm hone ke baad save hongi aur 21 days tak available rahengi.
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
