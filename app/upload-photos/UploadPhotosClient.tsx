"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { createClient } from "@/utils/supabase/client";

type UploadPhotosClientProps = {
  productId: string;
  productTitle: string;
  price: number;
  priceLabel: string;
  setSize: number;
  imageSrc: string;
  variantLabel: string;
  productSlug: string;
  replacingId: string;
};

function getSessionId() {
  if (typeof window === "undefined") return "";

  let sid = localStorage.getItem("magnetify-session-id");
  if (!sid) {
    sid = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    localStorage.setItem("magnetify-session-id", sid);
  }

  return sid;
}

export function UploadPhotosClient({
  productId,
  productTitle,
  price,
  priceLabel,
  setSize,
  imageSrc,
  variantLabel,
  productSlug,
  replacingId,
}: UploadPhotosClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const supabase = createClient();

  const [photos, setPhotos] = useState<(File | null)[]>(Array(setSize).fill(null));
  const [previews, setPreviews] = useState<(string | null)[]>(Array(setSize).fill(null));
  const [uploading, setUploading] = useState(false);
  const [added, setAdded] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleFileChange = (idx: number, file: File | null) => {
    if (!file) return;

    const newPhotos = [...photos];
    const newPreviews = [...previews];
    newPhotos[idx] = file;
    newPreviews[idx] = URL.createObjectURL(file);
    setPhotos(newPhotos);
    setPreviews(newPreviews);
  };

  const removePhoto = (idx: number) => {
    const newPhotos = [...photos];
    const newPreviews = [...previews];
    newPhotos[idx] = null;
    newPreviews[idx] = null;
    setPhotos(newPhotos);
    setPreviews(newPreviews);
  };

  const allUploaded = photos.every((photo) => photo !== null);
  const uploadedCount = photos.filter((photo) => photo !== null).length;

  const handleConfirm = async () => {
    if (!allUploaded) return;

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];
      const cartItemId =
        replacingId || `item-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      for (let i = 0; i < photos.length; i += 1) {
        const file = photos[i];
        if (!file) continue;

        const fileName = `orders/${cartItemId}-photo-${i + 1}-${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("category-images")
          .upload(fileName, file);

        if (uploadError) {
          alert(`Photo ${i + 1} upload failed: ${uploadError.message}`);
          setUploading(false);
          return;
        }

        const { data } = supabase.storage
          .from("category-images")
          .getPublicUrl(fileName);

        uploadedUrls.push(data.publicUrl);
      }

      const sessionId = getSessionId();
      const existingPhotos = JSON.parse(
        localStorage.getItem("magnetify-cart-photos") || "{}",
      );

      existingPhotos[cartItemId] = {
        cart_item_id: cartItemId,
        product_id: productId,
        product_title: productTitle,
        variant_label: variantLabel,
        price,
        photo_urls: uploadedUrls,
        session_id: sessionId,
        saved_at: new Date().toISOString(),
      };

      localStorage.setItem(
        "magnetify-cart-photos",
        JSON.stringify(existingPhotos),
      );

      if (!replacingId) {
        addItem({
          id: cartItemId,
          title: productTitle,
          variantLabel,
          price,
          priceLabel,
          imageSrc: previews[0] || imageSrc,
          imageAlt: productTitle,
          href: `/products/${productSlug}`,
        });
      }

      setAdded(true);
      setTimeout(() => {
        router.push("/cart");
      }, 1200);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    }

    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-[#1a1a1a]/40 transition-colors hover:text-[#FF385C]"
          >
            Back
          </button>
          <h1 className="text-3xl font-black uppercase tracking-tight text-[#1a1a1a] sm:text-4xl">
            {replacingId ? "Change Your Photos" : "Upload Your Photos"}
          </h1>
          <p className="mt-2 text-[14px] font-medium text-[#1a1a1a]/50">
            {productTitle}
            {variantLabel ? ` • ${variantLabel}` : ""}
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-black/5 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[12px] font-black uppercase tracking-widest text-[#1a1a1a]/40">
              Photos Selected
            </p>
            <p className="text-[13px] font-black text-[#FF385C]">
              {uploadedCount} / {setSize}
            </p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#f5f5f5]">
            <div
              className="h-full rounded-full bg-[#FF385C] transition-all duration-300"
              style={{ width: `${(uploadedCount / setSize) * 100}%` }}
            />
          </div>
          {allUploaded ? (
            <p className="mt-2 text-[11px] font-black uppercase tracking-widest text-green-600">
              All photos ready
            </p>
          ) : null}
        </div>

        <div
          className={`mb-6 grid gap-4 ${
            setSize === 1 ? "grid-cols-1" : setSize <= 4 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"
          }`}
        >
          {Array.from({ length: setSize }).map((_, idx) => (
            <div key={idx}>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]/30">
                Photo {idx + 1}
              </p>

              {previews[idx] ? (
                <div className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-[#FF385C]/30 bg-white shadow-sm">
                  <Image
                    src={previews[idx]!}
                    alt={`Photo ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 639px) 50vw, 33vw"
                  />
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-[12px] font-black text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                  >
                    x
                  </button>
                  <button
                    onClick={() => inputRefs.current[idx]?.click()}
                    className="absolute bottom-2 left-2 right-2 rounded-xl bg-black/60 py-1.5 text-[10px] font-black uppercase tracking-widest text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => inputRefs.current[idx]?.click()}
                  className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#1a1a1a]/15 bg-white shadow-sm transition-all duration-200 hover:border-[#FF385C]/40 hover:bg-[#FFF5F7]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF385C]/10 text-2xl">
                    +
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#1a1a1a]/30">
                    Tap to upload
                  </p>
                  <p className="text-[10px] font-medium text-[#1a1a1a]/20">
                    JPG, PNG up to 10MB
                  </p>
                </button>
              )}

              <input
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(idx, e.target.files?.[0] || null)}
              />
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-2xl border border-[#FF385C]/15 bg-[#FFF5F7] p-4 sm:p-5">
          <p className="mb-3 text-[11px] font-black uppercase tracking-widest text-[#FF385C]">
            Photo Tips
          </p>
          <ul className="space-y-1.5">
            {[
              "High-resolution photos print better",
              "Faces should be clearly visible",
              "Avoid blurry or very dark photos",
              "Portrait orientation usually works best",
            ].map((tip) => (
              <li
                key={tip}
                className="flex items-center gap-2 text-[12px] font-medium text-[#1a1a1a]/50"
              >
                <span className="text-[#FF385C]">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleConfirm}
          disabled={!allUploaded || uploading || added}
          className={`w-full rounded-2xl py-4 text-base font-black uppercase tracking-widest shadow-lg transition-all duration-300 ${
            added
              ? "bg-green-500 text-white"
              : allUploaded
                ? "bg-[#FF385C] text-white shadow-[#FF385C]/30 hover:-translate-y-0.5 hover:bg-[#e0184f]"
                : "cursor-not-allowed bg-[#1a1a1a]/10 text-[#1a1a1a]/30"
          }`}
        >
          {added
            ? "Done - going to cart..."
            : uploading
              ? "Uploading photos..."
              : allUploaded
                ? replacingId
                  ? "Save new photos"
                  : "Confirm and add to cart"
                : `Upload ${setSize - uploadedCount} more photo${
                    setSize - uploadedCount > 1 ? "s" : ""
                  } to continue`}
        </button>
      </div>
    </div>
  );
}
